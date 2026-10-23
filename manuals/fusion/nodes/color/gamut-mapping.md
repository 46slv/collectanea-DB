---
title: Gamut Mapping
description: Gamut MappingでHDR/SDRの明暗差と高彩度を扱う方法を、21.1の設定・接続例とともに解説する。
doc_type: node
term_id: gamut-mapping
term_short: 明るさの幅や彩度を、出力先で扱いやすい範囲へ再配置するColorノード。
verification: partial
aliases: [Gamut Mapping, GMp]
concepts: [image-data, color-space, tone-mapping]
nodes: [Gamut Mapping]
node_family: color
controls: [Gamma, Tone Mapping Method, Sat. Rolloff Start, Sat. Rolloff Limit, Max Input Luminance, Max Output Luminance, Average Input Luminance, Gamut Mapping Method, Saturation Knee, Saturation Max., Apply Forward OOTF, Apply Inverse OOTF]
inputs: [image, mask]
outputs: [image]
tasks: [tone-map, gamut-map, hdr-sdr]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Gamut Mapping

Gamut Mappingは、画像の**明るさの幅（ダイナミックレンジ）**と**色の鮮やかさ（彩度）**を、別の表示条件に合うよう調整するノードです。HDR素材の強いハイライトをSDR向けに収めたり、鮮やかな色が出力側で不自然に切り捨てられないようにしたりするときに使います。

明るい部分をすべて同じ白にする処理を「クリップ」、階調の差をなるべく残しながら圧縮する処理を「ロールオフ」と呼びます。このノードでは、明るさに対する**Tone Mapping**と、彩度に対する**Gamut Mapping**をそれぞれ考えます。両方を必ず強くかける必要はありません。

ただし、**Gamut Mapping単体を「カメラLogからRec.709へ変換する万能ノード」と考えない**でください。21.1マニュアルに記載された本ノードのInspectorには、CSTのようにInput / Output Color Spaceを別々に選ぶ項目はありません。入力の色空間・ガンマ、作業用色空間、出力先の条件を先に整理し、必要な色空間変換は[Color Space Transform](./color-space-transform)やResolve Color Managementなどで扱います。

## 入力・出力

| 接続 | 役割 |
| --- | --- |
| Input（オレンジ） | 明るさや彩度を調整する2D画像。MediaIn、Loader、Mergeなどの出力をつなぐ。 |
| Effect Mask（青） | 調整を一部分に限定する任意のマスク。PolygonやRectangleなどのマスク出力をつなぐ。 |
| Output | 調整後の2D画像。後続の画像処理ノードやMerge、MediaOut / Saverへ渡す。 |

Effect Maskはノードの処理後に適用されます。部分補正では、マスク境界で明るさや彩度が急に変わって見えないかも確認します。3D SceneやDeep Imageを直接受け取るノードではありません。

## 最初に確認するGamma

**Gamma**には、このノードへ入ってくる画像が現在どのガンマで表現されているかを指定します。元のカメラファイルの記録ガンマと、**直前のノードが出力しているガンマ**は同じとは限りません。

たとえば、前段のCSTやMediaIn / Loaderですでにリニア化していれば、その変換後の状態に合わせます。21.1マニュアルも、GammaはTimeline側の設定と一致する場合があるものの、作業方法次第で異なると説明しています。見た目だけでガンマを推測せず、ノードチェーンとプロジェクト設定から判断します。

## Tone Mapping Method：明るさをどう収めるか

HDRからSDRへの変換など、入力と出力で表示できる明暗差が大きく異なるときに使う設定です。

