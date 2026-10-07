---
title: "Weld 3D"
description: "ほぼ同じ位置に重なった3D meshの頂点を接続し直し、変形時の割れや描画上の継ぎ目を修復するNode。"
doc_type: node
term_id: "weld-3d"
term_short: "Weld 3Dは、近接した3D meshのPosition vertexを接続し直し、変形時の割れを防ぐNode。"
verification: partial
aliases: ["Weld 3D", "3We"]
concepts: ["classic-3d"]
nodes: ["Weld 3D"]
node_family: "3d"
controls: ["Weld Mode", "Tolerance"]
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Weld 3D

Weld 3D [3We]は、**3D meshの頂点位置がほぼ一致しているのに接続されていない箇所を修復する**Nodeです。

3Dモデルでは、画面上では一続きの表面に見えても、実際には別々の頂点が同じ場所に重なっていることがあります。この状態で頂点を法線方向へ押し出すと、隣り合う面が別々に動き、細い隙間が生じることがあります。Weld 3Dは、そのような隙間を作る原因になるPosition vertexを接続し直します。

**形状編集やポリゴン数の削減に使うNodeではありません。** 元から見えるほど離れている頂点を無理につなぐための機能でもありません。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualに記載されている入力は1本です。

- **Scene Input**（orange）: 修復したい3D geometryまたはClassic 3D sceneを受け取ります。
- **Output**: Weld / Fracture処理後のClassic 3D geometry / sceneを返します。

通常は、問題があるgeometryの直後へ置きます。Displace 3Dを使うと表面が割れる場合は、**Displace 3Dより前**に入れて接続状態を修復します。

```text
3D Geometry
    ↓
Weld 3D
    ↓
Displace 3D
    ↓
Merge 3D → Renderer 3D → Image
```

Weld 3Dが扱うのはClassic 3Dのmeshです。入力されたsceneを2D Imageへ変換するわけではありません。

## 何が接続され、何が残るか

Fusion 21.1 Manualで明記されているWeld対象は、**Position vertexだけ**です。Normal（法線）、texture coordinate（UV）など、他の頂点属性まで一緒にWeldするわけではありません。

Position vertexが接続されても、元のNormalが異なっていれば、面と面の境界に硬い陰影が残る場合があります。隙間と陰影の継ぎ目は同じ問題ではないため、見えている症状に応じて対処を分けます。

- 頂点の接続が切れており、Displaceすると面が割れる → Weld 3Dを検討する。
- 頂点の接続は直ったが、Normalの違いで陰影に線が残る → [Replace Normals 3D](./replace-normals-3d.md)の再計算設定も確認する。

Replace Normals 3Dの**Pre-Weld Position Vertices**はNormal計算用の一時的なWeldであり、出力geometryのPosition vertex自体は変更しません。Weld 3Dの通常のWeldとは目的が異なります。

## Inspectorの主な設定

### Weld Mode

21.1 Manualでは、Weld Modeメニューから頂点をWeldする処理と、逆に接続を解除する処理を選べると説明されています。

**Fracture**は、共有されていた頂点の接続を外し、polygon同士の隣接情報を失わせます。たとえばImage Plane 3Dの接続されたquad群を、互いにつながらないquadへ分ける動作です。既存meshの割れを直したい場面で選ぶ操作ではありません。

### Tolerance

**Tolerance**は、どの程度近いPosition vertexを同一位置として接続するかの判定に関係します。

- **Auto**: Manualでは通常は自動判定で十分と説明されています。
- **手動調整**: Autoで修復できない場合に検討します。大きくすればよいわけではなく、無関係な頂点までつながらない範囲に留めます。

Toleranceを大きくしすぎると、細いedgeや小さいfaceが1点へ潰れることがあります。大きなpolygonと極小のpolygonが混在するmeshでは、適切なToleranceを1つ選べない場合もあります。

このページでは、Manualにない正確な初期値・設定可能範囲を推測していません。

## 具体的な運用例

### Displace 3Dで表面に亀裂が出る

外部から読み込んだmeshへDisplace 3Dを適用した際、頂点をNormal方向へ動かすと細い隙間が開くことがあります。元modelで同じ位置の頂点が分離していると、面ごとの変位が一致しない場合があるためです。

まずWeld 3DをDisplace 3Dより前に置き、AutoのToleranceで割れが改善するか確認します。改善しない場合も、Toleranceを大幅に上げる前に、入力meshの頂点位置と法線を確認します。

### 不要な陰影の境界がある

隣り合う面の境界に硬い線が出ているとき、位置が重複したままの頂点が原因の場合があります。ただしWeld 3DはNormalをWeldしません。

Weldで位置の接続を修復した後も陰影が残る場合は、別の処理としてReplace Normals 3Dを検討します。逆に、意図的にhard edgeを残したいmodelでは、Normal再計算が見た目を変えてしまう可能性に注意します。

### Fractureでpolygonを切り離す

Fractureは、すでに連結されているmeshの隣接関係を失わせる操作です。通常の修復と反対方向の処理なので、意図せず選ぶと後段の変形結果が変わります。

## 使う前に知っておく制約

- **不要な場所には入れない**: Manualはmeshの問題を直すときに使うよう勧めています。Weld 3Dはrender時間に影響し、Manualではmultithreadedではないと記されています。
- **目で見える隙間を埋める目的ではない**: わずかな位置のずれを修復するためのNodeです。離れたmeshを結合するモデリング操作の代用にはなりません。
- **距離のスケールに注意**: 非常に大きいpolygonと極小のpolygonを同じmeshに含む場合、Toleranceを大きくすると細部が潰れます。
- **原点から遠い頂点に注意**: 浮動小数点の精度により、遠い座標にある頂点の近接判定がうまくいかない場合があります。Manualはlocal coordinatesでのWeldが有利になるケースを挙げています。
- **Weldで見た目が悪化する場合もある**: ManualはConeの頂点を例に、別々のNormalを持っていた頂点を結合するとlightingが不自然になり得ると注意しています。

Weld 3Dを入れた結果を評価するときは、輪郭の割れだけでなく、陰影と細い面の形が変わっていないかも確認します。

## 関連

- [Classic 3D Family Overview](./index.md)
- [Classic 3D scene](../../learn/02-data/classic-3d.md)
- [Displace 3D](./displace-3d.md): Imageに基づいて頂点を変位させるNode。
- [Replace Normals 3D](./replace-normals-3d.md): Normal / Tangentを再計算するNode。
- [Renderer 3D](./renderer-3d.md): Classic 3D sceneを2D Imageに変換するNode。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 88「3D Nodes」のWeld 3D [3We]（pp.2015–2017）を基準にしています。

Scene Input、Position vertexだけをWeldする制約、Weld Mode / Fracture / Tolerance、Displace前の修復例、render負荷、座標精度とmesh形状の注意を確認しました。

current runtimeのREGID、Inspectorのexact default / range、edition差、具体的なmeshごとの改善結果は未検証のため、`verification: partial`を維持しています。
