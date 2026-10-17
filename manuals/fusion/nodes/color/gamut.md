---
title: Gamut
description: FusionのRGB色空間変換とガンマの除去・付加を、接続例とRCMとの関係から説明する。
doc_type: node
term_id: gamut
term_short: RGBの色空間を変換し、ガンマカーブを取り除く・付けるColorノード。
verification: partial
aliases: [Gamut, Gmt]
concepts: [image-data, color-space, premultiplication]
nodes: [Gamut]
node_family: color
controls: [Source Space, Output Space, Remove Gamma, Add Gamma, Pre-Divide/Post-Multiply]
inputs: [image, mask]
outputs: [image]
tasks: [color-space, linear-workflow, gamut-convert]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Gamut

Gamutは、入力した2D画像のRGB値を別の色空間へ変換し、ガンマカーブを取り除いたり付けたりするノードです。主な用途は、非リニアの撮影素材を合成用にリニア化し、最後に納品用のガンマへ戻す処理です。

「色域（gamut）」は扱える色の範囲、「ガンマカーブ」は画像の明るさを数値として記録する関係を指します。色域の変換とガンマの除去・付加は別の操作です。どちらを変更するのかを確認して使います。

## 入力・出力

| 接続 | 役割 |
| --- | --- |
| Input（オレンジ） | 変換する2D画像の必須入力。 |
| Effect Mask（青） | 変換する範囲を限定する任意のマスク入力。 |
| Output | 変換後の2D画像を次のノードへ渡す。 |

Effect MaskにはPolygonやRectangleなどで作ったマスクを接続できます。マスクはノードの処理後に適用されます。Gamutは主にRGBを扱い、AlphaやZなどの補助チャンネルを変えるためのノードではありません。

## Inspector：主な設定

### Source Space

入力画像が**どの色空間・ガンマで記録されているか**を指定します。入力素材をリニア化する場合は、実際の素材に合うSource Spaceを選び、Remove Gammaを有効にします。

21.1公式マニュアルでは、Rec.709で収録した素材をリニア化する例として、Source Spaceに`ITU-R BT.709 (scene)`を選び、Remove Gammaを有効にしています。素材の記録特性が異なる場合に、この設定をそのまま使うべきではありません。

出力側のガンマを付ける用途では、Source Spaceを`No Change`にします。

### Output Space

RGBを出力先の色空間へ変換する設定です。リニア状態で合成した画像を出力する場合は、Output Spaceを納品先に合わせ、Add Gammaを有効にします。入力のガンマを外すだけなら、Output Spaceは`No Change`にしておきます。

21.1マニュアルではRec.709の選択肢の`Scene`をガンマ2.4、`Display`をガンマ2.2として説明しています。これはFusionの選択肢に関する記述であり、素材を確認せずに決め打ちしてよいという意味ではありません。

### Remove Gamma / Add Gamma

- **Remove Gamma**：Source Spaceで指定したガンマを取り除き、リニアな画像へ変換します。
- **Add Gamma**：Output Spaceで指定したガンマを付けます。

色域変換と組み合わせることも、色域を変えずにガンマだけを処理することもできます。両方の操作が必要とは限りません。

### Pre-Divide/Post-Multiply

半透明のエッジを持つ画像で、RGBがすでにAlphaによって乗算されている場合があります。これが<Term id="premultiplication">premultiplied Alpha</Term>です。

この設定を有効にすると、変換前にRGBをAlphaで割り、色の変換後に再度Alphaを掛けます。キーイングした人物やCGの輪郭で、RGBとAlphaの関係が崩れるのを防ぐための処理です。Alphaが0の場所に失われた色情報が復元されるわけではありません。入力素材のAlphaの扱いに合わせて切り替えます。

詳しくは[プリマルチプライ](../../learn/04-compositing/premultiplication)を参照してください。

### Custom

標準の選択肢にない色空間は`Custom`で定義できます。CIE 1931のRGB原色・白色点のXY座標とGamma、Linear Limitなどを設定する方式です。素材の色度座標が確認できている場合に使い、見た目を合わせるための適当な値は入れません。

