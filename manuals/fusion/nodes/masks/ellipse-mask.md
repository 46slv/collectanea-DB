---
title: Ellipse Mask
description: 円・楕円のマスクを作るFusionノード。画像との接続、幅・高さ・回転、境界、別マスクとの合成と具体例を解説。
doc_type: node
term_id: ellipse-mask
term_short: 円や楕円の形で、後段の効果を適用する範囲を指定するマスクノード。
verification: partial
aliases: [Ellipse, Ellipse Mask, Elp]
concepts: [mask-data, normalized-coordinates]
nodes: [Ellipse Mask]
node_family: masks
controls: [Show View Controls, Level, Filter, Soft Edge, Border Width, Paint Mode, Invert, Solid, Center, Width, Height, Angle]
inputs: [mask]
outputs: [mask]
tasks: [mask, circle, ellipse, isolate-effect]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Ellipse Mask

Ellipse Maskは、円や楕円の形で「映像のどこに処理をかけるか」を指定するノードです。最初は円形ですが、横幅・高さ・角度を別々に変えられます。人物の顔だけをぼかす、画面の一部だけ色を調整する、円形の色付き図形を作るといった場面で使います。

作るのは色付きの映像ではなく、白・黒・グレーで処理範囲を表す単一チャンネルの<Term id="mask">マスク</Term>です。白は効果を強く適用する領域、黒は適用しない領域、グレーは部分的に適用する領域を表します。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| **Effect Mask（青、任意）** | 別のマスク | 入力したマスクとEllipse Mask自身の円・楕円を組み合わせる |
| **出力** | 単一チャンネルのマスク | Blur、Background、Mergeなど、マスクを受け取るノードへ処理範囲を渡す |

Ellipse Maskには、通常のRGBA画像を加工するための画像入力はありません。加工したい映像は、効果を実行するノードへ入力します。

例えば、顔の周りだけをぼかすなら次の接続です。

~~~text
MediaIn ──────────────→ Blur ─────────→ MediaOut
                        ↑ Effect Mask
                    Ellipse Mask
~~~

BlurはMediaInの画像を処理し、Ellipse MaskはBlurの適用範囲を指定します。Ellipse Maskの出力をMediaOutへつないでも、カラー映像にはなりません。

## 位置と形を調整する

Ellipse Maskを選択してViewerに対象画像を表示し、円を被写体に重ねて調整します。主な設定はInspectorのControlsタブにあります。

| 設定 | 変わるもの | Viewerでの操作 |
| --- | --- | --- |
| **Center X / Y** | 円・楕円の位置 | 中心をドラッグして移動 |
| **Width** | 横方向の大きさ | 左右の端をドラッグ |
| **Height** | 縦方向の大きさ | 上下の端をドラッグ |
| **Angle** | 楕円の傾き | 点線の先にある回転用の小円をドラッグ |
| **Show View Controls** | 位置・形状を操作するハンドルの表示 | 無効にすると選択中でもViewerの操作表示が消える |

Viewerでは、縦横の端の間にある斜め方向の操作点を使うと、縦横比を保ちながら幅と高さを同時に変えられます。真円は回しても外形がほぼ変わらないため、Angleの効果は縦長・横長の楕円で確認すると分かりやすくなります。

位置や大きさを指定する際の座標の読み方は[正規化座標](../../learn/03-space/normalized-coordinates)も参照してください。

## 境界と強さを調整する

| 設定 | 作用 |
| --- | --- |
| **Solid** | 有効なら円・楕円の内側を塗ったマスク、無効なら輪郭線だけのマスクにする |
| **Border Width** | Solid無効時は輪郭線の太さ、Solid有効時はマスクの縁の広がり・縮まりを調整する |
| **Soft Edge** | 境界をぼかす。0.0では輪郭がはっきりする |
| **Filter** | Soft Edgeの計算方法を選ぶ |
| **Level** | マスクの値を下げ、効果の適用を弱める |
| **Invert** | マスク全体の白黒を反転する |

Filterには**Box、Bartlett、Multi-box、Gaussian**があります。Boxは処理が軽く、Gaussianは滑らかなぼかしを得やすい方式です。Multi-boxを選ぶと**Num Passes**が表示され、計算回数を調整できます。輪郭合わせはSoft Edgeを0にしてから行い、最後に必要な分だけぼかすと調整しやすくなります。

Levelを下げると、単に円の内側が薄く見えるだけではありません。別のマスクを重ねている場合、Ellipse Maskが覆う位置では、入力側に不透明な領域があっても最終マスク値が下がる場合があります。意図しない濃淡が出たら、LevelとPaint Modeの両方を確認してください。

## 別のマスクと組み合わせる

