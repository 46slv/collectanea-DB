---
title: OCIO File Transform
description: Fusionで外部LUTを画像へ適用する方法。LUT File、CCC ID、Direction、Interpolationと色空間上の注意点を解説。
doc_type: node
term_id: ocio-filetransform
term_short: 外部LUTなどの変換ファイルを読み込み、画像の色に適用するノード。
verification: partial
aliases: [OCIO File Transform, OCF]
concepts: [image-data, color-space, ocio, lut]
nodes: [OCIO File Transform]
node_family: color
controls: [LUT File, CCC ID, Direction, Interpolation]
inputs: [image, mask]
outputs: [image]
tasks: [ocio, lut]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-24"
---

# OCIO File Transform

**OCIO File Transform**は、外部のLUT（Look-Up Table、色の変換表）などを読み込み、入力画像の色を変えて次のノードへ渡す機能です。LUTには「入力されたRGB値をどのRGB値に置き換えるか」という対応が記録されています。たとえば、決められたルックを画像へ適用したり、受け渡された補正データで色を変えたりするときに使います。

ファイルを選んだだけで「適切な色空間へ自動変換される」わけではありません。**LUTが想定する入力の色空間・ガンマと、実際にノードへ届いている画像の状態が一致していること**が重要です。違う条件で適用すると、コントラストや彩度が意図せず変わります。

## 役割と入出力

このノードは、入力された2D <Term id="image">Image</Term>の色を、読み込んだ変換ファイルに従って処理します。入力画像を作るノードではなく、色を変えた画像を後続に渡すノードです。

| 接続 | 役割 |
| --- | --- |
| **Input**（オレンジ、必須） | LUTを適用する2D画像。Loader、MediaIn、Mergeなどの画像出力を接続します。 |
| **Effect Mask**（青、任意） | PolygonやRectangleなどで作ったマスクを接続し、LUTを適用する範囲を限定します。マスクは色の処理後に適用されます。 |
| **Output** | LUT適用後の2D画像を次のノードへ渡します。Viewerで確認したり、さらに処理してSaver / MediaOutへ送ったりできます。 |

通常のカラー処理では、画像全体に同じ変換をかけるためEffect Maskを接続しません。部分的なルックだけを作りたい場合は使えますが、色空間の変換を一部だけに適用すると、1枚の画像の中に異なる前提のRGB値が混在します。詳しくは[Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)を参照してください。

## Inspector：主な設定

### LUT File

適用するLUTなどの変換ファイルをファイル選択ダイアログから指定します。

ここで選ぶのは**画像に適用したい変換データ**です。OCIOの色空間や表示方法をまとめて定義する設定ファイル（.ocio）とは役割が違います。OCIO configに登録された色空間同士を変換したい場合は、[OCIO Color Space](./ocio-colorspace)を使います。

使う前に、そのLUTの配布元や制作担当者が指定する**入力条件と出力条件**を確認してください。「Rec.709向け」「Log向け」などの表記があっても、カメラの色域・ガンマ・レベルまで含む条件が曖昧な場合は、見た目だけで決めつけない方が安全です。

### CCC ID

ASC CDL形式の色補正XMLファイルに含まれる、**どの補正データを参照するかを識別するID**です。LUTの濃さや彩度を調整する値ではありません。

たとえば、複数の補正が1つのXMLファイルへ記録されている場合、目的の補正を識別するために使います。通常のLUTファイルを適用するだけなら、意味のないIDを作って入力する必要はありません。実際に指定すべきIDは受け取ったファイルの内容に従います。

### Direction

変換をどちらの向きに使うかを指定します。

- **Forward**：ファイルで定義された変換をそのまま適用します。
- **Reverse**：逆方向の変換を試みます。

Reverseは「元画像を完全に復元する」ボタンではありません。たとえば異なる明るさの値が同じ黒へ押しつぶされる処理では、出力された黒から元の明るさを一意に求められません。公式マニュアルも、値を失う補正は逆変換できない場合があると説明しています。通常はForwardを使用し、Reverseは変換の仕様と可逆性が分かっているときに選びます。

### Interpolation

LUTの表に直接記録されていない色を、周辺の値からどう求めるかを決めます。LUTはすべてのRGB値を無限の精度で列挙できるわけではないため、値の間を補う処理（補間）が必要です。