## 実践例：リニアで合成してから出力する

**Resolve Color Managementによる自動変換を使っていない場合**の基本構成です。

```text
MediaIn / Loader
       ↓
Gamut（Source Space：素材に合わせる / Remove Gamma：ON）
       ↓
Merge・Blurなどの合成
       ↓
Gamut（Source Space：No Change /
       Output Space：出力先に合わせる / Add Gamma：ON）
       ↓
MediaOut / Saver
```

1. MediaIn（Resolve）またはLoader（Fusion Studio）の直後へGamutを置きます。
2. Source Spaceを素材の色空間に合わせ、Remove Gammaを有効にします。合成の途中はリニアなRGBで処理します。
3. 最後の出力ノードの手前に別のGamutを置き、Source Spaceを`No Change`、Output Spaceを出力先に合わせ、Add Gammaを有効にします。
4. 変換前後の明るさ・色味を確認し、透明部分がある場合は輪郭も確認します。

CGから出力したEXRなど、**最初からリニアの素材には入力側のRemove Gammaが不要**な場合があります。またMediaIn / Loader自身の`Source Gamma Space`と`Remove Curve`でもガンマを除去できるため、同じ素材に重ねて使わないようにします。

## Resolve Color Management（RCM）との関係

Project SettingsでDaVinci YRGB Color Managedを使用している場合、ResolveはFusionのMediaInとMediaOutを介してリニア変換を自動で行います。**通常はリニア化・出力変換のためのGamutをさらに追加する必要はありません。**

意図しない明暗差が出る場合、まずプロジェクトのColor Management、素材のInput Color Space、およびMediaIn / Loaderの変換設定を確認します。RCMの自動変換に手動のRemove / Add Gammaを重ねると、二重変換になります。

Viewer LUTはプレビュー表示の変換です。Viewerの表示を変えることと、ノードのRGB出力を変換してMediaOut / Saverへ渡すことは別です。

## 関連ノードと選択基準

| やりたいこと | ノード |
| --- | --- |
| Fusion内のSource / Output Spaceを使ってRGBの色変換・ガンマ除去や付加を行う | **Gamut** |
| 入出力のColor SpaceとGammaを個別に選び、必要ならTone / Gamut Mappingも行う | [Color Space Transform](./color-space-transform) |
| OCIO configの色空間定義へ合わせる | [OCIO Color Space](./ocio-colorspace) |
| HDR→SDRなどで輝度や彩度を出力範囲に収める | [Gamut Mapping](./gamut-mapping) |

たとえば高彩度の色を納品先の色域へ収めたい場合、単なるガンマの付け直しとGamut Mappingは目的が違います。カメラLog素材など、Gamutの選択肢で記録特性を指定できない素材では、実際の入力形式に適した変換を選びます。

## 問題が起きたとき

- **暗すぎる・明るすぎる**：RCM、Loader / MediaIn、Gamutで同じガンマ変換を重複させていないか確認します。
- **色相や彩度が想定外**：Source Spaceと実際の素材の色空間が一致しているか確認します。
- **透明な輪郭に黒縁・色縁が出る**：premultiplied Alphaの状態とPre-Divide/Post-Multiplyを確認します。
- **Viewerだけ色が違う**：Viewer LUTの有無を確認します。
- **変換が一部分だけにかかる**：Effect Maskが接続されていないか確認します。

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 93「Color Nodes」pp.2185–2187：入出力、Inspector、Custom、Gamma、Pre-Divide/Post-Multiply。
- 同Chapter 76「Managing Color for Visual Effects」pp.1654–1659：リニア化と出力の接続例、MediaIn / Loaderでのガンマ除去、Viewer LUT、RCMでの自動変換。
- 同Chapter 77「Understanding Image Channels」pp.1679–1680：premultiplied Alphaの色補正。

現在の21.1マニュアルに記載された操作を整理しています。全プリセット・既定値・range、Free / Studio差、および実機でのレンダリング結果は網羅検証していません。
