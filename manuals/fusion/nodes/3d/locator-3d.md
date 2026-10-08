---
title: "Locator 3D"
description: "3D空間の位置をカメラから見た2D画面座標へ変換し、Maskなどの位置制御へ渡すClassic 3Dノード。"
doc_type: node
term_id: "locator-3d"
term_short: "Locator 3Dは、3Dシーン内の点をカメラから見た2D位置に変換し、他のノードの位置パラメータから参照できるようにするノード。"
verification: partial
aliases: ["Locator 3D", "3Lo"]
concepts: ["classic-3d"]
nodes: ["Locator 3D"]
node_family: "3d"
controls: ["Camera", "Use Frame Format Settings", "Width", "Height", "Pixel Aspect", "Size", "Color", "Sub ID", "Make Renderable", "Unseen by Camera", "Is Matte", "Opaque Alpha", "Infinite Z", "Transform"]
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Locator 3D

**Locator 3D [3Lo]は、3D空間にある点がカメラの画面上でどこに見えるかを計算するノード**です。たとえば3Dシーン内のライトや物体に合わせて、2DのEllipse Maskや画面上のグラフィックを動かすときに使います。

<Term id="classic-3d">Classic 3D scene</Term>の座標はX・Y・Zの3成分を持ちます。一方、Ellipse MaskのCenterは画像上の2D位置です。3D座標をそのままCenterへ渡しても、カメラの向きや遠近感を反映した位置にはなりません。Locator 3Dはシーン内のCameraを使って**3Dの位置を2Dの画面座標へ投影**し、その結果を別ノードの位置パラメータから参照できるようにします。

これは通常の2D Imageを生成するノードではありません。Locatorの位置を使って画像を合成する場合も、映像そのものの処理と、位置パラメータの接続は区別します。

## 入力と出力

Node Editorには、3D sceneを受ける2本の入力があります。

- **SceneInput（オレンジ、必須）**：座標の計算元となる3Dシーン。投影に使うCameraを**このシーンに含める必要があります**。通常はCameraとオブジェクトをまとめた[Merge 3D](./merge-3d.md)の後段へ接続します。
- **Target（緑、任意）**：追いかけたい3Dオブジェクトなどを受け取ります。接続すると、Target側の変換中心がLocatorの基準位置になります。
- **Position（数値の参照先）**：Cameraから見たLocatorの2D位置。他ノードの位置コントロールから `Connect To > Locator 3D > Position` のように参照します。**画像ケーブルで2D Imageを送る出力ではありません**。

Targetを省略すると、LocatorのTransformで決めた3D位置が基準です。Targetを接続した場合、TransformタブのTranslation XYZはそのオブジェクトの**ローカル座標系でのオフセット**として働きます。追従先の中心から少し上へマーカーをずらす、といった調整に使えます。

## 運用例：3Dオブジェクトに2Dマーカーを追従させる

たとえば3Dシーン内を動くSpot Lightの位置に合わせて、完成映像上の円形マーカーを動かしたい場合です。

```text
Camera 3D ────┐
Spot Light ────┼→ Merge 3D → Locator 3D（SceneInput）
3D Geometry ──┘                    ↑
Spot Light ──────────────────── Target

Ellipse Mask（Center） ── Connect To ──→ Locator 3D > Position
```

1. Camera、Spot Light、必要なGeometryをMerge 3Dで同じ3Dシーンにまとめます。
2. Merge 3Dの出力をLocator 3Dの**オレンジのSceneInput**へ接続します。Cameraを含まないシーンから正しい画面位置を得ようとしないでください。
3. 追従したいSpot LightをLocatorの**緑のTarget**へも接続します。Locatorはその変換中心を基準にします。
4. Ellipse Maskの**Centerを右クリック**し、`Connect To > Locator 3D > Position`を選びます。これはEllipseの**位置パラメータへのリンク**であり、Ellipse MaskとLocatorを画像ケーブルで結ぶ操作ではありません。
5. CameraやSpot Lightを動かし、Ellipseの中心がViewer上の対象位置に追従することを確認します。中心からマーカーをずらしたい場合はLocatorのTransformでオフセットを調整します。

Ellipse Maskは、たとえばBackgroundのEffect Maskとして接続すれば、円形の目印を描くために使えます。Locator自体が円を描画するわけではありません。

