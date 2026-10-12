---
title: "Copy Ellipse"
description: "Paint内の楕円形コピー要素。複製元画像、Fill Type、Offset、補修例をResolve 21.1基準で解説。"
doc_type: node
term_id: copy-ellipse
term_short: "Paint内部で楕円形の範囲に別位置・別画像の画素をコピーする要素。Flow上の独立ノードではない。"
verification: partial
aliases: [Copy Ellipse, Copy Circle]
concepts: [paint, image-data]
nodes: [Copy Ellipse]
node_family: paint
inputs: []
outputs: []
tasks: [paint, cleanup]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Copy Ellipse（Paintの楕円形コピー）

**Copy Ellipseは、[Paintノード](./paint.md)の内部で楕円形の範囲を定め、別の位置や画像の画素をコピーする描画要素**です。壁の小さなマーカーを消すなら、マーカーのない壁の模様を楕円形にコピーして上から重ねます。塗りつぶしと異なり、元画像の明暗や質感を使った補修ができます。

本サイトの項目名は「Copy Ellipse」ですが、DaVinci Resolve 21.1 Reference ManualのPaintツール一覧では**Copy Circle/Rectangle**、ショートカット一覧では**Copy Rect/Ellipse**と記載されています。本記事では円・楕円形のコピー要素を扱います。実機での正確なボタン表記は未確認であり、名称の違いから別の独立ノードがあるとは推測しません。

## 入力と出力

Copy Ellipse自身には**Flow上の入力・出力端子がありません**。独立ノードではなく、親のPaint内で作成・編集する要素だからです。

- **PaintのInput（オレンジ）**：描画先の2D画像。画像サイズがPaintのキャンバスサイズになります。
- **PaintのEffect Mask（青）**：任意のマスク入力。Paintの処理範囲を制限するもので、Copy Ellipseの複製元ではありません。
- **コピー元**：PaintのInspectorにある**Source Tool**欄にMediaInやLoaderなどの画像ノードを指定します。Copy系の形状では**Fill TypeをImage**にする必要があります。
- **Paintの出力**：楕円形のコピー結果を反映した2D画像。後段のMergeやMediaOutへ渡します。

**Copy Ellipse → Mergeのような独立ノード同士の配線はできません。** Paintの出力を後段へつなぎ、Copy EllipseはPaint内部で編集します。

## どうコピーされるか

コピー要素では、**どこを覆うか（楕円の範囲）**と、**どの画像位置から画素を取るか（複製元）**を分けて指定します。楕円をマーカーの上に置き、別の位置のきれいな壁がそこに入るように調整します。

### Source Tool / Fill Type

DaVinci Resolve 21.1 Manual Chapter 80の「Shape Drawing Tools」は、Copy系の形状に対して**元になるノードの接続**と**Fill Type = Image**を要求しています。実際のPaint操作では、Chapter 80の前節にあるとおり、画像ノードをPaintのInspectorの**Source Tool**欄へ指定します。Paintの入力端子に画像をつないだだけで、Copy要素のSourceを指定したと決めつけないでください。

例えばMediaInを複製元にするなら、そのMediaInをPaintの描画先Inputへつなぐとともに、InspectorのSource Toolにも指定します。透明なBackgroundを描画先にする場合でも、複製する映像をSource Toolへ別途指定します。

### Offset、形状、期間

21.1 Manual Chapter 113では**Copy Circle/RectangleのOffsetがアニメーション可能**と説明されています。Offsetを変えると、同じ楕円形の範囲へ別の場所の画像が入ります。マーカーと重なる位置だけでなく、コピー元の模様や明暗が周囲と一致する位置を探します。

楕円形の位置や大きさはViewerで編集します。21.1 Manualのショートカット一覧には、**Copy Rect/EllipseをShift＋ドラッグで形状制約して作図**する操作があります。Mask EllipseのWidth / Height等の名称を、そのままCopy EllipseのInspector項目だと断定しないでください。

