---
title: Custom Filter
description: 3×3・5×5・7×7の係数表で画像のぼかし・輪郭強調・浮き彫りを作るFusionノード。入力、Normalize、Floor Level、制作例を説明する。
doc_type: node
term_id: custom-filter
verification: partial
aliases: [Custom Filter, CFlt]
concepts: [image-data, convolution, filtering]
nodes: [Custom Filter]
node_family: blur-filter
controls: [Color Channels, Matrix Size, Update Lock, Filter Matrix, Normalize, Floor Level]
inputs: [image, mask]
outputs: [image]
tasks: [custom-filter, convolution, edge-detect, sharpen]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-13"
---

# Custom Filter

Custom Filterは、**注目している画素と、その周囲の画素をどの割合で計算に使うか**を自分で決めるノードです。ぼかし、輪郭強調、浮き彫りなどを、近傍画素に掛ける数値の組み合わせから作れます。

この数値の表を**畳み込み行列（convolution matrix／カーネル）**と呼びます。たとえば中央だけを使えば元の画素に近い結果となり、周囲も使えば近くの色が結果へ影響します。あらかじめ処理の種類を選ぶ[Filter](./filter)と異なり、Custom Filterでは行列の各値を直接編集します。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Input（橙）** | 2D Image | 加工する映像・静止画・合成結果。RGBAチャンネルを受け取ります。 |
| **Effect Mask（青、省略可）** | Mask | 処理結果を適用する範囲を指定します。 |
| **Output** | 2D Image | 行列で処理された画像を、後段のノードへ渡します。 |

基本の接続は **MediaIn → Custom Filter → MediaOut** です。別の画像処理ノードやMergeの手前へ挿入しても使えます。

Effect Maskには[Polygonなどで作るマスク](../../learn/02-data/mask)を接続できます。21.1マニュアルでは、Effect Maskはノードの**処理後**に適用されると説明されています。マスクをつないでも、行列が参照する周辺画素をマスク内部だけに限定する設定になるわけではありません。

## 行列の読み方

最初はInspectorの **Matrix Size = 3×3** を使います。画面には常に7×7の入力欄が表示されますが、3×3では中央の9マスだけが有効です。中央は現在処理している画素、その上下左右と斜めは隣接する画素を表します。

```text
左上  上   右上
左    中央 右
左下  下   右下
```

各マスに入れる数字を**係数（weight）**と呼びます。1ならその位置の画素を計算に使い、0なら使いません。大きい正の数は寄与を強め、負の数は引く方向へ作用します。**21.1マニュアルでは整数だけを入力可能**と記載されているため、0.5などの小数を前提にしたレシピは使いません。

### 例1：画像を変えない行列

```text
 0  0  0
 0  1  0
 0  0  0
```

中央だけを使います。まずこの設定で元画像と結果が一致するか確認すると、入力チャンネルや後述のNormalize、Floor Levelが変わっていないかを見分けやすくなります。21.1マニュアルにも示された基本例です。

### 例2：近傍画素で柔らかくする

```text
 1  1  1
 1  1  1
 1  1  1
```

中央と周囲8画素を使い、近くの色を平均することで細かな変化を和らげる設定です。マニュアルのSoftening作例に対応します。輪郭まで柔らかくなりすぎる場合は、元画像と比較した上で別の行列や[Blur](./blur)を検討します。

### 例3：斜め方向の凹凸を強調する

```text
-5  0  0
 0  1  0
 0  0  5
```

左上の画素の値を引き、右下を加えるため、均一な場所よりも**斜め方向に画素値が変わる境界**で差が出ます。文字、模様、質感の凹凸を浮き上がらせたいときの出発点です。これもマニュアルのEmboss作例です。

### 例4：Relief用の差分を作る

```text
-1  0  0
 0  0  0
 0  0  1
```

左上と右下の差を利用するため、平坦な部分の結果は小さくなりやすい行列です。マニュアルでは、ここで**Floor Levelを正の方向へ調整**してRelief風の画像にする例が掲載されています。Floor Levelだけを上げる操作と、行列自体で差分を作る操作は別です。

### 行列を大きくするとどうなるか

**Matrix Size** は **3×3、5×5、7×7** から選びます。5×5や7×7では、中央からより離れた画素も参照できます。広い範囲でぼかしたり、輪郭の周りの影響を大きくしたりできますが、参照画素数が増えるため処理も重くなります。

