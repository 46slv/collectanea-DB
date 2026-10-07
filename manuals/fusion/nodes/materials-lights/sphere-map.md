---
title: "Sphere Map"
description: "Sphere map texture。"
doc_type: node
term_id: "sphere-map"
term_short: "Sphere Mapは、Sphere map texture。Classic 3DのMaterial / Light処理で使うNode。"
verification: partial
aliases: ["Sphere Map", "3SPM"]
concepts: ["classic-3d"]
nodes: ["Sphere Map"]
node_family: "materials-lights"
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---

# Sphere Map

Sphere Mapは、Sphere map texture。Classic 3D sceneのsurface appearanceまたはlightingを担当します。pixelを直接加工する2D Effectではありません。

## 役割

Sphere map texture。このページでは、名前だけで選ばず、**何を受け取り、何が変わり、どのdomainへ返すか**を先に整理します。

この項目で確認できている中心的な役割は「Sphere map texture」です。exactなInspector項目が未確認の場合は、役割とdata domainを先に使って候補を絞ります。

## 入力と出力

入力分類: **classic-3d**。 出力分類: **classic-3d**。 この分類はdata domainを読むためのものです。Fusion 21.1のexactな端子名・端子数を未確認の場合、ここでは推測して固定しません。

## 使うときの判断

Materialならsurfaceの見え方、Lightなら照明の位置・方向・広がりを決める役割として選びます。

同じ目的を別Familyでも作れる場合は、後段で必要なdata domainと、Graph上で責任をどこに置きたいかで選びます。

## 最小構成

    Sphere Map → 3D Object / Merge 3D → Renderer 3D → Image

これは接続関係を理解するための最小構成案です。公式Manualのexactな作例として確認していない構成は、実制作前にViewerで中間結果を確認します。

## 確認ポイント

- 入力dataのdomainが合っているか。
- この項目のoutputを受け取れる後段Nodeへ接続しているか。
- 同じ役割を前段 / 後段で二重に処理していないか。
- source-limited pageでは、未確認のControl名・default・rangeを名前から推測していないか。

## Family内での位置づけ

3D Material / Lightノードの全体像と近いNodeの選び分けは[Family Overview](./)を参照してください。

## 出典と確認範囲

このページの役割・data domain・系譜は、既存COLLECTANEA catalogとBlackmagic Design公式資料で確認された範囲をreader-first形式へ整理しています。

Fusion 21.1 Reference Manualで個別のInspector項目・default・rangeまで確認できていない項目は、**source-limited**としてその詳細を断定していません。verification: partial はその未確認範囲を含みます。runtime REGIDや現在のEffects Library表示は別のruntime verificationで確定します。
