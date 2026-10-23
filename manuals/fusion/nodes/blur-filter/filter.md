---
title: Filter
description: 輪郭抽出、エンボス、ノイズ、グレイン、簡易的なぼかしを1つのノードから選ぶ方法と実際の接続例。
doc_type: node
term_id: filter
verification: partial
aliases: [Filter, Fltr]
concepts: [image-data, filtering, convolution]
nodes: [Filter]
node_family: blur-filter
controls: [Filter Type, Color Channels, Power, Angle, Median, Seed, Animated]
inputs: [image, mask]
outputs: [image]
tasks: [filter, edge-detect, stylize, grain]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-13"
---

# Filter

Filterは、入力画像に対して複数の画像処理から1種類を選んで適用するノードです。輪郭を検出するSobel / Laplacian、凹凸を表現するRelief / Emboss Over、CG画像へ質感を足すNoise / Grainなど、用途の違う処理が**Filter Type**にまとまっています。

名前が似ていますが、[Blur](./blur)ノードの「ぼかし方を選ぶFilter」とは別です。Filterノードは輪郭抽出やノイズ生成にも使います。

## 入力と出力

- **Input（橙）**：処理する2D Image。映像、静止画、Renderer 3Dの画像出力などを接続します。
- **Effect Mask（青、任意）**：Filterの適用範囲を制限します。[Ellipseなどで作るマスク](../../learn/02-data/mask)や別ノードの画像を接続できます。Manualによると、Effect Maskはフィルター処理の**後**に適用されます。
- **Output**：選択したFilter Typeで処理された2D Image。映像として出力するほか、Sobel等の結果を別ノードのEffect Maskへ渡すこともできます。

    MediaIn → Filter → MediaOut
                  ↑
             任意のEffect Mask

Effect Maskは「ノードがどの画素を調べるか」の設定ではなく、処理結果の適用範囲を決める入力です。範囲を指定しても、処理自体を範囲内だけに限定できると断定しないでください。

## Filter Typeの選び方

| Filter Type | 画像がどう変わるか | 使いどころ |
| --- | --- | --- |
| **Relief** | 画像を灰色の金属面へ押し込んだような陰影にする | 硬貨やレリーフ状の質感 |
| **Emboss Over** | 元画像を残しつつ、明暗による浮き彫りを重ねる | ロゴやテクスチャーの立体感 |
| **Noise** | 均一なノイズを加える | CGの均質な面へ細かな変化を加える |
| **Defocus** | 画像をぼかす | 簡易的なぼかし。絞り形状まで扱う場合は[Defocusノード](./defocus) |
| **Sobel** | 輪郭を抽出する | 輪郭だけの発光、エッジを使うマスク素材 |
| **Laplacian** | Sobelより細かい輪郭を抽出する | 小さなディテールを拾う輪郭マスク |
| **Grain** | 主に中間調へフィルム粒子に似たノイズを加える | CGと実写を合成する際の質感合わせ |

この表は21.1 ManualのFilter Type一覧に明示された項目です。**Median**は次節のInspector説明に登場しますが、同じManualのFilter Type一覧には列挙されていません。S66のStudio21.1.0.14／Windows実機メニューでも7項目だけが表示され、Medianはありませんでした。

SobelとLaplacianは被写体の意味を理解して切り抜くキーヤーではありません。明暗や色の変化がある場所を検出するため、必要ないテクスチャーの輪郭も出ます。結果をそのまま完成したアルファマットとみなさず、使うチャンネルと明るさを確認します。

## Inspector：主な操作

### Color Channels（RGBA）

R・G・B・Aのチェックで、処理対象のチャンネルを選びます。たとえばRGBにだけ効果を加え、元のAlphaを保ちたいときはAを外します。透過画像の境界まで加工したい場合は、Alphaの扱いが結果に影響するため、RGBだけのプレビューで判断しないようにします。

### Power

