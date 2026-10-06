---
title: Soft Glow
description: 明るいpixelをThresholdで選び、Gain・Glow Size・Color Scaleで柔らかいhaze状の発光を作るGlow系Node。
doc_type: node
term_id: soft-glow
verification: partial
aliases: [Soft Glow, SGlo]
concepts: [image-data, mask-data, filtering, domain-of-definition]
nodes: [Soft Glow]
node_family: blur-filter
controls: [Filter, Color Channels, Threshold, Gain, Lock X/Y, Glow Size, Num Passes, Clipping Mode, Blend, Color Scale]
inputs: [image, mask, mask]
outputs: [image]
tasks: [soft-glow, haze, beauty, dream-look]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# Soft Glow

Soft Glowは、Glowより柔らかく自然な発光を作るNodeです。

atmospheric haze、skin highlight、planet glow、dream-like lookのように、硬いhaloより広く滑らかなlight spreadが欲しい場合に向きます。

## 入力

Input、Effect Mask、Glow Maskの3 inputを持ちます。

Glow Maskは処理前に発光sourceを限定するpre-maskなので、mask外側へhaloを伸ばせます。Effect Maskは最終resultを限定します。

## Threshold

どれだけ明るいpixelからSoft Glowへ参加させるかを決めます。

上げるほどhighlightだけがglowし、midtone / shadowは影響を受けにくくなります。

## Gain

Glowのbrightnessです。

## Glow Size

haloの広がりです。

Lock X/Yを外すとhorizontal / verticalで別sizeにできます。

## Filter / Num Passes

Box / Bartlett / Multi-box / Gaussianからblur methodを選びます。

Multi-boxではNum Passesを増やすとよりsmoothになりますがrender timeも増えます。

## Color Scale

RGBA channelごとにglowをtintします。

## Clipping Mode

Frame / Domain / NoneでDoD edgeをどう扱うかを選びます。

大きなGlowでedgeが切れる場合の確認項目です。

## Glowとの違い

Soft GlowはThreshold / Gainを使ってhighlightから柔らかいhazeを作る方向に特化しています。

graphicな強いhaloやApply Modeのvariationが必要なら[Glow](./glow)を検討します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 92 pp.2121–2124で、3 inputs、Filter、Threshold、Gain、Glow Size、Num Passes、Clipping Mode、Blend、Color Scaleを確認しました。
