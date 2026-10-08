---
title: "Triangulate 3D"
description: "Classic 3Dの四角形や多角形の面を三角形へ分割し、後段で処理しやすいmeshにするNode。"
doc_type: node
term_id: "triangulate-3d"
term_short: "Triangulate 3Dは、3D meshを構成する四角形や多角形の面を三角面に分割するNode。"
verification: partial
aliases: ["Triangulate 3D", "3Tri"]
concepts: ["classic-3d"]
nodes: ["Triangulate 3D"]
node_family: "3d"
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Triangulate 3D

Triangulate 3D [3Tri]は、**3Dモデルの面を三角形に分割する**Nodeです。<Term id="classic-3d">Classic 3D scene</Term>の中にあるgeometryを処理し、結果も3Dとして出力します。

3Dモデルの表面は、頂点を結んだ「面（polygon）」でできています。四角形の面には4つの角がありますが、Triangulate 3Dを通すと、その面は**2つの三角形**で表されます。頂点の数が多い多角形も、三角形の組み合わせへ変換されます。

これは**形状を滑らかに細分化する処理ではありません**。表面に新しい起伏や厚みを加えるのではなく、元の面をどの三角形で構成するかを変更します。多角形のままでは後段で扱いにくいgeometryを、三角形のmeshとして渡したいときに使います。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualが説明する入力は**1つだけ**です。

- **Scene Input（オレンジ、必須）**：三角形化したい3D object、またはそれを含む3D sceneを接続します。
- **出力**：面を三角形化したClassic 3Dのobject / sceneを返します。

2D ImageやMaskを直接三角形化するNodeではありません。画像として合成するには、後段で[Renderer 3D](./renderer-3d.md)を使い、3D sceneを2D Imageへ変換します。

## 接続例：読み込んだ3Dモデルの面を三角形にする

たとえば外部ソフトで作ったモデルを[FBX Mesh 3D](./fbx-mesh-3d.md)などで読み込んだ場合、Triangulate 3Dを**そのgeometryの直後**へ置きます。

```text
FBX Mesh 3D → Triangulate 3D ─┐
Camera 3D ────────────────────┼→ Merge 3D → Renderer 3D → 2D Image
Light 3D ─────────────────────┘
```

1. 元のmodelに四角形や多角形の面が含まれていることを確認します。
2. FBX Mesh 3Dの3D出力を、Triangulate 3DのScene Inputへ接続します。
3. Triangulate 3Dの出力を[Merge 3D](./merge-3d.md)へ渡し、Camera / Lightと合わせてRenderer 3Dで描画します。
4. 面の分割状態を確認できる表示や元モデルとの比較を使い、必要なgeometryだけを三角形化できているか確認します。

四角形1枚なら、出力では2つの三角面になります。三角形化が必要ないmodelに、習慣的に挿入する必要はありません。

## Inspector：三角形化の設定はない

**ControlsタブにTriangulate 3D専用の調整項目はありません。** Manualは、このNodeを「Controlを持たない」Nodeとして説明しています。面の分割数や角度をInspectorの専用スライダーで指定する操作ではなく、接続されたgeometryを三角形へ変換する処理です。

**Settingsタブ**は他の3D Nodeと共通です。このNode固有のControlsがないことと、共通Settingsが存在することは区別してください。

## 他の3D Nodeとの違い

- [Weld 3D](./weld-3d.md)：近い位置にある頂点の接続を修復するNode。Triangulate 3Dのように面を三角形へ分割する目的ではありません。
- [Displace 3D](./displace-3d.md)：画像などの値を使って頂点位置を動かし、表面に凹凸を作るNode。Triangulate 3D自体はそのような変位を加えません。
- [UV Map 3D](./uv-map-3d.md)：画像を表面のどこに対応させるかというtexture座標を変更するNode。面を三角形化する機能とは別です。

「三角形に分ける」「頂点をつなぎ直す」「凹凸を付ける」「画像の貼り方を変える」は、それぞれ異なる処理です。どれを変更したいかに応じてNodeを選びます。

## 関連と出典

- [Classic 3D Family Overview](./index.md)
- [Classic 3D sceneの基礎](../../learn/02-data/classic-3d.md)
- **一次資料**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）, Chapter 88「3D Nodes」, pp.2010–2011, 「Triangulate 3D [3Tri]」。
- **確認範囲**：Nodeの役割、Scene Input、Controlsなし、共通Settingsは21.1 Manualで確認済み。runtimeのREGID、Edition別の表示、実際のmeshごとの分割結果は未検証のため、verificationはpartialとしています。
