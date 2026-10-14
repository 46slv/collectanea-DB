---
title: uRenderer
description: USDシーンを2D画像に描画するuRendererの接続、カメラ選択、AOV・Z深度、照明、画像サイズと色空間の設定を解説。
doc_type: node
term_id: u-renderer
term_short: uRendererは、USDの3Dシーンを指定したカメラから撮影し、通常の2D画像や深度などの追加出力に変換するノード。
verification: partial
aliases: [uRenderer, USD Renderer, uRn]
concepts: [usd-scene, rendering, aov, image-data]
nodes: [uRenderer]
node_family: usd
controls: [Camera, Renderer Type, Output AOVs As Layers, AOV, Lighting, Enable Sky Dome, Complexity, Aux Channel Z, Film Back Fit, Max Iterations, Process Mode, Width, Height, Pixel Aspect, Auto Resolution, Depth, Domain Overscan, Overscan, Render Color Space, Source Color Space, Source Gamma Space]
inputs: [usd, mask]
outputs: [image]
tasks: [usd, render-3d, convert-domain, aov]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# uRenderer

**uRendererは、3DのUSDシーンをカメラから見た2D画像へ変換するノード**です。立方体、カメラ、ライトなどをUSDのまま組み立てても、そのデータを通常の画像処理ノードやMediaOutへ直接渡すことはできません。uRendererで描画すると、色の付いた画像として後段の合成に使えるようになります。

USDシーンには形状や照明、カメラといった3Dの情報が入っています。uRendererはその情報を読み取り、出力画像の各画素に何が映るかを計算します。単なるファイル形式の変換ではありません。[USDシーンの基礎](../../learn/02-data/usd)も参照してください。

## 入力・出力と最小構成

| 接続 | データ | 役割 |
| --- | --- | --- |
| **SceneInput（オレンジ）** | USD scene | **必須**。uMergeなどから被写体、カメラ、ライトを含むシーンを受け取ります。 |
| **EffectMask（青）** | 2D Image（マスク） | 任意。uRendererの出力へ適用するマスクです。USDの形状入力ではありません。 |
| **出力** | 2D Image | 描画した画像をMergeなどの2D処理へ渡します。深度やIDなどの追加情報も設定によって出力します。 |

例えば、立方体を一つ表示する構成は次のようになります。

~~~text
uShape（立方体） ──┐
                   ├→ uMerge → uRenderer → MediaOut
uCamera ───────────┘
~~~

1. [uShape](./ushape)で立方体を作ります。
2. [uCamera](./ucamera)を追加して立方体が視野に入る位置へ配置します。
3. 2つのUSD出力を[uMerge](./u-merge)へ接続し、uMergeの出力をuRendererの**SceneInput**へ接続します。
4. uRendererの**Camera**を確認し、**Lighting**を必要な方式へ設定します。
5. uRendererをViewerに表示します。ここで初めて通常の2D画像として確認できます。

USDのノードを通常の2D Mergeへ直接つないで「映らない」ときは、**uMergeとuRendererを取り違えていないか**確認します。uMergeは3Dシーンをまとめ、uRendererはそのシーンを2D画像へ描画します。[uLoader](./uloader)で読み込んだUSDアセットも同じです。

## Camera：どの視点で描くか

**Camera**メニューで、シーン内のどのカメラを使って描画するか選びます。

- **Default**：シーン内で最初に見つかったカメラを使用します。
- **カメラが存在しない場合**：既定のPerspective視点から描画します。
- **複数のカメラがある場合**：意図しない視点を避けるため、使用するカメラを明示的に選びます。

Fusionの3D Viewerで見ている方向と、uRendererが描画する方向は必ずしも同じではありません。Viewerを自由視点で回転させただけでは、最終的なレンダー用カメラを変更したことにはなりません。

また、**Film Back Fit**はカメラのFilm Back（実写カメラのセンサー面に相当する撮影領域）と、出力画像の縦横比が異なるときの収め方を決めます。たとえばFilm Backが4:3で出力が16:9の場合、どの範囲を画像へ収めるかを確認する必要があります。21.1 ManualはFilm Back Fitの目的を説明していますが、選択肢ごとの厳密なクロップ量まではこの節で確定できないため、数値例を作って断定しません。

**カメラの画角**は[uCamera](./ucamera)のFocal LengthとFilm Backで決まり、**出力画像の大きさ**は後述のImageタブで設定します。画角と解像度を混同しないことが重要です。

## AOV：色とは別の情報を取り出す

**AOV（Arbitrary Output Variable）**は、通常の完成画像以外にレンダーから取り出す情報です。たとえば「どの物体が画素に映っているか」や「カメラからどれだけ離れているか」を、色画像とは別に後段で利用できます。

