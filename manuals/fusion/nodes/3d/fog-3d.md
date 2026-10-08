---
title: "Fog 3D"
description: "Classic 3DシーンをCameraからの距離に応じて霞ませ、霧の色・減衰方式・距離範囲を調整するNode。"
doc_type: node
term_id: "fog-3d"
term_short: "Fog 3Dは、Cameraからの距離に応じて3Dオブジェクトの見え方を霧の色へ近づけるNode。"
verification: partial
aliases: ["Fog 3D", "3Fo"]
concepts: ["classic-3d"]
nodes: ["Fog 3D"]
node_family: "3d"
controls: ["Enable", "Show Fog in View", "Color", "Radial", "Type", "Near/Far Fog Distance"]
inputs: ["classic-3d", "image"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene", "render-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Fog 3D

Fog 3D [3Fo]は、<Term id="classic-3d">Classic 3D scene</Term>内のオブジェクトを、**Cameraからの距離に応じて霞ませる**Nodeです。近景は元の色を保ち、遠景は霧の色が強く現れるように調整できます。

画面全体へ半透明の画像を重ねるのではなく、3Dシーンのジオメトリ（面や頂点によって作られる形状）の見え方を、距離を手掛かりに変化させます。Renderer 3Dより前で処理するため、レンダリング時のアンチエイリアスや被写界深度も考慮されます。

## 入力と出力

- **SceneInput（オレンジ、必須）**：霧を適用するClassic 3Dシーンを受け取ります。通常は、Geometry・Camera・Lightをまとめた[Merge 3D](./merge-3d.md)の出力を接続します。
- **DensityTexture（緑、任意）**：霧の色に変化を付ける2D Imageを受け取ります。画像はCameraからシーンへ投影され、各ピクセルの値がFog Colorへ掛け合わされます。
- **出力**：霧を適用したClassic 3Dシーンを返します。[Renderer 3D](./renderer-3d.md)を通すと、通常の2D Imageになります。

DensityTextureという名前ですが、Manualが明記する作用は**Fog Colorと画像のピクセル値との掛け合わせ**です。「画像の明るさが霧の厚さを直接決める入力」とは断定しません。

## 基本的な接続

Fog 3Dは、原則として**Merge 3Dの後、Renderer 3Dの前**に置きます。

```text
Shape 3D ───┐
Camera 3D ──┼─ Merge 3D → Fog 3D → Renderer 3D → MediaOut
Light ──────┘                ↑
                       DensityTexture
                        （任意の画像）
```

Fogの距離はCameraを基準に計算します。まず[Camera 3D](./camera-3d.md)で視点を決め、その視点から見た霧を調整すると結果を判断しやすくなります。

## Inspectorの主な設定

### Enable / Show Fog in View

**Enable**はFogの処理部分を切り替えます。Inspector左上のTool全体の無効化とは異なり、Settings tabのscriptなどは動作し続けます。

**Show Fog in View**は、Camera以外の視点からFogを表示するための設定です。初期状態のFogはCamera経由で見るときに表示されます。3D Viewerの自由視点で見えない場合は、この設定かCamera視点を確認します。

### Color

Fogの基本色です。青灰色を指定すると、遠景が大気で霞んだような色に近づきます。DensityTextureを接続した場合、指定色へ画像のピクセル値が掛け合わされます。均一なFogなら画像入力は不要です。

### Radial

Fogを適用する距離の測り方を切り替えます。

- **無効（Perpendicular）**：Camera正面の面に垂直な、奥行き方向の距離を基準にします。
- **有効（Radial）**：Cameraの位置から対象までの放射状の距離を基準にします。

Perpendicularでは、同じ直線距離にある物体でも、画面端から中央へ動くとFogの量が変わる場合があります。Radialはこの差を抑えます。ただし、Camera近くに置いた広いImage Planeでは、中央は霞まず端だけ霞むこともあります。常にRadialが適切というわけではありません。

### Type

距離に応じてFogが強くなる曲線を選びます。

- **Linear**：距離に対して直線的に変化します。
- **Exp**：指数関数的に変化します。
- **Exp2**：Expより強い指数関数的な変化を作ります。

同じNear/Farの設定でも、Typeを変えると奥行き方向の霞み方が変わります。

### Near/Far Fog Distance

Cameraからの距離を使ってFogの範囲を決めます。**Near**はFogが始まる位置、**Far**は効果が最大になる位置です。

手前の物体をはっきり残したい場合はNearをその物体より遠くに設定し、Farを霞ませたい遠景の距離に合わせます。正確な初期値・範囲は実機で未確認のため記載しません。

## 具体的な運用例

### 街並みの遠景を霞ませる

複数の建物の3D GeometryとCamera 3DをMerge 3Dでまとめ、その後にFog 3Dを接続します。各建物の材質を個別に変更せず、Cameraから遠い建物ほどFogの色に近づけられます。

1. 建物のGeometryとCamera 3DをMerge 3Dへ接続します。
2. Fog 3DをMerge 3DとRenderer 3Dの間に置き、Colorで霧の色を選びます。
3. Nearを近景より奥へ、Farを遠景の位置へ合わせます。
4. Typeを切り替え、霞み方を比較します。
5. Cameraを横に動かしたときのFogの変化が不自然ならRadialの有無を比較します。

### 画像を使って霧の色味に変化を付ける

別の2D画像をDensityTextureへ接続すると、Cameraから投影された画像の色がFog Colorへ掛け合わされます。たとえば場所によって色の異なる画像で、画面内の霧に色の変化を付けられます。

```text
Background / 2D Image ──→ DensityTexture
                                  ↓
3D scene ─────────────────→ Fog 3D → Renderer 3D
```

この入力は、任意の3D位置に濃淡を持つボリュームを生成する仕組みではありません。Camera投影であることを前提に、画角やCamera位置を変えながら確認します。

## Fogが見えない・不自然なとき

- **自由視点の3D Viewerでだけ見えない**：Cameraから表示するか、Show Fog in Viewを確認します。
- **Fogが強すぎる／見えない**：Cameraと物体の距離に対してNear/Farが適切か確認します。
- **画面端だけ霞む**：Radialを切り替えます。特にCameraの近くに置いた平面で差が現れます。
- **DensityTextureが意図どおりに見えない**：シーン内の物体に直接貼る画像ではなく、Cameraから投影される画像であることを確認します。

## 関連Nodeと概念

- [Merge 3D](./merge-3d.md)：Geometry・Camera・Lightなどを1つのシーンにまとめます。
- [Camera 3D](./camera-3d.md)：Fogの距離計算の基準になる視点を作ります。
- [Renderer 3D](./renderer-3d.md)：Fogを適用した3Dシーンを2D画像へ変換します。
- [Projector 3D](./projector-3d.md)：光や画像を3D表面へ投影する別用途のNodeです。
- [Classic 3D scene](../../learn/02-data/classic-3d.md)／[Classic 3Dノード一覧](./index.md)：3Dデータの流れと他Nodeの役割。

2D画像やDeep系のFogとは、処理するデータとタイミングが違います。Fog 3DではRenderer 3Dの前のClassic 3Dシーンを処理します。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 88「3D Nodes」、**Fog 3D [3Fo]（pp.1950–1952）**に基づきます。SceneInput、DensityTexture、Enable、Show Fog in View、Color、Radial、Type（Linear / Exp / Exp2）、Near/Far Fog Distanceを確認しています。

runtime REGID、Inspectorの初期値・全数値範囲、Edition差、実機でのRenderer別動作は未検証のため、`verification: partial`を維持します。
