---
title: Immersive / 360°ノード
description: 360°映像の投影形式、パッチ修正、回転補正、3Dシーンからの球面レンダリングを使い分けるFusion 21.1向けガイド。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, immersive, 360-video]
updated: "2026-10-10"
---

# Immersive / 360°ノード

FusionのVR関連ツールは、**撮影済みの360°映像を直す**処理と、**3Dシーンから360°映像を作る**処理に分けて考えると選びやすくなります。両者は同じ球面映像を扱いますが、Node間で流れるデータは必ずしも同じではありません。

360°映像でよく使う**LatLong（正距円筒図法／equirectangular）**は、球の周囲の方向を長方形の画像へ並べる形式です。横は経度0〜360°、縦は緯度−90〜＋90°に対応します。通常の平面動画と違い、画像の左右端は球面上ではつながっており、上下端は極に相当します。たとえば左右の端をまたぐ物体を普通の2D Transformで動かすと、不自然な切れ目や伸びが見えることがあります。

## 目的別の選び方

| 目的 | Node | 入力と結果 |
| --- | --- | --- |
| 球面画像の配置形式を変える | [PanoMap](./panomap.md) | LatLong／Cube系などの**2D画像**を、別の球面レイアウトの2D画像へ変換する |
| 360°映像の一部を平面で修正する | [Lat Long Patcher](./latlong-patcher.md) | LatLong画像の一部分をExtractで平面化し、修正結果をApplyで元の位置へ戻す |
| イマーシブ画像の一部を平面で修正する | [Immersive Patcher](./immersive-patcher.md) | Undistortで画像を作業しやすい平面へ展開し、Distortで戻す |
| 手持ち撮影などの回転揺れを補正する | [Spherical Stabilizer](./spherical-stabilizer.md) | 球面形式の**2D動画**を解析し、パン・チルト・ロールの揺れを補正する |
| 3D空間を全方向へレンダリングする | [Spherical Camera](./spherical-camera.md) | **Classic 3Dシーンに使うカメラ**。Renderer 3Dと組み合わせて360°画像を作る |

**Spherical Cameraの分類に注意してください。** 21.1 Reference ManualはVRの章でも紹介していますが、Effects Library上は**3Dカテゴリ**のNodeです。単体で2D画像を出力するエフェクトではなく、3Dシーンへ加え、Renderer 3Dで画像化します。このサイトでは従来のURLを維持するため、本Familyからも案内しています。

## 映像形式を先に確認する

| 形式 | 画像の並び方 | 代表的な比率 |
| --- | --- | --- |
| **LatLong** | 360°の方向を1枚の横長画像へ展開 | 2:1 |
| **HCross / VCross** | 立方体の6面を十字形へ配置 | 4:3 / 3:4 |
| **HStrip / VStrip** | 立方体の6面を横一列／縦一列へ配置 | 6:1 / 1:6 |
| **VR180** | 正面180°を扱う立体視用形式 | 21.1 ManualのPanoMap節では1:1 |

比率が一致しても、その画像が正しい球面データであるとは限りません。投影形式と左右眼の配置を確認してからNodeへ入力してください。PanoMapの**From／To**で形式を指定でき、FromのAutoは画像のメタデータとフレームの縦横比を参照します。

## 運用例

### 360°映像に映り込んだ機材を消す

```text
LatLong元映像 ────────────────┐
        │                    │
        ↓                    ↓
Lat Long Patcher [Extract]  Merge [Background]
        │                    ↑
   Paint／合成で修正           │
        │                    │
  修正部分をAlphaで分離        │
        │                    │
Lat Long Patcher [Apply] ──→ Merge [Foreground]
                             │
                          完成映像
```

最初のPatcherで修正したい方向を平面化し、機材を隠す画像を作ります。2つ目では**同じRotationとRotation Order**を使い、修正部分だけを元の球面上へ戻します。画像全体を何度も平面化・再変換すると、不要な再サンプリングが起こり得ます。Manualは透明背景の描画や文字をAlphaで戻す方法を説明しています。上の図は考え方を示したもので、具体的なPaintやMergeの接続は修正内容に合わせて組みます。

イマーシブ形式を扱う場合はImmersive Patcherの**Undistort → 平面で処理 → Distort**も候補です。ただし、Lat Long Patcherの2番目の入力は**Effect Mask**、Immersive Patcherの2番目の入力は**Metadata**であり、端子を同じものとして扱わないでください。

### 撮影済み360°映像の揺れを落ち着かせる

```text
LatLong動画 → Spherical Stabilizer → 360°出力
```

Spherical Stabilizerは画像内の特徴を追跡し、回転運動を推定して補正します。**Stabilization Strength**は補正の強さ、**Smoothing**は向きを固定する補正とカメラ移動を残す滑らかな補正の間を調整する項目です。新しい視点の画像を生成する処理や、CGのカメラを動かす処理とは異なります。

### 3Dの空間を360°画像として書き出す

```text
3Dオブジェクト ──┐
                ├→ Merge 3D → Renderer 3D → 360°画像
Spherical Camera┘
```

Spherical Cameraの**Layout**でLatLongやCube形式を指定し、Renderer 3Dで画像化します。すでに撮影した360°動画を別レイアウトへ変換するだけなら、Spherical CameraではなくPanoMapを使います。

## Studio版・バージョン上の注意

DaVinci Resolve **21.1 Reference Manual**のChapter 122では、VRカテゴリと**Lat Long Patcher、PanoMap、Spherical Stabilizer**をDaVinci Resolve Studio／Fusion Studio向けと明記しています。VR180のサポートもStudio限定として説明されています。これらの注記だけを根拠に、3DカテゴリにあるSpherical CameraのFree／Studio差まで断定しません。

同章ではApple Immersive用のViewer表示、VR180、各種球面レイアウトも扱います。ただし、すべてのNodeが全形式を同じように入出力できるという意味ではありません。Nodeの入力条件と作業モードは各記事で確認してください。

## 出典・確認範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』、Chapter 122「VR Nodes」（pp.2947–2958）。Lat Long Patcher／PanoMap／Spherical Camera／Spherical Stabilizerの区分、形式、入出力の概略、制作例を確認しました。公式資料は[Blackmagic Design Support](https://www.blackmagicdesign.com/support)で案内されています。

**verification: partial**：21.1実機での出力形式の互換性、各NodeのREGID、全Controlのdefault／range、Rendererの画質、Editionの全組み合わせは未検証です。詳細設定と未確認事項は各Nodeの記事を参照してください。