選択したFilterの効果量です。**1〜10**の範囲で設定します。Manualでは**SobelとLaplacianには適用されない**と明記されています。輪郭が弱い場合にPowerを上げ続けるのではなく、元画像のコントラストや後段の処理を検討します。

### Angle

**Relief / Emboss Over**の陰影方向を変更します。範囲は**0〜315度、45度刻み**です。ロゴの浮き彫りなら、光が当たっているように見せたい方向に合わせて調整します。その他のFilter Typeへ共通する回転パラメータではありません。

### Median

21.1 Manualは、**Median設定時のみ**現れるパラメータとして説明しています。値が**0.0なら最小値、0.5なら中央値、1.0なら最大値**を選びます。ただし、前述のとおりFilter Type一覧と記載が一致しません。S66の実機ではMedianがなかったため、このスライダーの存在を前提にせず、近傍画素の順位を明示的に操作できる[Rank Filter](./rank-filter)を確認してください。

### Seed / Animated

どちらも**Noise / Grain**を選んだ場合だけ表示されます。

- **Seed**：乱数パターンの起点。同じSeed値なら同じ条件下で再現可能なパターンを得ます。
- **Animated**：オンでフレームごとに模様が変わり、オフで静止した模様になります。

ManualはNoise / Grainについてフレーム番号を乱数の種として使うとも記載していますが、Animatedをオフにしたときの内部的な優先関係までは説明していません。固定テクスチャーにしたい場合は、実際に数フレームを比較して確認します。

## 実際の使い方

### 1. 抜いた人物の輪郭だけに光を足す

人物をキーイングして得たForeground画像を2系統に分けます。一方はGlowの**画像入力**へ、もう一方はFilterへ接続して**Sobel**を選び、輪郭画像を作ります。その出力をGlowの**Effect Mask**に使うと、発光の適用範囲を輪郭へ寄せられます。

    キーイング済みForeground ─────────→ Glow（画像）→ Merge
                   └→ Filter（Sobel）→ Glow（Effect Mask）
    Background ────────────────────────────────→ Merge

Filter結果を画像本体と置き換えるのではなく、**元画像を残したまま輪郭をマスク素材として再利用**する構成です。Glowが出す光の幅とSobelの輪郭の太さは同じものではありません。細かな髪や服の模様まで光る場合は、元画像やマスクを見直します。

### 2. CG素材のノイズを実写へ近づける

CGレンダリング済みの2D画像をFilterに入れ、まず**Grain**を選びます。強度を小さく始め、背景の実写と並べて中間調の粒子感を比較します。時間方向に粒が変化する素材ならAnimatedをオンにし、静止したグラフィックの質感だけを変えたい場合はオフも試します。

Grainはフィルム粒子風、Noiseは均一なノイズというManual上の違いがあります。ただし、**Filterだけで実写の粒状感を完全に再現できるわけではありません**。粒子のサイズや色分布まで合わせる必要があれば、別のノイズ処理やFilm Grainも比較します。

### 3. ロゴに浮き彫りの陰影を加える

ロゴの画像をFilterへ接続し、**Emboss Over**を選びます。Angleを45度刻みで変え、Powerで強さを調整します。元画像の配色を生かしたいときは、色とAlphaがどう変わったかを確認し、必要ならマスクや後段のMergeで元画像と組み合わせます。

## 他のノードとの使い分け

- [Blur](./blur) / [Defocus](./defocus)：ぼかしを主目的にする。レンズのピント外れや絞り形状を再現したいならDefocusが候補です。
- [Rank Filter](./rank-filter)：近傍画素の順位を使って点状ノイズを除去したり、水彩画風の表面にしたりする処理に向きます。
- [Custom Filter](./custom-filter)：用意された種類を選ぶのではなく、周辺画素へ適用する係数（カーネル）を自分で設定します。
- [Glow](./glow)：FilterのSobel / Laplacianで得た輪郭画像をEffect Maskとして利用できます。

## うまくいかないとき

