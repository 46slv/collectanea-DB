---
title: Keyframe Stretcher
description: 指定したsource range内のkeyframe animationを、compやtemplateの長さへ合わせて時間方向に伸縮するNode。
doc_type: node
term_id: keyframe-stretcher
term_short: keyframe animationのtimingを長さに合わせて伸縮するNode。
verification: partial
aliases: [Keyframe Stretcher, KFS]
concepts: [time, keyframes, template]
nodes: [Keyframe Stretcher]
node_family: time-metadata
inputs: [image]
outputs: [image]
tasks: [retime-animation, template, keyframe-stretch]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Keyframe Stretcher

Keyframe Stretcherは、Fusion compositionやtemplateの長さが変わったとき、指定範囲のkeyframe animationを時間方向へ伸縮して追従させるNodeです。

titleのintro / outroを保ちつつ中央のhold区間だけ伸ばす、といったtemplate設計で使います。

## 役割

animation全体を単純speed changeするのではなく、どの区間をstretch対象にするかを決めてtimingを再配分します。

## 使う場面

- Fusion Title / transition templateの長さ変更
- intro / outro timingを維持したままhold区間を伸ばす
- 複数parameterにまたがるkeyframe timingをまとめて調整する

## Modifier版との違い

Key Stretcher Modifierはparameter側で時間を伸縮します。Keyframe Stretcher NodeはNode graph内のstreamとして扱います。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 111 pp.2597–2599で、Keyframe Stretcherの独立Node sectionを確認しました。
