---
title: "Set Domain"
description: "Domain of Definitionを明示的に変更。"
doc_type: node
term_id: "set-domain"
term_short: "Set Domainは、Domain of Definitionを明示的に変更。time / metadata / domainを扱うNode。"
verification: partial
aliases: ["Set Domain", "DOD"]
concepts: ["image-data"]
nodes: ["Set Domain"]
node_family: "time-metadata"
inputs: ["image"]
outputs: ["image"]
tasks: ["retime"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---

# Set Domain

Set Domainは、Domain of Definitionを明示的に変更。Imageの再生time、metadata、bit depth、Domain of Definition等、画素以外も含む付帯情報を変更します。

## 役割

Domain of Definitionを明示的に変更。このページでは、名前だけで選ばず、**何を受け取り、何が変わり、どのdomainへ返すか**を先に整理します。

この項目で確認できている中心的な役割は「Domain of Definitionを明示的に変更」です。exactなInspector項目が未確認の場合は、役割とdata domainを先に使って候補を絞ります。

## 入力と出力

入力分類: **image**。 出力分類: **image**。 この分類はdata domainを読むためのものです。Fusion 21.1のexactな端子名・端子数を未確認の場合、ここでは推測して固定しません。

## 使うときの判断

見た目のEffectかではなく、time mapping、metadata、DoD、precisionのどれを変えるNodeかを確認します。

同じ目的を別Familyでも作れる場合は、後段で必要なdata domainと、Graph上で責任をどこに置きたいかで選びます。

## 最小構成

    Image / Time / Metadata → Set Domain → Result

これは接続関係を理解するための最小構成案です。公式Manualのexactな作例として確認していない構成は、実制作前にViewerで中間結果を確認します。

## 確認ポイント

- 入力dataのdomainが合っているか。
- この項目のoutputを受け取れる後段Nodeへ接続しているか。
- 同じ役割を前段 / 後段で二重に処理していないか。
- source-limited pageでは、未確認のControl名・default・rangeを名前から推測していないか。

## Family内での位置づけ

Time / Metadata / Utilityノードの全体像と近いNodeの選び分けは[Family Overview](./)を参照してください。

## 出典と確認範囲

このページの役割・data domain・系譜は、既存COLLECTANEA catalogとBlackmagic Design公式資料で確認された範囲をreader-first形式へ整理しています。

Fusion 21.1 Reference Manualで個別のInspector項目・default・rangeまで確認できていない項目は、**source-limited**としてその詳細を断定していません。verification: partial はその未確認範囲を含みます。runtime REGIDや現在のEffects Library表示は別のruntime verificationで確定します。
