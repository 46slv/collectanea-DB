---
title: Chroma Keyer
description: Viewerで選んだ任意の色域からAlpha matteを作り、不要な色を透明にする汎用Keyer。
doc_type: node
term_id: chroma-keyer
term_short: "Chroma Keyerは、選んだ色域を透明にしてAlpha matteを作るKeyer。"
verification: partial
aliases: [Chroma Keyer, CKy]
concepts: [image-data, alpha, premultiplication]
nodes: [Chroma Keyer]
node_family: matte-keying
controls: [Key Type, Color Range, Lock Color Picking, Soft Range, Spill Color, Spill Suppression, Spill Method, Fringe Gamma, Fringe Size, Fringe Shape, Filter, Num Passes, Blur, Clipping Mode, Contract/Expand, Gamma, Threshold, Restore Fringe, Invert Matte, Post-Multiply Image, Reset Color Ranges]
inputs: [image, mask, mask, mask]
outputs: [image]
tasks: [create-matte, keying, despill]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-24"
---

# Chroma Keyer

Chroma Keyerは、2D Imageから不要な色を選び、その色域を透明にしてAlpha matteを作るNodeです。green / blueに限らず任意の色を選べるため、特定色を基準に単純なkeyを作りたいときに使います。

## 役割

Viewer上で抜きたい色を選ぶと、そのselectionを基準にAlphaが作られます。元のImageを別素材へ置き換えるのではなく、選んだ色が透明になるようにImageのAlphaを更新します。

21.1 Manualでは、blue / green screenには専用の調整を持つ[Delta Keyer](./delta-keyer)または[Primatte](./primatte-5)を先に検討するよう案内しています。Chroma Keyerは、screen colorが典型的なblue / greenではない場合や、任意色を直接選んでkeyを作りたい場合に向きます。

## 入力

### Input

オレンジ色のInputへ、色を抜きたい2D Imageを接続します。

### Garbage Matte

灰色のGarbage MatteへMaskを接続すると、その範囲を強制的に透明へできます。撮影フレーム端の機材など、色選択だけでは消せない領域を先に除外するときに使えます。

### Solid Matte

白色のSolid MatteへMaskを接続すると、その範囲を強制的に不透明へできます。抜きたい色と似た色が被写体側にもあり、その領域だけ残したいときに使います。

### Effect Mask

青色のEffect Maskは、生成したAlphaを画像へ乗算する範囲をMaskで限定する入力です。21.1 ManualではNodeの処理後に適用されると説明されており、Garbage MatteやSolid MatteのようにAlphaの不透明・透明領域を直接指定する入力とは役割が異なります。

## 出力

選択した色域から生成したAlphaを含む2D Imageを出力します。[Merge](../compositing/merge)のForegroundへ接続すれば、透明になった部分からBackgroundを見せられます。

Post-Multiply Imageを有効にすると、生成したAlphaをRGBへ乗算してpremultiplied状態にします。21.1 Manualでは通常有効で、既定もOnです。無効にした出力はpremultiplied画像ではないため、Manualは後段のMergeでAdditiveではなくSubtractiveを使うよう案内しています。

## 色を選ぶ

### Key Type

- **Chroma**: 選択した色域のRGB値を基準にmatteを作ります。
- **Color**: 選択した色域のHueを基準にmatteを作ります。

Nodeを選択した状態でViewer上の色をドラッグして指定すると、Color Rangeがそのselectionに合わせて更新されます。

Lock Color Pickingを有効にするとViewerからの色追加を止められるため、selectionを決めた後の誤操作を防げます。Soft Rangeはselectionへ近い色を追加して境界を緩め、Reset Color Rangesは色選択だけをリセットします。

## Spillを抑え、半透明の縁を整える

背景の色が髪や衣装へ反射して残る現象を、色かぶり（spill）と呼びます。Image tabでは、Spill Colorで基準色を選び、Spill Suppressionで除去量を調整します。値が0ならspill suppressionは適用されません。

Spill Methodは除去方法の強さを切り替えます。

- **None** — spillを除去しません。
- **Rare** — 最も弱く除去します。
- **Medium** — Manualではgreen screenに適すると説明されています。
- **Well Done** — Manualではblue screenに適すると説明されています。
- **Burnt** — 除去が難しいblue screen向けの強い方法です。肌色などに追加の色補正が必要になる場合があります。

Fringe Gammaは縁の明るさ、Fringe Sizeは縁の幅、Fringe Shapeは縁を内側・外側のどちらへ寄せるかを調整します。Cyan/Red、Magenta/Green、Yellow/Blueの補正は、半透明pixelに残った背景色を合成先へなじませるためのものです。これらはAlphaの形を整える調整と区別して確認します。

## Matteの境界と密度を調整する

まずViewerでAlphaを表示し、残したい被写体が白、抜きたい背景が黒、半透明の縁が灰色になっているかを確認します。Matte tabの主な設定は次のとおりです。

