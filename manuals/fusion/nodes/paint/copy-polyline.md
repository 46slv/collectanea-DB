---
title: "Copy Polyline"
description: "Paint内部で自由な閉じた輪郭を作り、別の位置・画像の画素をコピーする描画要素。Source、Fill Type、Offset、編集と補修例を解説。"
doc_type: node
term_id: copy-polyline
term_short: "Paintの中で閉じた自由形状の範囲を作り、別の場所や画像の画素を複製する要素。独立したFlowノードではない。"
verification: partial
aliases: [Copy Polyline]
concepts: [paint, image-data]
nodes: [Copy Polyline]
node_family: paint
inputs: []
outputs: []
tasks: [paint, cleanup, clone]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-24"
---

# Copy Polyline（Paintの自由形状コピー）

Copy Polylineは[Paint](./paint.md)の内部で4点の閉じた輪郭を作り、その内側へ別の位置の画素を複製する描画要素です。マーカーのない壁の模様を選び、マーカーの上へ重ねるような補修に使います。FlowではPaintの画像出力を後段へ渡します。

## 入力とコピー元

描画先の画像をPaintのInputへつなぎ、Paintの出力をMediaOutなどへ渡します。PaintのEffect Maskは処理範囲を制限する入力です。

~~~text
Loader / MediaIn → Paint → MediaOut
~~~

21.1 Manual Chapter 80のShape Drawing Tools節は、Copy系の形状について、元ノードをPaintへ接続し、Fill TypeをImageにするよう説明しています。下の実機例ではLoaderをPaintのInputにつなぎ、Inspectorの「塗りつぶしの種類」を「イメージ」にした状態で、同じ入力画像内からコピーできました。

Inspectorの「ソース」はX／Y座標です。Clone Apply Modeで使うSource Tool欄と同一の項目として扱わないでください。この実機例では、Copy要素にも親Paintにも別画像を指定するSource Tool欄は表示されていません。別ノードの画像を透明Background上へ複製する手順は未確認です。

## 実機例：4点の範囲へ別位置の画素をコピーする

<!-- capture-case:S92 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%で撮影しました。左がLoaderの入力チャート、右がPaintの画像出力です。

[![LoaderをPaintへつなぎMediaOutへ渡す実機Graph、Copy PolylineはPaint内部に保持](/img/fusion/captures/S92/graph.png)](/img/fusion/captures/S92/graph.png)

[![実機Copy PolylineのInspector、塗りつぶしの種類はイメージ、SourceのXとYを表示](/img/fusion/captures/S92/inspector.png)](/img/fusion/captures/S92/inspector.png)

ViewerのCopy Polylineを選び、赤いパッチの上に4点を置いて最初の点を再クリックし、輪郭を閉じました。保存GraphでもClosedと4つのLinear点を確認しています。Sourceは初期の0.5／0.5からX0.875／Y0.5へ変更しました。

[![フレーム0、左は入力、右はCopy Polylineで赤いパッチへ別位置の画素を複製した実機出力](/img/fusion/captures/S92/compare.png)](/img/fusion/captures/S92/compare.png)

右の赤いパッチの内側へ、緑や青など入力画像の別の位置の画素が入りました。白の単色を塗ったRectangleとは異なる結果です。

[![フレーム119でもCopy Polylineによる複製が残っている実機出力比較](/img/fusion/captures/S92/frame119.png)](/img/fusion/captures/S92/frame119.png)

フレーム0と119の両方で複製が残り、最後は0へ戻して保存しました。全120フレームを個別に検査した例ではありません。描画要素は`CopyPolyLine1`、内部REGIDは`CopyPolyLine`、Apply Modeは`PaintApplyStamp`でした。Flowに見えるノードはLoader・Paint・MediaOutの3つです。

[再現用Graph](/img/fusion/captures/S92/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S92/capture.json)

## 輪郭・参照位置・期間を調整する

Copy Polylineは点をクリックして自由な輪郭を作れます。ManualではInsert、Modify、Smooth／Linear、Shape、Reduce、Doneなどの編集操作も説明されています。今回の実機例で確認したのは4点の作図と閉鎖までです。

ManualはCopy系の参照位置をOffsetとして説明し、アニメーション可能としています。今回の実機Inspectorでは「ソース」と表示され、Source座標の変更で複製結果を確認しました。参照位置を変えるときは、模様や明暗が補修先の周囲につながるか、Paintの出力で確認します。

Copy系の形状は既定でコンポジション全体に表示され、ManualではKeyframes Editorによる期間変更も説明されています。今回の実機例では期間の短縮・延長、参照位置や輪郭のアニメーション、Tracker接続、Time Offsetは未確認です。

## 使い分け

[Circle](./circle-stroke)や[Rectangle](./rectangle)は色で覆う描画に、[Clone Multistroke](./clone-multistroke)はブラシで短い補修を重ねる操作に使います。Copy系は領域の中へ画像の画素を入れます。後段のエフェクトの適用範囲を定義する場合は[Mask](../masks/index.md)を使います。

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 80「Paint」p.1751：Copy系のShape Drawing Tools、Paintへの元ノード接続、Fill Type = Image。
- 同Chapter 113「Paint Node」pp.2638–2645：Paintの入出力、Copy系のOffsetと期間、Polyline編集、コピー元表示。

掲載したGraph、Inspector、Source変更後の出力、フレーム0／119を実機確認しました。別ノードからのコピー、透明Background上へのコピー、個々の編集操作、全既定値・値域、実写の補修、筆圧、Free／Studio差、他OSと性能は未確認のため、`verification: partial`を維持します。
