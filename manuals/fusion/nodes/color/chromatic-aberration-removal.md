---
title: Chromatic Aberration Removal
description: レンズ由来の赤・緑・青系の色縁を見分け、推定表示を確認しながらScale / Edgeで手動補正するFusionノード。
doc_type: node
term_id: chromatic-aberration-removal
term_short: レンズによって輪郭に生じた色のずれを、色の組み合わせごとに補正するノード。
verification: partial
aliases: [Chromatic Aberration Removal, CAR]
concepts: [image-data, lens]
nodes: [Chromatic Aberration Removal]
node_family: color
controls: [Lens Center, Stronger Correction, R/C Balance, G/P Balance, B/Y Balance, Brightness, R/C Scale, G/P Scale, B/Y Scale, R/C Edge, G/P Edge, B/Y Edge, Show Estimated Fringes]
inputs: [image, mask]
outputs: [image]
tasks: [chromatic-aberration, lens-correction]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Chromatic Aberration Removal

Chromatic Aberration Removalは、撮影レンズの色収差によって輪郭の周囲に生じる、赤・緑・青系の細い色のずれを手動で補正するノードです。

例えば、画面の端にある白い窓枠と暗い壁との境目が、本来は1本の輪郭なのに赤や青の線を伴って見えることがあります。レンズが色ごとの光を同じ位置へ結像できないと、このような色縁（フリンジ）が発生します。このノードでは、どの色のずれが目立つかを診断用の表示で確かめ、色の組み合わせごとに補正します。

**色収差の種類や程度によっては完全には取り除けません。** このノードが主に扱うのは、映像の輪郭で確認できる比較的軽度な色の位置ずれです。ピントの前後に広く出る色にじみや、すでに失われた細部まで復元する機能とは区別してください。

## 入力・出力

| 接続 | 役割 |
| --- | --- |
| Input（オレンジ） | 補正対象の2D画像。MediaInやLoaderなどから接続します。 |
| Effect Mask（青） | 処理を限定する任意のマスク。Rectangle、Polygonなどで範囲を指定できます。 |
| Output | 色収差を補正した2D画像を次のノードへ渡します。 |

基本的な接続は次のとおりです。

```text
MediaIn / Loader
        ↓
Chromatic Aberration Removal
        ↓
Mergeなどの画像処理
        ↓
MediaOut / Saver
```

Effect Maskは画像そのものの入力とは異なり、ノードで処理した結果を適用する範囲を制限します。画面の一部にだけ色収差が目立つ場合に利用できますが、境界で補正前後の差が見えないか確認してください。

## どの色を調整するか

InspectorのAberration Correctionには、次の3組に対応する設定があります。

| 表記 | 色の組み合わせ | 画面で探すもの |
| --- | --- | --- |
| R/C | Red / Cyan（赤 / シアン） | 赤系とシアン系に分かれた細い輪郭 |
| G/P | Green / Purple（緑 / 紫） | 緑系と紫系の色縁 |
| B/Y | Blue / Yellow（青 / 黄） | 青系と黄系の色縁 |

これは**補正・観察する色の組み合わせの名称**であり、ノードの入力端子が3組あるという意味ではありません。実際の映像では複数の色が重なって見えるため、最も目立つ組から調整します。

## Inspector：主な操作

### Aberration Correction

**Show Estimated Fringes**

推定された色縁を、灰色の背景に分離して表示する診断用の機能です。明暗のある通常映像では見つけにくい細い色ずれを探すために使います。該当するチェックを入れると、後述のEstimation Optionsも操作できるようになります。

この表示は仕上がりの色を判断するためのものではありません。補正後はチェックを外し、通常映像で輪郭と画面全体を確認します。

**R/C・G/P・B/Y Scale**

選んだ色の組み合わせで、輪郭の色ずれが重なるように調整します。特に画面の中心から外れた位置で色縁が見える場合、Scaleを少しずつ動かし、色の線が目立たなくなる方向を探します。

**R/C・G/P・B/Y Edge**

レンズの周辺部で生じるずれの違いを補償します。Scaleで大部分が改善しても、画面端だけに色縁が残る場合に追加で試します。ここでいうEdgeは**輪郭をシャープにする設定ではなく、レンズ周辺での色ずれの補正**です。

ScaleとEdgeの正確な内部計算式、値の範囲、初期値は21.1マニュアルの当該説明だけでは確定できません。数値を決め打ちせず、実際の輪郭を見ながら最小限の変更を行います。

### Estimation Options

Show Estimated Fringesを有効にしている間だけ使用できる、**色縁を見つけやすくするための表示調整**です。

