---
title: Color ↔ Fusionの境界
description: shot内VFXとshot gradingを分け、FusionとColorの責任を重複させないための境界ガイド。
doc_type: concept
verification: partial
product_scope: resolve
suite_surfaces: [fusion, color]
tasks: [choose-surface, color, composite, cross-page-workflow]
level: foundation
---

# Color ↔ Fusionの境界

## User intent

「この見た目の変更はFusionで作るのか、Colorでgradeするのか」を決めます。

## Which Resolve surface owns what

Blackmagic Designは現行製品ページで、

- Fusion: VFX / motion graphics / compositing
- Color: color correction / creative grading

をそれぞれ主要用途として説明しています。

両方ともNode UIを持ちますが、Nodeがあること自体は同じ責任を意味しません。

## When Fusion is appropriate

- shot内のimage replacement
- keying
- tracked graphic
- cleanup
- multi-source compositing
- motion graphics
- 2D / 3D scene construction

など、**Image構造を作り変える**処理です。

## When Fusion is not the primary surface

- shot balance
- exposure / contrast / color relationship
- look development
- shot matching
- scene全体のcolor continuity

など、**color gradingを主責任にする**仕事はColor側を第一候補にします。

## Handoff / boundary

同じ見た目をFusion / Colorの両方で作れる場合でも、修正ownerを一方へ寄せます。

例:

```text
Fusion
  remove sign
  add graphic
  key / composite
      ↓
Color
  balance shot
  match scene
  creative grade
```

Blackmagicの現行Fusionページでは、Fusionで作成したmaskをColorで利用できるworkflowも案内されています。これはsurface間の連携であり、FusionとColorを同じNode systemとして扱う根拠ではありません。

## Related Fusion Concepts

- [Graphとして考える](../learn/01-flow/graph-as-flow)
- [Alpha](../learn/04-compositing/alpha)

## Related cross-page workflow

- [FusionはResolveのどこにいるか](./where-fusion-fits)
- [どのworking surfaceを使うか](./choose-working-surface)

---

Verification note: FusionとColorの主要用途、およびFusion maskをColor側で利用するworkflowは2026-10-02時点のBlackmagic Design現行製品ページで確認。
