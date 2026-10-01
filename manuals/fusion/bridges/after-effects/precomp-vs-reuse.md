---
title: PrecompとFusionの再利用構造
description: AE Precompose/Nestingのgoalを、FusionのGroup・Instance・Macro/Template等へ単純等価せず翻訳する。
doc_type: bridge
verification: partial
product_scope: resolve
familiar_apps: [after-effects]
familiar_terms: [Precomp, Pre-compose, Nesting]
compare_topics: [nesting, reuse, grouping, public-interface]
suite_surfaces: [edit, fusion]
tasks: [reuse, group, nest, template]
---

# PrecompとFusionの再利用構造

## If you know After Effects

After EffectsのPrecomposeは、選択Layerを新しいCompositionへまとめ、元CompositionではそのPrecompを1 Layerとして扱うworkflowです。

Nested Compositionは別CompositionをLayer sourceとして使います。

## First decision in Resolve

AEでPrecompを使っていた理由を先に分類します。

- timeline上で複数shot / clipをまとめたい
- Fusion Graphを読みやすくまとめたい
- 同じNode settingsを共有したい
- internal Graphを再利用したい
-利用者へ少数controlだけ公開したい

理由によってResolve / Fusion側の候補は変わります。

## Fusion mental model

Fusion側には目的別の構造があります。

```text
shared parameter settings
  → Instance

editable graph boundary
  → Group

public interface + reusable graph
  → Macro / Template
```

これらをAE Precompの別名とは扱いません。

## What maps cleanly

共通するgoal:

- complexityを局所化する
- repeated structureを再利用する
- parent側から扱いやすい単位を作る

## What does not map 1:1

AE Precompは**新しいCompositionを作り、元Compositionでは1 Layer sourceになる**仕組みです。

Fusion Group / Instance / Macroは、それぞれGraph organization、parameter sharing、packaging/interfaceという別責任を持ちます。

したがって:

```text
AE Precomp = Fusion Group
```

という固定対応は使いません。

## Learn this next

- [Instanceで設定を共有する](../../learn/06-reuse/instances)
- [GroupでGraphをまとめる](../../learn/06-reuse/groups)
- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates)

## Reusable Patterns

- [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary)

## Relevant Nodes

これは単一Nodeの比較ではありません。

## Example tasks

- [Fusion assetをResolveで再利用する](../../resolve-integration/reusable-fusion-assets)

## Related index entries

- [Concept A–Z](../../index/concept-a-z)
- [By Task](../../index/by-task)

---

Verification scope: Adobe current Precomposing documentation confirms selected layers move into a new composition and are replaced by a precomp layer; Fusion reuse structures are described separately by their own canonical pages.
