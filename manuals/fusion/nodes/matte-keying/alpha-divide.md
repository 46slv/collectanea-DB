---
title: "Alpha Divide"
description: "premultiplied ImageのRGBをAlphaで除算し、複数のColor処理をstraight状態で行うためのNode。"
doc_type: node
term_id: "alpha-divide"
term_short: "Alpha Divideは、premultiplied ImageのRGBをAlphaで除算し、straight状態へ戻すNode。"
verification: partial
aliases: ["Alpha Divide", "ADv", "unpremultiply"]
concepts: ["alpha", "premultiplication"]
nodes: ["Alpha Divide"]
node_family: "matte-keying"
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["unpremultiply", "color-correct", "alpha"]
level: intermediate
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# Alpha Divide

Alpha Divideは、**premultiplied状態の2D Imageで、RGBをAlphaで除算してstraight（non-premultiplied）状態へ戻すNode**です。

透明edgeを持つ素材へColor補正を行うとき、premultiplied RGBのままRGBだけを大きく変えると、RGBとAlphaの関係が崩れて合成時のedgeに明るさや色のartifactが出ることがあります。Alpha Divideは、そのような処理の前にRGBをstraight状態へ戻すために使います。

<Term id="alpha">Alpha</Term>そのものを新しく作るKeyerではありません。扱っているのは、RGBとAlphaがどの状態で保持されているかという<Term id="premultiplication">premultiplication</Term>の関係です。

## 何が起きるか

premultiplied Imageでは、半透明pixelのRGBがAlphaの影響を受けています。Alpha Divideは入力Imageのcolor channelsをAlpha channelで割り、後段のColor処理がstraight RGBを対象にできる状態へ変えます。

概念としては次の位置に置きます。

    Premultiplied Image
            ↓
       Alpha Divide
            ↓
    Color / OFX / Filter ...
            ↓
      Alpha Multiply
            ↓
          Merge

Alpha Divideだけで処理を完結させるのではなく、必要な処理が終わった後に[Alpha Multiply](./alpha-multiply)で再びpremultiplied状態へ戻すのが基本です。

## 入力

### Input

オレンジ色の必須入力です。

DaVinci Resolve 21.1 Reference Manualでは、**premultiplied Alphaを持つ2D Image**を入力するものとして説明されています。

入力がすでにstraight状態なら、Alpha Divideを追加する前に素材のAlpha stateを確認します。状態が分からないままDivide / Multiplyを重ねると、原因の切り分けが難しくなります。

### Effect Mask

青色の任意入力です。

Polygon、基本shape、Paint stroke、bitmap maskなどを接続し、Alpha Divideの結果を適用する範囲を限定できます。21.1 Manualでは、Effect MaskはNode本体の処理後に適用されると説明されています。

Effect MaskはImageのAlpha channelそのものではありません。Image Alphaと処理範囲を指定するMaskは別の役割です。

## 出力

RGBがstraight状態として扱える2D Imageを出力します。

後段にはColor Node、Colorを変更するOFX、Filterなどを接続できます。複数の処理を続ける場合でも、最後にAlpha Multiplyを置くまではstraight状態を維持する構成にできます。

## Inspector

Alpha Divideに固有のInspector Controlはありません。

「どれくらいDivideするか」を調整するNodeではなく、入力ImageのRGB / Alpha relationshipを切り替えるための処理です。適用範囲だけを限定したい場合はEffect Maskを使います。

## 使う場面

### 複数のColor処理をまとめてstraight状態で行う

21.1 Manualでは、Alpha Divide / Alpha Multiplyは、**複数の処理が連続してstraight Alphaを前提とする場合**に使う構成として説明されています。

例えば次のようにします。

    MediaIn
      ↓
    Alpha Divide
      ↓
    Brightness Contrast
      ↓
    Color Curves
      ↓
    Third-party OFX
      ↓
    Alpha Multiply
      ↓
    Merge

各NodeでPre-Divide / Post-Multiplyを繰り返す代わりに、処理列全体をAlpha DivideとAlpha Multiplyで挟めます。

### third-party OFXの前後を明示的に管理する