| AOV | 出力される情報 | 利用例 |
| --- | --- | --- |
| **Color** | テクスチャとライティングを含む通常のカラー画像。 | 最終映像、通常の合成。 |
| **Depth** | **フレームごとに正規化される**白黒の距離マップ。 | 前後関係を見ながら奥行きに応じた処理を試す。 |
| **PrimID** | USDの各Prim（シーン内の個々の要素）を識別する数値。 | 物体別の識別・選択を検討する。 |
| **Camera Depth** | カメラからの距離を表す**32-bit float**の深度画像。 | 実際の距離を基準にした深度処理を検討する。 |

**DepthとCamera Depthは同じものではありません。** Depthは各フレームの奥行きの範囲に合わせて黒から白へ正規化されます。被写体の位置が変わるショットでは、同じ白黒値が常に同じ実距離を意味するとは限りません。一定の距離を基準に処理したい場合は、Camera Depthの意味を確認します。

**Camera Depthが真っ黒に見えても、直ちに情報が失われたとは限りません。** 距離が32-bit floatの数値で保存されており、通常の0〜1を想定した画像表示では値の違いを読み取りにくいことがあります。数値データと表示用の白黒画像を区別します。

**Output AOVs As Layers**を有効にすると、利用可能な既存AOVをそれぞれ別レイヤーとして出力します。これは色の画像に追加の情報を重ねて一枚に焼き込む操作ではありません。後段で扱う際は、どのレイヤー／チャンネルを参照しているか確認してください。

### Aux Channel Zとの違い

**Aux Channel Z**はCamera Depthを画像の補助Zチャンネルへ出力する設定です。AOVとして深度画像を見る方法と、画像に付属するZデータを後段で利用する方法は用途が異なります。

また、Imageタブの**Depth**は**出力画像のビット深度**の設定です。AOVの**Depth**（正規化された距離マップ）とは別の項目です。両者を「Depth」とだけ書くと操作を取り違えるため、区別して扱います。

## 制作例：奥行きを合成に渡す

~~~text
uLoader / uShape ──┐
uCamera ───────────┼→ uMerge → uRenderer ──→ 2Dの合成処理
USDライト ────────┘                   └─ AOV / Zの確認
~~~

1. 形状とカメラを同じUSDシーンにまとめ、まず**AOV: Color**で映像が正常に出ることを確認します。
2. **AOV: Depth**で白黒の前後関係を確認します。被写体やカメラを動かしたフレームでも同じ距離を意味するとは限らないことに注意します。
3. 次に**Camera Depth**を確認します。黒く見える場合は、欠落と判断する前に32-bit floatの距離情報である点を確認します。
4. Zチャンネルを使う処理へ渡したい場合は**Aux Channel Z**を有効にし、後段がその補助チャンネルを参照しているかを確認します。
5. 必要なら**Output AOVs As Layers**でレイヤー出力を試し、通常のColorと追加情報を分けて扱います。

どの後段ノードがどの種類の深度を受け取るかは、そのノード側の入力仕様にも依存します。**Zを出しただけで全ての2Dエフェクトが自動的に深度を利用するわけではありません。**

## Lighting・描画品質

**Renderer Type**は21.1 Manualでは**Stormのみ**が記載されています。ほかのレンダーエンジンを選べるとは扱いません。

**Lighting**は、何の光を使って描くかを指定します。

| 設定 | 何が起きるか |
| --- | --- |
| **None** | ライティングを無効にします。 |
| **Camera** | 既定のカメラライトで対象を照らします。 |
| **Scene** | USDシーン内に配置したライトを使います。 |
| **Enable Sky Dome** | Sky Domeのテクスチャ表示・描画を有効にします。 |

ライトをuMergeで追加しても、uRenderer側が**Scene**でないと意図したシーン照明を確認できない場合があります。まずCameraで被写体の形を確認し、Sceneに変更して配置したライトの影響を比較すると、形状と照明の問題を切り分けやすくなります。

**Complexity**には**Low / Medium / High**があり、描画するディテールを調整します。**Max Iterations**はレンダーアルゴリズムの反復回数を指定します。これらを上げれば常に画質が向上する、あるいは特定の秒数だけ遅くなる、といった性能上の断定はManualのこの節だけではできません。まず被写体が正しく見える状態を作り、必要に応じて変更します。

## Imageタブ：出力フレームと余白

