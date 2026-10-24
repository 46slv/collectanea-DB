---
title: OCIO CDL Transform
description: ASC CDLのSlope・Offset・Power・Saturationで色を補正し、CDLファイルの読み込み・書き出しを行うFusionノード。
doc_type: node
term_id: ocio-cdl-transform
term_short: ASC CDL形式の色補正値を手動設定またはファイルから適用するノード。
verification: partial
aliases: [OCIO CDL Transform, OCT]
concepts: [image-data, color-space, ocio]
nodes: [OCIO CDL Transform]
node_family: color
controls: [Operation, Direction, Slope, Offset, Power, Saturation, Export File]
inputs: [image, mask]
outputs: [image]
tasks: [ocio, cdl, color-grade]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-24"
---

# OCIO CDL Transform

**OCIO CDL Transform**は、入力した画像の色を、決められた4種類の調整値に従って変えるノードです。Slope・Offset・Powerで赤・緑・青の明るさの関係を調整し、Saturationで彩度を変えます。補正値はInspectorで直接編集するほか、ASC CDL（American Society of Cinematographers Color Decision List）形式のファイルから読み込めます。

CDLは、撮影現場と編集・カラー・VFXの担当者の間で**色補正の数値を受け渡すための方式**です。LUTのように大量の色の対応表を持つのではなく、比較的少ない数値で補正内容を表します。たとえば、撮影現場で決めた明るさや色かぶりの補正を、Fusionで合成する素材にも適用したい場合に使います。

このノードだけでカメラLogをRec.709へ変換したり、異なる素材の色空間を自動で統一したりするわけではありません。**CDLをどの色空間・ガンマの画像へ適用するか**は、受け取った補正値と作業工程の前提に合わせて決めます。

## 役割と入出力

入力前の画像と出力後の画像は、どちらも2Dの<Term id="image">Image</Term>です。画像のサイズや配置を変えるのではなく、各画素の色の値を補正します。

| 接続 | 役割 |
| --- | --- |
| **Input**（オレンジ、必須） | 補正する2D画像。Loader、MediaIn、Mergeなどの画像出力を接続します。 |
| **Effect Mask**（青、任意） | 補正を適用する場所を指定します。PolygonやRectangleなどで作ったマスクを接続できます。 |
| **Output** | CDL補正後の画像を後続のMerge、Saver、MediaOutなどへ渡します。 |

Effect Maskはノードの処理後に適用されるため、マスクの内側だけに補正結果を反映できます。画面全体へ同じCDLを適用する場合は接続する必要はありません。マスクによって色補正が不連続になる場合は、境界の見え方も確認します。

## Inspector：主な設定

### Operation：ファイルを使うか、数値を編集するか

- **File**：既存のASC CDLファイルを読み込み、その補正を適用します。受け取ったCDLを再現するときに選びます。
- **Controls**：Slope・Offset・Power・SaturationをInspectorで直接編集します。新しく補正を作る場合や、補正値を微調整して書き出したい場合に選びます。

「CDLを読み込む」のは画像を読み込むことではありません。画像はInputへ接続し、Fileモードでは**色をどう変えるかという設定**を別途読み込みます。ファイルの保存先を変えた場合や別のPCへプロジェクトを渡す場合は、参照先が有効か確認してください。

### Slope：RGBの値を掛け算で調整

Slopeは、赤・緑・青の各値に倍率を掛けます。[Brightness Contrast](./brightness-contrast)のGainに相当する働きです。

たとえば赤のSlopeを少し大きくすると、赤成分を持つ画素の値が増えます。暗い部分から明るい部分まで一律に同じ値を足す操作ではなく、**元の値に応じて変化量が大きくなる**操作です。明るい部分の色の偏りやコントラストを調整する際に利用します。

### Offset：RGBの値へ一定量を足す

Offsetは各チャンネルに数値を加えます。[Brightness Contrast](./brightness-contrast)のBrightnessに相当します。Slopeと違い、元の値が0の部分も動かせます。

たとえば画像全体にわずかな緑かぶりがある場合は、OffsetのRGBバランスを少し変えて補正を試せます。ただし、暗部も動くため、黒が浮いたり色づいたりしていないか確認します。

### Power：暗部を中心とした階調の曲がり方を調整

PowerはRGBの値にガンマ曲線を適用します。単純な掛け算や足し算ではなく、**入力値によって補正量が変わる**ため、影のコントラストや中間調の見え方を変えられます。

21.1マニュアルでは、PowerはBrightness ContrastノードのGamma関数と逆の関係にあると説明されています。同じ数値を両方のノードに入れて同じ結果になる、という意味ではありません。調整方向を決めつけず、Viewerで変化を確認してください。

