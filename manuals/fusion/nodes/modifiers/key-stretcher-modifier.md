---
title: Key Stretcher Modifier
description: Templateのduration変更に合わせ、animated parameterのkeyframe rangeをstretchしてintro / outro timingを保つModifier。
doc_type: node
term_id: key-stretcher-modifier
verification: partial
aliases: [Key Stretcher Modifier, KeyStretcher]
concepts: [keyframes, time, template, modifiers]
nodes: [Key Stretcher Modifier]
node_family: modifiers
outputs: [parameter]
tasks: [template, retime-animation, modifier]
product_scope: fusion
suite_surfaces: [fusion, edit, cut]
updated: "2026-10-05"
---

# Key Stretcher Modifier

Key Stretcher Modifierは、Edit / Cut page用Fusion templateの長さが変わったとき、animated parameterのkeyframe timingをstretchするModifierです。

intro / outroは保ちつつ、中央のhold / loop区間だけ伸ばすtitle template等で使います。

## 適用

対象parameterを右clickし、Modify With > KeyStretcherから追加します。

## Keyframe Stretcher Nodeとの関係

ManualはこのModifierのcontrol説明をMiscellaneous NodesのKeyframe Stretcherへ案内しています。

- Keyframe Stretcher: Node
- Key Stretcher Modifier: parameterへ直接追加

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 124 p.3011とChapter 111 pp.2597–2599を基にしています。
