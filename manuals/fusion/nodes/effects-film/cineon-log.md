---
title: "Cineon Log"
description: "Cineon Log系の変換。"
doc_type: node
term_id: "cineon-log"
term_short: "Cineon Logは、Cineon Log系の変換。"
verification: partial
aliases: ["Cineon Log", "LOG"]
concepts: ["image-data"]
nodes: ["Cineon Log"]
node_family: "effects-film"
inputs: ["image"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-03"
---
# Cineon Log

Cineon Logは、log-encoded Imageとlinear Imageを相互変換するNodeです。

名前はCineonですが、21.1 ManualではBlackmagic、ARRI、RED等の複数log camera sourceにも使えると説明されています。

## 入力
2D Imageと任意Effect Maskを受けます。

## Mode / Log Type
ModeでLog → LinまたはLin → Logを選び、Log Typeでsource / target log curveを指定します。

compositing前にlinearizeし、必要ならoutput前にlogへ戻す構成が基本です。

## Depth
processing bit depthを選びます。Autoではsource formatを基準にします。

## 最小構成

    Log Source → Cineon Log (Log to Lin) → Comp
              → Cineon Log (Lin to Log) → Saver

## 出典と確認範囲
DaVinci Resolve 21.1 Reference Manual Chapter 98 pp.2310–2313で、2 inputs、Mode、Log Type、Depth、前後配置を確認しました。
