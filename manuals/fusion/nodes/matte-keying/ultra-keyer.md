---
title: Ultra Keyer
description: green / blue screenをPre-Matteとcolor-differenceの2段階で分離し、細いedgeや半透明部分、spillまで調整するKeyer。
doc_type: node
term_id: ultra-keyer
term_short: "Ultra Keyerは、Pre-Matteとcolor-difference keyerを組み合わせてgreen / blue screenを抜くNode。"
verification: partial
aliases: [Ultra Keyer, UKY]
concepts: [image-data, alpha, premultiplication, keying]
nodes: [Ultra Keyer]
node_family: matte-keying
controls: [Background Color, Red Level, Green Level, Blue Level, Background Correction, Matte Separation, Pre-Matte Range, Lock Color Picking, Pre Matte Size, Spill Suppression, Spill Method, Fringe Gamma, Fringe Size, Fringe Shape, Filter, Blur, Clipping Mode, Contract/Expand, Gamma, Threshold, Restore Fringe, Invert Matte, Post-Multiply Image, Subtract Background]
inputs: [image, mask, mask, mask]
outputs: [image]
tasks: [create-matte, keying, green-screen, blue-screen, despill]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Ultra Keyer

Ultra Keyerは、green / blue screen素材から被写体を分離するKeyerです。最初にPre-Matteで背景を大きく取り除き、その後のcolor-difference処理で髪、motion blur、半透明部分のような細かな境界を拾います。結果はAlphaを持つ2D Imageとして出力され、そのまま[Merge](../compositing/merge)のForegroundへ接続できます。

## 役割

Ultra Keyerの特徴は、1つのNodeの中に性格の異なる2段階のkey処理を持つことです。

Pre-Matteは、screen色のばらつきや大きな背景領域を先に整理します。color-difference側は、背景色と被写体の色差を使って細かな透明度を作ります。最初から髪の1本1本だけを狙うのではなく、背景を大きく分けてからedgeを詰める構成です。

21.1 Manualでは、green / blue screenの第一候補としてまず[Delta Keyer](./delta-keyer)を試し、Fusion Studioでは必要に応じて[Primatte](./primatte-5)、その次の候補としてUltra Keyerを試す流れが示されています。これは画質の順位ではなく、shotによって合うKeyerが異なるための選択順です。

## 入力

### Input

オレンジ色のInputへ、抜きたいgreen / blue screen素材を2D Imageとして接続します。

### Garbage Matte

灰色のGarbage MatteへMaskを接続すると、その範囲をAlphaから除外して透明にできます。screen外に写り込んだ撮影機材や、key処理だけでは消しにくい画面端を先に落とす用途に使います。

### Solid Matte

白色のSolid MatteへMaskを接続すると、その範囲を完全に不透明へできます。screen色に近い衣服や目など、keyで消えてほしくない領域を保護するときに使います。

### Effect Mask

青色のEffect MaskへMaskを接続すると、Ultra Keyerを適用する範囲そのものを限定できます。21.1 Manualでは、このMaskはNodeの処理後に適用されると説明されています。

## 出力

key処理で作ったAlphaと、spill補正を含むRGBを持つ2D Imageを出力します。MergeのForegroundへ接続すれば、透明になったscreen部分へ別の背景を合成できます。

## Pre-Matteで背景を大きく分ける

Pre-Matte tabはscreen色を選び、後段の細かなkey処理に入る前に背景を整理する場所です。

**Background Color**で、被写体の近くにある代表的なgreen / blue screen色を選びます。Red Level / Green Level / Blue Levelは、選んだscreen色に応じてcolor-differenceの比較に使うchannelを調整します。Background Correctionは、pre-keyされたImageをgreenまたはblueの背景へ反復的に合成してから後段へ渡す処理で、shotによってはedgeを自然にできます。

**Matte Separation**は、foregroundとbackgroundを大きく分けるための前処理です。Alphaを見ながら上げ、背景の大部分が消えるところまで進めます。ただし、被写体に穴が開いたり、髪などの細いedgeが削れ始める前で止めます。

Pre-Matte RangeのR / G / B / Luminance範囲はViewerで選んだ色に合わせて更新され、必要なら範囲を微調整できます。screen色の選択が終わったらLock Color Pickingを有効にすると、Viewer操作で選択範囲を誤って増やすのを防げます。

**Pre Matte Size**は、keyed領域の周囲を柔らかくして、spillの影響で半透明部分にできた穴を閉じるために使えます。値を強くすると被写体の周囲にhaloが出ることがあるため、後段のMatte controlsと合わせて確認します。

## Image tabでspillを整える

spillは、green / blue screenの色が髪やmotion blurなどの半透明edgeへ残る現象です。Image tabでは、この色かぶりを主に調整します。

