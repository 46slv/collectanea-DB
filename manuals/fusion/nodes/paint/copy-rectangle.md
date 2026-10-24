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
updated: "2026-10-24"
---

# Copy Rectangle（Paintの矩形コピー）

Copy Rectangleは[Paint](./paint.md)の内部で矩形の範囲を作り、別の位置の画素をそこへ複製する描画要素です。壁に貼られた長方形のラベルを、近くの壁の画素で覆うような補修に使います。FlowではPaintの画像出力を後段へ渡します。

## 入力とコピー元

描画先の画像をPaintのInputへ接続し、Paintの出力をMediaOutなどへ渡します。PaintのEffect Maskは処理範囲を制限する入力で、複製元の入力ではありません。

~~~text
Loader / MediaIn → Paint → MediaOut
~~~

21.1 Manual Chapter 80のShape Drawing Tools節は、Copy系の形状について、元ノードをPaintへ接続し、Fill TypeをImageにするよう説明しています。今回の実機では、この接続とInspectorの「塗りつぶしの種類：イメージ」で、同じ入力画像内からコピーできました。

このCopy要素の「ソース」はX／Y座標です。別画像を指定するSource Tool欄は、今回のCopy Rectangleと親Paintには表示されていません。Clone Apply ModeのSource Tool説明をそのままCopy Rectangleの操作手順へ置き換えないでください。別画像や透明Background上へのコピーは未確認です。

## 実機例：白いパッチを矩形内へコピーする

<!-- capture-case:S94 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%で撮影しました。LoaderのチャートをPaintへ入力し、Paintの画像出力をMediaOutへ接続しています。左が入力、右が描画後の画像です。

[![LoaderからPaintを経てMediaOutへ渡す実機Graph、CopyRectangleはPaint内部に保持](/img/fusion/captures/S94/graph.png)](/img/fusion/captures/S94/graph.png)

[![実機CopyRectangleのInspector、今回変更した座標と描画設定を表示](/img/fusion/captures/S94/inspector.png)](/img/fusion/captures/S94/inspector.png)

ViewerでCopy Rectangleを選び、赤いパッチの上へ矩形をドラッグしました。描画後にSourceをX0.875／Y0.3125、WidthとHeightを各0.12へ変更しています。CenterはX約0.1197916／Y約0.2777778、塗りつぶしの種類はイメージ、Angle0、Size1、Softness0、Opacity1です。

[![フレーム0、右の赤いパッチへ白いパッチとその端の暗い画素を矩形内に複製した実機比較](/img/fusion/captures/S94/compare.png)](/img/fusion/captures/S94/compare.png)

右の矩形には、白いパッチだけでなく右端の暗い画素も入っています。別の位置にある画像の画素を複製した結果で、白の単色で覆うRectangleとは異なります。

[![フレーム119でもPaint内部のCopyRectangleによる描画結果が残る実機比較](/img/fusion/captures/S94/frame119.png)](/img/fusion/captures/S94/frame119.png)

フレーム0と119で同じ結果が残ることを確認し、最後は0へ戻して保存しました。全120フレームを個別に検査した例ではありません。内部REGIDは`CopyRectangle`、描画要素は`CopyRectangle1`でした。

別画像のSource指定、透明キャンバス、反転、Softness、参照位置や形状のアニメーション、期間変更、Shiftによる形状制約、実写、筆圧、他OS・Edition差と性能は未確認です。`verification: partial`を維持します。

[再現用Graph](/img/fusion/captures/S94/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S94/capture.json)

## 位置・形状・期間

コピー先の矩形はCenter、Width、Heightで指定し、Sourceで参照位置を変えます。補修では元画像の模様や明暗が周囲とつながる位置を探します。Shiftドラッグによる形状制約や、Keyframes Editorによる期間変更もManualに記載されていますが、今回の実機例では試していません。

ManualがOffsetとして説明する参照位置はアニメーション可能です。今回確認したのは静止画像内のSource変更までで、動く対象や別時刻の画像参照を確認した例ではありません。

円形の範囲には[Copy Ellipse](./copy-ellipse)、自由な輪郭には[Copy Polyline](./copy-polyline)、ブラシで描く短いコピーには[Clone Multistroke](./clone-multistroke)を使います。

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 80「Paint」p.1751：Shape Drawing Tools、元ノードの接続、Fill Type = Image。
- 同Chapter 113「Paint Node」pp.2638–2645：Paintの入出力、Copy系のOffset・表示期間、形状制約とコピー元表示。

掲載したGraph、Inspector、Sourceと幅・高さの変更後の出力、フレーム0／119を実機確認しました。全Controlの初期値・値域や上記未確認範囲を含め、`verification: partial`を維持します。
