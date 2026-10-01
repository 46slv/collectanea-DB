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

## If you know Photoshop

PhotoshopのLayers panelでは、Layerを選択・非表示・並べ替え・編集しながらdocumentを構成します。

Layer orderは、複数素材をどう重ねるかを理解する重要な入口です。

## First decision in Resolve

Resolve内でshot内部の合成関係を設計するならFusionへ進みます。

timeline上のclip順序そのものを扱うならEdit側が第一候補です。

## Fusion mental model

Fusionでは、処理順・branch・合流をconnectionとして明示します。

```text
Image A ───────────┐
                   ├─ Merge → Output
Image B → Effect ──┘
```

PhotoshopのLayer panel上の上下位置に相当する意味を、FusionではMergeのForeground / BackgroundやGraph connectionとして読みます。

## What maps cleanly

goalとしては共通します。

- multiple elementsを重ねる
-個別要素へeffectを加える
- Maskで見える範囲を制限する
- transformする
- sourceを再利用する

## What does not map 1:1

- Photoshop Layer = Fusion Node、ではない。
- Layer order = Nodeの左右位置、ではない。
- 1 Layerに複数filter / mask / transformが属する構造を、1 Nodeへ無理に対応させない。
- Fusionではbranchが複数方向へ分かれ、後でMergeへ合流できます。

## Learn this next

- [Graphとして考える](../../learn/01-flow/graph-as-flow)
- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)

## Reusable Patterns

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## Relevant Nodes

- [Merge](../../nodes/compositing/merge)
- [Transform](../../nodes/transform/transform)

## Example tasks

- [2つのImageを重ねる](../../recipes/compositing/two-image-merge)

## Related index entries

- [By Task](../../index/by-task)
- [Glossary](../../index/glossary)

---

Verification scope: Adobe current Layers documentation describes Layers panel operations including visibility and reordering; Fusion canonical pages own Fusion-specific graph semantics.
