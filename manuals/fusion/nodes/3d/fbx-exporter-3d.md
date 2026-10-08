---
title: "FBX Exporter 3D"
description: "Fusionの3DシーンをFBXなどの外部ファイルへ書き出すNode。保存対象、アニメーション、Formatの制約を説明する。"
doc_type: node
term_id: "fbx-exporter-3d"
term_short: "FBX Exporter 3Dは、Fusion内の形状・ライト・カメラをFBXなどへ書き出すNode。Renderer 3Dと違い2D画像は生成しない。"
verification: partial
aliases: ["FBX Exporter 3D", "FBX Exporter", "FBX"]
concepts: ["classic-3d"]
nodes: ["FBX Exporter 3D"]
node_family: "3d"
controls: ["Filename", "Format", "Version", "Frame Rate", "Scale Units By", "Geometry", "Lights", "Cameras", "Render Range", "Reduce Constant Keys", "File Per Frame (No Animation)", "Sequence Start Frame"]
inputs: ["classic-3d"]
outputs: []
tasks: ["build-3d-scene"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# FBX Exporter 3D

**FBX Exporter 3D [FBX]は、Fusionで作った3Dシーンの形状・ライト・カメラを、外部3Dソフト用のファイルに保存するNode**です。3Dシーンを画像へ変換する[Renderer 3D](./renderer-3d.md)とは目的が異なります。

<Term id="classic-3d">Classic 3Dシーン</Term>とは、3D空間に置いた物体の形・位置、カメラ、ライトなどを含むデータです。たとえばFusionで作った3Dタイトルを別の3Dアプリへ渡したい場合、FBX Exporter 3Dで保存する経路を使います。完成した映像フレームや透過画像を保存するためのNodeではありません。

## 入力と書き出し先

DaVinci Resolve 21.1 Reference Manualで確認できるのは**オレンジ色の3Dシーン入力1本**です。[Merge 3D](./merge-3d.md)などでまとめたシーン、または個別の3Dオブジェクトの出力を接続します。

FBX Exporter 3Dは**保存ファイルを生成する終端Node**であり、別の3D Nodeへ渡す通常のClassic 3D出力としては扱いません。Fusion内で同じシーンを描画したい場合は、Export用とRenderer 3D用にブランチを分けます。

```text
Text 3D ──────┐
Camera 3D ────┼→ Merge 3D ──┬→ Renderer 3D → 2D Image
Spot Light ───┘             └→ FBX Exporter 3D → 外部ファイル
```

**入力につながっている範囲だけが書き出し対象**です。たとえばDuplicate 3Dの直後から分岐すれば、そのNodeが生成したオブジェクトだけを保存できます。Composition内のほかのシーンを自動的にすべて回収するわけではありません。

## Inspector：何を保存するか

### 保存先と形式

- **Filename**：保存するファイルのパス。Browseで変更できます。
- **Format**：FBX（`.fbx`）以外に、3D Studio（`.3ds`）、Collada（`.dae`）、AutoCAD（`.dxf`）、Alias OBJ（`.obj`）を選べます。
- **Version**：Formatで選んだ形式に応じて選択肢が変わります。利用可能なバージョンが1つなら表示されません。ManualによればFBXの**DefaultはFBX2011**です。

形式ごとに対応機能が違います。特に**OBJ形式はアニメーションに対応しません**。ファイル拡張子を選ぶだけで、すべてのシーン情報を保持できるわけではありません。

### 時間・サイズ・出力要素

- **Frame Rate**：FBXシーンに設定するフレームレート。
- **Scale Units By**：受け取り側の3Dソフトと単位の大きさが合わない場合に出力スケールを調整します。
- **Geometry / Lights / Cameras**：形状・ライト・カメラをそれぞれ書き出すかどうかのチェックです。たとえばCamerasだけを有効にすれば、カメラだけの出力を指定できます。
- **Render Range**：Render Rangeの情報を出力ファイルへ保存します。
- **Reduce Constant Keys**：隣接するキーフレームが同じ値を持つ場合、不要なキーを間引きます。

**File Per Frame (No Animation)**を有効にすると、**1フレームにつき1つの番号付きファイル**を書き出します。この方式では、単一ファイルへアニメーションを保持する動作は無効になります。有効にすると表示される**Sequence Start Frame**で連番の開始番号を指定できます。

動きのあるシーンを受け渡す場合は、アニメーションを含む単一FBXが必要なのか、フレームごとに固定されたシーンファイルが必要なのかを先に確認します。

## 実際の運用例：Fusionの3Dタイトルを渡す

1. [Text 3D](./text-3d.md)、Camera 3D、必要なライトを[Merge 3D](./merge-3d.md)へつなぎ、Exportしたい範囲をまとめます。
2. Merge 3Dの出力からFBX Exporter 3Dへ分岐します。Fusion内の見た目も確認する場合は、別の枝をRenderer 3Dへつなぎます。
3. **Filename**で保存先、**Format**で出力形式を決めます。受け取り側のソフトと単位が異なる場合は**Scale Units By**を確認します。
4. **Geometry / Lights / Cameras**から受け渡す情報を選びます。アニメーションを渡すなら**Frame Rate**と**File Per Frame**の設定も決めます。
5. ツールバーの**Render**を実行してファイルを保存します。このNodeはSaverに似た方法で使用し、Nodeを置いた時点で書き出しが完成するわけではありません。
6. 受け取り側のソフトで保存ファイルを開き、形状・カメラ・動きが必要な形で引き継がれているか確認します。

**Auto Clip Browse**が有効なら、Node追加時にファイル選択画面を表示できます。設定場所はDaVinci Resolveでは**Fusion > Fusion Settings > General > Auto Clip Browse**、Fusion Studioでは**Preferences > Global > General > Auto Clip Browse**です。

## 受け渡しの注意点

**TextureとMaterialはFBX Exporter 3Dで書き出せません。** これは21.1 ManualのFusion Fundamentalsに明記された制限です。形状が読み込めても、Fusion内で貼った画像や材質まで同じ見た目で復元されるとは限りません。必要なテクスチャ素材は別に渡し、受け取り側でMaterialを組み直します。

書き出されたオブジェクト・ライト・カメラには、作成元のFusion Nodeの名前が使われます。外部ソフトで判別しやすくするには、書き出し前にNode名を整理すると便利です。

動きを保持するかどうかは出力形式とFile Per Frameの設定次第です。OBJへ出す場合やフレームごとにファイルを分ける場合、アニメーション付き単一FBXと同じ使い方にはなりません。

## 関連Nodeと選び分け

- **[FBX Mesh 3D](./fbx-mesh-3d.md)**：FBXやOBJなどの外部モデルを**Fusionへ読み込む**Node。データの向きが逆です。
- **[Alembic Mesh 3D](./alembic-mesh-3d.md)**：外部のAlembicファイルから、変形アニメーションを含むメッシュを読み込む場合の候補。
- **[Renderer 3D](./renderer-3d.md)**：Classic 3Dシーンを**2D画像へ変換する**Node。外部シーン形式の書き出しには使いません。
- **[Classic 3Dノード一覧](./index.md)**：3D Nodeの役割と、画像へ戻す位置を確認できます。

## 出典と確認範囲

一次資料：Blackmagic Design『*DaVinci Resolve 21.1 Reference Manual*』（September 2026）、Chapter 88「3D Nodes」、**FBX Exporter 3D [FBX]（pp.1945–1947）**。入力、書き出し方式、Format／Version／Frame Rate／Scale Units By、出力要素、Render Range、Reduce Constant Keys、File Per Frame、Sequence Start Frameを確認しています。**Texture / Materialが出力されない**点は同ManualのFusion Fundamentals、p.1861に基づきます。

本記事のタイトル受け渡しは確認済み機能を使った説明例であり、実機での再現結果ではありません。内部REGID、個別ファイルの互換性、未記載のInspector初期値・数値範囲、Edition差は未検証のため、`verification: partial`を維持しています。
