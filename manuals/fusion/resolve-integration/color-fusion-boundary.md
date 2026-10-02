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

## 目的

「この見た目の変更はFusionで作るのか、Colorでgradeするのか」を決めます。

## どのページで何を担当するか

Blackmagic Designは現行製品ページで、

- Fusion: VFX / モーショングラフィックス / 合成
- Color: color correction / creative grading

をそれぞれ主要用途として説明しています。

両方ともNode UIを持ちますが、Nodeがあること自体は同じ責任を意味しません。

## Fusionが向いている場合

- shot内のimage replacement
- キーイング
- tracked graphic
- cleanup
- multi-参照元 合成
- モーショングラフィックス
- 2D / 3D scene construction

など、**Image構造を作り変える**処理です。

## Fusionを主に使わない場合

- shot balance
- exposure / contrast / color relationship
- look development
- shot matching
- scene全体のcolor continuity

など、**color gradingを主責任にする**仕事はColor側を第一候補にします。

## ページ間の受け渡し

同じ見た目をFusion / Colorの両方で作れる場合でも、修正管理元を一方へ寄せます。

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

Blackmagicの現行Fusionページでは、Fusionで作成したmaskをColorで利用できる作業の流れも案内されています。これはsurface間の連携であり、FusionとColorを同じNode systemとして扱う根拠ではありません。

## 関連するFusionの考え方

- [Graphとして考える](../learn/01-flow/graph-as-flow)
- [Alpha](../learn/04-compositing/alpha)

## 関連するページ間の流れ

- [FusionはResolveのどこにいるか](./where-fusion-fits)
- [どの作業ページを使うか](./choose-working-surface)

---

検証メモ: FusionとColorの主要用途、およびFusion maskをColor側で利用する作業の流れは2026-10-02時点のBlackmagic Design現行製品ページで確認。
