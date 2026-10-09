---
title: Switch
description: 複数のImage inputから1つを選択し、Sourceをanimationしてshot内でsourceを切り替えるNode。
doc_type: node
term_id: switch
term_short: 複数2D Image sourceから1つを選ぶNode。
verification: partial
aliases: [Switch, Swi]
concepts: [image-data, time]
nodes: [Switch]
node_family: time-metadata
controls: [Source]
inputs: [image]
outputs: [image]
tasks: [switch-input, alternate-source]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Switch

Switchは、複数の2D <Term id="image">Image</Term> inputから1つだけをoutputへ通すNodeです。

複数sourceをMergeするのではなく、どれを選ぶかをSource parameterで切り替えます。

## Source

現在どのinputを通すかを選びます。Sourceはanimationできるため、frameごとに別sourceへ切り替えることもできます。

## Dissolveとの違い

- Switch: ある時点で1 inputを選ぶ
- Dissolve: 2 inputを連続割合でmixする

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 111 p.2606で、Switchの独立Node sectionとsource選択用途を確認しました。
