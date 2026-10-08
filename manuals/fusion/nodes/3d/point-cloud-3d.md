---
title: "Point Cloud 3D"
description: "3Dトラッキングで生成した点群をViewerで確認し、個別の点の位置をCG配置に利用する方法を解説。"
doc_type: node
term_id: "point-cloud-3d"
term_short: "Point Cloud 3Dは、3Dトラッキングで得た多数の位置を表示・管理し、選んだ点の座標を他のコントロールから参照できるノード。"
verification: partial
aliases: ["Point Cloud 3D", "3PC"]
concepts: ["classic-3d", "tracking-data"]
nodes: ["Point Cloud 3D"]
node_family: "3d"
controls: ["Style", "Lock X/Y/Z", "Size X/Y/Z", "Density", "Color", "Import Point Cloud", "Make Renderable", "Unseen by Camera"]
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene", "camera-track"]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-08"
---

# Point Cloud 3D

**Point Cloud 3D [3PC]は、カメラトラッキングなどで求めた多数の3D位置を、ひとまとまりの点群として扱うノード**です。たとえば、実写の映像から推定した床・壁・建物の角などの位置をViewerで確認し、そこへCGを配置する手がかりにできます。

点群（Point Cloud）は、それぞれが3D空間内の位置を持つ点の集まりです。面で囲まれた3Dメッシュとは異なり、点と点を結んで物体の表面を作るデータではありません。Fusionの説明では、位置や変換情報を持ちながら通常は描画されない**Nullオブジェクト**の集合として扱います。

何百もの点を個別の[Locator 3D](./locator-3d.md)で作る代わりに、1つのPoint Cloud 3Dでまとめられます。ただし、**点群を読み込むだけで床や壁の形状が自動生成されるわけではありません。**

## 入力と出力

21.1 Reference Manualに記載されている入力は1本です。

- **SceneInput（オレンジ）**：Classic 3Dシーンを受け取ります。
- **出力（Classic 3Dシーン）**：点群を含んだ3Dシーンを後段へ渡します。2D Image出力ではありません。

点群は、**Import Point Cloud**から対応するファイルを読み込む方法と、[Camera Tracker](../tracking/camera-tracker.md)の解析結果から生成する方法があります。

```text
実写映像 → Camera Tracker（Track / Solve / Export）
                              ↓
                 Point Cloud 3D ───────┐
                 Camera 3D ────────────┼→ Merge 3D → Renderer 3D
                 Shape 3D（地面の目安）┘
```

Camera TrackerのExportはCamera 3DやPoint Cloud 3Dなどの**別々のノードを作る操作**です。映像の2D出力をSceneInputへ接続して点群に変換する操作とは区別してください。

## Inspectorの主な設定

### 点の見え方

| Control | 何を変えるか |
| --- | --- |
| **Style** | Viewer上で十字マーク（Cross Hairs）と点の表示を切り替える。 |
| **Lock X/Y/Z** | X・Y・Z方向の十字マークのサイズを連動させるか、別々に調整するかを決める。 |
| **Size X/Y/Z** | Viewerに描く十字マークの各方向の大きさを調整する。 |
| **Density** | Viewerに表示する点の割合を変更する。1では全点、0.2ではおよそ5点に1点を表示する。 |
| **Color** | 点の表示色を変更する。 |

点が多く、CGの位置合わせがしにくい場合はDensityを下げて表示を間引けます。**Densityは点群の座標を修正したり、トラッキングの精度を上げたりする設定ではありません。** Viewerで見える点の数と、元の位置データを区別します。

### Import Point Cloud

**Import Point Cloud**は、外部アプリケーションから点群を読み込むためのボタンです。21.1 Manualが記載する対応形式はMaya ASCII（`.ma`）、3ds Max ASCII Scene Export（`.ase`）、LightWave（`.lws`）、Softimage XSI（`.xsi`）です。

任意のCSV・PLY・LAS点群ファイルを直接読み込めるという意味ではありません。トラッカーからカメラと点群を別々に取り込む場合は、両者の座標系やスケールが一致するか確認します。

### Make RenderableとUnseen by Camera

通常、点群はCGの配置に使う目印であり、完成映像には描きません。

- **Make Renderable**：点群のマークをOpenGL ViewerおよびOpenGL Rendererの描画対象にする設定です。
- **Unseen by Camera**：Make Renderableを有効にしたときに表示されます。有効にするとViewerでは点群を確認できても、Renderer 3Dの出力画像には描きません。

