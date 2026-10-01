---
title: 透明Edgeの色や縁がおかしい
description: matte形状・RGB・Alpha・premultiplicationを分離して透明edge artifactを診断する。
doc_type: diagnostic
verification: partial
aliases: [黒縁, 白縁, alpha fringe, transparent edge]
concepts: [alpha, premultiplication, matte]
nodes: [Merge, Color Corrector, Delta Keyer]
tasks: [debug, transparency, color-correct, key]
symptoms: [alpha-fringe, dark-edge, bright-edge]
prerequisites: [alpha, premultiplication]
level: intermediate
product_scope: fusion
---

# 透明Edgeの色や縁がおかしい

## Fast Checks

1. source単体ですでにedge artifactがあるか。
2. Alpha shape自体は正しいか。
3. color correction前は正常か。
4. Merge前のforeground単体で問題があるか。
5. straight / premultipliedの前提を混同していないか。

## Isolate

```text
source
  → matte / key
  → color operation
  → composite
```

各stageをViewerで確認し、どこからedgeが変わるか特定します。

## Likely Causes

### Matte shapeが不十分

key / matte refinementの問題です。

### RGB edgeとAlphaのrelationが不適切

premultiplicationを疑います。

### Color operationでtransparent RGBが変化

alpha-awareな処理順を確認します。

### Merge後だけ問題が出る

Foreground / Background / Operator側へ調査範囲を移します。

## Fix

原因stageを1つに絞り、その責任だけを修正します。

premultiplicationを直すためにkey thresholdを無理に変更する、など別責任で補正しないようにします。

## Why

Alpha shapeとedge RGBは別情報で、premultiplicationはそのrelationを扱います。

→ [Premultiplication](../../learn/04-compositing/premultiplication)

## Version / Exception Notes

Node固有のpre-divide / post-multiply等のoptionはcurrent 21.1 Referenceで確認します。

## Related Symptoms

- keyは抜けているが縁だけ暗い
- color correction後だけ縁が変わる
- Mergeしたときだけhaloが出る
