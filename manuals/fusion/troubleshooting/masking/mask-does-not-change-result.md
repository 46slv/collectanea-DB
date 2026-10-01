---
title: Maskを接続しても結果が変わらない
description: Image branchとMask branchを分離し、MaskがTarget Nodeへ届いているかを確認する診断手順。
doc_type: diagnostic
verification: partial
aliases: [Maskが効かない, mask not working]
concepts: [mask-data, effect-mask]
patterns: [limit-effect-with-mask]
nodes: [Merge]
tasks: [debug, mask]
symptoms: [mask-no-effect, mask-not-working]
prerequisites: [mask-data]
level: foundation
product_scope: fusion
---

# Maskを接続しても結果が変わらない

## Fast Checks

1. Maskは意図したTarget NodeのMask inputへ接続されているか。
2. Target NodeはMaskなしでは期待した処理をしているか。
3. Mask source単体を確認すると、意図した範囲を持っているか。
4. Maskを接続／切断したとき、Target Nodeの結果に差があるか。

## Isolate

Image branchとMask branchを別々に確認します。

```text
Image branch ── Target Node → Output
                   ↑
Mask branch ───────┘
```

まずImage branchだけで結果を確定し、次にMask branchだけを追加します。

## Likely Causes

### 接続先が違う

Mask sourceを通常のImage inputへ入れている、または別NodeのMask inputへ接続している可能性があります。

### Mask source側が意図した範囲を持っていない

Target Nodeではなく、Mask source側のshape / position / sizeに原因がある場合があります。

### Target Node側の処理差が見えない

Maskで限定しても、Target Nodeが実質的に見た目を変えていない場合は差を判断できません。まずMaskなしのeffect結果を確認します。

### Node固有設定の影響

invert / combine / channel等、Node固有の設定が関係する場合があります。ここでは一般診断と分離し、個別Referenceで確認します。

## Fix

1. Target Nodeを単体で正常化する。
2. Mask sourceを単体で確認する。
3. 正しいMask inputへ接続する。
4. 接続前後だけを比較する。
5. それでも差がなければNode固有のMask behaviorへ進む。

## Why

MaskはImageそのものではなく「どこへ処理を適用するか」を持つため、Image branchと同時に調整すると原因が混ざります。

→ [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## Version / Exception Notes

Maskの基本的な役割とMask inputは2026-10-02時点のBlackmagic Design公式Fusion紹介と照合済みです。各Node固有のMask optionsは個別検証が必要です。

## Related Symptoms

- [Viewerに何も表示されない](../viewer/nothing-visible)
- Maskをつなぐと全体が消える
- Maskの位置だけがずれる
