---
title: Transform / Formatノード
description: 2D画像の配置・奥行き感のある変形と、出力解像度・縦横比を変更する処理を目的から選ぶためのガイド。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, transform-image, resize, crop, format]
updated: "2026-10-24"
---

# Transform / Formatノード

Fusionで画像の大きさを変えるときは、**同じ画像サイズの中で見た目を動かしたいのか、後段へ渡す画像のピクセル寸法を変えたいのか**を先に決めます。どちらもViewerでは「小さくなった」と見えることがありますが、Mergeで合成すると結果が変わります。

ここでいうImageはFusionの2D画像データです。3D空間に配置するSceneとは異なります。出力のWidth / Heightは画像が持つピクセル寸法、CenterやPivotは画像をどこへ配置し、どこを支点に動かすかを表します。

## 目的から選ぶ

| 作りたい結果 | Node | 変化するもの |
| --- | --- | --- |
| ロゴや映像の位置・大きさ・角度を動かす | [Transform](./transform) | 2D画像内の配置。出力解像度は維持する |
| 画像をX/Y/Z方向に回転したように見せ、パースや奥行き方向の移動も加える | [DVE](./dve) | 2D画像の見え方。3D Sceneは出力しない |
| 手持ち撮影のような揺れを与える | [Camera Shake](./camera-shake) | 画像の揺れ。詳細Controlは個別記事の確認範囲を参照 |
| 解析した平面の動きをロゴやマスクへ適用する | [Planar Transform](../tracking/planar-transform) | Planar Trackerの追跡結果に沿った変形 |
| 最終的な幅・高さをピクセル数で指定する | [Resize](./resize) | 出力ImageのWidth / Height |
| 入力画像に対する倍率でピクセル寸法を変更する | [Scale](./scale) | 出力ImageのWidth / Height |
| 画像の一部を切り出す、キャンバスの範囲を変える | [Crop](./crop) | 残す範囲と出力Imageの寸法 |
| 違う縦横比のフレームに全体表示するか、はみ出す部分を切り取る | [Letterbox](./letterbox) | 出力解像度とフレーミング |

DVEでX/Y軸を回転して見える遠近感は、3Dモデルを配置する処理ではありません。また、動く壁や画面にグラフィックを自動追従させたいなら、手作業でDVEをキーフレーム化する前にPlanar TrackerとPlanar Transformを検討します。

## 同じ見た目でも、出力データは違う

1920×1080の画像を「半分」にする例です。

```text
1920×1080 Image → Transform（Size 0.5） → 1920×1080 Image
1920×1080 Image → Scale（Size 0.5）     → 960×540 Image
1920×1080 Image → Resize（960×540）    → 960×540 Image
```

Transformは**元と同じ寸法のキャンバス内で**画像を縮小します。ScaleとResizeは、後段へ渡すImage自体のピクセル寸法を変えます。前者は入力に対する倍率で、後者は目標の幅と高さで指定します。

Cropでは指定範囲を残せます。たとえば1920×1080から1080×1080の正方形領域を取り出すなら、画像の一部分を残して出力サイズを変更します。元の映像全体を保ったまま16:9へ入れたい場合とは目的が異なります。

### 実機の参考例

<!-- capture-reuse:R35 -->

1920×1080の同じcanvas内で、TransformのCenter 0.65／0.55、Size 1.25、Angle 12°を設定しました。左が入力、右が変形後です。

[![S06の実機撮影例。Node Editorの接続](/img/fusion/captures/S06/graph.png)](/img/fusion/captures/S06/graph.png)

[![S06の実機撮影例。左右Viewerの比較](/img/fusion/captures/S06/compare.png)](/img/fusion/captures/S06/compare.png)

Resolve Studio 21.1.0.14／Windowsで撮影済みのS06を再利用した参考例です。通常のTransformの例です。ResizeやScaleによる出力寸法の比較は別途撮影します。 [元の撮影条件と確認範囲](/img/fusion/captures/S06/capture.json)

## 合成での接続例

### 透過ロゴを小さく重ねる

```text
ロゴ Image → Transform ─────────→ Merge（Foreground） ─→ MediaOut
背景 Footage ───────────────────→ Merge（Background）
```

ロゴのCenterとSizeをTransformで調整します。背景を1920×1080のまま保ちたいなら、ロゴをScaleで960×540にしてもMerge全体が960×540になるとは限りません。Mergeの出力解像度はBackground入力が基準です。

### 斜めに起き上がる画面を作る

```text
画面のImage → DVE ─────────────→ Merge（Foreground）
背景 Footage ──────────────────→ Merge（Background）
```

DVEのXYZ Rotation、Z Move、Perspectiveで、平面的な画面が傾いて手前に現れるような見え方を作ります。DVEへの入力もMergeへ渡す出力も2D Imageで、3D Rendererを挟む構成ではありません。必要な部分だけを動かす場合は[DVE MaskとEffect Maskの違い](./dve)を先に確認します。

### 横長素材を16:9の納品フレームへ合わせる

```text
2048×858 Image → Letterbox（1920×1080） → MediaOut
```

[Letterbox](./letterbox)では、映像全体を残して上下に帯を追加するLetterbox/Envelopeと、縦幅いっぱいに拡大して左右を切り出すPan-and-Scanを選べます。どちらも出力は指定した1920×1080です。[Resize](./resize)だけを使う場合は、縦横比をどう維持するかを別途確認してください。

## 解像度と座標の注意点

[Merge](../compositing/merge)ではBackgroundの解像度が合成出力の基準です。Resize・Scale・Crop・LetterboxをBackgroundの前へ置いた場合は、後段の出力サイズも変化し得ます。

Centerの値を読むときは[正規化座標](../../learn/03-space/normalized-coordinates)と[Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)を参照してください。TransformにあるReference Sizeは座標の表示・入力の参照寸法で、ResizeやLetterboxの出力寸法変更とは違います。[解像度 / アスペクト比](../../learn/03-space/resolution-aspect)と[Domain of Definition](../../learn/03-space/domain-of-definition)も関連します。

21.1 Manualは、出力の物理解像度を変えるCrop・Resize・Scale・Letterboxの寸法Controlをアニメーションする運用を推奨していません。画面内で物体が近づく演出にはTransformやDVE、Pan-and-Scanで見せる範囲を動かす用途にはLetterboxのCenterを検討します。

## 出典・確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 120「Transform Nodes」、pp.2862–2883を基に、各Nodeの役割・データの違い・接続例を整理しました。DVEはpp.2865–2867、Letterboxはpp.2868–2870を参照しています。Planar Transformは追跡系の個別記事へ案内しています。

このOverviewは接続判断のための説明です。現在のホストに表示される内部REGID、各Controlの細かなrange、Edition別の提供範囲を一括で実機検証したものではありません。
