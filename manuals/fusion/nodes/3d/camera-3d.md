---
title: Camera 3D
description: 3Dシーンを見る位置と画角を決めるノード。実写への画角合わせ、立体視、Image PlaneとCamera Projectionを具体例付きで説明。
doc_type: node
term_id: camera-3d
term_short: Camera 3Dは3D空間を見る位置・向き・画角を決める仮想カメラ。画像を3D物体へ投影することもできる。
verification: partial
aliases: [Camera 3D, Camera3D, 3Cm]
concepts: [classic-3d, camera, projection]
nodes: [Camera 3D]
node_family: 3d
controls: [Projection Type, Near/Far Clip, Adaptive Near/Far Clip, Viewing Volume Size, Angle of View Type, Angle of View, Focal Length, Film Gate, Aperture Width/Height, Resolution Gate Fit, Plane of Focus, Eye Separation, Convergence Distance, Enable Image Plane, Enable Camera Projection, Projection Mode]
inputs: [classic-3d, image, camera]
outputs: [classic-3d]
tasks: [build-3d-scene, camera, projection, stereo]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-08"
---

# Camera 3D

Camera 3D [3Cm]は、<Term id="classic-3d">Classic 3D scene</Term>を**どの位置・向き・画角で撮影するか**を決める仮想カメラです。Camera 3D自体は画像を描くノードではなく、カメラを含んだ3Dシーンを出力します。最終的な2D画像を得るには[Renderer 3D](./renderer-3d.md)が必要です。

実写映像とCGの構図を合わせる、カメラをアニメーションさせる、左右の視差を作るほか、2D画像をカメラの視点から3D物体へ投影する用途にも使います。

## 入力

### Scene Input

オレンジ色の任意入力です。3Dの形状やシーンを接続すると、その形状はカメラの視野に関連付けられます。**独立した物体とカメラを同じ空間へ配置するだけなら、[Merge 3D](./merge-3d.md)に別々に接続**すると動かしやすくなります。

### Image Input

マゼンタ色の任意入力です。2D画像を**Image Plane**（カメラに付ける板状の形状）または**Camera Projection**（3D物体への画像投影）に使用します。

接続するとInspectorにImage・Materials・Projectionタブが追加されます。何も接続していないときはこれらのタブが表示されません。

### Right Stereo Camera

緑色の任意入力です。立体視用の右目カメラを、別のCamera 3Dで指定して内部の右目カメラを置き換えるときに使います。

### 出力

**Classic 3D scene**を出力します。2D Image出力ではないため、Camera 3D単体をViewerへ表示しても、撮影対象が含まれず空のシーンになります。

## Projection Type

### Perspective

通常の実写カメラに近い遠近投影です。近くの物体は大きく、遠くの物体は小さく見えます。実写の建物へCGを重ねるような合成で使用します。

### Orthographic

平行投影です。カメラからの奥行き方向の距離が変わっても、画面上の物体の大きさは基本的に変わりません。**Viewing Volume Size**で見える範囲を決めるため、図解や遠近感を付けたくないグラフィックに向いています。

## Focal Length / Angle of View

**Focal Length**（焦点距離）を短くすると広角、長くすると狭い画角になります。**Angle of View**（画角）と連動しており、どちらかを変えるともう一方も再計算されます。**Angle of View Type**で水平・垂直・対角のどの画角を表示するかを選べます。

実写へCGを合わせる場合は焦点距離だけでなく、**Film Gate**（撮像面の大きさ）も重要です。同じ焦点距離でも撮像面が異なれば、映り込む範囲は変わります。

### Film Gate / Resolution Gate Fit

- **Film Gate**：撮像面サイズのプリセットを選択します。
- **Aperture Width / Height**：撮像面の横幅と高さを指定します。Manualでは単位は**inch**です。Focal Lengthは**mm**です。ここでのApertureは撮像面の寸法で、レンズのF値（絞り値）とは異なります。
- **Resolution Gate Fit**：Film Gateと出力解像度の縦横比が違うとき、撮影範囲を合わせる方法を選びます。

Resolution Gate FitにはInside / Width / Height / Outside / Stretchがあります。Widthは横幅、Heightは高さを基準にします。Stretchは縦横を別々に引き伸ばすので、物体の形を変えることがあります。InsideとOutsideでは収める方向が異なり、見切れや余白が変わるため、実写と合わせる際はここも確認します。

## Near / Far Clip

カメラから近すぎる物体、遠すぎる物体を描画対象から外します。Perspectiveでは通常**Adaptive Near/Far Clip**が有効で、シーンの広がりをもとに描画範囲が自動調整されます。**Near / Farを手動指定するときはAdaptiveを無効**にします。OrthographicにはAdaptive設定がありません。

範囲が広すぎると深度計算の精度が落ちることがあります。奥の物体に不自然な描画が出る場合、ManualはNear Clipを遠ざける調整を案内しています。

## Plane of Focus

