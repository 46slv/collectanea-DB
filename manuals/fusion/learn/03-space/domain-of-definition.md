---
title: Domain of Definition
description: frame全体と、実際に有効pixelが存在する領域を分けて理解する。
doc_type: concept
verification: partial
aliases: [DoD, Domain of Definition, image domain, ROI]
concepts: [domain-of-definition, region-of-interest, image-extent]
nodes: [Transform, Resize]
tasks: [debug, transform, resize, performance]
prerequisites: [resolution]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# Domain of Definition

## Question

frame外へ動かしたImageが後で戻せる場合と、完全に消えて戻せない場合があるのはなぜでしょうか。

## Mental Model

Fusionでは少なくとも次を分けます。

- **Frame / image extent** — nominalなwidth / height。
- **Canvas** — Imageを扱う空間。
- **Domain of Definition (DoD)** — 実際に有効pixelが存在する領域。
- **Region of Interest (RoI)** — rendererが今回計算を要求する領域。

DoDはcontentの存在範囲、RoIは計算requestです。

## Minimum Example

```text
Image
  → Transform A: frame外へ
  → Transform B: frame内へ戻す
  → Output
```

途中でpixelがDoDとして残っていれば戻せる場合があります。途中でclip / cropされて失われた場合は、後段Transformでは復元できません。

## Invariants

- 「Viewerに見えない」と「pixelが存在しない」を分ける。
- frame sizeとDoDを同一視しない。
- DoDとRoIを同一視しない。
- Crop / Resize / Transform等のdomain behaviorをNode固有Referenceで確認する。

## Change One Thing

途中Nodeを1つ外し、frame外pixelが後段で戻るか比較します。

## Transfer

### Transform

positionとclippingを分けます。

### Resize / Crop

resolution / extent変更とcontent lossを分けます。

### Blur / Filter

近傍pixelを必要とする処理ではedge / domain behaviorも確認します。

## Predict

「端が消えた」症状で、position、resolution、DoDのどこを調べるか選べます。

## Common Misread

**Imageがframe外にある = pixelが削除された**と考えること。

見えないだけなのか、dataが失われたのかを観察してから判断します。

## Related Patterns

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)

## Node Reference

- [Transform](../../nodes/transform/transform)
- [Resize](../../nodes/transform/resize)

## Next

Debuggingでの使い方:
→ [Resolution / Domain of Definitionを確認する](../07-debugging/resolution-domain-of-definition)

---

Verification note: Frame / Canvas / DoD / RoIの区別はFusion 21系semantic baselineで確認。Node固有のclipping / domain optionはcurrent 21.1 evidenceを優先します。
