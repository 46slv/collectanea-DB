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
updated: "2026-10-04"
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

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 94、pp.2208–2210で、3つの任意入力、Background / Foreground control、7種類のOperation、Gradient Map、解像度処理、Wipe controlsを確認しました。

内部REGID、各transitionの実機描画、GPU性能、Edition差は未確認のため `verification: partial` を維持します。
