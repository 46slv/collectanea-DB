---
title: Tracker
description: 点トラッキング（point tracking）を行い、Match Move / Stabilize等へ利用する基本トラッキング Node。
doc_type: node
verification: unverified
aliases: [Tracker, TRA, Point Tracker]
concepts: [tracking, parameter-data, coordinate-space]
nodes: [Tracker]
node_family: tracking
inputs: [image]
outputs: [image]
tasks: [track, point-track, match-move, stabilize]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Tracker

点トラッキング（point tracking）を行い、Match Move / Stabilize等へ利用する基本トラッキング Nodeです。

## 概要（At a Glance）

- **分類（Family）**: トラッキング
- **主入力（Primary input）**: 2D Image
- **関連概念（Core concepts）**: point 動き、トラッキング data
- **よく使う作業（Common tasks）**: 点トラッキング（point tracking）、match move、stabilize

## 入力（Inputs）

### Image

トラッキング対象の2D Imageを受け取ります。

## 出力（Output）

トラッキング 結果を持つToolですが、正確な 21.1 Image output / data export 仕組みは現在の資料または実機での確認待ちです。

## 主な設定項目（Controls）

tracker points、search / pattern region、match move / stabilize等に関わるcontrolを持つ系統ですが、正確な 21.1 UI / defaultsは未検証です。

## 挙動と注意点（Behavior / Notes）

Planar Trackerが平面動きを解くのに対し、Trackerは点トラッキング（point tracking）を中心に扱います。

どちらを使うかは「何を追うか」と「結果をどのspaceへ適用するか」で選びます。

## 最小例（Minimal Examples）

footage上の特徴点をtrackし、その動きを別elementへ適用する構成を検討します。

## 関連する考え方（Concepts）

- [データ領域（data domain）を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 関連する再利用構成（Patterns）

- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)

## 似たNode・関連Node

- Planar Tracker
- Planar Transform
- Camera Tracker

## バージョンと検証状況

Trackerの存在と点トラッキング（point tracking） / Match Move / Stabilize 役割は旧版のBlackmagic Design公式Fusion資料で確認。Fusion 21.1での正確な設定項目 / operation modesは未検証です。
