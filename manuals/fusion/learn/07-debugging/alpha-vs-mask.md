---
title: AlphaとMaskを分けて診断する
description: 透明にならない・Maskが効かない・輪郭が汚い症状を、Image Alpha、Effect Mask、Matte Controlの接続から切り分ける。
doc_type: concept
term_id: alpha-vs-mask
term_short: Image AlphaとEffect Maskを分けて透明・合成・適用範囲を診断する考え方。
verification: partial
aliases: [Alpha, Effect Mask, premultiplication]
concepts: [alpha, effect-mask, premultiplication, debugging]
nodes: [Merge, Color Corrector, Matte Control, Polygon, Glow]
tasks: [debug, composite, mask, transparency]
prerequisites: [foreground-background, mask-data]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
---

# AlphaとMaskを分けて診断する

「Maskで囲んだのに透明にならない」「色補正が画面全体にかかる」「切り抜きの縁が白い」は、似ていても原因が異なります。まず、<Term id="alpha">Alpha</Term>を変更したいのか、あるNodeの処理範囲を狭めたいのかを決めます。

Fusionでは、Maskが白黒で表示されることと、そのMaskが画像の透明度になっていることは同じではありません。**Maskの値を、どのNodeのどの入力へ渡したか**によって結果が変わります。

## 先に区別する4つのもの

| 名前 | 持っている情報・役割 | 確認する場所 |
| --- | --- | --- |
| Image Alpha | RGBA画像の各画素がどれだけ不透明かを表すチャンネル | 画像NodeをViewerへ表示し、Alphaチャンネルを見る |
| <Term id="mask">Mask</Term> Node | EllipseやPolygonなどで作る単一チャンネルの領域データ | Mask Node自体をViewerへ表示する |
| Effect Mask入力 | 指定した領域へ、そのNodeの処理結果を適用する | Blur、Color Corrector、Mergeなどの青い入力 |
| Matte用入力 | 既存Alphaを修正したり、切り抜き用のAlphaを組み立てたりする | Matte ControlのGarbage Matte / Solid Matteなど |

例えば、Color CorrectorへPolygonをEffect Maskとして接続すると、その範囲だけ色を変えられます。この接続は、原則として「Polygonの外側を透明にして切り抜く」ための操作ではありません。

一方、Matte ControlのGarbage Matte入力へPolygonを接続すると、そのMaskを使って画像のAlphaを作り直せます。**MaskとImage Alphaは別のデータですが、接続先の機能によってMaskからAlphaを生成できる**という関係です。

## 診断はViewerのAlpha表示から始める

合成結果のRGBだけを見ると、透明でない黒色と、透明な領域を見分けにくい場合があります。最初に問題が起きているNodeをViewerに表示し、ColorドロップダウンでAlphaチャンネルへ切り替えます。

1. **素材を確認する**：MediaInまたはLoaderを直接Viewerに表示します。人物を抜いた素材なら、人物の内側と外側でAlphaが異なるか確認します。
2. **Mask単体を確認する**：Polygonなどの出力を表示し、白い領域がどこか、灰色の境界があるか、Invertの向きは適切かを見ます。Polygonがまだ閉じられていない場合は、意図する領域ができているかも確認します。
3. **処理の前後を比較する**：Maskの接続先Nodeの入力画像と出力画像について、RGBとAlphaをそれぞれ比較します。RGBだけ変わるのか、Alphaが変わるのかを分けて記録します。
4. **合成前後を比較する**：前景をMergeへ接続する前のAlphaと、Merge出力のAlphaを比べます。背景が完全不透明なら、Merge後のAlphaが全面白になることはあります。

どの段階で期待と違う値になったかが分かれば、Maskの形状だけを調整し続ける必要はありません。

## 例1：人物の周囲を透明にしたい

人物が写った通常の映像を切り抜くなら、まず「元の映像へAlphaを作る」処理が必要です。Matte Controlを使う構成は次のようになります。

~~~text
MediaIn（人物の映像） ─→ Matte Control［Background］ ─→ Merge［Foreground］
Polygon（輪郭） ─────→ Matte Control［Garbage Matte］       ↑
背景映像 ───────────────────────────────→ Merge［Background］
~~~

1. MediaInをMatte Controlのオレンジ色のBackground入力へ接続します。ここに、Alphaを編集したい元画像を入れます。
2. 人物を囲むPolygonを用意し、Matte ControlのGarbage Matte入力へ接続します。
3. Matte Controlの出力をViewerに表示し、Alphaの白黒を確認します。人物を残すつもりが人物側に穴が開く場合は、Garbage MatteのInvertなどで残す側・消す側を切り替えます。
4. Matte Controlの出力をMergeの緑色のForegroundへ、合成先の映像をオレンジ色のBackgroundへ接続します。
5. 最後にMergeのRGBとAlphaを確認します。背景が不透明であれば、出力Alphaは全面白でも正常です。

