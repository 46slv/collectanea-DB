---
title: "Material Merge 3D"
description: "2つのMaterialや2D Image由来の材質を混ぜ、1つのMaterialとして3D Objectへ渡すNode。"
doc_type: node
term_id: "material-merge-3d"
term_short: "Material Merge 3Dは、BackgroundとForegroundの材質をBlendで混ぜ、1つの3D Materialを作るNode。"
verification: partial
aliases: ["Material Merge 3D", "3MM"]
concepts: ["classic-3d"]
nodes: ["Material Merge 3D"]
node_family: "materials-lights"
controls: ["Blend", "Material ID"]
inputs: ["material", "image"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Material Merge 3D

Material Merge 3D [3MM]は、**2つの材質を混ぜ、1つのMaterialとして出力する**Nodeです。色や光沢を決めるBlinn、凹凸を表現するBumpMapなど、別々に作ったMaterialを組み合わせて3D Objectの表面に使います。

Materialは3D Objectの表面をどのように描画するかを決める情報です。Object・Camera・Lightをまとめる[Merge 3D](../3d/merge-3d.md)とも、2D画像のpixelを重ねるMergeとも異なり、Material Merge 3D自体は**3D sceneを作りません**。

## 入力

### Background Material（オレンジ）

混合の基礎になるMaterialを接続します。3D Materialだけでなく2D Imageも受け取れます。たとえばBlinnを入れれば、その色や光沢の表現が混合の基礎になります。

### Foreground Material（緑）

Background側へ混ぜるもう1つのMaterialを接続します。3D Materialまたは2D Imageを受け取れます。2D Imageを入力した場合は、基本シェーディングモデルの**diffuse texture map（表面色を決める画像）**として扱われます。

**2入力とも接続が必要です。** 画像用のDissolveのように、片方の入力だけで使うことはできません。

## 出力と接続

出力は混合後の**単一の3D Material**です。入力に2D Imageを使っても、出力は2D Imageや3D sceneにはなりません。

出力をShape 3Dなどの3D ObjectのMaterial inputへ接続し、そのObjectをRenderer 3Dで描画すると、表面の変化を2D Imageとして確認できます。

```text
Blinn ──────(Background)─┐
                         ├─ Material Merge 3D → Shape 3D [Material] → Renderer 3D → 2D Image
BumpMap ────(Foreground)─┘
```

これは接続関係を示す構成例です。BumpMapには必要に応じて凹凸用の画像を前段から渡します。

## Inspectorの主な設定

### Blend

BackgroundとForegroundをどの割合で混ぜるかを指定するスライダーです。2D Image用のDissolveに似ていますが、ここで混ぜるのは**材質**であり、完成映像のpixelではありません。

たとえばBackgroundに色や光沢の基礎となるBlinn、Foregroundに別の質感のMaterialを接続し、Blendを調整して1つのObjectに使う表面の見え方を決めます。

### Material ID

合成したMaterialへ数値IDを割り当てます。Renderer 3Dで対応する補助チャンネルの出力を有効にすると、IDを**MatID auxiliary channel**へ出力できます。

Material Merge 3DでIDを設定しただけで、最終画像にMatIDが自動的に出るわけではありません。Renderer 3D側の出力設定も必要です。

Settings tabには他の3D Nodeと共通の設定がありますが、本記事では個別の挙動や既定値を推測しません。

## 主な用途・運用例

### Blinnの基礎材質に凹凸表現を組み合わせる

BlinnをBackgroundに、BumpMapをForegroundに接続します。BumpMapは、表面に細かな凹凸があるような見え方を作るMaterial系Nodeです。

1. BlinnとBumpMapをMaterial Merge 3Dの2つの入力へ接続する。
2. Material Merge 3Dの出力をShape 3DのMaterial inputに接続する。
3. Shape 3DをRenderer 3Dで描画し、Blendを変更して表面の違いを確認する。

この構成では、完成した2D画像へ凹凸画像を重ねているのではありません。**3D Objectを描画する前に、表面の材質を組み立てています。** ManualでもBlinnなどのシェーダとテクスチャ系Materialを組み合わせる構成が示されています。

### 2D Imageを材質へ組み込む

Material入力へ2D Imageを接続すれば、画像を表面色のテクスチャとして利用できます。もう一方へ別の3D Materialを接続し、Blendで混合具合を調整します。

これは画像を板状の3D Objectとして配置するImage Plane 3Dとは違います。Material Merge 3Dは**Objectへ割り当てる材質を作る**Nodeです。

### 材質ごとのIDをレンダリングへ残す

混合後のMaterialへMaterial IDを設定し、Renderer 3D側でMatID出力を有効にします。後段で材質に対応する領域を区別するための補助情報として利用できます。

## 似たNodeとの違い

- **[Replace Material 3D](../3d/replace-material-3d.md)** — 既存scene内のObjectに割り当てられたMaterialを別のMaterialへ差し替える。2つのMaterialそのものを混ぜる役割ではありません。
- **[Merge 3D](../3d/merge-3d.md)** — Object・Camera・Lightを3D sceneへまとめる。Materialの出力をMerge 3DのScene inputへ直接つなぐ構成とは異なります。
- **[Renderer 3D](../3d/renderer-3d.md)** — 3D sceneを2D Imageとして描画する。MatID補助チャンネルの出力もここで有効にします。

Material Merge 3Dの後段へは、まずMaterial inputを持つ3D Objectを接続します。3D sceneへ直接つなぐのではありません。

## 関連する考え方・Node

- [Classic 3D scene](../../learn/02-data/classic-3d.md) — Geometry、Material、Renderer 3Dの関係。
- [3D Material / Lightノード一覧](./index.md) — 材質を作るNodeとLightを作るNodeの選び方。
- [Blinn](./blinn.md) / [BumpMap](./bumpmap.md) — 入力するMaterialの例。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 90「3D Material Nodes」、**Material Merge 3D [3MM]（pp.2059–2060）**に基づき、2つの入力、各入力が受け取る型、両入力必須、Material出力、Blend、Material ID、MatID出力条件を確認しました。

Blendの正確な初期値・数値範囲、runtime REGID、Edition差、実機レンダリング結果は未確認のため、`verification: partial`を維持します。