---
title: 透明エッジに黒縁・白縁が出る
description: Alphaの形、前景RGBの乗算状態、色補正、Mergeを分け、黒縁・白縁や背景の明るさが変わる原因を診断する。
doc_type: diagnostic
verification: partial
aliases: [黒縁, 白縁, alpha fringe, transparent edge, 透明Edgeの色や縁がおかしい]
concepts: [alpha, premultiplication, matte]
patterns: [premult-aware-color-operation]
nodes: [Merge, Color Corrector, Alpha Divide, Alpha Multiply, Delta Keyer]
tasks: [debug, transparency, color-correct, key]
symptoms: [alpha-fringe, dark-edge, bright-edge]
prerequisites: [alpha, premultiplication]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-27"
---

# 透明エッジに黒縁・白縁が出る

人物の切り抜きや半透明のロゴを背景へ重ねたとき、輪郭だけが黒くなる、白く光る、色補正後に背景まで明るくなることがあります。原因は必ずしもKeyerの切り抜き精度ではありません。まず**Alphaで指定された透明度**と、**透明度に対応するRGBの値**を別々に調べます。

同じ輪郭の異常に見えても、Alphaの形を直す場合、前景のRGBとAlphaの関係を直す場合、Mergeの合成設定を直す場合があります。一度に全部を変更しないでください。

## まず確認すること

1. 元素材を単独でViewerへ出し、**Color表示**と**Alpha表示**を切り替えます。Alphaに穴や段差があるのか、Alphaは滑らかでもColorの縁だけがおかしいのかを区別します。
2. Color Corrector、Brightness Contrastなどを一時的に無効にし、**色補正前には正常か**を確かめます。後で元の設定に戻せるよう値を記録します。
3. 問題の前景をMergeの手前で表示し、次にMergeの出力を表示します。**Merge後に初めて異常が出るか**を確認します。
4. 元素材のAlphaが**ストレート（Straight）**か**乗算済み（Premultiplied）**か、読み込み元とClip AttributesのAlpha Modeを確認します。MediaInとLoaderでは確認する場所が異なります。
5. 前景RGBにAlphaを二度掛けていないか、色補正Nodeで**処理前に除算／処理後に乗算（Pre-Divide / Post-Multiply）**を使っているかを確認します。

Alpha表示で輪郭の形そのものが誤っているなら、先にMatteやKeyerを診断します。Alphaが期待どおりなら、RGBと合成経路の調査へ進みます。

## 原因を切り分ける

### 1. 同じフレームの3段階を比較する

対象を動かさず、次の場所を順番にViewerで見ます。

~~~text
MediaIn / Loader → Matte・Keyer → Color処理 → Merge → MediaOut
                        ↑          ↑         ↑
                     Alpha確認  前景RGB確認  背景との合成確認
~~~

- **素材・Matte直後で異常**：元のAlpha、Keyerの輪郭、入力したマスクの形を調べます。
- **色補正直後から異常**：RGBをAlphaで乗算したまま補正していないか調べます。
- **Merge後だけ異常**：前景がStraightのまま渡っていないか、前景・背景の接続やOperatorを調べます。

前景を背景から切り離してViewerに映すと、背景色が原因で強調されている縁と、前景に最初からある縁を見分けやすくなります。ただし、チェッカーボード上の見た目だけでAlpha形式を確定しないでください。

### 2. 数値で明るい縁・暗い縁を区別する

半透明の赤い画素を例に、Straight RGB = (1, 0, 0)、Alpha = 0.25とします。

| 処理状態 | RGB | 起こり得る見た目 |
| --- | --- | --- |
| Straight | (1, 0, 0) | この値をPremultiplied前提のOver合成へそのまま渡すと、赤が過剰に加算され明るい縁になり得る |
| 1回Premultiply | (0.25, 0, 0) | Alpha 0.25に対応したRGBを合成へ渡せる |
| 2回Premultiply | (0.0625, 0, 0) | 半透明部分だけRGBがさらに暗くなり、黒い縁になり得る |

これは**計算上の説明**です。全ての白縁・黒縁がPremultiplicationによるとは限りません。特にAlphaが0の画素では元のRGBが失われている場合があり、Alpha Divideで割るだけでは色を復元できません。

### 3. 色補正前後を同じ素材で比較する

次はResolve 21.1で記録済みのS74と同じ比較条件です。黒縁や白縁そのものを新たに再現する試験ではなく、**Premultipliedの前景を直接補正すると、背景まで明るく見える場合がある**ことを切り分ける例です。

