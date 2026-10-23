---
title: Texture (Deep Pixel)
description: レンダリング済み画像のUV座標を使い、3Dオブジェクトの模様やロゴを2D合成の段階で差し替える方法。UVパスの読み込み、接続例、範囲の制限も解説。
doc_type: node
term_id: texture-deep-pixel
term_short: レンダリング済み画像に記録されたUV座標を読み、別画像の模様を物体の表面へ貼り直す2Dノード。
verification: partial
aliases: [Texture, Txr, Texture (Deep Pixel)]
concepts: [auxiliary-channels, image-data, uv]
nodes: [Texture]
node_family: deep
controls: [Flip Horizontal, Flip Vertical, Swap UV, Rotate 90, U Scale, V Scale, U Offset, V Offset]
inputs: [image, image, mask]
outputs: [image]
tasks: [aov, texture-replace, uv]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Texture (Deep Pixel)

Textureは、3Dシーンを画像にした**後から**、物体の表面に見える模様を差し替えるノードです。例えば、3Dの看板に貼ったロゴを別の画像へ変更したり、3D文字の表面に別の柄を表示したりできます。

この処理には、画像の各画素が「元の3D物体の表面のどの位置を表すか」を示す**UV座標**が必要です。Uはテクスチャ画像の横方向、Vは縦方向の位置を表します。通常のRGB画像にはこの情報が残っていないため、<Term id="auxiliary-channels">補助チャンネル（AOV）</Term>としてUとVを持つ画像を入力します。**UV座標がなければTextureを接続しても模様は置き換わりません。**

名前に「Deep Pixel」とありますが、処理対象はUVを含む<Term id="image">2D画像</Term>です。画素の奥に複数の深度サンプルを保存するDeep Imageを入力するノードではありません。

## 役割と主な用途

Textureは、入力画像のUV座標を手がかりに、**別画像のどの部分を各画素へ表示するか**を決めます。3Dモデル自体の形状やUV展開を変更するわけではありません。

- **看板やパッケージの柄を差し替える**：3Dシーンを再レンダリングせず、ロゴやラベルの候補を比較する。
- **3D文字の表面を変更する**：同じ形状・カメラ構図を保ったまま、文字に貼る画像だけを切り替える。
- **貼り付け位置を微調整する**：UVの向き・拡大率・位置を変え、模様の上下左右や見える大きさを調整する。
- **特定の物体にだけ新しい柄を適用する**：Alphaや物体IDから作ったマスクを使い、背景や他の物体を変えない。

## 入力と出力

| 端子 | 受け取るもの | 役割 |
| --- | --- | --- |
| **Input**（オレンジ） | U・V補助チャンネルを持つ2D画像 | 元の3Dレンダリング結果。画素ごとの貼り付け位置を供給する |
| **Texture**（緑） | 2D画像 | 新たに貼る模様・写真・ロゴを供給する |
| **Effect Mask**（青、任意） | マスク | 置き換えを適用する画素を制限する |
| **出力** | 2D画像 | UVを参照して模様を割り当てた画像。後段のMergeなどへ接続する |

緑入力へ接続するのは**UV座標ではなく、新しく表示したい画像**です。UV座標はオレンジ入力に接続した画像の補助チャンネルから読み取ります。Effect Maskは画像の一部に処理結果を適用するためのもので、UV座標そのものを作る機能ではありません。

## 最小構成：3D文字の模様を変更する

~~~text
Text 3D ──────┐
Camera 3D ────┼→ Merge 3D → Renderer 3D（RGBA + TexCoord）─→ Texture ─→ 出力
Light ────────┘                                                ↑ 緑入力
新しい模様の画像 ───────────────────────────────────────────────┘
~~~

1. Text 3D・Camera 3D・必要なライトをMerge 3Dにつなぎ、[Renderer 3D](../3d/renderer-3d.md)で2D画像にします。
2. Renderer 3Dの**Output Channels**で**TexCoord（UV）**を出力します。RGBAに加えて画素ごとのテクスチャ座標を残すためです。
3. Renderer 3Dの出力をTextureの**オレンジ入力**へ接続します。
4. 新しい柄やロゴをTextureの**緑入力**へ接続します。
5. TextureをViewerで確認します。最初は格子や矢印の付いた模様を使うと、上下反転・90°の回転・位置ずれを見つけやすくなります。
6. 必要に応じてFlip・Swap UV・Scale・Offsetを調整します。

UV座標を持つレンダリング結果なら、文字以外の物体でも基本の接続方法は同じです。ただし、元の3D形状に利用できるUVが設定されていることが前提です。

## 外部EXRなどのUVパスを使う

別の3Dソフトから出力した画像も、UVパスが保存されていれば利用できます。UVをRGBとして表示できるだけでは不十分で、**FusionのU・V補助チャンネルへ割り当てる**必要があります。

1. **MediaIn**または**Loader**で、カラー画像とUVパスを含む素材を読み込みます。
2. **Channels**または**Format**タブで、UVパスのU成分をU補助チャンネル、V成分をV補助チャンネルに割り当てます。
3. 読み込みノードの出力をTextureのオレンジ入力へ、新しい柄を緑入力へ接続します。
4. Viewerで柄が物体の面に沿って表示されるか確認します。変化しなければUVの割り当てを確認します。

