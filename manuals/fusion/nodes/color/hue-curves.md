---
title: Hue Curves
description: 画像の特定色相を選んで、色相・彩度・輝度・RGB成分を曲線で補正するFusionノード。
doc_type: node
term_id: hue-curves
term_short: 色相の範囲を指定し、その色の見え方を曲線で調整するノード。
verification: partial
aliases: [Hue Curves, HCv]
concepts: [image-data, color-adjustment, premultiplication]
nodes: [Hue Curves]
node_family: color
controls: [Mode, Color Channel Checkboxes, Spline Window, In, Out, Eyedropper, Pre-Divide/Post-Multiply]
inputs: [image, mask]
outputs: [image]
tasks: [hue-selective, color-correct]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Hue Curves

**Hue Curves（HCv）は、色相を手掛かりに画像の一部の色だけを補正するノードです。** たとえば、青い服の彩度を下げつつ、赤い背景を変えたくない場合に使います。

色相（Hue）は赤・黄・緑・青などの**色の種類**を指します。明るさや鮮やかさとは別です。Hue Curvesでは色相ごとの制御点を動かし、その色のHue・Saturation・Luminanceや個別の色成分を調整します。

色で選ぶため、**似た色相の別の物体にも補正がかかります**。青い服と青い空を自動で区別する機能ではありません。画面上の場所も限定したい場合はEffect Maskを組み合わせます。

## 入力と出力

| 端子 | 接続 | 役割 |
| --- | --- | --- |
| Input（オレンジ、必須） | MediaIn、Loaderなどの2D画像 | 補正元画像を受け取る |
| Effect Mask（青、任意） | Polygon、Rectangleなど | 補正する画面上の領域を限定する |
| Output | 次の2D画像ノード、Merge、MediaOut | 補正後の2D画像を渡す |

接続例は `MediaIn → Hue Curves → MediaOut` です。

色相の曲線が**どの色を変えるか**を決め、Effect Maskが**画面のどこを変えるか**を決めます。両方を併用すると「人物の範囲にある青い部分だけ」などへ処理を絞れます。21.1マニュアルではEffect Maskはノードの処理後に適用されると説明されています。

## Spline Window：横軸は色相

Splineは、制御点をつないで作る滑らかな曲線です。Hue Curvesのグラフは横軸がHue、縦軸が選択した成分の**補正量**です。点を上下に動かすと、その色相と周辺の色相の補正が変わります。

初期状態の点は左から**Red → Yellow → Green → Cyan → Blue → Magenta**の順に並びます。色相は円を一周すると元の色へ戻るため、グラフの左端と右端はつながっています。赤付近を調整するときは両端のつながりを意識します。

特定の青だけを狙うなら、青の点を動かし、その両側の点を元の高さに近づけて補正する範囲を狭めます。変化が急すぎると境界の色が不自然になるため、曲線とViewerの両方で確認してください。

グラフの右クリックメニューには、リセット、外部曲線の読み込み、選択点の滑らかさ調整などがあります。Spline Editor側でも曲線を編集できます。

## Color Channel Checkboxes：何を変えるか

Controlsタブのチェックボックスで、表示・編集する曲線を選びます。

| 曲線 | 変えるもの | 例 |
| --- | --- | --- |
| Hue | 色の種類 | 青を少しシアン寄りにする |
| Saturation | 色の鮮やかさ | 青い服の彩度を下げる |
| Luminance | 色の輝度 | 黄色い看板の明るさを抑える |
| 個別カラー成分 | 選択色相の各色成分 | 一部の色に偏ったRGB成分を調整する |
| Suppression曲線 | 選択色相のカラー成分の抑制 | 不要な色成分を弱める |

複数の曲線を同時に有効にできます。ただし**有効な曲線は一緒に編集されることがあります**。目的の曲線だけを有効にして操作すると、意図しない変更を避けやすくなります。

## Eyedropper：Viewerから色を拾う

1. 編集したい曲線（例：Saturation）だけを有効にします。
2. InspectorのEyedropperアイコンを**左クリックしたまま**Viewerへドラッグします。
3. 対象の色のピクセルでマウスボタンを離します。
4. その色相位置に制御点が追加されます。点を調整して結果を確認します。

