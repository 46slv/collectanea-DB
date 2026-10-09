---
title: uSwitch
description: 複数のUSD inputから1つだけを選んで後段へ渡し、input数と名前をConfigで管理するUSD Switch Node。
doc_type: node
term_id: uswitch
term_short: uSwitchは、複数USD sourceから1つを選ぶNode。
verification: partial
aliases: [uSwitch, uSw]
concepts: [usd-scene]
nodes: [uSwitch]
node_family: usd
controls: [Source, Number of Inputs, Name]
inputs: [usd]
outputs: [usd]
tasks: [usd, switch-source, variant-workflow]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uSwitch

uSwitchは、複数の<Term id="usd-scene">USD input</Term>から1つだけを選び、後段へ渡すNodeです。

asset A / B、LOD別scene、alternate environment等をFusion側で切り替えるときに使います。

## Inputs

ConfigのNumber of Inputsでinput数を増減します。

sliderでは9までですが、Manualでは数値fieldへ直接入力すると9より多く設定できると説明されています。

各inputはNameで分かりやすい名前へ変更できます。

## Source

どのinputをoutputへ通すかを選びます。

```text
USD A ─┐
USD B ─┼─ uSwitch → uMerge / uRenderer
USD C ─┘
```

## uVariantとの違い

- **uSwitch** — 別々のUSD input sourceから1つを選ぶ
- **uVariant** — 1つのUSD scene内にauthoring済みのVariant Setを切り替える

asset側にUSD Variantがない場合でもuSwitchならsource単位で切り替えられます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 pp.2921–2922で、dynamic inputs、Source、Number of Inputs、input Nameを確認しました。
