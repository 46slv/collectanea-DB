---
title: Blur / Filterノード
description: 2D Imageをぼかす・レンズのピント外れを再現する・方向や中心を持つブラーを作るNodeを、目的から選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, blur, soften, defocus, motion-blur]
updated: "2026-10-04"
---

# Blur / Filterノード

このFamilyでは、2D <Term id="image">Image</Term>の近傍pixelを参照して、ぼかし・ピント外れ・方向性のあるsmearなどを作るNodeを扱います。

最初に「均一にぼかす」のか、「レンズのピント外れを再現したい」のか、「方向や中心を持つブラーにしたい」のかを分けると選びやすくなります。

## まず選ぶ

| やりたいこと | Node | 特徴 |
| --- | --- | --- |
| 画像全体を標準的にぼかす | [Blur](./blur) | X/Yのblur量とfilterを直接調整 |
| ピント外れ・bokeh・bloomを作る | [Defocus](./defocus) | Gaussian / Lens。Lensでは絞り形状を調整 |
| 直線・放射・zoom方向へ流す | [Directional Blur](./directional-blur) | Linear / Radial / Centered / Zoom |
| 明るい部分へ光のにじみを加える | [Glow](./glow) / [Soft Glow](./soft-glow) | blurした光成分を元Imageへ合成 |
| Detailを強くする | [Sharpen](./sharpen) / [Unsharp Mask](./unsharp-mask) | blurとは逆方向のdetail強調 |
| Mapで場所ごとにblur量を変える | [Vari Blur](./variblur) | 別Imageのchannelでblur量を制御 |
| Motion Vectorからmotion blurを作る | [Vector Motion Blur](./vector-motion-blur) | vector map / AOVを利用 |

## Blur

```text
Image → Blur → Output
          ↑
       optional Mask
```

Blurは最も基本的なぼかしです。Filterを選び、Blur Sizeを増やします。X/Yをlock解除すると、横方向と縦方向で別のblur量にできます。

## Defocus

Defocusは単にpixelを平均化するだけでなく、camera lensのピント外れを想定した見た目を作ります。

Gaussianは速く単純、Lensはよりlens-likeですが重くなります。Lens modeではLens Type / Angle / Sides / Shapeでbokeh形状を調整できます。

## Directional Blur

Directional Blurは方向や中心を持つブラーです。

- Linear — 一方向へ流す
- Centered — 元の位置の両側へ均等に流す
- Radial — 中心から放射状
- Zoom — zoom streakのような放射

移動感、speed streak、light ray風の表現を作りたい場合に使います。

## Effect Mask

Blur系の多くは青色のEffect Mask入力を持ちます。

Maskはblurを作る処理そのものを変えるのではなく、最終的にどの範囲へEffectを適用するかを制限します。

```text
Image → Blur → Output
          ↑
       Ellipse
```

Maskの考え方は[マスク（Mask）](../../learn/02-data/mask)を参照してください。

## DoD / Clipping Mode

Blurは周囲のpixelを参照するため、<Term id="domain-of-definition">Domain of Definition</Term>の境界が見た目へ影響することがあります。

21.1 ManualではBlur / Defocus等にFrame / Domain / NoneのClipping Modeがあり、特に大きなfilterでedge clippingが見える場合の確認項目になります。

端だけ不自然な場合は、Blur Sizeだけを調整せず、DoDとClipping Modeも確認します。

## Filterの違い

Blur系ではBox、Bartlett、Multi-box、Gaussianなど複数のfilterが使われます。

速度と見た目のtradeoffがあり、Gaussianはfloat-depth画像の極端な条件でringingを生むことがあるため、Manualはその場合にMulti-boxを候補として挙げています。

filter名を単純な「品質順位」と考えず、素材・blur量・速度・edge挙動で選びます。

## 関連する考え方

- [有効領域（Domain of Definition）](../../learn/03-space/domain-of-definition)
- [Resolution / Domain of Definitionを確認する](../../learn/07-debugging/resolution-domain-of-definition)
- [マスク（Mask）](../../learn/02-data/mask)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 92、pp.2108–2130を基に整理しています。

このFamily OverviewはNodeの選び分けを担当します。各filterの全数式、内部REGID、GPU性能、Edition差は個別Node Reference / runtime確認へ分けます。
