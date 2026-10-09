---
title: "Shadow"
description: "画像のAlphaから2Dの影を作るFusion Node。3つの入力、影の位置と柔らかさ、Depth Mapを使う場合、影だけを別合成する手順を説明。"
doc_type: node
term_id: "shadow"
term_short: "Shadowは、Alphaで切り抜かれた画像の輪郭から2Dの落ち影を作るNode。"
verification: partial
aliases: ["Shadow", "SH"]
concepts: ["image-data", "alpha", "mask-data"]
nodes: ["Shadow"]
node_family: "effects-film"
controls: ["Shadow Offset", "Softness", "Shadow Color", "Light Position", "Light Distance", "Minimum Depth Map Light Distance", "Z Map Channel", "Output"]
inputs: ["image", "image", "mask"]
outputs: ["image"]
tasks: ["drop-shadow", "composite", "stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Shadow

Shadow [SH]は、文字・ロゴ・切り抜いた人物などの**輪郭をもとに、画面内へ落ちる2Dの影を作る**Nodeです。入力画像の<Term id="alpha">Alpha</Term>（透明度）を使って影の形を決め、影を置く位置、輪郭のぼけ具合、色を調整できます。

通常は被写体の後ろに影を少しずらして重ねます。背景の奥行きを示す画像（Depth Map）を別入力へつなぎ、影の伸び方に変化を付けることもできます。ただし、これは3D空間にある物体や光源から影を計算する機能ではありません。

## 役割と出力

Shadowは、Alpha付きの2D <Term id="image">Image</Term>を受け取り、その形に対応する影を作って**2D Image**を返します。後段のMergeで背景へ重ねる構成が基本です。Inspectorの**Output**では、「入力画像と影を合わせた結果」と「影だけ」のどちらを出すか選べます。

影だけを出す場合は、色補正や遠近方向の変形を影にだけ施し、最後に元の被写体と合成できます。元画像の色や形を変えずに、影の表現だけ追い込むときに有用です。

## 入力

DaVinci Resolve 21.1 Reference Manualに記載されている入力は、次の3つです。

- **Input（オレンジ）**：影の形のもとになる、Alpha付きの2D Image。文字や背景を抜いたロゴなどを接続します。透明部分と不透明部分の境界が、影の輪郭を決めます。
- **Depth（緑、任意）**：奥行きの情報を持つ2D Image。Inspectorの**Z Map Channel**で使うチャンネルを選び、**Light Position / Light Distance**による影の変化へ反映します。通常の落ち影だけなら接続しなくても構いません。
- **Effect Mask（青、任意）**：影の効果を**最終的に表示する範囲**を制限する<Term id="mask">Mask</Term>。Shadowの処理後に適用されるため、範囲外へ伸びた影も表示段階で切られます。

Depthは「影の形のもとになる画像」ではなく、影に奥行きによる変化を与えるための補助入力です。Effect Maskも影の輪郭を作る入力ではありません。まずInputに接続する画像のAlphaを確認すると、3つの役割を区別できます。

## 主な設定項目

### 基本の影を整える

- **Shadow Offset**：影をX・Y方向へずらします。Viewerに出る十字型の操作点でも位置を動かせます。文字の少し右下へ影を落とす、といった位置合わせに使います。
- **Softness**：影の縁をぼかす強さ。大きくすると輪郭が柔らかくなり、小さくすると元の形がはっきり残ります。
- **Shadow Color**：影の色。真っ黒に限らず、背景の光や色に合わせて調整できます。

最初はShadow Offsetで影が見える位置へ動かし、Softnessで輪郭、Shadow Colorでなじみ方を整えると、各設定の効果を判別しやすくなります。

### 光の位置と奥行きを扱う

- **Light Position**：被写体に対する光源の位置。**Light Distanceが1.0（無限遠）に設定されている間は反映されません**。
- **Light Distance**：光源の見かけの距離。Manualでは**1.0を無限遠、0を被写体との距離がゼロ**として説明しています。無限遠から近づけると、場所によって影の長さが変わる表現に使えます。
- **Minimum Depth Map Light Distance**：Depth入力が接続されているときに使用する設定。奥行き画像がLight Distanceへ与える影響を調整します。Manualでは、暗い領域ほど奥へ、白い領域ほどカメラ側へ近づくように扱うと説明されています。
- **Z Map Channel**：Depth入力のどのチャンネルから奥行きを読むかを選びます。Manualに記載された選択対象はRGB、Alpha、Luminance、Z-bufferです。

Depth Mapを使っても、それだけで床や壁の正しい3D形状が復元されるわけではありません。使用する奥行き画像とLight Position / Distanceを変え、Viewerで影の変形を確認します。

### 出力を分ける

- **Output**：被写体と影を一緒に出すか、影のみを出すかを選びます。

影のみを出す方式は、影にだけColor Correctorや変形Nodeを挟みたい場合に使います。画面内で被写体と影をどう重ねるかは、後段のMergeで決めます。

## 最小構成：文字に落ち影を付ける

透明背景に文字を生成するText+をShadowへつなぎ、背景映像と重ねます。

~~~text
Text+ ─────────→ Shadow ─→ Merge（Foreground）─→ MediaOut
背景（MediaIn） ─────────────→ Merge（Background）
~~~

1. Text+で文字を作り、Shadowの**Input**へ接続します。文字の周囲が透明になっていることを確認します。
2. Shadowの**Output**は、元の文字と影を合わせて出す設定にします。
3. **Shadow Offset**で影を右下などへずらし、**Softness**で縁を少しぼかします。
4. **Shadow Color**を調整し、影が背景から浮いて見えないようにします。
5. Shadowの出力をMergeのForeground、背景映像をBackgroundへつなぎ、MediaOutで仕上がりを確認します。

この例ではDepthとEffect Maskを使いません。まずAlphaから影が生成されることを確かめ、必要な場合だけ追加入力を使います。

## 運用例：影だけを加工してロゴと合成する

ロゴの色はそのまま保ち、床に落ちたような広い影だけを別に補正する構成案です。

1. Alpha付きのロゴ画像を2つの枝へ分けます。一方は後でロゴ本体として合成します。
2. もう一方をShadowへ接続し、**Output**を影のみの設定にします。
3. Shadow OffsetとSoftnessで基本形を整え、必要に応じて影側にColor CorrectorやTransformを追加します。
4. 最初のMergeで背景に影を重ね、次のMergeで加工していないロゴを前面に置きます。

~~~text
ロゴ ─→ Shadow（影のみ）→ 影の色・形を調整 ─→ Merge 1（Foreground）
  └─────────────────────────────────────────────→ Merge 2（Foreground）→ MediaOut
背景 ───────────────────────────────→ Merge 1（Background）─→ Merge 2（Background）
~~~

この構成なら、影を暗くしたり横へ伸ばしたりしても、ロゴ自体の色と形には直接影響しません。具体的な補正量は素材と合成結果に合わせて調整します。これはManualで確認できる「影のみの出力」を利用した**運用案**であり、21.1実機でこの例の描画結果を確認したものではありません。

### Depth Mapを使いたい場合

背景の奥行きを表す2D画像があるなら、Shadowの**Depth**へ接続します。Z Map Channelで適切なチャンネルを指定し、Light Distanceを無限遠（1.0）から変えたうえで、Light PositionやMinimum Depth Map Light Distanceを調整します。影が背景の奥行き画像に応じてどう変わるかをViewerで見比べます。

単なる暗い背景画像をDepthへつなぐだけでは、正しい奥行きになるとは限りません。Depth画像のチャンネルが何を表し、明暗と奥行きがどう対応しているかを確認する必要があります。

## 使い分けと注意点

- **[Merge](../compositing/merge.md)**：影や被写体を背景へ重ねるためのNodeです。Shadow自身は2枚の画像を前後関係付きで合成するNodeではありません。
- **[Spot Light](../materials-lights/spot-light.md)と[Image Plane 3D](../3d/image-plane-3d.md)**：3Dオブジェクトと光源による影を作る場合の関連Nodeです。Shadowが行う2Dの落ち影とは計算する対象が異なります。
- **Effect Mask**：処理後の表示領域を制限します。影がマスクの外で突然途切れる場合は、影の位置やSoftnessだけでなくEffect Maskの範囲も確認します。
- **Alphaのない画像**：Shadowの形は入力画像のAlphaをもとにします。背景全体が不透明な素材なら、先に被写体を切り抜くなど、影を落とす輪郭を用意します。
- **Depthと実際の3D**：Depth Mapによる変化は2Dの影の調整です。3Dシーンでの遮蔽、照明、表面同士の正確な影を代替するものではありません。

## 関連する考え方

- [画像（Image）の基礎](../../learn/02-data/image.md)：RGBAとAlphaチャンネル。
- [マスク（Mask）の基礎](../../learn/02-data/mask.md)：Effect Maskと元画像のAlphaの違い。
- [Effect / Filmノード一覧](./index.md)：同じカテゴリの処理を探す入口。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 97「Effect Nodes」、**Shadow [SH]（pp.2295–2297）**に基づきます。3入力、基本の影と奥行きの設定、Outputで影のみを出せる点、2Dと3Dの区別を確認しました。

最小構成はManualの接続例を文章化したものです。影を個別加工する例とDepth Mapの確認手順は、記載機能を組み合わせた運用案です。**21.1実機の描画結果、Inspectorの初期値・数値範囲（Light DistanceのManual明記値を除く）、内部REGID、edition差は未確認**のため、verificationはpartialとしています。
