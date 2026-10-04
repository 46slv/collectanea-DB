---
title: "Light Trim"
description: "フィルム/光学的なトリム補正。"
doc_type: node
term_id: "light-trim"
term_short: "Light Trimは、フィルム/光学的なトリム補正。"
verification: partial
aliases: ["Light Trim", "LT"]
concepts: ["image-data"]
nodes: ["Light Trim"]
node_family: "effects-film"
inputs: ["image"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Light Trim

Light Trimは、log-encoded footageの露出をfilm scanner / labのlight trim pointに近い単位で調整するNodeです。

linear Imageへ変換した後ではなく、log sourceの段階で使うことを想定しています。

## Lock RGBA / Trim
Lock RGBAを有効にすると全channelを同じTrimで動かします。解除するとchannel別に調整できます。

Manualでは8 trim point = 1 stopの露出変化として説明されています。

## 最小構成

    Log Source → Light Trim → Cineon Log (Log to Lin) → Comp

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 98 pp.2320–2322で、log source、Lock RGBA、Trim、8 points = 1 stopを確認しました。
