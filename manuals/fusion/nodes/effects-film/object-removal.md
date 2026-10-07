---
title: Object Removal
description: Optical Flow解析と周辺frameの情報を使い、選択した不要物を時間方向の画像情報で埋めて除去するStudio限定Node。
doc_type: node
term_id: object-removal
term_short: 周辺frameを解析して不要物を自動補完するStudio限定Node。
verification: partial
aliases: [Object Removal, ORm]
concepts: [image-data, optical-flow, mask-data]
nodes: [Object Removal]
node_family: effects-film
inputs: [image, mask]
outputs: [image]
tasks: [object-removal, cleanup]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Object Removal

Object Removalは、shot内の不要物をMaskで指定し、前後frameの画像情報とmotion解析を使って背景を補完するStudio限定Nodeです。

単純なClone Paintではなく、時間方向の情報を使って「その物体が無ければ後ろに何が見えたか」を推定します。

## 基本構成

    Footage → Object Removal → Output
                 ↑
              Object Mask

## 使う場面

- 一時的に画面へ入った人物・物体の除去
- wire / marker / small rigのcleanup
- 背景が前後frameで見えているobjectの除去

背景が一度も見えない、複雑なparallaxやreflectionがある場合は自動補完だけで完結しないことがあります。

## Paintとの違い

Paint / Cloneは人がsourceを指定して塗ります。Object Removalは時間方向の解析からsourceを推定します。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 97 pp.2288–2290で、Object Removalの独立Node sectionと時間方向の補完workflowを確認しました。Studio限定です。