入力と設定：

- 1920×1080、フレーム0。青いBackground（RGB 0.20 / 0.55 / 0.90、Alpha 1）を、Ellipse Mask（Width 0.40、Height 0.65、Soft Edge 0.08）で柔らかい輪郭の前景にします。
- 同じ暗い不透明Backgroundを、左右2つのMergeのBackground入力へ渡します。青い前景は左右に分岐して処理します。
- どちらのColor CorrectorもCorrectionを**Levels**、対象を**Master / RGB**にし、入力側をLow 0 / High 1 / Gamma 1、出力側をLow 0 / High 1で開始します。両方とも内蔵のPre-Divide / Post-Multiplyは**オフ**にします。
- 左経路ではColor Correctorへ直接接続します。右経路ではAlpha Divide → Color Corrector → Alpha Multiplyを通してからMergeへ接続します。

~~~text
                         ┌→ ColorDirect ───────────────────────→ MergeNaive［Foreground］
青い前景（EllipseでAlpha）┤
                         └→ Alpha Divide → ColorStraight → Alpha Multiply → MergeCorrect［Foreground］
暗い不透明Background ─────────────────────────────────────────→ 両方のMerge［Background］
~~~

1. 両方のColor Correctorで**出力Low 0**の状態を比較します。記録済みS74では、左右とも暗い背景と青い楕円になりました。
2. 両方の**出力Lowだけを0.20**に変え、High 1は保持します。記録済みS74では、左の直接補正で楕円の外まで灰色に持ち上がり、右のAlpha Divide / Multiplyで挟んだ補正では暗い背景が維持されました。
3. 左のColor Correctorで内蔵**Pre-Divide / Post-Multiplyをオン**にした結果も比較できます。S74のViewer記録では、右の明示的な前後処理と同じ見た目になりました。**画素値の完全一致を測定した結果ではありません。**
4. 診断後は入力側・出力側の元設定とAlpha Modeを戻し、実際の素材を使って最終Mergeを確認します。

<!-- capture-reuse:R119 -->

[![S74：両方のColor Correctorで出力Low 0の場合の暗い背景と青い前景](/img/fusion/captures/S74/baseline.png)](/img/fusion/captures/S74/baseline.png)

[![S74：出力Low 0.20で直接補正した左は背景が灰色になり、DivideとMultiplyを用いた右は暗い背景を保つ](/img/fusion/captures/S74/compare.png)](/img/fusion/captures/S74/compare.png)

[![S74：同じ前景を直接補正経路とAlpha Divide / Multiply経路に分けたNode Graph](/img/fusion/captures/S74/graph.png)](/img/fusion/captures/S74/graph.png)

実機記録は**Resolve Studio 21.1.0.14、Windows、1920×1080、フレーム0、Color表示、Viewer 40%**です。使用Graph・撮影条件・確認した項目は[保存済みGraph](/img/fusion/captures/S74/fixture.comp)と[撮影記録](/img/fusion/captures/S74/capture.json)を参照してください。右経路が全素材で正しいことや、異なる設定の同等性を証明するものではありません。

## 主な原因

| 観察結果 | 優先して疑う原因 | 最初の修正・確認 |
| --- | --- | --- |
| Alpha表示にもギザギザや穴がある | Keyer・Matteの形状、入力Mask | Keyer直後のAlphaを確認し、対象のMatte調整へ戻る |
| Alphaの形は正常だがMerge後に明るい縁が出る | StraightのRGBをPremultiplied前提のMergeへ渡した | 元素材のAlpha形式と読み込み設定を確かめ、必要な場所だけPremultiplyする |
| 半透明の輪郭が黒くなる | すでに乗算済みのRGBへ再びAlphaを掛けた | Loader / MediaIn、途中のAlpha Multiply、Color Node内蔵処理を順に確認 |
| Color Correctorを有効にしたときだけ背景まで変化する | Premultiplied RGBをそのまま色補正した | Color Nodeの前後処理を1か所にまとめ、比較する |
| 輪郭の色が抜けず背景色のように見える | 元素材に色かぶり（Spill）や不適切な輪郭RGBが残る | Keying・Spill・元RGBを確認し、Alphaの乗算だけで直ると考えない |
| Merge後だけ輪郭の印象が違う | 背景色、MergeのForeground / Background、Apply Mode / Operator | 前景を単独表示してからMergeの接続と合成方式を確認 |