| 設定 | 意味 |
| --- | --- |
| **Process Mode** | Full Frames、または指定したインターレース処理方式を選びます。 |
| **Auto Resolution** | Timelineの解像度を使います。手動のWidth / Heightを使いたいときは無効にします。 |
| **Width / Height** | 出力画像のピクセル寸法。 |
| **Pixel Aspect XY** | 非正方形ピクセルを使う映像形式のピクセル縦横比。 |
| **Depth** | 出力画像のビット深度。AOVの深度マップとは別。 |
| **Domain Overscan** | **データウィンドウ**の外側まで追加画素を描画します。 |
| **Overscan** | **表示ウィンドウ**の外側まで追加画素を描画します。 |

**Overscan**系の2項目は、画面外にも画素を用意するためのものです。撮影後に画面をずらすスタビライズや、レンズ歪みの補正を行うと、画像の端に未描画部分が現れることがあります。余分な範囲を描いておくと、その欠けを避けられる場合があります。

ただし**Domain OverscanとOverscanは基準となるウィンドウが異なります**。同じ余白量になるとは限らないため、後段の処理後に端が欠けないか、最終画像で確認します。

### 色空間の設定

- **Render Color Space**：描画出力の色空間を**Linear / sRGB**から指定します。
- **Source Color Space**：Manualでは、ソースの色空間をメタデータで示す機能として説明されます。**この項目自体はGamutのような明示的な色空間変換ではありません。**
- **Source Gamma Space**：Auto / Space / Log / Remove Curveなどでガンマ情報・曲線の扱いを設定します。**Remove Curve**は該当する曲線を取り除いてLinearへ変換する動作として説明されています。

**Render Color SpaceとSource Color Spaceを同じ操作として扱わない**でください。見た目が変わらないメタデータ指定と、画素値の変化を伴う処理を分けて考えます。Source Color Space / Gammaの説明には画像ノード共通の文言が含まれるため、USDシーンの各テクスチャへ一括変換が起こるなどとは推測しません。

## うまく表示されないとき

| 症状 | まず確認すること |
| --- | --- |
| uRendererが真っ黒、または何も映らない | SceneInputにUSDシーンが接続されているか、カメラに被写体が映るか、Lightingが目的に合うかを切り分けます。 |
| Viewerでは被写体が見えるのに完成画像に映らない | 自由視点と**Camera**メニューのレンダー用視点を混同していないか確認します。 |
| ライトを置いたのに明るさが変わらない | **Lighting: Scene**か、ライトと被写体が同じUSDシーンにあるか確認します。 |
| 画像が横長／縦長に見える、端が切れる | **Film Back Fit**、uCameraのFilm Back、Width / Height、Pixel Aspect XYを別々に確認します。 |
| 深度画像がフレームごとに違う明るさになる | **Depth**はフレーム単位で正規化されます。距離情報が必要なら**Camera Depth**を検討します。 |
| Camera Depthが黒く見える | 32-bit floatの距離データを通常の白黒表示で判断していないか確認します。 |
| AOVを切り替えても後段へ伝わらない | 利用しているAOV・レイヤー・補助チャンネルのどれを後段が参照するか確認します。 |
| Zを使った処理に深度が届かない | **Aux Channel Z**が有効か、後段ノードがZ補助チャンネルを読む構成か確認します。 |
| 解像度を手入力しても変わらない | **Auto Resolution**が有効ならTimeline解像度が使われます。 |
| スタビライズやレンズ補正後に端が欠ける | **Domain Overscan / Overscan**と、実際に使う表示範囲を確認します。 |
| 色や明るさが期待と合わない | **Render Color Space**、Source Color Spaceのメタデータ指定、Source Gamma Spaceを混同していないか確認します。 |

## 関連ノード・使い分け

- [uMerge](./u-merge)：被写体、カメラ、ライトなどのUSD要素を一つのシーンへまとめる。
- [uCamera](./ucamera)：描画する視点、画角、Film Back、クリッピングを設定する。
- [uShape](./ushape) / [uLoader](./uloader)：シーンの形状を作る、またはUSDファイルから読み込む。
- **Renderer 3D（Classic 3D）**：Classic 3Dのシーンを2Dへ描画する別ノード。**USDのuRendererと接続するデータ形式が異なる**ため、名前の近さだけで置き換えません。

## バージョン・出典と確認範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 121「USD Nodes」、**uRenderer [uRn] pp.2911–2914**。SceneInput / EffectMask、Camera、Renderer Type、AOV、Lighting、Complexity、Film Back Fit、Aux Channel Z、Imageタブ、Overscan、Render / Source Color Spaceを確認しました。公式資料の入手先：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

接続図、運用例、診断表はこれらの仕様を使った説明です。**Resolve 21.1実機での描画結果、Inspectorの全選択肢と既定値、AOVを利用する個々の後段ノード、Edition差、性能・GPU依存の挙動は確認していません。** `verification: partial`を維持します。
