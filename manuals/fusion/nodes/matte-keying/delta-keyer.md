---
title: Delta Keyer
description: green / blue screenからAlpha matteを作り、screenのムラ、edge、spillまで段階的に整える主要Keyer。
doc_type: node
term_id: delta-keyer
term_short: "Delta Keyerは、green / blue screenから被写体を分離する主要Keyer。"
verification: partial
aliases: [Delta Keyer]
concepts: [image-data, alpha, premultiplication, keying]
nodes: [Delta Keyer]
node_family: matte-keying
controls: [View Mode, Background Color, Pre-Blur, Gain, Balance, Soft Range, Erode, Blur, Threshold, Restore Fringe, Erode/Dilate, Clean Foreground, Clean Background, Spill Method, Spill Suppression, Fringe Gamma, Fringe Size, Fringe Shape]
inputs: [image, mask, mask, image, mask]
outputs: [image]
tasks: [create-matte, keying, green-screen, blue-screen, despill]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-05"
---

# Delta Keyer

Delta Keyerは、green / blue screenの色差から被写体のAlpha matteを作るNodeです。screen colorを選んだ後、照明ムラの大きい背景、髪や半透明edge、screen colorの映り込みを別々の段階で調整できます。

## 役割

入力ImageのRGBを直接切り抜くのではなく、背景色との差からAlphaを作り、被写体を別のBackgroundへ合成できる状態にします。

21.1 Manualでは、Key、Pre Matte、Matte、Fringe、Tuningという複数の処理段階を持つadvanced color difference keyerとして説明されています。green / blue screenでは最初に試すKeyerとして扱われています。

## 入力

### Input

オレンジ色のInputへ、keyしたいgreen / blue screen素材を接続します。

### Garbage Matte

灰色のGarbage MatteへMaskを接続すると、その範囲をAlphaから除外して透明にできます。frame端の機材や、screen colorだけでは消せない領域を先に落とす用途に使います。

### Solid Matte

白色のSolid MatteへMaskを接続すると、その範囲を完全に不透明へできます。screenと似た色を持つ被写体の一部など、keyから保護したい範囲を指定できます。

### Clean Plate

Clean Plate入力には[Clean Plate](./clean-plate) Nodeで作ったscreen Imageを接続できます。screenの照明ムラや色のばらつきが大きいshotで、より均一な背景参照を与えるための入力です。

### Effect Mask

青色のEffect MaskへMaskを接続すると、Delta Keyer自体を適用する範囲を限定できます。ManualではNode処理の後に適用されるMaskとして説明されています。

## 出力

生成したAlphaと、spill処理を含むImageを出力します。Final Resultを[Merge](../compositing/merge)のForegroundへ接続すれば、透明になったscreen部分へ別のBackgroundを合成できます。

View Modeでは最終結果だけでなく、Pre Matte、Matte、Tuning Ranges、Status、Intermediate Resultも確認できます。どの段階で問題が出ているかを切り分けるための表示です。

## screen colorを選ぶ

Key tabのBackground Colorで、Viewerからgreen / blue screenの代表色を選びます。

Pre-BlurはAlphaを作る前のImageを少しぼかし、source側のnoiseやedge enhancementがkeyへ入りすぎるのを抑える用途があります。Gainは選んだscreen colorの影響を強め、Balanceはdominant channelと残り2 channelの比較比率を調整します。

## Pre Matteでscreenのムラをならす

Pre Matteは、本体のcolor difference keyより前にbackground selectionを整える段階です。最初に選んだscreen colorと照明条件が異なる領域を追加で選び、Soft Rangeでselectionの広がりを調整します。

ErodeでPre Matteのedgeを内側へ寄せ、Blurで境界を柔らかくできます。selectionが決まったらLock Color PickingでViewerからの追加選択を止められます。

外部のClean Plate入力と、Delta Keyer内のPre Matteは同じものではありません。前者はClean Plate NodeのImageを受け取る入力、後者はDelta Keyer内でscreen selectionを整える処理段階です。

## Matteを整える

Matte tabでは最終Alphaを調整します。

- **Threshold**: 低いAlphaをtransparent、高いAlphaをopaqueへ寄せる
- **Restore Fringe**: keyで削れた髪などのedgeを戻す
- **Erode/Dilate**: matteを縮小・拡大する
- **Blur**: matte edgeを柔らかくする
- **Clean Foreground / Clean Background**: foreground側の薄いAlphaやbackground側の残りを整理する

Solid / Garbage Matteもこの段階で最終Alphaへ組み合わされます。

## Fringeとspillを整える

Fringe tabは、半透明edgeに残ったgreen / blueの色かぶりを調整します。Spill MethodとSpill Suppressionでscreen colorの除去量を決め、Fringe Gamma / Size / Shapeと色補正Controlでedgeの明るさ、幅、色を整えます。

Tuning tabではShadow / Midtone / Highlightごとにkeyとspill suppressionの強さを調整できます。照明によってscreenの明暗差が大きいshotで、全体を同じ強さで処理するとedgeが崩れる場合に使います。

## 主な用途

- green / blue screenの人物を抜き、別背景へ合成する
- screenの照明ムラをPre MatteやClean Plateで補いながらkeyする
- 髪、motion blur、半透明素材のedgeを残しながらscreenを透明にする
- Solid / Garbage Matteを併用し、screen色と似た被写体部分を保護したり撮影機材を除外したりする

## 最小構成

    MediaIn → Delta Keyer → Merge → MediaOut
                              ↑
                       Background

まずBackground Colorを選び、ViewerをAlpha表示またはView ModeのMatteへ切り替えてmatteを確認します。最終的なedgeとspillは、実際の合成Backgroundを接続した状態でも確認します。

## 複雑なshotでの使い方

21.1 Manualでは、1つのKeyerだけで完全な結果にならない例として、2つのDelta Keyerを使う構成も示しています。1つ目で硬いcore matteを作り、その結果を2つ目のSolid Matteへ渡し、2つ目で柔らかいedgeを拾う構成です。

これは「Delta Keyerを増やせば必ず良くなる」という意味ではありません。screenの問題がcoreとedgeで異なるときに、役割を分けて調整する例です。

## 関連Node

- [Clean Plate](./clean-plate) — screen colorのムラをならした参照Imageを作る
- [Ultra Keyer](./ultra-keyer) — Pre-Matteとcolor differenceを組み合わせる別Keyer
- [Primatte](./primatte-5) — Fusion Studioで利用できる別のscreen keyer
- [Chroma Keyer](./chroma-keyer) — green / blueに限らず任意色からmatteを作る
- [Matte Control](./matte-control) — 作成済みAlphaを後段で組み合わせ、調整する
- [Merge](../compositing/merge) — keyed ImageをBackgroundへ合成する

## バージョンと検証状況

DaVinci Resolve 21.1 Reference Manual Chapter 109 pp.2516–2524で、5つの入力、View Mode、Key / Pre Matte / Matte / Fringe / Tuning / Mask各tab、Clean Plate、Solid / Garbage Matteを確認しています。

このページではManualで確認できないruntime REGID、実機上の端子表示、処理性能は断定していません。
