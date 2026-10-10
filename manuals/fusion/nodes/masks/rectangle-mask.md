---
title: Rectangle Mask
description: 長方形・角丸矩形のマスクを作り、効果の適用範囲や図形の輪郭を制御するFusionノード。接続、角丸、縁、マスクの合成を解説。
doc_type: node
term_id: rectangle-mask
term_short: 長方形や角丸矩形の範囲を作り、別ノードのEffect Mask入力へ渡せるマスクノード。
verification: partial
aliases: [Rectangle Mask, Rec]
concepts: [mask-data]
nodes: [Rectangle Mask]
node_family: masks
controls: [Show View Controls, Level, Filter, Soft Edge, Border Width, Paint Mode, Invert, Solid, Center, Width, Height, Corner Radius, Angle]
inputs: [mask]
outputs: [mask]
tasks: [create-mask, rectangle, rounded-rectangle, isolate-effect]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Rectangle Mask

Rectangle Maskは、映像上に長方形や角丸の長方形を置き、その内側を**効果が適用される範囲**として指定するノードです。例えば、画面の右上だけをぼかしたり、背景色から四角い図形を切り出したりできます。

ここで作るのは色付きの画像ではなく、白・黒・グレーの値で範囲を示す**マスク**です。白は効果が強くかかる領域、黒はかからない領域、グレーは部分的にかかる領域を表します。基本は[Maskの概念](../../learn/02-data/mask)を参照してください。

Paint内の[Rectangle描画要素](../paint/rectangle)は入力画像そのものに矩形を描きます。一方、Rectangle Maskは独立したFlowノードで、ほかのノードに渡すマスクを出力します。名前が似ていても接続先と用途が異なります。

## 入力と出力

| 端子 | データ | 用途 |
| --- | --- | --- |
| **Effect Mask（青、任意）** | 別のMaskノードからのマスク | 既存のマスクとRectangle Maskの矩形を組み合わせる |
| **出力** | 単一チャンネルのマスク | BlurやBackgroundなど、マスクを受け付けるノードのEffect Mask入力へ渡す |

画像を受け取るオレンジ色の入力はありません。Rectangle Maskだけで四角形の範囲を作り、その出力を別のノードへ接続します。

例えば、映像の一部分だけをぼかす場合は次の接続になります。

~~~text
MediaIn ─────────→ Blur ─────────→ MediaOut
                    ↑ Effect Mask
              Rectangle Mask
~~~

Blurには加工対象の映像を入力します。Rectangle Maskは「映像のどの部分をぼかすか」だけを指定するため、矩形の位置を動かしても映像そのものの位置は変わりません。

## 矩形の作り方と位置・形

Rectangle Maskを選択し、Viewer上に表示される四角形のハンドルを動かすか、InspectorのControlsで値を調整します。

| 設定 | 変わるもの |
| --- | --- |
| **Center X / Y** | 矩形の中心位置 |
| **Width / Height** | 横幅・縦幅。片方だけ変更して細長い帯も作れる |
| **Corner Radius** | 四隅の丸み。0.0は角が直角、1.0は最大の丸み |
| **Angle** | 矩形全体の回転角度 |
| **Show View Controls** | Viewerのハンドル表示を切り替える。マスクの画像自体を消す設定ではない |

作成直後の矩形はコンポジションと同じ縦横比です。WidthとHeightを別々に変えられるので、字幕の背景になる横長の帯や、画面端にある縦長の対象にも合わせられます。

Corner Radiusはマスクの形状そのものを角丸にします。単にSoft Edgeでぼかした場合とは異なり、角の形を保ったまま輪郭を決められます。

## 内側を塗るか、輪郭だけを使うか

**Solid**が有効なら矩形の内側がマスクになります。無効にすると内部は塗られず、縁だけがマスクになります。その縁の太さは**Border Width**で調整します。

輪郭だけに発光やぼかしをかけたいときは、Solidを無効にしてBorder Widthを調整します。逆に画面内の一定範囲をまるごと加工するなら、Solidを有効にして使うのが基本です。

**Level**はマスクの値を弱めます。例えばBlurのEffect Maskとして使い、Levelを下げると、矩形内でのぼかしの適用量を抑えられます。下流のBlur自体の強さを変えるのとは別の調整です。

**Soft Edge**は境界をぼかして、矩形とその外側の効果の切り替わりを滑らかにします。0.0なら硬い縁です。**Filter**では、Soft Edgeに使う計算方法をBox、Bartlett、Multi-box、Gaussianから選べます。Multi-boxではNum Passesが表示されます。柔らかい境界が必要なときに、仕上がりと処理量を見ながら選びます。

