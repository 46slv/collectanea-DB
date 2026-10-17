---
title: プリマルチプライ（Premultiplication）
description: StraightとPremultipliedの違いを、Merge・色補正・二重乗算の数値例と実践的な診断で説明する。
doc_type: concept
term_id: premultiplication
term_short: RGBにAlphaを掛けて保存し、半透明の色を合成に適した状態にすること。
verification: partial
aliases: [premultiplied alpha, straight alpha, premult]
concepts: [alpha, premultiplication, compositing]
nodes: [Merge, Brightness Contrast, Color Corrector, Color Curves, Alpha Divide, Alpha Multiply]
tasks: [composite, color-correct, debug, transparency]
prerequisites: [alpha]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---
# プリマルチプライ（Premultiplication）

透明な映像素材を背景に重ねたとき、切り抜きの境界が白く光ったり、黒い縁が出たりすることがあります。<Term id="alpha">Alpha</Term>が正しいのに不自然な場合は、RGBがAlphaを掛けた状態で保存されているかを確認します。

このRGBとAlphaの関係を**Premultiplication（プリマルチプライ）**と呼びます。切り抜き範囲そのものを作る処理ではなく、透明部分を含む色値の保持方法です。

## StraightとPremultipliedの違い

どちらもRGBAの2D <Term id="image">Image</Term>です。相違点は、画像のRGBへAlphaを掛けているかどうかにあります。

| 方式 | RGBの保存方法 | Alpha |
| --- | --- | --- |
| **Straight / Unpremultiplied** | 元のRGBをAlphaで乗算せず保持する | 別チャンネルで保持 |
| **Premultiplied** | RGBの各成分に同じ画素のAlphaを掛ける | 値自体は変わらない |

計算の関係は次のとおりです。

~~~text
Premultiplied RGB = Straight RGB × Alpha
Premultiplied Alpha = Straight Alpha
~~~

例えば、真っ赤な画素のRGBが(1, 0, 0)、Alphaが0.25なら、StraightではRGBが(1, 0, 0)のままですが、PremultipliedではRGBが(0.25, 0, 0)になります。どちらも意図する不透明度は25%です。

Alphaが1の画素ではRGBは変わりません。Alphaが0の画素では、乗算後のRGBは0です。**一度RGBが0になって失われた完全透明領域から、Alphaで割るだけで元の色を復元することはできません。** Alpha Divideは、すべての透明部分の色を取り戻すNodeではありません。

髪の毛や文字の輪郭にはAlphaが0と1の間の画素があるため、ここで違いが目立ちます。StraightのRGBを単独で表示すると境界が硬く見える場合があり、PremultipliedのRGBは輪郭に向かって暗くなります。ただし、どちらの状態かを**ViewerのRGB表示だけで断定しない**でください。元の素材の書き出し設定とAlphaを合わせて確認します。

## Mergeへ渡す前景はPremultipliedが基本

Fusionの<Term id="merge">Merge</Term>は、通常のOver合成でPremultipliedのForegroundを想定します。

~~~text
背景のImage ─────────────────→ Merge［Background］→ MediaOut
                                   ↑［Foreground］
Premultipliedの前景Image ───────────┘
~~~

Premultipliedの前景と背景をOverで重ねる概念式は次のとおりです。

~~~text
出力RGB   = 前景RGB + 背景RGB × (1 − 前景Alpha)
出力Alpha = 前景Alpha + 背景Alpha × (1 − 前景Alpha)
~~~

式のRGBはPremultipliedの値です。StraightのRGBをそのまま代入して使うものではありません。

青い不透明背景の上に、Alphaが0.25の赤を重ねる場合を考えます。

~~~text
前景（Premultiplied）：RGB (0.25, 0, 0) / Alpha 0.25
背景（不透明）：        RGB (0, 0, 1)    / Alpha 1
合成結果：              RGB (0.25, 0, 0.75) / Alpha 1
~~~

前景がStraightのRGB (1, 0, 0)のままPremultiplied前提の合成へ渡ると、半透明部分へ赤を過剰に足してしまい、明るい縁になることがあります。

