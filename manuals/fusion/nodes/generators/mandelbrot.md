---
title: "Mandelbrot"
description: "フラクタル模様を生成するFusion Generator。NoiseとColorの設定、ズーム、Effect Mask、具体的な合成例を解説。"
doc_type: node
term_id: "mandelbrot"
term_short: "Mandelbrotは、拡大すると細かな構造が現れるフラクタル模様を作る2D画像Generator。"
verification: partial
aliases: ["Mandelbrot", "MAN"]
concepts: ["image-data", "mask-data", "procedural-texture"]
nodes: ["Mandelbrot"]
node_family: "generators"
controls: ["Position X and Y", "Zoom", "Escape Limit", "Iterations", "Rotation", "Grad Method", "Gradient Curve", "R/G/B/A Phase and Repetitions"]
inputs: ["mask"]
outputs: ["image"]
tasks: ["generate-image", "motion-graphics", "procedural-texture"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-15"
---

# Mandelbrot

**Mandelbrot [MAN]は、数学的なフラクタルから複雑な模様を計算し、2D画像として出力するGenerator**です。模様の境界を拡大すると、さらに細かな形が現れます。SF風の背景、タイトルの背後で変化する模様、映像の一部分に重ねる抽象グラフィックなどに使えます。

撮影した映像をMandelbrotに入力して加工するのではありません。Mandelbrot自身が画像を作り、その出力を[Merge](../compositing/merge)などへ渡します。

## 何を生成するのか

フラクタルは、拡大しても細部に複雑な構造が現れる図形の一種です。Mandelbrotでは、**どの部分を見るか**をPositionとZoomで選び、**模様の境界をどう計算して色を付けるか**をNoiseとColorの設定で調整します。

Inspectorに「Noise tab」という名称がありますが、ここで操作する中心はランダムな雲模様ではなく、Mandelbrotのフラクタルです。[Fast Noise](./fast-noise)のPerlin Noiseとは生成方法も見た目も異なります。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Effect Mask**（青、任意） | <Term id="mask">Mask</Term> | 生成した模様を表示する範囲を制限する |
| **出力** | 2D Image | 模様を画像としてViewerや合成Nodeへ渡す |

DaVinci Resolve 21.1 Reference Manualに記載されている入力は**Effect Maskの1つ**です。通常の撮影素材を受け取るImage入力はありません。

Ellipseなどで作ったMaskを青い入力につなぐと、その形の範囲に模様を表示できます。このMaskは**模様の数式やズーム範囲を変える操作ではなく、生成結果を使う場所の指定**です。Noise tabのPositionやZoomとは別の役割を持ちます。

## Noise tab：模様の場所と形

| Inspector項目 | 作用 |
| --- | --- |
| **Position X and Y** | 計算する模様の横・縦位置（基準点）を選ぶ |
| **Zoom** | 模様を拡大・縮小する。拡大するたびに画像を再計算する |
| **Escape Limit** | フラクタルの反復計算を打ち切る条件を決める。低い値ではぼんやりしたハローが現れやすい |
| **Iterations** | 模様の反復構造の現れ方を変える。アニメーションでは模様が育つような表現に使える |
| **Rotation** | 模様の向きを回転する。角度を変えると画像が再計算される |

### PositionとZoomを組み合わせる

まずPosition X and Yで特徴的な境界を探し、Zoomでそこへ寄ります。拡大したあとに目当ての部分が画面から外れたら、Positionを調整して位置を合わせます。

Manualでは、Zoomの倍率を変えるたびにフラクタルが再計算されるため、実用上の拡大上限がないと説明されています。ただし、**どの倍率でも同じ速度・精度で描画できると実機で確かめたわけではありません**。深いズームを動画にする場合は、再生と書き出しを確認してください。

### Escape LimitとIterationsは何が違う？

**Escape Limit**は反復計算をどの条件で終了させるかに関係します。値を小さくしたとき、模様の縁がぼんやりして見えることがあります。

**Iterations**は、模様の反復構造の現れ方を変えます。値をアニメーションさせると、模様が成長するような変化が得られます。画像全体を奥へ進ませるZoomアニメーションとは異なる動きです。

## Color tab：境界と色の調整

| Inspector項目 | 作用 |
| --- | --- |
| **Grad Method** | 境界をどのように色分けするかを選ぶ |
| **Continuous Potential** | Grad Methodの選択肢。模様の縁を背景色へ滑らかにつなげる |
| **Iterations** | Grad Methodの選択肢。境界をはっきりした段差として見せる |
| **Gradient Curve** | 模様から背景色へ変わるグラデーションの幅を調整する |
| **R/G/B/A Phase and Repetitions** | 赤・緑・青・アルファ各チャンネルの色の現れ方を、位相と繰り返しで調整する |

**Noise tabのIterationsと、Color tabにあるGrad Methodの「Iterations」は別の設定**です。前者はフラクタルの計算に関わり、後者は境界の色の付け方を決めます。

Continuous Potentialは滑らかな色の移り変わりを、Grad MethodのIterationsは段階的な境界を見せたい場合に選びます。色だけを比べたいときは、PositionとZoomを固定してColor tabを変更すると違いが分かりやすくなります。

R/G/B/AのAはAlpha（透明度）です。Alphaを変えたときは単体のViewer表示だけでなく、Mergeで背景へ重ねた結果も確認します。

## Image / Settings tab

ほかのGeneratorと同じく、ImageとSettingsの共通タブがあります。Image tabでは、生成する画像のWidth / Height / Pixel Aspect、Depth、Global In / Outなどを扱います。

**Use Frame Format Settings**が有効ならコンポジションのFrame Formatに従い、外すと画像サイズを個別に指定できます。これは**画像全体の解像度**を決める設定です。Noise tabのZoomは、フラクタルの**どこを拡大して観察するか**を変える設定であり、同じ役割ではありません。

詳しくは[Generatorノード](./)と[解像度 / アスペクト比](../../learn/03-space/resolution-aspect)を参照してください。

<!-- capture:S154 -->

## 実機例：ZoomとEffect Maskを比較する

`Mandelbrot1` をMergeのBackground、白い文字をForegroundへ接続します。別の `MandelMasked` にはEllipseをEffect Maskとして接続し、マスクなしの出力と比較します。マスク比較時は2つのMandelbrotの位置、Zoom、反復、色の設定を揃えています。

frame 0でPositionを固定し、Zoomを `1.0 → 2.0` に変えた後、1.0へ戻してMaskを比較しました。右ViewerをAlpha表示へ切り替え、撮影後にColorへ戻しています。[接続と設定の記録](/img/fusion/captures/S154/readback.json)に値を記録しています。

WindowsのResolve Studio 21.1.0.14、1920×1080で確認した静止frameの例です。Zoomのアニメーションや深いZoomの描画性能、他の色設定はこの例では検証していません。

[![Mandelbrotに文字を合成する枝とEllipseで別のMandelbrotを制限する枝](/img/fusion/captures/S154/graph.png)](/img/fusion/captures/S154/graph.png)

上はMandelbrotと文字の合成、下は別のMandelbrotへEllipseをEffect Maskとして渡す比較枝です。

[![Mandelbrotの位置とZoom 1を示すInspector](/img/fusion/captures/S154/default-controls.png)](/img/fusion/captures/S154/default-controls.png)

Position X −0.5、Y 0、Zoom 1.0で開始します。

[![Zoom 1のMandelbrotと文字を重ねた表示](/img/fusion/captures/S154/zoom-one.png)](/img/fusion/captures/S154/zoom-one.png)

Zoom 1.0。左はMandelbrot、右は文字を重ねたMediaOutです。市松模様はViewerの透明部分を示します。

[![MandelbrotのZoomを2に変更したInspector](/img/fusion/captures/S154/zoom-controls.png)](/img/fusion/captures/S154/zoom-controls.png)

同じframeで位置を固定し、Zoomを2.0に変えます。

[![Zoom 2で拡大されたMandelbrotと文字合成](/img/fusion/captures/S154/zoom-two.png)](/img/fusion/captures/S154/zoom-two.png)

Zoom 2.0では、同じViewer範囲で模様が大きく表示されます。

[![マスクなしとEllipseを接続した別のMandelbrotの比較](/img/fusion/captures/S154/effect-mask.png)](/img/fusion/captures/S154/effect-mask.png)

左はマスクなし、右は同じ設定の別のMandelbrotへEllipseを接続した出力です。

[![ViewerのチャンネルメニューでAlphaが選択されている](/img/fusion/captures/S154/alpha-menu.png)](/img/fusion/captures/S154/alpha-menu.png)

右ViewerのチャンネルメニューでAlphaが選択されていることを確認しました。

[![左にマスクなしのColor表示、右にEllipse付き出力のAlpha表示](/img/fusion/captures/S154/mask-alpha.png)](/img/fusion/captures/S154/mask-alpha.png)

左はマスクなしのColor、右はEllipse付き出力のAlpha表示です。黒は透明、白は不透明を表します。

[再現用Graph](/img/fusion/captures/S154/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S154/capture.json)

<!-- /capture:S154 -->

## 制作例

### 1. タイトルの背景を徐々に拡大する

~~~text
Mandelbrot ──→ Merge (Background) ──→ MediaOut
Text+ ───────→ Merge (Foreground)
~~~

1. MandelbrotをViewerに表示し、Position X and Yで模様の細かな境界を探します。
2. Zoomで見せたい範囲を決めます。
3. Zoomにキーフレームを付け、模様の奥へ進むような動きを作ります。
4. Color tabでGrad MethodとGradient Curveを調整し、文字を読める明暗に整えます。
5. MandelbrotをMergeのBackground、[Text+](./text-plus)をForegroundへ接続します。

Mandelbrot自体が画像を生成するため、撮影素材の入力は不要です。タイトルの位置を避けるようにPositionを調整すれば、文字と模様の重なりを整理できます。

### 2. 映像の一部分へフラクタル模様を重ねる

~~~text
MediaIn ─────────→ Merge (Background) ──→ MediaOut
Mandelbrot ──────→ Merge (Foreground)
   ↑ Effect Mask
Ellipse Mask
~~~

1. 撮影映像をMergeのBackground、MandelbrotをForegroundへ接続します。
2. まず全面に模様が現れる状態を確認します。
3. Ellipse MaskをMandelbrotの青いEffect Mask入力につなぎ、模様を楕円形の範囲に限定します。
4. Position・Zoom・Rotationを動かして、範囲内で見せる模様を調整します。
5. 必要ならMaskのSoft Edgeや模様のAlphaを調整し、境界のなじみ方を確認します。

ここでは**Ellipseが表示位置と範囲を決め、Mandelbrotがその内側の模様を作る**という分担です。Effect Mask入力を画像処理の入力と取り違えないでください。

### 3. 模様が成長するような動きを作る

1. PositionとZoomを固定し、模様がよく見える画角を選びます。
2. Noise tabのIterationsを時間に沿って変え、構造が成長するような変化を作ります。
3. Color tabのGrad MethodをContinuous PotentialとIterationsで切り替え、滑らかな縁と段階的な縁を比較します。
4. 移動も必要ならPositionやRotationを別に動かします。

Iterationsで模様そのものを変える動きと、Zoomで拡大する動きは別です。両方を一度に動かす前に、片方ずつ調整すると変化の原因を追いやすくなります。

## Fast Noise・Plasmaとの違い

- **Mandelbrot**：数学的なフラクタルの境界を探し、深いズームや反復構造の変化を見せる。
- **[Fast Noise](./fast-noise)**：雲や煙のような不規則な模様、別Nodeを動かすノイズ画像を作る。
- **[Plasma](./plasma)**：複数の円形パターンを組み合わせ、色の位相も変えながら抽象的な背景を作る。

いずれも新しい2D画像を生成しますが、生成方法も動かすControlも異なります。求める模様とアニメーションの種類から選びます。

## 関連ページ

- [Generatorノード](./)
- [Fast Noise](./fast-noise)
- [Plasma](./plasma)
- [Text+](./text-plus)
- [Merge](../compositing/merge)
- [マスク（Mask）](../../learn/02-data/mask)
- [Image / Mask / Dataを分ける](../../learn/02-data/image-mask-data)

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』**（September 2026）、Chapter 103「Generator Nodes」、**pp.2366–2368「Mandelbrot [MAN]」**で、Effect Mask入力、Noise tabのPosition X and Y・Zoom・Escape Limit・Iterations・Rotation、Color tabのGrad Method・Gradient Curve・R/G/B/A Phase and Repetitionsを確認しました。Generator共通のImage / Settingsについては同章pp.2401–2402を参照しています。

制作例はManualで確認した機能を組み合わせた構成案です。WindowsのResolve Studio 21.1.0.14ではruntime REGID `Mandel`、Effect Mask入力、静止frameのZoom比較とAlpha表示を確認しました。全設定の初期値・数値範囲、深いズームの実機性能、Edition差は未確認のため`verification: partial`を維持しています。
