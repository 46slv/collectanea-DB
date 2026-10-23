---
title: Sharpen
description: Sharpenノードの入出力、Amount・Lock X/Y・Clipping Mode・Blendの使い方と、映像や合成素材の輪郭補正の実例。
doc_type: node
term_id: sharpen
verification: partial
aliases: [Sharpen, Shrp]
concepts: [image-data, filtering, domain-of-definition]
nodes: [Sharpen]
node_family: blur-filter
controls: [Color Channels, Lock X/Y, Amount, Clipping Mode, Blend]
inputs: [image, mask]
outputs: [image]
tasks: [sharpen, enhance-detail]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-13"
---

# Sharpen

Sharpenは、2D <Term id="image">Image</Term>の細かな明暗差を強調し、輪郭をくっきり見せるノードです。周囲の画素を使って計算するconvolution filter（畳み込みフィルター）を利用します。ピントが少し甘く見える映像や、合成した画像の輪郭を控えめに調整するときに使えます。

シャープ処理は既存の輪郭を目立たせるもので、ピント外れや手ぶれで失われた情報を復元する処理ではありません。Amountを上げると髪や文字だけでなく、ノイズ、圧縮の境界、輪郭の不自然な明暗も目立つ場合があります。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Input（橙）** | 2D Image | シャープ処理する元画像。MediaIn、Loader、前段の画像処理ノードなどを接続する。 |
| **Effect Mask（青・任意）** | Mask | 処理結果を使う範囲を制限する。Ellipse、Polygon、Paintなどで作ったマスクを接続できる。 |
| **出力** | 2D Image | 処理後の画像。後段のノード、Merge、MediaOutなどへ接続する。 |

基本構成は次のとおりです。

~~~text
MediaIn → Sharpen → MediaOut
~~~

Effect Maskは**フィルターを計算した後**に適用されます。目元だけを調整したい場合、元映像は橙色のInputへ、目元を囲むマスクは青色のEffect Maskへ接続します。入力映像を「マスク画像に変換する」機能ではありません。マスク自体の作り方は[マスク（Mask）](../../learn/02-data/mask)を参照してください。

## Controlsタブ

### Color Channels（RGBA）：処理する成分を選ぶ

R（赤）、G（緑）、B（青）、A（Alpha）のうち、どのチャンネルにSharpenを適用するかを選びます。21.1マニュアルでは4つとも有効な状態が既定です。

- 映像の色成分だけをくっきり見せたい場合は、まずRGBを対象にして、Alphaを処理する必要があるか確認します。
- 透過したロゴやキー抜き素材では、Alphaまで処理すると合成境界の見た目が変わる可能性があります。RGBとAlphaを分けて比較します。
- 特定のチャンネルを外すと、そのチャンネルのSharpen計算を行いません。

この選択は、Settingsなどにある**共通RGBAコントロールとは別**です。ControlsタブのColor Channelsは計算**前**に対象を決め、共通RGBAコントロールは計算**後**に適用されます。「Alphaを変えたくない」ときは、後段の表示だけでなく、Sharpenの処理対象も確認します。

### Lock X/YとAmount：方向と強さを決める

**Amount**はシャープ処理の強さです。値を増やすと輪郭の差が強調されますが、同時にノイズや過剰な輪郭強調が現れないか確認してください。

**Lock X/Y**は既定でオンで、水平方向と垂直方向の調整値が連動します。オフにするとX・Yを独立して調整できます。

例えば横方向と縦方向で細部の見え方が違う映像では、いったん連動状態で調整し、必要な場合だけロックを解除して差を比較します。ただし、特定方向のぶれやぼけを正確に逆算して修復する機能ではありません。

Amountの数値を「何ピクセルの半径」として扱う根拠は、参照した21.1マニュアルのSharpen節にはありません。固定の数値を推奨するよりも、実際の素材を100%表示して元画像と比較します。

### Clipping Mode：画像の有効領域の端をどう扱うか

<Term id="domain-of-definition">Domain of Definition（DoD）</Term>は、画像データが有効とされる領域です。文字や切り抜いた画像など、フレーム全体より小さい領域だけに画像がある場合、フィルターが周辺画素を参照する際に境界が影響することがあります。

