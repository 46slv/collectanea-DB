---
title: Luma Keyer
description: 選んだ明るさ・色チャンネルの値からアルファを作り、画像の切り抜きや効果範囲の指定に使う。
doc_type: node
term_id: luma-keyer
term_short: "Luma Keyerは、明るさなどのchannel値からAlpha matteを作るKeyer。"
verification: partial
aliases: [Luma Keyer, LKy]
concepts: [image-data, alpha, premultiplication]
nodes: [Luma Keyer]
node_family: matte-keying
controls: [Channel, Threshold, Filter, Blur, Clipping Mode, Contract/Expand, Gamma, Invert, Post-Multiply Image]
inputs: [image, mask, mask, mask]
outputs: [image]
tasks: [create-matte, luminance-key, channel-key]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-23"
---

# Luma Keyer

Luma Keyerは、映像の明るさや選択した色チャンネルの値を基準に、**残す場所と透明にする場所を決める**ノードです。例えば、暗い背景に明るい看板が写っている映像から、看板の明るい部分だけを取り出せます。作られたアルファ（Alpha）は、各画素をどの程度見せるかを示し、黒が透明、白が不透明、灰色が半透明です。

名前に「Luma」とありますが、明るさ（Luminance）以外も判定に使えます。背景の特定色を直接選びたい場合は[Chroma Keyer](./chroma-keyer)などを検討します。

## 役割と入出力

Luma Keyerは**2D Imageを受け取り、判定結果のアルファを含む2D Imageを返します**。元の画像のRGBを保持しながら、明るさなどの値で透明度を作る処理です。

21.1 Manualでは、Node Editorの4入力を次のように説明しています。

| 入力 | 受け取るもの | 役割 |
| --- | --- | --- |
| **Input（オレンジ）** | 2D Image | アルファを作る元画像。 |
| **Garbage Matte（灰色）** | Mask | 指定範囲を透明にする。画面端の不要物を除く場合などに使う。 |
| **Solid Matte（白）** | Mask | 指定範囲を不透明にする。必要な被写体が抜けてしまう場所を保護する。 |
| **Effect Mask（青、任意）** | Mask | このノードによるキーイングを適用する範囲を限定する。 |

Garbage MatteとSolid Matteは生成されたアルファへ直接作用し、Effect Maskはノードの処理後に適用されます。同じ「マスク」でも役割が異なります。

出力は、通常の画像合成に使う方法と、**別ノードのマスク入力へつなぐ方法**の両方があります。

```text
明るい被写体の素材 → Luma Keyer → Merge（Foreground）
別の背景素材 ─────────────────────→ Merge（Background）
```

この場合、選択した明るい部分が残り、透明になった場所には背景画像が見えます。

```text
MediaIn ─────────────────→ Color Corrector → MediaOut
   └────→ Luma Keyer ─────→ Color CorrectorのEffect Mask
```

こちらは元画像を色補正ノードへ送り、Luma Keyerが作ったアルファを「どこへ色補正を効かせるか」の指定に再利用する構成です。21.1 Manualの基本例にも、Luma Keyer出力をMergeのEffect Maskへ接続する使い方が掲載されています。

## 主な設定

### Channel：何の値で分けるか

判定に使うチャンネルは**Red / Green / Blue / Alpha / Hue / Luminance / Saturation / Depth（Z-buffer）**から選びます。

光る文字や明るい窓なら、まずLuminanceを試します。明るさでは分けにくくても、赤と緑の差が大きい素材ならRedやGreenを選んだ方が区別できる場合があります。Depthは入力画像に対応する深度情報がある場合の選択肢です。通常の映像から深度を自動推定する機能ではありません。

### Threshold：透明と不透明の境界

Thresholdには**下限（左側のハンドル）と上限（右側）**があります。

- 下限より小さい値は黒（透明）。
- 上限より大きい値は白（不透明）。
- その間の値は灰色（半透明）になり、柔らかい境界を作ります。

まず両端を動かして、残したい部分が白、消したい部分が黒になる位置を探します。上限と下限の間を広く取ると中間アルファの領域が増えます。逆の選択が欲しい場合は**Invert**で白黒を反転します。

### Filter / Blur / Clipping Mode：境界を整える

**Blur**はマットの境界をぼかします。0ならぼかさず、値を増やすと境界が柔らかくなります。**Filter**は、そのぼかし方を選びます。