- **Sobel / LaplacianでPowerを変えても変化しない**：仕様上、Powerは両Filter Typeへ作用しません。
- **Noise / Grainが毎フレームちらつく**：Animatedの状態を確認します。固定したい場合はオフにして前後フレームを比較します。
- **輪郭が細かすぎる**：LaplacianはSobelより細かい輪郭を拾います。輪郭抽出を明暗差の検出として捉え、元画像と後段マスクを確認します。
- **マスクをつないでも想定外の部分が変わる**：青いEffect Mask入力と橙の画像入力を取り違えていないか、マスクの白黒やAlpha、どの画像を表示しているかを確認します。
- **Medianが見当たらない**：21.1 Manual内でFilter Type一覧とMedianパラメータ説明が一致していません。存在や表示条件を推測せず、[Rank Filter](./rank-filter)を代替候補として確認します。

## 実機例：SobelとAlphaの処理を分ける

<!-- capture-case:S66 -->

Resolve Studio21.1.0.14／WindowsのFusionページで、1920×1080の固定チャートを接続しました。通常の比較は両Viewer Color／40%です。内部REGIDは`Filter`でした。左は入力、右はFilterの結果です。

[![LoaderからFilter1、MediaOut1へ接続した実機Node Editor](/img/fusion/captures/S66/graph.png)](/img/fusion/captures/S66/graph.png)

[![FilterでSobelを選び、RGBAのAを外した実機Inspector](/img/fusion/captures/S66/inspector.png)](/img/fusion/captures/S66/inspector.png)

[![左の入力チャートに対し、右は不透明な黒地へSobelの輪郭が出る](/img/fusion/captures/S66/compare.png)](/img/fusion/captures/S66/compare.png)

Sobelを選び、ノード本体のRGBAからAを外すと、不透明な黒地に文字や格子の輪郭が表示されました。Aも処理すると、同じ入力でも輪郭以外に透過チェッカーが現れます。輪郭を画像として使う場合は、RGBとAlphaを別々に確認します。

[![SobelでAも処理する初期RGBA選択のInspector](/img/fusion/captures/S66/alpha1-inspector.png)](/img/fusion/captures/S66/alpha1-inspector.png)

[![Aを処理したSobelでは右の輪郭以外に透過チェッカーが見える](/img/fusion/captures/S66/alpha1.png)](/img/fusion/captures/S66/alpha1.png)

同じ入力でLaplacianへ切り替え、Aを外した結果です。このチャートと40%表示では、Sobelより弱い細い輪郭が見えます。一般的な強度差や正確な演算式を測定した結果ではありません。

[![同じ入力でLaplacianを選びAを外したInspector](/img/fusion/captures/S66/laplacian-inspector.png)](/img/fusion/captures/S66/laplacian-inspector.png)

[![Laplacianでは右に弱い細い輪郭が表示される](/img/fusion/captures/S66/laplacian.png)](/img/fusion/captures/S66/laplacian.png)

実機のFilter Typeメニューは下の7項目でした。この環境ではMedianを選べませんでした。ManualのMedian説明を、このメニューへ追加された機能として読み替えないでください。

[![実機Filterメニューの7項目。Medianの項目は表示されていない](/img/fusion/captures/S66/filter-menu.png)](/img/fusion/captures/S66/filter-menu.png)

最後はSobel／Aオフ／Blend1へ戻して保存しました。Effect Mask、Noise／Grainの時間変化、その他のFilter、実写、画素単位の演算と性能は未確認です。

[再現用Graph](/img/fusion/captures/S66/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S66/capture.json)

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 99「Filter Nodes」、pp.2339–2341。入力、各Filter Type、InspectorのColor Channels / Power / Angle / Median / Seed / AnimatedとSobelの接続例を確認。
- S66で内部REGID、7項目のメニューとMedian不在、Sobel／Laplacian、Aオン／オフの表示を確認しました。内部演算式、画素単位のチャンネル値、全初期値、Edition差は未確認です。制作例の全構成を実行したものではありません。