21.1マニュアルでは、**Nearestが最も速く、Bestが最も遅い**と説明されています。速度だけでなく画質にも関わるため、最終出力では色の階調や滑らかなグラデーションを確認します。ただし、Bestを選んでもLUT自体の精度や失われた色情報が回復するわけではありません。各選択肢の厳密な補間アルゴリズム・既定値はこのページでは未確認です。

### Settingsタブ

Settingsタブは他のColorノードと共通する項目です。OCIO File Transform固有の設定は上記4項目です。

## 最小構成

~~~text
Loader / MediaIn
       ↓
OCIO File Transform（LUT Fileを指定）
       ↓
Saver / MediaOut
~~~

入力の色空間が**すでにLUTの想定条件と一致している場合**の最小構成です。LUTが特定のLogやscene-linear画像向けに作られている場合は、必要に応じて前段でその条件へ変換します。

マニュアルには、Fusion StudioでLoaderの後にGamutを配置してリニアに変換し、その後へOCIO File Transformを接続する例があります。これは構成例であり、**どのLUTにも必ずGamutを挟むという規則ではありません**。LUTが要求する入力条件によって必要な前処理は変わります。

## 運用例：制作担当者から指定されたルックLUTを適用する

**想定する素材：** Fusion Studioで読み込んだ映像と、制作担当者が渡したルック用LUT。ここでは、素材を読み込んだ段階で画像がLUTの指定入力条件に合っているものとします。

1. LUTを受け取る際に、入力側の色空間・ガンマ、変換後に想定する色空間、用途（プレビュー用か最終出力用か）を確認します。
2. Loaderの画像出力をOCIO File TransformのInputへ接続します。
3. Inspectorの**LUT File**で指定ファイルを読み込み、**DirectionをForward**にします。ASC CDLのXMLで対象IDが指定されている場合のみ、**CCC ID**を合わせます。
4. 同じフレームをノードの前後でViewerに表示し、シャドウ、ハイライト、肌色、なだらかなグラデーションを比較します。必要ならInterpolationを変更して違いを確認します。
5. 出力先がそのLUTの**変換後の色空間**を受け取れるか確認して、Saverへ送ります。再生側やResolveの色管理が同じ変換を重ねていないことも確認します。

たとえば、入力も出力も同じ表示用色空間で、ルックだけを変えるLUTなら、すでにその色空間にある画像へ直接適用できます。一方、カメラLogから表示向けの色へ変えるLUTを、すでにRec.709へ変換された画像に適用すると、色変換が重複する可能性があります。

複数素材に同じLUTを使いたいときも、各素材の色空間をそろえる作業と、ルックLUTを適用する作業は別に考えます。LUTを同じものにするだけで、カメラごとの色差が自動的になくなるわけではありません。

## よくある問題と注意点

- **適用後に極端に暗くなる・白くなる**：LUTが想定する入力ガンマと、上流ノードが渡している画像のガンマを確認します。Resolve側の自動色管理も確認してください。
- **彩度や色相が大きく変わる**：入力色域やLUTの用途が一致しているか確認します。LUTはファイル名だけでは正しい適用順序が判断できません。
- **Reverseでも元に戻らない**：変換中に値がまとめられたり切り詰められたりした場合、失われた情報は復元できません。
- **グラデーションが粗い**：LUT自体の精度とInterpolationを確認します。画面表示だけでなく、実際の出力画像でも確認してください。
- **一部分にしか効果がかからない**：Effect Maskが接続されていないか確認します。
- **Viewerでは合っているのに書き出しで違う**：Viewer LUTなどの表示だけの処理と、OCIO File Transformから出る実画像の変換を分けて確認します。
- **合成後に色がずれる**：表示向けLUTをリニア合成の途中に挟むと、後続の合成が想定する画素値から外れる場合があります。できるだけ目的に合う工程で使い、必要なら表示用の確認分岐に置きます。

## 関連ノードと使い分け

| 目的 | 選ぶノード |
| --- | --- |
| 配布されたLUTなどのファイルを直接読み込んで画像に適用する | **OCIO File Transform** |
| OCIO configに登録された色空間間を変換する | [OCIO Color Space](./ocio-colorspace) |
| Display / Viewを指定して画像そのものを表示向けに変換する | [OCIO Display](./ocio-display) |
| ASC CDLのSlope・Offset・Power・Saturationを編集・読み込みする | [OCIO CDL Transform](./ocio-cdl-transform) |
| Fusionの色域・ガンマ調整で画像のRGB表現を変換する | [Gamut](./gamut) |