まず3×3で意図した結果を作り、範囲を広げたい理由があるときだけサイズを上げます。3×3の値を変えずにサイズだけ大きくしても、新たに有効になったマスの係数がどう設定されているかで結果が変わります。

## Inspectorで確認する項目

### Color Channels（RGBA）

R・G・B・Aのチェックで、**行列処理を実行するチャンネル**を選びます。透過素材の色だけを加工したいなら、Aのチェックを外してAlphaを保つ方向から試せます。一方、アルファ境界そのものを加工したいならAの扱いを確認してください。

これは共通SettingsにあるRGBA設定とは異なります。21.1マニュアルによると、**Custom FilterのColor Channelsは処理前**に判定され、外したチャンネルは処理を省略します。共通コントロール側のRGBA指定は**処理後**に適用されます。

### Normalize

**Normalize = 0** は、21.1マニュアルで「正規化された画像を得る」設定として説明されています。正方向へ動かすと結果が明るくなり、負方向へ動かすと暗くなります。

これは単純な「オン／オフ」のスイッチではありません。また、係数の総和を何で割るかという内部計算式や、全ての行列での数値結果までマニュアルが保証しているわけではありません。まず0を基準に見た目を確認します。

### Floor Level

**Floor Level = 0** では結果にオフセットを加えません。正の値はフィルター結果を明るい側へ、負の値は暗い側へ移動させます。

名前にFloorが入っていますが、本記事では「暗部を自動検出して一定値で切り捨てる閾値」とは扱いません。特に差分を使うRelief行列では、行列の効果を作ってからFloor Levelで明るさの基準を調整します。

### Update Lock

複数のマスを書き換える途中は **Update Lock** をオンにすると、フィルターのレンダリングを止められます。行列を設定し終えたら**オフに戻し、結果を再描画**します。オンのままだと、入力した数値に対応する見た目を確認できません。

### 用意された設定を読み込む

21.1マニュアルには、Fusionの**Filtersディレクトリ**に用意されたCustom Filter設定を使う方法も記載されています。コントロールのヘッダーを右クリックし、**Settings > Load** から読み込みます。場所や収録ファイルはインストール環境によって確認してください。

## 実際の制作例

### 1. 実写背景の細かな模様を少しなだらかにする

1. 背景映像をInputへつなぎ、Matrix Sizeを3×3にします。
2. 例2の9マスすべてを1にし、Normalizeを0、Floor Levelを0にして結果を確認します。
3. Viewerで文字、髪、物体の境界を拡大して見比べます。必要なディテールまで消えるなら、元画像へ戻して[Blur](./blur)の小さなサイズから調整する方法も比較します。

この例では周囲の**色を混ぜること**が目的です。ノイズの発生源を解析したり、動くノイズだけを識別したりする処理ではありません。

### 2. 透過ロゴの輪郭に浮き彫りの陰影を足す

1. ロゴ画像をInputへつなぎ、例3の斜め方向の行列を入力します。
2. ロゴのAlphaが必要なら、Color ChannelsのAを外す設定と元のAlphaの見え方を比較します。
3. 陰影の出方を確認し、色やアルファ境界が不自然なら、元画像の枝を別に残してMergeで加工画像と組み合わせます。

印刷のエンボスのような陰影は作れますが、実際の3D形状や光源を生成する処理ではありません。行列で参照した画素の明暗差が見た目を決めます。

### 3. 顔は保ったまま背景だけを加工する

```text
MediaIn ───────→ Custom Filter ───→ MediaOut
                        ↑
                Polygon（Effect Mask）
```

人物の顔を避けて背景部分のマスクを作り、青いEffect Maskへつなぎます。行列は例2や例3など目的に合わせて選びます。マスクの境界が見える場合は、[マスクの基本](../../learn/02-data/mask)に戻って輪郭と柔らかさを調整します。

## 他のノードとの使い分け

- [Filter](./filter)：Sobel、Laplacian、Grainなど、用意された処理をFilter Typeから選びたいとき。
- [Blur](./blur)：係数を1マスずつ設定せず、ぼかしの量や種類を直接調整したいとき。
- [Sharpen](./sharpen) / [Unsharp Mask](./unsharp-mask)：輪郭の強調量やThresholdなどを目的に合わせて操作したいとき。
- [Rank Filter](./rank-filter)：近傍の画素を値の順位で選び、孤立した点を抑えたり表面を単純化したりしたいとき。