### Saturation：色の強さを調整

Saturationは全体の彩度を上げ下げします。[Brightness Contrast](./brightness-contrast)のSaturationと同じ役割です。肌や背景の色が強すぎる場合は下げ、全体の色が弱い場合は上げる方向で調整します。

Slope・Offset・PowerはRGBのバランスにも影響するため、これらを変更した後にSaturationを確認すると、色の強さを判断しやすくなります。

### Direction：補正を適用するか、戻すか

- **Forward**：ファイルまたはControlsに指定された補正を適用します。
- **Reverse**：指定された補正を逆向きに処理し、元に戻そうとします。

Reverseは元の画像を必ず復元する機能ではありません。たとえばSlopeをすべて0にして異なる入力値を同じ黒にしてしまうと、出力から元の値を特定できません。入力範囲の制限や色の切り詰めを伴う処理でも、完全な逆変換は期待しないでください。

### Export File：補正値を受け渡す

**Controlsモード**で調整した値をCDLファイルとして書き出せます。書き出すのは画像ファイルではなく、補正値のデータです。次の担当者にはCDLファイルだけでなく、**どの色空間・ガンマの画像へ適用するか**も一緒に伝えます。

Settingsタブは他のColorノードと共通です。ここではOCIO CDL Transform固有のControlsに絞っています。

## 最小構成

~~~text
Loader / MediaIn
       ↓
OCIO CDL Transform（Controls または File）
       ↓
Saver / MediaOut
~~~

入力画像がCDLの想定条件に合っている場合の構成です。Fusion Studioの21.1マニュアルには、Loaderの後に[Gamut](./gamut)で画像をリニアへ変換してからOCIO CDL Transformを置く例もあります。ただし、**すべてのCDLがリニア画像を前提とするわけではありません**。別の工程で作られたCDLへ同じ配置を無条件に当てはめないでください。

## 運用例：撮影現場から渡されたCDLで色を合わせる

**想定：** 同じシーンのカメラ素材と合成素材があり、現場からそのショット用のCDLを受け取っています。CDLをどの入力状態に適用するかも制作側で指定されています。

1. 素材の色空間・ガンマを確認し、CDLが作られたときの入力条件と一致させます。必要な変換があれば、CDLの前段に配置します。
2. 素材の画像出力をOCIO CDL TransformのInputへ接続します。
3. **OperationをFile**にして受け取ったCDLファイルを選び、**DirectionをForward**にします。
4. ノードの前後を同じフレームで比較し、黒の位置、白い部分、肌色、背景色が想定する補正結果になっているか確認します。
5. 合成する別素材にも同じ補正を適用する場合は、各素材を**CDLが想定する入力状態**へそろえてから適用します。
6. 後続の合成・出力処理で、すでに適用した色補正や表示変換が再度かからないことを確認します。

逆に、自分で補正を作って他の担当者へ渡すなら、OperationをControlsに変更してRGBとSaturationを調整し、**Export File**で保存します。比較対象の色を厳密に一致させたい場合は、見た目だけでなく、補正前後の素材状態や参照画像も共有すると確認しやすくなります。

## うまく合わないとき

- **CDLを適用すると極端に暗い・明るい**：ファイルの想定入力と、実際にノードへ入る画像の色空間・ガンマを確認します。変換を二重に適用していないかも確認してください。
- **赤や緑の色かぶりが強い**：Slope / Offset / PowerのRGB値が意図したものか確認します。Saturationだけではチャンネルごとの偏りは直りません。
- **Reverseでも元に戻らない**：情報を失う補正は一意に逆変換できません。元画像が必要なら処理前の素材からやり直します。
- **CDLを渡しても別のソフトで見え方が違う**：ファイルだけでなく、入力・出力の色空間、ガンマ、補正を置く順番を共有します。CDLは表示変換そのものではありません。
- **一部分だけ色が変わる**：Effect Maskの接続と範囲を確認します。
- **Viewerでは正しいが出力が違う**：Viewerだけの表示LUTと、実際の画像データを変える処理を区別してください。

## 似たノードとの使い分け

| 目的 | ノード |
| --- | --- |
| Slope / Offset / Power / SaturationでCDL補正を作る・読み込む・書き出す | **OCIO CDL Transform** |
| OCIO configに登録された色空間へ画像を変換する | [OCIO Color Space](./ocio-colorspace) |
| LUTなど外部変換ファイルを直接適用する | [OCIO File Transform](./ocio-filetransform) |
| Display / Viewで表示向けの画像変換を行う | [OCIO Display](./ocio-display) |
| CDLの受け渡しを必要とせず、より多くの色補正操作を使う | [Color Corrector](./color-corrector) |

