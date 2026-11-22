---
title: uReplaceMaterial
description: USDシーンの選んだPrimへ色・画像・別ノードの材質を適用するノード。入力の違い、Prim Selection、動画テクスチャとトラブル診断を説明する。
doc_type: node
term_id: ureplacematerial
term_short: uReplaceMaterialは、USDシーンの指定したオブジェクトへ別の材質を割り当てるノード。
verification: partial
aliases: [uReplaceMaterial, uReplace Material, uRM]
concepts: [usd-scene, material, scene-tree]
nodes: [uReplaceMaterial]
node_family: usd
controls: [Prim Selection, Invert Prim Selection, Type, Diffuse, Emissive, Workflow Mode, Metallic, Specular Color, Roughness, Clearcoat, Clearcoat Roughness, Opacity, Opacity Threshold, Matte]
inputs: [usd, usd-material, image]
outputs: [usd]
tasks: [usd, replace-material, lookdev]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-18"
---

# uReplaceMaterial

uReplaceMaterialは、**USDシーン内の一部または全部のオブジェクトへ、別の材質を割り当てるノード**です。たとえば読み込んだ車のボディだけ色を変更し、タイヤやガラスはそのまま残せます。元のUSDファイルを外部ソフトで編集し直さず、Fusion内で見た目を試すときに使います。

ここでいう材質（Material）は、表面の色・粗さ・金属らしさ・透明度など、**どう描画するかを決める設定**です。形やカメラを含む<Term id="usd-scene">USD scene</Term>そのものとは異なります。uReplaceMaterialはシーンを加工して再びUSDとして出力するため、最終的な2D画像を得るには[uRenderer](./u-renderer)が必要です。

<!-- capture:S346 -->

## 実機例：単一形状に材質を適用する

`uShape`のCapsuleを分岐し、一方はそのまま、もう一方は`uReplaceMaterial`で`uShader`の赤い材質を適用して描画しました。同じフレームの左Viewerは元の灰色、右Viewerは材質適用後の赤です。Selected Primsは空で、特定Primの選択、複数objectや2材質、UVと厳密な色は試していません。市松模様はViewerの透明表示です。左右は別々のuRendererです。[接続と設定の記録](/img/fusion/captures/S346/readback.json)に条件を記載しています。

[![単一のShapeを元の描画と材質適用へ分岐した構成](/img/fusion/captures/S346/graph.png)](/img/fusion/captures/S346/graph.png)

元の形状とuReplaceMaterialを通した形状を別々に描画します。

[![Selected Primsが空のuReplaceMaterial](/img/fusion/captures/S346/controls.png)](/img/fusion/captures/S346/controls.png)

この例ではSelected Primsを指定していません。

[![左に元の灰色、右に材質適用後の赤いCapsule](/img/fusion/captures/S346/comparison.png)](/img/fusion/captures/S346/comparison.png)

同じフレームで元と材質適用後を比較しています。

[再現用Graph](/img/fusion/captures/S346/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S346/capture.json)

<!-- /capture:S346 -->

## 入力・出力：シーン、材質、画像を区別する

| 入力 | 受け取るもの | 用途 |
| --- | --- | --- |
| **Scene Input** | USD scene | 変更対象のオブジェクトが入ったシーン。[uLoader](./uloader)などから接続する |
| **Material Input** | USD material | [uShader](./ushader)、[uMaterialX](./umaterialx)、別のUSDシーン内で選んだマテリアルなどを受け取る |
| **Image Input** | 2D Image | Fusion内で作った画像や動画を表面のDiffuse Textureとして使う |
| **出力** | USD scene | 材質を差し替えたシーンを後続のUSDノードへ渡す |

~~~text
uShader / uMaterialX ────────────┐ Material Input
                                ▼
uLoader ────────────────→ uReplaceMaterial → uMerge → uRenderer
        （USD scene）           ↑
                    （任意）Image Input ← 2D Image