## 修正方法

### 色補正Nodeが1つなら

Premultiplied素材をColor Correctorで補正する場合は、Inspectorの**Options**にある**Pre-Divide / Post-Multiply**を検討します。Brightness ContrastやColor Curvesにも同種の設定があります。RGBを補正前だけStraightへ戻し、処理後に再びPremultipliedへする方式です。

最初からStraightの素材や、すでに外部でDivideした画像に対して無条件に有効化する設定ではありません。入力の状態を確かめてください。

### 連続する色処理なら

途中の処理がStraightを想定しているなら、色処理列の入口に**Alpha Divide**、出口に**Alpha Multiply**を置きます。列の中のColor Nodeで重複して内蔵前後処理を行わないようにします。

~~~text
Premultiplied前景 → Alpha Divide → Color処理1 → Color処理2 → Alpha Multiply → Merge
~~~

この列へ通常のTransformやBlurまで機械的に入れないでください。21.1 Manualでは、一般的なFilter・TransformはPremultiplied画像の処理を基本とします。外部OFXの場合も、そのPluginが要求する形式を確認します。

### 読み込み形式が誤っているなら

MediaInの元クリップは**Clip AttributesのAlpha Mode**を、LoaderはInspectorの**Import**でAlphaの解釈を確認します。素材の実際のStraight / Premultiplied形式に合わせます。読み込み設定と後段Nodeを同時に変更せず、どの段階で縁が変わるか確認します。

### Alphaの形そのものが誤っているなら

RGBのDivide / Multiplyを増やさず、Keyer / Matte直後のAlphaを修正します。Soft Edgeを増やして黒縁を隠すと、本来残す輪郭まで失う場合があります。MaskとImageのAlphaも異なります。Effect Maskの白黒は「Nodeの処理をかける場所」であり、元画像のAlpha形式を変える設定ではありません。

## なぜ起きるか

**Straight**はRGBとAlphaを独立して保持し、**Premultiplied**はRGBにAlphaを掛けて保持します。MergeでPremultipliedを想定しているのにStraight RGBを足せば明るすぎる縁になり、Alphaを二度掛ければ半透明のRGBが過度に暗くなります。色補正も同じRGBとAlphaの関係を変えるため、処理前後で形式を揃える必要があります。

基礎の計算は[プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication.md)、AlphaとMaskの切り分けは[AlphaとMaskを分けて診断する](../../learn/07-debugging/alpha-vs-mask.md)で確認できます。具体的な色補正構成は[透明エッジを保って色補正する](../../recipes/color/transparent-edge-color-correction.md)を参照してください。

## バージョン・例外と確認範囲

一次資料：[Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（2026年9月、PDF本文のページ番号）。

- **Chapter 77、pp.1678–1681**：Merge・色補正・FilterにおけるPremultiplicationの使い分け、明るい縁と二重乗算の暗い縁、MediaIn / LoaderのAlpha解釈、前後処理の方式。
- **Chapter 93、p.2153**：Brightness ContrastのPre-Divide / Post-Multiplyは、非ゼロAlphaで除算して色処理後に再乗算する。
- **Chapter 109、pp.2504–2505**：Alpha Divide / Alpha Multiplyの入力と基本接続。いずれも固有のInspector調整Controlは持たない。

S74の実機で確認したのは、前述した**出力Low 0と0.20、直接補正と明示的前後処理、内蔵前後処理の表示比較**です。一般的な黒縁・白縁の実写再現、二重Premultiplyの実機比較、Alphaが0に近い画素の数値検証、外部OFX、HDR、Resolve Free、他OS、性能、画像ごとの完全な数値一致は**未検証**です。したがって検証状態は**partial**です。

## 関連する症状・ページ

- [Maskを接続しても結果が変わらない](./mask-does-not-change-result.md)：Effect MaskやMaskのLevel・反転が原因の場合。
- [Alpha](../../learn/04-compositing/alpha.md)：Image Alphaの意味を確認する。
- [Merge](../../nodes/compositing/merge.md)：Foreground / Background、Operator、Blendを確認する。
- [Color Corrector](../../nodes/color/color-corrector.md)：色処理の対象とOptionsを確認する。
- [Alpha Divide](../../nodes/matte-keying/alpha-divide.md) / [Alpha Multiply](../../nodes/matte-keying/alpha-multiply.md)：複数の色処理を挟む際の入力と出力を確認する。
