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
updated: "2026-10-24"
---

# Copy Ellipse（Paintの楕円形コピー）

Copy Ellipseは[Paint](./paint.md)の内部で楕円形の範囲を作り、その内側へ別の位置の画素を複製する描画要素です。マーカーのない壁の模様を選び、マーカーの上へ重ねるような補修に使います。FlowではPaintの画像出力を後段へ渡します。

本サイトではCopy Ellipseと表記しています。21.1 Manualのツール一覧ではCopy Circle/Rectangle、ショートカット一覧ではCopy Rect/Ellipseと記載されています。今回の実機Graphでは内部REGID `CopyEllipse`を確認しました。

## 入力とコピー元

描画先の画像をPaintのInputへつなぎ、Paintの出力をMediaOutなどへ渡します。PaintのEffect Maskは処理範囲を制限する入力です。

~~~text
Loader / MediaIn → Paint → MediaOut
~~~

21.1 Manual Chapter 80のShape Drawing Tools節は、Copy系の形状について、元ノードをPaintへ接続し、Fill TypeをImageにするよう説明しています。下の実機例ではLoaderをPaintのInputにつなぎ、Inspectorの「塗りつぶしの種類」を「イメージ」にした状態で、同じ入力画像内からコピーできました。

Inspectorの「ソース」はX／Y座標です。Clone Apply Modeで使うSource Tool欄と同一の項目として扱わないでください。この実機例では、Copy要素にも親Paintにも別画像を指定するSource Tool欄は表示されていません。別ノードの画像を透明Background上へ複製する手順は未確認です。

## 実機例：白いパッチを楕円形の範囲へコピーする

<!-- capture-case:S93 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%で撮影しました。左がLoaderの入力チャート、右がPaintの画像出力です。

[![LoaderをPaintへつなぎMediaOutへ渡す実機Graph、Copy EllipseはPaint内部に保持](/img/fusion/captures/S93/graph.png)](/img/fusion/captures/S93/graph.png)

[![実機Copy EllipseのInspector、塗りつぶしの種類はイメージ、SourceのXとYを表示](/img/fusion/captures/S93/inspector.png)](/img/fusion/captures/S93/inspector.png)

Viewerで楕円形の範囲をドラッグして作り、Sourceを初期のX0.09375／Y0.3125からX0.875／Y0.3125へ変更しました。CenterはX0.09375／Y0.3125、Width約0.0520833、Height約0.0694444、Angle0、Size1、Softness0、Opacity1です。

[![ソースを表示をONにした実機画面、赤いパッチ上の楕円と右端の白い参照位置を同時に表示](/img/fusion/captures/S93/source-guides.png)](/img/fusion/captures/S93/source-guides.png)

「ソースを表示」をONにすると、右端の白いパッチに参照位置のガイドが現れます。下の出力比較ではOFFへ戻し、MediaOutを選択してガイドを外しています。

[![フレーム0、左は入力、右はCopy Ellipseで赤いパッチへ別位置の画素を複製した実機出力](/img/fusion/captures/S93/compare.png)](/img/fusion/captures/S93/compare.png)

赤いパッチ上の楕円形の範囲に、右端の白いパッチと周囲の画素が入りました。参照範囲が白いパッチの上下へ出る部分には、背景の暗い画素も含まれます。

[![フレーム119でもCopy Ellipseによる複製が残っている実機出力比較](/img/fusion/captures/S93/frame119.png)](/img/fusion/captures/S93/frame119.png)

フレーム0と119の両方で複製が残り、最後は0へ戻して保存しました。全120フレームを個別に検査した例ではありません。描画要素は`CopyEllipse1`、内部REGIDは`CopyEllipse`、Apply Modeは`PaintApplyStamp`でした。Flowに見えるノードはLoader・Paint・MediaOutの3つです。

[再現用Graph](/img/fusion/captures/S93/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S93/capture.json)

## 輪郭・参照位置・期間を調整する

Copy EllipseではCenterとWidth／Heightで範囲を指定します。掲載画像は作図直後の形状で、描画後の寸法変更やShiftドラッグによる形状制約は未確認です。

ManualはCopy系の参照位置をOffsetとして説明し、アニメーション可能としています。今回の実機Inspectorでは「ソース」と表示され、Source座標の変更で複製結果を確認しました。参照位置を変えるときは、模様や明暗が補修先の周囲につながるか、Paintの出力で確認します。

Copy系の形状は既定でコンポジション全体に表示され、ManualではKeyframes Editorによる期間変更も説明されています。今回の実機例では期間の短縮・延長、参照位置や輪郭のアニメーション、Tracker接続、Time Offsetは未確認です。

## 使い分け

[Circle](./circle-stroke)や[Rectangle](./rectangle)は色で覆う描画に、[Clone Multistroke](./clone-multistroke)はブラシで短い補修を重ねる操作に使います。Copy系は領域の中へ画像の画素を入れます。後段のエフェクトの適用範囲を定義する場合は[Mask](../masks/index.md)を使います。

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 80「Paint」p.1751：Copy系のShape Drawing Tools、Paintへの元ノード接続、Fill Type = Image。
- 同Chapter 113「Paint Node」pp.2638–2645：Paintの入出力、Copy系のOffsetと期間、Polyline編集、コピー元表示。

掲載したGraph、Inspector、Source変更後の出力、フレーム0／119を実機確認しました。別ノードからのコピー、透明Background上へのコピー、個々の編集操作、全既定値・値域、実写の補修、筆圧、Free／Studio差、他OSと性能は未確認のため、`verification: partial`を維持します。
