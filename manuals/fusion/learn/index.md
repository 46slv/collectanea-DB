---
title: Learn
description: Fusionの操作を暗記するのではなく、初見のNodeにも転用できる基礎概念を学ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [learn, understand]
---

# Learn

ここは順番に読むための学習経路です。Node名を覚えることより、**Graph → Data → Space → Compositing → Time → Reuse → Debugging** の順に、別のNodeへ持ち運べる考え方を作ります。

## まず読む

1. [Graphとして考える](./01-flow/graph-as-flow)
2. [Input / Output / Connection](./01-flow/inputs-outputs-connections)
3. [中間結果をViewerで見る](./01-flow/intermediate-results-viewer)
4. [Graphが評価される依存関係](./01-flow/evaluation-dependency)
5. [Image / Mask / Dataを分ける](./02-data/image-mask-data)
6. [接続できるdata / 接続できないdata](./02-data/connection-compatibility)
7. [Normalized Coordinates](./03-space/normalized-coordinates)
8. [Foreground / Background / Mask](./04-compositing/foreground-background-mask)
9. [Keyframe / Spline / Time](./05-time/keyframes-spline-time)
10. [Expressions](./05-time/expressions)
11. [Instanceで設定を共有する](./06-reuse/instances)
12. [User Controlsで公開interfaceを作る](./06-reuse/user-controls)
13. [GroupでGraphをまとめる](./06-reuse/groups)
14. [Macro / Templateで再利用単位を作る](./06-reuse/macros-templates)
15. [Data domainを辿って診断する](./07-debugging/trace-data-domain)
16. [Branchを分離して原因範囲を狭める](./07-debugging/isolate-branches)
17. [AlphaとMaskを分けて診断する](./07-debugging/alpha-vs-mask)
18. [Resolution / Domain of Definitionを確認する](./07-debugging/resolution-domain-of-definition)
19. [症状ではなくGraphを診断する](./07-debugging/diagnose-graph-not-symptom)

各Conceptページは、最小例を試したあとに「別Nodeでも何が同じか」を確認する構成です。

## 章別の深掘り

### 03 Coordinates & Space

- [Center / Pivot / Size / Angle](./03-space/center-pivot-size-angle)
- [Resolution / Aspect](./03-space/resolution-aspect)
- [Domain of Definition](./03-space/domain-of-definition)

### 04 Compositing & Alpha

- [Alpha](./04-compositing/alpha)
- [Premultiplication](./04-compositing/premultiplication)
- [Blend / Operator](./04-compositing/blend-operator)

### 05 Time & Automation

- [Frame Evaluation](./05-time/frame-evaluation)
- [Modifier / Parameter Sources](./05-time/modifier-parameter-sources)

順番に読む主経路と、必要な概念を掘る補助経路を分けています。

Node固有の操作を引きたい場合は [Node Reference](../nodes/) へ、再利用できる構成を探す場合は [Patterns](../patterns/) へ進みます。
