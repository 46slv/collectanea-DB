---
title: Polyline Stroke
description: Paint内で制御点を置いて描く線。既存のPathやMaskの輪郭を使った描画・Write Onにも対応。
doc_type: node
term_id: polyline-stroke
term_short: Paintの中で制御点を置いて経路を作り、ブラシで線を描く編集可能なストローク。
verification: partial
aliases: [Polyline Stroke]
concepts: [paint, image-data]
nodes: [Polyline Stroke]
node_family: paint
controls: [Click Append, Draw Append, Insert, Modify, Closed, Smooth, Linear, Shape Animation, Stroke Animation, Write On, Publish, Roto Assist]
inputs: []
outputs: []
tasks: [paint, animate, cleanup]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Polyline Stroke

Polyline Strokeは、**画像上に点を置いて経路を作り、その経路に沿ってブラシの線を描く機能**です。マウスを動かした軌跡を描く[Stroke](./stroke)とは違い、まず線の曲がり方を制御点で決めます。作成後も制御点を動かして線の形を変えられ、描画の進行をアニメーションにできます。

独立したFusion Flowノードではなく、**[Paintノード](./paint)内部の描画要素**です。Paintを選んだとき、Viewer上部の描画ツールから使用します。名前にPolylineが付いていても、MaskノードやShape系ノードの入出力と同じものではありません。

## 入力と出力

Polyline Stroke自体にはFlow上の独立した端子はありません。画像を処理するのは親のPaintノードです。

- **PaintのInput（オレンジ）**：描画先になる2D画像を接続します。この画像の大きさが描画キャンバスの基準になります。
- **PaintのEffect Mask（青）**：任意のマスクを接続すると、Paintの処理範囲を制限します。
- **Paintの出力**：Polyline Strokeで描いた結果を含む2D画像。MergeやMediaOutなどへ渡せます。

映像へ直接描くなら、接続は次のとおりです。

```text
MediaIn → Paint → MediaOut
           └─ Paint内部でPolyline Strokeを作成
```

元映像と描画を分けたい場合は、透明なBackground（Alpha 0）をPaintへ接続し、その出力をMergeのForegroundへ、映像をBackgroundへ接続します。線を色で描く用途ではClone元画像は不要ですが、別の画像の画素を複製するときは参照元を指定します。

## 制御点から線を描く

1. PaintをFlowに置き、MediaInかBackgroundなどの2D画像を入力へ接続します。
2. Paintを選び、Viewer上部のPaintツールバーから**Polyline Stroke**を選択します。
3. 既定の**Click Append**でViewerをクリックし、始点と続く制御点を配置します。
4. Inspectorの**Brush Shape**で筆先を選び、**Size**や**Softness**などを調整します。
5. 描き終えたらPaintツールバーの**Select**に切り替えて線を選びます。作成したストロークはInspectorの**Modifiers**タブにも表示され、後から個別に編集できます。

Polyline Strokeは最初から点編集に対応します。[Stroke](./stroke)を点編集できる状態に変えるための**Make Editable**は、Polyline Strokeの作成時には不要です。

### Viewerの編集ツール

Polyline Strokeを作ると、Viewerに経路編集用のツールバーが現れます。主な機能は次のとおりです。

| ツール | 何が変わるか |
| --- | --- |
| Click Append / Draw Append | 点を一つずつ置くか、フリーハンドで経路を伸ばします。 |
| Insert / Modify | 点を追加するか、既存の点を移動・調整します。Modifyでは誤って点を増やしにくくなります。 |
| Done | 点の追加・個別編集を止めます。経路全体の移動・回転は可能です。 |
| Closed | 開いた経路を閉じます。 |
| Smooth / Linear | 選択した点や線分を滑らかな曲線／直線的な形へ切り替えます。 |
| Keys / Handles | 制御点やベジェハンドルの表示を切り替えます。 |
| Shape | 選択した点群を操作枠でまとめて変形します。 |
| Delete / Reduce | 点を削除するか、自由描画などで増えた点数を減らします。 |
| Publish / Follow Points | 経路や点を別の制御から参照できるようにし、公開された点へ別の点を追従させます。 |

**Roto Assist**は制御点を画像のコントラスト境界へ吸着させる補助機能です。輪郭をなぞるときに便利ですが、意図しないエッジへ吸着していないかViewerで確認します。

## 既存のPathやMaskを線として使う