| Mode | 21.1マニュアルで説明される扱い |
| --- | --- |
| **Frame（既定）** | DoDをフレーム全体として扱う。元の有効領域の外側は黒／透明として処理する。 |
| **Domain** | 入力画像から来たDoDを尊重する。大きなフィルターでは境界で切れたような結果になる場合がある。 |
| **None** | 入力画像のクリッピングを行わない。通常のDoD外から必要になるサンプルは黒／透明として扱う。 |

FrameとNoneは名前が似ているから同じ動作、と決めつけないでください。入力側のDoDをどう扱うかが異なります。透明素材や小さいグラフィックの周辺に不自然な縁が出る場合は、Amountを下げるだけでなくClipping Modeを切り替えて**実際の出力**を比較します。

DoD自体が分からない場合は[Domain of Definitionの基礎](../../learn/03-space/domain-of-definition)を先に確認してください。

### Blend：元画像へ戻す量を調整する

**Blend**はシャープ処理後の画像を元画像と混ぜる割合です。値を0へ近づけるほど、元画像の比率が増えます。ControlsタブのBlendは共通コントロール側のBlendと連動しており、片方を変更するともう片方にも反映されます。

Amountを強くしてからBlendで弱めることもできますが、輪郭の明暗が不自然になっているときは**Amount自体を戻す**ことも比較してください。強い処理を混ぜ戻すだけでは、常に自然な結果になるとは限りません。

## 制作での使い方

### 少し甘い映像の輪郭を整える

~~~text
MediaIn → Sharpen → MediaOut
~~~

衣装の縫い目や建物の輪郭など、変化を判断しやすい部分を100%表示します。Lock X/Yはオンのまま、Amountを少しずつ上げて元画像と切り替えます。必要に応じてBlendで強さを整え、顔の肌、暗部、圧縮ノイズまで強調されていないか確認します。画面を縮小表示したときだけきれいに見える設定を採用しないようにします。

### 目元だけを強調する

~~~text
MediaIn ───→ Sharpen → MediaOut
                 ↑
           Ellipse（Mask）
~~~

映像を橙色のInputへ接続し、目元を囲むEllipseの出力を青色のEffect Maskへ接続します。マスクの境界を柔らかく調整し、目元の輪郭を強調しながら頬や背景の質感が変わらないようにします。人物が動くカットでは、マスクが目元から外れないようアニメーションやトラッキングも検討します。

### 透過したロゴを合成前に整える

~~~text
ロゴ画像 → Sharpen ──→ Merge → MediaOut
背景画像 ────────────→ Merge
~~~

細い文字やロゴの輪郭を整えてから背景へ重ねる例です。まずColor ChannelsでAlphaを処理する必要があるか判断し、色成分のシャープ化と透過境界の調整を分けます。透明部分の端に縁が出る場合はClipping Modeも比較します。最終的な判断は、Sharpen単体のViewerではなく**背景へ合成した状態**で行います。

## Unsharp Maskとの使い分け

| Node | 主な調整 | 選ぶ目安 |
| --- | --- | --- |
| **Sharpen** | Amount、X/Y、Clipping Mode、Blend | 少ない操作で輪郭を調整する。 |
| [Unsharp Mask](./unsharp-mask) | Size、Gain、Threshold | 輪郭を参照する広さ、強調量、低コントラスト領域の除外を分けて調整する。 |
| [Erode Dilate](./erode-dilate) | Amountによる縮小・拡張 | 輪郭のコントラストではなく、マットや図形の太さを変える。 |

SharpenはUnsharp Maskより必ず劣るという意味ではありません。どの細部を残し、どこを強調したいかで選びます。マットの縁を内側へ寄せたいだけなら、SharpenでなくErode Dilateなどの境界処理を検討します。

## 意図どおりにならないとき