**Spill Suppression**は除去量を調整し、**Spill Method**で処理方法を選びます。21.1 Manualでは、Mediumはgreen screen、Well Doneはblue screen向け、Burntは扱いにくいblue-screen shot向けとして説明されています。

Fringe Gammaはedgeの明るさ、Fringe Sizeはhaloの幅、Fringe Shapeはfringeを内側または外側へ寄せる方向を調整します。Cyan/Red、Magenta/Green、Yellow/Blueの補正は、元screen色が残った半透明pixelを新しい背景になじませるときに使います。

## Matte tabでAlphaを仕上げる

Matte tabでは、Pre-Matteとcolor-difference処理で得たAlphaを整えます。調整時はViewerをAlpha表示にして、白いforeground、黒いbackground、灰色の半透明edgeを直接確認すると判断しやすくなります。

- **Filter / Blur**: matte edgeをぼかす方法と量を選びます。
- **Clipping Mode**: Blur時にDomain of Definitionの外側をどう扱うかを選びます。Frameはfull frame、Domainは上流DoDを尊重し、Noneは範囲外をblack / transparentとして扱います。
- **Contract/Expand**: 半透明edgeを縮小・拡大します。21.1 Manualでは0より大きい値でexpand、0より小さい値でcontractします。
- **Gamma**: 半透明部分のAlphaだけを明るく、または暗くします。完全なblack / white領域は変えません。
- **Threshold**: 下側より小さいAlphaをtransparent、上側より大きいAlphaをopaqueへ寄せます。
- **Restore Fringe**: keyで削れた髪などのedgeを戻すために使います。
- **Invert Matte**: opaqueとtransparentを反転します。

## 主な用途

- green / blue screenで撮影した人物を抜き、別の背景へ合成する
- 照明ムラのあるscreenをPre-Matteで大きく整理してから、髪やmotion blurの細いedgeを詰める
- Garbage Matteで撮影機材やscreen外を除外し、Solid Matteでscreen色に近い被写体部分を保護する
- key後のgreen / blue spillを減らし、半透明edgeの色を新しい背景になじませる

## 最小構成

    MediaIn → Ultra Keyer → Merge → MediaOut
                              ↑
                         Background

まずUltra KeyerをViewerへ表示してscreen色を選び、Alphaを確認しながらPre-MatteとMatteを調整します。その後、実際に使うBackgroundをMergeへ接続し、edgeとspillが合成先で不自然に見えないか確認します。

## 運用例

照明ムラのあるblue-screen人物を別の背景へ合成する場合は、次の順で調整できます。

1. blue-screen素材をInputへ接続し、screen外の機材や画面端があればPolygon等をGarbage Matteへ接続します。
2. Background Colorを被写体の近くのblueから選びます。
3. ViewerをAlpha表示にしてMatte Separationを上げ、背景の大部分が消える一方で髪のedgeが残る位置まで調整します。
4. 必要ならPre-Matte RangeとPre Matte Sizeでscreenのムラや小さな穴を整えます。
5. Matte tabでBlur、Contract/Expand、Gamma、Thresholdを必要な範囲だけ調整します。
6. Image tabでspillとfringe colorを整え、Mergeで実際の背景へ重ねて最終的なedgeを確認します。

## premultiplicationとedge colorの注意

**Post-Multiply Image**を有効にすると、生成したAlphaをRGBへ乗算します。21.1 Manualでは通常有効で、既定もOnと記載されています。

これを無効にした出力はpremultiplied Imageとして扱えなくなるため、ManualではMergeでAdditiveではなくSubtractiveを使うよう案内されています。

**Subtract Background**は、screen色を除去したedgeをblack背景へanti-aliasする際の色を補正します。有効にするとedgeが暗くなる場合があります。無効にするとscreen色を後段へ残せるため、別工程で色処理したい場合に使えます。

## 関連Node

- [Delta Keyer](./delta-keyer) — 21.1 Manualでgreen / blue screenの第一候補として案内されているKeyer
- [Primatte](./primatte-5) — Fusion Studioで使える別のscreen keyer
- [Chroma Keyer](./chroma-keyer) — green / blueに限らず任意の色域からmatteを作る
- [Matte Control](./matte-control) — key後のAlphaやSolid / Garbage Matte、spillを後段で調整する
- [Merge](../compositing/merge) — Ultra Keyerの出力を別背景へ合成する

## バージョンと検証状況

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2561–2568で、Ultra KeyerがPre-Matteとcolor-differenceの2段階を持つこと、Input / Garbage Matte / Solid Matte / Effect Maskの4入力、Pre-Matte / Image / Matte各tabのControl、Post-Multiply Image、Subtract Backgroundを確認しています。

このページではManualで確認できないruntime REGID、実機上の処理性能、hostごとの表示差は断定していません。