**UVだけが別のRGB画像として書き出されている場合**は、[Channel Booleans](../color/channel-boolean.md)でU・V補助チャンネルへ移せます。21.1マニュアルの例では、UV画像の**RedをU、GreenをV**に割り当てます。カラー画像のRGBAは保持し、UV成分だけを追加します。

~~~text
元のカラー画像（RGBA） ───────────────┐ Background
UVパス画像（Red=U, Green=V） ────────┤ Foreground
                                     ↓
                              Channel Booleans（RGBA + U/V）
                                     ↓ オレンジ入力
新しい柄の画像 ────────────────→ Texture ─→ 出力
                                  ↑ 緑入力
~~~

UVパスとカラー画像の画角・解像度・フレームが一致しないと、模様がずれて貼られます。

## 主な設定項目

設定はInspectorの**Texture**タブにあります。

| 設定 | 変わること | 確認しやすい例 |
| --- | --- | --- |
| **Flip Horizontal** | 貼る画像を左右反転する | ロゴが鏡文字になっていないか |
| **Flip Vertical** | 貼る画像を上下反転する | 矢印の上下が逆でないか |
| **Swap UV** | 読み取るU座標とV座標を交換する | 横方向と縦方向が入れ替わる |
| **Rotate 90** | 貼る画像を90°回転する | 横長のラベルを縦向きにする |
| **U Scale / V Scale** | 貼り付けに使う座標の拡大率を変える | 格子の横幅・縦幅が変化する |
| **U Offset / V Offset** | 貼り付けに使う座標を横・縦へずらす | ロゴが表面上を移動する |

Scaleは物体を拡大縮小する操作ではなく、**画像のどの位置を参照するか**を変える設定です。Offsetも形状やカメラを移動するのではありません。Flip・Swap UV・Rotate 90は似ていますが動作が異なるため、まず向きを直してからScaleとOffsetを調整します。

## 元の画像と新しい模様を合成する

処理前後を比較しながら一部だけ差し替えたい場合は、元画像から分岐させたTextureの結果を、通常の2D **Merge**で重ねます。

~~~text
元の画像（RGBA + U/V） ───────────────→ Merge（Background）─→ 出力
            └─────────→ Texture ─────→ Merge（Foreground）
                           ↑
                     新しい柄の画像
~~~

Mergeの**Apply Mode**、**Alpha Gain**、**Blend**を用途に応じて調整すると、元の見た目と新しい模様の組み合わせを検討できます。これは21.1マニュアルのUV活用例に基づきます。全面置換か一部合成かに応じて設定を選びます。

## 挙動と注意点

### 背景に模様の端の色が出る

背景画素のUVが**U=0、V=0**の場合、Textureはテクスチャ画像の隅を参照し、背景にその色が現れることがあります。物体のAlpha、Object ID、Material IDなどからマスクを作り、TextureのEffect Maskへ接続して対象を限定します。ID情報を利用する場合は元画像に保存されているか先に確認します。

### 境界で模様が不自然になる

異なる面のUVを境界画素で平均すると、存在しない中間座標が生じて模様の色が混ざる場合があります。[Renderer 3D](../3d/renderer-3d.md)の補助チャンネル用アンチエイリアスでは、**TexCoordのアンチエイリアスを無効にすることが強く推奨**されています。RGBAの輪郭を滑らかにする設定とは分けて確認してください。

### 影や反射まで再レンダリングする機能ではない

Textureはレンダリング後の2D処理です。3Dシーンのライト、物体形状、カメラ、隠れた面を新しく計算しません。反射や陰影を含めて再計算したい場合は、レンダリング前の3D Material側でテクスチャを変更します。

## 関連Node・概念

- [補助Channel / AOV](../../learn/02-data/auxiliary-channels.md)：UVとRGBA・Z・Normalなどの違い。
- [Renderer 3D](../3d/renderer-3d.md)：Classic 3DからTexCoord付き2D画像を出力する。
- [Channel Booleans](../color/channel-boolean.md)：別画像のRed・GreenをU・Vへ割り当てる。
- [Shader (Deep Pixel)](./shader-deep-pixel.md)：UVではなくNormalを使い、後処理で照明・反射を調整する。

## 出典と検証状況

一次資料：**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』**。

- **Chapter 96「Texture [Txr]」、pp.2266–2268**：UV要件、入力、Flip / Swap UV / Rotate 90 / Scale / Offset、背景画素の注意点。
- **Chapter 77「Understanding Image Channels」、p.1693**：MediaIn / LoaderでのUVパスの割り当て、Red→U・Green→V、Mergeで元画像と合成する例。
- **Chapter 88「Renderer3D」、pp.1974–1975**：TexCoordの出力と補助チャンネルのアンチエイリアス。

入力名・設定名・例の根拠は21.1マニュアルにあります。外部EXRの個別形式や21.1実機・GPU差は未検証のため、**verification: partial**を維持します。
