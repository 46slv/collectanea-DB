---
title: Layer StackとFlow
description: PhotoshopのLayer順序中心のdocument modelから、Fusionの明示的なNode connectionへ読み替える。
doc_type: bridge
verification: partial
product_scope: resolve
familiar_apps: [photoshop]
familiar_terms: [Layer, Layers panel, layer order]
compare_topics: [layer-stack, node-graph, compositing-order]
suite_surfaces: [fusion]
tasks: [composite, translate-mental-model]
---

# Layer StackとFlow

## Photoshopで知っている考え方

PhotoshopのLayers panelでは、Layerを選択・非表示・並べ替え・編集しながらdocumentを構成します。

Layer orderは、複数素材をどう重ねるかを理解する重要な入口です。

## Resolveではどこで扱うか

Resolve内でshot内部の合成関係を設計するならFusionへ進みます。

timeline上のclip順序そのものを扱うならEdit側が第一候補です。

## Fusionでの考え方

Fusionでは、処理順・分岐・合流をconnectionとして明示します。

```text
Image A ───────────┐
                   ├─ Merge → Output
Image B → Effect ──┘
```

PhotoshopのLayer panel上の上下位置に相当する意味を、FusionではMergeのForeground / BackgroundやGraph connectionとして読みます。

## 共通する考え方

目的としては共通します。

- 複数の要素を重ねる
- 個別要素へeffectを加える
- Maskで見える範囲を制限する
- transformする
- 参照元を再利用する

## そのまま対応しない点

- Photoshop Layer = Fusion Node、ではない。
- Layer order = Nodeの左右位置、ではない。
- 1 Layerに複数filter / mask / transformが属する構造を、1 Nodeへ無理に対応させない。
- Fusionでは分岐が複数方向へ分かれ、後でMergeへ合流できます。

## 次に読む

- [Graphとして考える](../../learn/01-flow/graph-as-flow)
- [前景（Foreground）/ 背景（Background）/ マスク（Mask）](../../learn/04-compositing/foreground-background-mask)

## 関連パターン

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## 関連Node

- [Merge](../../nodes/compositing/merge)
- [Transform](../../nodes/transform/transform)

## 具体例

- [2つのImageを重ねる](../../recipes/compositing/two-image-merge)

## 関連する索引

- [By Task](../../index/by-task)
- [Glossary](../../index/glossary)

---

検証範囲: Adobeの現行Layers資料で、Layerの表示・非表示や並べ替えを確認しています。Fusion固有のGraphの意味は、このマニュアル内のFusionページを基準にします。
