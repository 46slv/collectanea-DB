---
title: Flowが重い / 遅い
description: Node数だけで判断せず、domain conversion・DoD/RoI・temporal/3D/particle処理を段階ごとに切り分ける。
doc_type: diagnostic
verification: partial
aliases: [重い, 遅い, slow graph, performance]
concepts: [domain-of-definition, region-of-interest, data-domain, frame-evaluation]
patterns: [last-good-first-bad, defer-domain-conversion]
tasks: [debug, performance, optimize-graph]
symptoms: [slow-graph, slow-render, slow-viewer]
level: intermediate
product_scope: fusion
---

# Flowが重い / 遅い

## まず確認すること（Fast Checks）

1. どのNodeを追加した時点から遅くなるか。
2. Viewer previewだけ遅いのか、renderも遅いのか。
3. フレーム全体より大きなDoDを持つ分岐がないか。
4. Shape / Particle / 3D / USDを早く2Dへrenderしていないか。
5. temporal / AI / トラッキング / blur等、計算量が大きい段階はどこか。
6. 同じ処理を複数分岐で重複していないか。

## 原因を切り分ける（Isolate）

最終Outputから推測せず、Last Good / First Slowを探します。

```text
fast
  ↓
stage A
  ↓
first slow stage
  ↓
downstream
```

分岐をbypass / isolateして、負荷の入る境界を絞ります。

## 主な原因（Likely Causes）

### 不要なdomain conversion

Shape / Particle / 3D / USDを早い段階で2D Imageへ変換し、大きなraster処理を後段まで持ち回っている可能性があります。

### DoDが過剰に広い

フレーム外まで大きな有効領域を持ち、Blur等の計算範囲が増えている可能性があります。

### temporal / トラッキング / AI処理

1 フレームだけで完結しない処理やheavy analysisがbottleneckになっている可能性があります。

### 重複Graph

同じ参照元 処理を分岐ごとに繰り返している可能性があります。

## 修正方法（Fix）

1. first slow 段階を特定する。
2. specialized domainを可能な限り維持する。
3. unnecessary conversion / duplicate 段階を減らす。
4. DoD / resolutionを必要範囲へ戻す。
5. heavy Node固有のquality / cache / proxy 設定は現在の 資料で確認する。

## なぜ起きるか（Why）

「Node数が多い」だけでは性能原因を説明できません。

データ領域（data domain）、計算領域、フレーム依存、render boundaryを分けて観察します。

## バージョン・例外（Version / Exception Notes）

具体的なGPU/CPU implementation、cache、Node quality 設定はversion / hardware依存です。このページではgeneric graph diagnosisだけを所有します。

## 関連する症状（Related Symptoms）

- Viewerだけ極端に遅い
- 特定Node以降だけ遅い
- 4Kへすると急に重い
- Blur / 3D / particleを追加すると重い
