---
title: Maskを接続しても結果が変わらない
description: Effect Maskの接続先、Mask値、Invert、Paint Mode、対象Effectを分離して原因を確認する。
doc_type: diagnostic
verification: partial
aliases: [Maskが効かない, mask not working]
concepts: [mask-data, effect-mask]
patterns: [limit-effect-with-mask]
nodes: [Merge, Ellipse Mask, Polygon Mask, Bitmap Mask]
tasks: [debug, mask]
symptoms: [mask-no-effect, mask-not-working]
prerequisites: [mask-data]
level: foundation
product_scope: fusion
updated: "2026-10-04"
---

# Maskを接続しても結果が変わらない

## まず確認すること

1. Maskは意図したNodeの青色Effect Mask入力へ接続されているか。
2. 対象NodeはMaskなしなら明確な変化を作っているか。
3. Mask単体をViewerで見ると、白い対象範囲が存在するか。
4. MaskのLevelが0付近になっていないか。
5. Invertが意図せず有効になっていないか。
6. 複数Maskを使っている場合、Paint Modeは何になっているか。

## 原因を切り分ける

```text
Image branch ── 対象Node → Output
                   ↑
Mask branch ───────┘
```

最初にMask branchを外し、対象Nodeが単体で機能していることを確認します。

次にMaskだけをViewerへ出し、範囲を確認してから接続します。

## 主な原因

### Effect Mask入力へ接続していない

Mask dataをImage入力へ接続しようとしている、または別NodeのMask入力へつながっている可能性があります。

Nodeごとに入力の役割を確認します。

### Maskが黒になっている

Maskが全面黒なら、Effectを適用する領域がありません。

Bitmap MaskではChannelやThreshold、Primitive / Polygon MaskではShape位置、Solid、Levelを確認します。

### Levelが低い

Levelを下げるとMask内部の値そのものが下がります。

Effect側が弱い場合と見分けるため、一度Levelを1.0へ戻し、対象Effect側も見える強さにして確認します。

### Invertで意図と逆になっている

Invert checkboxはMask全体を反転します。

「内側へ効かせたいのに外側へ効いている」場合はInvertを確認します。

### Paint ModeがMaskを打ち消している

複数MaskではPaint Modeによって結果が変わります。

Subtract、Multiply、Copy、Ignore等では、接続されていても意図した領域が残らない場合があります。

まず1つのMaskだけに戻し、次に2つ目をMergeまたはAddで加えて比較します。

### 対象Effectの変化が小さい

Maskが正しくても、Blur 0、Color変更なし、MergeのForegroundがBackgroundと同じ等では差が見えません。

Mask診断中だけ一時的にEffectを見分けやすい値へして、Mask接続前後を比較します。

### Bitmap MaskのChannelが想定と違う

Bitmap MaskはAlphaだけでなくRed / Green / Blue、Hue、Luminance、Saturation等からMaskを作れます。

目的のchannelを選んでいるか、Thresholdで範囲を消していないか確認します。

## 修正手順

1. 対象NodeからMaskを外す。
2. 対象Node単体で明確なEffectを確認する。
3. Mask単体をViewerで確認する。
4. Primitive / PolygonならLevel = 1、Invert offの単純な状態へ戻す。
5. BitmapならChannelとThresholdを確認する。
6. MaskをEffect Maskへ再接続する。
7. 複数Maskが必要なら1つずつ追加し、Paint Modeごとに結果を確認する。

## なぜ起きるか

Mask branchは「どこへ処理するか」、Image / Effect branchは「何をどう処理するか」を担当します。

両方を同時に触ると、Maskが悪いのかEffectが悪いのか判断できなくなります。

## 関連する考え方

- [マスク（Mask）](../../learn/02-data/mask)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## 関連Node

- [Maskノード](../../nodes/masks/)
- [Ellipse Mask](../../nodes/masks/ellipse-mask)
- [Polygon Mask](../../nodes/masks/polygon-mask)
- [Bitmap Mask](../../nodes/masks/bitmap-mask)
- [Merge](../../nodes/compositing/merge)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 108でLevel、Invert、Paint Mode、Bitmap MaskのChannel / Thresholdを確認し、Chapter 94でMergeのEffect Mask挙動を確認しています。

Node固有のEffect Mask処理順は対象NodeのReferenceを優先します。