## うまくいかないとき

- **係数を変えても表示が更新されない**：Update Lockがオンのままになっていないか確認します。
- **全体が予想より明るい／暗い**：行列だけでなくNormalizeとFloor Levelを確認します。Floor Levelを0へ戻すと、差分行列の効果を見分けやすくなります。
- **透過の縁が変わった**：Color ChannelsのA、元画像のAlpha、Effect Maskをそれぞれ確認します。
- **3×3から7×7へ変えたら別の見た目になった**：新たに有効になった周囲のマスの値を確認します。
- **特定の場所だけ変えたい**：Effect Maskの接続先が青い入力か、マスクの白黒と境界が意図どおりかを確認します。
- **最初の設定へ戻したい**：例1の中央だけ1の行列で、画像経路とNormalize／Floor Levelを切り分けます。

## 実機例：中央だけ1の行列を基準にする

<!-- capture-case:S69 -->

Resolve Studio21.1.0.14／WindowsのFusionページで、1920×1080の固定チャートを接続しました。通常の比較は両Viewer Color／40%です。内部REGIDは`CustomFilter`でした。3×3の中央だけを1、周囲8マスを0へ編集し、NormalizeとFloor Levelを0にしました。

[![LoaderからCustomFilter1、MediaOut1へ接続した実機Node Editor](/img/fusion/captures/S69/graph.png)](/img/fusion/captures/S69/graph.png)

[![中央だけ1、周囲0の3×3行列とNormalize0、Floor Level0のInspector](/img/fusion/captures/S69/inspector.png)](/img/fusion/captures/S69/inspector.png)

[![中央だけ1の行列では40%の左右Viewerに同じチャートが見える](/img/fusion/captures/S69/compare.png)](/img/fusion/captures/S69/compare.png)

両Viewerを100%へ変えた状態でも、文字と色パッチが同じように表示されます。下は実機Viewerの倍率を変えて撮影した画像で、crop時の拡大はしていません。画素値をexportして完全一致を測定した結果ではありません。

[![両Viewer100%で、中央だけ1の行列が入力の文字と色パッチを保つ](/img/fusion/captures/S69/detail.png)](/img/fusion/captures/S69/detail.png)

この行列を保ってFloor Levelだけを0.25へ上げると、暗部を含めて明るさが持ち上がりました。

[![中央だけ1の行列を保ちFloor Levelを0.25にしたInspector](/img/fusion/captures/S69/floor025-inspector.png)](/img/fusion/captures/S69/floor025-inspector.png)

[![Floor Level0.25では右の暗部を含めて明るさが持ち上がる](/img/fusion/captures/S69/floor025.png)](/img/fusion/captures/S69/floor025.png)

Floor Levelを0へ戻し、Normalizeだけを0.5へ上げた例です。明部や色パッチが明るくなり、黒いパッチは残っています。2つの設定を同時に変えた比較ではありません。

[![Floor Level0へ戻しNormalizeだけ0.5にしたInspector](/img/fusion/captures/S69/normalize05-inspector.png)](/img/fusion/captures/S69/normalize05-inspector.png)

[![Normalize0.5では右の明部や色パッチが明るくなり、黒いパッチは残る](/img/fusion/captures/S69/normalize05.png)](/img/fusion/captures/S69/normalize05.png)

最後は中央だけ1の行列／Normalize0／Floor Level0／40%へ復元して保存しました。負の係数を使うEmbossとRelief、5×5／7×7、Update Lock、プリセット、Alpha境界、Mask、内部の正規化式と性能は未確認です。

[再現用Graph](/img/fusion/captures/S69/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S69/capture.json)

## バージョンと根拠

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 99「Filter Nodes」、**pp.2332–2336**。[Blackmagic Design公式サポート](https://www.blackmagicdesign.com/jp/support/)。

行列の仕様、3×3／5×5／7×7、整数係数、入出力、RGBA、Update Lock、Normalize、Floor Level、4つの行列例、Settings > Loadの経路は同マニュアルで確認しました。制作手順はその仕様から組み立てた例です。S69で内部REGID、中央だけ1の3×3行列と40%／100%表示、Floor Level0.25、Normalize0.5を確認しました。数値export、内部の正規化式、全初期値、Edition差、プリセットの収録内容は未確認のため、verificationはpartialとしています。