Polyline Strokeは、Viewerで新しく点を打たずに、**公開済みのモーションパスやMaskのポリライン形状を参照**できます。ここでいう「公開」は、パラメータの経路を別のパラメータから参照可能にする操作です。

1. 参照元のMaskまたはモーションパスを作り、必要な経路を公開します。
2. Paint内でPolyline Strokeを選択します。
3. Inspectorの**Stroke Controls**下部にある**Shape Animation**ラベルを右クリックし、**Connect To**から公開済みの経路を選びます。
4. Paint側でブラシの太さ、色、表示のタイミングを設定します。

これにより、**既存の輪郭を塗りつぶすのではなく、その輪郭に沿って線を描く**用途に使えます。SVGから読み込んだ経路の外周へ線を描く表現も、参照できる経路を用意すれば同じ考え方です。SVGの読み込み方や、読み込んだ要素をどのように公開できるかは別途確認してください。

## 表示期間とWrite On

Polyline Strokeは既定でコンポジション全体に表示されます。短い区間に限る場合は**Keyframes Editorでストロークの表示期間を変更**できます。描画後の個別編集ができない[Multistroke](./multistroke)とは、この点でも異なります。

Inspectorの**Stroke Animation**にはAll Frames、Limited Duration、Write On、Write Off、Write On Then Off、Trailがあります。

- **Write On**：経路の始点側から終点側へ線を出現させます。
- **Write Off**：終点側から始点側へ線を出現させます。
- **Write On Then Off**：現れた線を続けて消します。
- **Trail**：線分の始点と終点を時間差で動かし、短い線が経路を進むように見せます。

Write On / Write Offでは**StartとEndで経路上の表示範囲**を調整できます。例えばEndを0から1へキーフレームで変化させると、線が始点から終点へ伸びます。速度はSpline EditorやKeyframes Editorで調整します。

## 具体的な運用例

### 映像の上に手描き風の矢印を出す

透明Background → Paint → MergeのForeground、MediaIn → MergeのBackgroundという構成にします。Paint内のPolyline Strokeで矢印の軸となる経路を作り、Apply ModeをColorにして色と太さを設定します。**Write OnのEndを時間とともに増やす**と、矢印の線が描かれていく演出になります。

線の曲がり方はViewerの制御点で修正できます。矢印の先端など別の形状は、必要に応じて独立したストロークを重ねます。

### MaskやSVGの輪郭をアニメーションでなぞる

製品の外周に沿って線が現れる演出では、外周を表すポリラインをMaskや読み込んだ経路として用意します。その経路をPolyline StrokeのShape Animationへ接続し、Write Onで表示を進めます。

**Maskは領域を切り抜くためのデータ、Polyline Strokeはその境界に線を描く要素**です。役割が違うため、同じ輪郭を利用しても結果は異なります。対象が動く場合は、参照元の経路アニメーションとPaintの出力を照合します。

### 動く被写体に短い線を追従させる

対象の近くにPolyline Strokeで線を作り、ストロークのCenterへTracker由来の位置を連携します。Centerを追跡しても画像内の局所的な変形まで自動で一致するわけではないため、必要に応じて経路の制御点も調整します。

## 関連要素と注意点

- [Stroke](./stroke)：自由に線を描く。後からMake Editableで制御点を編集できます。
- [Copy Polyline](./copy-polyline)：閉じた領域を使い、別の場所・画像の画素を複製する用途。輪郭に沿う線を描くPolyline Strokeとは目的が異なります。
- [Multistroke](./multistroke)：大量の短い補修に向く方式。描画後の個別の線編集はできません。
- [Paint Group](./paint-group)：複数のストロークをまとめて移動・追従させます。
- [Paintの概要](./)：Paint内部の要素全体を比較できます。

制御点は追加できますが、細かな手ぶれまで大量の点として残すと調整しにくくなります。Draw Appendで作った経路の点が多すぎる場合は、**Reduce**で点数を減らしてから形を整えます。

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 80「Paint」pp.1749–1750、1756–1759：Strokeとの違い、Path接続、Modifiers、Write On、追跡。
- 同Chapter 113「Paint Node」pp.2638–2645：Paintの2D画像／Effect Mask入力、Polyline Stroke、Viewer編集ツール、Inspectorのブラシ／ストローク設定。

操作名と機能の関係は上記マニュアルに基づきます。**21.1実機のREGID、端子内部ID、全設定の初期値、SVGごとの接続可否は未検証**なので、verificationはpartialのままです。
