---
title: Fairlight Animator
description: Timeline / Media Poolのaudioを解析し、levelや周波数帯の変化を任意numeric parameterへ自動animationとして渡すModifier。
doc_type: node
term_id: fairlight-animator
verification: partial
aliases: [Fairlight Animator]
concepts: [audio, modifiers, time]
nodes: [Fairlight Animator]
node_family: modifiers
controls: [Analysis, Scale, Offset, High Pass Filter, Low Pass Filter, Time Scale, Time Offset]
outputs: [parameter]
tasks: [audio-reactive, modifier, motion-graphics]
product_scope: fusion
suite_surfaces: [fusion, fairlight]
updated: "2026-10-05"
---

# Fairlight Animator

Fairlight Animatorは、Fairlight audio engineの解析結果をFusionのnumeric parameterへ渡し、audio-reactive animationを作るModifierです。

bassでSizeを動かす、voice levelでGlowを変える、といった構成をkeyframeなしで作れます。

## Analysis

どのFairlight analysis valueでparameterを動かすかを選びます。

## Scale / Offset

audioから得た値をparameterの使いやすいrangeへ変換します。

## High / Low Pass Filter

周波数帯を絞ります。bassだけへ反応させる場合はLow Pass側で高域を落とします。

## Time Scale / Offset

audio analysisとvisual animationのtimingをずらします。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 124 pp.3009–3010で、audio analysis、Scale / Offset、High / Low Pass、Time controlsを確認しました。
