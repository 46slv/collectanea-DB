---
title: Dissolve
description: 2つのImageをBackground/Foreground比率で混ぜ、クロスフェード、Wipe、入力切り替えを作るComposite Node。
doc_type: node
term_id: dissolve
term_short: 2入力の混合率を動かして、クロスフェードやWipe、入力切り替えを作るNode。
verification: partial
aliases: [Dissolve, DX]
concepts: [image-data, compositing]
nodes: [Dissolve]
node_family: compositing
controls: [Operation, Background/Foreground, Wipe Style, Invert Wipe, Softness, Border, Border Softness, Border Color]
inputs: [image]
outputs: [image]
tasks: [composite, transition, switch-input]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-28"
---

# Dissolve

Dissolveは、2つの<Term id="image">2D Image</Term>を混ぜ、その割合を動かしてクロスフェードやWipe、入力切り替えを作るNodeです。

[Merge](./merge)がForegroundをBackgroundへ「重ねる」Nodeなのに対し、Dissolveは**BackgroundとForegroundのどちらをどの割合で出すか**を切り替える用途が中心です。

## 入力

### Background

混ぜる1つ目のImageです。

DissolveではBackgroundを必ず接続する必要はありません。Foregroundだけでも、Background / Foreground controlの状態に応じて利用できる側の入力を出力できます。

### Foreground

混ぜる2つ目のImageです。

21.1 Manualでは、BackgroundとForegroundは同じ解像度・Pixel Aspectに揃えることが推奨されています。

### Gradient Map

Gradient Wipeを選んだ場合だけ使う任意入力です。

このImageの明るさを使って、どの部分から切り替わるかを制御します。グラデーションだけでなく、幾何学模様、Fast Noise、映像素材などを使えます。

## 出力

Background / Foreground controlとOperationで決まった2D Imageを出力します。

片方の入力がその時点で利用できない場合は、もう一方が出力されます。この性質を使い、長さの違う素材を自動的に切り替える構成もManualで説明されています。

## 主な設定項目

### Operation

切り替え方を7種類から選びます。

- **Dissolve**: 標準的なクロスフェード
- **Additive Dissolve**: 2枚目を加算するように見せながら切り替える
- **Erode**: Backgroundの暗い部分が広がるようにForegroundを現す
- **Random Dissolve**: ランダムな点のパターンで切り替える
- **Random Noise Dissolve**: 動くランダムパターンで切り替える
- **Gradient Wipe**: Gradient Mapの輝度で切り替え位置を決める
- **SMPTE Wipe**: 水平・垂直の基本Wipe

### Background / Foreground

出力をBackground側、Foreground側、その中間のどこにするかを決めます。

既定はForeground側です。通常はこの値をアニメーションしてtransitionを作ります。

### Wipe Style / Invert Wipe

SMPTE Wipeで表示されます。

Horizontal - Left to RightまたはVertical - Top to Bottomを選び、Invert Wipeで方向を反転できます。

### Softness / Border

Gradient WipeまたはSMPTE Wipeの境界を柔らかくしたり、境界線を付けたりします。

Borderを有効にすると、Border SoftnessとBorder Colorを調整できます。

## Gradient WipeとSMPTE Wipeの違い

**Gradient Wipe**は、3つ目の入力に接続した画像の明るさを使って、2枚の画像が切り替わる位置を決めます。たとえば、中央が明るく周辺が暗い画像なら、その明暗分布に沿った切り替えを設計できます。白黒の画像を作るだけでなく、Fast Noise、雨や水面の映像、図形などもGradient Mapとして使えます。

```text
素材A ─────────────→ Dissolve（Background）→ MediaOut
素材B ─────────────→ Dissolve（Foreground）
Fast Noise ───────→ Dissolve（Gradient Map）
```

この構成でOperationを**Gradient Wipe**にし、Background / Foregroundを0から1へアニメーションさせると、単純な全面フェードではなくGradient Mapの明暗に従って画像が入れ替わります。どちらの明暗域から先に切り替わるか、境界の正確な画素値は、ここでは実機確認していません。

Gradient Wipeと**SMPTE Wipe**では、次の境界用Controlを使えます。

- **Softness**：切り替え境界を柔らかくする。
- **Border**：切り替え境界へ色付きの縁を付ける。
- **Border Softness / Border Color**：Border有効時に、縁の幅・濃さと色を変える。
- **Wipe Style / Invert Wipe**：SMPTE Wipe専用。左右へ進む水平Wipeか上下へ進む垂直Wipeを選び、Invert Wipeで進行方向を反転する。

**Random Dissolve**はランダムな点模様、**Random Noise Dissolve**は動く点模様で切り替える方式です。模様を自分で入力したいならGradient Wipe、水平・垂直の規則的な境界が必要ならSMPTE Wipeから検討します。これらの違いは21.1 ManualのOperation説明に基づきます。

### 1つのGraphで比較する

1. 同じ解像度・Pixel Aspectの素材AとBをDissolveのBackgroundとForegroundへ接続し、まずOperationをDissolveにします。Background / Foregroundの値0・0.5・1で、全面的な混合になっていることを確認します。
2. Fast NoiseをGradient Mapへ接続し、OperationをGradient Wipeへ切り替えます。0・0.5・1の同じ値を使い、全面フェードとの差を比較します。
3. Fast Noiseへの接続は残したまま、OperationだけをSMPTE Wipeへ変え、Wipe Styleの水平／垂直とInvert Wipeを比較します。このOperationではGradient Mapを切り替えの基準に使いません。
4. Gradient WipeまたはSMPTE Wipeへ戻し、Softnessを変えて境界を比較した後、BorderをオンにしてBorder ColorとBorder Softnessの役割を確認します。

