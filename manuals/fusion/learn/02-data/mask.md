---
title: Mask
description: FusionのMaskを、Imageとは別の処理範囲dataとして理解する。
doc_type: concept
verification: partial
aliases: [Mask, Effect Mask, matte area]
concepts: [mask-data, effect-mask]
tasks: [mask, isolate-effect, debug]
prerequisites: [image-data, typed-connections]
level: foundation
product_scope: fusion
---

# Mask

## Question

Maskは白黒画像と同じものとして考えてよいでしょうか。

## Mental Model

FusionのMaskは、主に**どこへ処理を適用するか**を表すdataとして読みます。

```text
Image → Effect → Output
          ↑
        Mask
```

MaskをViewerで白黒に見られる場面があっても、そのGraph responsibilityは通常Imageとは異なります。

## Minimum Example

Ellipse MaskをMergeのEffect Maskへ接続します。

Image branchを変えず、Maskの有無だけを切り替え、合成範囲が変わることを観察します。

## Invariants

- Maskと2D Imageを分ける。
- Effect MaskとImage Alphaを分ける。
- Mask sourceとtarget effectを別branchとして読めるようにする。
- Maskのshape問題とtarget Nodeのeffect問題を同時に直さない。
- exact combine / invert semanticsはNode-specific Referenceで確認する。

## Change One Thing

Mask connectionだけを外し、target effect自体は正常か比較します。

## Transfer

### Merge

Effect Maskでcompositing範囲を限定できます。

### Blur / Color

NodeがMask inputを持つ場合、同じ「effect範囲を限定する」mental modelを転用できます。

### Tracking

Maskをtracking dataへ追従させる場合も、Mask dataとtracking dataを別責任にします。

## Predict

「Maskが効かない」症状で、Image branch・Mask branch・target Nodeを分けて確認できます。

## Common Misread

**Maskを繋げたのでImage Alphaも書き換わっているはず**と考えること。

Effect MaskとImage Alphaは別責任です。

## Related Patterns

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## Node Reference

- [Ellipse Mask](../../nodes/masks/ellipse-mask)
- [Polygon Mask](../../nodes/masks/polygon-mask)

## Next

→ [Parameter / Data](./parameter-data)
