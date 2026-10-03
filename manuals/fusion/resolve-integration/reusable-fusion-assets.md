---
title: Fusion assetをResolveで再利用する
description: Fusion GraphをMacro / Templateとしてまとめ、Edit/Cutなどから再利用する境界を理解する。
doc_type: concept
term_id: reusable-fusion-assets
term_short: Fusion GraphをMacroやTemplateとしてResolve内で再利用する境界。
verification: partial
product_scope: resolve
suite_surfaces: [fusion, edit]
tasks: [template, reuse, motion-graphics]
level: intermediate
---

# Fusion assetをResolveで再利用する

## 目的

Fusionで作ったGraphを、毎回Nodeから組み直さずResolve内で再利用します。

## どのページで何を担当するか

- **Fusion** — internal Graph、公開control、asset 挙動を設計する。
- **Edit / Cut** — 作成済みeffect / title等をtimeline 作業の流れから利用する。

Blackmagic Designは、Fusionで作成したcompositionをtemplateとして保存し、Edit/Cutで使える作業の流れを現行製品ページで案内しています。

## Fusionが向いている場合

asset内部に

- multiple Nodes
- アニメーション
- expression / パラメータ linking
- custom controls

があり、再利用単位としてまとめたい場合です。

## Fusionを主に使わない場合

既存templateをtimelineへ配置して値を変えるだけなら、利用側はEdit/Cutで完結する場合があります。

## ページ間の受け渡し

再利用assetでは、内部実装より**公開インターフェース**が重要です。

```text
Fusion internal graph
   ↓
User Controls / Macro interface
   ↓
Resolve reusable asset
   ↓
Edit / Cut user
```

## 関連するFusionの考え方

- [User Controlsで公開インターフェースを作る](../learn/06-reuse/user-controls)
- [Macro / Templateで再利用単位を作る](../learn/06-reuse/macros-templates)

## 関連するページ間の流れ

- [再利用の境界を選ぶ](../patterns/reuse/choose-reuse-boundary)

---

検証メモ: Fusion compositionのtemplate保存とEdit/Cut利用はBlackmagic Design現行Fusion / Fusion 21ページで確認。正確な category / storage path / パッケージ化は21.1 manualで確認します。
