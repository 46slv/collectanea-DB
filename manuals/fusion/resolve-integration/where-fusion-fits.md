---
title: FusionはResolveのどこにいるか
description: DaVinci Resolve内でFusionが担うVFX・モーショングラフィックス・合成（Compositing）の役割を理解する。
doc_type: concept
term_id: where-fusion-fits
term_short: DaVinci Resolve内でFusionが担うVFX・motion graphics・compositingの役割。
verification: partial
product_scope: resolve
suite_surfaces: [edit, fusion, color]
tasks: [choose-surface, composite, motion-graphics, vfx]
level: foundation
---
# FusionはResolveのどこにいるか

## 目的

「Resolveで作業しているが、どこからFusionの仕事になるのか」を判断します。

## どのページで何を担当するか

Blackmagic Designの現行Fusionページでは、FusionはDaVinci Resolveへ統合されたノードベース（Node-based）のVFX / モーショングラフィックス用Pageとして説明され、Edit・Fusion・Colorを切り替えながら同じProject内で作業できることが案内されています。

Fusionの主な責任としては:

- ショット単位の合成（shot-level compositing）
- モーショングラフィックス
- マスク（<Term id="mask">Mask</Term>）/ トラッキング（Tracking）を伴うVFX
- 不要物除去・置き換え（cleanup / replacement）
- キーイング（Keying）
- 2D / 3D合成（composition）
- 再利用できるFusion <Term id="macros-templates">Template</Term>

が挙げられます。

## Fusionが向いている場合

次のように、**<Term id="image">Image</Term>の処理関係そのものをGraphとして設計したい**場合にFusionが強い候補です。

```text
source
  → mask / track
  → transform / composite
  → graphics / cleanup
  → output
```

## Fusionを主に使わない場合

同じ見た目を複数Pageで作れる場合でも、仕事の主責任から選びます。

- 物語の組み立て、Clipの順序、Trim、Timeline編集 → Editが第一候補
- Shot間の色合わせ、ルック作成、Color Management → Colorが第一候補
- 音声編集、Mix、Mastering → Fairlightが第一候補
- 詳細なノードベースVFXやグラフィック → Fusionが第一候補

これは「他Pageではできない」という禁止表ではありません。**どのPageを説明や修正の基準にすると、作業の流れが分かりやすいか**という判断です。

## ページ間の受け渡し

Fusionへ入った後も、元クリップ（参照元 clip）やTimelineとの関係を失わず、完成結果はResolveの他のPageで引き続き使われます。

## 関連するFusionの考え方

- [Graphとして考える](../learn/01-flow/graph-as-flow)
- [データ領域（data domain）を辿って診断する](../learn/07-debugging/trace-data-domain)

## 関連するページ間の流れ

- [Edit ↔ Fusionの境界](./edit-fusion-boundary)
- [Fusion assetをResolveで再利用する](./reusable-fusion-assets)

---
検証メモ: FusionのResolve統合、Node-based VFX/モーショングラフィックス、Edit/Fusion/Color間の切替は2026-10-02時点のBlackmagic Design現行製品ページで確認。