~~~

**Scene Inputは変更対象、Material Inputは適用したい材質、Image Inputは表面に使う画像**です。これらを同じ種類の「画像入力」と考えないことが重要です。

**21.1 Manualの記述について：** Chapter 121 p.2915のInputs節は冒頭で「入力は2つ」と説明した直後に、Scene Input・Material Input・Image Inputの**3種類**を列挙しています。本文では列挙されている3つの役割を説明していますが、実際のUIでの入力端子数や表示条件はその記述だけでは確定しません。正確な端子構成は21.1の実機で確認してください。

## Prim Selection：どこに割り当てるか

USDシーンは、車体、タイヤ、窓などを**Prim（階層内のオブジェクトなどの単位）**として持ちます。uReplaceMaterialでは**Prim Selection → Pick**からScene Treeを開き、変更対象を選びます。

- **Prim Selection**：選んだPrimに対して材質の差し替えを適用します。
- **Invert Prim Selection**：選択結果を反転し、選んだPrimを除いた側へ適用します。

対象の選択と材質自体の調整は別です。指定したボディ以外も変わる場合、材質の色よりも先に**選択しているPrimとInvert Prim Selection**を確認します。読み込んだシーンの階層構造を把握すると、後から色を変更する作業も整理しやすくなります。

## Type：材質をどこから用意するか

Inspectorの**Type**で、材質の指定方法を選びます。21.1 Manualで確認できる主要な選択肢は以下です。

| Type | 何を使うか | 使いどころ |
| --- | --- | --- |
| **Color** | Inspectorで指定する単色 | パーツの色をまず確認したいとき |
| **Texture** | 画像ファイルを表面に使う | 静止画の模様を貼りたいとき |
| **MaterialX** | `.mtlx`ファイルをこのノードで直接指定するか、Material Inputに接続した材質から選択 | 外部ファイルを直接指定する場合、またはuMaterialX・uShaderなどから材質を受け取る場合 |

Material InputへuShaderを接続した場合、**その材質を受け取る線**と、**実際に使う材質を選ぶInspector操作**を分けて確認します。接続しただけでどのTypeや対象マテリアルが自動選択されるかまでは、Manualの記述から断定しません。

**Type = MaterialXを選ぶと、Inspectorのほかの材質設定は隠れます。** これは21.1 Manual p.2916に明記された表示動作です。接続したuShaderのRoughnessや色を調整したい場合は、uReplaceMaterialに数値欄を探すのではなく、材質の作成元で変更し、uRendererの結果を確認します。

### 外部MaterialX材質を読み込む2つの経路

21.1 Reference Manual（p.2916）によると、**Type = MaterialX**では、**uReplaceMaterial自身からMaterialXファイルを指定する方法**と、**Material Inputに接続した材質から選ぶ方法**が用意されています。外部の`.mtlx`ファイルを使うために、必ずuMaterialXを追加する必要はありません。

```text
直接読み込む:
uLoader（USD scene） → uReplaceMaterial（Type = MaterialX、.mtlxを選択） → uRenderer

別ノードから渡す:
uMaterialX（.mtlx） ──────────┐ Material Input
                             ▼
uLoader（USD scene） ──→ uReplaceMaterial → uRenderer
                         Scene Input
```

一つのオブジェクトへ外部材質を割り当てるだけなら、**uReplaceMaterialから直接ファイルを選ぶ**とノードを減らせます。ファイルの読み込みを独立したノードとして管理したい場合は、[uMaterialX](./umaterialx)からMaterial Inputへ渡します。Fusion内で色・粗さ・テクスチャを組み立てる場合は、[uShader](./ushader)が別の選択肢です。

どの経路でも、**材質の指定**と**Prim Selectionで適用対象を選ぶこと**は別の操作です。外部ファイルの互換性、接続時の自動選択やInspectorの細かな表示条件は、21.1実機で確認してください。

## Image Input：動画や合成画像を直接貼る