| 症状 | 確認点 |
| --- | --- |
| 輪郭の両側に白黒の縁が見える | Amountを減らし、100%表示で元画像と比較します。 |
| 暗部ノイズや圧縮の境界が目立つ | Amountを弱めます。弱い差を選別したい場合はUnsharp MaskのThresholdも比較します。 |
| 効果が見えない | Amount、Blend、ControlsのColor Channels、Effect Maskの範囲、出力接続を確認します。 |
| 透過素材の端がおかしい | Alphaの処理対象とClipping Mode、背景へMergeした結果を確認します。 |
| 一方向の輪郭だけ強くなる | Lock X/Yが解除されていないか、X/Yの設定を確認します。 |

## 実機例：Amountと縁取りを確認する

<!-- capture-case:S62 -->

Resolve Studio21.1.0.14／WindowsのFusionページで、1920×1080の固定チャートを接続しました。通常の比較は両Viewer Color／40%です。内部REGIDは`Sharpen`でした。入力をBlur Size2で少しぼかし、左はそのBlur出力、右はSharpenの結果を表示しています。

[![LoaderからBlurSource1、Sharpen1、MediaOut1へ順に接続した実機Graph](/img/fusion/captures/S62/graph.png)](/img/fusion/captures/S62/graph.png)

[![SharpenのLock X/Yオン、Amount1、Frame、Blend1を示すInspector](/img/fusion/captures/S62/inspector.png)](/img/fusion/captures/S62/inspector.png)

[![左はBlur Size2を通したチャート、右はSharpen Amount1で輪郭を強調した40%表示](/img/fusion/captures/S62/compare.png)](/img/fusion/captures/S62/compare.png)

Amount1、Lock X/Yオン、Blend1を基準に、両Viewerを100%へ変更しました。下は画像の一部を表示した実機Viewerです。右の文字やパネルの境界が左より強く見えます。画像ファイルを後から拡大したものではありません。

[![両Viewer100%で比較し、右の文字とパネル境界が左より強く見える](/img/fusion/captures/S62/detail1.png)](/img/fusion/captures/S62/detail1.png)

Amountを3へ上げた100%表示では、文字や色パッチの周囲に太い明暗の縁取りが出ました。輪郭が強くなることと、自然な仕上がりになることは別に判断します。

[![同じ入力のままAmountを3へ上げたSharpen Inspector](/img/fusion/captures/S62/strong-inspector.png)](/img/fusion/captures/S62/strong-inspector.png)

[![両Viewer100%でAmount3の右側に太い明暗の縁取りが出る](/img/fusion/captures/S62/detail3.png)](/img/fusion/captures/S62/detail3.png)

Amountを1へ戻し、Blendを0にすると、40%表示で右は左のBlur済み入力と同じ見た目へ戻りました。最後はAmount1／Blend1／40%へ復元して保存しています。

[![Amount1のままBlend0へ下げたSharpen Inspector](/img/fusion/captures/S62/blend0-inspector.png)](/img/fusion/captures/S62/blend0-inspector.png)

[![Blend0では右のチャートが左のBlur済み入力と同じ表示になる](/img/fusion/captures/S62/blend0.png)](/img/fusion/captures/S62/blend0.png)

これは固定チャートで強調と縁取りを見分ける例です。失われた細部の復元、実写の画質、Alpha、Mask、Clipping Modeの比較、性能は未確認です。

[再現用Graph](/img/fusion/captures/S62/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S62/capture.json)

## 関連項目と根拠

- [Blur / Filterノード](./index.md)：ぼかしと輪郭強調の選び分け。
- [マスク（Mask）](../../learn/02-data/mask)：Effect Maskの役割。
- [DoDの確認手順](../../learn/07-debugging/resolution-domain-of-definition)：境界が不自然な場合の調べ方。

一次資料はBlackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 92「Blur Nodes」、**pp.2119–2121**です。Image / Effect Maskの接続、RGBAの計算前後の違い、Lock X/Y、Amount、Clipping Modeの3モード、Blendの連動を確認しています。[公式サポート](https://www.blackmagicdesign.com/jp/support/)。

制作例と症状別の調整手順は、確認した仕様に基づく運用上の提案です。S62の内部REGID、Amount1／3、Blend0／1と40%／100%の表示は確認済みです。画素単位の演算、Amountの全範囲、Alpha／Mask、実写の画質、Free / Studio差は未確認のため、verificationはpartialを維持します。
