---
title: Merge / Mask / Alphaの読み替え
description: Nuke Merge経験をFusion Mergeへ移すとき、input namingとalpha/premult semanticsを分離して読む。
doc_type: bridge
verification: partial
product_scope: fusion
familiar_apps: [nuke]
familiar_terms: [Merge, A input, B input, mask, premult]
compare_topics: [merge, alpha, mask, premultiplication]
suite_surfaces: [fusion]
tasks: [composite, mask, transparency]
---

# Merge / Mask / Alphaの読み替え

## Nukeで知っている考え方

Nuke MergeはA / B inputとmaskを持ち、合成 algorithmを選んで複数Imageを合成します。

Foundryの現在の Merge 資料では、多くのmerge operationでpremultiplied inputを想定すると説明されています。

## Resolveで最初に決めること

Fusion Mergeでは、まずNukeのA/B namingを忘れ、Fusionの役割を読みます。

- Background
- Foreground
- Effect Mask

## Fusionでの考え方

```text
Foreground ─┐
            ├─ Merge → Output
Background ─┘
             ↑
          Effect Mask
```

## そのまま活かしやすい考え方

- MergeがImage 合成の中心になる
- operator / modeによって合成意味が変わる
- Maskで処理範囲を制限できる
- premultiplicationを無視できない

## そのまま一対一対応しない部分

- Nuke A / B = Fusion Foreground / Background、という名前対応を暗記しない。
- available operator inventory / defaultsは別。
- mask 挙動やchannel 扱いを同一仕様と仮定しない。
- node scripting identityを流用しない。

## 次に読む

- [前景（Foreground）/ 背景（Background）/ マスク（Mask）](../../learn/04-compositing/foreground-background-mask)
- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)
- [合成量と演算（Blend / Operator）](../../learn/04-compositing/blend-operator)

## 関連する再利用構成（Patterns）

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## 関連Node

- [Merge](../../nodes/compositing/merge)

## 具体例

- [2つのImageを重ねる](../../recipes/compositing/two-image-merge)

## 関連する索引

- [Controls / Parameters](../../index/controls-parameters)

---

検証範囲: Foundryの現行Merge資料でA / B / Mask入力とPremultの前提を確認しています。Fusion側の入力の役割やOperatorはFusionの正本ページを基準にします。
