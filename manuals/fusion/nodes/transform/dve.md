---
title: DVE
description: 2D画像をX/Y/Z軸に回転させ、遠近感・Z方向の移動や変形前後のマスクを組み合わせるFusion Node。
doc_type: node
term_id: dve
term_short: DVEは、2D画像を奥行き方向に動かし、傾きや遠近感を付ける変形Node。
verification: partial
aliases: [DVE, Digital Video Effects]
concepts: [image-data, transform]
nodes: [DVE]
node_family: transform
controls: [Pivot X, Pivot Y, Pivot Z, Rotation Order, XYZ Rotation, Center X, Center Y, Z Move, Perspective, Black Background, Fill Black, Alpha Mode]
inputs: [image, mask]
outputs: [image]
tasks: [transform-image, perspective, animate, compositing]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-17"
---

# DVE

DVE（Digital Video Effects）は、**平面の画像をX・Y・Z軸に回転させたり、奥行き方向に移動したように見せたりする**Nodeです。古い放送用編集機にあるDVEのように、画像を斜めに倒し、遠近感を付けて別の画面へ重ねる演出に向いています。

たとえば、モニター画面の素材を手前にせり出すように動かす、複数の映像を斜めに並べる、画面の一部分だけを切り離して回す、といった用途です。名前に「3D」の意味合いがあっても、DVEが受け取るのは2D Imageであり、出力も変形後の2D Imageです。3DのSceneやカメラを作成するNodeではありません。

## 入力 / 出力

| 接続 | 役割 | 適用するタイミング |
| --- | --- | --- |
| **Input**（オレンジ） | 変形する元の2D Image | DVE処理の対象 |
| **DVE Mask**（白） | 変形に含めたい領域を指定するマスク | **変形前**。指定領域とマスクの両方がDVEで変形される |
| **Effect Mask**（青） | DVEの処理結果を適用する範囲を制限するマスク | **処理後**。一般的なEffect Maskとして働く |
| **Output** | 変形後の2D Image | 後段のMergeなどに渡す |

DVE MaskとEffect Maskは同じ「マスク」でも、変形の前か後かが異なります。たとえば、丸い窓に映る映像ごと傾けるにはDVE Maskを使います。一方、変形した映像を画面上の固定領域にだけ見せるなら、処理後のEffect Maskを検討します。

```text
映像 Image ─────────→ DVE ─→ Merge（Foreground） ─→ MediaOut
                       ↑
               必要ならDVE Mask
背景 Image ──────────────────→ Merge（Background）
```

これはDVEが変形した前景を背景映像の上へ重ねる例です。MergeのForeground / Backgroundは合成上の役割で、DVEのマスク端子とは別です。

## Controlsタブ

### Pivot X / Y / Z — 回転と拡大縮小の支点

**Pivot**は画像がどこを中心に回るかを指定します。X/Yの既定値は`0.5, 0.5`で画像中央、Zの既定値は`0`です。左端を支点に開くパネルのような動きなら、Pivotを中央から移してから回転させます。

### XYZ RotationとRotation Order

**XYZ Rotation**でX軸・Y軸・Z軸を中心とした回転を指定します。

- **X軸**：画像の上下方向に遠近感が出るような傾き。
- **Y軸**：画像の左右方向に遠近感が出るような傾き。
- **Z軸**：画像の平面内での回転。

これは各軸が担う見た目を理解するための説明です。複数軸を同時に回す場合は、**Rotation Order**で回転を適用する順序を選びます。順序を変えると最終的な姿勢も変わり得るため、InspectorとViewerで比較します。

### Center X / Y

変形後の画像を画面のどこへ置くかを指定します。既定の`0.5, 0.5`は画面中央です。Pivotが**回転の支点**であるのに対し、Centerは**画像の配置位置**です。

### Z Move

画像が手前へ近づく、または遠ざかるような見え方を与えます。Z Moveをアニメーションすると、画面が奥から迫るようなズーム演出を作れます。これは入力Imageを3D Sceneへ変換する操作ではありません。

### Perspective

X/Y軸に傾けた画像の遠近感を追加調整します。カメラのField of View（画角）を変えたときのように、奥行き方向の見え方を変えるための設定です。X/Y回転と組み合わせて使い、平面内のZ回転だけでは分かりにくい場合があります。

## Maskingタブ — 変形した部分と元画像をどう重ねるか

DVEには、変形前にマスクで取り出した領域を扱うための独立したMaskingタブがあります。通常の青いEffect Maskだけでは、同じ処理にはなりません。