- **Box**：高速で、少量のぼかし向け。
- **Bartlett**：速度と品質の折衷。
- **Multi-box**：Num Passesで処理回数を指定する。
- **Gaussian**：滑らかなぼかしを得やすいが、ほかより処理が重くなる場合がある。

Blurで画面端や素材の境界が不自然に切れる場合は、**Clipping Mode**も確認します。Frameはフレーム全体を処理範囲とし、Domainは上流のDoD（実際にデータがある範囲）を尊重します。Noneは通常のソース画像クリッピングを行いません。見た目の差は上流画像のDoDとぼかし量によって変わります。

### Contract/Expand / Gamma：半透明部分の調整

**Contract/Expand**はマットを縮める・広げる調整で、正の値で広げ、負の値で縮めます。ただし、**半透明の領域だけに作用し、完全に硬い境界には効果がありません**。輪郭を少しぼかしてから使うのが典型的な組み合わせです。

**Gamma**は半透明の灰色部分を調整します。値を上げると不透明側へ、下げると透明側へ寄ります。完全な黒や白の領域は変わりません。単に輪郭を広げる操作ではなく、**境界の濃さを変える**操作として使い分けます。

### Post-Multiply Image：RGBとアルファの関係

オンでは、生成したアルファをRGBへ乗算します。21.1 Manualでは**既定でオン**です。

オフにするとRGBがアルファで乗算されていない画像になるため、ほかの画像へ合成する際に想定と異なる縁の明るさが生じる場合があります。Manualではオフの場合、Mergeの**Subtractive**を使用し、**Additive**と区別するよう説明しています。通常は既定を保ち、変更するときだけ後段の合成方式を一緒に確認します。

## 運用例：夜景の看板だけ色を変える

夜景の映像で明るい看板だけ色を補正したい場合、映像を2本に分岐させます。一方をColor Correctorの画像入力へ、もう一方をLuma Keyerへ接続します。

1. Luma KeyerのChannelを**Luminance**にし、Thresholdで看板の明るい部分が白、周囲の暗い部分が黒になるよう調整します。
2. Luma Keyer出力をColor Correctorの**Effect Mask**に接続します。色補正を受ける範囲が、Luma Keyerのアルファで制限されます。
3. Color Corrector側で色や明るさを変更し、看板以外にも効果がかかっていないか確認します。
4. ほかの街灯なども選択される場合は、Luma KeyerのEffect MaskへRectangleなどのMaskをつないで、看板付近にキーイングの範囲を絞ります。

明るさだけで看板と周囲を完全に分離できるとは限りません。この例では、**値による選択をThresholdが担当し、場所による限定をMaskが担当**します。具体的な素材での描画結果は21.1実機で未検証です。

## 想定どおりに抜けないとき

- **残したい場所が消える**：Thresholdの下限・上限とInvertを確認します。必要ならSolid Matteで保護します。
- **ほかの明るい物まで選ばれる**：判定するChannelを変えるか、Effect Maskで範囲を絞ります。
- **輪郭が硬すぎる**：Blurを少し加え、必要ならContract/ExpandとGammaを別々に調整します。完全に硬い輪郭ではContract/Expandだけを動かしても変化しません。
- **合成後に半透明の縁が不自然**：Post-Multiply Imageの状態と、後段Mergeの合成方式を確認します。
- **Blurで画像端が切れる**：Clipping Modeと上流DoDを確認します。

色域で選ぶ[Chroma Keyer](./chroma-keyer)、別撮りの背景との差を使う[Difference Keyer](./difference-keyer)、作成したマットをさらに調整する[Matte Control](./matte-control)とは、必要な手掛かりと工程で使い分けます。合成後の画像の扱いは[Merge](../compositing/merge)も参照してください。

## バージョンと確認範囲

出典：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 109「Matte Nodes」、**pp.2530–2533**。4入力と役割、ChannelとThreshold、Filter / Blur / Clipping Mode、Contract/Expand、Gamma、Invert、Post-Multiply Image、およびマスク入力への出力利用をManual本文で確認しました。公式資料の公開元は[Blackmagic Designサポート](https://www.blackmagicdesign.com/support)です。

夜景の看板の例はManualの機能説明から組み立てた手順であり、特定素材での実機検証結果ではありません。内部REGID、現行hostでの端子表示、実測性能、Free/Studioの差は今回検証していません。そのため`verification: partial`を維持します。
