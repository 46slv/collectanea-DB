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

## 実機例：色補正後にMultiplyして合成へ戻す

<!-- capture-reuse:R115 -->

下段はAlpha Divide→ColorStraight→Alpha Multiply→Mergeです。ColorStraightのLevelsでMaster RGBの出力下限を0.2へ上げ、内部Pre-Divide / Post-Multiplyはオフにしました。左の直接補正は背景まで灰色になりますが、右はMultiplyを通して暗い背景を保ちます。

[![共通の楕円前景を直接補正とAlpha DivideからAlpha Multiplyまでの補正へ分け、同じ背景へ合成した実機Graph](/img/fusion/captures/S74/graph.png)](/img/fusion/captures/S74/graph.png)

[![AlphaMultiply1も固有の補正パラメーターはなく、共通Settingsが表示される](/img/fusion/captures/S74/multiply-inspector.png)](/img/fusion/captures/S74/multiply-inspector.png)

[![左の直接補正では背景が灰色に持ち上がり、右のDivideとMultiplyを通す補正では暗い背景を保つ](/img/fusion/captures/S74/compare.png)](/img/fusion/captures/S74/compare.png)

Alpha Multiplyの固有補正値はなく、共通Settingsが表示されました。内部REGIDは`AlphaMultiply`です。入力がすでにpremultipliedな場合へ追加する比較や二重乗算は、この例では検証していません。

Resolve Studio21.1.0.14／WindowsのFusionページで、1920×1080の合成を作りました。両ViewerはColor／40%。左のMergeNaiveは直接補正、右のMergeCorrectはAlpha Divide→補正→Alpha Multiplyの結果です。 この固定例の表示と保存Graphを確認しました。実写のキーイング素材、外部OFX、Effect Mask、Alphaが0に近い画素の数値、HDRと性能は未確認です。 詳しい[接続と比較条件](./alpha-divide)はAlpha Divideの実機例に記録しています。

[再現用Graph](/img/fusion/captures/S74/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S74/capture.json)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 109「Matte Nodes」p.2505を基準に、Alpha Multiplyの目的、Input / Effect Mask、基本Node構成、固有Inspector Controlがないことを確認しています。

premultiplicationをColor処理するときの考え方、二重premultiplyで暗いedgeが生じる注意、Pre-Divide / Post-Multiplyとの使い分け、複数処理をAlpha Divide / Alpha Multiplyで挟む構成は、同Manual Chapter 77「Understanding Image Channels」pp.1679–1681で確認しています。

上の実機例でREGIDと接続、Inspector、補正後の合成を確認しました。全Parameter、Manualに記載されていないedition差は未確認です。
