---
title: Color Space Transform
description: 入出力の色空間・ガンマ、HDR/SDRの階調、色域外の彩度、白色点をどう変換するかを解説する。
doc_type: node
term_id: color-space-transform
term_short: 入出力の色空間とガンマを指定してRGB画像を変換し、必要なら階調や彩度も調整するノード。
verification: partial
aliases: [Color Space Transform, CST]
concepts: [image-data, color-space, tone-mapping]
nodes: [Color Space Transform]
node_family: color
controls: [Input Color Space, Input Gamma, Output Color Space, Output Gamma, Swap, Tone Mapping, Gamut Mapping, Apply Forward OOTF, Apply Inverse OOTF, Use White Point Adaptation]
inputs: [image, mask]
outputs: [image]
tasks: [color-space, tone-map, gamut-map]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Color Space Transform

Color Space Transform（CST）は、入力画像の色空間とガンマを指定し、別の色空間・ガンマに変換するノードです。たとえば、カメラの広い色域で記録された素材を、Rec.709向けの映像へ変換するときに使います。

色空間はRGBの基準や表せる色の範囲、ガンマは明るさを数値へ記録する方式に関係します。**色の範囲を変えること**と**明るさの記録方式を変えること**は別の操作なので、CSTでは入力と出力のそれぞれについて両方を指定します。

CSTはLUTによる表引きではなく、Resolve Color Management（RCM）と同系統の計算で色を変換します。入力と出力の明るさの範囲が大きく異なる場合はTone Mapping、扱える色の範囲が異なる場合はGamut Mappingも利用できます。

## 入力・出力

| 接続 | 何を渡すか |
| --- | --- |
| Input（オレンジ） | 色を変換する2D画像。MediaIn、Loader、Mergeなどの画像出力を接続する。 |
| Effect Mask（青） | 変換範囲を限定する任意のマスク。PolygonやRectangleなどを接続する。 |
| Output | 変換後の2D画像。Mergeなどの後続ノードやMediaOut / Saverへ接続できる。 |

Effect MaskはCST自体の処理後に適用されます。マスクを付けた場合は、変換する領域と変換しない領域の境界も確認してください。CSTは2D画像用であり、3D SceneやDeep Imageをそのまま入力するノードではありません。

## Inspector：最初に決める4つの項目

| 項目 | 指定するもの |
| --- | --- |
| Input Color Space | **現在の入力画像**が使っているRGB色空間。 |
| Input Gamma | **現在の入力画像**が使っているガンマ・転送特性。 |
| Output Color Space | **変換後の画像**に使いたいRGB色空間。 |
| Output Gamma | **変換後の画像**に使いたいガンマ・転送特性。 |

最初に入力素材の色空間とガンマを調べます。カメラLogなら、撮影設定やファイルのメタデータから対応する組み合わせを確認します。「Logだからどのカメラでも同じ設定」とは限りません。

次に出力先の条件を決めます。Rec.709の確認用画像、別の合成工程へ渡すリニア画像、HDR納品では適切なOutputの設定が異なります。

**Swap**は入力側と出力側の色空間・ガンマ設定を入れ替えるボタンです。逆方向の変換に便利ですが、Tone Mappingで圧縮・クリップした値まで元に戻す保証はありません。

## Tone Mapping：明るさの範囲を変える

HDRの非常に明るい部分をSDRへ変換する場合などは、色空間とガンマの指定だけではハイライトが出力範囲を超えることがあります。Tone Mappingは、明暗差を出力側の範囲へ収める処理です。

| Method | 結果と選び方 |
| --- | --- |
| None | Tone Mappingを行わない。**色空間・ガンマ変換まで無効になるわけではない**。 |
| Clip | 範囲外の値を切り捨てる。明部の階調を残したい場合は注意が必要。 |
| Simple | 単純なカーブで明部や暗部を圧縮・拡張する。21.1マニュアルでは約5,500 nitと100 nitの間を扱う方式として説明され、これを超える明部はクリップする可能性がある。 |
| Luminance Mapping | DaVinci方式に近い。入力素材がすべてRec.709やRec.2020など、同じ規格の色空間に統一されている場合に向く。 |
| DaVinci | 明部と暗部を滑らかに収め、極端に明るい・暗い部分では彩度も制御する。異なるカメラの広色域素材を組み合わせる場合の候補。 |
| Saturation Preserving | 明暗を滑らかに収めながら彩度をなるべく維持する。高彩度のハイライトが不自然になる場合は追加の彩度制御を使う。 |