**Software RendererはPoint Cloud 3Dの十字マークをレンダリングできません。** 仕上がりに点が出ない場合は、Make RenderableだけでなくRenderer方式とUnseen by Cameraも確認します。

## 名前付きの点を探す・位置を公開する

トラッキングソフトから取り込んだ点には名前が付いている場合があります。Point Cloud 3Dを選択すると、3D Viewerの右クリックメニューから点群の操作ができます。

- **Find**：指定した名前の点を検索・選択します。検索では大文字と小文字を区別します。
- **Rename**：選択した1点の名前を変えます。名前には空白を使えず、先頭を数字にできません。複数点を一括Renameする操作ではありません。
- **Delete**：選択した点を削除します。
- **Publish**：選択した点の位置をInspectorの座標コントロールとして公開し、他ノードのパラメータから参照できるようにします。

Viewerには、選択した点の位置に**Shape、Image Plane、Locator**を作る操作もあります。これは点群全体をメッシュへ変える機能ではなく、選択した場所を基準に3D要素を置くための機能です。

**Publishが必要な理由**は、点がViewerに見えているだけでは、その点のXYZ位置を他のノードの位置コントロールから直接使えないためです。Publish後は公開された座標を参照して、特定のトラッキング点へCGを追従させられます。

## 具体例：実写映像へ3Dオブジェクトを置く

1. 実写映像をCamera TrackerでTrackし、Solveで撮影カメラの動きと特徴点の3D位置を推定します。
2. Exportで**Camera 3D、Point Cloud 3D、地面の基準になるShape 3D、Merge 3D、Renderer 3D**などを作ります。
3. Merge 3Dを3D Viewerへ表示し、点の分布が実写の床や壁に沿って見えるか、Camera 3Dの視点から確認します。
4. 点群を参考にShape 3DやText 3Dの位置・向き・サイズを調整し、同じMerge 3Dへ追加します。
5. Renderer 3Dで完成画像を確認します。点群は位置合わせに使用し、通常は最終画像へ表示しません。

点群の位置がそれらしく見えても、Solveが正確とは限りません。CGがショット全体で実写の同じ場所に固定されて見えるかも確認します。

## 具体例：特定の点を別のCGの位置に利用する

実写の看板の角など、位置を特定できる点に3Dの目印を付けたい場合です。

1. Point Cloud 3Dを選び、Viewerの**Find**から名前で目的の点を探します。
2. その点を選択し、**Publish**で位置のコントロールを公開します。
3. 公開された座標を、動かしたい3D要素の位置コントロールから参照します。
4. カメラ移動に伴って3Dの目印が実写の対象位置に合っているか確認します。

この操作は点の座標を参照するもので、Point Cloud 3D自体がグラフィックを描くわけではありません。**2D画像上の円やマーカー**をその点へ追従させる場合は、3D位置を2D画面座標へ変換する[Locator 3D](./locator-3d.md)も使います。

## 関連ノードと注意点

- [Camera Tracker](../tracking/camera-tracker.md)：映像からカメラ移動と点群を推定する。
- [Camera 3D](./camera-3d.md)：3Dシーンを実写と対応する視点から見る。
- [Locator 3D](./locator-3d.md)：3D空間の位置を2D画像上の位置へ変換する。
- [Merge 3D](./merge-3d.md)：点群、Camera、CGを同じ3Dシーンへまとめる。
- [Renderer 3D](./renderer-3d.md)：3Dシーンを2D画像へ変換する。
- [Classic 3D scene](../../learn/02-data/classic-3d.md)：3Dと2D Imageのデータの違い。
- [Classic 3Dノード一覧](./index.md)：Classic 3D全体の入口。

## 出典と確認範囲

Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月）の**Fusion Fundamentals Chapter 84, pp.1869–1871**、**Chapter 88「3D Nodes」Point Cloud 3D [3PC], pp.1961–1964**を一次資料として参照しました。Camera TrackerのExport構成はChapter 119の説明も確認しています。

SceneInput、Import対応形式、Style・Density、Make Renderable、右クリックメニュー、Findの文字大小区別、PublishをManualと照合しました。Inspectorの厳密なdefault/range、runtime REGID、実機での動作、Edition差は未検証のため、`verification: partial`を維持しています。
