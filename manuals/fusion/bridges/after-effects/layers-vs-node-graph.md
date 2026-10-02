---
title: Layer StackとNode Graph
description: AEのComposition/Layer中心の合成モデルから、Fusionの明示的なNode connectionへ読み替える。
doc_type: bridge
verification: partial
product_scope: resolve
familiar_apps: [after-effects]
familiar_terms: [Composition, Layer, Timeline, Effects]
compare_topics: [layer-stack, node-graph, compositing-order]
suite_surfaces: [edit, fusion]
tasks: [composite, translate-mental-model]
---

# Layer StackとNode Graph

## If you know After Effects

After EffectsのCompositionは固有のTimelineを持ち、通常は複数Layerを含みます。

2D LayerはTimeline上のstack順とLayer内の処理順を持ち、空間・時間・opacity等を使って最終imageを組み立てます。

## First decision in Resolve

まず「timeline上のclip構成」が問題なのか、「shot内部のimage processing / compositing」が問題なのかを分けます。

- timeline construction → Edit
- detailed shot composite → Fusion

## Fusion mental model

Fusionでは処理順・branch・合流をNode connectionとして明示します。

```text
Image A ───────┐
               ├─ Merge → Effect → Output
Image B → XF ──┘
```

Layerの上下だけではなく、どのOutputがどのInputへ入っているかを読みます。

## What maps cleanly

goalとしては共通します。

- multiple sourcesを1画面へまとめる
- effectを適用する
- transformする
- maskで処理範囲を決める
- timeでparameterを変える

## What does not map 1:1

- AEのLayer stack order = Fusion Nodeの左右位置、ではない。
- AEの1 Layer内のeffect/property処理 = Fusionの1 Node、とは限らない。
- Fusionではbranch / mergeを明示的connectionで作る。
- Timeline editing responsibilityはFusion Flowへそのまま持ち込まない。

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

Verification scope: Adobe current Composition basics confirms compositions/timelines/layers and layer stack rendering; Blackmagic current Fusion page confirms explicit node-tree connections.