- **Filter / Blur** — Blurの量と方式を指定します。FilterのBoxは軽量な小さいぼかし、Bartlettは速度と画質の折衷、Gaussianは高品質ですが相対的に遅い方式です。Multi-boxではNum Passesを使用し、Manualでは1回がBox、2回がBartlettと同じ結果、4回以上は通常Gaussianに近い画質になると説明されています。
- **Clipping Mode** — DoD（データの有効領域）をまたぐぼかしの扱いを指定します。Frame（既定）は全フレームを対象にし、Domainは上流のDoDを尊重します。Noneは上流DoDの外で必要な画素を黒・透明として扱います。大きくぼかした際の縁の欠けは、モードを変えて比較します。
- **Contract/Expand** — 半透明部分を縮小・拡張します。負の値で縮小、正の値で拡張します。完全に硬い境界だけのmatteには効果がありません。
- **Gamma** — 半透明部分のAlphaを調整します。値を上げると灰色部分がより不透明に、下げるとより透明になります。完全な黒・白は変わりません。
- **Threshold** — 下限より小さいAlphaを透明、上限より大きいAlphaを不透明にし、間の値は相対的な透明度を維持します。細かな点状noiseの整理に使います。
- **Restore Fringe** — keyで失われた髪などの縁を戻すための調整です。
- **Invert Matte** — 生成したAlphaの透明と不透明を反転します。

Solid MatteとGarbage MatteはAlphaへ直接作用し、それぞれ接続したMaskを合成する前にInvertで反転できます。異なるモードのGarbage Matteを1つのKeyer内で混在させることはできないため、追加のmatte処理が必要なら後段の[Matte Control](./matte-control)を利用します。

## 主な用途

- 任意色の背景を透明にし、別のBackgroundへ合成する
- ロゴやgraphicの単色背景を抜いて、映像上へ重ねる
- blue / green以外の色を基準に簡単なmatteを作る
- Garbage / Solid Matteを併用し、色だけでは判断しにくい領域を手動で保護・除外する

## 最小構成

    MediaIn → Chroma Keyer → Merge → MediaOut
                                ↑
                         Background

まずViewerで抜きたい色を選び、Mergeへ接続してedgeとspillを実際の合成背景上で確認します。

## 運用例

紫色の布を背景に白い商品を撮影し、夜景へ重ねる場合の構成例です。これはManualに記載された各Controlを組み合わせた**確認用の手順**であり、Resolve 21.1実機での描画結果を検証した例ではありません。

1. 商品素材をMediaInからChroma KeyerのInputへ接続し、夜景をMergeのBackground、Keyer出力をForegroundへ接続します。
2. Viewer上で紫色の布をドラッグしてColor Rangeを選びます。明暗の変化も含めて抜きたい場合はRGB値を使うChroma、色相を中心に選びたい場合はColorを比較します。選択が決まったらLock Color Pickingを有効にします。
3. ViewerでAlphaを表示し、布に残る灰色の領域と商品の輪郭を確認します。必要な場合だけSoft RangeとThresholdを調整し、縁の滑らかさはBlurとContract/Expandで整えます。
4. 画面端に布以外の機材が映る場合はGarbage Matteを接続します。商品に紫色が含まれ、その部分まで消える場合はSolid Matteで保護する範囲を指定します。
5. Mergeの結果を見ながら、商品に残る紫色の反射をSpill SuppressionとFringeの設定で調整します。**Alpha表示だけで終わらず、実際の合成背景上で縁を確認**します。

## 挙動と注意点

Chroma Keyerは選んだ色域を基準にするため、被写体と背景が同じ色を持つshotでは選択だけで完全には分離できません。Solid / Garbage Matteを併用するか、blue / green screenならDelta Keyer / Primatteを比較します。

Contract/ExpandとGammaは半透明部分を対象とします。完全に白黒へ切れた硬い輪郭を変えたいときは、まずBlurやThresholdの調整を確認します。大きなBlurで境界が途切れる場合はDoDとClipping Modeを確認してください。Post-Multiply Imageを無効にした場合は後段MergeのOperatorも合わせて確認します。

## 関連Node

- [Delta Keyer](./delta-keyer) — green / blue screen向けの主要Keyer
- [Primatte](./primatte-5) — green / blue screen用の別algorithm
- [Luma Keyer](./luma-keyer) — 色ではなく明るさやchannel値からmatteを作る
- [Matte Control](./matte-control) — 作成済みAlphaを後段で調整する
- [Merge](../compositing/merge) — keyed ImageをBackgroundへ合成する

## バージョンと検証状況

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）Chapter 109 Matte Nodes pp.2506–2511で、4入力の役割、Chroma / Color selection、spill処理の方法、Filter / Clipping Mode / Matte controls、Solid / Garbage MatteのInvert、Post-Multiply ImageとMergeのOperatorを確認しています。

運用例はこのManualに記載された機能から組み立てた構成案です。Resolve / Fusion 21.1実機での端子表示、描画結果、REGID、処理性能、ホストやEditionごとの可用性は未検証のため、`verification: partial`を維持しています。
