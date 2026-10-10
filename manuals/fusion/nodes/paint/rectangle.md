---
title: "Rectangle（Paint）"
description: "Paint内部のRectangleで矩形の塗りを描く方法。画像入出力、表示期間、Copy RectangleやRectangle Maskとの違いを解説。"
doc_type: node
term_id: paint-rectangle
term_short: "Paintノードの内部で四角い領域を描く要素。画像のコピーやMask出力を行う独立Flowノードではない。"
verification: partial
aliases: [Paint Rectangle, Rectangle Paint]
concepts: [paint, image-data]
nodes: [Rectangle]
node_family: paint
inputs: []
outputs: []
tasks: [paint, animate]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Rectangle（Paintの矩形描画）

**Rectangleは、[Paint](./paint.md)の中で四角い描画領域を作るツール**です。映像の一部を色で覆う、タイトルの背景に帯を置く、画面上に四角い目印を表示するといった作業に使います。塗りの範囲を後から編集でき、表示する時間も変更できます。

DaVinci Resolve 21.1 Reference Manualでは、Paintツールバーの描画要素として**Rectangle**と記載されています。これはFlowに単独配置するノードではありません。また、[Copy Rectangle](./copy-rectangle)は画像の別の場所から画素を複製するツールであり、単純な色付きRectangleとは目的が異なります。

## 入力と出力

Rectangle自身にFlowの接続端子はありません。画像を受け取り、描画結果を出力するのは親のPaintノードです。

- **PaintのInput（オレンジ）**：必須の2D画像。MediaInなどの映像を直接入れるか、透明なBackgroundをキャンバスとして入れます。入力画像の解像度が描画領域の基準になります。
- **PaintのEffect Mask（青）**：別のMaskを任意で接続し、Paintの効果が出る範囲を制限します。Rectangleの図形データを出力する端子ではありません。
- **Paintの出力**：矩形の塗りを反映した2D画像。MergeやMediaOutなどの画像入力へ接続します。

映像へ直接描く場合の接続は次のとおりです。

~~~text
MediaIn → Paint（内部でRectangleを描く）→ MediaOut
~~~

矩形を色で描くだけなら、Paintの**Source Toolへコピー元画像を指定する必要はありません**。これはコピー用の描画要素と区別するポイントです。

## Rectangleの作成と編集

1. FlowでPaintを配置し、MediaInまたはBackgroundの2D画像をオレンジ入力へ接続します。
2. Paintを選択し、Viewer上部のPaintツールバーで**Rectangle**を選びます。
3. Viewer上で矩形の範囲を作成します。色を描く目的なら、Inspectorの**Apply Mode**でColorを選び、色を設定します。
4. 描き終えたらPaintツールバーの**Select**を選び、作成した矩形を選択し直します。各描画要素はInspectorの**Modifiers**タブに並び、後から設定を変更できます。
5. 矩形を表示したい区間が決まっている場合は、**Keyframes Editor**で要素の表示期間を調整します。

21.1 Manualで明記されているRectangleの初期表示期間は**コンポジション全体**です。初期状態では、作成したフレームだけでなく、ほかのフレームにも描画が残ります。特定の数秒間だけ帯を出したい場合は、表示期間を区切ってください。

**表示期間の編集と矩形の形状編集は別の操作**です。前者はいつ表示するか、後者は画面のどこを覆うかを決めます。矩形固有のInspector項目名、寸法の数値範囲、各パラメータのキーフレーム化手順は21.1 Manualの該当記述だけでは確定できないため、ここでは推測しません。

## 制作例：字幕の背後に半透明の帯を置く

映像の下部に字幕を載せたいものの、背景が明るく文字を読み取りづらい場合を考えます。矩形だけを独立した合成レイヤーにすると、映像を直接塗りつぶさずに済みます。

~~~text
Background（映像と同じ解像度、Alpha 0）→ Paint ─→ MergeのForeground
MediaIn ─────────────────────────────────────→ MergeのBackground
Merge → MediaOut
~~~

1. 映像と同じ解像度のBackgroundを作り、**Alphaを0**にして透明にします。
2. BackgroundをPaintへ入力し、Paintの出力をMergeのForegroundへつなぎます。MediaInはMergeのBackgroundへ接続します。
3. Paint内部のRectangleで字幕を置く範囲に横長の帯を描き、Colorと不透明度を調整します。
4. Mergeの出力で帯と映像の重なりを確認します。文字は必要に応じて別のText+などで合成します。
5. 帯を字幕のある区間だけ表示するなら、Keyframes EditorでRectangleの表示期間を指定します。

この構成では矩形の塗りが映像とは別レイヤーなので、Merge側で合成量を調整できます。なお、**Colorで描くRectangleは画素の質感を復元しません**。看板やマーカーを消すために、周囲の壁や布地の模様を複製したい場合はCopy Rectangleを選びます。

## 制作例：画面上の一部分を一時的に覆う

映像内の情報を四角い色面で隠す用途では、MediaIn → Paintの構成でRectangleを対象位置に作成します。画面上で隠したい範囲より少し広く矩形を取り、必要な表示区間をKeyframes Editorで指定します。

ただし、対象がカメラ移動などで位置を変える場合、**Rectangleを置いただけで自動追従はしません**。位置合わせが必要なフレームを確認し、追跡結果との接続は別途検討してください。映像の隠れた部分を自然に復元する処理でもありません。

## 似たツールとの違い

| ツール | 何が変わるか | 選ぶ場面 |
| --- | --- | --- |
| **Rectangle（本記事）** | Paintが2D画像へ四角い色の領域を描く | 帯、目印、色面による一時的な覆い |
| [Copy Rectangle](./copy-rectangle) | Source Toolなどの画像から画素を矩形内へ複製する | 壁のラベルを模様ごと覆う |
| [Circle](./circle-stroke) | 中心・半径を指定した円形をPaintに描く | 丸い目印や円の拡大 |
| [Rectangle Mask](../masks/rectangle-mask) | 別ノードの効果を制限する単一チャンネルのマスクを作る | BlurやColor補正の対象範囲を四角く限定する |
| [Copy Polyline](./copy-polyline) | 自由形状の内側へ画像の画素を複製する | 四辺が直線ではない不要物の補修 |

PaintのRectangleを作っても、Shapeノード群のShapeデータや独立したMask出力が生まれるわけではありません。画像とマスクの違いは[Image](../../learn/02-data/image)・[Mask](../../learn/02-data/mask)、Paintの描画要素全体の選び方は[カテゴリ概要](./index.md)を参照してください。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）を参照。

- Chapter 80「Paint」pp.1747–1751：必須の画像キャンバス、透明BackgroundをMergeする構成、描画要素の種類と後編集。
- Chapter 113「Paint Node」pp.2638–2640：PaintのInput／Effect Mask、Rectangleという正式な描画要素名、全期間表示とKeyframes Editorでの期間変更。
- Chapter 113 pp.2642–2645：Controls／Modifiers、Color Apply Mode、描画要素の選択と変更。

この記事は**21.1 Manualで確認できたPaint内部のRectangle**を対象とします。独立したFlowノードの存在、矩形専用の内部ID、Inspectorの全パラメータ名・既定値・値域、Free／Studio差、実機のキー操作については検証済みと扱わず、`verification: partial`を維持しています。