CDLは**色補正値の受け渡し**、OCIO Color Spaceは**色空間変換**という役割が異なります。どちらも必要なら、一方で他方の代わりをさせず、それぞれの位置と入力条件を決めます。マスクでの部分適用については[Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)を参照してください。

## 実機例：赤Slopeを変えてCDLを書き出し、読み直す

<!-- capture-case:S105 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%、フレーム0で撮影しました。Loaderのテストチャートをノードへ入力し、その画像出力をMediaOutへ接続しています。左が入力、右が処理後です。

[![LoaderからOCIO CDL Transformを経てMediaOutへ接続した実機Graph](/img/fusion/captures/S105/graph.png)](/img/fusion/captures/S105/graph.png)

OperationをControls、DirectionをForwardにしました。SlopeのRGBを各1、Offsetを各0、Powerを各1、Saturationを1にした状態では、左右のチャートは同じ見え方です。

[![ControlsのSlope1、Offset0、Power1、Saturation1で入力と出力が同じ見え方になる実機比較](/img/fusion/captures/S105/baseline.png)](/img/fusion/captures/S105/baseline.png)

Red Slopeだけを0.5へ変更すると、右の白と灰色はシアン寄りになり、赤いパッチも暗くなりました。Green／Blue Slopeは1、Offsetは0、PowerとSaturationは1のままです。

[![OCIO CDL Transformの実機Controls、赤Slope0.5、緑青Slope1、Offset0、Power1、Saturation1](/img/fusion/captures/S105/inspector.png)](/img/fusion/captures/S105/inspector.png)

[![赤Slopeだけを0.5にすると、右の白と灰色がシアン寄りになる実機比較](/img/fusion/captures/S105/compare.png)](/img/fusion/captures/S105/compare.png)

実機の「CDLファイルの書き出し」で`red-slope05.cc`を保存しました。出力されたXMLの値は次の通りです。

~~~xml
<Slope>0.5 1 1</Slope>
<Offset>0 0 0</Offset>
<Power>1 1 1</Power>
<Saturation>1</Saturation>
~~~

[実機から書き出したCDL](/img/fusion/captures/S105/red-slope05.cc)を確認できます。

読み込みを確かめるため、ControlsのRed Slopeを1へ戻し、元のチャートの表示になったことを確認しました。その後、OperationをFile、DirectionをForwardにして、書き出したCDLを読み込み直しています。保存Graphでは同じフォルダーのファイルを`Comp:/red-slope05.cc`で参照します。

[![Operation FileとForward、同じフォルダーのred-slope05.ccを参照した実機Inspector](/img/fusion/captures/S105/file-inspector.png)](/img/fusion/captures/S105/file-inspector.png)

[![CDLファイルを読み直すと右が再びシアン寄りになり、Controlsで赤Slope0.5にした結果と同じ見え方になる実機比較](/img/fusion/captures/S105/file.png)](/img/fusion/captures/S105/file.png)

Fileによる出力はControlsのRed Slope 0.5と同じ見え方になり、元のチャートとは異なりました。保存した画面のViewer内の同じ範囲でも、両者のRGB画素が一致しています。この照合は画面上の比較で、測色精度や書き出し画像の一致を検証したものではありません。

最後はFile／Forwardで保存しました。別アプリとのCDL互換、CCC／CDLの別形式、Reverse、Slope以外の変更、実写や異なる色空間、Mask、他OS・Edition差と性能は未確認です。`verification: partial`を維持します。

[再現用Graph](/img/fusion/captures/S105/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S105/capture.json)

## バージョンと出典

- **Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 93「Color Nodes」pp.2190–2193**：OCIO CDL Transform [OCT]、Input / Effect Mask、Fusion Studioの接続例、Operation / Direction / Slope / Offset / Power / Saturation / Export File、Settingsタブ。
- **OpenColorIO公式「CDLTransform」**：ASC CDLに準拠したSlope・Offset・Power・Saturationの処理と、逆方向変換に関する技術資料。https://opencolorio.readthedocs.io/en/stable/api/transforms.html
- このページの撮影・合成ワークフローは、上記仕様に基づく運用例です。S105の数値調整、実機CDL書き出し・再読込と表示を確認しました。特定の外部CDLの互換性、全Inspector初期値・範囲、Free / Studio差は未確認です。

**確認範囲：** ノード名、入力2系統、主要Inspector項目と基本的な働きは21.1マニュアルで確認しました。再現性を保証するには、使用するCDLと素材の入力条件を実案件で照合する必要があります。
