---
title: Primaries（カラーホイール）
description: ColorページのLift／Gamma／Gain／Offsetと共通調整を、色バランス・明暗・ショット補正の目的から使い分ける。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Lift, Gamma, Gain, Offset, Temp, Tint, Contrast, Pivot, Saturation]
tasks: [primary-correction, balance-image, color-correct]
level: beginner
updated: "2026-10-26"
---

# Primaries（カラーホイール）

**Primaries**は、Colorページで画像全体の色バランス、明暗、コントラストを整える基本パレットです。人物だけを抜くような二次補正より前に、ショット全体の色かぶりや階調を確認するときに使います。

このページで扱うのは**ColorページのPrimariesパレット**です。FusionのColorノードとは別の機能です。以下の操作・項目はDaVinci Resolve **21.1 Reference ManualのChapter 131**に基づきます。説明中の例は操作の組み立て方であり、21.1実機を用いた検証結果ではありません。

## 最初に区別する：色の方向と明るさ

Wheelsモードでは、Lift／Gamma／Gain／Offsetの各組に、色を動かす**Color Balance**と、明暗を動かす**Master Wheel**があります。

- **Color Balance（色の円）**：円の内側をドラッグすると、その調整が受け持つ明暗範囲について、R・G・Bのバランスを変えます。色の偏りを補正する操作です。
- **Master Wheel（下側のホイール）**：左へ動かすと対応する明暗範囲を暗く、右へ動かすと明るくします。色の方向ではなく、YRGBの値をまとめて変える操作です。
- **数値欄**：各組の下にあるYRGBの値は直接編集できます。見た目の色と数値の変化を照合できます。

「画面が青い」と「画面が暗い」は別の症状です。まず[Scopes](./scopes)とViewerで、どの範囲に何が起きているかを確認してから操作を選びます。

## Lift／Gamma／Gain／Offsetの役割

| Control | 作用の中心 | よくある判断と操作 |
| --- | --- | --- |
| **Lift** | 暗部。黒側から中間調に向けて影響が弱まる | 黒付近の色かぶりやシャドウの密度を調整する |
| **Gamma** | 中間調。黒と白の両端へ向けて影響が弱まる | 顔や壁など、中間調を中心に明るさ・色を整える |
| **Gain** | 明部。白側から暗部に向けて影響が弱まる | 白い壁や光が当たる部分の色、ハイライトの高さを整える |
| **Offset** | 画像全体。RGB全域をまとめて動かす | ショット全体の色方向や明るさを、局所的な分離なしに動かす |

**Lift・Gamma・Gainは厳密に分離された3帯域ではありません。**作用する階調が広く重なります。Gammaだけを変えても中間調以外が完全に不変とは限らず、Master Wheelの大きな変更は黒点・白点側にも影響し得ます。

Offsetの**Color Balance**は全域のRGBバランスを変えます。Offsetの**Master Wheel**は全RGBをまとめた全体の明るさ調整です。OffsetにはLift／Gamma／GainのようなY-onlyの調整はありません。

### 操作例：暗部だけ青く見える

1. [RGB ParadeとWaveform](./scopes)を表示し、青みが暗部に偏っているか、照明や被写体の本来の色なのかをViewerと併せて確認します。
2. Primariesの**Lift Color Balance**を少し動かし、暗部の色の偏りを弱めます。Master Wheelで黒の深さまで変えないように、まず色バランスの操作だけを行います。
3. 暗部の補正で中間調まで変わった場合は、Gammaとの重なりを考慮して補正量を戻すか、隣接する操作で調整し直します。
4. 変更前後で黒がつぶれていないか、顔や白い部分の色が不自然になっていないかを確認します。

これは一例です。混合照明の色差や被写体ごとの色差を、Primariesだけで独立して直せるとは限りません。必要に応じて[Qualifier](./hsl-qualifier)や[Power Windows](./power-windows)を使います。

### 操作例：顔の明るさを整えたい

顔が中間調にある場合、Gamma Master Wheelは候補です。ただし、背景も同じ階調なら背景も変化します。顔だけを明るくしたいときは、調整対象が**階調で分かれる問題**なのか、**画面上の領域で分かれる問題**なのかを先に判断します。後者なら局所補正が適します。

## Wheels／Bars／Logを混同しない

Primariesパレットには**Wheels／Bars／Log**の3モードがあります。

- **Wheels**：色の円とMaster WheelでYRGBのLift／Gamma／Gain／Offsetを調整します。広く重なる階調への補正に適します。
- **Bars**：Wheelsと同じLift／Gamma／Gain／Offsetの調整値を、個別のYRGBスライダーとして操作します。Paradeを見ながら特定チャンネルの不均衡を調べたいときに向いています。Wheels側で変更した値はBars側にも反映されます。
- **Log**：Shadows／Midtones／Highlights／Offsetを使い、Wheelsとは異なる、より限定的で調整可能な階調レンジを操作します。LogのShadow／Midtone／HighlightはWheelsのLift／Gamma／Gainと同じ調整値ではありません。

Barsの**Y**スライダーを使った輝度成分中心の調整と、RGBをまとめて動かすMaster Wheelでは、色の見え方が異なります。色を極力変えずにコントラストを調整したい場合でも、Viewerと[Scopes](./scopes)で彩度の変化を確認します。

Log専用のレンジ設定、Log素材に対する位置づけは[Log Wheels](./log-wheels)を参照してください。

## 共通の調整項目

Wheels／Bars／Logには、下記の共通パラメータがあります。まず目的を決めてから、色バランス操作と混ぜずに一つずつ比較します。

