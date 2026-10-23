---
title: Alpha（アルファチャンネル）
description: FusionのAlphaをRGB・Effect Mask・Premultiplicationと区別し、合成とViewerの実例で確認する。
doc_type: concept
term_id: alpha
term_short: 2D Imageに含まれる透明度のチャンネル。通常、0は透明、1は不透明。
verification: partial
aliases: [alpha channel, transparency]
concepts: [alpha, rgba, compositing]
nodes: [Merge, Background, Matte Control, Alpha Divide, Alpha Multiply]
tasks: [composite, transparency, debug]
prerequisites: [image-data, foreground-background]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# Alpha（アルファチャンネル）

Alphaは、画像を別の画像へ重ねるとき、その画素をどの程度不透明として扱うかを表す情報です。映像に写っている色を示すRGBとは別に、通常は4番目のチャンネルとして2D Imageに含まれます。

例えば人物の切り抜き画像では、人物の内側を不透明、人物以外を透明にし、髪の毛や輪郭には中間の透明度を残せます。透明度が正しく見えない場合は、Alphaそのものの問題なのか、合成方法の問題なのか、<Term id="mask">Mask</Term>の接続先の問題なのかを分けて調べます。

## Alphaの値とRGBの違い

一般的なAlphaの読み方は次のとおりです。

| Alphaの値 | 意味 | 別の画像へ重ねると |
| --- | --- | --- |
| 0 | 完全に透明 | その画素では下の画像が見える |
| 0.5 | 半透明 | 上下の画像が混ざる |
| 1 | 完全に不透明 | その画素では上の画像が見える |

Alphaは白黒画像としても確認できます。白が不透明、黒が透明、灰色が半透明です。ただし、これはAlphaチャンネルの表示方法です。RGBの赤・緑・青の数値まで同時に白黒へ変えているわけではありません。

**Alphaが0だからといって、RGBも必ず0とは限りません。** RGBに色を残したままAlphaだけ0にするデータ形式もあります。反対に、RGBへあらかじめAlphaを掛けて保持する形式もあります。この違いをStraight / Premultiplied Alphaと呼びます。

画像全体のAlphaが1なら、元画像に切り抜きのつもりで黒い背景を描いてあっても、その黒い領域は不透明な色として重なります。「黒く見える」と「透明である」は別です。

## Image AlphaとEffect Maskを区別する

Fusionでは、白黒で似た見た目の情報でも、接続先によって意味が変わります。

| データ | どこにあるか | 主な役割 |
| --- | --- | --- |
| **Image Alpha** | RGBと一緒に2D Imageが持つチャンネル | 合成時の不透明度を表す |
| **Mask** | Ellipse・PolygonなどのMask Nodeが出力する単一チャンネルのデータ | 領域を指定し、接続先Nodeに利用させる |
| **Effect Mask入力** | 多くの画像処理Nodeにある青い入力 | そのNodeの効果をどこへ適用するか制限する |
| **Garbage / Solid Matte入力** | Matte Controlや一部Keyerなどの専用入力 | 入力の役割に応じてMatteやAlphaを調整する |

**Effect Maskを接続しただけで、すべてのNodeのImage Alphaが切り抜かれるわけではありません。** 例えばColor CorrectorにMaskをつなぐ場合、その範囲だけを色補正し、範囲外の元画像を残す使い方ができます。

一方、Matte ControlはMaskを使ってImage Alphaを作成・修正できます。つまり「MaskがAlphaにならない」という決まりでもありません。**接続先の入力が何をするものか**が判断基準です。

接続の基礎は[画像（Image）](../02-data/image.md)と[Mask](../02-data/mask.md)、症状別の切り分けは[AlphaとMaskを分けて診断する](../07-debugging/alpha-vs-mask.md)を参照してください。

### 実機の参考例

<!-- capture-reuse:R56 -->

同じチャートとEllipseを使用したS25。BlurのEffect Maskでは楕円外の元画像が残り、Loaderへの直接Maskでは楕円外が透明になります。Color表示とAlpha表示を別々に撮影しています。

[![S25の実機撮影。Node Editorの接続](/img/fusion/captures/S25/graph.png)](/img/fusion/captures/S25/graph.png)

[![S25の実機撮影。左右Viewerの比較](/img/fusion/captures/S25/compare.png)](/img/fusion/captures/S25/compare.png)

