---
title: Bender 3D
description: "Classic 3Dの頂点を曲げる・細くする・ねじる・傾ける4種類の方法で変形するNode。"
doc_type: node
term_id: bender-3d
term_short: "Bender 3Dは、既存の3Dメッシュの頂点を動かし、Bend・Taper・Twist・Shearの変形を加えるNode。"
verification: partial
aliases: [Bender 3D, 3Bn]
concepts: [classic-3d, geometry]
nodes: [Bender 3D]
node_family: 3d
controls: [Bender Type, Amount, Axis, Angle, Range, Group Objects]
inputs: [classic-3d]
outputs: [classic-3d]
tasks: [build-3d-scene]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-08"
---

# Bender 3D

Bender 3D [3Bn]は、<Term id="classic-3d">Classic 3D</Term>の形状を**曲げる（Bend）・細くする（Taper）・ねじる（Twist）・傾ける（Shear）**ためのNodeです。

たとえば、まっすぐな板を弧を描くスクリーンにしたり、細分化した3D文字をねじったりできます。変えるのは形状の**頂点（vertex）**の位置です。頂点とは3Dの面を構成する点で、Bender 3Dは形状を囲む箱（bounding box）を基準に、その点の配置を変化させます。

**新しい頂点や面は作りません。** また、入力シーンにCamera・Light・Materialが含まれていても、それら自体には変形を加えず、元の設定を引き継ぎます。

## 入力と出力

- **SceneInput（オレンジ、必須）**：変形したい3Dオブジェクト、または複数のオブジェクトを含むClassic 3Dシーンを受け取ります。[Shape 3D](./shape-3d.md)、[Image Plane 3D](./image-plane-3d.md)、[Text 3D](./text-3d.md)などの出力を接続できます。
- **出力（Classic 3D）**：形状を変形した3Dシーンを返します。ここでは2D画像にはなりません。通常は[Merge 3D](./merge-3d.md)へ送り、Camera・Lightを合わせて[Renderer 3D](./renderer-3d.md)で画像にします。

```text
Shape 3D ──→ Bender 3D ──┐
Camera 3D ───────────────┼─→ Merge 3D ─→ Renderer 3D ─→ Image
Light ───────────────────┘
```

Bender 3Dは形状を作るNodeではありません。最初に3Dの形状を用意し、その後段で変形します。

## 4種類の変形

Inspectorの**Controls > Bender Type**で次の方式を選びます。

| Bender Type | 何が起きるか | 使いどころ |
| --- | --- | --- |
| **Bend** | 直線状の形状を曲線状に曲げる | 平面を湾曲したスクリーンにする |
| **Taper** | 軸に沿って断面の大きさを変化させる | 柱や文字を先細りの形へ近づける |
| **Twist** | 軸方向の位置に応じて断面を回し、形状をねじる | 帯状のオブジェクトにねじれを付ける |
| **Shear** | 軸方向の位置に応じて頂点を横へずらし、形状を斜めにする | 箱や文字を斜めに傾ける |

Bendで形状全体の向きを回転させるだけなら[Transform 3D](./transform-3d.md)でもできますが、Bender 3Dは**頂点ごとの位置関係を変える**ため、まっすぐだった面自体を曲げられます。

## Inspectorの主要設定

### Amount

**Amount**は変形の強さです。同じAmountでもBender Typeによって変形の意味が異なります。まず方式を選び、Viewerで形状を確認しながら調整します。ここでは初期値・数値範囲を推測していません。

### AxisとAngle

**Axis**は変形の基準軸を決めます。具体的な働きはBender Typeごとに異なります。Bendでは、後述のAngleと組み合わせて曲がり方の向きを決めます。他の方式では、選んだ軸を中心に変形が適用されます。

**Angle**はBendとShearで変形の方向を調整します。**TaperとTwistでは表示されません。** 曲げたい方向が違う場合は、AmountだけでなくAxisとAngleを確認してください。

### Range

