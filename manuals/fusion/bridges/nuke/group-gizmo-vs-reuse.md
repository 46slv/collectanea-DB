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

## Nukeで知っている考え方

Nuke Groupは複数Nodeを1 Nodeへnestでき、現在の NukeではGroup Viewから内部Nodeをmain graph contextで編集できます。

GizmoはGroupを別の`.gizmo` fileとして保存し、artistへ公開するcontrolを選んで再利用できる仕組みです。

## Resolveで最初に決めること

NukeでGroup / Gizmoを使っていた理由を分類します。

- graphを整理したい
- 内部Nodeを1単位へまとめたい
- 利用者へ少数controlだけ公開したい
- 複数project / artistで再利用したい

## Fusionでの考え方

```text
editable graph boundary
  → Group

意味のある公開Control
  → User Controls

reusable packaged graph
  → Macro / Template
```

## そのまま活かしやすい考え方

- 内部Nodeをまとめる
- 利用者へ見せるControlを選ぶ
- 繰り返し使う構成を再利用する
- complexityを外部から隠す

## そのまま一対一対応しない部分

- Nuke Gizmo file = Fusion Macro / Template file、ではない。
- Group internal graphのUI / lifecycleは別。
- User KnobとFusion User Controlsはスキーマ（schema）やScripting APIの正確な仕様が異なる。
- distribution path / versioning / loading 挙動を同じと仮定しない。

## 次に読む

- [GroupでGraphをまとめる](../../learn/06-reuse/groups)
- [User Controlsで公開インターフェースを作る](../../learn/06-reuse/user-controls)
- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates)

## 関連する再利用構成（Patterns）

- [再利用の境界を選ぶ](../../patterns/reuse/choose-reuse-boundary)

## 関連Node

これは単一Node比較ではありません。

## 具体例

- [Fusion assetをResolveで再利用する](../../resolve-integration/reusable-fusion-assets)

## 関連する索引

- [Concept A–Z](../../index/concept-a-z)
- [By Familiar App](../../index/by-familiar-app)

---

検証範囲: Foundryの現行Group / Gizmo資料で、Nodeの入れ子化、Group View、公開Controlを持つGizmoの再利用を確認しています。FusionのGroup / Macro / Templateは別の仕組みとして扱います。
