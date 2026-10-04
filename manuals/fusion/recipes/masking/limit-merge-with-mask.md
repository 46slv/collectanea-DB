---
title: Mergeの適用範囲をMaskで限定する
description: MergeのForeground / Background構成を保ったまま、Effect Maskで合成する範囲だけを制限するRecipe。
doc_type: recipe
verification: partial
aliases: [masked merge, Effect Mask]
concepts: [mask-data, effect-mask, foreground-background]
patterns: [limit-effect-with-mask]
nodes: [Merge, Ellipse Mask]
tasks: [mask, composite]
prerequisites: [foreground-background, mask-data]
level: foundation
product_scope: fusion
updated: "2026-10-04"
---

# Mergeの適用範囲をMaskで限定する

## できあがるもの

Foreground / Backgroundの接続はそのままに、Maskの白い範囲だけでForegroundを合成します。

```text
Foreground ─┐
Background ─┼─ Merge → Output
Ellipse ────↑
```

## 必要なもの

- Background Image
- Foreground Image
- Merge
- Ellipse MaskなどのMask Node

## 手順

1. 先にMaskなしでForegroundとBackgroundが正しくMergeできていることを確認します。
2. Ellipse Maskを追加します。
3. Ellipse MaskをMergeの青色Effect Mask入力へ接続します。
4. MergeのOutputをViewerへ表示します。
5. EllipseのCenter / Width / Heightを調整し、Foregroundを見せたい範囲へ合わせます。
6. 境界を柔らかくしたい場合はSoft Edgeを増やします。

21.1 Manualでは、MergeのEffect Maskは白い部分でForegroundとの合成を適用し、黒い部分ではBackgroundだけを残します。

## Maskの強さを変える

Ellipse MaskのLevelを下げると、Mask内部の値が1.0より小さくなり、Foregroundの合成も部分的になります。

MergeのBlendを下げることと似た見た目になる場合はありますが、役割は別です。

- Mask Level — どの範囲をどの強さで適用するか
- Merge Blend — Merge処理全体をBackgroundへどれだけ戻すか

## 反転する

ForegroundをEllipseの外側だけへ出したい場合は、Ellipse MaskのInvertを使います。

Paint ModeのInvertと、Mask全体を反転するInvert checkboxは別なので、単純な内外反転ではcheckbox側を確認します。

## 複数Maskを使う

複数Maskを組み合わせる場合は、2つ目以降のMaskを別Mask NodeのEffect Mask入力へ接続し、Paint Modeで合成方法を決めます。

```text
Ellipse ──────┐
              ↓
           Polygon ──→ Merge Effect Mask
```

Subtractで穴を開ける、Addで領域を足す、といった構成が可能です。結果はPaint Modeに依存するため、接続だけで演算を推測しません。

## Bitmap Maskを使う

ImageのLuminanceやAlphaをMaskにしたい場合はBitmap Maskが候補です。

```text
Reference Image → Bitmap Mask ──→ Merge Effect Mask
```

単純なImage channelを直接Effect Maskへ接続できる場合もあります。ThresholdやSoft Edge、Channel選択、Mask combineが必要ならBitmap Maskを挟みます。

## うまくいかないとき

- Maskを外すとMerge自体は正しいか。
- MaskはMergeの青色Effect Maskへ接続されているか。
- Ellipse MaskのLevelが0付近になっていないか。
- Invertが意図せず有効になっていないか。
- 複数Maskを使う場合、Paint Modeは意図した演算か。
- Mask単体をViewerで確認したとき、白黒の範囲は想定どおりか。

Image branchとMask branchを同時に変更せず、どちらに問題があるか分けて確認します。

## 関連する考え方

- [マスク（Mask）](../../learn/02-data/mask)
- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 関連Node

- [Merge](../../nodes/compositing/merge)
- [Ellipse Mask](../../nodes/masks/ellipse-mask)
- [Polygon Mask](../../nodes/masks/polygon-mask)
- [Bitmap Mask](../../nodes/masks/bitmap-mask)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 94のMerge Effect MaskとChapter 108のMask controlsを基にしています。

実機追試は未実施のため `verification: partial` を維持します。
