---
title: Resolutionが合わない
description: Resize・Transform scale・frame extent・source resolutionを分けてdiagnoseする。
doc_type: diagnostic
verification: partial
aliases: [解像度が合わない, wrong resolution, size mismatch]
concepts: [resolution, aspect-ratio, domain-of-definition]
nodes: [Resize, Transform]
tasks: [debug, resize, format]
symptoms: [resolution-mismatch, wrong-size]
prerequisites: [resolution]
level: foundation
product_scope: fusion
---

# Resolutionが合わない

## Fast Checks

1. source Imageのwidth / heightは何か。
2. outputとして必要なwidth / heightは何か。
3. Resizeでresolution自体を変えているか。
4. Transform Sizeで見た目だけscaleしているか。
5. aspect / pixel aspectが違わないか。

## Isolate

resolutionを変更する可能性があるNodeだけを残します。

```text
source resolution
      ↓
Resize / format-changing stage
      ↓
output resolution
```

Transformのposition / scale問題とは分けます。

## Likely Causes

### Transform SizeとResizeを混同

見た目の大きさは変わっても、output Imageのpixel dimensionsは別問題です。

### sourceとtimeline / targetのaspectが違う

同じnormalized layoutでも見え方が変わる可能性があります。

### 途中でresolutionを変更している

複数Resize / Crop / format stageを確認します。

## Fix

1. target resolutionを決める。
2. resolution ownerを1箇所へ寄せる。
3. layout adjustmentとformat conversionを分離する。
4. output dimensionsを再確認する。

## Why

pixel dimensionsとnormalized layoutを同じ「サイズ」として扱うと、修正責任が曖昧になります。

→ [Resolution / Aspect](../../learn/03-space/resolution-aspect)

## Version / Exception Notes

Timeline format / MediaIn / Node-specific frame format behaviorはcurrent Resolve project contextを確認します。

## Related Symptoms

- 4Kにすると位置がずれる
- Resize後にMask sizeが合わない
- Viewer上の大きさは合うがoutput dimensionsが違う