**有効になっているすべての曲線に点が追加されます。** 1本だけへ点を作る場合は、ほかの曲線を無効にします。

Eyedropperで追加した点は、最初は横方向の移動がロックされています。色相方向へ位置を動かしたい場合は右クリックメニューの**Lock Selected Points**を切り替えます。制御点を選択し、**In / Out**へ値を入力すると、横軸の位置と縦軸の補正量を数値で調整できます。

## Mode：時間とともに曲線を変えるか

- **No Animation（既定）**：同じ曲線をショット全体へ適用します。
- **Animated Points**：制御点を時間に応じて変化させます。照明によって色相が変化するショットで使えます。
- **Dissolve**：過去の設定との互換性のために残された方式です。21.1マニュアルでは実質的に廃止扱いと説明されています。

Animated Pointsを使う場合は、設定したフレームだけでなくショット全体を再生し、補正が不自然に変わらないか確認します。

## 運用例：青い服だけ彩度を下げる

1. `MediaIn → Hue Curves → MediaOut` を接続し、出力をViewerへ表示します。
2. Saturation曲線だけを有効にします。
3. Eyedropperで服の青を選び、追加された点を下方向へ調整します。
4. 近い色相への影響を見ながら周囲の点を調整し、対象範囲を狭めます。
5. 補正前後を比較し、肌や背景が意図せず変化していないか確かめます。

背景にも似た青があれば、人物を囲んだPolygonなどをEffect Maskに接続します。**色相による選択と画面上の領域による選択**を組み合わせる例です。

## 運用例：ショット途中で変わる肌色を補正する

照明の変化で肌の色が変わる場合は、まずHue曲線で基準の肌色をEyedropperから指定し、小さく補正します。ショットを再生し、ある時点だけで補正が外れていないか確認します。固定した曲線で対応できなければAnimated Pointsを使って時間に合わせて調整します。

肌に近い色相の背景まで変わる場合は、顔や人物を囲んだEffect Maskを併用します。Hue Curvesだけで物体の種類は判断できません。

## Pre-Divide / Post-Multiply：透過画像の縁

RGBがAlphaによって乗算された**premultiplied画像**を色補正すると、半透明部分の色が不自然になる場合があります。

Pre-Divide / Post-Multiplyを有効にすると、補正前にRGBをAlphaで割り、処理後にAlphaを再び掛けます。透明なCG素材などの縁が不自然な場合に確認する設定です。素材のAlphaの扱いも確認してください。

詳しくは[プリマルチプライ](../../learn/04-compositing/premultiplication)を参照してください。

## 関連ノードとの違い

- [Color Curves](./color-curves)：横軸は**入力値**。RGBなどの値に対して出力値を曲線で指定します。Hue Curvesは横軸が**色相**です。
- [Color Corrector](./color-corrector)：複数の色補正や、明るさ帯域を含む補正をまとめて行うときに使います。
- Hue Curves + Effect Mask：色相だけでなく、画面上の領域も限定したいときの組み合わせです。

## 困ったとき

| 症状 | 確認すること |
| --- | --- |
| 目的以外の物体も変わる | 色相が近くないか。必要ならEffect Maskを使う |
| Eyedropperで複数曲線へ点が増える | Color Channel Checkboxesを1本に絞る |
| 点を左右に動かせない | Lock Selected Pointsを確認する |
| 赤に近い色の調整が難しい | グラフ左右がつながることを確認する |
| 時間が進むと合わなくなる | 固定曲線を見直すかAnimated Pointsを使う |
| 半透明の輪郭が不自然 | Alpha形式とPre-Divide / Post-Multiplyを確認する |

## 出典と確認範囲

Blackmagic Design, **DaVinci Resolve 21.1 Reference Manual**, Chapter 93, pp.2188–2190（Hue Curves [HCv]、入力、Mode、Color Channel Checkboxes、Spline Window、Eyedropper、In/Out、Pre-Divide/Post-Multiply）。2026-10-11確認。

服と肌の例はマニュアルで確認できる機能を組み合わせた操作例です。正確な初期値・調整範囲、Edition差、実機での表示結果は確認していないため断定していません。