21.1のマニュアルはStraight素材に対するMergeの**Subtractive**も説明しています。ただし、見た目を合わせるために合成設定だけを動かす前に、前景のRGBとAlphaの扱いがどこで変わったか確かめます。[Merge](../../nodes/compositing/merge.md)のSubtractive / Additiveの説明も参照してください。

## 色補正とTransformは同じ扱いではない

DaVinci Resolve 21.1のFusion Fundamentalsでは、次のように使い分けます。

- **Mergeでの合成**：Premultipliedの前景を基本にする。
- **色補正**：StraightのRGBへ補正を加え、必要なら補正後に再びPremultipliedへ戻す。
- **通常のBlurやTransform**：Premultipliedの画像を処理する。
- **再乗算**：すでにPremultipliedの画像へ同じAlphaをもう一度掛けない。

PremultipliedのRGBには、すでにAlphaに応じた暗さが含まれます。このRGBだけを大きく明るくすると、元の色とAlphaの対応が変わり、Merge後に輪郭が不自然になったり、背景まで明るく見えたりします。色を補正するときは、一度RGBをAlphaで割ってから補正し、終わったらAlphaを掛け直す構成を検討します。

一方、BlurやTransformをStraightにしたまま処理することを一般的な既定手順にはしません。処理が色の値にも影響する特殊なFilterや外部OFXは例外になり得るため、Nodeがどの形式を想定するかを確認します。

## 実例1：1つのColor Nodeで透明な素材を調整する

PremultipliedのロゴにBrightness Contrastを掛け、そのまま背景へ重ねる構成です。

~~~text
MediaIn（Premultiplied）
   ↓
Brightness Contrast［Pre-Divide / Post-Multiplyを有効］
   ↓
Merge［Foreground］ ← 背景Image［Background］
~~~

1. まずMediaInの出力をViewerで確認し、Alphaを表示します。文字やロゴの外側が透明か、輪郭に半透明部分があるかを確認します。
2. Brightness Contrastで明るさを調整します。
3. **Pre-Divide / Post-Multiply**を有効にし、色補正前だけStraightへ戻し、補正後にPremultipliedへ戻す処理を使います。
4. Merge出力と補正前の前景を比較し、縁や背景が不自然に明るくならないか確認します。

21.1ではBrightness Contrast、Color Curves、Color Correctorに同種の設定があります。Color CorrectorではInspectorの**Options**側にあります。これらのNode自身で前後処理を行う場合は、同じ理由でAlpha Divide / Alpha Multiplyを追加しないようにします。

このオプションは**元からPremultipliedの画像を色補正するとき**のものです。どの素材にも常にオンにする設定ではありません。

## 実例2：複数のColor NodeをStraightで処理する

複数の補正や、StraightのRGBを期待する外部OFXを続けて使うなら、処理列全体をAlpha DivideとAlpha Multiplyで挟めます。

~~~text
MediaIn（Premultiplied）
   ↓
Alpha Divide
   ↓
Brightness Contrast［内部のPre-Divide / Post-Multiplyは使わない］
   ↓
Color Curves［内部のPre-Divide / Post-Multiplyは使わない］
   ↓
Alpha Multiply
   ↓
Merge［Foreground］
~~~

1. [Alpha Divide](../../nodes/matte-keying/alpha-divide.md)がRGBをAlphaで割って、StraightのRGBへ戻します。
2. 途中のColor Nodeでは再びDivide / Multiplyしないようにします。
3. 色補正が終わったら[Alpha Multiply](../../nodes/matte-keying/alpha-multiply.md)でRGBへAlphaを掛け、Mergeへ渡します。
4. 外部OFXを間に置く場合は、そのOFXがStraightを入力として想定しているか、内部でPremultiplicationを扱うかを確認します。

Alpha DivideとAlpha Multiplyは、DaVinci Resolve 21.1の**Matte Nodes**（Chapter 109）です。どちらもオレンジのInputで2D Imageを受け、青いEffect Mask入力は任意です。2D Imageを出力し、固有のInspector Controlはありません。Effect Maskは処理範囲の制限であり、Imageに保存されたAlphaを新しく作る入力とは異なります。

この例は連続する**色処理**の例です。TransformやBlurを間に追加するときは、単に同じ列へ挟まず、処理前後のPremultiplication状態を見直してください。

## 二重Premultiplyで縁が暗くなる理由