| 項目 | 何を変えるか | 使用時の判断 |
| --- | --- | --- |
| **Temp** | 暖色（オレンジ）↔寒色（青／シアン）方向の色バランス | ショット全体の暖かさ・冷たさを見直す。Manual上は制約付きのGain色バランス調整 |
| **Tint** | マゼンタ↔グリーン方向の色バランス | 人工照明などによる緑／マゼンタの偏りを確認する。Manual上は制約付きのGain色バランス調整 |
| **Contrast** | Pivotを中心とした明暗差 | 暗部と明部の距離を広げる／縮める |
| **Pivot** | Contrast変化の中心位置 | コントラストを増やしたとき、暗部と明部のどちらが過度に変わるかを調整する |
| **Midtone Detail** | 局所的なディテールの見え方 | 質感を強調／緩和する。全体のシャープ化やノイズ除去そのものではない |
| **Color Boost** | 彩度の低い領域を比較的強く扱う彩度調整 | 淡い色を持ち上げたいとき、既に強い色が過度に変わらないか確認する |
| **Shadows**／**Highlights** | シャドウやハイライトのディテールを選択的に調整 | 既存素材に残る階調情報の範囲で戻り方を観察する |
| **Saturation** | 全体の彩度 | 色全体を均一な方向へ強める／弱める |
| **Hue** | 画像全体の色相を回転 | 全色相を動かすため、特定の一色だけを直す目的には不向き |
| **Lum Mix** | YRGBのコントラスト変更とY-only変更の寄与を調整 | 個別チャンネルやYカーブを操作したとき、輝度と色の関係がどう変わるか確認する |

21.1 ManualのWheels系共通設定では、**Saturationは50、Color Boostは0、Midtone Detailは0が無調整の基準**として示されています。異なる操作やバージョンの数値を推測で読み替えないでください。

Contrastの処理はProject Settingsの**Use S-curve for contrast**にも影響されます。Manualではこの設定は初期状態で有効と説明されており、無効にすると線形のコントラスト処理により信号端でクリップが生じ得ます。ハイライトが不自然に失われるときは値だけでなくこの設定も確認対象です。

### 操作例：コントラストだけを先に整える

1. Waveformで現状の黒側・白側と中間調を確認します。
2. **Contrast**を少量変更し、階調が望む方向へ開くか観察します。
3. 黒側が先につぶれる、または明部の見え方が不自然なら**Pivot**を見直します。
4. 調整前後のViewerとScopesを比較し、既に情報がない領域を「復元できた」とは判断しません。

色がずれている場合は、Contrastを上げることだけで解消しようとせず、Temp／TintやColor Balanceと役割を分けます。RAWの撮影時設定の解釈を変える必要がある場合は[Camera RAW](./camera-raw)も参照してください。

## 入力方法・部分リセット

WheelsのColor Balanceは**リング内の任意の位置からドラッグ**でき、中心のインジケーターを直接つかむ必要はありません。数値欄はダブルクリックで直接入力でき、ドラッグによる微調整も可能です。

- **Color Balanceのリング内ダブルクリック**：その色バランスだけをリセットし、対応するMaster Wheelの明暗調整は残します。
- **各Color Balance右上のリセット**：その組のColor BalanceとMaster Wheelの両方をリセットします。
- **共通パラメータ名のダブルクリック**：該当パラメータを初期値へ戻します。
- **Primariesパレット右上のリセット**：パレット全体の設定をリセットします。

一部分だけ戻したいときに全体リセットを押さないよう、どの範囲が初期化される操作かを確認します。

## Auto ColorとHDR補正の注意

Primariesの**A（Auto Color）**は、現在の再生ヘッド位置のフレームを基に黒側・白側のバランスを自動補正します。公式ManualはRec.709／Gamma 2.4の条件で良い結果が得られるよう設計された処理と説明しています。自動補正後も、色かぶり・黒つぶれ・白飛びをViewerとScopesで確認します。[Shot Match](./shot-match)と同一の目的・出発点だと決めつけないでください。

HDR素材を扱う場合、Primariesと[HDRパレット](./hdr-palette)はどちらも基本補正の入口になり得ます。21.1 Manualでは、**同一Correctorノード内ではHDRパレットの処理がPrimariesより前**に置かれると説明されています。見た目が同じでも、調整の順番と階調への作用は同じではありません。

## 関連項目

- [Scopes](./scopes)：明暗・チャンネルの分布を確認する
- [Log Wheels](./log-wheels)：より限定された階調レンジで調整する
- [HDRパレット](./hdr-palette)：GlobalとZoneごとに階調を扱う
- [Custom Curves](./custom-curves)：トーンカーブで階調やチャンネルを変える
- [ColorページのNode Graph](../learn/color-node-graph)：補正を分ける・順番を確認する

## 出典・検証範囲

- **一次資料**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）, **Chapter 131 “Primaries Palette”, pp. 3141–3152**。特に各モードと共通調整（pp.3142–3148）、Lift／Gamma／Gainの作用（pp.3149–3150）、OffsetとBars（pp.3150–3151）、Logとの差（p.3152）を参照。
- [Blackmagic Design公式マニュアル（PDF）](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)
- [Blackmagic Design公式Colorページ](https://www.blackmagicdesign.com/products/davinciresolve/color)

**検証状況：partial。**公式Manual本文の該当箇所を確認したうえで構成していますが、Resolve 21.1の実機UI、マウス操作、実素材での視覚結果、特定のカラーマネージメント設定による差、すべてのプラットフォーム・editionの挙動は確認していません。上記の操作例は実機で再現済みのケースではありません。
