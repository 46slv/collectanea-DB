---
title: PrecompとFusionの再利用構造
description: After EffectsのPrecompose / Nestingを、FusionのGroup・Instance・Macro / Templateと単純に対応づけず読み替える。
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

## After Effectsで知っている考え方

After EffectsのPrecomposeは、選択Layerを新しいCompositionへまとめ、元CompositionではそのPrecompを1 Layerとして扱う作業の流れです。

Nested Compositionは別CompositionをLayer 参照元として使います。

## Resolveではどこで扱うか

AEでPrecompを使っていた理由を先に分類します。

- timeline上で複数shot / clipをまとめたい
- Fusion Graphを読みやすくまとめたい
- 同じNode settingsを共有したい
- internal Graphを再利用したい
- 利用者へ少数controlだけ公開したい

理由によってResolve / Fusion側の候補は変わります。

## Fusionでの考え方

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

## 共通する考え方

共通する目的:

- complexityを局所化する
- repeated 構造を再利用する
- parent側から扱いやすい単位を作る

## そのまま対応しない点

AE Precompは**新しいCompositionを作り、元Compositionでは1 Layer 参照元になる**仕組みです。

Fusion Group / Instance / Macroは、それぞれGraph organization、パラメータ sharing、パッケージ化/インターフェースという別責任を持ちます。

したがって:

```text
AE Precomp = Fusion Group
```

という固定対応は使いません。

## 次に読む

- [Instanceで設定を共有する](../../learn/06-reuse/instances)
- [GroupでGraphをまとめる](../../learn/06-reuse/groups)
- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates)

## 関連パターン

- [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary)

## 関連Node

これは単一Nodeの比較ではありません。

## 具体例

- [Fusion assetをResolveで再利用する](../../resolve-integration/reusable-fusion-assets)

## 関連する索引

- [Concept A–Z](../../index/concept-a-z)
- [By Task](../../index/by-task)

---

検証範囲: Adobeの現行Precomposing資料で、選択したLayerが新しいCompositionへ移され、元のCompositionではPrecomp Layerとして扱われることを確認しています。Fusionの再利用構造は別ページで説明します。