### ハイライトの彩度と輝度

**Sat. Rolloff Start / Sat. Rolloff Limit**は、Saturation Preservingで高輝度部分の彩度を減らす開始点と終了点を、nit（cd/m²）で指定します。Startから彩度が減り始め、Limitで彩度が完全になくなるように調整します。

**Use Custom Max Input/Output**は、入力と出力でどの明るさを対応付けるかを、nit単位で指定する設定です。素材の記録方式や出力仕様が分からないまま数値だけを変えないようにします。

**Adaptation**は、HDR表示とSDR表示で人の目の明るさへの慣れ方が異なることを考慮します。21.1マニュアルは一般的な画像で0～10を目安とし、昼間の雪景色など非常に明るい画像では値を高めるとハイライトの細部が残りやすいと説明しています。これは固定の推奨値ではありません。

## Gamut Mapping：出力側で表せない色を扱う

入力側の色域で表現できる鮮やかな色でも、出力側では表せない場合があります。Gamut Mappingは、そのような色の彩度をどう収めるかを決めます。

- **None**：色域外の色を収める追加処理をしない。出力側で必ず表せるという意味ではありません。
- **Saturation Mapping**：**Saturation Knee**を超えた彩度を、**Saturation Max.**に向けて再配置する。低い彩度は維持し、高彩度の色だけ段階的に収めたいときに使います。
- **Clip**：色域外の値を切り捨てる。もとの色の階調や彩度差が失われる場合があります。

Saturation KneeとSaturation Max.の「1.0」は、選択している出力色空間での最大彩度を表します。異なる出力色空間に変更すれば、同じ数値でも対応する色の範囲が変わります。

Tone Mappingは主に**明るさの範囲**、Gamut Mappingは主に**色の範囲**を扱います。HDRからSDRへ変換するときには両方を検討しますが、常に両方を有効にする必要はありません。

## Advanced：OOTFとWhite Point Adaptation

### Apply Forward / Inverse OOTF

OOTF（Opto-Optical Transfer Function）は、シーンの明るさと表示用画像の明るさの関係を扱います。

- **Apply Forward OOTF**：シーン基準（scene-referred）から表示基準（display-referred）へ変換する。
- **Apply Inverse OOTF**：表示基準からシーン基準へ戻す。

Input / Output Gammaとは別の設定です。素材がシーン基準なのか、すでに表示向けに処理されているのかを確認して使います。方向に合わないOOTFを追加すると、コントラストが意図と異なることがあります。

### Use White Point Adaptation

色空間によって「白」とみなす色度（白色点）が異なります。Use White Point Adaptationは、入力の白色点を出力の白色点へ合わせるための色順応変換です。

21.1マニュアルの例では、**P3-D60の映像をP3-D65のタイムラインで他の素材と合わせる**場合は有効にします。逆に、P3-D60素材の白色点を変えずに参照したい場合は無効にします。

「他の映像に合わせる」のか「素材の元の白色点を保って見たい」のかで使い分けます。

## 実践例1：カメラLogをRec.709向けに変換する

~~~text
MediaIn / Loader
       ↓
Color Space Transform
       ↓
MediaOut / Saver
~~~

1. 撮影・書き出し情報を確認し、Input Color SpaceとInput Gammaを実際の素材に合わせます。
2. 出力先の仕様に合わせ、Output Color SpaceとOutput Gammaを設定します。Rec.709向けでも表示条件やガンマまで確認します。
3. HDRなど広いダイナミックレンジをSDRへ収める必要がある場合はTone Mappingを設定します。比較候補としてDaVinciを選び、明部の細部と暗部の残り方を確認します。
4. 鮮やかな照明や衣装などの色が不自然ならGamut Mappingを比較します。Saturation MappingとClipでは彩度の残り方が異なります。
5. CSTを一時的に無効にして前後を比較します。白飛び・彩度に加え、肌やグレーの色味も確認します。