[![S25の実機撮影。Alpha表示の比較](/img/fusion/captures/S25/alpha.png)](/img/fusion/captures/S25/alpha.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS25の参考例です。このS25はEffect Maskの比較例です。前景とMerge後のAlphaは次のS31で確認しています。Matte ControlによるAlpha作成、Premultiplicationや素材のAlpha Modeは未確認です。 [撮影条件と確認範囲](/img/fusion/captures/S25/capture.json)

## 実例：前景のAlphaと合成結果のAlphaを見る

赤い円を青い背景へ重ね、2つのImageのAlphaがどう違うかを観察します。

~~~text
Background（青、Alpha 1） ──────────→ Merge［Background］→ MediaOut
                                     ↑［Foreground］
Background（赤、Alpha 1） ──────────┘
        ↑［Effect Mask］
     Ellipse Mask
~~~

1. 2つのBackgroundを作り、青と赤にします。どちらもColorのAlphaは1にします。
2. Ellipse Maskを赤いBackgroundのEffect Mask入力へつなぎ、赤を円の範囲に限定します。
3. 青いBackgroundをMergeのBackground（オレンジ）、赤いBackgroundをForeground（緑）につなぎます。
4. まず赤いBackgroundの出力をViewerに表示し、ColorドロップダウンからAlphaを選びます。円の内側と外側でAlphaが違うことを確認します。
5. 次にMergeの出力のAlphaを表示します。青い背景が全面不透明なら、完成画像のAlphaは原則として全面1になります。

最後の違いが重要です。**前景の透明な部分から背景が見えることと、合成後の画像に透明な部分が残ることは同じではありません。** 不透明な背景へ重ねた結果は、見た目に前景の切り抜きが残っていても、出力Alphaでは全面不透明になり得ます。

この例で使ったMaskは、赤いBackgroundが円形のAlphaを持つImageを出すために利用しています。Ellipse MaskそのものをMergeのForegroundへ画像として重ねているわけではありません。各入力の働きは[Merge](../../nodes/compositing/merge.md)と[Background](../../nodes/generators/background.md)で確認できます。

### 実機で前景とOver後のAlphaを比べる

上の説明と同じ接続で、赤い楕円の前景と青い不透明背景を作りました。Resolve Studio 21.1.0.14、Windows、日本語UIで撮影しています。Ellipse1はWidth 0.4、Height 0.55、Soft Edge 0.02です。

[![Ellipse1を赤いCutout1のEffect Maskへ、Cutout1をMerge1のForegroundへ、青いBase1をBackgroundへ接続した実機Graph](/img/fusion/captures/S31/graph.png)](/img/fusion/captures/S31/graph.png)

[![Merge1 Inspector。適用モードNormal、Operator Over、Blend 1で前景を合成](/img/fusion/captures/S31/inspector.png)](/img/fusion/captures/S31/inspector.png)

[![Color表示。左のCutout1は赤い楕円の外が市松模様、右のMerge1はその範囲に青い背景が見える](/img/fusion/captures/S31/compare.png)](/img/fusion/captures/S31/compare.png)

左はMergeへ入れる前のCutout1、右はOver合成後です。Color表示では、前景の透明部分から背景が見えています。

[![Alpha表示。左は楕円の内側が白で外側が黒、右のMerge出力は全面白](/img/fusion/captures/S31/alpha.png)](/img/fusion/captures/S31/alpha.png)

同じ2出力をAlpha表示にすると、左には楕円の形が残り、右は全面白になります。背景が不透明なため、合成結果全体が不透明になった例です。1920×1080、フレーム0、両Viewer 40%。緑の線と赤い軸は操作表示です。撮影後はColorへ戻しました。Matte Controlや素材のAlpha Mode、Straight/Premultipliedの比較は別の確認事項です。

[再現用Graph](/img/fusion/captures/S31/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S31/capture.json)

## 半透明の画素はどう重なるか

標準的なOver合成を簡略化すると、前景のAlphaが0.25なら、前景の色が25%、背景の色が75%の割合で結果に現れます。赤い前景を青い不透明背景へ重ねる例を考えます。

~~~text
前景：赤 RGB = (1, 0, 0)、Alpha = 0.25
背景：青 RGB = (0, 0, 1)、Alpha = 1
出力：RGB = (0.25, 0, 0.75)、Alpha = 1
~~~

これはStraight RGBから計算する概念的な例です。実際の合成でRGBをどう扱うかは、色空間やPremultiplicationの状態にも依存します。Alphaは単に画像を隠すスイッチではなく、半透明の境界を自然に重ねるための数値です。

## Straight AlphaとPremultiplied Alpha

透明な部分のRGBをどう保持するかには、主に2つの方式があります。

- **Straight（Unpremultiplied）**：RGBはAlphaで乗算されていません。Alphaが0でもRGBに元の色を保持できます。
- **Premultiplied**：RGBの各値をAlphaで乗算した状態です。Alpha自体を乗算するのではありません。

例えば赤い画素のRGBが(1, 0, 0)、Alphaが0.25なら、StraightではRGBが(1, 0, 0)のままで、Premultipliedでは(0.25, 0, 0)になります。Alphaはどちらも0.25です。

この差は輪郭で目立ちます。Fusionの標準的なMergeはPremultipliedの前景を想定した合成を行うため、Straightをそのまま入れると半透明の縁が明るくなり得ます。逆にPremultipliedの画像へもう一度Alphaを掛けると、縁が暗くなり得ます。

色補正でも問題が起こります。PremultipliedのRGBだけを強く明るくすると、Alphaとの関係が崩れ、合成後の輪郭や背景が意図せず明るく見える場合があります。

## 色補正するときの扱い

Premultipliedの素材へ色補正する場合は、RGBをいったんAlphaで割り、色補正後に再びAlphaを掛けるのが基本的な考え方です。

~~~text
Premultiplied RGBA
   → Alpha Divide
   → 色補正
   → Alpha Multiply
   → Merge
~~~

ただし、これをすべて手動で組む必要はありません。Resolve 21.1のBrightness Contrast、Color Curves、Color Correctorには、同様の処理を行うPre-Divide / Post-Multiplyの設定があります。**Node自身の設定を使う場合は、外側へさらにAlpha Divide / Alpha Multiplyを重ねない**ようにします。

複数の色処理を続けて行う場合や、外部OFXがAlphaをどう処理するか確認したい場合は、Alpha DivideとAlpha Multiplyで処理列全体を挟む方法が役立ちます。詳しくは[プリマルチプライ（Premultiplication）](./premultiplication.md)を参照してください。

## 読み込んだ素材のAlphaを確認する

透明な素材のはずなのに全面不透明に見える場合は、Mergeより前を調べます。

1. MediaInまたはLoaderの出力を、ほかのNodeを通さずViewerへ表示します。
2. ViewerのColorドロップダウンからAlphaを選びます。切り抜きたい部分と周囲が白黒で区別されているか確認します。
3. MediaInの場合は、素材の**Clip AttributesにあるAlpha Mode**を確認します。無視・反転・Straight / Premultipliedとしての解釈が原因になっていないかを見ます。
4. Fusion StudioのLoaderでは、Inspectorの**Import**タブにあるAlpha関連の設定を確認します。透明度を無視する設定、Invert、RGBのPost-Multiplyなどが対象です。
5. Alphaが正しければ、Keyer・Matte Control・Mergeなど後段のNodeを順番に確認します。

MediaInとLoaderの設定面は同一ではありません。片方にあるControl名を、そのままもう片方のInspectorへ当てはめないようにします。

## 症状別の確認表

| 症状 | 確認すること |
| --- | --- |
| 前景を置くと背景全体が隠れる | 前景ImageのAlphaが全面1になっていないか。RGBだけに黒背景を描いていないか |
| 切り抜いた輪郭が白く／明るくなる | Straightの前景をPremultiplied前提のMergeへ渡していないか |
| 輪郭が黒く／暗くなる | Alphaが二重に掛かっていないか |
| 色補正後だけ縁が光る | Premultiplied RGBへ直接強い補正をしていないか |
| Maskで囲んでも人物が切り抜けない | Effect Maskで処理範囲を制限しているだけではないか。Image Alphaを変更する入力・Nodeが必要か |
| 前景には透明な部分があるのにMerge出力のAlphaが全面白 | 背景Imageが全面不透明なら、その結果は正常な場合がある |
| 読み込んだ素材のAlphaが全面白 | ファイルのAlpha有無とMediaInのAlpha Mode／LoaderのImport設定を確認する |

検証するときは、同じNodeのRGBとAlphaを切り替え、次に直前・直後のNodeを比較します。画像の見た目だけでAlphaが正しく流れていると決めつけないことが重要です。

## 関連ページ

- [画像（Image）](../02-data/image.md)：RGB・Alpha・サイズ・DoDを持つデータとしてImageを読む。
- [Mask](../02-data/mask.md)：Image Alphaとは別の単一チャンネル入力を理解する。
- [プリマルチプライ（Premultiplication）](./premultiplication.md)：透明境界のRGBとAlphaの保存関係を深く扱う。
- [AlphaとMaskを分けて診断する](../07-debugging/alpha-vs-mask.md)：透明にならない場合の切り分け。
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask.md)：Effect Maskを使う基本パターン。

## 出典と確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**（September 2026）、Fusion Fundamentals Chapter 77「Understanding Image Channels」pp.1665–1669：RGB・Alpha・単一チャンネルMask・Auxiliary Channel、ViewerのColor表示、入力端子の役割。
- 同Chapter 77 pp.1675–1681：Mergeのチャンネル、Straight / Premultiplied Alpha、色補正の前後の処理、二重乗算、MediaIn / LoaderのAlpha設定、Alpha Divide / Alpha Multiply。
- 各Node固有のControl、Edition差、全素材形式での解釈は一律に検証していません。記事内の合成式・数値例は考え方を示すもので、実際の画素処理条件が一致することを保証するものではありません。実機での全操作を確認していないため、verificationはpartialとしています。
