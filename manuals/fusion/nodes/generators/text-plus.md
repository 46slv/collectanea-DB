---
title: Text+
description: Styled Text・配置・Shading等を持つFusionの2D text generator。
doc_type: node
term_id: text-plus
verification: partial
aliases: [Text+, Text Plus, TXT+]
concepts: [image-data, parameter-data, keyframes]
nodes: [Text+]
node_family: generators
controls: [Styled Text, Layout, Shading, Follower]
outputs: [image]
tasks: [text, motion-graphics, title, animate]
level: foundation
product_scope: fusion
suite_surfaces: [fusion, edit]
---

# Text+

2D text Imageを生成するFusion Nodeです。

## 概要

- **分類（Family）**: Generators / Text
- **主出力（Primary output）**: 2D Image
- **関連概念（Core concepts）**: Text generation、配置、Shading、アニメーション
- **よく使う作業（Common tasks）**: title、lower third、モーショングラフィックス、template 参照元

## 入力

Text+はGeneratorとして扱います。primary Image inputを前提にしない構成が基本ですが、Effect Mask等を含む補助入力（auxiliary inputs）の正確な仕様はFusion 21.1 実機 / マニュアルで確認します。

## 出力

textを描画した2D Imageを出力します。

## 主な設定項目

### Styled Text

表示する文字列を持つ主要controlです。

### 配置

textの配置・配置に関わる領域です。正確な mode / control名は21.1確認後に細分化します。

### Shading

文字の見た目を複数layerで構成する機能群です。layer数・設定・初期値は現在の manualで確認します。

### Follower

文字単位のアニメーションへ関係する機構としてlegacy Fusion referenceで確認されています。21.1の正確な 挙動は今後の専用Reference対象です。

## 挙動と注意点

Text+を単なる「文字を出すNode」としてだけ扱わず、

- 内容
- 配置
- visual styling
- アニメーション

を分けて読むと、Template化したときに公開controlを選びやすくなります。

## 最小例

### Text over image

```text
Text+ ──────┐
            ├─ Merge → Output
Image ──────┘
```

## 関連する考え方

- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates)
- [キーフレーム / スプライン / 時間（Keyframe / Spline / Time）](../../learn/05-time/keyframes-spline-time)

## 関連パターン

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## 似たNode・関連Node

- MultiText
- Text3D
- sText

これらはデータ領域（data domain）や用途が異なるため、Text+の単純な上位互換として扱いません。

## バージョンと検証状況

Text+の存在とStyled Text / 配置 / Shading / Follower系の位置づけはBlackmagic Design公式Fusion系資料で確認済み。Fusion 21.1の正確な ports、control defaults、範囲は未検証です。
