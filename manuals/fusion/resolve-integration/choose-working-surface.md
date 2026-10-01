---
title: どのworking surfaceを使うか
description: 目的からEdit・Fusion・Color・Fairlightの第一責任を選ぶためのResolve境界ガイド。
doc_type: concept
verification: partial
product_scope: resolve
suite_surfaces: [edit, fusion, color, fairlight]
tasks: [choose-surface, route-task]
level: foundation
---

# どのworking surfaceを使うか

## User intent

同じ結果を複数の方法で作れそうなとき、最初にどのPageへ仕事を置くか決めます。

## Which Resolve surface owns what

| Intent | First surface to consider | Why |
|---|---|---|
| clipを切る・並べる・trimする | Edit | timeline編集が主責任 |
| shot内で複数Imageを合成する | Fusion | Node graphによるcompositingが主責任 |
| title / motion graphicをNodeで設計する | Fusion | VFX / motion graphicsと再利用Graphが主責任 |
| shot間のbalance・look・grade | Color | color correction / gradingが主責任 |
| dialogue / SFX / mix / mastering | Fairlight | audio post-productionが主責任 |
| Fusion effect/titleをtimelineで再利用する | Fusion → Edit/Cut | Fusionでassetを作り、editorial surfaceから利用 |

## When Fusion is appropriate

「clipそのものを編集する」より、**clipの中で何をどう処理するか**が主題になったときにFusionへ進みます。

## When Fusion is not the primary surface

- timeline構成の問題を、Fusion Graphだけで解決しようとしない。
- shot matchingの問題を、個別Fusion compへ分散しない。
- audio postの問題をFusion parameter automationだけへ押し込めない。

## Handoff / boundary

Pageを跨ぐときは、同じ処理を二重に持たないことを優先します。

例:

```text
Edit: shot selection / timing
  ↓
Fusion: internal VFX / graphics
  ↓
Color: shot balance / grading
```

実際の順序・render pipeline・effect orderはversion / context依存なので、具体案件ではcurrent Resolve behaviorを確認します。

## Related Fusion Concepts

- [Graphとして考える](../learn/01-flow/graph-as-flow)
- [再利用の境界を選ぶ](../patterns/reuse/choose-reuse-boundary)

## Related cross-page workflow

- [FusionはResolveのどこにいるか](./where-fusion-fits)
- [Edit ↔ Fusionの境界](./edit-fusion-boundary)

---

Verification note: Editはtimeline editing、FusionはVFX/motion graphics、Colorはgrading、Fairlightはaudio post-productionを主用途としてBlackmagic Design現行製品ページで確認。具体的なcross-page processing orderはこのページでは断定しません。
