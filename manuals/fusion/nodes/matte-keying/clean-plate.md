---
title: "Clean Plate"
description: "green / blue screenの照明ムラをならした参照Imageを作り、Delta Keyerへ渡すpre-key Node。"
doc_type: node
term_id: "clean-plate"
term_short: "Clean Plateは、green / blue screenの背景色を再構成してDelta Keyerへ渡すpre-key Node。"
verification: partial
aliases: ["Clean Plate"]
concepts: ["image-data", "mask-data", "alpha", "keying"]
nodes: ["Clean Plate"]
node_family: "matte-keying"
controls: ["Method", "Matte Threshold", "Erode", "Crop", "Grow Edges", "Fill", "Time Mode", "Invert"]
inputs: ["image", "mask", "mask"]
outputs: ["image"]
tasks: ["create-matte", "keying", "green-screen", "blue-screen"]
level: intermediate
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---

# Clean Plate

Clean Plateは、green / blue screenの背景色をできるだけ均一なImageへ再構成し、[Delta Keyer](./delta-keyer)へ参照として渡すpre-key Nodeです。

screenの照明ムラ、shadow、色のばらつきが大きいshotでは、1色だけを基準にkeyするとhairや半透明edgeを残すための調整が難しくなります。Clean Plateで「このshotのscreenは本来どんな色分布か」を先に作り、Delta KeyerのClean Plate入力へ渡すと、screen variationを考慮したkeyingができます。

## 何を作るNodeか

Clean Plateは被写体を切り抜いた最終matteを作るNodeではありません。入力Imageからgreen / blue screenと判断した部分を残し、被写体などscreenではない部分を透明にしたうえで、その穴へ周囲のscreen colorを広げてscreenだけの参照Imageを作ります。

そのため、通常のkeyingとは考え方が逆です。

- Keyer — screenを除去し、被写体を残す
- Clean Plate — screenを残し、被写体などscreen以外を除外する

ここで作ったImageは最終合成へ直接使うのではなく、主にDelta KeyerのClean Plate入力へ接続します。

## 入力

### Input

オレンジ色のInputへ、keyしたいgreen / blue screen素材と同じ2D Imageを接続します。

### Garbage Matte

白色のGarbage MatteへMaskを接続すると、そのMask内をclean plateの生成対象から除外します。

人物、撮影機材、screen外の壁など、明らかにgreen / blue screenではない領域を先に除外しておくと、後段のGrow EdgesやFillが不要な色を参照しにくくなります。

### Effect Mask

青色の任意入力です。Maskを接続すると、Clean Plateの処理を適用する範囲を限定できます。21.1 Manualでは、Effect MaskはNode処理の後に適用されるMaskとして説明されています。

Garbage Matteが「clean plateへ含めない領域」を指定するのに対し、Effect Maskは「Clean Plate Node自体をどこへ適用するか」を制限します。

## 出力

green / blue screenの色を再構成した2D Imageを出力します。

基本構成では、元のfootageをClean PlateとDelta Keyerへ分岐し、Clean Plateの出力をDelta Keyerのmagenta Clean Plate入力へ接続します。

    MediaIn / Loader ─────────────→ Delta Keyer → Merge
            │                         ↑
            └→ Clean Plate ───────────┘

Clean PlateはDelta Keyerの前後へ直列に置くNodeではなく、同じsourceから分岐する別branchとして使います。

## screen colorを選ぶ

Viewer上でscreen部分をbox selectionし、clean plateへ残す色域を指定します。

### Method

screen colorの選び方を切り替えます。

- **Color** — 色差を使ってbackground colorを分離します。screenの色が比較的均一なshot向けです。
- **Ranges** — chroma rangeでbackground colorを分離します。shadowが入ったscreenや、場所によって色が変わるscreenで使いやすい方式です。

screenの照明ムラが大きい場合は、単一色として扱うよりRangesで選択範囲を持たせた方がscreenを拾いやすくなります。

### Matte Threshold

