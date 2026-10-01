---
title: Flowが重い / 遅い
description: Node数だけで判断せず、domain conversion・DoD/RoI・temporal/3D/particle処理をstageごとに切り分ける。
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

## Fast Checks

1. どのNodeを追加した時点から遅くなるか。
2. Viewer previewだけ遅いのか、renderも遅いのか。
3. frame全体より大きなDoDを持つbranchがないか。
4. Shape / Particle / 3D / USDを早く2Dへrenderしていないか。
5. temporal / AI / tracking / blur等、計算量が大きいstageはどこか。
6. 同じ処理を複数branchで重複していないか。

## Isolate

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

branchをbypass / isolateして、負荷の入る境界を絞ります。

## Likely Causes

### 不要なdomain conversion

Shape / Particle / 3D / USDを早い段階で2D Imageへ変換し、大きなraster処理を後段まで持ち回っている可能性があります。

### DoDが過剰に広い

frame外まで大きな有効領域を持ち、Blur等の計算範囲が増えている可能性があります。

### temporal / tracking / AI処理

1 frameだけで完結しない処理やheavy analysisがbottleneckになっている可能性があります。

### 重複Graph

同じsource processingをbranchごとに繰り返している可能性があります。

## Fix

1. first slow stageを特定する。
2. specialized domainを可能な限り維持する。
3. unnecessary conversion / duplicate stageを減らす。
4. DoD / resolutionを必要範囲へ戻す。
5. heavy Node固有のquality / cache / proxy optionはcurrent documentationで確認する。

## Why

「Node数が多い」だけではperformance原因を説明できません。

data domain、計算領域、frame依存、render boundaryを分けて観察します。

## Version / Exception Notes

具体的なGPU/CPU implementation、cache、Node quality optionはversion / hardware依存です。このページではgeneric graph diagnosisだけを所有します。

## Related Symptoms

- Viewerだけ極端に遅い
- 特定Node以降だけ遅い
- 4Kへすると急に重い
- Blur / 3D / particleを追加すると重い
