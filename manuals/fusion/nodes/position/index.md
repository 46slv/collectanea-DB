---
title: Positionノード（World Position / Volume）
description: 各画素の空間位置を利用するZ to World Pos、Volume Fog、Volume Maskの違いと使い方を説明する。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, world-position, depth, volume]
updated: "2026-10-10"
---

# Positionノード（World Position / Volume）

Position Nodeは、**画像に写った面が3D空間のどこにあるか**という情報を使い、その位置に応じて霧を付けたり、空間内の一定範囲だけを補正したりするNodeです。DaVinci Resolve 21.1 Reference Manualの**Chapter 115「Position Nodes」**には、Z to World Pos、Volume Fog、Volume Maskの3つが掲載されています。

これは**左右眼を撮影したStereo映像専用のNodeではありません**。必要な位置・深度データを含むCGレンダーにも使えます。

## Z深度とWorld Position Pass

**Z深度**は画素に写った面の奥行きに関する1つの値です。一方、**World Position Pass（WPP）**は画素ごとに、3D空間内の位置を**X・Y・Zの3つの値**で記録します。

たとえば同じ距離にある2つの物体でも、WPPがあれば「画面の左にあるもの」ではなく「**3D空間の右側にあるもの**」だけを選ぶような処理ができます。WPPの値をRGBへ入れることがありますが、それは色ではなく位置です。**0～1を超える値や負の値にも意味がある**ので、表示用の色画像と同じように丸めないでください。[補助Channel / AOV](../../learn/02-data/auxiliary-channels.md)の概念も参照してください。

## 目的から選ぶ3つのNode

| Node | 入力の要件 | 結果 |
| --- | --- | --- |
| [Z to World Pos](../stereo/z-to-world.md) | Z深度付き画像と対応するCamera 3Dなど | Z深度から各画素の世界座標（XYZ）を作る。逆にWPPからZ深度を求める方向にも対応する。 |
| [Volume Fog](../stereo/volume-fog.md) | World Positionの情報を持つ画像など | 3D空間に置いた領域に応じ、2D画像へ霧を合成する。 |
| [Volume Mask](../stereo/volume-mask.md) | World Positionの情報を持つ画像など | 球体・直方体などの範囲に当たる画素をマスクし、色調整などの対象を選ぶ。 |

**霧を描くか、補正対象の範囲を選ぶか**でVolume FogとVolume Maskを使い分けます。Inspector設定や正確な端子は各記事を参照してください。

## 運用例：CGのZ深度から霧を置く

CGからカラー画像、Z深度パス、レンダリングに使ったカメラを用意できる場合を想定します。

~~~text
CG画像・Z深度 ──→ Z to World Pos ──→ XYZ位置情報を持つ画像
対応するCamera 3D ──────────────┘             │
                                   Volume Fog / Volume Mask
~~~

1. 元画像に対応したZ深度を用意します。**通常のRGB映像だけでは欠けているZ深度を自動的には復元できません**。
2. Z to World Posへ深度と、元画像を撮影・レンダリングしたカメラ情報を渡して、画素ごとの世界座標を計算します。
3. Volume Fogなら霧の形・密度・照明を調整します。Volume Maskなら球や箱の範囲を指定して、Color Correctorなどを当てる場所を選びます。
4. 空間座標とカメラが元データと一致するか、背景や物体の境界に予期しない結果がないかを確認します。

上の図は**情報と処理の流れ**を示す概略で、各Nodeの全端子の配線図ではありません。具体的な端子や別入力については各Nodeの記事を確認してください。21.1 Manualに基づく構成例であり、実機レンダリング済みではありません。

## 失敗しやすい点

- **座標系を一致させる**：WPPはWorld Spaceを前提に扱います。Object SpaceやCamera Spaceで書き出した位置を同じ値として使わないでください。
- **32-bit floatで保持する**：Manualは位置情報の精度を保つため32-bit浮動小数点を説明しています。0～1に正規化・切り詰めた色画像では座標が失われます。
- **空白の背景に注意する**：位置を持たない背景が（0, 0, 0）として扱われると、原点付近の霧やMaskが背景に載る場合があります。Manualには遠方の球体・箱を背景として配置する対処例があります。
- **元画像と同じカメラが必要**：Z深度から世界座標を復元する場合、別のカメラで計算すると位置関係が一致しません。
- **Stereo視差とは違う**：[Disparity To Z](../stereo/disparity-to-z.md)は左右眼の画像から視差を得てZ深度へ変換します。Z to World Posは既存のZ深度を**XYZ位置へ変換**します。

## 関連Family・既存のURL

- [Stereo 3D](../stereo/)：左右眼の画像と視差を処理します。
- [Deep / Auxiliary Channel](../deep/)：Z・Normal・UVなどの補助情報を利用します。
- [Classic 3D](../3d/)：Camera 3DやRenderer 3Dなど、3Dシーン自体を扱います。

**3つの記事は従来のURLを維持しています。** ファイルは旧Stereoフォルダーに置いたままですが、Manual上の分類とカタログの`node_family`はPositionへ修正しました。ファイルの所在を機能分類と混同しないでください。

## 出典・確認範囲

一次資料：Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』、**Chapter 115「Position Nodes」pp.2704–2720**（Volume Fog pp.2705–2711、Volume Mask pp.2712–2715、Z to World Pos pp.2716–2719）。

**verification: partial**：公式の3 Node分類とWPPの基本的な意味を確認しました。21.1実機の各端子・内部ID・初期値・処理結果、Free／Studioの個別availabilityは未検証です。Stereo NodeのStudio限定をPosition全体へそのまま適用しません。
