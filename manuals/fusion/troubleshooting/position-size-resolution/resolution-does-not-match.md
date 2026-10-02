---
title: Resolutionが合わない
description: Resize・Transform scale・フレーム extent・参照元 resolutionを分けてdiagnoseする。
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

## まず確認すること

1. 元画像（Source Image）のwidth / heightは何か。
2. outputとして必要なwidth / heightは何か。
3. Resizeでresolution自体を変えているか。
4. Transform Sizeで見た目だけscaleしているか。
5. aspect / ピクセル aspectが違わないか。

## 原因の切り分け

resolutionを変更する可能性があるNodeだけを残します。

```text
source resolution
      ↓
Resize / format-changing stage
      ↓
出力解像度（Output Resolution）
```

Transformのposition / scale問題とは分けます。

## 主な原因

### Transform SizeとResizeを混同

見た目の大きさは変わっても、output Imageのピクセル dimensionsは別問題です。

### 参照元とtimeline / 対象のaspectが違う

同じnormalized 配置でも見え方が変わる可能性があります。

### 途中でresolutionを変更している

複数Resize / Crop / format 段階を確認します。

## 修正方法

1. 対象 resolutionを決める。
2. resolution 管理元を1箇所へ寄せる。
3. 配置 adjustmentとformat conversionを分離する。
4. output dimensionsを再確認する。

## なぜ起きるか

ピクセル dimensionsとnormalized 配置を同じ「サイズ」として扱うと、修正責任が曖昧になります。

→ [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)

## バージョン・例外

Timeline format / MediaIn / Node-specific フレーム format 挙動は現在の Resolve project contextを確認します。

## 関連する症状

- 4Kにすると位置がずれる
- Resize後にMask sizeが合わない
- Viewer上の大きさは合うがoutput dimensionsが違う
