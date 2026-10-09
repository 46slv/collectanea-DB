---
title: "Spherical Camera"
description: "Classic 3Dシーンを全方向へレンダリングする球面カメラ。3D出力、投影レイアウト、ステレオ設定、Renderer 3Dとの接続をResolve 21.1基準で解説。"
doc_type: node
term_id: "spherical-camera"
term_short: "Spherical Cameraは、3Dシーンを全方向から撮影する球面カメラ。Renderer 3Dと組み合わせ、LatLongやCube形式の画像を作る。"
verification: partial
aliases: ["Spherical Camera"]
concepts: ["classic-3d", "image-data", "camera", "projection"]
nodes: ["Spherical Camera"]
node_family: "3d"
controls: ["Layout", "Near/Far Clip", "Adaptively Adjust Near/Far Clip", "Plane of Focus", "Stereo Method", "Eye Separation", "Convergence Distance", "Control Visibility"]
inputs: ["image", "camera"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene", "render-3d", "process-immersive"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-10"
---

# Spherical Camera

Spherical Cameraは、<Term id="classic-3d">Fusionの3Dシーン</Term>を**前後左右・上下の全方向から撮影するための仮想カメラ**です。通常の[Camera 3D](../3d/camera-3d.md)が主に一方向の画角を切り取るのに対し、Spherical Cameraは周囲を見回せるパノラマ画像や、立方体の6方向を展開した画像を作るために使います。

**Spherical Camera自体は2D画像を出力しません。** 3Dシーンへカメラを渡し、[Renderer 3D](../3d/renderer-3d.md)で初めて画像化します。既存の360°動画の揺れを直す[Spherical Stabilizer](./spherical-stabilizer.md)、投影形式を変える[PanoMap](./panomap.md)とは役割が異なります。

公式21.1 Reference Manualでは**3D Nodes（Chapter 88）**に属します。VR Nodes（Chapter 122）からも参照されますが、Effects LibraryのVRカテゴリに置かれるNodeではありません。この記事のファイルURLは既存のImmersiveカテゴリ配下に残しています。

## 何を作るNodeか

たとえば3Dの部屋を通常のCamera 3Dで描くと、レンズが向いている壁や机だけが1枚の画像に映ります。Spherical Cameraなら、**同じカメラ位置から見える周囲の方向**を、LatLongやCube形式に並べた画像として出力できます。

- **360°背景を作る**：CG空間を周囲から見られるパノラマとして描き、360°プレーヤーや別のシーンで使う。
- **Skybox／反射用画像を作る**：全方向の風景を環境テクスチャとして書き出す。
- **VR用の立体視を検討する**：左右眼のカメラ間隔を設定し、Renderer 3D側で出力する眼を選ぶ。

これは「2D画像を球面へ曲げるエフェクト」ではありません。カメラの向きと3Dシーンの位置関係から、**どの方向に何が見えるか**を決めるNodeです。

## 入力と出力

21.1 Manualでは**任意の入力2系統**が説明されています。両方とも未接続で使用できます。

| 端子 | 接続するデータ | 役割 |
| --- | --- | --- |
| **Image**（オレンジ） | 球面配置の2D画像 | LatLong（2:1）、VR180、Horizontal／Vertical Cross、Horizontal／Vertical Strip形式の画像を受け取る。通常の16:9画像を自動で360°素材へ変換する入力ではない |
| **Stereo Input**（緑） | 右眼用のステレオカメラ | Stereo VR制作で右側のカメラを入力する。通常の2D画像やマスクを入れる端子ではない |
| **出力** | **Classic 3Dシーン（カメラ）** | Merge 3Dなどへ接続し、Renderer 3Dで2D画像へ変換する |

Image入力は、Spherical Cameraの**出力がImageであることを意味しません**。入力と出力のデータ領域を取り違えると、2D Mergeへ直接つなごうとして詰まります。3Dシーンと2D画像の違いは[Classic 3D scene](../../learn/02-data/classic-3d.md)を参照してください。

ManualはImage入力について対応レイアウトを列挙していますが、入力画像の自動判定、各形式での色や継ぎ目の処理を保証しているわけではありません。画像を使う場合は、素材の形式とLayoutを確認します。

## Layout：出力をどう並べるか

**ControlsタブのLayout**で、周囲の見え方を1枚の画像にどう配置するかを指定します。ここでいう「展開」は、カメラから見た方向を平面の画像へ並べる方法です。

| Layout | 出力の見え方 | 画像の縦横比 |
| --- | --- | --- |
| **LatLong** | 周囲360°を1枚の横長画像へ展開する（正距円筒図法／equirectangular） | **2:1** |
| **HCross** | 立方体の6方向を横長の十字に並べる | **4:3** |
| **VCross** | 立方体の6方向を縦長の十字に並べる | **3:4** |
| **HStrip** | 立方体の6方向を横一列に並べる | **6:1** |
| **VStrip** | 立方体の6方向を縦一列に並べる | **1:6** |
| **VR 180** | 180°範囲を立体視用に表す | **1:1** |

Cross／Stripの各正方形は立方体の1面に相当します。ManualではStripの面順を**Left、Right、Up、Down、Back、Front（+X、-X、+Y、-Y、+Z、-Z）**としています。納品先が求めるCube配置はソフトごとに違う可能性があるため、名称だけで一致を決めず、実際の方向を確認します。

**Renderer 3DのImage Width**は、Cube系出力では**1面の正方形の幅**を決めます。たとえば1面を512pxにすれば、HStripは6面を横に並べるため、幅は3072px、高さは512pxという関係になります。最終的な出力サイズは選んだLayoutとRendererの設定で確認してください。

LatLongもCubeも「全方向を表す」点では共通ですが、画素が示す方向と画像の形は異なります。**投影方式を変えることと、カメラ位置を動かすことは別**です。

## 3Dカメラとしての設定

### Near/Far Clip：描く距離を制限する

**Near/Far Clip**は、カメラに近すぎる形状と遠すぎる形状を描画対象から外す距離の指定です。単位は3Dシーン内の距離で、たとえばNearを0.1、Farを20にした場合、その範囲外の物体は表示されなくなります。

**Adaptively Adjust Near/Far Clip**を有効にすると、Rendererがシーンの広がりに合わせて範囲を自動調整し、指定値より優先します。深度計算がおかしい場合は、むやみにFarを大きくするのではなく、不要な距離を含めていないか確認します。Manualのこの節には通常のPerspective／Orthographic Cameraと共通の説明も含まれるため、球面出力に固有の境界挙動は実機で確認してください。

### Plane of Focus／Control Visibility

**Plane of Focus**は、Manual上ではOpenGL RendererのDepth of Field（被写界深度）計算に用いる焦点面までの距離です。焦点距離（Focal Length）と同じ意味ではありません。Spherical Cameraでの被写界深度の見え方は、使用するRendererと画質設定に依存するため、プレビューで確認します。

**Control Visibility**では、3D Viewerに見せるガイドを選べます。Manualでは**Frustum、View Vector、Near Clip、Far Clip、Plane of Focus、Convergence Distance**を列挙しています。ガイドは構図や距離を確認する表示で、完成画像へ図形として描画するための設定ではありません。

## Stereo：左右眼の視点を作る

Stereoでは左右の眼が少し異なる位置から見た画像を作ります。**Eye Separation**はそのカメラ間隔です。0より大きい値にすると、選択時に左右カメラ用のViewerコントロールが現れるとManualにあります。

**Stereo Method**には次の方式があります。

| 方式 | カメラの向け方 | 注意点 |
| --- | --- | --- |
| **Toe In** | 左右のカメラを1つの収束点へ内向きにする | 垂直方向の視差が生じ、視聴者の負担になる場合がある |
| **Off Axis** | 左右の位置を変え、投影の中心をずらして収束を表現する | Manualでは垂直視差を生じにくくする方式として説明 |
| **Parallel** | 左右のカメラを平行にずらす | **Convergence Distanceは表示されない** |

**Convergence Distance**は、左右の視線・投影が収束する位置までの距離です。Parallelではこの設定を使いません。右眼側を別カメラで指定したい場合は、緑のStereo Inputを使用します。

Stereoを設定しただけで、すべての納品形式に合う左右画像が自動で完成するとは限りません。[Renderer 3D](../3d/renderer-3d.md)の**Eye**設定で描画する眼（Left／Right／Stacked／Layersなど）を確認し、VRプレーヤーや配信仕様に合わせて書き出します。

## 実際の接続例：3Dシーンから360°画像を作る

周囲に配置した3D物体をLatLongの1枚画像として描く最小の例です。Spherical Cameraに通常のImage入力をつながなくても、3Dのカメラとして使えます。

~~~text
Shape 3D（周囲の物体） ─┐
                       ├→ Merge 3D → Renderer 3D → 2D Image
Spherical Camera ──────┘
~~~

1. [Shape 3D](../3d/shape-3d.md)などで、カメラの周囲に3Dの物体を配置します。
2. Spherical Cameraを追加して撮影位置を決め、**Shape 3DとともにMerge 3Dへ接続**します。
3. Spherical Cameraの**LayoutをLatLong**にします。
4. Renderer 3DをMerge 3Dの後ろに接続します。カメラが複数ある場合は、Renderer 3DのCameraでSpherical Cameraを選びます。
5. 出力画像の縦横比と正面・背面・上下の向きを確認します。2D画像として書き出す場合は、Renderer 3Dの後段から保存します。

これはManualの3Dカメラ接続方法を基にした**構成例**であり、実機でのレンダリング検証結果ではありません。

**環境テクスチャの例**では、球の内側に周囲の景色を表示し、その中心へSpherical Cameraを配置する方法もManualに示されています。LatLongやCross形式の元画像を使い、必要に応じて[PanoMap](./panomap.md)を通して、**景色を貼った球とカメラをMerge 3Dで同じ空間に置く**考え方です。カメラのImage入力だけで球の形状が生成されるという意味ではありません。

## 似たNodeとの違い・注意点

- **[Camera 3D](../3d/camera-3d.md)**：通常の遠近投影・平行投影で撮るカメラ。実写の画角合わせや特定方向の構図を作りたい場合に使います。
- **[Renderer 3D](../3d/renderer-3d.md)**：カメラを含む3Dシーンを2D Imageに変えます。Spherical Cameraだけでは最終画像になりません。
- **[PanoMap](./panomap.md)**：既存画像の投影形式を変換する用途。3Dシーン内の撮影位置を決めるNodeではありません。
- **[Spherical Stabilizer](./spherical-stabilizer.md)**：撮影済み360°映像の回転揺れを追跡して補正します。新しい全方向画像をレンダリングするNodeではありません。

**確認したい失敗例**は、(1) 2D MergeへSpherical Cameraを直接つなぐ、(2) 出力Layoutと納品先の要求を取り違える、(3) Renderer 3Dで別のカメラを選んだままにする、(4) StereoのEye Separationだけを設定して左右の出力確認を省く、の4つです。

Spherical CameraはEffects Libraryの**3Dカテゴリ**にあるため、VRカテゴリ内だけを探しても見つからない場合があります。なお、Manualが**Spherical StabilizerとVRカテゴリのStudio限定**を記すことから、Spherical CameraまでStudio限定だと推定してはいけません。Spherical Camera自体のResolve Free／Studio差は今回実機確認していません。

## 出典と確認範囲

**一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月版）、Chapter 88「3D Nodes」、Spherical Camera [3SC]（pp.1995–1998）、Chapter 122「VR Nodes」、Spherical Camera（p.2955）。** 入力2系統、出力の3D接続、Layoutと各比率、Clip、Stereo、Control Visibility、VRカテゴリとの分類差を確認しました。公式資料の入口は[Blackmagic Design Support](https://www.blackmagicdesign.com/support)です。

**verification: partial**：Manualとの照合は実施しましたが、21.1実機でのREGID、端子内部名、Image入力が出力へ与える影響の全条件、Stereo VRの納品互換性、レンダリング品質、edition差は未確認です。Manual上のショート表記[3SC]をスクリプト用REGIDと同一視しません。
