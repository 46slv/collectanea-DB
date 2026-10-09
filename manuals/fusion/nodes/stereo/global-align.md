---
title: "Global Align"
description: "ステレオ映像の左右眼を移動・回転させ、視差計算前に画面全体のずれを整えるNode。"
doc_type: node
term_id: "global-align"
term_short: "Global Alignは、左右眼の画像全体の横・縦位置と傾きを手動で合わせるStereo Node。"
verification: partial
aliases: ["Global Align", "GA"]
concepts: ["image-data"]
nodes: ["Global Align"]
node_family: "stereo"
controls: ["Translation X and Y", "Snap to Nearest Pixel", "Rotation", "Angle", "Translation Filter Method", "Visualization", "Stack Mode", "Swap Eyes"]
inputs: ["image"]
outputs: ["image"]
tasks: ["process-stereo"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Global Align

Global Align [GA]は、立体映像の**左眼用と右眼用の画像を見比べながら、画像全体を横・縦に移動させたり、傾きを回転で直したりする**Nodeです。2台のカメラで撮った映像に大きな位置差があるとき、左右の対応点を計算する前にその差を減らします。

同じ場所を撮影しても、片方のカメラの高さや傾きが違えば、人物の目が上下にずれたり、背景の水平線が片方だけ傾いたりします。Global Alignは、画像全体に共通するずれを手動で調整するためのものです。**DaVinci Resolve Studio／Fusion Studio限定**です。

## 役割

Global Alignが行うのは、左右眼の**大まかな位置合わせ**です。左眼または右眼の画像を指定した量だけ移動・回転させ、調整した画像を返します。視差や奥行きのデータを新規生成するNodeではありません。

左右画像の位置差が大きいままだと、[Disparity](./disparity.md)で対応点を調べる処理も難しくなります。Global Alignをその前段に置くと、上下・左右の大きなずれや回転差を減らした状態から視差を計算できます。

[ Stereo Align ](./stereo-align.md)は視差を利用したより細かな補正を扱いますが、Global Alignは**光学フローを使用しません**。画面の部分ごとに違う歪みを解析するのではなく、画像全体をまとめて動かします。

## 入力

| 端子 | データ | 接続するもの |
| --- | --- | --- |
| **Left Input**（オレンジ） | 2D Image | 左眼の画像。Stack Modeによっては、左右が並んだ1枚の画像をここに入力します。 |
| **Right Input**（緑） | 2D Image | 右眼の画像。**Stack Mode: Separate**のときに表示されます。 |

左右が別ファイルなら、同じ時刻のフレームをそれぞれLeft InputとRight Inputへ接続します。あらかじめ左右を1枚にまとめている素材では、Stack Modeをその画像の並び方と合わせる必要があります。

これらは通常の**2D画像**の入力です。Camera 3Dや3D Sceneを受け取る端子ではありません。基本的なデータの意味は[画像（Image）](../../learn/02-data/image.md)を参照してください。

## 出力

Global Alignには、左右眼それぞれの画像出力があります。

- **Left Output**：位置合わせ後の左眼画像。
- **Right Output**：位置合わせ後の右眼画像。Manualでは、Stack ModeがSeparateのときに現れると説明されています。

Separateを使えば、2つの出力を後段のDisparityへ個別に接続できます。左右を1枚にまとめる別のStack Modeでは、具体的な出力の配置や寸法を実際の画像形式に合わせて確認してください。画像出力であり、3D Materialや奥行きデータへ変換する出力ではありません。

## 主な設定項目

### Translation X and Y：画像を横・縦に移動する

**X**で水平方向、**Y**で垂直方向の位置差を調整します。たとえば片眼の人物の目が上へずれているなら、Yを動かして左右の目の高さをそろえます。

**Balance**は、指定した移動をどちらの眼に適用するかを決めます。

| Balance | 動作 |
| --- | --- |
| **None** | 移動を適用しません。 |
| **Left Only** | 左眼だけを移動します。 |
| **Right Only** | 右眼だけを移動します。 |
| **Split Both** | 左眼と右眼を互いに反対方向へ移動します。 |

片方を基準に固定したいときはLeft OnlyかRight Only、両方に移動量を分けたいときはSplit Bothを使います。

**Snap to Nearest Pixel**を有効にすると、移動量を整数画素にそろえます。画素の中間位置へ動かすと画像を補間する必要があり、輪郭がわずかにぼける場合があるためです。細かな位置調整が必要なら、スナップの有無による違いも確認します。

### RotationとAngle：傾きを合わせる

**Rotation**のBalanceにも、None／Left Only／Right Only／Split Bothがあります。画像全体を回転させる対象を選び、**Angle**で回転角度を指定します。

Manualの例では、Left OnlyまたはRight Onlyで10度を指定すると片眼へ10度の回転がかかります。一方、**Split Bothで10度**の場合は、一方を−5度、もう一方を＋5度回します。両眼の間にある傾きの差を、それぞれへ分配する考え方です。

背景の水平線が片眼だけ斜めになっている素材で有効です。ただし、レンズ歪みのように画像の場所によって曲がり方が異なる問題は、画面全体の回転だけでは修正できません。

### Translation Filter Method：移動時の補間

画像を移動した結果、元の画素の間の値を求めるときに使うフィルターの選択項目です。輪郭や細い線の見え方を比較して選びます。

21.1 Manualにはこのメニューの役割が記載されていますが、**全選択肢の名称は列挙されていません**。未確認のフィルター名、初期値、数値範囲はここでは補いません。

### Visualization：左右の輪郭を確認する

左右の画像を異なる色で表示して、対応する輪郭のずれを見つけやすくします。位置合わせの途中で[Anaglyph](./anaglyph.md)などを追加せずに左右を比較できます。

**完成映像へ出す前にはNoneに戻します。** 色分け表示を最終結果へ残さないためです。

### Stack ModeとSwap Eyes：左右眼の受け渡し

**Stack Mode**は、左右眼を別々の画像で扱うか、1枚に並べた画像で扱うかを指定します。**Separate**ではRight InputとRight Outputが現れ、左右を独立して接続できます。

**Swap Eyes**は、結合された画像形式で左眼と右眼の割り当てを交換するための項目です。左右を入れ替えても、カメラ位置のずれや視差量が自動で修復されるわけではありません。

## 主な用途

- **左右カメラの高さの差を整える**：人物の目や建物の線が上下にずれているとき、Y移動で大きなずれを減らします。
- **カメラの傾きの差を整える**：片眼だけ水平線が傾いている場合にRotationとAngleを調整します。
- **視差解析の前処理**：Disparityで左右の対応点を計算する前に、全体のずれを減らします。
- **左右の割り当てを確認する**：Visualizationで輪郭を見比べ、左右が逆ならSwap Eyesや配線を確認します。

## 最小構成

別々の左右映像を使う基本例です。

~~~text
左眼画像 ── Left Input  ─┐                ┌─ Left Output  ─┐
                          ├─ Global Align ─┤                ├─ Disparity
右眼画像 ── Right Input ─┘                └─ Right Output ─┘
             Stack Mode: Separate
~~~

1. 同じ時刻を写した左右眼の画像を用意します。
2. Global Alignを追加し、**Stack Mode: Separate**にして左右へ接続します。
3. 片方を基準にする場合はTranslationのBalanceをLeft OnlyかRight Onlyに設定します。
4. Visualizationで重なりを確認し、X/Yを調整して画像全体のずれを減らします。
5. 水平線の傾きが合わなければRotationのBalanceとAngleを調整します。
6. Visualizationを**None**に戻し、左右の出力をDisparityへ渡します。

これはManualの接続例に基づく操作案であり、今回実機でレンダリングして確認した結果ではありません。

## 運用例：人物を撮影した2台のカメラを合わせる

右眼カメラの映像だけ人物の顔が少し上に写り、背景の水平線もわずかに傾いている場合を考えます。

まずTranslationのBalanceを**Right Only**にしてYを動かし、人物の両眼の高さを近づけます。続いてRotationもRight Onlyとし、Angleで背景の傾きを補正します。Viewerで輪郭の重なりを見ながら、画像の外周が欠けていないかも確認します。

大きなずれが減ったらVisualizationをNoneにし、[Disparity](./disparity.md)で左右の対応点を計算します。髪・手・背景など、画面内の場所によって残るずれが違う場合は、Global Alignの移動・回転だけで無理に合わせず、視差を使う[Stereo Align](./stereo-align.md)などの後段処理を検討します。

## 挙動と注意点

- **画像全体のずれだけを扱う**：Global Alignは光学フローを使わないため、局所的な変形や異なる奥行きの被写体を別々に補正するNodeではありません。
- **画面端の欠けに注意**：移動・回転によって元の画像外の領域が現れても、存在しない撮影情報を復元することはできません。
- **色合わせは別の作業**：ManualはDisparityの前に左右の色を合わせることも推奨します。ただしGlobal AlignのControlsに専用の色補正項目があるとは記載されていないため、必要な色補正は別途行います。
- **作業順序に意味がある**：大まかな位置合わせはGlobal Align、画素単位の視差を利用する処理はStereo Align、左右画像を単に横・縦へまとめる場合は[Combiner](./combiner.md)と使い分けます。
- **左右の同期は修正しない**：Swap Eyesや移動量を調整しても、左右の撮影時刻や画角そのものは一致しません。

## 関連する考え方・関連Node

- [画像（Image）](../../learn/02-data/image.md)：2D画像のデータの基本。
- [Disparity](./disparity.md)：左右の対応位置の差を計算するNode。
- [Stereo Align](./stereo-align.md)：光学フローを利用する、より細かな立体映像の調整。
- [Combiner](./combiner.md)／[Splitter](./splitter.md)：左右眼をまとめる・分離するNode。
- [Anaglyph](./anaglyph.md)：左右眼を色分けする表示用Node。
- [Stereo 3Dノード一覧](./index.md)：Stereo系Node全体の選び分け。

## バージョンと検証状況

**出典：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 118「Stereo Nodes」、Global Align [GA]、pp.2784–2786。** Studio限定、左右の入出力、Disparity前段への配置、Translation X and Y、Balance、Snap to Nearest Pixel、Rotation、Angle、Translation Filter Method、Visualization、Stack Mode、Swap Eyesは、この資料に基づきます。

**verification: partial**：21.1実機での表示と画質、Stack Modeの全選択肢と出力画像構造、Translation Filter Methodの全選択肢、内部REGID、各パラメータの初期値・数値範囲は未確認です。
