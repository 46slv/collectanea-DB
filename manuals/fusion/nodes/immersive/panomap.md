---
title: "PanoMap"
description: "360°／VR映像をLatLong・Cube Map・VR180・Immersiveなどの配置形式へ変換するFusion Node。From／To、Rotation、入力形式と具体的な使い方を説明。"
doc_type: node
term_id: "panomap"
term_short: "PanoMapは、同じ球面の映像をLatLongやCube Mapなど別の画像配置へ変えるNode。必要に応じて向きも回転する。"
verification: partial
aliases: ["PanoMap", "PAM"]
concepts: ["image-data"]
nodes: ["PanoMap"]
node_family: "immersive"
controls: ["From", "To", "Rotation Order", "Rotation"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["process-immersive"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-10"
---

# PanoMap

**PanoMap**は、周囲360°を記録した画像の**並べ方を別の形式へ変換するNode**です。たとえば、横長のLatLong映像を、立方体の6方向を十字形に並べるHCrossへ変換できます。画像の内容やカメラの撮影位置を新しく作り直す機能ではなく、**同じ方向にある画素を、別の位置へ並べ直す**ために使います。

球面映像では、1枚の長方形のどの画素が「正面」「右」「真上」に当たるかを、投影形式で定めています。通常の2D Transformは画像上の位置を動かしますが、PanoMapは**球面上の方向の対応を保ちながら**形式を変えます。元画像が普通の16:9動画であっても、PanoMapだけで全方向の映像が手に入るわけではありません。

**対応Edition**：DaVinci Resolve 21.1 Reference Manualは、VRカテゴリとPanoMapを**DaVinci Resolve Studio／Fusion Studio限定**と明記しています。

## 入力と出力

公式21.1 Manualでは、Node Editorに**2つの入力**があります。

| 端子 | データ | 用途 |
| --- | --- | --- |
| **Image Input**（オレンジ） | LatLongやCube Mapなど、球面形式で配置された2D RGBA画像 | 元の球面映像を渡す。InspectorのFromで元の配置形式を指定 |
| **Effect Mask** | 処理範囲を制限するマスク | VR Nodeではあまり使わないとManualに記載。画像自体のAlphaとは異なる |
| **出力** | 2D Image | InspectorのToで指定した配置形式へ変換した画像 |

入力は**2D画像**であり、Fusionの3Dシーン接続ではありません。3Dシーンから全方向の画像を作りたい場合は[Spherical Camera](./spherical-camera.md)とRenderer 3Dを使用します。

## Inspector：FromとTo

**From**は入力画像の配置、**To**は出力画像の配置を選びます。変換前の形式を取り違えると、正面・上下・左右の向きが崩れたり、切れ目がずれたりします。

| 形式 | 何をどのように並べるか | 代表的な画像比率 |
| --- | --- | --- |
| **LatLong** | 経度360°と緯度180°を1枚の横長画像へ展開する正距円筒図法 | 2:1 |
| **HCross** | 立方体の6つの面を**横長の十字形**に配置する | 4:3 |
| **VCross** | 立方体の6つの面を**縦長の十字形**に配置する | 3:4 |
| **HStrip** | 立方体の6面を横一列に並べる | 6:1 |
| **VStrip** | 立方体の6面を縦一列に並べる | 1:6 |
| **VR 180** | 前方180°の立体視映像を表す形式 | Manualでは1:1 |
| **Immersive** | Apple Vision Pro向けのImmersive形式 | この節では出力条件や詳細レイアウトは未確定 |

**Auto**はFrom側で入力形式を自動判定する設定です。Manualは画像の**メタデータとフレームの縦横比**を参照すると説明しています。縦横比だけでは別形式の素材と区別できない場合や、メタデータが不十分な場合もあるため、意図と違う結果になったらFromを明示的に設定します。

Cube形式のStripは、Manualでは**Left、Right、Up、Down、Back、Front（+X、−X、+Y、−Y、+Z、−Z）**の順で並ぶと説明されています。別ソフトが同じ名前で異なる面順を採用する可能性もあるため、変換結果は正面と上下の向きを実際に確認してください。

## Rotation：映像の向きを変える

PanoMapは配置形式の変換に加えて、**球面上での方向の回転**も行えます。たとえば納品先の「正面」にしたい場所が右側へずれているなら、Rotationで球面の向きを合わせます。

- **Rotation X（Pitch／Tilt）**：上下へ見上げたり見下ろしたりする方向。
- **Rotation Y（Pan／Yaw）**：水平に振り向く方向。
- **Rotation Z（Roll）**：視線の向きを軸に傾ける方向。

**Rotation Order**は、この3つをどの順序で適用するかを指定します。選択肢は6通りあります。たとえばXYZなら、X、Y、Zの順に回転します。3軸の回転は通常、順番を変えると最終的な向きも変わります。別のPanoMapや[Lat Long Patcher](./latlong-patcher.md)と向きを揃える場合は、回転角だけでなくRotation Orderも確かめます。

## 実際の使い方

### LatLongをHCrossへ変換する

既存の360°動画を、Cube形式の画像を必要とする工程へ渡す例です。

```text
MediaIn／Loader（LatLongの360°映像）
    ↓
PanoMap（From: LatLong / To: HCross）
    ↓
MediaOut／Saver（HCross画像）
```

1. 元素材が本当にLatLong形式の360°画像であることを確認します。一般的なLatLongは2:1ですが、画面比率だけで決めないでください。
2. PanoMapを追加し、Image Inputへ素材を接続します。
3. **FromをLatLong、ToをHCross**にします。Manualが示す基本的な使用例と同じ変換です。
4. Viewerで正面・背面・左右・上下の面が意図した位置へ配置されているか確認します。
5. 配置形式と出力解像度が後工程の要求に合うよう、必要なFormat／Saver設定を確認して書き出します。

HCrossの画像は、普通の1枚絵のように見えても、**各正方形が別の方向を向く立方体の面**です。十字形に配置した画面全体へ無条件にペイントすると面の境目で繋がらない場合があります。球面の一部分を修正したいときは、用途に応じて[Lat Long Patcher](./latlong-patcher.md)や[Immersive Patcher](./immersive-patcher.md)を使います。

### 360°映像の正面方向を変える

元画像の向きだけが納品仕様とずれている場合、FromとToを同じ形式にした上で、Rotationで正面を変更する方法が考えられます。たとえばLatLongをLatLongのまま使い、正面に来る方向を調整します。手動で画像を横へ移動する方法とは異なり、PanoMapは球面上の方向として扱います。

この構成でのフィルタリングや画質の差は実機で確認してください。何度も往復変換する必要はなく、目的の配置へ一度で変換できるなら処理を増やさない方が管理しやすくなります。

## 関連Nodeとの使い分け

| Node | 用途 |
| --- | --- |
| **PanoMap** | 既存の球面画像の配置形式を変える。必要に応じて球面の向きも回す |
| **[Lat Long Patcher](./latlong-patcher.md)** | 球面画像の一部を平面化して修正し、元の位置へ戻す |
| **[Immersive Patcher](./immersive-patcher.md)** | イマーシブ画像をUndistort／Distortして、平面上の修正を戻す |
| **[Spherical Stabilizer](./spherical-stabilizer.md)** | 撮影済み球面動画の回転揺れを解析して滑らかにする |
| **[Spherical Camera](./spherical-camera.md)** | Fusionの3Dシーンを全方向へ撮るカメラ。Renderer 3Dを介して画像化する |

球面画像の変換と、カメラの撮影位置を変えることは別です。PanoMapは映っていない裏側の景色を生成する機能ではありません。[Immersive / 360° Family](./index.md)も参照してください。

## バージョン・出典・未確認範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』、Chapter 122「VR Nodes」、PanoMap [PAM]（pp.2953–2954）、球面形式の概要（p.2948）。Studio限定、Image Input／Effect Mask、From／To、Auto、VR180／Immersive、Rotation Order／Rotation、HCrossへの変換例を確認しました。公式資料の入口は[Blackmagic Design Support](https://www.blackmagicdesign.com/support)です。

**verification: partial**：現在の21.1実機での内部REGID、From／Toの全組み合わせの動作、Immersive／VR180の詳細な左右眼の取り扱い、回転の初期値・範囲、画質・処理負荷、メタデータによるAuto判定の実際の精度は未確認です。Manualにない値を推測で補っていません。
