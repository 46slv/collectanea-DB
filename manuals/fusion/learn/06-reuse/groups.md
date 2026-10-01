---
title: GroupでGraphをまとめる
description: 複数Nodeを展開可能な構造単位としてまとめ、内部Graphを保ったまま整理・再利用する。
doc_type: concept
verification: partial
aliases: [Group, Node Group]
concepts: [groups, graph-structure, reuse]
tasks: [organize-graph, reuse, reduce-clutter]
prerequisites: [node-graph]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---

# GroupでGraphをまとめる

## Question

複数Nodeで1つの役割を作っているとき、内部構造を残したままGraphを読みやすくするにはどうすればよいでしょうか。

## Mental Model

Groupは、**複数Nodeを1つの構造単位としてまとめるが、内部Graphを編集可能なまま保持する**ための考え方です。

```text
before:
A → B → C → D

after:
A → [ Group: B → C ] → D
```

Groupは処理を新しい1 Nodeへ置き換えるというより、関連するNode群に境界を作ります。

Blackmagic DesignのFusion 19/20 Manualでは、GroupとMacroは似たbundleですが、GroupはNode treeのvisual complexityを下げて整理する用途、Macroはよりcustomizableで他compositionへ再利用しやすい用途として区別されています。

## Minimum Example

複数Nodeで「タイトルの見た目」を作っている場合、その内部NodeをGroupにまとめます。

```text
MediaIn
  ↓
[ Title Look Group ]
  ↓
Merge
```

必要なときだけGroupを開き、内部構造を編集します。

## Invariants

- Groupの外から見える役割を1文で説明できる。
- 内部Nodeは依然として個別の責任を持つ。
- Groupを作っても、Data domainや接続typeが変わるわけではない。
- 「まとめられる」ことと「再利用interfaceとして完成している」ことは別。

## Change One Thing

同じNode群を、未Group状態とGroup状態で読み比べます。

処理結果ではなく「どこまでを1つの責任として読めるか」が変わったかを確認します。

## Transfer

### Complex branches

tracking補助、matte生成、title lookなど、役割が明確なbranchをまとめられます。

### Reuse

保存したGroupを再利用する運用もありますが、公開controlや外部利用を設計するならMacro / Templateとの違いを確認します。

### Debugging

Group内部で問題が起きた場合も、境界を跨いで推測せず、Group input → internal stages → outputへ分解します。

## Predict

Group化する前に次を問えます。

1. このNode群は1つの役割を持つか。
2. 外部から必要なinput / outputは何か。
3. 内部を頻繁に開いて編集するか。
4. 他compへ配布するならMacroの方が適切か。

## Common Misread

**Groupにした時点で再利用可能なtoolとして完成したと考えること。**

Groupはまず構造整理の境界です。利用者向けinterfaceや配布形態まで必要ならMacro / Templateへ進みます。

## Related Patterns

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## Node Reference

Groupは複数Nodeを包むauthoring構造であり、単一Node Referenceには置きません。

## Next

→ [Macro / Templateで再利用単位を作る](./macros-templates)

---

Verification note: GroupとMacroの役割差、Group保存・再利用の考え方はBlackmagic Design公式Fusion 19/20 Manualに基づく。Fusion 21.1のexact UIは再確認対象です。
