---
title: uExport
description: Fusion内のUSD sceneを.usd / .usda / .usdc / .usdzとして書き出し、geometry・material・animation・lightingを外部へ渡すNode。
doc_type: node
term_id: uexport
term_short: uExportは、USD sceneをUSD fileへ書き出すNode。
verification: partial
aliases: [uExport, uEx]
concepts: [usd-scene, file-io]
nodes: [uExport]
node_family: usd
controls: [Export Stage, Format]
inputs: [usd]
outputs: [usd]
tasks: [usd, export-usd, interchange]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# uExport

uExportは、Fusion内で組んだ<Term id="usd-scene">USD scene</Term>をUSD fileへ書き出すNodeです。

geometry、material、animation、lightingを含むsceneを外部DCCや別工程へ渡すために使います。

## 入力

1つのUSD Scene inputを受け取ります。

```text
uLoader / uShape
      ↓
uMerge
      ↓
uExport
```

## Export Stage

file browserを開き、書き出し先を指定します。

uRendererのようにImageを生成するNodeではなく、USD scene dataをdiskへ保存するI/O Nodeです。

## Format

21.1 Manualでは次のformatを選べます。

- USD `.usd`
- USD ASCII `.usda`
- USD binary `.usdc`
- USD packaged `.usdz`

用途や受け渡し先に合わせます。

## uRendererとの違い

- **uExport** — USD sceneをUSD fileとして保存
- **uRenderer** — USD sceneを2D Image / AOVへrender

「3D sceneを他appへ渡す」のか「最終pixelを作る」のかで選びます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 121 p.2900で、USD scene input、Export Stage、4 format、scene export用途を確認しました。

linked USD hierarchy exportの詳細とexternal DCC互換性は未確認です。
