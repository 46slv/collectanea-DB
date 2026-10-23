---
title: マスク（Mask）
description: FusionのMaskを、RGBA Imageとは別の単一channelデータとして理解し、Effectをどこへ適用するかを制御する。
doc_type: concept
term_id: mask
term_short: Nodeの処理範囲を制限する単一channelのMask data。
verification: partial
aliases: [Mask, Effect Mask, matte area]
concepts: [mask-data, effect-mask]
tasks: [mask, isolate-effect, debug]
prerequisites: [image-data, typed-connections]
level: foundation
product_scope: fusion
updated: "2026-10-23"
---

# マスク（Mask）

## このページで分かること

FusionのMaskが何を持つデータなのか、通常のRGBA ImageやImage Alphaと何が違うのかを整理します。

## 基本の考え方

Maskは、主に**どこへ処理を適用するか**を表す単一channelのデータです。

```text
Image → Effect → Output
          ↑
        Mask
```

Mask Nodeは、通常のRGBA画像を作るGeneratorではありません。白・黒・グレーで見えることはありますが、その値は「画像の色」ではなくEffectの適用量として使われます。

## 白・黒・グレー

基本的には次のように読みます。

- **白 / 1.0** — Effectを最大まで適用する領域
- **黒 / 0.0** — Effectを適用しない領域
- **グレー / 中間値** — Effectを部分的に適用する領域

Ellipse Mask等のLevelを下げると、Mask内部の値そのものが下がり、Effectの効き方も弱くなります。

## Effect Mask

Blur、Color Corrector、Merge、Transformなど多くの2D Nodeには青色のEffect Mask入力があります。

Maskを接続すると、Node本来の処理内容は変えずに、処理を適用する範囲だけを制限できます。

```text
Image → Blur → Output
          ↑
       Ellipse
```

この場合、Blurの強さはBlur側、Blurをかける場所はEllipse Mask側が担当します。

<!-- capture-reuse:R03 -->
### 実機の参考例：効果と範囲の分担

同じBlur Size 20でも、左は全体がぼけ、右はEllipse Maskを接続した楕円内だけにBlur結果が反映されます。

[![S07の実機撮影：効果と範囲の分担の接続](/img/fusion/captures/S07/graph.png)](/img/fusion/captures/S07/graph.png)

