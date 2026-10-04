---
title: "Trails"
description: "時間方向の残像を生成。"
doc_type: node
term_id: "trails"
term_short: "Trailsは、時間方向の残像を生成。"
verification: partial
aliases: ["Trails", "TRLS"]
concepts: ["image-data"]
nodes: ["Trails"]
node_family: "effects-film"
inputs: ["image"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Trails

Trailsは、過去frameのImageを現在frameへ重ね、movementの後ろに残像を残すtemporal effectです。

motion blurより長いafterimage、light painting風の軌跡、multiple exposure風の表現に使います。

## 役割
current frameだけでなく過去frameのresultを蓄積し、古いframeほど弱くなるtrailを作ります。

## 注意点
時間方向のstateを持つため、frame jumpやcache状態で見え方を確認する場合は連続再生 / renderも確認します。

## Motion Blurとの違い
Motion Blurは1 frame内の移動区間をblurします。Trailsは複数frameの見た目を明示的に残します。

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 97 pp.2297–2303で、Trailsの時間方向蓄積とInspector controlsを確認しました。