この例ではPolygonが直接RGB画像を作るのではありません。Matte ControlがPolygonの領域を利用し、MediaInのAlphaを編集しています。

**別の方法もあります。** 21.1 Reference Manualは、MediaInまたはLoaderのMask入力へPolygonなどを直接つなぐと、Alphaを加えられる例も説明しています。そのため「青いMask入力は絶対にAlphaを書き換えない」と一般化してはいけません。MediaIn / Loaderへ直接つなぐ方式では、形をまだ描いていないMaskを接続すると画像が全面透明になることがあります。まずMask単体で閉じた形を作ってから接続します。

より複雑な合成で、既存Alphaと別のMatteを組み合わせるときは[Matte Control](../../nodes/matte-keying/matte-control.md)のCombineやGarbage / Solid Matteを確認してください。

## 例2：画像は切り抜かず、人物の一部だけ色を変えたい

この場合に必要なのはAlphaの作成ではなく、色補正範囲の限定です。

~~~text
MediaIn ─→ Color Corrector ─→ MediaOut
                      ↑［Effect Mask］
                    Polygon
~~~

1. Color Correctorで、補正する色や明るさを設定します。
2. PolygonをColor Correctorの青いEffect Mask入力へ接続し、補正したい範囲を囲みます。
3. Color Correctorの出力を表示し、Maskの内側と外側のRGBを比べます。
4. Alphaも比較します。元画像のAlphaが全面1のままであっても、それだけで失敗ではありません。目的は「人物だけを透明にする」ことではないためです。

Maskを外した途端に画面全体へ色補正がかかるなら、補正内容は動作しており、Maskの値または接続に注目できます。Maskを外しても全く色が変わらなければ、まずColor Corrector本体の設定を確認します。

## 例3：Mergeの青い入力へつないだが、前景が切り抜けない

<Term id="merge">Merge</Term>では、ForegroundのAlphaとEffect Maskが異なる役割を持ちます。

~~~text
前景Image ─→ Merge［Foreground］
背景Image ─→ Merge［Background］ ─→ 出力
Polygon ───→ Merge［Effect Mask］
~~~

前景ImageのAlphaは、**前景のどの画素が背景とどう合成されるか**に関わります。MergeのEffect Maskは、**そのMerge処理を画像のどの範囲へ適用するか**を制限します。

例えば、不透明な四角い前景ImageをMergeへつなぎ、青いEffect Maskへ円形Polygonを接続すると、合成結果に見える前景を円の範囲へ限定できます。しかし、この操作で前景Imageそのものに円形Alphaが書き込まれたとは限りません。

前景を別のMergeでも使う、切り抜き済み素材として後段へ渡す、といった目的なら、Mergeより前でその前景のAlphaを作る方法を検討します。一方、このMerge一か所の合成範囲を制限したいだけならEffect Maskで十分な場合があります。

[Foreground / Background / Mask](../04-compositing/foreground-background-mask.md)と[Merge](../../nodes/compositing/merge.md)では、オレンジ・緑・青の入力を分けて説明しています。

## 例4：Maskの端でGlowが切れてしまう

「どこを光らせるか」と「光の結果をどこに表示するか」も異なります。21.1のGlowには、通常の青いEffect Maskのほかに、白い**Glow Mask**入力があります。

- **Effect Mask**：Glowの結果を適用する範囲を制限します。広がった光までMaskの境界で切れる場合があります。
- **Glow Mask（pre-mask）**：発光の元になる画素を先に選びます。選んだ画素から生じた光はMaskの外へ広がれます。

例えばネオン看板の文字だけを光源にし、その周囲の壁へも光を広げたい場合は、Glow Mask側で光源を指定します。Glowの出力自体を円形の範囲で止めたい場合はEffect Mask側を使います。

この区別は、[Glow](../../nodes/blur-filter/glow.md)にある2種類のMask入力の説明と、21.1 Manual Chapter 79のpre-maskingの説明に基づきます。すべてのNodeが専用pre-maskを持つわけではありません。

## 例5：切り抜けているのに輪郭が明るい・暗い

Alphaの形が正しく、Maskを外しても境界の色だけがおかしい場合は、<Term id="premultiplication">Premultiplication</Term>を確認します。問題は「どこを透明にするか」ではなく、半透明の画素でRGBがAlphaに対してどう保持されているかもしれません。

