---
title: 透明Edgeの色や縁がおかしい
description: matte形状・RGB・Alpha・premultiplicationを分離して透明エッジの乱れ（artifact）を診断する。
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

## まず確認すること（Fast Checks）

1. 参照元単体ですでにエッジの乱れ（artifact）があるか。
2. Alpha shape自体は正しいか。
3. color correction前は正常か。
4. Merge前の前景（Foreground）単体で問題があるか。
5. straight / premultipliedの前提を混同していないか。

## 原因を切り分ける（Isolate）

```text
source
  → matte / key
  → color operation
  → composite
```

各段階をViewerで確認し、どこからedgeが変わるか特定します。

## 主な原因（Likely Causes）

### Matte shapeが不十分

key / matte refinementの問題です。

### RGB edgeとAlphaの関係が不適切

premultiplicationを疑います。

### 色処理で透明部分のRGBが変化

alpha-awareな処理順を確認します。

### Merge後だけ問題が出る

Foreground / Background / Operator側へ調査範囲を移します。

## 修正方法（Fix）

原因段階を1つに絞り、その責任だけを修正します。

premultiplicationを直すためにkey thresholdを無理に変更する、など別責任で補正しないようにします。

## なぜ起きるか（Why）

Alpha shapeとedge RGBは別情報で、premultiplicationはその関係を扱います。

→ [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)

## バージョン・例外（Version / Exception Notes）

Node固有のpre-divide / post-multiply等の設定は現在の 21.1 Referenceで確認します。

## 関連する症状（Related Symptoms）

- keyは抜けているが縁だけ暗い
- color correction後だけ縁が変わる
- Mergeしたときだけhaloが出る
