---
title: "Repair Frame"
description: "前後フレームとOptical Flowから欠損フレームを再構築。"
doc_type: node
term_id: "repair-frame"
term_short: "Repair Frameは、前後フレームとOptical Flowから欠損フレームを再構築。motion vector / frame間motionを扱うNode。"
verification: partial
aliases: ["Repair Frame", "REP"]
concepts: ["vector-data"]
nodes: ["Repair Frame"]
node_family: "optical-flow"
inputs: ["image", "vector"]
outputs: ["image", "vector"]
tasks: ["analyze-motion"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---

# Repair Frame

Repair Frameは、前後フレームとOptical Flowから欠損フレームを再構築。frame間の動きを解析する、またはmotion vectorを使ってframe生成・修復・平滑化を行います。

## 役割

前後フレームとOptical Flowから欠損フレームを再構築。このページでは、名前だけで選ばず、**何を受け取り、何が変わり、どのdomainへ返すか**を先に整理します。

この項目で確認できている中心的な役割は「前後フレームとOptical Flowから欠損フレームを再構築」です。exactなInspector項目が未確認の場合は、役割とdata domainを先に使って候補を絞ります。

## 入力と出力

入力分類: **image / vector**。 出力分類: **image / vector**。 この分類はdata domainを読むためのものです。Fusion 21.1のexactな端子名・端子数を未確認の場合、ここでは推測して固定しません。

## 使うときの判断

vectorを作る工程か、既存vectorを使って新しいframe / resultを作る工程かを分けます。

同じ目的を別Familyでも作れる場合は、後段で必要なdata domainと、Graph上で責任をどこに置きたいかで選びます。

## 最小構成

    Image sequence / Vector → Repair Frame → Image / Vector

これは接続関係を理解するための最小構成案です。公式Manualのexactな作例として確認していない構成は、実制作前にViewerで中間結果を確認します。

## 確認ポイント

- 入力dataのdomainが合っているか。
- この項目のoutputを受け取れる後段Nodeへ接続しているか。
- 同じ役割を前段 / 後段で二重に処理していないか。
- source-limited pageでは、未確認のControl名・default・rangeを名前から推測していないか。

## Family内での位置づけ

Optical Flow / Motionノードの全体像と近いNodeの選び分けは[Family Overview](./overview)を参照してください。

## 出典と確認範囲

このページの役割・data domain・系譜は、既存COLLECTANEA catalogとBlackmagic Design公式資料で確認された範囲をreader-first形式へ整理しています。

Fusion 21.1 Reference Manualで個別のInspector項目・default・rangeまで確認できていない項目は、**source-limited**としてその詳細を断定していません。verification: partial はその未確認範囲を含みます。runtime REGIDや現在のEffects Library表示は別のruntime verificationで確定します。