- **明るい／白い縁**：Straight（Alpha未乗算）のRGBを、Premultiplied前提の合成へそのまま渡していないか確認します。
- **暗い／黒い縁**：RGBへAlphaを二重に掛けていないか確認します。
- **色補正後だけ縁が変わる**：PremultipliedのRGBをそのまま強く補正していないか確認します。補正NodeのPre-Divide / Post-Multiplyを使うか、必要ならAlpha Divide → 色補正 → Alpha Multiplyを検討します。両方を重ねて適用しないようにします。

輪郭の明暗だけを見て原因を断定することはできません。まず入力画像とMerge直前のRGB・Alphaを比較し、読み込み時のAlpha解釈、色補正、Merge設定を順に確認します。詳しくは[プリマルチプライ（Premultiplication）](../04-compositing/premultiplication.md)を参照してください。

## 症状から確認箇所を決める

| 症状 | 最初に見る場所 | 確認・修正の方向 |
| --- | --- | --- |
| 切り抜いたはずの素材が四角い | Merge前の前景ImageのAlpha | 全面1なら、Alphaが作られていない可能性がある。Mask生成・Matte Control・読み込み設定を確認 |
| Polygonで囲んでも透明にならない | Polygonの接続先と出力Alpha | Color Corrector等のEffect Maskに接続しているだけなら、Alpha作成の経路へ変更 |
| Maskをつなぐと画像が全部消える | Mask単体の出力、Invert、閉じた形の有無 | 全面0のMaskになっていないか。特にMediaIn / Loaderへの直接接続時は、形を描いてからつなぐ |
| 色補正が画面全体にかかる | Color CorrectorのEffect Mask入力 | Polygonの形・向き・値・接続を確認。Maskなしでも補正が変化するか比較 |
| Maskの外までGlowを広げたい | Glow MaskとEffect Mask | 発光元を制限するならGlow Maskを検討 |
| 前景には透明部分があるのにMerge出力Alphaは全面白 | MergeのBackground Alpha | 不透明背景とのOver合成なら正常な結果である場合がある |
| 輪郭が明るい／暗い | Merge直前のRGB・Alpha、Alpha解釈 | Straight / Premultipliedの扱い、二重乗算、色補正の順を確認 |
| Matte Controlで予想と逆の部分が消える | Garbage Matte / Solid MatteとInvert | 入力名、Invert、既存Alphaとの組み合わせを確認 |

**Maskを接続する前と後を比べても何も変わらない**場合、Maskの形やInvertを何度も変える前に、そのNodeの処理自体が有効か、正しい入力を選んでいるか確認します。Fusionでは接続する端子の名前が重要で、同じ白黒データでも用途の異なる入力があります。

## よく使うページ

- [画像（Image）](../02-data/image.md)：RGBAの各チャンネルとAlphaの見方。
- [マスク（Mask）](../02-data/mask.md)：単一チャンネルのMaskを作る方法。
- [Alpha（アルファチャンネル）](../04-compositing/alpha.md)：透明度とEffect Maskの違い。
- [Matte Control](../../nodes/matte-keying/matte-control.md)：既存画像へAlphaを作成・修正する。
- [Color Corrector](../../nodes/color/color-corrector.md)：色補正のEffect MaskとPremultiplication設定。
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask.md)：Effect Maskの基本構成。

## 出典と確認範囲

- **Blackmagic Design, DaVinci Resolve 21.1 Reference Manual**（September 2026）、Fusion Fundamentals Chapter 77、pp.1675–1681：Mergeへ伝わるチャンネル、Matte Control、Straight / Premultiplied Alpha、色補正時の扱い。
- 同Chapter 78、pp.1711–1713：Matte ControlのBackgroundとGarbage Matteへ画像・Maskを接続する例、透明部分の作成、Invertによる結果の変更。
- 同Chapter 79、pp.1728–1732：Maskの単一チャンネル、MediaIn / Loaderへの直接接続、Effect Maskの後処理、専用pre-maskとGarbage / Solid Matte。
- 同Chapter 92、pp.2116–2119：Glow MaskとEffect Maskの違い。
- 同Chapter 109、pp.2539–2544：Matte Controlの入力とAlpha編集。

具体例は確認済みのNodeの役割を組み合わせて説明しています。21.1の実機で全Graphを実行したわけではなく、素材ごとのAlpha解釈、すべての入力端子の表示順、Controlの初期値・Edition差は確認していません。そのためverificationはpartialを維持しています。
