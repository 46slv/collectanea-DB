---
title: Defocus
description: camera lensのピント外れを再現し、Gaussian / Lens、bloom、絞り形状を調整できる2D Image Node。
doc_type: node
term_id: defocus
term_short: Defocusは、camera lensのピント外れ・bloom・bokeh形状を再現するNode。
verification: partial
aliases: [Defocus, Dfo]
concepts: [image-data, filtering, domain-of-definition, mask-data]
nodes: [Defocus]
node_family: blur-filter
controls: [Filter, Lock X/Y, Defocus Size, Bloom Level, Bloom Threshold, Lens Type, Lens Angle, Lens Sides, Lens Shape, Clipping Mode]
inputs: [image, mask]
outputs: [image]
tasks: [filter-image, defocus, bokeh, bloom]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# Defocus

Defocusは、camera lensのピントが外れたようなぼけを2D <Term id="image">Image</Term>へ加えるNodeです。単純な均一Blurに加え、明るい部分のbloomや、Lens modeで絞り形状に近いbokehを作れます。

## 役割

通常の[Blur](./blur)が周囲のpixelを混ぜて像を柔らかくする基本Filterなのに対し、Defocusは**ピントの外れたレンズで写したような見た目**を作るためのNodeです。特に、光源のぼけ方や明るい領域のBloomを調整できます。

Defocusが受け取るのは2D ImageとEffect Maskです。被写体までの距離やカメラのピント位置を自動解析するNodeではないため、前景だけを鮮明に残したり、奥行きによってぼけ量を変えたりするには、マスクやレイヤー分離を組み合わせます。

```text
Image → Defocus → Output
            ↑
         Effect Mask
```

## 入力

### Input

オレンジ色の必須入力です。Defocusをかける2D Imageを接続します。

### Effect Mask

青色の任意入力です。Polygonなどで作ったMaskを接続し、**Defocusの効果を表示する範囲**を限定します。白い領域には効果が適用され、黒い領域は元の画像に近い状態で残ります。Maskの境界はSoft Edge等を使ってなじませます。

**処理順序に注意:** 21.1 ManualではEffect Maskは**画像をぼかした後**に適用されると説明されています。マスクの外側の画素をぼかし計算前に切り落とす入力ではありません。被写体の輪郭でのにじみを厳密に制御する必要がある場合は、前景・背景の画像を別レイヤーにして合成する方法を検討します。

## 出力

Defocus処理後の2D Imageを出力します。

## 主な設定項目

### Filter

Defocusの方式を選びます。

- **Gaussian** — 単純で計算が速い方式。ぼけ量や範囲を決める段階に向きます。
- **Lens** — 実際のレンズのピント外れに近い形状を使う方式。光点を多角形などに見せたいときに選びます。公式ManualはGaussianよりかなり時間がかかるとしています。

見た目の確認を始めるならGaussian、bokeh形状まで必要ならLensへ切り替えると役割を分けやすくなります。

### Lock X/Y

有効にするとX / Y方向で同じDefocus量を使います。解除すると軸ごとに別の量を設定できます。

### Defocus Size

Defocusの広がりを決めます。値を増やすほどImageが強くぼけ、bloomも大きくなります。

### Bloom Level

Bloom Thresholdを超えたpixelへ加えるbloomの強さ・大きさを調整します。

### Bloom Threshold

どの明るさ以上をbloom対象にするかを決めます。

Thresholdより暗いpixelはDefocusだけ、明るいpixelにはDefocusに加えてBloomが適用されます。

まずBloom Levelを抑え、Defocus Sizeでぼけの形を決めてからThresholdを動かすと、ぼけそのものと明部の光の広がりを混同せずに調整できます。Thresholdの数値は入力画像の値との比較なので、異なる輝度レンジの素材間で同じ見た目になるとは限りません。

### Lens Type / Angle / Sides / Shape

FilterをLensにした場合だけ使います。

- **Lens Type** — bokehの基本形状
- **Lens Angle** — 形状の回転
- **Lens Sides** — NGonの辺数
- **Lens Shape** — NGonを滑らかな多角形から先の尖った形へ調整。Manualは5～10辺で違いを確認しやすいとしています。

