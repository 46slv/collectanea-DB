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

## After Effectsで知っている考え方

After EffectsのCompositionは固有のTimelineを持ち、通常は複数Layerを含みます。

2D LayerはTimeline上のstack順とLayer内の処理順を持ち、空間・時間・opacity等を使って最終imageを組み立てます。

## Resolveではどこで扱うか

まず「timeline上のclip構成」が問題なのか、「shot内部のimage 処理 / 合成」が問題なのかを分けます。

- Timelineの構成・Clipの順序・Trim → Edit
- Shot内部の細かな合成・VFX → Fusion

## Fusionでの考え方

Fusionでは処理順・分岐・合流をNode connectionとして明示します。

```text
Image A ───────┐
               ├─ Merge → Effect → Output
Image B → XF ──┘
```

Layerの上下だけではなく、どのOutputがどのInputへ入っているかを読みます。

## 共通する考え方

目的としては共通します。

- 複数の素材を1画面へまとめる
- effectを適用する
- transformする
- maskで処理範囲を決める
- timeでパラメータを変える

## そのまま対応しない点

- AEのLayer stack order = Fusion Nodeの左右位置、ではない。
- AEの1 Layer内のeffect/property処理 = Fusionの1 Node、とは限らない。
- Fusionでは分岐 / mergeを明示的connectionで作る。
- Timeline editing 役割はFusion Flowへそのまま持ち込まない。

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

検証範囲: Adobeの現行Composition資料でComposition / Timeline / Layerの構造を、Blackmagic Designの現行Fusion資料でNode接続によるFlowを確認しています。