- **Black Background**：変形された画像のうち、DVE Maskの外側を消します。
- **Fill Black**：変形する前の入力画像から、DVE Maskの内側を消します。動かす部分を元の位置から切り抜く用途です。
- **Black BackgroundとFill Blackの両方を有効化**：マスクで選んだ変形後の領域だけを見せる構成になります。

**Alpha Mode**は、変形した領域を元画像へ内部合成するときのAlpha処理を選びます。

| Mode | 21.1 Manualでの位置づけ |
| --- | --- |
| **Ignore Alpha** | 入力画像のAlphaを無視し、マスクされた部分を不透明として扱う |
| **Additive** | AlphaがすでにRGBへ乗算されたPremultiplied画像の合成に使う |
| **Subtractive** | AlphaがRGBへ乗算されていない画像の合成に使う |

Premultipliedとは、RGB値にAlpha値が掛けられている状態です。半透明の境界に黒い縁や不自然な重なりが現れる場合は、Alpha Modeと素材側のAlpha状態を合わせて確認します。すべての素材で一律にAdditiveを選ぶ設定ではありません。

## 運用例1：映像パネルを傾けて手前に出す

**入力**は、背景の撮影映像と、別に用意した動画または透過画像です。**結果**は、斜めに傾いた映像パネルが背景の手前へ現れる合成です。

```text
パネル用映像 → DVE ───────→ Merge（Foreground）
背景映像 ─────────────────→ Merge（Background） → MediaOut
```

1. パネル用の2D ImageをDVEのオレンジInputへ接続します。
2. XYZ RotationのXまたはYで画像を傾け、Perspectiveで遠近感を調整します。
3. Pivotを変更し、どこを軸に開くか決めます。Centerで画面上の配置位置を決めます。
4. Z Moveを時間とともに変え、パネルが近づくように見せます。
5. DVEの出力をMergeのForegroundへ、背景映像をBackgroundへ接続します。Viewerで画面外へのはみ出しとAlpha境界を確認します。

パネルを後で差し替えるなら、DVEの前へ別のImageを接続し直すだけで同じ動きを再利用できます。追跡が必要な実写の看板・モニターへ貼る場合は、[Planar Transform](../tracking/planar-transform)を使う方が適することがあります。

## 運用例2：映像の一部分だけを動かす

**入力**は、1枚の映像と、動かしたい物体を囲んだPolygon Maskです。狙う結果は、元の映像全体を回すのではなく、物体の部分だけをDVEで傾けて移動させることです。

```text
映像 Image ─────────→ DVE ─→ 変形した2D Image
Polygon Mask ───────→ DVE Mask（白）
```

1. Polygonで動かしたい領域を囲み、DVE Maskの**白い入力**へ接続します。
2. DVEでRotationやCenterを調整します。マスクで選んだ領域も変形に追従します。
3. MaskingタブのBlack Background / Fill Blackを切り替え、変形後の部分だけを残すか、元の位置にあった部分をどう扱うか確認します。
4. 半透明の境界が不自然なら、素材のAlpha状態とAlpha Modeを確認します。

ここで青いEffect MaskへPolygonをつなぐと、**変形後の適用範囲**を制限する操作になり、切り抜いた形状を一緒に動かす目的とは異なります。また、DVEは切り抜きで生じた元画像の穴を自動修復するものではありません。

## 近いNodeとの使い分け

| Node | 向いている用途 |
| --- | --- |
| [Transform](./transform) | 2D画像のCenter・Size・Angleなど、平面的な配置・回転・拡大縮小 |
| **DVE** | X/Y/Z回転、Z Move、Perspective、変形前マスクを使う映像パネル演出 |
| [Planar Transform](../tracking/planar-transform) | Planar Trackerで得た平面の動きを画像やマスクへ適用 |
| [Merge](../compositing/merge) | 変形した画像と背景映像を重ね合わせる |

Pivot・Centerの違いは[Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)も参照してください。通常のTransformノードのSizeは出力解像度を変更しません。画像のWidth / Height自体を変える場合は[Transform / Formatノード一覧](./)からResize・Scale・Letterboxを選びます。

## 出典・確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 120「Transform Nodes」、**pp.2865–2867**。DVEの用途、3つの入力、ControlsタブのPivot・Rotation Order・XYZ Rotation・Center・Z Move・Perspective、MaskingタブのBlack Background・Fill Black・Alpha Modeを確認しました。本文の2つの構成例はこれらの仕様をもとにした制作向けの説明で、実機のレンダリング結果を再現確認したものではありません。

内部REGID、Inspectorの全Controlのrange、Edition別制約、現在のFusion実機でのAlpha処理は未検証のため、`verification: partial`としています。