## ほかのマスクと組み合わせる

別のMaskノードの出力をRectangle Maskの青いEffect Mask入力へつなぐと、Inspectorに**Paint Mode**が現れます。これは、入力した既存マスクと、Rectangle Mask自身が作る矩形をどう合成するか決める設定です。

| Paint Mode | 動作 |
| --- | --- |
| **Merge（初期値）** | 新しい矩形マスクを入力マスクへ重ねる |
| **Add / Subtract** | 値を加算する／重なる範囲で新しいマスクの値を差し引く |
| **Minimum / Maximum** | 2つのマスク値の小さい方／大きい方を採用する |
| **Average / Multiply** | 2つのマスク値の平均／積を使う |
| **Replace** | 新しい矩形が重なる領域を置き換える。新しいマスクの値が0の部分は入力側を変えない |
| **Invert** | 新しい矩形と重なる入力マスクの領域を反転する |
| **Copy / Ignore** | 入力マスクを捨てて矩形だけ使う／矩形を捨てて入力だけ使う |

例えば、人物を囲む既存の[Polygon Mask](./polygon-mask)から、画面に入り込んだ四角い看板の領域だけを除きたいとします。Polygon MaskをRectangle Maskの青い入力へつなぎ、Rectangle Maskを看板に合わせて**Paint Mode = Subtract**にします。出力は、元の人物マスクから看板に相当する範囲を引いたものになります。

~~~text
Polygon Mask ──→ Rectangle Mask（Paint Mode: Subtract）
                       ↓
                   Effect Mask
~~~

**Invertチェックボックス**は、合成後のマスク全体を反転します。上表のPaint ModeにあるInvertは、2つのマスクの重なる部分に働く演算なので、同じ設定ではありません。複数マスクの演算が分かりにくいときは、Rectangle Maskの出力をViewerに表示し、白黒の範囲を直接確認してください。

## 運用例

### 画面の右上だけをぼかす

1. `MediaIn → Blur → MediaOut` と接続し、映像全体にBlurが作用することを確認します。
2. Rectangle Maskを追加して、Blurの青いEffect Mask入力へつなぎます。
3. ViewerでRectangle Maskを右上へ移動し、WidthとHeightで必要な範囲を囲みます。
4. Soft Edgeを少し上げ、ぼかしの境界が急に切り替わらないよう調整します。Blurの強さはBlur側で決め、適用範囲はRectangle Mask側で調整します。

### 角丸の色付きパネルを作る

1. [Background](../generators/background)でパネルに使う色を作ります。
2. Rectangle MaskをBackgroundのEffect Mask入力へ接続します。Backgroundの色は矩形マスクの内側にだけ現れます。
3. Corner Radiusで四隅を丸め、必要ならSoft Edgeを調整します。
4. Backgroundの出力をMergeのForegroundへ、背景映像をMergeのBackgroundへ入れて重ねます。

~~~text
Rectangle Mask ─→ Background（色） ─→ MergeのForeground
映像 ─────────────────────────────→ MergeのBackground
Merge ─→ MediaOut
~~~

この場合、Rectangle Maskだけで色が生まれるわけではありません。色はBackgroundが作り、Rectangle Maskはその表示範囲を決めます。

## 関連ノードと選び方

[Ellipse Mask](./ellipse-mask)は円形や楕円形、[Polygon Mask](./polygon-mask)は人物などの不規則な輪郭に向きます。矩形で足りるならRectangle Maskを選んだ方が、Width、Height、Corner Radiusなどの意味が分かりやすく、後から調整しやすくなります。

[Bitmap Mask](./bitmap-mask)は入力画像のAlphaや輝度などから領域を作り、[Mask Paint](./mask-paint)は手描きで欠けたマスクを補修します。複数のマスクをどうつなぐかは[Maskカテゴリ概要](./index)を参照してください。

## バージョン・出典・未確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）Chapter 108「Mask Nodes」pp.2490–2493を基準にしています。Rectangle Mask [Rec]の入出力、Controls、Corner Radius、Soft Edge、Filter、Paint ModeとBackgroundを使った基本構成を確認しました。

`Rec`はマニュアル記載のSelect Tool用略号であり、内部REGIDと断定しません。21.1実機での個々の設定値、全Inspector項目、Free／Studio差は未確認のため、`verification: partial`を維持します。