[![S07の実機撮影：効果と範囲の分担の表示結果](/img/fusion/captures/S07/compare.png)](/img/fusion/captures/S07/compare.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS07の固定例を再掲しています。[撮影条件と確認範囲](/img/fusion/captures/S07/capture.json)で元の設定を確認できます。

## Image Alphaとの違い

Image AlphaはRGBA Image自身の透明度channelです。

Effect Maskは別branchからNodeへ入り、「そのNodeの処理をどこへ効かせるか」を制御します。

Maskを接続しただけで、元ImageのAlpha channelが常に直接書き換わるとは考えません。

## ShapeからMaskの適用範囲を作る

Shapeノードで作った円や文字を、別の映像にかけるエフェクトの範囲指定にも利用できます。ただし、[sEllipse](../../nodes/shapes/s-ellipse)などが出力する**Shapeデータは、Mask入力に渡す単一チャンネルのMaskとは別の種類**です。Shapeを作っただけで青いEffect Maskへつなぐのではなく、画像化した結果からマスクを取り出します。

たとえば、円の内側だけ背景映像をぼかしたい場合、次のように接続します。

```text
MediaIn（ぼかす映像） ─────────────────────→ Blur ─→ MediaOut
                                             ↑ Effect Mask（青）
sEllipse → sRender → Bitmap Mask ────────────┘
                        Channel: Alpha
```

1. sEllipseで円のShapeを作り、[sRender](../../nodes/shapes/s-render)で2D Imageへ変換します。
2. sRenderの出力を[Bitmap Mask](../../nodes/masks/bitmap-mask)の**Input（オレンジ）**へ接続し、**ChannelをAlpha**にします。円の内側と外側が意図した透明度になっているか、まずsRenderのAlphaをViewerで確認してください。
3. Bitmap Maskの出力をBlurの**Effect Mask（青）**へ接続します。BlurのImage入力にはぼかしたいMediaInを渡すため、sEllipseの図形を映像へ重ねるのではなく、**その形でぼかしの範囲を指定**する構成になります。

円の形で範囲を指定するだけなら、[Ellipse Mask](../../nodes/masks/ellipse-mask)をBlurへ直接つなぐ方が短い構成です。ShapeのままsGridで複製した模様や、sBooleanでくり抜いた形を再利用したいときに、Shape → sRender → Bitmap Maskという経路が役立ちます。

### Imageを直接Effect Maskへ使う場合

**Bitmap Maskは、すべてのEffect Mask接続に必須ではありません。** 21.1 Manualでは、2D ImageをEffect Mask入力へ直接接続でき、受け取るNodeのCommon Settingsで使用チャンネルを選べると説明されています。一方、入力ImageのAlphaを明示して取り出す、ThresholdやSoft Edgeで調整する、別Maskと合成する場合にはBitmap Maskを挟むと操作が分かりやすくなります。Garbage MatteやPre-Maskなど、Effect Mask以外の入力ではBitmap Maskが必要になる場合もあります。

不透明な黒い図形は、**Alphaでは高い値、Luminanceでは低い値**になり得ます。「黒く見えるからMaskでも黒」と判断せず、どのチャンネルを選択しているか確認してください。

## Maskを作る方法

Maskは複数の方法で作れます。

- Ellipse / Rectangle / Triangle — 基本図形
- Polygon / B-Spline — 任意のSpline
- MultiPoly — 複数Splineを1 Nodeで管理
- Bitmap Mask — Imageのchannelから生成
- Ranges / Wand — 明暗域や色領域から生成
- Mask Paint — 直接描画

選び分けは[Maskノード](../../nodes/masks/)を参照してください。

## 複数Maskを組み合わせる

多くのMask Nodeには青色のEffect Mask入力があります。

別Maskを接続するとPaint Modeで、Merge、Add、Subtract、Multiply等の方法を選べます。

```text
Ellipse ──────┐
              ↓
           Polygon
              ↓
        Effect Mask
```

「接続したら常に足し算になる」と考えず、最終Maskを作るNodeのPaint Modeを確認します。

## Invert

Mask全体を反転するInvert checkboxと、Paint ModeのInvertは役割が違います。

- **Invert checkbox** — 最終Mask全体を反転
- **Paint Mode: Invert** — incoming Maskと新しいMaskが重なる領域で反転処理

問題を切り分けるときは、どちらのInvertを使っているか確認します。

## 最小例

Ellipse MaskをMergeのEffect Maskへ接続します。

```text
Foreground ─┐
Background ─┼─ Merge → Output
Ellipse ────↑
```

Ellipseを外した状態と接続した状態を比べ、合成内容ではなく合成範囲だけが変わることを確認します。

## よくある誤解

### Maskは白黒Imageの別名

Viewerでは似て見えても、Flow上の役割と接続先が異なります。

### Maskをつないだら元ImageのAlphaも同じ形になる

Effect MaskとImage Alphaは別の責任です。

### 複数Maskは接続するだけで意図どおり合成される

Paint Modeによって結果が変わります。

## 関連パターン

- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## 関連Node

- [Maskノード](../../nodes/masks/)
- [Ellipse Mask](../../nodes/masks/ellipse-mask)
- [Polygon Mask](../../nodes/masks/polygon-mask)
- [Bitmap Mask](../../nodes/masks/bitmap-mask)

## 次に読む

Maskを実際のEffectへ使う方法:
→ [Mergeの適用範囲をMaskで限定する](../../recipes/masking/limit-merge-with-mask)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 108（p.2463）でBitmap Maskの2D Image入力、Channel、Effect MaskへのImage直接接続とその例外を、Chapter 117（pp.2759–2760）でsRenderのShape入力・2D Image出力を確認しました。Chapter 79ではMaskの単一チャンネル画像としての役割を参照しています。

Node固有のMask処理順は各Referenceを優先します。