OCIO File Transformの機能は、Fusionの**View LUTメニューから使うView LUT**としても提供されています。ただし、View LUTとして使う場合はViewer上の表示に適用する用途であり、**ノードを接続して後続の画像を変換する場合とは出力への影響が異なります**。必要なのがプレビュー上の変換か、実際の画像データの変換かを先に決めてください。

## 実機例：実機CDLを読み込み、ForwardとReverseを比べる

<!-- capture-case:S111 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%、フレーム0で撮影しました。左が入力、右が処理後です。

[![LoaderからOCIO File Transformを経てMediaOutへ接続した実機Graph](/img/fusion/captures/S111/graph.png)](/img/fusion/captures/S111/graph.png)

最初はLUT Fileを指定しておらず、左右のチャートは同じ見え方です。

[![LUT Fileが空のときは入力と出力が同じ見え方になる実機比較](/img/fusion/captures/S111/baseline.png)](/img/fusion/captures/S111/baseline.png)

[OCIO CDL Transformの実機例](./ocio-cdl-transform)で書き出した[red-slope05.cc](/img/fusion/captures/S105/red-slope05.cc)をLUT Fileへ指定しました。Red Slopeだけが0.5、ほかのSlopeは1、Offsetは0、PowerとSaturationは1のCDLです。DirectionはForward、InterpolationはLinear、CCC IDは空です。右の白と灰色がシアン寄りになりました。

[![実機CDLをLUT Fileに指定し、ForwardとLinearを選んだOCIO File Transformの実機Inspector](/img/fusion/captures/S111/inspector.png)](/img/fusion/captures/S111/inspector.png)

[![実機CDLをForwardで適用すると右の白と灰色がシアン寄りになる実機比較](/img/fusion/captures/S111/compare.png)](/img/fusion/captures/S111/compare.png)

同じファイルのままDirectionをReverseへ変えると、右は赤みのある表示へ変わりました。このCDLは赤のSlopeが0.5なので逆方向の変化も確認できますが、値を失う処理を含む任意のLUTが元に戻せるという意味ではありません。

[![同じCDLとLinearを保ち、DirectionだけをReverseへ変えた実機Inspector](/img/fusion/captures/S111/reverse-inspector.png)](/img/fusion/captures/S111/reverse-inspector.png)

[![同じ実機CDLをReverseで適用し、右が赤みのある表示へ変わった実機比較](/img/fusion/captures/S111/reverse.png)](/img/fusion/captures/S111/reverse.png)

最後はForwardへ戻して保存しました。保存Graphでは隣のS105フォルダーを`Comp:/../S105/red-slope05.cc`で参照します。GraphとCDLを別の場所へ保存した場合は、LUT Fileで実際のファイルを指定してください。ForwardのViewer内の同じ範囲はOCIO CDL TransformのControls例とRGB画素が一致しました。これは画面上の比較です。別のLUT形式、CCC IDの選択、補間方式ごとの差、実写、測色、他アプリ・Edition差と性能は未確認です。

[再現用Graph](/img/fusion/captures/S111/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S111/capture.json)

## バージョンと出典

- **Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 93「Color Nodes」pp.2196–2198**：OCIO File Transform [OCF]、Input / Effect Mask、基本構成、LUT File / CCC ID / Direction / Interpolation、View LUTとの関係。
- **同マニュアル Chapter 76「Managing Color for Visual Effects」p.1661**：OCIOの色管理とLUTを扱うノードの役割。
- 読者向けの運用例は上記仕様に基づく構成例です。LUTの対応形式一覧、補間方式ごとの内部演算、各パラメータの初期値、Free / Studio間の細かな差は21.1実機では未検証です。

**確認範囲：** 記載した固有のInspector項目名、入力とEffect Mask、Forward / ReverseおよびNearest / Bestの速度関係は21.1マニュアルで確認しました。S111の実機CDL読込とForward／Reverse表示は確認済みです。ほかの操作例はManualに基づく提案です。