File Nameで画像ファイルを指定する方法は、Manualでは**単一フレームのテクスチャ**として説明されています。一方、Image InputへMediaInやFusionの合成結果などの2D Imageをつなげば、**時間とともに変わる表面画像**を使えます。

Image Inputを接続すると、Inspectorの**File Name**が隠れ、それまでファイルから読み込んでいた画像より**接続した画像が優先**されます。うまく切り替わらない場合は、現在どちらの経路からテクスチャを供給しているかを確認します。

Image Inputから流れる画像は、単なる「シーン全体を覆う2D画像」ではなく、**選択したUSDオブジェクトのDiffuse Texture**として扱われます。画面内でどのように見えるかは、モデルの形とテクスチャ座標にも依存します。

## Inspectorの材質設定

Typeなどの選択によって表示項目が変わります。21.1 ManualのControls節には次の項目が記載されています。

| 設定 | 役割 |
| --- | --- |
| **Diffuse / Color** | 表面の基本色を指定する |
| **Emissive** | 表面が発光しているような見た目に寄与する |
| **Workflow Mode** | **Metallic**と**Specular**の調整方式を切り替える |
| **Roughness** | 表面の反射の広がりを調整する |
| **Clearcoat** | 上に重なる光沢層を調整する |
| **Clearcoat Roughness** | 追加した光沢層の粗さを調整する |
| **Opacity** | 不透明度とAlphaに影響する |
| **Opacity Threshold** | 不透明度が現れ始める境界を調整する |
| **Matte（Is Matte）** | 背景を隠したり、Alphaの抜きを作ったりする用途で使う |

**Roughness**は反射の見え方、**Opacity**は透明度です。また、**Matte**は半透明なガラスを作るOpacityと目的が異なり、背後を隠す・Alphaを抜くために利用します。最終的なAlphaの出力はuRendererで確認してください。

## 画像を使う3つの経路：Diffuse・材質プロパティ・投影

画像を読み込む方法が複数あっても、**画像がどの情報を変えるか**は同じではありません。画面に動画を表示する、表面の反射を明暗で制御する、カメラ方向から建物の写真を投影する場合では、適切な接続先が変わります。

| 目的 | 入力と接続 | 結果・使い分け |
| --- | --- | --- |
| 選んだ部品へ動画・合成画像を貼る | `MediaIn → uReplaceMaterial（Image Input）`、別途 `uLoader → Scene Input` | 選択したPrimの**Diffuse Texture（表面の色）**に2D画像を使う。粗さや法線を個別に制御する経路ではない |
| 色以外の材質プロパティも画像で制御する | `MediaIn → uTexture → uShader → uReplaceMaterial（Material Input）` | uShaderへ接続するときに用途に合う可変入力を選ぶ。たとえば明暗画像をRoughnessへ割り当て、部分ごとに反射の広がりを変える |
| 既存の立体へ一定方向から画像を投影する | `MediaIn → uProjector（ProjectiveImage / Textureモード）` と `uLoader → uCatcher → uMerge` | 投影方向から届いた画像を対象形状が受け取る。画像のAlphaで透過部分を作る場合にも使う |

**動画を再生するモニター**なら、表示面が独立したPrimであることを確かめ、Image Inputで動画フレームを渡す構成から始められます。ただし表面のどこに表示されるかはモデルのUVにも依存します。**塗装の粗さを画像で変える**なら、uTextureからuShaderのRoughness用入力へ渡す経路を検討します。uReplaceMaterialのImage Inputに同じ白黒画像をつなぐだけでは、粗さの制御になりません。

**壁と床へ一枚の写真を投影する**なら、[uProjector](./uprojector)のTextureモードと[uCatcher](./ucatcher)を使います。uCatcherは**USD形状を受け取り、投影を反映したUSDシーンを出す**ノードです。uShaderへ任意のテクスチャ出力を直接渡せると仮定してつなぐのではなく、それぞれのデータの種類を確認してください。投影しない固定の表面画像なら、[uTexture](./utexture)やuReplaceMaterialのImage Inputのほうが構成を単純にできます。

