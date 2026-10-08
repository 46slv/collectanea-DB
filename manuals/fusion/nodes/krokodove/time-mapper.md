---
title: "Time Mapper"
description: "外部image mapでsequence timeを組み合わせる。"
doc_type: node
term_id: "time-mapper"
term_short: "Time Mapperは、外部image mapでsequence timeを組み合わせる。Krokodove固有のtool。"
verification: partial
aliases: ["Time Mapper"]
concepts: ["image-data"]
nodes: ["Time Mapper"]
node_family: "krokodove"
inputs: ["image"]
outputs: ["image"]
tasks: ["motion-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---

# Time Mapper

Time Mapperは、外部image mapでsequence timeを組み合わせる。Krokodove固有のtoolです。名前だけで2D Image Nodeと判断せず、Input / Output domainとFamily Overviewを先に確認します。

## 役割

外部image mapでsequence timeを組み合わせる。このページでは、名前だけで選ばず、**何を受け取り、何が変わり、どのdomainへ返すか**を先に整理します。

同じframeの画素処理ではなく、どのsource timeをcurrent frameへ対応させるかを確認します。

## 入力と出力

入力分類: **image**。 出力分類: **image**。 この分類はdata domainを読むためのものです。Fusion 21.1のexactな端子名・端子数を未確認の場合、ここでは推測して固定しません。

## 使うときの判断

KrokodoveはImage、Shape、3D、Regionが同じchapterに並ぶため、まずOutput domainで候補を絞ります。

同じ目的を別Familyでも作れる場合は、後段で必要なdata domainと、Graph上で責任をどこに置きたいかで選びます。

## 最小構成

    Image / Source → Time Mapper → Result

これは接続関係を理解するための最小構成案です。公式Manualのexactな作例として確認していない構成は、実制作前にViewerで中間結果を確認します。

## 確認ポイント

- 入力dataのdomainが合っているか。
- この項目のoutputを受け取れる後段Nodeへ接続しているか。
- 同じ役割を前段 / 後段で二重に処理していないか。
- source-limited pageでは、未確認のControl名・default・rangeを名前から推測していないか。

## Family内での位置づけ

Krokodoveノードの全体像と近いNodeの選び分けは[Family Overview](./)を参照してください。

## 出典と確認範囲

このページの役割・data domain・系譜は、既存COLLECTANEA catalogとBlackmagic Design公式資料で確認された範囲をreader-first形式へ整理しています。

Fusion 21.1 Reference Manualで個別のInspector項目・default・rangeまで確認できていない項目は、**source-limited**としてその詳細を断定していません。verification: partial はその未確認範囲を含みます。runtime REGIDや現在のEffects Library表示は別のruntime verificationで確定します。
