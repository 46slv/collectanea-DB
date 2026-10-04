---
title: Anim Curves
description: 既存animationのtiming・value・accelerationを非破壊的にstretch / bounce / mirrorし、template duration変更へ追従させるModifier。
doc_type: node
term_id: anim-curves
verification: partial
aliases: [Anim Curves, Animation Curves]
concepts: [keyframes, time, modifiers]
nodes: [Anim Curves]
node_family: modifiers
outputs: [parameter]
tasks: [retime-animation, template, modifier]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Anim Curves

Anim Curvesは、parameterに付いたanimationのtimingやvalue curveを、元keyframeを直接作り直さずに変形するModifierです。

templateの長さ変更へanimationを追従させる、bounceやmirrorを加える、といった用途に向きます。

## 使う場面

- Edit / Cut page用Fusion Title / transitionのduration変更
- animation全体のstretch / squash
- easingやbounceの追加
- curveのmirror / repeat

## Keyframe Stretcherとの違い

Anim Curvesはcurve shape / timingをModifierとして調整します。Keyframe Stretcherは指定rangeをtemplate durationへstretchする用途に特化します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 124 pp.2992以降で、Anim Curvesの目的とtemplate duration追従を確認しました。
