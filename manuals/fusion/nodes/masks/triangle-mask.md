---
title: Triangle Mask
description: 3つの頂点を個別に動かせる三角形Mask。画像処理への接続、Inspector、追従と合成の使い方を説明。
doc_type: node
term_id: triangle-mask
verification: partial
aliases: [Triangle Mask, Tri]
concepts: [mask-data, tracking]
nodes: [Triangle Mask]
node_family: masks
controls: [Show View Controls, Level, Filter, Soft Edge, Border Width, Paint Mode, Invert, Solid, Point 1, Point 2, Point 3]
inputs: [mask]
outputs: [mask]
tasks: [create-mask, triangle, tracked-corners]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Triangle Mask

Triangle Maskは、3つの頂点を結んで三角形の範囲を指定するMaskノードです。映像を三角形に変形するノードではありません。出力するのは**どの画素へ効果を適用するか**を示す単一チャンネルのMaskで、Blurなどの画像処理やBackgroundの描画範囲の指定に使います。

[Rectangle Mask](./rectangle-mask)のようなCenter・Size・Angleの一括操作はなく、**Point 1、Point 2、Point 3をそれぞれ動かす**のが特徴です。3点を別々にトラッキング結果やアニメーションへ結び付けられるため、移動する物体の一部分に合わせて三角形を変形できます。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| **Effect Mask（青、任意）** | 別のMask | 入力MaskとTriangle Mask自身の領域を組み合わせる |
| **出力** | 単一チャンネルのMask | 後段のEffect Maskなどへ適用範囲を渡す |

Triangle Maskへ2D画像を直接入力する必要はありません。例えば、映像の一部分だけをぼかす場合は次のように接続します。

```text
MediaIn ──────────────→ Blur ───────────→ MediaOut
                         ↑ Effect Mask
                     Triangle Mask
```

三角形の内側が白、外側が黒のMaskなら、**Blurが適用されるのは白い範囲**です。境界をSoft Edgeでぼかすと、その間はグレーになり、効果の強さが段階的に変わります。Mask自体が映像をぼかしたり、完成したRGBA画像を出力したりするわけではありません。[Maskの基礎](../../learn/02-data/mask)も参照してください。

## 三角形を編集する

ViewerにTriangle Maskのコントロールを表示し、3つの頂点を配置します。Inspectorの**Point 1、Point 2、Point 3**には、それぞれの位置座標が表示されます。

1. 画像をViewerで確認しながらTriangle Maskを選択します。
2. Viewerで頂点を移動し、囲いたい領域へ合わせます。Inspectorから各Pointの位置を数値調整することもできます。
3. 位置を動かす代わりに、必要なPointへアニメーションやトラッカーの位置情報を割り当てることもできます。
4. マスクをViewerに表示し、輪郭が対象を覆っているか確認します。

**Show View Controls**を無効にすると、ノード選択中でもViewerの操作ハンドルが表示されなくなります。形が消えたように見えるときは、表示設定とMask出力の両方を確認してください。

### Pointごとに別の動きを与える

各Pointは、Inspectorの**Position**コントロール、またはViewer上の点を右クリックして、Path・Tracker・他のControlとの接続や公開を設定できます。ここで接続するのは**位置パラメータ**です。Trackerノードの画像出力をTriangle Maskの青いEffect Mask入力へ入れるという意味ではありません。

例えば、板に貼られた三角形のマークを追跡する場合、板の3か所を追う位置情報をPoint 1〜3へ割り当てます。板が回転して各頂点の距離が変わっても、3つの位置を別々に更新できます。ただし、3点のトラッキングが適切かどうかは素材と追跡方法に依存するため、フレーム間で輪郭のずれを確認してください。

## Inspectorの主要設定

| 設定 | 働き |
| --- | --- |
| **Point 1 / 2 / 3** | 三角形の3頂点の位置を設定する |
| **Show View Controls** | Viewer上の頂点操作などの表示を切り替える |
| **Level** | Mask値を弱める。値を下げると適用される効果も弱くなる |
| **Soft Edge** | Maskの境界をぼかし、硬い輪郭から滑らかな境界へ変える |
| **Filter** | Soft Edgeの計算方法を選ぶ |
| **Border Width** | 塗りつぶした輪郭の広がり、または輪郭線の太さを調整する |
| **Solid** | 有効なら内側を塗る。無効なら輪郭線だけのMaskにする |
| **Invert** | 完成したMask全体の白黒を反転する |

