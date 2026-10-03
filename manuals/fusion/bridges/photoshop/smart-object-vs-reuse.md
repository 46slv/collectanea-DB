---
title: Smart ObjectとFusionの再利用構造
description: Photoshop Smart Objectの参照元保持やlinked updateの考え方を、FusionのInstance・Group・Macro / Templateと単純に対応づけず読み替える。
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

## Photoshopで知っている考え方

Smart Objectは参照元 内容を保持しながらtransformやfilterを非破壊に適用でき、Linked Smart Objectでは外部参照元更新を複数documentへ反映できます。

複数Layerを1つのSmart Objectへまとめる作業の流れもあります。

## Resolveではどこで扱うか

PhotoshopでSmart Objectを使っていた理由を先に分類します。

- 参照元 qualityを保ったままtransformしたい
- 1つの参照元更新を複数箇所へ反映したい
- 複数要素を1単位へまとめたい
- effectを後から編集したい
- reusable assetとして利用者へ公開したい

Fusion側の候補は、この目的によって変わります。

## Fusionでの考え方

```text
shared parameter settings
  → Instance

editable graph boundary
  → Group

意味のある公開Control
  → User Controls

reusable packaged graph
  → Macro / Template
```

これらはSmart Objectの別名ではありません。

## 共通する考え方

共通する目的:

- 元構造を残す
- repeated useをしやすくする
- 一括変更の管理元を作る
- 内部実装と外部操作を分ける

## そのまま対応しない点

- Smart Objectの参照元 preservation / external file linkと、Fusion Instanceのパラメータ sharingは別仕組み。
- Groupはgraph organizationであり、linked external 参照元ではない。
- Macro / TemplateはGraph パッケージ化とpublic インターフェースが主責任。
- Smart Filterのeditable filter stackを、そのままFusion Node chainへ同一視しない。

## 次に読む

- [Instanceで設定を共有する](../../learn/06-reuse/instances)
- [GroupでGraphをまとめる](../../learn/06-reuse/groups)
- [User Controlsで公開インターフェースを作る](../../learn/06-reuse/user-controls)
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

検証範囲: Adobeの現行Smart Object資料で、元内容の保持、編集可能なTransform / Filter、埋め込み・リンク形式、リンク更新を確認しています。Fusionの再利用構造は別ページで説明します。
