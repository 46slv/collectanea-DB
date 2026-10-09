---
title: "Z To Disparity"
description: "Z深度とステレオカメラ情報から左右眼の視差チャンネルを生成するNode。"
doc_type: node
term_id: "z-to-disparity"
term_short: "Z To Disparityは、画像のZ深度をステレオ視差に変換し、左右眼の画像へ視差チャンネルを追加するNode。"
verification: partial
aliases: ["Z To Disparity", "Z2D"]
concepts: ["image-data"]
nodes: ["Z To Disparity"]
node_family: "stereo"
controls: ["Output Disparity To RGB", "Refine Disparity", "Strength", "Radius", "Stack Mode", "Swap Eyes", "Camera Mode", "Camera", "Convergence Point", "Background Disparity"]
inputs: ["image", "classic-3d"]
outputs: ["image"]
tasks: ["process-stereo"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Z To Disparity

Z To Disparity [Z2D]は、画像の**Z深度（カメラから見た前後方向の位置）を、左眼と右眼での像のずれ＝視差へ変換する**Nodeです。入力画像の色を立体的に描き直すのではなく、画像が持つ**Disparity（視差）補助チャンネル**へ計算結果を追加します。

たとえば3DCGで人物と背景をレンダリングし、各画素のZ深度とレンダリングに使ったステレオカメラの情報を保存していれば、左右眼の対応点を画像から推定し直さずに視差を作れます。Blackmagic Designの21.1 Manualは、CGレンダーのZから作る視差は、左右のカラー画像を比較する[Disparity](./disparity.md)による視差より正確にできると説明しています。これは**入力Zとカメラ情報が正しい場合**の利点であり、実写画像から自動で正確な距離を復元する機能ではありません。

**DaVinci Resolve Studio／Fusion Studio限定**です。

## 視差とZ深度の違い

- **Z深度**：画面の各画素がカメラの前後方向でどこにあるかを記録した値です。RGBAの色とは別の補助チャンネルに入ります。
- **視差（Disparity）**：同じ物体が左眼・右眼の画像でどれだけ違う位置に写るかを表す値です。水平・垂直のずれを持ちます。
- **ステレオカメラ情報**：左右のカメラの位置関係や投影条件です。奥行きが同じでもカメラ間隔などが異なれば、見える視差も異なります。

つまり**Z値だけでは視差の大きさは一意に定まりません**。Z To Disparityは、実際のカメラ情報を使う **External** と、見た目に合わせて対応関係を指定する **Artistic** を使い分けます。

これは[Disparity To Z](./disparity-to-z.md)と変換方向が逆です。Disparity To Zはすでに計算された視差からZを求め、Z To Disparityはすでに存在するZから視差を求めます。両方とも画像の補助チャンネルを扱い、3Dモデルを出力するNodeではありません。

## 入力

| 端子 | 受け取るもの | 用途 |
| --- | --- | --- |
| **Left Input**（オレンジ） | 2D Image | Z深度チャンネルを持つ左眼画像、または左右をまとめた画像を入力します。 |
| **Right Input**（緑） | 2D Image | 別々の右眼画像を入力します。**Stack Mode: Separate**の場合だけ表示されます。 |
| **Stereo Camera**（マゼンタ） | ステレオ用Camera 3D | Externalモードでカメラの投影条件を参照します。眼間距離を設定したCamera 3D、またはトラッキングした左右カメラを使用できます。 |

カラー画像だけを入力してもZ深度を自動推定するわけではありません。CGからの出力などで**Zチャンネルがすでに存在する画像**を用意してください。Fusionの画像はRGBAと補助チャンネルを同じ画像データ内に保持できます。詳しくは[画像（Image）](../../learn/02-data/image.md)と[補助チャンネル／AOV](../../learn/02-data/auxiliary-channels.md)を参照してください。

Camera Modeが**External**のときはStereo Camera入力に対応するカメラを接続します。**Artistic**では実カメラを使わずに視差の対応関係を決められます。接続するカメラが撮影・レンダリング時の投影条件と違えば、Externalでも生成する視差は素材と一致しません。

## 出力

| 端子 | 出力内容 |
| --- | --- |
| **Left Output** | 左眼画像、または左右をまとめた画像に、生成したDisparityチャンネルを付加した2D Imageです。 |
| **Right Output** | 右眼画像にDisparityチャンネルを付加した2D Imageです。**Separateの場合だけ**表示されます。 |

元のRGBAを視差画像へ置き換えるのが標準動作ではありません。後段のNodeに渡すのは、カラー画像と視差補助チャンネルを持つImageです。視差を通常のRGB画像として確認したい場合は、後述の**Output Disparity To RGB**を使います。

Manualによれば、左右をまとめて扱うStack Modeでは左右出力が同じ画像になります。ただしRight OutputはSeparate時のみ表示されるとも書かれているため、実際に使う出力端子は選択したモードで表示されるものを基準にしてください。

## Controlsタブ

### Output Disparity To RGB：視差を画面に表示する

通常は補助チャンネルに入る視差値を、RGBにも**{x, y, 0, 1}**として書き出します。**Rが水平視差、Gが垂直視差、Bが0、Aが1**です。この設定を有効にするとRGBAは**32-bit float**に昇格します。

これは視差の状態を確認したり、後段でRGBとして処理したりするための方法です。通常のカラー映像に視差が重ね描きされるわけではなく、**元の色をそのまま鑑賞するための出力ではなくなります**。視差値は負値や1を超える値を取り得るので、表示上の黒・白だけで正否を判断せず値を確認してください。

### Refine Disparity：画像の輪郭に合わせる

**Refine Disparity**は、RGB画像にある色や輪郭を手掛かりに、生成した視差マップを調整する機能です。

| 設定 | 動作 |
| --- | --- |
| **Strength** | 均一な色の領域を滑らかにし、深度・視差の境界をRGBの輪郭へ近づける調整の強さ。 |
| **Radius** | 滑らかにする処理の画素半径。 |

強くすると、人物と背景の境界が見やすくなる一方、服の柄やテクスチャーまで奥行きの凹凸として現れるおそれがあります。Zや視差の境界が実際の被写体に合っているかを比較しながら調整します。

**Manualの記述上の注意**：21.1 Manualの見出しは「Refine Disparity」ですが、Strengthの説明では「Z channelの輪郭をRGBへ合わせる」とも記されています。どの補助チャンネルが実際に変更されるかは文面に揺れがあるため、ここでは視差の調整機能という説明にとどめ、21.1実機でのチャンネル単位の挙動は未確認とします。

### Stack ModeとSwap Eyes：左右画像の扱い

**Stack Mode**は左右の画像を別々に接続するか、1枚にまとめた素材として扱うかを切り替えます。左右のファイルを別々に用意したときは**Separate**を選び、Left／Right Inputへそれぞれ接続します。

**Swap Eyes**は左右眼の割り当てを交換する設定です。左右が入れ替わっている場合に使います。視差の品質、カメラ情報、Z深度の精度を自動修正する機能ではありません。

Manualは、High Quality（HiQ）をオフにすると補間が最近傍サンプリングになり、ノイズ状に見える場合があるとも説明しています。仕上がりを判断する際はViewerの品質設定をそろえて比較します。

## Cameraタブ

### Camera Mode: External

CGレンダーやカメラトラッキングから得た**実際のステレオカメラ情報**を使い、Zと視差を対応させます。Manualは、既存のシーンと精密に一致させる目的ならこちらを使うよう案内しています。

Externalを選ぶと、Stereo Camera入力にCamera 3Dを接続できます。マニュアルは、接続したMerge 3Dに複数カメラが含まれる場合、**Camera**メニューで対象を選べると記しています。

眼間距離・輻輳設定などがレンダーに使用したものと一致していることが前提です。Zを読み込めても、カメラ条件が合わなければ視差は実際の左右画像に対応しません。

### Camera Mode: Artistic

カメラが用意できない、または物理的に正しい視差量までは必要ない場合に使います。Zのどの位置で左右の像を一致させるか、遠景にどの程度の視差を割り当てるかを手動で指定します。

| 設定 | 意味 |
| --- | --- |
| **Convergence Point** | 左右画像の像が一致し、**視差が0になるZ位置**です。手前の物体は画面から飛び出す側、奥の物体は奥へ引っ込む側に見えます。ManualではCamera 3DのConvergence Distanceの**負の値に対応**すると説明しています。 |
| **Background Disparity (Sample from Left Eye)** | 遠方の物体に割り当てる視差です。無限遠の視差の上限と考えられます。**左眼を基準**に指定し、右眼側は同じ大きさで符号が逆になります。 |

Artisticで作った視差は合成上の演出に使えますが、**実際のカメラやメートル単位の距離を測定・復元した結果ではありません**。

## 運用例：CGのZ深度から左右の視差を作る

CGレンダーの左眼・右眼画像にZチャンネルがあり、レンダリング時のステレオCamera 3Dも分かっている場合を想定します。

~~~text
左眼CG画像（RGBA＋Z） ──→ Z To Disparity：Left Input
右眼CG画像（RGBA＋Z） ──→ Z To Disparity：Right Input
ステレオCamera 3D      ──→ Z To Disparity：Stereo Camera

Z To Disparity：Left Output  ──→ 左眼画像＋視差
Z To Disparity：Right Output ──→ 右眼画像＋視差
                                     ↓
                          Stereo Alignなどの後段処理
~~~

1. 左右CG画像にZチャンネルがあることを確認し、同じフレームの画像を用意します。
2. Z To Disparityを追加し、**Stack Mode: Separate**にします。左眼・右眼画像を対応する入力へ接続します。
3. **Camera Mode: External**を選び、レンダリングで使用したステレオCamera 3DをStereo Camera入力へ接続します。
4. 視差を確認するため、必要に応じて**Output Disparity To RGB**を一時的に有効にします。確認後はオフに戻し、元のRGBAと視差補助チャンネルを後段へ渡します。
5. [Stereo Align](./stereo-align.md)の視差依存の調整に利用する場合は、左右の出力を取り違えずに接続します。画素を変形したあと、さらに視差が必要なら[Disparity](./disparity.md)で再計算することを検討します。

これはManualが説明する入力・出力と設定を組み合わせた**作業例**です。ここに示した具体的なCG環境と21.1実機での出力は未検証です。

## 注意点と選び分け

- **Zのない画像には使えません**：RGB画像から奥行きを新たに推定するNodeではありません。入力Imageに正しいZチャンネルが必要です。
- **Camera Modeで精度の意味が変わります**：Externalは入力カメラの条件に依存し、Artisticは見た目に合わせた値を作ります。
- **Refineを強めすぎない**：画像の模様まで視差へ入り込むと、輪郭に誤差が出ます。
- **視差とZは同じチャンネルではありません**：後段でZを使うなら入力Zの保持状況を確認し、視差を使う処理にはDisparityチャンネルを渡します。
- **Disparityとの使い分け**：ステレオカメラとCGのZがあるならZ To Disparityが候補です。Zはないが左右の実写画像があるなら[Disparity](./disparity.md)で対応点を解析します。
- **逆変換を一律に可逆と思わない**：[Disparity To Z](./disparity-to-z.md)で再びZへ戻しても、カメラ条件、近似、精度によって元のZと一致するとは限りません。

## 関連Node

- [Disparity](./disparity.md)：左右画像から対応点を探して視差を計算します。
- [Disparity To Z](./disparity-to-z.md)：視差をZ深度へ変換します。
- [Global Align](./global-align.md)：大きな左右画像のずれを調整します。
- [Stereo Align](./stereo-align.md)：視差を使って左右画像のずれや立体感を調整します。
- [Stereo 3Dノード一覧](./index.md)：同じFamily内の役割を比較できます。

## バージョン・出典・未確認範囲

**一次資料**：Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』、Chapter 118「Stereo Nodes」、**Z To Disparity [Z2D]、pp.2796–2799**。端子名・出力チャンネル・Controls／Cameraタブ・Studio限定条件はこの資料に基づきます。

**verification: partial**：各設定の初期値・許容範囲、runtime REGID、Stack Modeの全選択肢、HiQによる画質差、Refineによる補助チャンネル更新範囲、実際のCamera接続の型情報、21.1実機での描画結果は未確認です。Manual内のチャンネル記述の揺れは未解決のまま明示しています。