Ellipse Maskの青いEffect Mask入力へほかのマスクを接続すると、**Paint Mode**で合成方法を選べます。これは画像のMergeノードにあるForeground・Backgroundの合成ではなく、**2枚のマスク値をどう組み合わせるか**の設定です。

| Paint Mode | 入力マスクとEllipse自身のマスクの関係 |
| --- | --- |
| **Merge（初期値）** | 新しい楕円のマスクを入力マスクに重ねる |
| **Add / Subtract** | 値を足す／重なる領域で新しい楕円の値を引く |
| **Minimum / Maximum** | 画素ごとに小さい方／大きい方の値を採用する |
| **Average / Multiply** | 2つの値の平均／積を使う |
| **Replace** | 楕円と重なる部分を新しい値で置き換える。新しいマスク値が0の場所は入力を変えない |
| **Invert** | 楕円が覆う入力マスクの領域だけを反転する |
| **Copy / Ignore** | 入力を捨てて楕円だけ使う／楕円を捨てて入力だけ使う |

**Paint ModeのInvert**と**Invertチェックボックス**は別の機能です。前者は新しい楕円が重なる入力領域に作用し、後者は出力マスク全体を反転します。選択した演算の結果は、Ellipse Mask自体をViewerに表示して白黒の範囲を確認してください。ほかの形との選び分けは[Maskカテゴリ概要](./index)にまとめています。

## 運用例

### 顔の周囲だけをぼかす

1. MediaIn → Blur → MediaOutを接続し、Blurでぼかし量を決めます。
2. Ellipse MaskをBlurの青いEffect Mask入力へ接続します。
3. Centerを顔の中心へ移動し、WidthとHeightを顔より少し広めに合わせます。顔が傾いていればAngleも調整します。
4. Soft Edgeを増やして境界をなじませます。顔の移動に合わせて位置を変える場合は、途中のフレームでもマスクのずれを確認します。

この構成で変わるのは**Blurがかかる場所**です。Ellipse Maskは顔そのものを移動したり、映像から切り抜いて別の画像に変えたりするわけではありません。

### 色のついた円形パネルを重ねる

Ellipse Maskだけでは色は作れません。[Background](../generators/background)に色を指定し、その表示範囲をEllipse Maskで決めます。

~~~text
Ellipse Mask ─→ BackgroundのEffect Mask
                      ↓
                  MergeのForeground ─→ MediaOut
MediaIn ─────────→ MergeのBackground
~~~

Backgroundが色付きの画像を作り、Ellipse Maskが円形の部分だけを残します。円を細い枠にしたい場合はSolidを無効にしてBorder Widthを調整します。円の内側にテキストなどを配置するときも、色と形を別々に調整できます。

### 大きな処理範囲から円だけを除く

例えば、[Rectangle Mask](./rectangle-mask)で画面の右半分をぼかす範囲にした後、その中の丸いロゴだけはぼかしたくない場合です。

~~~text
Rectangle Mask ─→ Ellipse Mask（Paint Mode: Subtract）
                         ↓
                   BlurのEffect Mask
~~~

Rectangle MaskをEllipse Maskの青い入力へ接続し、Ellipse Maskをロゴに合わせて**Subtract**にします。入力した長方形から楕円と重なる部分が差し引かれ、Blurはロゴの周囲にだけかかります。

## 似たノード・注意点

[Rectangle Mask](./rectangle-mask)は四角形、[Polygon Mask](./polygon-mask)は任意のBézier輪郭、[B-Spline Mask](./b-spline-mask)は滑らかな自由曲線に向きます。楕円で十分な場合はEllipse Maskの方が少数の設定で位置と形を調整できます。

入力画像の明るさやAlphaからマスクを作りたい場合は[Bitmap Mask](./bitmap-mask)を使います。手描きでマスクを補修したい場合は[Mask Paint](./mask-paint)が候補です。[Paint](../paint/paint)内の楕円描画とは異なり、Ellipse Maskは独立したFlowノードです。

- [マスクの基本](../../learn/02-data/mask)
- [Maskで処理範囲を限定する](../../patterns/masking/limit-effect-with-mask)

## バージョン・出典・未確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 108「Mask Nodes」pp.2472–2475を基準にしています。Effect Mask入力、Ellipseの寸法と回転、境界のFilter、Paint Modeの各演算、Solid、Levelの注意点、Backgroundとの基本構成を確認しました。現行の21.1 Manualの配布元は[Blackmagic Design Support Center](https://www.blackmagicdesign.com/support)です。

マニュアルの**[Elp]**はSelect Toolで使う略号で、内部REGIDと同一とは断定しません。実機での細かな設定範囲・全ショートカット・Free／Studio差は未確認のため、verificationはpartialのままです。
