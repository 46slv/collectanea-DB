---
title: "Chroma Keyer"
description: "クロマキー。"
doc_type: node
term_id: "chroma-keyer"
term_short: "Chroma Keyerは、クロマキー。"
verification: partial
aliases: ["Chroma Keyer", "CKY"]
concepts: ["image-data", "alpha"]
nodes: ["Chroma Keyer"]
node_family: "matte-keying"
inputs: ["image"]
outputs: ["image"]
tasks: ["create-matte"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Chroma Keyer

Chroma Keyerは、指定した色をImageから選び、その色域をtransparentにしてAlpha matteを作るgeneral-purpose keyerです。

green / blue screen専用のDelta KeyerやPrimatteと違い、任意色を対象にできます。

## 入力
Input、Garbage Matte、Solid Matte、Effect Maskの4 inputを持ちます。

Garbage Matteは強制transparent、Solid Matteは強制opaque領域を作ります。

## 使う判断
任意色を単純に抜くならChroma Keyer、green / blue screen shotではManualはDelta KeyerまたはPrimatteを先に検討するよう案内しています。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2506–2511で、4 inputs、任意色keying、Garbage / Solid Matteを確認しました。
