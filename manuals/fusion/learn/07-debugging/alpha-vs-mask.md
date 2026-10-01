---
title: AlphaとMaskを分けて診断する
description: ImageのAlphaとEffect Maskの役割を分離し、透明・合成・適用範囲の問題を切り分ける。
doc_type: concept
verification: partial
aliases: [Alpha, Effect Mask, premultiplication]
concepts: [alpha, effect-mask, premultiplication, debugging]
tasks: [debug, composite, mask, transparency]
prerequisites: [foreground-background, mask-data]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# AlphaとMaskを分けて診断する

## Question

「透明にならない」「縁がおかしい」「Maskが効かない」は、同じ問題でしょうか。

## Mental Model

AlphaとEffect Maskは別責任です。

- **Image Alpha**: Image自身のRGBA関係。
- **Effect Mask**: そのNodeのeffectをどこへ適用するか。

```text
Image RGB + Alpha
        ↓
   effect node
        ↑
  Effect Mask
```

Maskを接続したからImage alphaそのものが書き換わる、と決めつけないことが重要です。

## Minimum Example

Mergeで問題がある場合:

1. Foreground単体のRGB / alphaを確認。
2. Background単体を確認。
3. MaskなしMergeを確認。
4. MaskありMergeを確認。

これで「素材alpha」「合成」「Mask適用範囲」を別々に見られます。

## Invariants

- Effect MaskとImage alphaを同じものとして扱わない。
- transparent edgeの色問題ではpremultiplicationを疑う。
- Straight / premultiplied RGBを混同しない。
- color operation前後のalpha処理はNode固有機能と二重にしない。
- まず素材のalpha状態を確認し、その後Merge / Maskへ進む。

## Change One Thing

Maskを外し、Image alphaだけで合成結果を確認します。

次にMaskを戻し、変わった部分が「effect範囲」なのか「Image alpha」なのかを比較します。

## Transfer

### Color correction

透明edgeを持つ素材へ強い補正を行う場合、RGBとalphaの関係を確認します。

### Merge

Foreground / Backgroundのalpha関係を、入力役割と分けて読みます。

### Key / matte

matteを作る処理と、effect範囲を制限するMaskを同一視しません。

## Predict

透明周辺の問題を見たとき、次を順に確認できます。

1. source alphaは存在するか。
2. RGBはstraight / premultipliedのどちらとして扱われているか。
3. Merge前からedge問題があるか。
4. Effect Maskを外しても問題が残るか。

## Common Misread

**青いMask inputへ接続したので、image alphaも期待どおりになっているはずだと思うこと。**

Maskはeffect amountを空間的に制限する入力であり、alpha channelそのものの編集とは分けて考えます。

## Related Patterns

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## Node Reference

- [Merge](../../nodes/compositing/merge)

## Next

→ [Resolution / Domain of Definitionを確認する](./resolution-domain-of-definition)

---

Verification note: Alpha / premultiplication / Effect Maskの役割分離はFusion 21系公式資料を元にしたsemantic baseline。21.1 Node固有のalpha optionは個別Referenceで確認します。