Colorを変更するthird-party OFXがpremultiplicationを自動で扱わない場合、OFXの前でAlpha Divide、後でAlpha Multiplyを置くと、どこでstraight / premultipliedが切り替わるかをNode tree上で明示できます。

ただし、OFX側が独自にpremultiplication処理を行う場合まで外側で重ねるべきとは限りません。Node / plugin側の仕様を確認します。

## 1つのColor Nodeだけなら

Brightness Contrast、Color Curves、Color Correctorなど、対応するColor Nodeには **Pre-Divide / Post-Multiply** が用意されています。

1つのColor Nodeだけを処理する場合は、Alpha Divide → Color Node → Alpha Multiplyと3 Nodeに分けず、そのColor NodeのPre-Divide / Post-Multiplyを使えます。

このoptionは、Color処理前にDivideし、処理後にMultiplyしてpremultiplied状態へ戻します。

## premultipliedかどうかを先に確認する

Alpha Divideを入れる前に、入力ImageのAlpha stateを確認します。

21.1 Manualでは、LoaderではImport tab、MediaInではClip AttributesのAlpha Modeで、embedded Alphaの扱いを指定できることが説明されています。

問題が「Alpha Divideが必要か」ではなく、素材が最初からどの状態として解釈されているかにある場合もあります。

→ [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)

## よくある使い方

透明edgeを持つCGやkeyed素材へ複数のColor調整を行う場合:

1. 素材がpremultipliedとして扱われているか確認します。
2. 最初のColor処理より前にAlpha Divideを置きます。
3. Color補正やOFXを必要なだけ続けます。
4. 最後のColor処理より後にAlpha Multiplyを置きます。
5. Mergeした状態でedgeを確認します。

ここで重要なのは、「透明素材には必ずAlpha Divideを入れる」ことではありません。**premultiplied RGBをstraight前提の処理へ渡す必要があるときだけ使う**Nodeです。

## 注意点

Alpha DivideとAlpha Multiplyは対になる処理として使われることが多いNodeです。

途中で別Nodeがpremultiplicationを行う場合や、入力素材がすでにstraightの場合は、同じ構成を機械的に追加しません。21.1 Manualでは、premultiplyを二重に行うと半透明edgeが暗くなる例も示されています。

また、FilterでもColorを変更するalgorithmでは透明edgeへartifactが出る場合があるため、単純な「Color familyかどうか」ではなく、処理がRGBをどう変更するかで判断します。

## 関連ページ

- [Alpha Multiply](./alpha-multiply) — straight RGBへAlphaを掛け、premultiplied状態へ戻す
- [プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)
- [Alpha](../../learn/04-compositing/alpha)
- [Brightness Contrast](../color/brightness-contrast)
- [Color Curves](../color/color-curves)
- [Color Corrector](../color/color-corrector)
- [Matte / Keying Family Overview](./)

## 実機例：補正前後のDivideとMultiplyを比較する

<!-- capture-case:S74 -->

柔らかい輪郭を持つ青い楕円を、2つの経路で同じ暗い背景へ重ねます。上段のColorDirectは前景を直接補正し、下段のColorStraightはAlpha DivideとAlpha Multiplyの間で補正します。

Resolve Studio21.1.0.14／WindowsのFusionページで、1920×1080の合成を作りました。両ViewerはColor／40%。左のMergeNaiveは直接補正、右のMergeCorrectはAlpha Divide→補正→Alpha Multiplyの結果です。

[![共通の楕円前景を直接補正とAlpha DivideからAlpha Multiplyまでの補正へ分け、同じ背景へ合成した実機Graph](/img/fusion/captures/S74/graph.png)](/img/fusion/captures/S74/graph.png)

[![AlphaDivide1には固有の補正パラメーターがなく、共通Settingsが表示される](/img/fusion/captures/S74/inspector.png)](/img/fusion/captures/S74/inspector.png)

[![左の直接補正では背景が灰色に持ち上がり、右のDivideとMultiplyを通す補正では暗い背景を保つ](/img/fusion/captures/S74/compare.png)](/img/fusion/captures/S74/compare.png)

両方のColor CorrectorでCorrectionをLevels、範囲をMaster、チャンネルをRGBとし、出力レベルの下限だけを0.2へ上げました。上限1、入力レベル0／1／1は共通です。左は楕円の外側まで灰色になり、右は暗い背景を保ちます。