| Method | 結果・使い分け |
| --- | --- |
| None | Tone Mappingを適用しない。出力範囲へ収める必要がなければ選択する。 |
| Clip | 範囲外の値を切り捨てる。強いハイライトの階調が失われる場合がある。 |
| Simple | 単純なカーブでハイライトやシャドウを圧縮・拡張する。 |
| Luminance Mapping | DaVinci方式に近い。素材がRec.709やRec.2020など、同じ規格の入力色空間に統一されている場合に適する。 |
| DaVinci | 明部・暗部を滑らかにロールオフし、極端に明るい・暗い部分の彩度も制御する。異なるカメラ素材を混ぜる場合の候補。 |
| Saturation Preserving | 明部・暗部のロールオフを行いながら彩度をなるべく残す。強い色を残したいときに有用だが、高彩度ハイライトが不自然になることもある。 |

**Simple**について、21.1マニュアルはおおむね5,500 nitから100 nitへの対応を説明しています。入力ハイライトが5,500 nitを大きく超える場合には、Simpleを選んでもその上の情報がクリップする可能性があります。どのMethodでも無条件に白飛びが防げるわけではありません。

### Sat. Rolloff Start / Sat. Rolloff Limit

**Saturation Preserving**を使うときに、高輝度部分の彩度を追加で抑えるための設定です。

- **Sat. Rolloff Start**：彩度を下げ始める明るさ。単位はnit（cd/m²）。
- **Sat. Rolloff Limit**：彩度が完全になくなる明るさ。単位はnit（cd/m²）。

たとえば、白熱した照明が不自然に色付きすぎる場合、どの輝度から色を弱めるかをこの2項目で調整します。しきい値を変える前に、素材の輝度と出力条件を確認します。

### Max Input/Output Luminance

入力側と出力側の明るさの対応を指定する項目です。単位はnitです。入力素材の最大輝度と、表示・納品する側の輝度条件を確認した上で設定します。

**HDR→SDRだからといって、素材を調べずに固定値を入れない**ことが重要です。最大輝度の想定が外れると、白飛びだけでなく画像全体の明るさの配分も変わります。

### Average Input Luminance

HDR表示とSDR表示では、見る人の目が周囲の明るさに慣れる状態が異なります。この差を考慮する設定です。21.1マニュアルでは、一般的な画像は0〜10を目安とし、昼間の雪景色のように画面全体が非常に明るい場合は、より高い値でハイライトの情報を残しやすくなると説明しています。

これは全素材に対する固定の推奨値ではありません。明るい映像と暗い映像の両方を確認しながら決めます。

## Gamut Mapping Method：高彩度をどう扱うか

Tone Mappingが主に明るさの幅を扱うのに対し、Gamut Mappingは入力と出力で扱える**色の範囲**が異なるときの彩度を扱います。

21.1マニュアルのGamut Mappingノード節では、**Saturation Mapping**を選ぶと、一定以上の彩度を次の2項目によって再配置できると説明しています。

- **Saturation Knee**：彩度の再配置を始める境界。この値より低い彩度は変えず、境界より上の彩度を調整する。
- **Saturation Max.**：境界より上の彩度を向かわせる最大値。マニュアルでは、1.0を現在選択されている出力色空間の最大彩度として説明している。

たとえば、鮮やかなLED照明が単純なクリップで色の差を失うとき、Kneeより上の強い彩度をなだらかに収める方法を検討します。彩度の低い肌や背景まで一律に下げる操作とは目的が違います。

関連するCSTのGamut Mapping欄には**None / Saturation Mapping / Clip**の説明もあります。ただし、同じ名称の設定でもノード・版・画面によって選択肢の表示が異なり得ます。本ページの単体ノードの各プリセット名・既定値は21.1実機で全件照合していないため、Inspectorの実際の選択肢を優先してください。

### Advanced：OOTF

- **Apply Forward OOTF**：シーン基準の画像から表示基準の画像へ扱いを変える方向。
- **Apply Inverse OOTF**：表示基準からシーン基準へ戻す方向。

OOTFはシーンの明るさと画面上の明るさの関係を扱う処理です。単なるGammaの選択とは役割が違います。すでに別のノードやカラー管理で同じ処理をしているなら、重ねて適用しないよう確認します。