これは**Manualに記載されたControlを使う確認手順の提案**です。3入力を使ったGradient Wipe、SMPTE Wipe、Borderの描画結果は21.1実機では未検証です。既存の実機例S29は、通常のDissolveだけの比較です。

## 解像度の扱い

Dissolveでは、入力解像度が違うと出力解像度がcontrol位置によって変わる点に注意します。

- 完全にBackground側: Background入力の解像度
- 完全にForeground側: Foreground入力の解像度
- 中間で混合: 2入力のうち大きい方の解像度

そのため、たとえば4Kと8Kを混ぜると、controlを端から中間へ動かした時点で出力解像度が変わる可能性があります。

transition用では、2入力の解像度とPixel Aspectを揃えておく方が安定して扱えます。

## 最小構成

```text
Background ─┐
            ├─ Dissolve → Output
Foreground ─┘
```

Gradient Wipeの場合:

```text
Background ───┐
Foreground ───┼─ Dissolve → Output
Gradient Map ─↑
```

## 運用例

2つのクリップを普通にクロスフェードする場合は、OperationをDissolveにしてBackground / Foregroundをアニメーションします。

ノイズで不規則に切り替えたい場合はGradient Wipeを選び、Fast Noise等をGradient Mapへ接続します。最初はSoftnessやBorderを触らず、Mapの明暗だけでどの部分から切り替わるか確認すると役割を分けやすくなります。

### 長さの違う素材を自動で切り替える

Dissolveは、片方の入力がその時点で使えなくなった場合に、もう片方の入力を出力する動作も持ちます。21.1 Manualでは、**短い方の素材をBackground / Foregroundの極端な位置で選択**しておくと、その素材が最後のフレームを過ぎた後で長い方へ自動で切り替わる構成が説明されています。

例えば、長い背景映像をBackground、先に終わる短い映像をForegroundへ接続してBackground / Foregroundを**Foreground側（1）**へ固定します。最初は短い方が表示され、短い方の有効フレームが終わると、利用可能なBackgroundへ切り替わる想定です。**値を途中で動かすクロスフェードとは別の機能**であり、終端で滑らかにフェードするとは限りません。

この例はManualの記述を使った構成案です。具体的なMediaInの時間範囲、ループ設定、ホストでのフレーム境界や実際の切り替わり方は未確認です。

## 実機で混合率0・0.5・1を比べる

Resolve Studio 21.1.0.14、Windows、日本語UIで撮影しました。Backgroundへ1920×1080のテストチャート、Foregroundへ同じ寸法のオレンジ一色の画像を接続しています。

[![chart.png LoaderをDissolve1のBackgroundへ、Gold1をForegroundへ接続してMediaOut1へ送る実機Graph](/img/fusion/captures/S29/graph.png)](/img/fusion/captures/S29/graph.png)

[![Dissolve1 Inspector。処理はDissolve、背景/前景の値は0.5](/img/fusion/captures/S29/inspector.png)](/img/fusion/captures/S29/inspector.png)

[![左は入力チャート、右はDissolveの混合率0.5でチャートとオレンジ色が混ざった結果](/img/fusion/captures/S29/compare.png)](/img/fusion/captures/S29/compare.png)

処理をDissolveにし、Background / Foregroundを0.5にした状態です。左Viewerは入力チャートのまま、右だけが混合結果です。

[![混合率0では右のDissolve出力が左のBackground入力チャートと同じになる](/img/fusion/captures/S29/background.png)](/img/fusion/captures/S29/background.png)

[![混合率1では右のDissolve出力がForegroundのオレンジ一色になる](/img/fusion/captures/S29/foreground.png)](/img/fusion/captures/S29/foreground.png)

0ではBackground、1ではForegroundが見えます。比較後は0.5へ戻しました。フレーム0、両Viewer 40%の静止比較です。時間変化を付けたtransitionや、他のOperation、異なる寸法の入力は確認していません。

[再現用Graph](/img/fusion/captures/S29/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S29/capture.json)

## Mergeとの違い

- **Merge**: ForegroundをBackgroundへ合成し、AlphaやApply Modeで重ね方を決める
- **Dissolve**: 2入力の混合率を動かし、transitionや切り替えを作る

2枚の素材を常に同時表示してレイヤー合成したいならMerge、時間とともに片方から片方へ移したいならDissolveから検討すると選びやすくなります。

## 関連する考え方

- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)
- [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)

## 関連Node

- [Merge](./merge) — 2枚を前景・背景として重ねる
- [MultiMerge](./multi-merge) — 多数Layerを1 Nodeで管理する

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 94、pp.2208–2210で、3つの任意入力、Background / Foreground control、7種類のOperation、Gradient Map、解像度処理、Wipe controls、片方の入力の終端時に利用可能な入力へ切り替える動作を確認しました。公式資料：[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)。

掲載例以外のtransition、Gradient Map・SMPTE Wipe・Border、素材終端での自動切り替えの実機描画、GPU性能、Edition差は未確認のため `verification: partial` を維持します。