[![ColorStraightのLevelsでMaster RGBの出力下限0.2、上限1を設定したInspector](/img/fusion/captures/S74/correct-inspector.png)](/img/fusion/captures/S74/correct-inspector.png)

[![直接補正するColorDirectにも同じMaster RGB出力下限0.2、上限1を指定したInspector](/img/fusion/captures/S74/direct-inspector.png)](/img/fusion/captures/S74/direct-inspector.png)

比較の開始時は、両方のColor CorrectorでOptionsのPre-Divide / Post-Multiplyをオフにしています。日本語UIでは「処理前に除算／処理後に乗算」と表示されます。下段には前後処理用の2ノードを置いているため、その間のColor Correctorで同じ処理を重ねません。

[![比較開始時のColorDirectはOptionsの処理前に除算、処理後に乗算をオフにしている](/img/fusion/captures/S74/direct-options.png)](/img/fusion/captures/S74/direct-options.png)

[![AlphaMultiply1も固有の補正パラメーターはなく、共通Settingsが表示される](/img/fusion/captures/S74/multiply-inspector.png)](/img/fusion/captures/S74/multiply-inspector.png)

Alpha DivideとAlpha MultiplyのInspectorには共通Settingsが表示され、固有の補正値はありません。内部REGIDはそれぞれ`AlphaDivide`、`AlphaMultiply`でした。

前景はBackgroundのRGB0.2／0.55／0.9、Alpha1に、Width0.4／Height0.65／Soft Edge0.08のEllipseを接続して作りました。下の左はこの前景、右はDivide直後です。右の中間画像では半透明部分が明るく見えます。これをそのまま完成画像と判断せず、MultiplyとMergeを通した結果まで確認します。

[![楕円マスクを接続したBackgroundのRGB0.2、0.55、0.9とAlpha1のInspector](/img/fusion/captures/S74/source-inspector.png)](/img/fusion/captures/S74/source-inspector.png)

[![左はマスク付き前景、右はAlpha Divide直後をColor表示した中間画像](/img/fusion/captures/S74/source.png)](/img/fusion/captures/S74/source.png)

出力レベル下限を両方とも0へ戻すと、左右とも暗い背景に戻りました。変えたのはマットの形状ではなく、色補正の出力下限です。

[![両方のColor Correctorの出力下限を0にすると、左右とも暗い背景に青い楕円が合成される](/img/fusion/captures/S74/baseline.png)](/img/fusion/captures/S74/baseline.png)

補正が1つだけなら、ColorDirectのOptionsで内蔵のPre-Divide / Post-Multiplyをオンにする方法もあります。出力下限0.2のままオンにすると、左も右と同じ見た目になりました。画素値の完全一致を測定した結果ではありません。

[![ColorDirectのOptionsで処理前に除算、処理後に乗算のチェックをオンにしたInspector](/img/fusion/captures/S74/builtin-options.png)](/img/fusion/captures/S74/builtin-options.png)

[![左のColor Corrector内蔵前後処理と、右の明示的なDivideとMultiply構成が同じ見た目になる](/img/fusion/captures/S74/builtin.png)](/img/fusion/captures/S74/builtin.png)

最後は内蔵前後処理を両方ともオフ、出力下限0.2へ戻し、明示的な前後処理との比較を保存しました。この固定例の表示と保存Graphを確認しました。実写のキーイング素材、外部OFX、Effect Mask、Alphaが0に近い画素の数値、HDRと性能は未確認です。

[再現用Graph](/img/fusion/captures/S74/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S74/capture.json)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 109「Matte Nodes」p.2504を基準に、Alpha Divideの目的、Input / Effect Mask、基本Node構成、固有Inspector Controlがないことを確認しています。

premultiplicationをColor処理するときの考え方、Pre-Divide / Post-Multiplyとの使い分け、複数処理をAlpha Divide / Alpha Multiplyで挟む構成は、同Manual Chapter 77「Understanding Image Channels」pp.1679–1681で確認しています。

上の実機例でREGIDと接続、Inspector、補正結果を確認しました。全Parameter、Manualに記載されていないedition差は未確認です。
