---
title: "sExpand"
description: "Shape輪郭を拡張/収縮。"
doc_type: node
term_id: "sexpand"
term_short: "sExpandは、Shape輪郭を拡張/収縮。"
verification: partial
aliases: ["sExpand"]
concepts: ["shape-data"]
nodes: ["sExpand"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
tasks: ["build-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# sExpand

sExpandは、入力した<Term id="shape-data">Shape</Term>の輪郭を外側へ広げたり、内側へ縮めたりするNodeです。

Mask系のErode / Dilateに近い考え方をShape dataのまま行います。

## 入力 / 出力

1つのrequired Shape inputを受け、expanded / eroded Shapeを出力します。

    sBoolean → sExpand → sRender

## Amount

- **positive** — shapeを外側へdilate
- **negative** — shapeを内側へerode

outlineの太さを増減するのではなく、shape boundaryそのものを押し広げ / 縮めます。

## Border Style

cornerでexpanded edgeをどうjoinするか選びます。

- Bevel
- Round
- Miter
- Miter Clip

Miter / Miter ClipではMiter Limitが表示され、鋭いcornerをどこまでpointedに保つかを決めます。

## 運用例

sBooleanで複数shapeを組み合わせた後、全体を一括で少し太くする、logo outlineを膨らませる、内側へ収縮して別shapeとの差を作る用途に使えます。

## sOutlineとの違い

- **sExpand** — shape boundary自体を広げ / 縮める
- **sOutline** — compound shapeからoutline strokeを作る

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 117 pp.2741–2742で、Shape input、Amount、Border Style、Miter Limitを確認しました。