**Range**は変形を形状の一部分へ限定する設定です。たとえば長い板の全体ではなく、特定の区間だけを曲げたいときに使います。

**ShearではRangeを使用できません。** 一部だけを傾ける設定としてShearにRangeがある、と考えないでください。

### Group Objects

複数の3Dオブジェクトを入力した場合に、変形の基準を切り替えます。

- **無効**：入力に含まれるオブジェクトを、それぞれ個別の形状として変形します。
- **有効**：複数のオブジェクトを1つのまとまりとして扱い、共通の中心を基準に変形します。

たとえば文字や板を複数並べ、全体を一本の帯のように曲げたい場合は、先にMerge 3Dでまとめ、Group Objectsのオン・オフを比較します。各オブジェクトをそれぞれ曲げるのか、配置全体を曲げるのかで結果が変わります。

## 具体例：平面を湾曲したスクリーンにする

[Shape 3D](./shape-3d.md)で**Plane**を作り、Bender 3DのSceneInputへ接続します。Planeは最初から湾曲しているわけではなく、複数の頂点からなる平面です。

1. Shape 3DのPlaneで横長の板を作り、**Subdivision**を増やして面を細かく分割します。
2. Bender 3DのBender Typeを**Bend**に切り替え、Amountで湾曲の強さを調整します。
3. 曲がる向きが意図と違う場合はAxisとAngleを変更します。必要ならRangeで曲げる区間を限定します。
4. Bender 3Dの出力をMerge 3Dへ接続し、Camera 3DとLightを加え、Renderer 3Dで結果を見ます。

重要なのは**SubdivisionをBender 3Dより前で増やすこと**です。Bender 3Dは既存の頂点を動かすだけなので、頂点の少ないPlaneでは滑らかな曲線にならず、折れ曲がった面に見えることがあります。分割を増やしすぎると頂点数も増えるため、必要な滑らかさを見ながら決めます。

画像を貼った板を曲げたい場合は、[Image Plane 3D](./image-plane-3d.md)を入力に使う方法もあります。画像そのものを2Dで歪めるのではなく、画像が貼られた3Dの面を曲げる構成です。

## 具体例：複数の3D文字をまとめて変形する

3D文字や別々の形状を並べ、[Merge 3D](./merge-3d.md)で1つのシーンにしてからBender 3Dへ接続します。

```text
Text 3D ────┐
Shape 3D ───┼─→ Merge 3D ─→ Bender 3D ─→ Merge 3D（Camera・Light）─→ Renderer 3D
別のShape ──┘
```

**Group Objectsを無効**にすると各要素を別々に変形し、**有効**にすると全要素の共通中心を基準にまとめて変形します。個々の文字をねじりたいのか、文字と背景を含めた構成全体をねじりたいのかで選びます。

文字や形状の輪郭が粗くなる場合は、元の形状側の分割数を確認します。Bender 3D側で頂点を増やして滑らかにすることはできません。

## 他の3D変形Nodeとの違い

- **[Transform 3D](./transform-3d.md)**：形状をまとめて移動・回転・拡大縮小します。面を曲げるためのNodeではありません。
- **[Displace 3D](./displace-3d.md)**：接続した2D画像の値に応じて頂点を移動します。画像による局所的な凹凸ならこちらが向いています。
- **[Shape 3D](./shape-3d.md)**：PlaneやSphereなどの形状を新しく作ります。Bender 3Dはその後段で既存の形状を変形します。

## 出典と確認範囲

Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月）、Chapter 88「3D Nodes」、**Bender 3D [3Bn]（pp.1916–1918）**を一次資料としています。SceneInput、4つのBender Type、Amount・Axis・Angle・Range・Group Objects、頂点を追加しないこと、Camera・Light・Materialを変更しないことを確認しました。

Inspectorの既定値・数値範囲、runtime REGID、Edition差、実機でのレンダリング結果は未検証のため、`verification: partial`を維持しています。作例の接続図と手順は、Manualの仕様を説明用に組み合わせたものです。
