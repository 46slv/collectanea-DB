---
title: "Duplicate"
description: "2D画像を繰り返し複製し、コピーごとに移動・回転・大きさ・時間差を加えるFusion Node。基本的な配列、合成方法、Jitterを解説。"
doc_type: node
term_id: duplicate
term_short: "Duplicateは2D画像を複製し、各コピーに段階的な変形や時間差を与えるNode。"
verification: partial
aliases: ["Duplicate", "Dup"]
concepts: ["image-data", "transform", "compositing"]
nodes: ["Duplicate"]
node_family: "effects-film"
controls: ["Copies", "Time Offset", "Center", "Pivot", "Size", "Angle", "Apply Mode", "Operator", "Subtractive/Additive", "Gain", "Alpha Gain", "Blur", "Burn In", "Blend", "Merge Under", "Random Seed", "Reseed", "Jitter"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["duplicate", "repeat", "array", "motion-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Duplicate

Duplicate [Dup]は、入力した2D <Term id="image">Image</Term>を繰り返し複製し、**1つ前のコピーから次のコピーへ位置・大きさ・回転などの変化を積み重ねる**Nodeです。小さな円を等間隔に並べる、ロゴを少しずつ回転させながら重ねる、同じアニメーションを時間差で表示するといった効果を作れます。

配置したコピーはNode内で1枚の2D画像に合成されます。3Dオブジェクトを増やす[Duplicate 3D](../3d/duplicate-3d.md)や、図形データのまま複製する[sDuplicate](../shapes/sduplicate.md)とは扱うデータが異なります。

## 役割と入出力

- **Input（オレンジ）**：複製元の2D画像です。透明な背景に描いた円、ロゴ、文字、動画などを接続します。
- **Effect Mask（青）**：処理後の複製結果を表示する範囲を制限します。<Term id="mask">Mask</Term>は**複製・合成した後**に適用されるため、「範囲の外にコピーを作らない」設定とは異なります。
- **出力**：すべてのコピーを重ね合わせた2D Imageです。Viewerへ表示したり、MergeのForegroundに接続して実写へ重ねたりできます。

Duplicateは複数の画像入力を並べるNodeではありません。1つの元画像に対して、各コピーの変化量と重なり方を指定します。

## 最小構成：円を横に並べる

```text
Ellipse ──(Mask)──┐
                  ▼
Background ──→ Duplicate ──→ Merge（Foreground）──→ MediaOut
                              ▲
MediaIn ──────────────────────┘（Background）
```

1. Backgroundを作り、EllipseをそのMask入力へ接続して、小さな円だけが見える画像を用意します。背景以外の部分が透明になるようにします。
2. Backgroundの出力をDuplicateの**Input**へ接続し、DuplicateをViewerに表示します。
3. **Copies**を増やして複製を作ります。Manualでの「Copies = 5」は、元の画像に加えて5回複製する例です。合計6個を想定して数えます。
4. **Center X**を少し動かし、コピーごとの横方向の間隔を調整します。Center Yは変えずに、最初は直線状の並びを作ります。
5. Duplicateの出力をMergeのForegroundに接続し、MediaInの映像をBackgroundに入れると、実写の上へ円の列を重ねられます。

Copiesだけを変えた段階では、コピーが同じ位置に重なって見えることがあります。**Centerは複製ごとの差**であり、画像全体の配置を動かしたいときは後段のTransformなどでまとめて移動します。

## Inspector：並び方と時間差

### Copies / Time Offset

- **Copies**：元画像から何回コピーを作るかを指定します。次のコピーは直前のコピーをもとに作られるため、変形は段階的に積み重なります。
- **Time Offset**：元画像のアニメーションを、コピーごとに異なる時刻で参照します。たとえば元の図形が回転しているとき、マニュアルの例にある **-1.0** を設定すると、後のコピーほど1フレームずつ前の状態を表示できます。静止画だけを入れても時間差の効果は見えません。

### Center / Pivot / Size / Angle

- **Center X / Y**：コピーを作るたびに加える位置のずれです。X方向へずらせば横一列に、XとYの両方をずらせば斜めの列になります。
- **Pivot**：拡大・縮小や回転の基準点です。Pivotの位置は画像や配列に自動追従しないため、円弧の中心が意図と違うときはここを調整します。
- **Size**：次のコピーに加える大きさの変化です。コピーが進むにつれて徐々に小さくなる並びなどを作ります。
- **Angle**：コピーごとのZ軸方向の回転量です。Pivotを画像の中心からずらしてAngleを与えると、同じ位置で回転するだけでなく、弧を描く配置にも応用できます。

CenterとAngleを同時に変えると、コピー同士の位置関係も変わります。最初は1項目ずつ操作し、列ができてから回転を加える方が調整しやすくなります。

## Inspector：コピーが重なった部分

Duplicateは複製するだけでなく、コピー同士が重なった画素をどのように合成するかも決めます。

- **Apply Mode**：NormalではAlphaを使った標準的な重ね合わせを行います。Screenは明るさを重ねる表現、Multiplyは暗く重なる表現に向きます。Overlay、Soft Light、Hard Light、Differenceなどの合成方法も選べます。
- **Operator**：Apply Modeが**Normal**のときに、Over / In / Held Out / Atop / XOrなど、Alphaに基づく合成関係を選びます。通常の不透明な図形を順に重ねるならOverが出発点です。
- **Subtractive/Additive**：前景画像のRGBにAlphaがすでに掛かっているか（プリマルチプライド）によって、合成時の扱いを調整します。透明な輪郭が暗くなったり明るく縁取られたりするときの確認項目です。
- **Gain / Alpha Gain**：RGBの明るさと、重なったコピーが背後を隠すAlphaの強さを調整します。Gainの効果は複製回数に応じて累積するため、コピー数を増やすと見た目が変わる場合があります。
- **Burn In**：前のコピーを、後のコピーのAlphaでどの程度暗くするかを調整します。値を大きくすると、コピーが重なる部分が加算的な見え方に近づきます。
- **Blend（Controlsタブ）**：元画像と複製群の混ざり具合を変えます。**0では元画像だけ、1ではすべてのコピーが表示**され、最後に作ったコピーから順に薄くなります。一般のSettingsタブにあるBlendとは役割が異なります。
- **Merge Under**：コピーの前後関係を反転します。後に生成したコピーを背面に置きたいときに使います。

透明なロゴを重ねる場合は、Apply ModeだけでなくAlphaとSubtractive/Additiveの組み合わせも確認します。Screenで黒が目立たなくなることと、透明Alphaを正しく作ることは同じではありません。

### コピーのぼかし

**Blur**は複製した画像をぼかします。Lock Blurを外すとX / Yを別々に調整でき、GlowやRGBA Scaleでもぼかし結果を変えられます。**Blur量そのものはコピー数に応じて累積しません**。Gainが複製数で累積する点と混同しないようにします。

## Inspector：Jitterで規則的な並びを崩す

Jitterタブは、Controlsで作ったコピーへ**ばらつき**を追加する場所です。最初からランダムな点群を生成するわけではありません。

- **Random Seed / Reseed**：同じ調整量から別のランダムな並びを作ります。
- **Center X / Y**：コピーの位置にばらつきを加えます。たとえば円の等間隔の列を、少し不揃いなドット列にできます。
- **Axis X / Y**：Jitterで追加する回転の中心をばらつかせます。Controls側で指定した基本の回転そのものを変える設定ではありません。
- **X Size / Angle**：コピーの大きさやZ回転に差を付けます。
- **Gain（RGBA）/ Blend**：コピーごとの色チャンネルの強さや重なり具合に差を付けます。

不揃いなドット列を作るなら、先にCopiesとCenterで等間隔の列を完成させてから、JitterのCenterを少し上げます。Seedを変えると配置の種類を選び直せます。

## 主な用途と運用例

**ロゴの残像を作る**：透明なロゴをDuplicateへ入れ、Copiesを少数にし、Center XとSizeをわずかに変えます。後ろへ続くロゴが少しずつ小さくなる配置になります。各コピーの重なりが強すぎる場合はControlsタブのBlendやAlpha Gainを調整します。

**時間差で動く図形の列を作る**：アニメーションを付けた円をInputへ接続し、CopiesとCenterで列を作ってからTime Offsetを変えます。同じ円が同じ動きを同時に繰り返すのではなく、前後のフレームをずらしたような動きになります。

**フレーム内だけに反復を見せる**：DuplicateのEffect MaskにRectangleを接続すると、範囲からはみ出した複製結果が表示されなくなります。ただしこれは処理後の切り取りです。特定の位置にだけ光や絵柄を**発生**させたい場合は、Duplicateに入れる元画像の段階で対象を絞ります。

## 挙動と注意点

- **2D Image用**：写真、動画、文字を描画した画像を複製します。Shapeをベクトルデータのまま増やすなら[sDuplicate](../shapes/sduplicate.md)を使い、必要な地点でsRenderにより2D画像へ変換します。
- **3D配列には別Node**：3Dモデルを増やすなら[Duplicate 3D](../3d/duplicate-3d.md)です。2D Duplicateの出力はそのまま3Dシーンにはなりません。
- **コピー数と重なり**：Copiesを増やすと、配置だけでなく合成・Gainの累積結果も変わります。まず少数で間隔と重なりを決めてから増やします。
- **Effect Maskは後処理**：発生源を限定するための事前マスクではありません。どの段階の画像を切り取りたいかで接続位置を決めます。

## 関連する考え方・Node

- [画像（Image）の基礎](../../learn/02-data/image.md)：2D画像とAlphaの扱い。
- [マスク（Mask）の基礎](../../learn/02-data/mask.md)：Effect Maskで結果を制限する意味。
- [正規化座標](../../learn/03-space/normalized-coordinates.md)：Centerと画像上の位置。
- [sDuplicate](../shapes/sduplicate.md)：Shapeの複製。
- [Duplicate 3D](../3d/duplicate-3d.md)：Classic 3Dシーンの複製。
- [Effect / Filmノード一覧](./index.md)：ほかの効果を探す。

## バージョンと検証状況

**一次資料**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）、Chapter 97「Effect Nodes」、**Duplicate [Dup]（pp.2272–2278）**。Input / Effect Mask、Controls、Apply Mode、Operator、Subtractive/Additive、Gain、Blur、Burn In、Blend、Merge Under、Jitterの記述を確認しています。

円の反復やロゴの例は、Manualに記載された機能を使う具体的な構成案です。**21.1実機での描画、Inspectorの初期値・全数値範囲、内部REGID、Edition差は未確認**のため、verificationはpartialとしています。
