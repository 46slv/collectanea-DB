---
title: プリマルチプライ（Premultiplication）
description: RGBとAlphaの保存関係を分け、透明edgeのcolor処理を正しく考える。
doc_type: concept
term_id: premultiplication
term_short: RGBがAlphaの影響を受けた状態で保存される関係。
verification: partial
aliases: [premultiplied alpha, straight alpha, premult]
concepts: [alpha, premultiplication, compositing]
nodes: [Merge, Color Corrector]
tasks: [composite, color-correct, debug, transparency]
prerequisites: [alpha]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# プリマルチプライ（Premultiplication）

## このページで分かること

透明edgeへのcolor correctionで黒縁や色汚れが出る理由を説明します。

## 基本の考え方

RGBと<Term id="alpha">Alpha</Term>の保存関係には、少なくとも次の考え方があります。

- **premultiplied** — RGBがAlphaの影響を受けた状態。
- **straight / unpremultiplied** — RGBとAlphaを別々に保持する状態。

premultiplied RGBを標準的なOverで合成する概念式は:

```text
Cout = Cf + Cb * (1 - Af)
Aout = Af + Ab * (1 - Af)
```

同じ式をストレートRGB（straight RGB）へ無条件に適用しません。

## 最小例

透明edgeを持つForegroundへ強いcolor operationを加えます。

結果にエッジの乱れ（artifact）が出た場合、RGBだけでなく参照元がどのalpha relationshipを前提にしているか確認します。

## 共通ルール

- RGBとAlphaの関係を明示する。
- straight / premultipliedを混同しない。
- Alpha Divide → 色処理 → Alpha Multiplyのような構成は必要な場合だけ使う。
- Node自身に同等のpre/post処理がある場合、二重に適用しない。

## 1つずつ変えて確認する

color operationだけを外し、エッジの乱れ（artifact）が参照元から存在するか比較します。

## 他のNodeにも応用する

### Color correction

透明edgeを強く補正するときのdiagnosticとして使います。

### Merge

Foregroundのalpha-aware 合成を読む基礎になります。

### Keyed elements

key / matteで作ったedgeでもRGB/alpha 関係を確認します。

## 初見のNodeを読む

透明edge問題で、Maskではなくpremultiplicationを疑うべき場面を切り分けられます。

## よくある誤解

**Alphaが正しければRGB edgeも必ず正しい**と考えること。

透明ピクセル周辺のRGB値とAlphaの関係が重要です。

## 関連パターン

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## 関連Node

- [Merge](../../nodes/compositing/merge)
- [Color Corrector](../../nodes/color/color-corrector)

## 次に読む

→ [合成量と演算（Blend / Operator）](./blend-operator)

---

検証メモ: standard Over概念式、straight / premultiplied区別、Alpha Divide / Multiplyの考え方はFusion 21系semantic baselineで確認。Node固有設定は現在の 21.1 evidenceを優先します。