半透明の赤い画素を、RGB (1, 0, 0)、Alpha 0.25から始めるとします。

~~~text
Straight RGB             (1, 0, 0)
1回目のPremultiply       (0.25, 0, 0)
2回目のPremultiply       (0.0625, 0, 0)
Alphaはいずれも          0.25
~~~

1回目でRGBにAlphaを掛けたのに、2回目でも同じAlphaを掛けたため、RGBだけがさらに暗くなっています。輪郭の半透明画素が過度に暗くなる一方、不透明な画素はAlphaが1なので変わらず、**黒い縁（dark halo）**になり得ます。

読み込み時にPost-Multiply済みなのか、途中でAlpha Multiplyを追加したのか、Color Nodeの内部処理と重複していないかを順に調べます。

## 素材を読み込むときのAlpha解釈

最初のAlpha状態が不明なまま、DivideとMultiplyを増やしても原因を特定できません。

- **MediaIn**：DaVinci ResolveのClip Attributesにある**Alpha Mode**で、Alphaを無視する、Premultipliedとして扱う、Straightとして扱う、反転する、といった解釈を確認します。
- **Loader**：Fusion StudioのInspector **Import**タブで、Alphaを無視する設定、Invert、RGBのPost-Multiplyを確認します。

MediaInとLoaderの設定名や場所を同一視しません。素材を書き出したソフト側のAlpha方式が分かるなら、それと読み込み設定を合わせて確認します。

## 輪郭がおかしいときの確認順

| 症状 | 最初に調べること |
| --- | --- |
| Merge後に白い／明るい縁が出る | Straightの前景をPremultipliedとして重ねていないか |
| 輪郭が黒くなる | RGBへAlphaが二重に掛かっていないか |
| 色補正後だけ縁が不自然 | PremultipliedのRGBへそのまま色補正していないか |
| Alphaが正しいのに背景まで明るくなる | 補正前後の前景RGBとAlphaの対応が変わっていないか |
| Alpha Divideで色が戻らない | 透明部分の元RGBが失われていないか、入力が元からStraightではないか |
| Maskで囲った部分と透明度が一致しない | Effect MaskとImage Alphaを混同していないか |

まず元のMediaIn / Loader、次に最初の色処理、その直後、最後にMergeを表示します。ViewerでRGBとAlphaを別々に確認し、最初に変化したNodeを特定します。

「透明にならない」はImage Alphaの問題、「透明な縁に色が出る」はPremultiplicationの問題という場合があります。原因が分からないままMaskを足すのではなく、[AlphaとMaskを分けて診断する](../07-debugging/alpha-vs-mask.md)も参照してください。

## 関連ページ

- [Alpha](./alpha.md)：透明度の基本とImage Alpha / Effect Maskの違い。
- [画像（Image）](../02-data/image.md)：RGBA、DoD、チャンネルを読む。
- [Merge](../../nodes/compositing/merge.md)：Foreground、Over、Subtractive / Additiveの設定。
- [Alpha Divide](../../nodes/matte-keying/alpha-divide.md) / [Alpha Multiply](../../nodes/matte-keying/alpha-multiply.md)：複数の色処理の前後へ配置する。
- [Brightness Contrast](../../nodes/color/brightness-contrast.md) / [Color Curves](../../nodes/color/color-curves.md) / [Color Corrector](../../nodes/color/color-corrector.md)：内部Pre-Divide / Post-Multiplyを使う場合。
- [合成量と演算](./blend-operator.md)：Blend・Apply Mode・Operatorの違い。

## 出典と確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**（September 2026）、Chapter 77 pp.1676–1679「Understanding Premultiplication」「The Rules of Premultiplication」：StraightとPremultiplied、Merge、色補正、二重乗算。
- 同Chapter 77 pp.1680–1681：MediaInとLoaderのAlpha解釈、Pre-Divide / Post-Multiply、Alpha Divide / Alpha Multiplyを使う複数処理。
- 同Chapter 109 pp.2504–2505「Alpha Divide」「Alpha Multiply」：入力・Effect Mask、基本接続、固有Inspector Controlの有無。
- 数値例と診断表は説明用の例です。実機での全Control・外部OFX・素材形式の挙動は検証していないため、verificationはpartialを維持しています。
