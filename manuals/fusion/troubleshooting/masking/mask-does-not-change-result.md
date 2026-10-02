---
title: Maskを接続しても結果が変わらない
description: Image 分岐とMask 分岐を分離し、Maskが対象Nodeへ届いているかを確認する診断手順。
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

## まず確認すること（Fast Checks）

1. Maskは意図した対象NodeのMask inputへ接続されているか。
2. 対象NodeはMaskなしでは期待した処理をしているか。
3. Mask 参照元単体を確認すると、意図した範囲を持っているか。
4. Maskを接続／切断したとき、対象Nodeの結果に差があるか。

## 原因を切り分ける（Isolate）

Image 分岐とMask 分岐を別々に確認します。

```text
Image branch ── 対象Node → Output
                   ↑
Mask branch ───────┘
```

まずImage 分岐だけで結果を確定し、次にMask 分岐だけを追加します。

## 主な原因（Likely Causes）

### 接続先が違う

Mask 参照元を通常のImage inputへ入れている、または別NodeのMask inputへ接続している可能性があります。

### Mask 参照元側が意図した範囲を持っていない

対象Nodeではなく、Mask 参照元側のshape / position / sizeに原因がある場合があります。

### 対象Node側の処理差が見えない

Maskで限定しても、対象Nodeが実質的に見た目を変えていない場合は差を判断できません。まずMaskなしのeffect結果を確認します。

### Node固有設定の影響

invert / combine / channel等、Node固有の設定が関係する場合があります。ここでは一般診断と分離し、個別Referenceで確認します。

## 修正方法（Fix）

1. 対象Nodeを単体で正常化する。
2. Mask 参照元を単体で確認する。
3. 正しいMask inputへ接続する。
4. 接続前後だけを比較する。
5. それでも差がなければNode固有のMask 挙動へ進む。

## なぜ起きるか（Why）

MaskはImageそのものではなく「どこへ処理を適用するか」を持つため、Image 分岐と同時に調整すると原因が混ざります。

→ [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## バージョン・例外（Version / Exception Notes）

Maskの基本的な役割とMask inputは2026-10-02時点のBlackmagic Design公式Fusion紹介と照合済みです。各Node固有のMask optionsは個別検証が必要です。

## 関連する症状（Related Symptoms）

- [Viewerに何も表示されない](../viewer/nothing-visible)
- Maskをつなぐと全体が消える
- Maskの位置だけがずれる