## 制作例1：車体だけ単色へ変更する

1. [uLoader](./uloader)で車のUSDを読み、uReplaceMaterialの**Scene Input**へ接続します。
2. **Prim Selection → Pick**でボディのPrimを選び、**Invert Prim Selection**が無効か確認します。
3. **TypeをColor**にし、Diffuseの色を変更します。
4. uReplaceMaterialを[uRenderer](./u-renderer)へつながるUSDシーン経路に入れ、車体だけが変わるか確認します。

これでまず「どこを変えるか」を確かめ、その後に反射や別のマテリアルへ進めると問題を分離しやすくなります。

## 制作例2：外部マテリアルを適用する

1. uLoaderをScene Inputへ接続します。
2. [uMaterialX](./umaterialx)で`.mtlx`を読み込むか、[uShader](./ushader)で材質を作ります。単に外部`.mtlx`を指定するだけなら、uReplaceMaterialの**Type = MaterialX**から直接ファイルを選ぶ経路もあります。
3. 別ノードから材質を渡す場合は、その出力を**Material Input**へ接続し、Inspectorで使う材質を選びます。
4. Prim Selectionで適用対象を絞ってからuRendererで確認します。

uMaterialXが読み込めても、外部で作ったすべてのMaterialX表現が完全に対応するとは限りません。複雑な素材は実際にレンダリングして確認する必要があります。

## 制作例3：モデルの画面に動画を表示する

1. MediaInなどの動画を**Image Input**へ接続します。
2. Prim Selectionで画面のPrimを選びます。
3. Inspectorのテクスチャ指定とImage Inputの優先関係を確認します。
4. uRendererの表示を複数フレームで比較し、画面だけが更新されるか確認します。

動画が止まって見える場合は、入力元の画像が時間で変わるか、File Nameから静止画像を参照していないかを区別して調べます。

## トラブル診断

| 症状 | まず確認すること |
| --- | --- |
| 材質が変わらない | Scene InputのUSD、Prim Selection、Type、Material Inputの接続を順に確認する |
| 変更対象が広すぎる | Prim SelectionとInvert Prim Selectionの組み合わせを確認する |
| uShaderの設定を変えても変化しない | uShaderがMaterial Inputに接続され、選択した材質が使われているか確認する |
| 画像が表示されない | Texture指定なのかImage Inputなのかを区別し、対象Primのテクスチャ座標を確認する |
| ファイルで指定した絵が出ない | Image Inputが接続されていればFile Nameより優先される |
| 動画が更新されない | Image Inputの画像がフレームごとに変わるか確認する |
| 透明度や抜きが想定と違う | Opacity、Opacity Threshold、Matteの役割を分けて確認する |
| 出力が通常のMergeにつながらない | USD scene出力なのでuRendererで2D Imageへ変換する |
| MaterialXが正しく描画されない | 読み込んだ素材の互換性と選択先、uRendererの結果を確認する |

## 関連ノード・出典

- [uShader](./ushader)：色・反射・テクスチャを組み立てて材質を出す
- [uMaterialX](./umaterialx)：外部`.mtlx`を読み込んで材質を出す
- [uTexture](./utexture)：画像からUSD用テクスチャを作る
- [uShape](./ushape)：基本的な立体と簡易材質を作る
- [uRenderer](./u-renderer)：USD sceneを2D画像へ描画する

基準資料：**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 121「USD Nodes」、pp.2915–2917**。入力・Prim Selection・Type・各材質ControlとImage Inputの優先順位を参照しました。制作例はManualの仕様を組み合わせた手順であり、**21.1実機でのUI端子数、Edition差、各Controlの既定値・範囲、複雑なUSD/MaterialXの互換性は未確認**です。`verification: partial`を維持します。
