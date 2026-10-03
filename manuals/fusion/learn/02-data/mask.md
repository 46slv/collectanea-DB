---
title: マスク（Mask）
description: FusionのMaskを、Imageとは別の処理範囲dataとして理解する。
doc_type: concept
term_id: mask
term_short: Nodeの処理範囲を制限するMask data。
verification: partial
aliases: [Mask, Effect Mask, matte area]
concepts: [mask-data, effect-mask]
tasks: [mask, isolate-effect, debug]
prerequisites: [image-data, typed-connections]
level: foundation
product_scope: fusion
---
# マスク（Mask）

## このページで分かること

Maskと白黒画像の違いを整理します。

## 基本の考え方

FusionのMaskは、主に**どこへ処理を適用するか**を表すdataとして読みます。

```text
Image → Effect → Output
          ↑
        Mask
```

Maskを<Term id="intermediate-results-viewer">Viewer</Term>で白黒に見られる場面があっても、そのGraph 役割は通常Imageとは異なります。

## 最小例

Ellipse Maskを<Term id="merge">Merge</Term>のEffect Maskへ接続します。

Image 分岐を変えず、Maskの有無だけを切り替え、合成範囲が変わることを観察します。

## 共通ルール

- Maskと2D Imageを分ける。
- Effect MaskとImage Alphaを分ける。
- Mask 参照元と対象のEffectを別分岐として読めるようにする。
- Maskのshape問題と対象Nodeのeffect問題を同時に直さない。
- combine / invertの正確な挙動はNode-specific Referenceで確認する。

## 1つずつ変えて確認する

Mask connectionだけを外し、対象のEffect自体は正常か比較します。

## 他のNodeにも応用する

### Merge

Effect Maskで合成範囲を限定できます。

### Blur / Color

NodeがMask inputを持つ場合、同じ「effect範囲を限定する」考え方を転用できます。

### トラッキング

Maskをトラッキング dataへ追従させる場合も、Mask dataとトラッキング dataを別責任にします。

## 初見のNodeを読む

「Maskが効かない」症状で、Image 分岐・Mask 分岐・対象Nodeを分けて確認できます。

## よくある誤解

**Maskを繋げたのでImage Alphaも書き換わっているはず**と考えること。

Effect MaskとImage Alphaは別責任です。

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 関連Node

- [Ellipse Mask](../../nodes/masks/ellipse-mask)
- [Polygon Mask](../../nodes/masks/polygon-mask)

## 次に読む

→ [パラメータ / Data](./parameter-data)
