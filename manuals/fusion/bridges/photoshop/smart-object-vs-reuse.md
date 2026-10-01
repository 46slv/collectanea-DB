---
title: Smart ObjectとFusionの再利用構造
description: Photoshop Smart Objectのsource preservation・linked update経験を、FusionのInstance・Group・Macro/Templateへ単純等価せず翻訳する。
doc_type: bridge
verification: partial
product_scope: resolve
familiar_apps: [photoshop]
familiar_terms: [Smart Object, Linked Smart Object, Smart Filter]
compare_topics: [reuse, source-preservation, linked-content, public-interface]
suite_surfaces: [fusion, edit]
tasks: [reuse, template, organize-graph]
---

# Smart ObjectとFusionの再利用構造

## If you know Photoshop

Smart Objectはsource contentを保持しながらtransformやfilterを非破壊に適用でき、Linked Smart Objectでは外部source更新を複数documentへ反映できます。

複数Layerを1つのSmart Objectへまとめるworkflowもあります。

## First decision in Resolve

PhotoshopでSmart Objectを使っていた理由を先に分類します。

- source qualityを保ったままtransformしたい
- 1つのsource更新を複数箇所へ反映したい
- 複数要素を1単位へまとめたい
- effectを後から編集したい
- reusable assetとして利用者へ公開したい

Fusion側の候補は、このgoalによって変わります。

## Fusion mental model

```text
shared parameter settings
  → Instance

editable graph boundary
  → Group

semantic public controls
  → User Controls

reusable packaged graph
  → Macro / Template
```

これらはSmart Objectの別名ではありません。

## What maps cleanly

共通するgoal:

- 元構造を残す
- repeated useをしやすくする
- 一括変更のownerを作る
- 内部実装と外部操作を分ける

## What does not map 1:1

- Smart Objectのsource preservation / external file linkと、Fusion Instanceのparameter sharingは別mechanism。
- Groupはgraph organizationであり、linked external sourceではない。
- Macro / TemplateはGraph packagingとpublic interfaceが主責任。
- Smart Filterのeditable filter stackを、そのままFusion Node chainへ同一視しない。

## Learn this next

- [Instanceで設定を共有する](../../learn/06-reuse/instances)
- [GroupでGraphをまとめる](../../learn/06-reuse/groups)
- [User Controlsで公開interfaceを作る](../../learn/06-reuse/user-controls)
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

Verification scope: Adobe current Smart Object documentation confirms source preservation, editable transforms/filters, embedded/linked forms, and linked update behavior. Fusion reuse structures are described separately by their canonical owners.
