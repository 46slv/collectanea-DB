---
title: "Underlay"
description: "Flow内ノード群を視覚的に囲って整理する。"
doc_type: node
term_id: "underlay"
term_short: "Underlayは、Flow内ノード群を視覚的に囲って整理する。GraphのI/O / routing / organizationを担当する項目。"
verification: partial
aliases: ["Underlay", "UND"]
concepts: ["image-data"]
nodes: ["Underlay"]
node_family: "utility-io"
tasks: ["route-data"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---

# Underlay

Underlayは、Flow内ノード群を視覚的に囲って整理する。Imageやdataの読み込み・書き出し・routing・group化・注釈等、Graphの入出力と構造を支えます。

## 役割

Flow内ノード群を視覚的に囲って整理する。このページでは、名前だけで選ばず、**何を受け取り、何が変わり、どのdomainへ返すか**を先に整理します。

この項目で確認できている中心的な役割は「Flow内ノード群を視覚的に囲って整理する」です。exactなInspector項目が未確認の場合は、役割とdata domainを先に使って候補を絞ります。

## 入力と出力

この分類はdata domainを読むためのものです。Fusion 21.1のexactな端子名・端子数を未確認の場合、ここでは推測して固定しません。

## 使うときの判断

pixel処理ではなく、source、sink、routing、reuse、organizationのどれを担当するかで選びます。

同じ目的を別Familyでも作れる場合は、後段で必要なdata domainと、Graph上で責任をどこに置きたいかで選びます。

## 最小構成

    Source / Graph → Underlay → downstream / file

これは接続関係を理解するための最小構成案です。公式Manualのexactな作例として確認していない構成は、実制作前にViewerで中間結果を確認します。

## 確認ポイント

- 入力dataのdomainが合っているか。
- この項目のoutputを受け取れる後段Nodeへ接続しているか。
- 同じ役割を前段 / 後段で二重に処理していないか。
- source-limited pageでは、未確認のControl名・default・rangeを名前から推測していないか。

## Family内での位置づけ

Utility / I/Oノードの全体像と近いNodeの選び分けは[Family Overview](./)を参照してください。

## 出典と確認範囲

このページの役割・data domain・系譜は、既存COLLECTANEA catalogとBlackmagic Design公式資料で確認された範囲をreader-first形式へ整理しています。

Fusion 21.1 Reference Manualで個別のInspector項目・default・rangeまで確認できていない項目は、**source-limited**としてその詳細を断定していません。verification: partial はその未確認範囲を含みます。runtime REGIDや現在のEffects Library表示は別のruntime verificationで確定します。
