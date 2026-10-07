---
title: "Alpha Multiply"
description: "straight ImageのRGBへAlphaを乗算し、Color処理後のImageをpremultiplied状態へ戻すためのNode。"
doc_type: node
term_id: "alpha-multiply"
term_short: "Alpha Multiplyは、straight ImageのRGBへAlphaを乗算し、premultiplied状態へ戻すNode。"
verification: partial
aliases: ["Alpha Multiply", "AML", "premultiply"]
concepts: ["alpha", "premultiplication"]
nodes: ["Alpha Multiply"]
node_family: "matte-keying"
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["premultiply", "composite", "alpha"]
level: intermediate
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# Alpha Multiply

Alpha Multiplyは、**straight（non-premultiplied）状態の2D Imageで、RGBへAlphaを乗算してpremultiplied状態へ戻すNode**です。

[Alpha Divide](./alpha-divide)でstraight状態にしてColor補正やOFXを行ったあと、Mergeなどの合成へ戻す前に使います。

<Term id="alpha">Alpha</Term>を新しく生成するNodeではなく、RGBとAlphaの<Term id="premultiplication">premultiplication</Term>関係を戻すための処理です。

## 何が起きるか

Alpha Multiplyは入力Imageのcolor channelsへAlpha channelを掛けます。

Alphaが1のpixelではRGBはそのまま、半透明pixelではRGBがAlphaに応じて小さくなり、premultiplied RGBAとして扱える状態になります。

典型的な位置は次のとおりです。

    Premultiplied Image
            ↓
       Alpha Divide
            ↓
    Color / OFX / Filter ...
            ↓
      Alpha Multiply
            ↓
          Merge

Alpha Divideでstraight状態へ戻した処理列の「出口」に置くNodeと考えると役割を把握しやすくなります。

## 入力

### Input

オレンジ色の必須入力です。

21.1 Manualでは、**straight / non-premultiplied Alphaを持つ2D Image**を入力するものとして説明されています。

すでにpremultiplied状態のImageへさらにAlpha Multiplyを適用すると、同じAlphaを二重に掛けることになります。入力状態を確認してから使います。

### Effect Mask

青色の任意入力です。

Polygon、基本shape、Paint stroke、bitmap maskなどを接続し、Alpha Multiplyの結果を適用する範囲を限定できます。21.1 Manualでは、Effect MaskはNode本体の処理後に適用されると説明されています。

Effect MaskとImage内のAlpha channelは別のものです。Effect Maskは「どこへこのNodeの結果を適用するか」を制御します。

## 出力

RGBへAlphaが乗算されたpremultiplied 2D Imageを出力します。

通常は後段のMergeなど、premultiplied RGBAを前提に扱う合成処理へ渡します。

## Inspector

Alpha Multiplyに固有のInspector Controlはありません。

乗算量をsliderで調整するNodeではなく、RGBへAlphaを掛ける処理そのものを行います。処理範囲を限定する場合はEffect Maskを使います。

## 使う場面

### Alpha Divideで始めた処理列を閉じる

複数のColor処理をstraight状態で行った場合、最後にAlpha Multiplyを置いてpremultiplied状態へ戻します。

    Alpha Divide
      ↓
    Color Correction
      ↓
    Color Curves
      ↓
    Third-party OFX
      ↓
    Alpha Multiply

21.1 Manualでは、複数の処理がstraight Alphaを期待する場合に、Alpha DivideとAlpha Multiplyで一連のNodeを挟む使い方が説明されています。

### Mergeへ戻す前にpremultiplyする

Color処理中だけstraight状態にしていたImageを、そのままMergeへ渡すのではなく、Alpha Multiplyを通してpremultiplied状態へ戻します。

「Mergeの直前なら常にAlpha Multiply」という意味ではありません。入力がすでにpremultipliedなら追加する必要はありません。

## 1つのColor Nodeだけなら

対応するColor Nodeの **Pre-Divide / Post-Multiply** を使えば、Alpha DivideとAlpha Multiplyを別Nodeとして置かずに同じ前後処理を行えます。

Brightness Contrast、Color Curves、Color Correctorなどでは、Color処理前にRGBをAlphaでDivideし、処理後に再Multiplyするoptionが21.1 Manualで確認できます。

複数Nodeを連続してstraight状態で処理したい場合は、Alpha Divide / Alpha Multiplyを明示的に置く方がNode tree上で処理範囲をまとめやすくなります。

## 二重premultiplyに注意する

Alpha MultiplyをすでにpremultipliedなImageへ重ねると、半透明pixelのRGBへAlphaがもう一度掛かります。

21.1 Manualでは、この**double premultiplication**によってImageのedgeに暗いhaloが出る例が示されています。

したがって、次のように考えます。

- Alpha Divideの後でstraight状態になっている → Alpha Multiplyで戻す
- Loader / MediaInですでにpremultipliedとして扱われている → その状態のままなら追加Multiplyしない
- Node自身がPre-Divide / Post-Multiplyを行う → 外側のDivide / Multiplyと役割が重複しないか確認する

## Alpha stateを確認する

LoaderではImport tab、MediaInではClip AttributesのAlpha Modeから、embedded Alphaをどう扱うか指定できます。

透明edgeがおかしい場合、Alpha Multiplyの有無だけを見るのではなく、素材がstraight / premultipliedのどちらとして読み込まれているかから確認します。

→ [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)

## よくある使い方

CGやkeyed素材へ複数のColor処理を加える場合:

1. 入力がpremultipliedであることを確認します。
2. Alpha Divideでstraight状態へ戻します。
3. Color補正やOFXを行います。
4. Alpha Multiplyでpremultiplied状態へ戻します。
5. Mergeした結果で半透明edgeを確認します。

Alpha Multiplyは「透明にするNode」ではなく、**Color処理後のRGBと既存Alphaの関係をpremultiplied状態へ戻すNode**です。

## 関連ページ

- [Alpha Divide](./alpha-divide) — premultiplied RGBをAlphaで割り、straight状態へ戻す
- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)
- [Alpha](../../learn/04-compositing/alpha)
- [Brightness Contrast](../color/brightness-contrast)
- [Color Curves](../color/color-curves)
- [Color Corrector](../color/color-corrector)
- [Matte / Keying Family Overview](./)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 109「Matte Nodes」p.2505を基準に、Alpha Multiplyの目的、Input / Effect Mask、基本Node構成、固有Inspector Controlがないことを確認しています。

premultiplicationをColor処理するときの考え方、二重premultiplyで暗いedgeが生じる注意、Pre-Divide / Post-Multiplyとの使い分け、複数処理をAlpha Divide / Alpha Multiplyで挟む構成は、同Manual Chapter 77「Understanding Image Channels」pp.1679–1681で確認しています。

current runtimeのREGID、内部Parameter ID、Manualに記載されていないedition差はこのページでは確定していません。