screen selectionから作られたmatteの下限と上限を調整します。

21.1 Manualでは、下限より低い値はblack / transparent、上限より高い値はwhite / opaqueとなり、その間の値は相対的な透明度を保つと説明されています。

細かなsalt-and-pepper状のnoiseをscreen selectionから整理したい場合にも使います。

## 穴をscreen colorで埋める

色を選んだだけでは、人物やscreenではないpixelが透明な穴として残ります。Clean Plateでは、その穴をscreen colorで埋めて参照Imageを作ります。

### Erode

screenとして選択された領域を縮めます。screenではない細かなpixelがselectionのedgeへ混ざっている場合に、それらを取り除く方向で調整します。

### Crop

Imageの外周から処理範囲を切り詰めます。

### Grow Edges

残っているscreen colorのedgeを穴の内側へ広げます。被写体を除外して空いた領域へ周囲のgreen / blueを伸ばし、連続したscreen Imageへ近づけます。

### Fill

Grow Edges後にも残った穴を、周囲のscreen colorを使って埋めます。

Clean Plateは「被写体部分を透明にできれば完成」ではありません。Delta Keyerへbackground referenceとして渡せるよう、最終的にはscreen colorで穴を埋めたImageへ整えます。

## 時間方向の扱い

### Time Mode

- **Sequence** — frameごとに新しいclean plateを生成します。
- **Hold Frame** — 1 frameのclean plateを保持します。

screenの明るさや色が時間とともに変化するshotではSequenceが候補になります。screen状態が安定していて1 frameを参照として固定したい場合はHold Frameを使えます。

どちらが適切かはshotの変化量で決めます。Manualのこの節では、特定条件で一方を必須とはしていません。

## Garbage Matteの反転

Mask tabのInvertは、Garbage Matteとして接続したMaskの扱いを反転します。

21.1 Manualでは、透明部分を使ってImageをclearする設定として説明されています。Garbage Matteの内外を逆に使いたい場合に切り替えます。

## Delta Keyerと組み合わせる

screenの照明ムラが大きいshotでは、次の順で確認すると役割を分けやすくなります。

1. 元footageをClean PlateとDelta Keyerへ分岐する。
2. Clean Plateでscreen colorを選び、人物や機材をGarbage Matteで除外する。
3. Erode、Grow Edges、Fillでscreenだけの参照Imageを作る。
4. Clean Plate出力をDelta KeyerのClean Plate入力へ接続する。
5. Delta Keyer側で最終Alpha、hair / fringe、spillを調整する。

Clean Plate側で最終Alphaを完成させようとせず、「background referenceを作る工程」と「被写体をkeyする工程」を分けるのが基本です。

## 似た「clean plate」との違い

Fusionでは、Paintで物体を消した1枚のframeやObject Removalへ渡す背景Imageも一般にclean plateと呼ばれます。

このページの**Clean Plate Node**はChapter 109のMatte Nodeで、green / blue screen keying用のbackground referenceを作るものです。Paintによるretouch用clean plateやObject Removal用の背景plateとは用途が異なります。

## 関連Node

- [Delta Keyer](./delta-keyer) — Clean Plate出力を参照してgreen / blue screenからAlphaを作る
- [Matte Control](./matte-control) — key後のAlpha、Solid / Garbage領域、spillを整理する
- [Chroma Keyer](./chroma-keyer) — 任意の色域からmatteを作る
- [Ultra Keyer](./ultra-keyer) — Pre-Matteとcolor differenceを組み合わせる別のscreen keyer

## バージョンと検証状況

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 109 Matte Nodes pp.2511–2514で、Clean Plateのpre-key用途、3 inputs、Delta Keyerとのbranch構成、Method、Matte Threshold、Erode、Crop、Grow Edges、Fill、Time Mode、Garbage MatteのInvertを確認しています。

このページではManualで確認できないruntime REGID、内部の補間algorithm、実機上の厳密な端子表示、処理性能は断定していません。
