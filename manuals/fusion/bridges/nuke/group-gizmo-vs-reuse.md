---
title: Group / GizmoとFusion再利用構造
description: Nuke Group/Gizmoのnesting・公開control・再利用経験をFusion Group / Macro / Templateへ単純等価せず翻訳する。
doc_type: bridge
verification: partial
product_scope: fusion
familiar_apps: [nuke]
familiar_terms: [Group, Gizmo, User Knob]
compare_topics: [grouping, reusable-tools, public-interface]
suite_surfaces: [fusion, edit]
tasks: [reuse, group, template]
---

# Group / GizmoとFusion再利用構造

## If you know Nuke

Nuke Groupは複数Nodeを1 Nodeへnestでき、current NukeではGroup Viewから内部Nodeをmain graph contextで編集できます。

GizmoはGroupを別の`.gizmo` fileとして保存し、artistへ公開するcontrolを選んで再利用できる仕組みです。

## First decision in Resolve

NukeでGroup / Gizmoを使っていた理由を分類します。

- graphを整理したい
- 内部Nodeを1単位へまとめたい
- 利用者へ少数controlだけ公開したい
- 複数project / artistで再利用したい

## Fusion mental model

```text
editable graph boundary
  → Group

semantic public controls
  → User Controls

reusable packaged graph
  → Macro / Template
```

## What maps cleanly

- 内部Nodeをまとめる
- public controlsを選ぶ
- repeated constructionを再利用する
- complexityを外部から隠す

## What does not map 1:1

- Nuke Gizmo file = Fusion Macro / Template file、ではない。
- Group internal graphのUI / lifecycleは別。
- User KnobとFusion User Controlsはexact schema / scripting APIが異なる。
- distribution path / versioning / loading behaviorを同じと仮定しない。

## Learn this next

- [GroupでGraphをまとめる](../../learn/06-reuse/groups)
- [User Controlsで公開interfaceを作る](../../learn/06-reuse/user-controls)
- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates)

## Reusable Patterns

- [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary)

## Relevant Nodes

これは単一Node比較ではありません。

## Example tasks

- [Fusion assetをResolveで再利用する](../../resolve-integration/reusable-fusion-assets)

## Related index entries

- [Concept A–Z](../../index/concept-a-z)
- [By Familiar App](../../index/by-familiar-app)

---

Verification scope: Foundry current Group and Gizmo documentation confirms node nesting, Group View and exported reusable gizmos with exposed controls. Fusion packaging semantics remain separate.