Filterには**Box、Bartlett、Multi-box、Gaussian**があります。Multi-boxを選ぶと、処理回数を変える**Num Passes**が表示されます。輪郭合わせの段階ではSoft Edgeを小さくし、位置を決めてからぼかしを加えると調整しやすくなります。

Solidを無効にすると、三角形の内側は塗られず、**Border Widthで指定した幅の輪郭**をMaskとして使います。線状の光や縁取りを作りたい場合に利用できます。

## 複数のMaskを組み合わせる

青いEffect Mask入力に別のMaskをつなぐと、**Paint Mode**で入力MaskとTriangle Maskの重ね方を指定できます。

| Paint Mode | 結果 |
| --- | --- |
| **Merge / Add** | Maskを統合する／Mask値を加える |
| **Subtract** | 入力Maskから三角形の重なる部分を差し引く |
| **Minimum / Maximum** | 2つのMask値の小さい方／大きい方を使う |
| **Average / Multiply** | 平均／積を使う |
| **Replace** | 重なる領域で入力Maskを三角形側の値に置き換える |
| **Invert** | 三角形が重なる入力Maskの部分だけを反転する |
| **Copy / Ignore** | 入力Maskを捨てる／三角形側を無視する |

**Paint ModeのInvert**は入力Maskとの合成方法です。共通の**Invertチェックボックス**は、Mask全体を白黒反転します。どちらを変えているか区別してください。詳細は[Maskカテゴリ概要](./index)を参照してください。

## 具体的な運用例

### 色付きの三角形を作る

1. Backgroundで必要な解像度と色を持つ画像を作ります。
2. Triangle Maskの出力をBackgroundの**Effect Mask入力**へ接続します。
3. Viewerで3点を配置し、三角形だけが表示される状態にします。
4. 合成する場合は、Backgroundの画像出力をMergeのForegroundへ渡します。

```text
Background ───────────→ Merge（Foreground）→ MediaOut
    ↑ Effect Mask          ↑ Background
Triangle Mask           別の映像
```

この構成では、色を決めるのはBackgroundで、表示する形を決めるのはTriangle Maskです。例えば画面内に小さな三角形の案内記号を描く際に使えます。

### 動く三角形の領域だけをぼかす

映像をBlurへ入力し、Triangle MaskをBlurのEffect Maskへ接続します。物体上の3点を別々に追跡し、それぞれの位置情報をPoint 1〜3へ割り当てれば、物体が動く間もぼかす領域を追従させられます。

Maskを通るのは位置指定の結果だけで、映像の画像データはMediaInからBlurへ流れます。追跡がずれるフレームではPointのアニメーションを補正するか、より自由な輪郭を描ける[Polygon Mask](./polygon-mask)へ切り替えます。

### 既存のMaskから三角形だけを除く

広い[Ellipse Mask](./ellipse-mask)をTriangle Maskの青い入力へつなぎ、Paint Modeを**Subtract**にします。Triangle Maskが重なる場所だけが入力Maskから差し引かれ、残りの領域へBlurなどの効果を適用できます。三角形の位置を動かしても、元の楕円は維持されます。

## 他のMaskとの使い分け

- [Rectangle Mask](./rectangle-mask)：矩形をCenter・Width・Height・Angleでまとめて調整したい場合。
- [Polygon Mask](./polygon-mask)：3点では足りない輪郭や、局所的な曲率を調整したい場合。
- [B-Spline Mask](./b-spline-mask)：少ない制御点で滑らかな輪郭を作りたい場合。

Triangle Maskは**3つの位置を独立して操作する用途**に適しています。任意形状を細かく追う場合や曲線の境界が必要な場合は、Polygon／B-Spline系が適します。

## バージョン・出典・未確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）Chapter 108「Mask Nodes」pp.2493–2496を基に、Effect Mask入力、Point 1〜3、Show View Controls、Filter、Paint Mode、Invert、Solid、位置の追従を確認しました。

Manualの**[Tri]**はUI上の略号であり、内部REGIDを示すとは限りません。Pointの内部ID、各パラメータの値域、Free／Studio差や実機ごとのトラッカー接続手順までは検証していないため、`verification: partial`です。