## 実践例：HDR素材をSDR向けに確認する

~~~text
MediaIn / Loader
       ↓
[必要に応じてCST：入力形式を作業用の色空間へ]
       ↓
Gamut Mapping（Gamma / Tone Mapping / 彩度を確認）
       ↓
[必要に応じてCST：出力先の色空間・ガンマへ]
       ↓
MediaOut / Saver
~~~

これは**手動カラー管理の場合の構成例**です。必ずこの順序でノードを並べる指示ではありません。Resolve Color Managementなどですでに必要な変換が行われる場合は、重複させません。

1. カメラ素材の色空間・ガンマと、出力したい映像の条件を確定します。HDRかSDRかだけでなく、現時点のノード出力が何の色空間なのかを確認します。
2. 必要な色空間変換をCSTなどで設定します。Gamut Mappingの**Gamma**には、その位置で実際に入力される画像の特性を指定します。
3. Tone Mapping Methodで**DaVinci**と**Saturation Preserving**などを比較します。照明や空のハイライトがどの程度残るかを確認します。
4. Saturation Preservingで照明が鮮やかすぎるなら、Sat. Rolloff Start / Limitを調整します。高彩度の色が不自然ならSaturation Mapping側も確認します。
5. 出力先に対応した表示で確認します。Viewer LUTの見え方だけでなく、最終出力側の変換も調べます。

**注意**：色域やガンマが異なる2素材を合成するときは、まず共通の作業用色空間へそろえることを検討します。Gamut Mappingを片方だけに置いて見た目を合わせても、色空間の不一致が解消したとは限りません。

## 似たノードとの使い分け

| 目的 | 選ぶ候補 |
| --- | --- |
| 明るさの幅や高彩度の収め方を調整したい | **Gamut Mapping** |
| 入力・出力のColor Space / Gammaを明示して変換し、必要ならマッピングもしたい | [Color Space Transform](./color-space-transform) |
| 色空間の変換やガンマの除去・付加をしたい | [Gamut](./gamut) |
| 最終納品の色域境界を越えないよう値を強制的に制限したい | [Gamut Limiter](./gamut-limiter) |

Gamut Limiterは色域外の値を**ハードクリップ**するノードです。最終QC向けの制限に使えますが、途中で適用すると後で利用できた色の情報を失うことがあります。Gamut Mappingの彩度圧縮とは目的が異なります。

## 問題が起きたとき

- **暗すぎる・明るすぎる**：Gamma、Tone Mapping Method、Max Input/Output Luminance、前後のCSTやRCMによる重複処理を確認します。
- **ハイライトが白く抜ける**：Clipになっていないか、Simpleの処理範囲や入力輝度の想定を確認します。
- **照明の色が不自然に濃い**：Saturation PreservingのSat. RolloffとSaturation Mappingの設定を切り分けます。
- **鮮やかな色の差がなくなる**：彩度を圧縮しているのか、途中でハードクリップしているのかを確認します。
- **画面の一部だけ変わる**：Effect Maskの接続と境界を確認します。
- **Viewerと書き出しで色が違う**：Viewer LUT、カラー管理、後段の出力変換をそれぞれ確認します。

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 93「Color Nodes」pp.2143–2145：Gamut Mappingの入出力、Gamma、Tone Mapping、輝度・彩度・OOTFの項目。
- 同Chapter 93 pp.2138–2141：Color Space Transform内のTone / Gamut Mappingの補足と、None / Saturation Mapping / Clipの記述。
- 同Chapter 93 pp.2141–2142：Gamut Limiterのハードクリップと配置上の注意。
- 同Chapter 76「Managing Color for Visual Effects」pp.1654–1659：手動リニア化、Viewer LUT、RCMとFusionの色管理。

接続例はマニュアルをもとにした説明用の構成例です。DaVinci Resolve 21.1実機での表示・レンダリング、Inspectorの全プリセット・既定値・数値範囲、Free / Studio差は未検証です。
