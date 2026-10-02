---
title: FusionはResolveのどこにいるか
description: DaVinci Resolve内でFusionが担うVFX・motion graphics・compositingの責任範囲を理解する。
doc_type: concept
verification: partial
product_scope: resolve
suite_surfaces: [edit, fusion, color]
tasks: [choose-surface, composite, motion-graphics, vfx]
level: foundation
---

# FusionはResolveのどこにいるか

## User intent

「Resolveで作業しているが、どこからFusionの仕事になるのか」を判断します。

## Which Resolve surface owns what

Blackmagic Designの現行Fusionページでは、FusionはDaVinci Resolveへ統合されたNode-based VFX / motion-graphics Pageとして説明され、Edit・Fusion・Colorを切り替えながら同じproject内で作業できることが案内されています。

Fusionの主な責任としては:

- shot-level compositing
- motion graphics
- masking / trackingを伴うVFX
- cleanup / replacement
- keying
- 2D / 3D composition
- reusable Fusion templates

が挙げられます。

## When Fusion is appropriate

次のように、**Imageの処理関係そのものをGraphとして設計したい**場合にFusionが強い候補です。

```text
source
  → mask / track
  → transform / composite
  → graphics / cleanup
  → output
```

## When Fusion is not the primary surface

同じ見た目を複数Pageで作れる場合でも、仕事の主責任から選びます。

- story / clip order / trim / timeline construction → Editが第一候補
- shot matching / creative color grading / color management → Colorが第一候補
- audio edit / mix / mastering → Fairlightが第一候補
- detailed node-based VFX / graphics → Fusionが第一候補

これは「他Pageではできない」という禁止表ではありません。**どこをcanonical ownerにするとworkflowが読みやすいか**という判断です。

## Handoff / boundary

Fusionへ入った後も、source clipやtimelineとの関係を失わず、完成結果はResolveの他surfaceで引き続き使われます。

## Related Fusion Concepts

- [Graphとして考える](../learn/01-flow/graph-as-flow)
- [Data domainを辿って診断する](../learn/07-debugging/trace-data-domain)

## Related cross-page workflow

- [Edit ↔ Fusionの境界](./edit-fusion-boundary)
- [Fusion assetをResolveで再利用する](./reusable-fusion-assets)

---

Verification note: FusionのResolve統合、Node-based VFX/motion graphics、Edit/Fusion/Color間の切替は2026-10-02時点のBlackmagic Design現行製品ページで確認。
