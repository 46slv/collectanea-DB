---
title: "Copy Rectangle"
description: "Paint内部で矩形の範囲に別位置・別画像の画素を複製する要素。コピー元、Offset、表示期間と補修手順をResolve 21.1基準で解説。"
doc_type: node
term_id: copy-rectangle
term_short: "Paint内で四角く指定した範囲へ、別の位置や画像の画素をコピーする描画要素。独立したFlowノードではない。"
verification: partial
aliases: [Copy Rectangle, Copy Rect]
concepts: [paint, image-data]
nodes: [Copy Rectangle]
node_family: paint
inputs: []
outputs: []
tasks: [paint, cleanup, clone]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Copy Rectangle（Paintの矩形コピー）

**Copy Rectangleは、[Paint](./paint)の内部で四角い領域を指定し、元画像の別の位置や別画像の画素をそこへコピーする描画要素**です。例えば、壁に貼られた小さな長方形のラベルを消す場合、ラベルのない壁の模様を矩形の範囲に移して覆えます。単色で塗るのと違い、元の明暗や模様を利用して補修できます。

DaVinci Resolve 21.1 Reference Manualでは、Paintのツール一覧に**Copy Circle/Rectangle**、ショートカットの節に**Copy Rect/Ellipse**という表記があります。本記事はそのうち矩形のコピー範囲を扱います。「Copy Rectangle」という独立したFlowノードが存在するという意味ではありません。

## 入力と出力

Copy Rectangleは**Paint内部の描画要素であり、自分専用のFlow端子を持ちません**。画像を受け渡すのは親のPaintノードです。

- **PaintのInput（オレンジ）**：必須の2D画像入力。映像そのものか、別レイヤーとして描画するための透明なBackgroundを接続します。入力画像の解像度が作業キャンバスの大きさになります。
- **PaintのEffect Mask（青）**：任意のマスク入力。Paintの適用範囲を制限します。Copy Rectangleがコピーする画像の参照元ではありません。
- **複製元画像**：Paintの入力画像をそのまま参照するか、別の画像ノードをPaintの**Source Tool**に指定します。コピー形状では**Fill TypeをImage**に設定します。
- **Paintの出力**：矩形内のコピー結果を描き込んだ2D画像。後段のMerge、Color系ノード、MediaOutなどへ接続できます。

接続例は次のとおりです。Copy RectangleをPaintの後段に別ノードとして置くわけではありません。

~~~text
MediaIn → Paint（内部でCopy Rectangleを作成）→ MediaOut
~~~

### コピー元と描画先は別の役割

Paintは通常、入力に接続した画像をクローン元として利用します。別画像や別時刻の画像を明示的に参照したいときは、InspectorのSource Toolで参照ノードを指定します。

特に**透明なBackgroundをPaintの入力にする場合**は、透明な画素を複製しても映像の補修にはなりません。修正対象のMediaInなどをSource Toolへ指定してください。MergeのBackgroundへMediaInをつないだだけでは、PaintのSourceが自動でその映像へ切り替わるわけではありません。

## 矩形コピーの作り方と編集

### Fill TypeとOffset

21.1 Manual Chapter 80の「Shape Drawing Tools」では、Copy系の形状は**画像を複製元として接続し、Fill Type = Image**にするよう説明されています。これが色付きのRectangleとの違いです。

**Offset**は、コピー元画像のどの場所の画素を矩形へ持ってくるかを調整する値です。矩形を覆いたい不要物の位置に置き、Offsetを変えてきれいな画素が収まる場所を探します。21.1 ManualではCopy Circle/RectangleのOffsetをアニメーション可能としています。

矩形の位置と大きさはViewerで作成・編集できます。ショートカット一覧には、Copy Rect/Ellipseを**Shiftを押しながらドラッグすると形状が制約される**操作が記載されています。制約の細かな挙動や矩形固有のInspector名称・数値範囲は実機未確認のため、ここでは固定しません。

### 表示期間

Copy Rectangleの初期表示期間は**コンポジション全体**です。1フレームの補修だけが必要なら、**Keyframes Editorでその描画要素の表示期間を短く**します。これはOffsetを変えて別の画素を取る操作とは独立しています。

[Clone Multistroke](./clone-multistroke)は初期表示が1フレームで描画後の個別編集もできません。一方、Copy RectangleなどのShape Drawing Toolsは、作成後に形状を編集でき、表示期間もKeyframes Editorで調整できます。繰り返し位置合わせをする補修に向きます。

