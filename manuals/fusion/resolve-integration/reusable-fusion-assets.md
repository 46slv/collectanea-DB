---
title: Fusion assetをResolveで再利用する
description: Fusion GraphをMacro / Templateとしてまとめ、Edit/Cutなどから再利用する境界を理解する。
doc_type: concept
verification: partial
product_scope: resolve
suite_surfaces: [fusion, edit]
tasks: [template, reuse, motion-graphics]
level: intermediate
---

# Fusion assetをResolveで再利用する

## User intent

Fusionで作ったGraphを、毎回Nodeから組み直さずResolve内で再利用します。

## Which Resolve surface owns what

- **Fusion** — internal Graph、公開control、asset behaviorを設計する。
- **Edit / Cut** — 作成済みeffect / title等をtimeline workflowから利用する。

Blackmagic Designは、Fusionで作成したcompositionをtemplateとして保存し、Edit/Cutで使えるworkflowを現行製品ページで案内しています。

## When Fusion is appropriate

asset内部に

- multiple Nodes
- animation
- expression / parameter linking
- custom controls

があり、再利用単位としてまとめたい場合です。

## When Fusion is not the primary surface

既存templateをtimelineへ配置して値を変えるだけなら、利用側はEdit/Cutで完結する場合があります。

## Handoff / boundary

再利用assetでは、内部実装より**公開interface**が重要です。

```text
Fusion internal graph
   ↓
User Controls / Macro interface
   ↓
Resolve reusable asset
   ↓
Edit / Cut user
```

## Related Fusion Concepts

- [User Controlsで公開interfaceを作る](../learn/06-reuse/user-controls)
- [Macro / Templateで再利用単位を作る](../learn/06-reuse/macros-templates)

## Related cross-page workflow

- [再利用の境界を選ぶ](../patterns/reuse/choose-reuse-boundary)

---

Verification note: Fusion compositionのtemplate保存とEdit/Cut利用はBlackmagic Design現行Fusion / Fusion 21ページで確認。exact category / storage path / packagingは21.1 manualで確認します。