- **R/C・G/P・B/Y Balance**：それぞれの色の組み合わせのバランスを変え、見えにくい色縁を判別しやすくします。
- **Brightness**：推定された色縁の表示を明るくし、細い部分を確認しやすくします。

21.1マニュアルでは、Estimation Optionsは最終画像には影響しないと説明されています。これらで色縁が消えたように見えても、実際の補正はScale / Edgeで確認します。

### Advanced Options

**Lens Center（Center X / Y）**

補正の基準となるレンズ中心を移動します。撮影後に映像をクロップしたり位置をずらして書き出したりすると、レンズの光学中心が画像の中央にないことがあります。その場合はCenter X / Yを調整し、色縁の分布に合う位置を探します。

**Stronger Correction**

21.1マニュアルでは、色縁に似た画像の特徴がある位置を示す項目として説明されています。名称だけから「すべての補正量を一定倍率で強める設定」とは解釈しないでください。具体的な作用範囲は実機確認が必要です。

## 実践例：画面端の窓枠に付いた赤・シアンの色縁を抑える

高コントラストの窓枠が画面右端にあり、赤い縁とシアンの縁が分かれて見える映像を想定します。

1. **観察する**：MediaInの後ろにChromatic Aberration Removalを入れ、Viewerを拡大して窓枠の直線と角を確認します。画像の中心付近にも同じ色ずれがあるか比較します。
2. **診断表示へ切り替える**：R/CのShow Estimated Fringesを有効にします。色縁が分かりにくければ、R/C BalanceとBrightnessを調整して位置を探します。
3. **Scaleで合わせる**：R/C Scaleを少しずつ変え、元の輪郭から離れた赤・シアンの線が最も目立たなくなる位置を探します。数値の大小より実際の輪郭を優先します。
4. **周辺だけ残る場合はEdgeを調整する**：中心に近い部分を大きく変えず、画面端の色縁が改善するか確認します。
5. **レンズ中心を再検討する**：クロップ済みの映像で左右の端の直り方が不均一なら、Lens CenterのX / Yを見直してから再調整します。
6. **通常表示で仕上げる**：Show Estimated Fringesを解除し、補正前後を切り替えます。赤・シアン以外の色縁も残る場合はG/P、B/Yを個別に確認します。最後に画像全体と別フレームを見て、無関係な輪郭が不自然になっていないか確かめます。

この例の手順・確認順序は運用上の提案であり、公式マニュアルで定められた唯一の操作順ではありません。

## 関連ノードとの使い分け

- **Chromatic Aberration Removal**：レンズ由来の色の輪郭ずれを、色の組み合わせごとに補正する。
- **[Lens Distort](../warp/lens-distort)**：レンズの樽型・糸巻き型など、画像の形や直線そのものの曲がりを補正する。色縁だけの問題とは別です。
- **[Colorノードの一覧](./index)**：色や明るさの補正、色空間変換などが目的なら、処理の種類から選びます。

CGの合成でレンズ歪みと色収差の両方がある場合は、幾何学的な位置合わせと色縁の補正を別の問題として扱います。Lens Distortで直線が合っても、色の輪郭ずれが自動的に解消するわけではありません。

## 効かない・不自然になるとき

- **色縁が見つからない**：Show Estimated Fringesと該当する色の組み合わせを確認します。表示用Balance / Brightnessで強調してから診断します。
- **Scaleを動かしても画面端に色が残る**：EdgeやLens Centerを確認します。もとの色収差がこの補正方式では扱いにくい場合もあります。
- **直線まで変わったように見える**：通常表示に戻し、拡大した輪郭と画面全体の両方を確認します。補正が強すぎないか見直します。
- **画面の一部しか変わらない**：Effect Maskが接続されていないか、必要な領域を覆っているか確認します。
- **診断表示で改善したのに仕上がりが変わらない**：Estimation Optionsは表示用です。実際の補正値であるScale / Edgeを確認します。

## 出典・バージョンと確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 93「Color Nodes」pp.2146–2148：Fusionノードの入出力、Inspector内のAdvanced Options / Estimation Options / Aberration Correctionを確認。
- 同Manual、Chapter 163「Resolve FX Revival」pp.3635–3636：同名のResolve FXについて、Lens CenterのViewer操作とStudio Version Onlyの記載を確認。

**版・製品の区別**：Chapter 163にある「Studio Version Only」はResolve FX Revivalの同名エフェクトに付く表記です。Chapter 93のFusionノードについて、これだけを根拠にFree / Studioの利用可否を断定しません。

本記事では21.1マニュアル記載の操作を説明しています。ノードの内部REGID、全設定値の初期値と範囲、Fusion Studio / Resolve Free / Resolve Studioそれぞれの実機での表示差、補正アルゴリズムやレンダリング結果は未検証です。
