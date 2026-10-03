---
title: Foreground / Background / Mask
description: Mergeの3つの役割を使って、合成を「何を・何へ・どこで」に分解する。
doc_type: concept
term_id: foreground-background-mask
term_short: Mergeを何を・何へ・どこで合成するかに分ける3つの役割。
verification: partial
aliases: [Foreground, Background, Effect Mask, 合成]
concepts: [foreground-background, effect-mask, compositing]
nodes: [Merge]
tasks: [composite, layer, mask]
prerequisites: [node-graph, image-data, mask-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
---
# Foreground / Background / Mask

## このページで分かること

2枚の画像を合成するときに、接続を単なる上下関係ではなくForeground / Background / <Term id="mask">Mask</Term>の役割で読みます。

## 基本の考え方

<Term id="merge">Merge</Term>では、合成を3つの質問へ分けます。

1. **Background** — 何を基準にするか。
2. **Foreground** — 何をそこへ重ねるか。
3. **Mask** — その処理をどこへ適用するか。

Blackmagic Designの現行Fusion紹介では、Mergeの黄色inputがBackground、緑inputがForegroundとして示されています。Maskは青いMask inputへ接続してeffectの対象領域を制限します。

## 最小例

```text
Foreground image ──┐
                   ├─ Merge1 → Output
Background image ──┘
                    ↑
                  Mask
```

最初はApply Modeや複雑なalpha操作を増やさず、2画像の役割とMaskの有無だけを観察します。

## 共通ルール

- BackgroundとForegroundは、同じ「画像入力」でも責任が異なる。
- Maskは3枚目の見た目を足すのではなく、処理範囲を制御する。
- 画像を入れ替えると、同じ2枚でも合成の意味が変わる。
- 複雑な合成でも、1つのMergeごとにこの3つへ分解できる。

## 1つずつ変えて確認する

ForegroundとBackgroundを入れ替えて比較します。

他のcontrolは変えず、入力の役割だけを反転させます。見た目だけでなく「どちらを基準画像としているか」が変わったことを確認します。

次にMaskだけを追加し、「合成内容」と「合成範囲」を別々に観察します。

## 他のNodeにも応用する

### Image stacking

複数枚を重ねる場合でも、1段のMergeへ分解すれば各段のForeground / Backgroundを追えます。

### Effect Mask

別のeffect NodeでMask inputを見る場合も、「処理内容」と「適用範囲」を分離する考え方を転用できます。

### 診断

結果が想定と違う場合、まず入力役割を確認してからApply Modeやalphaへ進むと、原因候補を減らせます。

## 初見のNodeを読む

初見の合成Graphでは、まず各Mergeについて次を読めます。

- Backgroundは何か。
- Foregroundは何か。
- Maskがあるか。
- そのMergeの前後をViewerで比較できるか。

## よくある誤解

**見た目の上下だけでForeground / Backgroundを決めること。**

Graphでは、画面上のNode配置ではなく、どのinputへ接続されているかが役割を決めます。

また、alpha / premultiplication / Operatorの詳細は、このページでは扱いません。そこは別Concept / Referenceの責任です。

## 関連パターン

- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 関連Node

- [Merge](../../nodes/compositing/merge)

## 次に読む

→ [キーフレーム / スプライン / 時間（Keyframe / Spline / Time）](../05-time/keyframes-spline-time)

---
検証メモ: MergeのForeground / Background inputとMask inputの基本は、2026-10-02時点のBlackmagic Design公式Fusion紹介と照合済み。alpha・premultiplication・Operatorの詳細はこのページでは未検証です。