## 制作例1：壁に貼られた矩形ラベルを隠す

撮影した壁に小さなラベルが写り、その横には同じ材質・明るさの壁があるとします。

1. **MediaIn → Paint → MediaOut**を接続し、Paintの出力をViewerに表示します。
2. Paintのツールバーで矩形のCopy系描画を選び、ラベル全体を覆う範囲を作ります。必要以上に広く取らず、四辺付近の模様も見ながら調整します。
3. Copy形状の**Fill TypeをImage**に設定します。別の画像をコピーしたい場合は、PaintのSource Toolへその画像ノードを指定します。
4. **Offset**を調整し、ラベルのない壁の画素を矩形内へ移します。壁の目地やグラデーションがつながる位置を探します。
5. 数フレーム進めて、コピーした模様が不自然に動かないか確認します。必要なら矩形の位置とOffsetをアニメーションさせます。
6. ラベルが現れる区間だけの補修なら、Keyframes Editorでコピー要素の表示期間を指定します。

この補修は**周辺の画素をコピーする処理**であり、ラベルの向こう側を推定して復元する機能ではありません。壁に遠近が付く、カメラが動く、光が変化する場合は、矩形の移動だけでは境界や模様がずれることがあります。

## 制作例2：補修を透明レイヤーに分ける

後から補修の合成量を変えたい場合は、コピーした画素だけを別レイヤーに描きます。

~~~text
Background（同じ解像度、Alpha 0）→ Paint ─→ MergeのForeground
MediaIn ─────────────────────────────────→ MergeのBackground
   └─────────→ PaintのSource Toolにも指定
Merge → MediaOut
~~~

1. 修正対象の映像と同じ解像度で、**Alphaを0**にしたBackgroundを作ります。
2. BackgroundをPaintのInputへ接続し、Paintの出力をMergeのForegroundへ、MediaInをMergeのBackgroundへつなぎます。
3. **PaintのSource ToolにMediaInを指定**し、Copy RectangleのFill TypeをImageにします。
4. Viewerで矩形を作り、Offsetでコピー元の画素を合わせます。
5. Mergeの出力で継ぎ目を確認します。Mergeの合成量を調整する場合も、コピーした位置と透明部分のAlphaが意図どおりか確認します。

透明Backgroundを使う構成は21.1 ManualのPaint章に記載されています。Copy Rectangleを使って矩形の補修だけを分けるのは、その構成を応用した制作例です。

## 似た描画要素との使い分け

- [Copy Ellipse](./copy-ellipse)：円・楕円の範囲から画素を複製します。丸いマーカーや、四隅のない補修範囲に向きます。
- [Copy Polyline](./copy-polyline)：自由な輪郭を制御点で囲んで複製します。曲がった境界や斜めの輪郭を細かく合わせたい場合に使います。
- [Circle](./circle-stroke)：円形の色や塗りを描く要素であり、別の位置の画素をコピーするものではありません。
- [Clone Multistroke](./clone-multistroke)：多数の小さなブラシ補修を素早く行いますが、描いた個々の線は後から編集できません。
- [Paint Group](./paint-group)：複数の描画要素をまとめて移動・調整するときに使います。

Copy Rectangleは**「矩形領域へ何を複製するか」**を決めるPaint内部の操作です。別ノードの処理範囲を制限するMask Rectangleとは、出力するデータと接続先が異なります。Paint全体の選び方は[カテゴリ概要](./overview)を参照してください。

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 80「Paint」pp.1748–1751：Paintの画像入力、Source Tool、Shape Drawing Tools、Copy系の**Fill Type = Image**と後編集。
- 同Chapter 113「Paint Node」pp.2638–2640：Input／Effect Mask、透明Backgroundの構成、Copy Circle/Rectangleの**animatable Offset**と全期間表示。
- 同Chapter 113 pp.2645：Copy Rect/Ellipseの**Shift＋ドラッグ**操作。
- 同Chapter 80 p.1766：Paintは通常Input画像をクローン元に利用し、別のノードをSource Toolに指定できる説明。

このページの図と操作手順は上記Manualの説明を組み合わせた制作例です。**Resolve 21.1実機でのツールバーの正確な表記、内部REGID、矩形固有のInspector全項目・初期値・範囲、Edition差は未検証**のため、`verification: partial`を維持します。