これは**入力素材を手動で変換する例**です。RCMが同じ役割をすでに担当している場合は、このままCSTを追加しません。

## 実践例2：異なる形式の素材を合成前にそろえる

~~~text
MediaIn（別形式の素材） → CST ─┐
                             Merge → MediaOut
MediaIn（基準の素材） ────────┘
~~~

二つの素材を同じ基準で合成するとき、片方の入力形式だけが異なるなら、その枝にCSTを置いて**合成用の作業色空間へ合わせる**構成を検討できます。

Mergeへ渡す画像同士は、合成時点で色空間とガンマが整合している必要があります。片方だけを最終表示向けに変換してからMergeすると、見え方が一致しないことがあります。

Viewer LUTはプレビュー表示の変換です。Viewerの見え方だけを変えることと、CSTで画像のRGB値を変えて後続ノードへ渡すことは別です。

## Resolve Color Managementとの関係

DaVinci YRGB Color Managedを有効にすると、ResolveのFusionページではMediaInからの画像が自動的にリニアへ変換され、MediaOut側でカラー処理用の空間へ戻されます。21.1マニュアルは、この経路では通常GamutやCineonLogによる手動リニア化を追加する必要がないと説明しています。

CSTを追加する前に、Project SettingsのColor Management、素材のInput Color Space、MediaIn / Loaderのガンマ変換設定を確認します。同じ意図の変換がすでに行われている場合、追加のCSTは二重変換になります。

RCMを使っていなくても、MediaIn / LoaderのRemove Curve、Gamut、CineonLogなどが先に変換を担当していれば、その**現在の出力**をCSTの入力条件として扱います。カメラファイルの元のLog設定をもう一度Input Gammaに指定するとは限りません。

## 似たノードとの使い分け

| 目的 | 選ぶ候補 |
| --- | --- |
| 入出力のColor SpaceとGammaを個別に指定し、必要ならTone / Gamut Mappingも行う | **Color Space Transform** |
| Source / Output SpaceとRemove / Add Gammaでリニア化・出力変換する | [Gamut](./gamut) |
| すでに色空間が決まり、明るさ・彩度を出力範囲へ収める処理が必要 | [Gamut Mapping](./gamut-mapping) |
| ACESが規定するIDT / ODTなどを使う | [ACES Transform](./aces-transform) |
| OCIO設定ファイルで定義された色空間を使う | [OCIO Color Space](./ocio-colorspace) |
| RGBをYUVやHLSなど別のチャンネル表現に変える | [Color Space](./color-space) |

CSTにはACESの選択肢もありますが、**正式なACESワークフローにはACES Transformを使います**。21.1マニュアルは、CSTのACES変換は一般的な測色変換であり、Academyが定めるACES変換そのものではないと注意しています。

## 問題が起きたとき

- **急に暗い・明るい**：Input / Output Gamma、OOTF、RCM、MediaIn / Loaderの変換が重複していないか確認する。
- **ハイライトが白く抜ける**：Tone MappingがClipになっていないか、明るさの対応が適切か確認する。
- **鮮やかな色が不自然**：入力色空間の指定を先に確認し、次にGamut MappingのMethodを比較する。
- **白やグレーの色味が違う**：白色点の差とWhite Point Adaptationの目的を確認する。
- **合成した素材間で色が違う**：Mergeに入る前のそれぞれの色空間・ガンマを確認する。
- **Viewerだけ見え方が違う**：Viewer LUTの有無を確認する。
- **部分的にしか変換されない**：Effect Maskの接続と範囲を確認する。

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 93「Color Nodes」pp.2138–2141：入出力、4つの変換メニュー、Swap、Tone Mapping、Gamut Mapping、OOTF、White Point Adaptation、ACESに関する注意。
- 同Chapter 76「Managing Color for Visual Effects」pp.1654–1659：リニア合成、Viewer LUT、MediaIn / Loaderのガンマ変換、DaVinci YRGB Color Managedでの自動変換。

本文は21.1マニュアルで確認できた仕様に基づきます。接続例は仕様に基づく構成例であり、21.1実機でのレンダリングを検証したという意味ではありません。全プリセット、既定値・数値範囲、Free / Studio差は網羅確認していません。
