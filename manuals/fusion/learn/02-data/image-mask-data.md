---
title: Image / Mask / Dataを分ける
description: Fusionで扱うImage・Mask・パラメータ dataを役割ごとに分けてGraphを読む。
doc_type: concept
verification: partial
aliases: [Image, Mask, Data, データ型]
concepts: [image-data, mask-data, parameter-data]
nodes: [Merge, Background, Transform]
tasks: [connect-nodes, mask, automate, debug]
prerequisites: [node-graph]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# Image / Mask / Dataを分ける

## このページで分かること

線がつながっているかだけでなく、**何のデータを何へ渡しているか**を区別して読みます。

## 基本の考え方

まず3つの責任へ分けます。

| Data | Primary job | Read next |
|---|---|---|
| Image | 見た目となる2D image dataを流す | [画像（Image）](./image) |
| Mask | effect / 合成の適用範囲を持つ | [マスク（Mask）](./mask) |
| パラメータ / Data | Node 挙動を決める値 | [パラメータ / Data](./parameter-data) |

この3つを同じ「線」や「値」として扱わないことが重要です。

## 最小例

```text
Image A ──────────────────┐
                         ├─ Merge → Output Image
Image B ──────────────────┘
Mask ─────────────────────↑

Parameter:
Merge.Blend / Transform.Center / ...
```

Image connection、Mask connection、Inspector パラメータは別の責任です。

## 共通ルール

- ImageはImageとして追う。
- Maskはeffect範囲として追う。
- パラメータはNode 挙動の値として追う。
- 同じViewer表示ができてもデータ領域（data domain）を同一視しない。
- 接続できない場合は、まずOutput / Input domainを確認する。

## 1つずつ変えて確認する

Mask connectionだけを外し、Image 分岐とパラメータは固定したまま結果を比較します。

## 他のNodeにも応用する

### Merge

前景（Foreground）/ 背景（Background）はImage、Effect MaskはMask、Blendはパラメータです。

### Transform

Imageを受け取り、Center / Size等のパラメータで挙動を決めます。

### Specialized domain

Shape / Particle / 3D / USD / Deepは、Image / Mask / パラメータ以外にも別domainがあることを示します。

## 初見のNodeを読む

初見Nodeで、まず「これはImage / Mask / パラメータ / その他domainのどれか」を分類できます。

## よくある誤解

**Viewerに見えるものは全部Image、Inspectorにあるものは全部同じ型の数値**と考えること。

データ領域（data domain）とパラメータ typeを分けて読みます。

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)
- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)
- [特殊domainのまま処理し、必要な境界で2Dへ戻す](../../patterns/data-domain/defer-domain-conversion)

## 関連Node

- [Merge](../../nodes/compositing/merge)
- [Transform](../../nodes/transform/transform)

## 次に読む

→ [画像（Image）](./image)

---

検証メモ: Image connection、Mask 役割、Inspector パラメータの分離は現行Blackmagic Design Fusion資料とFusion 21 semantic baselineに基づきます。