CircleではAngleやSidesの違いが見えにくいため、形状差を確認する場合はNGon系で観察します。

### Clipping Mode

Blurと同様、DoD境界の扱いをFrame / Domain / Noneから選びます。

大きなDefocusでは周囲のpixelを広く参照するため、フレーム端や透明画像の境界に問題が出る場合に確認します。

- **Frame（初期設定）** — 画像全体のフレームを処理範囲とします。上流のDomain of Definition（DoD）がフレームより小さい場合、残りの領域を黒／透明として扱います。
- **Domain** — 上流のDoDを尊重します。処理範囲が狭いまま大きくぼかすと、境界でぼけが切れる場合があります。
- **None** — 元画像をDoDの境界で切り抜く処理を行いません。必要な参照画素が上流DoDの外にある場合、そこは黒／透明として扱われます。

DoDとは、画像データが有効な範囲を示す情報です。特に透明背景上の文字・ロゴなどでは、画像の見えている範囲とフレーム全体が同じとは限りません。詳しくは[Resolution / Domain of Definition](../../learn/07-debugging/resolution-domain-of-definition)を参照してください。

## 最小構成

```text
MediaIn → Defocus → Output
```

まずGaussianでDefocus Sizeだけを変え、次にBloom、最後にLensへ切り替えると、それぞれの役割を分けて確認できます。

## 運用例

### 1. 夜景の光点を多角形のボケへ変える

入力は街灯や車のライトを含む夜景の2D Imageです。目標は、単に輪郭を柔らかくすることではなく、点光源をピントが外れたレンズの光点として見せることです。

1. `MediaIn → Defocus → MediaOut` の順につなぎ、最初は**Filter = Gaussian**、**Bloom Levelは控えめ**にしてDefocus Sizeで背景の形が分かる程度にぼかします。
2. Filterを**Lens**へ切り替え、点光源の周辺を拡大して見ます。**Lens Type**をNGon系にし、Lens Sidesで多角形の辺数を選びます。
3. Lens Shapeで角の尖り具合を決め、Lens Angleで多角形の向きを変えます。CircleではAngleやSidesの効果が見えない点に注意します。
4. Bloom Thresholdで発光の対象を明るい部分へ絞り、Bloom Levelで光の広がりを足します。Bloomを強くしすぎると、光点の形状より白いにじみが目立つ場合があります。

光点の形が判別できる素材で比較すると、GaussianからLensへ切り替える意義が分かりやすくなります。レンズ交換や被写界深度の物理シミュレーションを行う工程ではありません。

### 2. 人物を鮮明に残し、背景だけをぼかす

入力は人物と背景が一緒に写った映像です。単一のDefocusへ人物以外を白くしたEffect Maskを付ける簡易方法もありますが、前景と背景の境界で像が混ざる場合は、**背景をぼかす枝と、人物を抜き出す枝を別に作ってから合成**します。

~~~text
MediaIn ──┬──→ Defocus（背景用）───────→ Merge［Background］
          └──→ 人物の切り抜き処理 ───→ Merge［Foreground］
                                           ↓
                                        MediaOut
~~~

1. 上の枝は背景のためにDefocusを適用します。背景の光点を利用するならLensとBloomを調整します。
2. 下の枝では[マスク](../../learn/02-data/mask)などで人物のAlphaを作り、人物だけを残します。切り抜きの方法は素材に合わせて選びます。
3. Mergeでは、ぼかした枝をBackground、人物の枝をForegroundへ接続します。輪郭が不自然なら、人物側の切り抜きとAlphaの境界を先に調整します。
4. 必要なら背景枝から人物が写っている領域を取り除きます。ぼけた人物の色が背景に残っていると、髪や肩の周囲に縁取りが生じることがあります。元画像だけでは隠れた背景を復元できないため、必要に応じて別の背景画像や修復処理を用意します。