## Inspectorで確認する項目

### Cameraと出力画像の寸法

**Camera**は、SceneInputに含まれるCameraのうち、どの視点から2D画面座標へ変換するかを選ぶ設定です。SceneInputへCameraを含むシーンを渡すだけでなく、ここで意図したCameraが選択されているか確認します。

**Width / Height / Pixel Aspect**は、変換先となる2D画像の幅・高さ・ピクセル縦横比です。Locatorが計算する画面上の位置を正しく使うには、選んだCameraでレンダリングする画像と同じ寸法・ピクセル比にします。たとえばRenderer 3Dの出力が1920×1080なら、Locatorの幅と高さが異なる値になっていないか確認します。

**Use Frame Format Settings**を有効にすると、これら3項目をコンポジションのFrame Format設定で上書きします。レンダリング先とFrame Formatが一致している場合に便利ですが、別解像度でRenderer 3Dを出力する場合は、設定が一致するか確認してください。

### Transform

TransformはLocatorが参照する3D位置を決めます。Targetがなければシーン内のグローバル位置を基準にし、Targetが接続されていればその変換中心からのオフセットを対象のローカル座標系で設定します。

### SizeとColor

LocatorをViewerに表示する**十字マークの大きさと色**を変更します。2Dへ変換されたPositionの意味を変えるための設定ではありません。

### Sub IDと十字マークの描画

**Sub ID**は、対応するジオメトリの一部を指定するControlです。たとえばText 3Dから生成した特定の文字や、Duplicate 3Dによって作られた特定の複製を対象にする場合に使います。すべてのジオメトリがこの選択に対応するわけではありません。

**Make Renderable**を有効にすると、OpenGL RendererでLocatorの十字マークを描画対象にできます。Software Rendererは線を描画できないため、この設定を無視します。

**Unseen by Camera**はMake Renderableが有効なときに表示されます。有効にすると十字マークはViewerに見えても、Renderer 3Dの最終出力には描画されません。

2Dの位置参照だけが目的なら、十字マークを映像へ描画する必要はありません。マーカーとして画面に見せたい場合は、先の運用例のようにPositionをEllipse Maskなどへ接続して描画する方法を区別してください。

### Matte

- **Is Matte**：Matteオブジェクトとして扱い、その背後に重なるオブジェクトの描画を抑えるための設定です。
- **Opaque Alpha**：Is Matteが有効なときだけ表示され、MatteオブジェクトのAlphaを1にします。
- **Infinite Z**：Is Matteが有効なときだけ表示され、Zチャンネルを無限遠として扱います。

これらはMatteとして描画する場合の設定です。**3D位置を2DのCenterへ渡す基本的な使い方には不要**です。

## 関連ノードと注意点

- [Camera 3D](./camera-3d.md)：どの視点から3Dの点を見ているかを決める。Cameraを含むシーンをLocatorへ渡します。
- [Merge 3D](./merge-3d.md)：追従先の3DオブジェクトとCameraを同じシーンへまとめる。
- [Transform 3D](./transform-3d.md)：3Dシーンやオブジェクトそのものを動かす。Locatorの2D画面位置への変換とは役割が異なります。
- [Renderer 3D](./renderer-3d.md)：3D sceneを2D Imageへレンダリングする。**LocatorのPositionを参照するだけなら、2D画像を得るためにRenderer 3Dへ通す必要はありません**。
- [Classic 3Dの基礎](../../learn/02-data/classic-3d.md)：3D sceneと2D Imageのデータの違い。

Locatorは3D物体を新しく作るためのノードでも、3Dオブジェクトの投影結果を画像として直接出力するノードでもありません。「3D位置を画面内の2D位置として使いたい」ときに選びます。

## 出典と検証範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 88「3D Nodes」、**Locator 3D [3Lo]（pp.1955–1957）**。3D→2D座標変換、必須SceneInputと任意Target、Ellipse Centerからの`Connect To`、Target接続時のローカルオフセット、Cameraと画像寸法、Use Frame Format Settings、Sub ID、Make Renderable、Unseen by Camera、Size・Color・Matteの項目を確認しました。

**未検証**：21.1実機での内部REGID、Positionの数値範囲・座標の詳細仕様、各Renderer / Editionでの実機挙動。未検証の項目を仕様として補わず、`verification: partial`を維持しています。
