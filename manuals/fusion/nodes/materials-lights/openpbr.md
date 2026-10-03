---
title: OpenPBR
description: 色・金属感・粗さ・凹凸などのテクスチャを、一つの3D材質へまとめる。
doc_type: node
term_id: openpbr
term_short: 色、金属感、粗さ、凹凸などの入力を持つ3D材質ノード。出力は材質であり完成画像ではない。
verification: partial
aliases: [OpenPBR, 3OP]
nodes: [OpenPBR]
node_family: materials-lights
inputs: [image]
outputs: [material]
controls: [Base Color, Metalness, Specular Roughness, Transmission, Coat, Sheen, Subsurface, Thin Film Thickness, Opacity, Thin Walled, Material ID]
tasks: [build-material]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-03'
---

# OpenPBR

表面の色、金属感、粗さ、凹凸などを一つの3D材質にまとめるノードです。各性質に別のテクスチャを使えるため、色の模様と光沢の模様を別々に調整できます。

## 入力

Manual本文は29の入力があると説明しています。初期状態で表示される三角形はオレンジ色の`Base Color`だけです。他ノードの接続線をOpenPBRへドラッグすると、接続先の選択メニューが出ます。追加の入力は接続後に表示されます。

### 接続先メニュー

p.2061の図で読める29項目を、役割別に並べています。これは図中の表示名の転記であり、スクリプト用Input IDではありません。

| 分類 | メニューにある入力名 |
| --- | --- |
| 基本の表面 | Base Color、Base、Diffuse Roughness、Occlusion、Metalness |
| 鏡面反射 | Specular Color、Specular、Specular Roughness、Specular Anisotropy、Specular Rotation |
| 透過 | Transmission Color、Transmission、Transmission Extra Roughness、Transmission Scatter |
| 上塗り層 | Coat Color、Coat、Coat Roughness、Coat Affected Roughness、Coat Affect Color、Coat Anisotropy、Coat Rotation |
| 表面のSheen | Sheen Color、Sheen、Sheen Roughness |
| 内部散乱 | Subsurface Color、Subsurface、Subsurface Radius |
| 発光・不透明度 | Emission Color、Opacity |

### 凹凸とAmbient Occlusion

同じp.2061には、法線・凹凸のテクスチャを[BumpMap](./bumpmap)へ入れ、その出力をOpenPBRのBumpmap入力へ接続する構成もあります。上の29項目のメニュー図と、このBumpmap入力の数え方の関係は本文で明確ではありません。実機の総端子数を29に固定した仕様表にはしていません。

このBumpMapの接続例は、任意の材質をOpenPBRへ入力して混合できることまで示すものではありません。各端子が受け付ける内部型は未確認です。

Ambient Occlusionの画像は`Occlusion`へ接続します。ManualではDomeLightまたはAmbientLightを使う場合に限り、この入力が利用できると説明しています。

## 出力

出力は3D材質です。3D形状・シーン側の材質入力へ渡します。MediaOutへ直接渡せる完成画像ではありません。

## 主な設定

### 表面の色と金属感

`Base Color`は反射やハイライトを加える前の表面色です。画像を接続した場合、Inspectorの色と画像の色が乗算されます。設定色を変えたら画像の色も変わるため、テクスチャだけで色が決まるわけではありません。

`Metalness`は画像入力の強さ、または入力がない場合の材質全体の金属感を調整します。`Diffuse Roughness`はDiffuse Roughnessテクスチャ入力の強さです。

### ハイライト

`Specular Color`は反射光の色です。`Specular Roughness`はハイライトの広がりを調整し、値を大きくすると広い範囲へ広がると説明されています。対応画像がある場合、この値は画像のAlphaと乗算されます。

`Specular IOR`は屈折率、`Specular Anisotropy`と`Rotation`は方向によって異なる粗さ・光沢とその向きを扱います。これらの数値範囲は本ページでは未確定です。

### 透過と上塗り層

`Transmission Color`、`Extra Roughness`、`Depth`、`Scatter Color`は透過色、透過層の拡散、内部を通る距離、散乱色を扱います。ManualではDepthが0のときScatter Colorは無視されます。

`Coat`系は材質の上に追加する層です。色、粗さ、屈折率、方向性と回転を調整します。

### 布・内部散乱・薄膜

`Sheen`は表面の散乱層です。Sheen Roughnessが低いと光沢のある布、高いと粉っぽい外観になると説明されています。

`Subsurface`はプラスチック、大理石、肌などの内部散乱を扱います。Radius X/Y/ZとScaleで散乱距離に関わる値を調整します。`Thin Film Thickness`と`Thin Film IOR`は薄膜干渉による色の変化を扱います。

### 不透明度と面の扱い

`Opacity`は各チャンネルの材質値を減らし、三つのチャンネルを0にすると透明になると説明されています。`Thin Walled`を有効にすると、内部や裏側を持たない面のように振る舞います。

`Receives Lighting/Shadows`は照明・影を受けるかどうかです。`Two Sided Lighting`は裏側に逆向きの法線を加えて照明を扱う設定であり、単に裏面の表示を切り替える設定と同一ではありません。`Material ID`は、対応する描画設定でMatID補助チャンネルへ出す識別番号です。

## 最小構成と運用例

```text
色の画像 ─────────────────────→ OpenPBRのBase Color
凹凸用の画像 → BumpMap ──────→ OpenPBRのBumpmap
OpenPBR ─────────────────────→ Shape3Dの材質入力
```

p.2061の図は、二つのFast NoiseとBumpMapを使ってこの関係を示しています。まず色の画像だけで材質の色を確認し、その後で凹凸の経路を追加すると、二つの入力の役割を分けて観察できます。これはManualの構成に基づく手順案で、実機追試は未実施です。

## 似たノードとの違い

[Material Merge 3D](./material-merge-3d)は二つの材質を混ぜます。OpenPBRは色・粗さ・金属感など異なる性質の入力を、一つの材質として組み立てます。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 90、pp.2060–2066。本文とp.2061の接続メニュー・構成図を確認しました。

Base、Specular、Transmission、Coatなどの係数には、本文でAlphaに関する似た説明が繰り返されています。本ページではその記述を独自の「物理的な重み」の定義へ置き換えていません。正確な評価式、全既定値、端子の内部型、Edition差は実機確認待ちです。