この手順は**距離に応じてボケを自動計算する方法ではなく、別レイヤーで前景を保護する合成方法**です。被写体やカメラが動くショットでは、切り抜きも時間に沿って追従させます。

### 3. ピントが外れていく演出を作る

テキストや静止画の表示中に、意図的にピントが外れたような変化を作る例です。入力は2D Imageで、Defocus Sizeを時間に沿ってアニメーションさせます。

1. 開始時刻ではDefocus Sizeを小さく設定し、文字を読める状態にします。
2. 変化を始めるフレームにKeyframeを打ち、数フレーム～数十フレーム後のDefocus Sizeを大きくします。
3. 白い文字や光が強く広がりすぎる場合は、Bloom Levelを下げるかBloom Thresholdを調整します。
4. 終了後に別の文字やカットへ移る場合は、Defocusより後のNodeがぼけた結果を受け取ることを確認します。

この演出は画面全体のDefocus量を変えるもので、撮影レンズのフォーカス距離そのものを変更する処理ではありません。

### 4. 画面の一部だけ夢の中のようにぼかす

`MediaIn → Defocus` のDefocusにEllipseなどのEffect Maskをつなぎ、背景の一部だけにぼけを適用します。Maskの位置や大きさ、Soft Edgeを調整すると、ぼけのかかる場所が時間とともに変わります。**Defocus Sizeはぼけの強さ、Maskは適用する位置**と役割を分けて調整します。

人物の髪など細い境界を正確に保護する用途では、この簡易方法だけで十分とは限りません。必要なら前述のレイヤー分離へ切り替えます。

## Blurとの違い

- **Blur** — 一般的なsoftening。FilterとBlur Sizeを中心に使う
- **Defocus** — camera lensのピント外れを意識し、bloomやlens shapeを持つ

「ただ柔らかくしたい」ならBlur、「ピント外れ・bokehとして見せたい」ならDefocusを先に検討します。

## 挙動と注意点

- **画面全体へ同じぼけ量が基本**：Defocusは深度情報や撮影レンズの焦点位置を入力として受け取りません。被写体の距離によってぼけを変えたい場合は、領域分離など別の設計が必要です。
- **Lens modeは重い**：ManualはGaussianより計算時間が長いとしています。調整段階ではGaussian、光点の形を詰める段階でLensへ切り替えられます。
- **Bloomとぼけを別に考える**：Bloom Thresholdより暗い画素にもDefocusは適用されます。Bloomを無効にしてもDefocus Sizeが残っていれば通常のぼけは残ります。
- **Maskは処理後に適用される**：Effect Maskが画像の参照範囲そのものを先に限定するわけではありません。前景の保護が必要ならレイヤー分離を優先します。
- **DoDと透明部分を意識する**：透明画像や一部だけ有効な画像では、Clipping Modeにより輪郭周辺のにじみ方が変わります。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| Lens AngleやLens Sidesを動かしても変わらない | Filterが**Lens**か、Lens Typeが**Circle**になっていないかを確認。多角形の差を見る場合はNGon系にする。 |
| 多角形のボケが見えない | 小さい光点がある素材でLens modeを試す。Defocus Sizeを少し増やし、Bloom Levelを抑えて輪郭を見る。 |
| 明るい部分が広がりすぎる | Bloom LevelとBloom Thresholdを切り分ける。Defocus Sizeを下げるとぼけ自体の広がりも減る。 |
| マスク境界にぼけた色がにじむ | MaskのSoft Edgeと、処理後Maskである点を確認する。必要なら人物と背景を別レイヤーにする。 |
| フレーム端や透明図形の外縁で急に切れる | Clipping ModeのFrame / Domain / Noneを比較し、上流DoDやAlphaを確認する。 |
| 再生やレンダーが重い | Gaussianで構図とぼけ量を確定し、必要なカットでだけLens modeに戻して確認する。 |
| すべての距離が同じようにぼける | 正常な動作範囲。距離ごとのぼけ量は、元画像の領域を分けるなど別の工程で指定する。 |