Renderer 3Dの**OpenGL Renderer**によるDepth of Field（被写界深度）計算で、カメラから焦点面までの距離を決めます。ViewerでFocal Plane表示を有効にすると、焦点面を確認できます。Focal Length（レンズの焦点距離）とは別の設定です。

## Image PlaneとCamera Projectionの違い

同じImageInputの2D画像を使いますが、処理する内容は異なります。

- **Image Plane**：カメラの視野へ画像を合わせた板状の3D形状を作ります。**Enable Image Plane**で表示を切り替え、**Fill Method**（Inside / Width / Height / Outside）で画像と画角の比率を合わせます。**Depth**はカメラと板との距離で、カメラのZ位置を動かしても相対距離は変わりません。Viewerだけのガイドではなく、実際の3D形状です。
- **Camera Projection**：カメラの視点から画像を3D物体の表面へ投影します。Projectionタブで**Enable Camera Projection**を有効にし、**Projection Fit Method**で画像とカメラ画角の合わせ方を選びます。板を置くImage Planeとは違い、投影先の壁や床の形に沿って画像が付きます。

**Projection Mode**は3種類です。

| Mode | 画像がどう使われるか |
| --- | --- |
| **Light** | スポットライトのように画像を照明として投影する。 |
| **Ambient Light** | 環境光として画像を投影する。 |
| **Texture** | 画像を物体の材質として扱い、別の照明でその物体を照らせるようにする。[Catcher](../materials-lights/catcher.md)が必要。 |

Light / Ambient Lightで投影するときは、**[Renderer 3D](./renderer-3d.md)側のLightingを有効**にします。照明としての投影では画像のAlphaを物体の透明度へ反映できないため、透明部分のある投影を材質に使う場合はTextureとCatcherを検討します。

### 具体例：建物写真を3Dの壁へ投影する

1. 建物の写真をCamera 3DのImageInputに接続します。
2. [Shape 3D](./shape-3d.md)で写真の壁に相当する平面を作り、Camera 3DとともにMerge 3Dへつなぎます。
3. Camera 3Dの位置・向き、Focal Length、Film Gateを撮影視点に合わせます。
4. Enable Camera Projectionを有効にします。写真を材質として貼りたい場合は**Texture**を選び、壁にCatcherを接続します。
5. もう1台の表示用Camera 3Dを追加し、少し視点を動かしてRenderer 3Dから確認します。

もとの写真に近い視点では投影位置を合わせやすく、別の視点から見ると壁の奥行きに応じた視差が現れます。ただし写真に写っていない面や、遮蔽物の裏側は復元されません。[Projector 3D](./projector-3d.md)は別の投影元として扱うノードで、照明の強さや影も調整したいときの候補です。

## 最小構成

```text
Shape 3D ──┐
Camera 3D ─┼─ Merge 3D → Renderer 3D
           ┘
```

**Merge 3DをViewerへ表示**し、右クリックのCameraサブメニューからCamera 3Dを選ぶと、シーンをそのカメラから確認できます。Viewerの画面比率は最終出力と異なる場合があります。構図確認では**Guides → Frame Aspect**と**Guides → Show Guides**を使い、レンダリングされる枠も表示します。

## Stereo（左右の視差）

StereoのModeは通常Monoです。立体視用の左右映像を作る場合、次の方式が用意されています。

- **Toe In**：左右のカメラを内側へ回転し、同じ距離へ向けます。垂直方向の視差が生じることがあります。
- **Off Axis**：カメラは平行のまま投影範囲をずらして収束させ、垂直方向の視差を抑えます。
- **Parallel**：左右のカメラを平行にずらします。この方式では**Convergence Distance**を設定できません。

**Eye Separation**は左右カメラの間隔、**Convergence Distance**はToe In / Off Axisでの収束距離です。**Rig Attached To**でCenter / Left / Rightのどこを操作基準にするかを選べます。外部の右目カメラを使うときはRightStereoCameraへつなぎます。

## Camera Trackerとの関係

[Camera Tracker](../tracking/camera-tracker.md)で実写のカメラ動作を解析した場合、Exportで作られたCamera 3Dをシーンに使います。Camera Trackerは**動きを解析する**ノード、Camera 3Dは**得られた撮影視点で3Dを映す**ノードです。

外部カメラのImport CameraはManual上ではLightWave (.lws)、Max (.ase)、Maya ASCII (.ma)、dotXSI (.xsi)を対象とします。**FBXカメラは別のFusion → Import → FBX Scene経路**で読み込みます。外部から取り込んだカメラを画像投影にも使う場合は、ControlsのResolution Gate FitとProjectionのFit Methodが一致しているか確認します。

## 出典と確認範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月版）、Chapter 88「3D Nodes」、**Camera 3D [3Cm]（pp.1919–1927）**。3入力、Projection Type、画角・Film Gate、Clipping、Stereo、Image Plane、Camera Projection、Import Cameraを照合しました。

Manualとの照合であり、Resolve 21.1実機でのREGID、Inspector全設定のdefault/range、Rendererごとの画質差、Stereo納品、外部カメラ形式の互換性は未確認です。そのため**verification: partial**を維持しています。