Copy Circle/Rectangleの初期表示期間は**コンポジション全体**です。数フレームだけ補修が必要な場合は、**Keyframes Editorでその要素の表示期間を変更**します。これは元画像のOffsetをアニメーションさせる操作とは別です。

## 制作例：壁のマーカーを消す

固定カメラで撮影した壁に小さなマーカーがあり、その近くに何もない同じ壁が映っているとします。

1. **MediaIn → Paint → MediaOut**を接続し、Paintの出力をViewerに表示します。
2. PaintのInspectorの**Source ToolにMediaInを指定**します。コピー元にPaintの処理後の画像を戻して循環参照させないようにします。
3. Viewer上部のPaintツールバーから円・楕円形のCopy系要素を選び、マーカーを隠す範囲を作ります。
4. **Fill TypeをImage**にします。単色しか出ない場合は、Source ToolとFill Typeを再確認します。
5. **Offsetを調整**し、マーカーのない壁の画素が楕円内へ収まるようにします。壁の目地、影、模様が不自然につながっていないか見ます。
6. 前後のフレームを再生して確かめます。必要ならOffsetや形状の位置をアニメーションし、補修が必要なフレームだけ表示期間を残します。

~~~text
MediaIn ─→ Paint（内部でCopy Ellipseを作成）─→ MediaOut
   └────────────→ PaintのSource Tool欄で指定
~~~

**Copy Ellipseを追加するだけで自動追跡されるわけではありません。** 被写体やカメラが動く場合は、コピー範囲と元の位置が適切か毎フレーム確認します。一定のOffsetで模様がずれるなら、時間に応じた調整が必要です。

## 制作例：補修だけ別レイヤーへ分ける

元映像に直接Paintを重ねたくない場合は、同じ解像度でAlphaを0にしたBackgroundをPaintの描画先にします。Paintの出力をMergeのForegroundへ、元映像をMergeのBackgroundへ接続します。

~~~text
Background（同解像度・Alpha 0）→ Paint ─→ MergeのForeground
MediaIn ────────────────────────────────→ MergeのBackground
  └────────────→ PaintのSource Tool欄へ指定
Merge → MediaOut
~~~

この構成でも**Source Toolへ元映像を指定し、Fill TypeをImageにする**必要があります。透明なBackground自体にはコピーすべき画素がありません。透明BackgroundからMergeする基本構成は21.1 Manual Chapter 113に記載されていますが、この図はCopy Ellipseに応用した制作例です。合成後はコピーした部分の輪郭が目立たないか確認します。

## 関連するPaint要素

- [Circle](./circle-stroke)：中心と半径を調整して円形領域を描きます。周囲の画素を複製する処理ではありません。
- [Copy Rectangle](./copy-rectangle)：矩形範囲で画素を複製する場合に使います。直線的なパネルの補修向きです。
- [Copy Polyline](./copy-polyline)：自由な輪郭を制御点で作り、曲がった境界などを囲んでコピーします。
- [Clone Multistroke](./clone-multistroke)：大量の小さな補修を素早く描けますが、個々の描画は後から直接編集できず、初期表示期間は1フレームです。
- [Paint Group](./paint-group)：複数の描画要素をまとめて移動・調整できます。

**Copy Ellipseは色付きの円を描くCircleとも、別エフェクトの範囲を制限するMask Ellipseとも用途が違います。** Paint全体の使い分けは[カテゴリ概要](./index.md)を参照してください。

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 80「Paint」pp.1749–1751：Paintツール分類、Shape Drawing Tools、Copy系に必要なSource／Fill Type = Image、表示期間。
- 同Chapter 113「Paint Node」pp.2638–2640：Paintの2D Image入力とEffect Mask、透明Backgroundでの合成、Copy Circle/RectangleのOffset。
- 同Chapter 113 pp.2642–2645：Paint Controls／ModifiersとCopy Rect/EllipseのShift＋ドラッグ。

本文の接続図はManualの説明を組み合わせた制作例です。**21.1実機でのCopy要素のボタン表記・内部REGID・Inspector全項目の正式名称や初期値・範囲・Free／Studio差は未検証**のため、`verification: partial`を維持します。
