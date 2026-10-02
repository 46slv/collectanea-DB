---
title: After Effectsから来た人へ
description: AEのComposition・Layer・Precomp・Keyframe・Expression経験をResolve / Fusionへ翻訳する入口。
doc_type: index
verification: partial
product_scope: resolve
familiar_apps: [after-effects]
familiar_terms: [Composition, Layer, Precomp, Keyframe, Graph Editor, Expression]
compare_topics: [layer-stack, node-graph, nesting, animation]
suite_surfaces: [edit, fusion]
tasks: [translate-mental-model]
---

# After Effectsから来た人へ

After Effectsでは、Compositionがtimelineを持ち、通常は複数Layerを時間・空間上に配置して合成します。

Fusionでは、同じ「画面を作る」仕事でも、ImageやMaskをNode間で明示的に接続するFlowが中心です。

このページはAE用の別Manualではなく、知っている考え方からFusionの正本ページへ移る地図です。

## 対応の見方（Map）

| After Effectsで知っているもの | Resolve / Fusionで読む先 |
|---|---|
| Composition / Layers | [Layer StackとNode Graph](./layers-vs-node-graph) |
| Effects / Layer properties | [Graphとして考える](../../learn/01-flow/graph-as-flow) |
| Masks / Mattes | [Image / Mask / Data](../../learn/02-data/image-mask-data) / [Alpha](../../learn/04-compositing/alpha) |
| Layer Transform | [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle) |
| Precomp / Nesting | [PrecompとFusionの再利用構造](./precomp-vs-reuse) |
| Keyframes / Graph Editor | [キーフレーム / スプライン / 時間（Keyframe / Spline / Time）](../../learn/05-time/keyframes-spline-time) |
| Expressions | [Keyframe / Expressionの読み替え](./keyframes-expressions) |
| reusable MOGRT-like intent | [Macro / Template](../../learn/06-reuse/macros-templates) |

## 大事な点

AEで複数LayerをPrecomposeすることと、FusionでGroup / Macro / Fusion Clip等を使うことは**同一操作ではありません**。

同じ目的を持つ候補はあっても、データ構造・評価・対象範囲が違います。

---

検証範囲: Adobeの現行Composition basics / Precomposing 資料と、Blackmagic Designの現行Fusion 資料を2026-10-02に照合。
