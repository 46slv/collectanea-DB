---
title: "Ribbon 3D"
description: "2点の間に1本または複数の細分化された3Dラインを作り、配置・太さ・分割数を調整するNode。"
doc_type: node
term_id: "ribbon-3d"
term_short: "Ribbon 3Dは、始点と終点を結ぶ3Dラインを生成し、本数・間隔・太さ・分割数を調整するNode。"
verification: partial
aliases: ["Ribbon 3D", "3Ri"]
concepts: ["classic-3d"]
nodes: ["Ribbon 3D"]
node_family: "3d"
controls: ["Number of Lines", "Line Thickness", "Subdivision Level", "Ribbon Width", "Start", "End", "Ribbon Rotation", "Anti-Aliasing"]
inputs: ["classic-3d", "image"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Ribbon 3D

Ribbon 3D [3Ri]は、**3D空間の2点を結ぶ線を生成する**Nodeです。1本だけでなく、同じ方向に並ぶ複数の線も作れます。線の両端・太さ・間隔・分割数を調整することで、光の筋、ワイヤー、稲妻のように曲がった線などを表現できます。

名前に「Ribbon」とありますが、生成するのは**細分化されたライン**です。幅のある面状のリボンメッシュだと考えると、Line ThicknessやRendererの挙動を誤解しやすくなります。

## 入力と出力

- **3D Scene（オレンジ、任意）**：追加の3D sceneまたはgeometryを接続できます。Ribbon 3D自身が線を生成するため、接続しなくても利用できます。
- **Material（任意）**：線に色を付ける2D画像を接続できます。たとえばGradientを与えると、線に色の変化を付けられます。
- **出力**：線を含む<Term id="classic-3d">Classic 3D scene</Term>を返します。画像ではないため、後段の[Renderer 3D](./renderer-3d.md)で2D画像として描画します。

**Renderer 3DをSoftware Rendererにした場合、Ribbon 3Dの線は表示されません。** 線の表示はOpenGLの機能に依存し、GPUによって線の太さや見た目が異なる場合があります。

## Inspectorの主な設定

### 線の本数と配置

- **Number of Lines**：始点と終点の間に描く平行な線の本数です。1本なら単独の線、増やすと並んだ線の集まりになります。
- **Ribbon Width**：複数の線の間隔を設定します。「各線の太さ」を変えるLine Thicknessとは異なります。
- **Start / End**：それぞれXYZ座標で線の始点と終点を指定します。移動すると線の長さ・向きが変わります。
- **Ribbon Rotation**：StartとEndを結ぶ仮想的な軸のまわりに線の並びを回転させます。

### 線の形と描画

- **Line Thickness**：線の太さを調整します。UI上は小数を指定できますが、GPUによっては整数の太さしか使えず、最小値・最大値にも制限があります。
- **Subdivision Level**：各線の頂点数を調整します。頂点を増やすと、後段の[Displace 3D](./displace-3d.md)で細かく曲げた形を作りやすくなります。Subdivision Levelを上げてもLine Thickness自体は変わりません。
- **Anti-Aliasing**：線のギザギザを抑える設定です。一方で線分の間に隙間が生じる場合があり、特に線が太いと目立つことがあります。問題が出たら切り替えて確認します。

## 運用例1：複数の光の筋を作る

1. Ribbon 3DのStartとEndで線の向きを決めます。
2. Number of LinesとRibbon Widthで本数・間隔を調整します。
3. 必要ならGradientなどの2D画像をMaterial入力に接続します。
4. Renderer 3Dで**OpenGL Renderer**を使用し、描画後の2D画像にGlowなどを適用します。

~~~text
Gradient（任意）──→ Ribbon 3D［Material］
                         │
                         └─→ Renderer 3D（OpenGL）→ Glow → 2D Image
~~~

まず画像なしで線が表示されるか確認すると、Materialの問題とRendererの設定を分けて調べられます。Ribbon 3Dの出力そのものを2DのMergeへ直接接続する構成ではありません。

## 運用例2：稲妻のように不規則な線を作る

1. Ribbon 3Dで1本または少数の線を作り、Subdivision Levelを上げます。
2. Fast Noiseで濃淡の変わる2D画像を生成します。
3. Ribbon 3DをDisplace 3Dの3D scene入力へ、Fast Noiseを画像入力へ接続します。
4. Displace 3Dで変位量を調整し、Renderer 3DをOpenGLにして描画します。

~~~text
Ribbon 3D ──→ Displace 3D ──→ Renderer 3D（OpenGL）→ 2D Image
                    ↑
Fast Noise ─────────┘
~~~

Displace 3Dは画像の値を使って**既存の頂点を移動する**処理です。線の頂点が少なければ、ノイズ画像を細かくしても滑らかな曲線にはなりません。まずRibbon 3D側で頂点の分割数を増やします。

また、[Replicate 3D](./replicate-3d.md)と組み合わせると、線の頂点に別の3Dオブジェクトを配置する使い方もできます。

## 表示と使用上の注意

- **線がまったく見えない**：Renderer 3DがSoftware Rendererになっていないか確認します。Ribbon 3Dの線はSoftware Rendererでは表示されません。
- **Line Thicknessを増やしても太さが変わらない**：GPUのライン描画機能による制限の可能性があります。任意の太さが保証されるわけではありません。
- **線の変形が粗い**：Subdivision Levelを増やします。Displace 3D自身は不足する頂点を生成しません。
- **線が途切れて見える**：Anti-AliasingとLine Thicknessの組み合わせを確認します。
- **画像の貼り方を変えたい**：線には標準でテクスチャ座標があり、[UV Map 3D](./uv-map-3d.md)でその座標を調整できます。

## 関連する考え方・Node

- [Classic 3Dの基本](../../learn/02-data/classic-3d.md) / [Classic 3D Node一覧](./index.md)：3Dデータと2D画像の違い。
- [Displace 3D](./displace-3d.md)：画像で線の頂点を動かす。
- [Replicate 3D](./replicate-3d.md)：別のGeometryの頂点にオブジェクトを配置する。
- [Renderer 3D](./renderer-3d.md)：3D sceneを2D画像に描画する。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 88「3D Nodes」、**Ribbon 3D [3Ri]（pp.1988–1990）**に基づき、線の生成、任意入力、Controls、テクスチャ座標、OpenGL依存とSoftware Rendererの制限を確認しました。

上記の接続例は仕様を基にした構成案で、21.1実機でのレンダリング結果ではありません。内部REGID、Controlの正確な初期値・数値範囲、Edition差は未確認のため、verificationはpartialとしています。