**関連する効果との選び分け**：単純な軟化なら[Blur](./blur)、光の周りを発光させたいなら[Glow](./glow)や[Soft Glow](./soft-glow)、移動方向に沿ったにじみなら[Directional Blur](./directional-blur)も候補です。Defocusはレンズのピント外れらしい形状とBloomの両方が必要な場合に向きます。

## 関連する考え方

- [Resolution / Domain of Definitionを確認する](../../learn/07-debugging/resolution-domain-of-definition)
- [マスク（Mask）](../../learn/02-data/mask)

## 実機例：ぼけとBloomを分けて見る

<!-- capture-case:S59 -->

Resolve Studio21.1.0.14／Windowsで、1920×1080の固定チャートを接続しました。左が入力、右が処理後です。両ViewerはColor／40%で、書き出しや測色の比較ではありません。内部REGIDは`Defocus`です。

[![チャートのLoaderからDefocus1とMediaOut1へ接続した実機Graph](/img/fusion/captures/S59/graph.png)](/img/fusion/captures/S59/graph.png)

[![DefocusのLens、Size12、Bloom0、Threshold0.75、Sides5を示すInspector](/img/fusion/captures/S59/inspector.png)](/img/fusion/captures/S59/inspector.png)

[![左のチャートに対し、右はLensとSize12で文字や細線がぼけた出力](/img/fusion/captures/S59/compare.png)](/img/fusion/captures/S59/compare.png)

Lock X/Yをオン、Sizeを12、Bloom Levelを0、Thresholdを0.75にしてLensを表示しました。Lens Typeは2番目の形状、Sides5、Shape0、Angle0です。同じSizeとBloomのままGaussianへ切り替えた画面も示します。どちらも文字や細線がぼけています。この縮小Viewerだけで、各方式のぼけ形状の優劣やLens kernelの厳密な形は判断しません。

[![同じSize12とBloom0でGaussianを選んだInspector](/img/fusion/captures/S59/gaussian-inspector.png)](/img/fusion/captures/S59/gaussian-inspector.png)

[![GaussianとSize12で文字やチャートがぼけた右Viewer](/img/fusion/captures/S59/gaussian.png)](/img/fusion/captures/S59/gaussian.png)

Lensへ戻し、Bloom Levelだけを0.9へ上げると、白い点や外枠、白いパネルの周囲が強く明るくにじみました。ぼけ量とBloomの強さを別々に調整する例です。

[![LensのBloom Levelを0.9、Thresholdを0.75へ設定したInspector](/img/fusion/captures/S59/bloom-inspector.png)](/img/fusion/captures/S59/bloom-inspector.png)

[![Bloom0.9では白い点や枠と白いパネルの周囲が強く明るくにじむ](/img/fusion/captures/S59/bloom.png)](/img/fusion/captures/S59/bloom.png)

最後はLens、Size12、Bloom0へ戻して保存しました。実写の光点、Lens形状の全比較、Mask、Alpha、DoD／Clipping、アニメーションと性能は未確認です。

[再現用Graph](/img/fusion/captures/S59/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S59/capture.json)

## 似たNode・関連Node

- [Blur](./blur) — 標準的なsoftening
- [Directional Blur](./directional-blur) — 方向や中心を持つblur
- [Soft Glow](./soft-glow) — 明るい部分を柔らかく発光させる

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、**Chapter 92「Blur Nodes」、Defocus [Dfo]、pp.2112–2113**を一次資料としました。Image / Effect Maskの2入力、Effect Maskの後段適用、Gaussian / Lens、Lock X/Y、Defocus Size、Bloom Level / Threshold、Lens Type / Angle / Sides / Shape、Clipping Mode（Frame / Domain / None）を確認しています。

背景分離やピント外れアニメーションの構成は、公式ManualのNode仕様から組み立てた**制作例**であり、マスク抽出品質・隠れた背景の復元・実機レンダリング結果まで検証した作例ではありません。

S59の内部REGID、Gaussian／LensとBloom0／0.9の表示は確認済みです。Lens kernelの詳細、実写bokehの形状、全Control、GPU性能、Edition差は未確認のため `verification: partial` を維持します。
