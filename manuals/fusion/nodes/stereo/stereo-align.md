---
title: "Stereo Align"
description: "ステレオ左右眼の縦ずれ、輻輳位置、眼間距離を視差情報に基づいて調整するNode。"
doc_type: node
term_id: "stereo-align"
term_short: "Stereo Alignは、左右眼の画像を視差に基づいて変形し、縦ずれ・輻輳位置・眼間距離を調整するNode。"
verification: partial
aliases: ["Stereo Align", "SA"]
concepts: ["image-data"]
nodes: ["Stereo Align"]
node_family: "stereo"
controls: ["Vertical Alignment", "Convergence Point", "Eye Separation", "Depth Ordering", "Clamp Edges", "Edge Softness", "Source Frame and Warp Direction", "Stack Mode", "Swap Eyes"]
inputs: ["image"]
outputs: ["image"]
tasks: ["process-stereo"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Stereo Align

Stereo Align [SA]は、**左眼用と右眼用の画像の位置関係を調整する**Nodeです。上下にずれた像を合わせる、左右の像が重なる位置を変える、左右の視点間の距離を変えたような立体感にする、といった操作をまとめて行います。

ステレオ映像では、同じ物体が左眼と右眼で少し違う場所に写ります。この位置の差を**視差（Disparity）**と呼びます。Stereo Alignは視差を利用して画素を移動・補間するNodeであり、2枚を横に並べるだけのNodeではありません。

**DaVinci Resolve Studio / Fusion Studio限定**です。無償版DaVinci Resolveの標準Nodeとして案内しません。

## 役割

Stereo Alignが扱う主な調整は次の3つです。

- **Vertical Alignment（縦方向の位置合わせ）**：左右の同じ物体の高さが違う場合に、不要な上下のずれを減らします。
- **Convergence Point（輻輳位置）**：左右の画像を水平方向にずらし、立体視したときに像が一致する画面上の位置を変えます。
- **Eye Separation（眼間距離）**：視差を変形し、左右の視点が近づいたり離れたりしたような見え方にします。

Manualでは、複数の操作を1つのNodeで行うことで、画像の**再サンプリング（画素を新しい位置に計算し直す処理）を1回にまとめられる**と説明しています。ただし、補間によって元の映像に存在しない背景が完全に復元されるわけではありません。

## 入力

入力は<Term id="image">2D Image</Term>です。Manualの作例では、前段の[Disparity](./disparity.md)で**視差を補助チャンネルに付与した左右画像**を入力します。

| 端子 | 接続するもの |
| --- | --- |
| **Left Input**（オレンジ） | 左眼画像、または左右を1枚にまとめた画像。 |
| **Right Input**（緑） | 右眼画像。**Stack ModeがSeparateのときだけ**表示されます。 |

左右が別々の素材なら**Stack Mode: Separate**にして、左右をそれぞれ入力します。1枚に並べた素材を入力する場合は、Stack Modeと素材の配置を一致させます。

とくに**Per Pixelの縦位置合わせ**と**Eye Separation**は、左右の同じ物体がどこに写っているかという視差情報に依存します。単に2枚のカラー画像をつなぐだけで、正しい視差が自動生成されるわけではありません。

## 出力

出力は、位置関係を調整した**2D Image**です。3D Sceneや立体モデルは出力しません。

- **Left Output**：調整後の左眼画像。左右をまとめて扱うStack Modeでは、まとめた画像をここから受け取ります。
- **Right Output**：調整後の右眼画像。**Separateのときだけ**表示されます。

**補助チャンネルの扱いに注意してください。** ManualはStereo AlignがRGBAを加工し、補助チャンネル、とくに入力のDisparityを**破棄する**と説明しています。後段で視差を利用する場合は、Stereo Alignのあとにもう一度[Disparity](./disparity.md)を置いて計算し直します。

## 主な設定項目

### Vertical Alignment：上下のずれを直す

**Apply to**は、動かす眼の画像を選びます。

| 設定 | 処理の仕方 |
| --- | --- |
| **Right** | 左眼を基準に右眼だけを調整します。 |
| **Left** | 右眼を基準に左眼だけを調整します。 |
| **Both** | 調整量を左右の画像へ分けて適用します。 |

通常は**Right**から始めると、左眼を再サンプリングしない基準画像として残せます。

**Mode**には2種類あります。

- **Global**：画像全体を同じ量だけ上または下にずらします。カメラの高さの違いなどによって、画面全体でほぼ一定の縦ずれがある場合に適します。
- **Per Pixel**：視差を参照し、画面の場所ごとに異なる量で画素を変形します。局所的な縦ずれに対応できますが、細部の画質低下や輪郭の欠けが生じる場合があります。

Globalでは**Y-shift**で移動量を調整します。数値を入力するほか、視差チャンネルから値を取得する**Sample**操作もあります。**Snap to Whole Pixels**を使うと整数画素ずつ移動するため、小数画素位置への補間による軟化を避けられます。

Per Pixelの前に大きな縦ずれがある場合は、先に[Global Align](./global-align.md)でおおまかな位置を合わせると、視差推定が小さな物体を追いやすくなります。

### Convergence Point：左右の像が一致する場所を変える

左右の画像を**水平方向（X方向）**へ移動し、どの位置で2つの像を一致させるかを調整します。

- **Apply to**：左眼・右眼のどちらに適用するか、または**Split**で左右へ50%ずつ分けるかを選びます。
- **X-shift**：左右の水平方向の移動量です。数値設定と、視差を参照するSample操作があります。
- **Snap**：整数画素単位の移動にして、再サンプリングによる画質低下を抑えます。

Splitは両眼を再サンプリングする一方、片眼ごとの移動量を小さくできます。片眼を基準画像として保持したい場合とは使い分けます。これは**画像の左右位置を変える操作**であり、被写体の奥行きを計測するNodeではありません。

### Eye Separation：視差の大きさを変える

**Separation**は、左右画像にある視差を拡大・縮小するための係数です。Manualには**0.0で変更なし**、**0.1で視差を約10%大きくする**例が記載されています。減少方向の数値例はManualに表記の重複があるため、確認なしに固定しません。

Eye Separationは撮影済みのカメラを物理的に動かす機能ではなく、視差に基づき画素を補間する機能です。被写体の背後など、元の左右画像のどちらにも写っていない場所を表示する必要が生じると、**穴や二重像**が発生することがあります。

Vertical AlignmentのBothのように単純に調整量を半分にするのではなく、ManualはEye Separationを両眼に適用する場合、**左右それぞれへ効果を適用する**と説明しています。

### Left/Right Eye Options：重なりと画像端を調整する

**Depth Ordering**は、変形後の像が同じ場所に重なったとき、どの画素を手前に描画するかを決めます。

- **Largest Disparity On Top**：大きな視差を持つ部分を前面にします。
- **Smallest Disparity On Top**：小さな視差を持つ部分を前面にします。

**Clamp Edges**は変形後の画像端にできた透明な隙間を抑えられることがありますが、画素を引き伸ばすため不自然な線が現れる場合があります。Manualでは**小さな隙間の修正に限る**ことを勧めています。**Edge Softness**はその伸びの境界をやわらげます。

**Source Frame and Warp Direction**では、画素の色を左・右どちらの元画像から取るか、左右どちら向きの視差で変形するかを組み合わせます。

| 選択肢 | 元画像と視差 |
| --- | --- |
| **Left Forward** | 左眼画像と左→右の視差 |
| **Right Forward** | 右眼画像と左→右の視差 |
| **Left Backward** | 左眼画像と右→左の視差 |
| **Right Backward** | 右眼画像と右→左の視差 |

両眼の情報を使うと一方の画像にない部分を補えることがありますが、視差推定が食い違う場所では輪郭が二重になる場合があります。**右眼を作り直す場合に左眼画像の補間だけを使う**方法がManualに示されています。

### Stack Mode、Swap Eyes、Viewerの品質

**Stack Mode**は、左右を別々に扱うか、1枚にまとめた入力を扱うかを指定します。**Separate**では右入力・右出力が表示されます。左右をまとめたモードでは、両出力が同じ画像を返すとManualに記載されています。

**Swap Eyes**は左右眼の割り当てを交換します。位置や視差そのものを自動修正する設定ではありません。

Viewerで**High Quality**がオフの場合、補間表示が最近傍サンプリングになり、粗く見えることがあります。画質を比較するときはViewer下部メニューのHigh Quality設定も確認してください。

## 主な用途

- **撮影素材の縦ずれ修正**：2台のカメラの高さがわずかに違い、右眼の像が数画素ずれている場合にGlobalのY-shiftでそろえます。
- **立体視の一致位置の調整**：顔や手など注目する被写体の左右像が、画面のどこで一致するかをX-shiftで変更します。
- **立体感の調整**：左右の視差が強すぎる素材でSeparationを変え、見え方と補間の破綻を比較します。
- **局所的な縦ずれへの対応**：画面の位置によって上下のずれ量が異なる場合に、視差を使うPer Pixelを試します。

## 最小構成

左右眼が別々の2D画像に分かれている場合の基本構成です。

~~~text
左眼画像 ─┐             ┌─ 左眼＋視差 ─┐                 ┌─ 調整後の左眼 ─┐
          ├─ Disparity ─┤              ├─ Stereo Align ─┤               ├─ Disparity（再計算）
右眼画像 ─┘             └─ 右眼＋視差 ─┘                 └─ 調整後の右眼 ─┘
~~~

1. 同じ時刻の左右画像を用意し、必要なら[Global Align](./global-align.md)で大きなずれを先に補正します。
2. [Disparity](./disparity.md)で左右画像の対応位置を求め、視差付きの左右出力をStereo Alignへ接続します。
3. **Stack Mode: Separate**にして、Vertical Alignmentの**Apply to: Right／Mode: Global**から調整します。
4. **Y-shift**を変え、左右の同じ物体の高さが一致するかViewerで比較します。
5. 必要な場合だけConvergence PointやEye Separationを調整し、画像端や手前の被写体の周りに穴・二重像がないか確認します。
6. 後段で視差を利用する場合は、**調整後の左右出力を再びDisparityへ入力**します。

これはManualの構成に沿った手順であり、今回実機でレンダリングして確認した結果ではありません。

## 運用例：ステレオ撮影の縦ずれを直す

同じ人物を左右2台のカメラで撮影したところ、右眼だけが全体に少し高く写っていたとします。

まず大きな位置差や左右の色差を整え、Disparityで視差を計算します。Stereo Alignを**Right / Global**にしてY-shiftを調整し、左右の目元・輪郭が同じ高さになるよう合わせます。画面の一部だけに縦ずれが残るなら**Per Pixel**を比較します。

次にConvergence Pointを調整して顔の左右像がどの位置で重なるかを確認し、必要な場合にだけEye Separationを変更します。動く手や髪の輪郭に穴・二重像が出たら補間を弱め、Source Frame and Warp Directionの組み合わせを見直します。後段で奥行きを扱う場合は、**調整後の画像から視差を再計算**します。

## 挙動と注意点

- **視差の品質に依存します**：左右の色差、黒帯、過大な縦ずれは視差推定を難しくします。事前のGlobal Alignや色合わせが有効な場合があります。
- **レンズ歪みの処理順が重要です**：Manualは視差計算前のレンズ歪み補正を推奨しています。歪みを残したまま縦位置合わせすると、レンズ歪みの縦成分まで補正され、後で歪みを戻す際に不自然になることがあります。
- **隠れた背景は自動復元できません**：眼間距離を大きく変え、元の2画像に写っていない領域が必要になると、穴埋めや局所修正が別途必要です。
- **補助チャンネルを保持しません**：視差を再利用する構成では、Stereo Alignの後ろでDisparityを再生成します。
- **Global Alignと役割が違います**：[Global Align](./global-align.md)は視差を計算する前に、大きなX/Y移動や回転を手早く合わせるNodeです。Stereo Alignは視差に基づく画素単位の補正や眼間距離変更まで扱います。
- **表示用の結合とは別です**：[Combiner](./combiner.md)は左右画像を横・縦に並べ、[Anaglyph](./anaglyph.md)は色分離して表示します。どちらもStereo Alignのような視差に基づく位置調整ではありません。

## 関連する考え方・関連Node

- [画像（Image）](../../learn/02-data/image.md)：RGBA、解像度、補助チャンネルを持つ画像データの基本。
- [Disparity](./disparity.md)：左右の対応点から視差を作り、再生成します。
- [Global Align](./global-align.md)：視差計算より前の大まかな位置合わせ。
- [Combiner](./combiner.md)、[Splitter](./splitter.md)：左右画像を1枚にまとめたり、分離したりします。
- [Stereo 3Dノード](./index.md)：同じFamilyの役割分担。

## バージョンと検証状況

**出典：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 118「Stereo Nodes」、Stereo Align [SA]（pp.2791–2796）。** 入力端子、2出力、Vertical Alignment、Convergence Point、Eye Separation、Depth Ordering、Clamp Edges、Source Frame and Warp Direction、Stack Mode、Studio限定の記述はこの資料に基づきます。前段の視差についてはDisparity [Dis]（pp.2777–2780）、大まかな位置合わせについてはGlobal Align [GA]（pp.2784–2786）を参照しました。

**Manual内の表記差**：p.2792のOutputsには「new disparity channel」とありますが、同じページのNOTE/TIPと作例は、Stereo Alignが視差チャンネルを破棄し、後段でDisparityを再計算すると明記しています。このページでは**再計算が必要**な説明を採用し、出力の視差補助チャンネルを保証しません。またp.2794では、Separationの増加・減少の数値例がどちらも「0.1」となっています。減少方向の数値は断定しません。

**verification: partial**：Resolve/Fusion 21.1実機での出力、初期値・数値範囲、Stack Modeの全選択肢、内部REGID、実際の穴・補間品質は未確認です。接続例は21.1 Manualに基づく運用例であり、実機検証済みとは扱いません。
