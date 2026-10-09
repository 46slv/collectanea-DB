---
title: "Texture 2D"
description: "2D画像を3Dの表面模様として使うため、UV上の位置・拡大縮小・境界・フィルタリングを設定するNode。"
doc_type: node
term_id: "texture"
term_short: "Texture 2Dは、3D物体の模様にする2D画像のUV位置や画質の扱いを決めるNode。"
verification: partial
aliases: ["Texture 2D", "Texture", "3Tx"]
concepts: ["classic-3d"]
nodes: ["Texture 2D"]
node_family: "materials-lights"
controls: ["U/V Offset", "U/V Scale", "Wrap Mode", "Texture Filtering Mode"]
inputs: ["image"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Texture 2D

Texture 2D [3Tx]は、**2D画像を3Dオブジェクトの表面に貼るとき、画像の位置・大きさ・端の扱い・縮小時の画質を設定する**Nodeです。例えば、板の3Dモデルに貼ったロゴを中央へずらしたり、繰り返し模様を作ったりできます。3Dモデルの頂点やカメラを動かすNodeではありません。

このページでは、DaVinci Resolve 21.1 Reference ManualのChapter 91「3D Texture Nodes」にある**Texture 2D [3Tx]**を扱います。「Texture」という語は一般の画像模様や別の画像処理の説明にも出てくるため、同名の機能を混同しないでください。

## 役割：UV座標を使った画像の配置

3Dオブジェクトには、表面のどの位置へ画像のどの部分を貼るかを示す**UV座標**があります。Uは画像の横方向、Vは縦方向です。普通は画像の左から右、上から下を0〜1の範囲へ対応させます。

Texture 2Dは、**入力画像をUV座標でどのように参照するか**を調整します。例えば、モデルはそのままでロゴの見える位置だけを変えられます。一方、モデルのUV自体が壊れている場合に、形状のUV展開を自動修復するものではありません。

## 入力と出力

### Image Input（オレンジ）

2D Imageを1つ受け取ります。MediaIn、Loader、Backgroundのグラデーション、前段で合成した画像などをつなぎます。3D SceneやMeshをこの端子へ直接入力するわけではありません。

### テクスチャ出力

画像のUV上の配置・境界・表示方法を設定し、3D Geometryの**Material入力**など、表面の模様を受け取る側へ渡します。このNodeから3D形状や完成した映像が出るわけではありません。[Merge 3D](../3d/merge-3d.md)へSceneとして接続するのではなく、模様を貼ったGeometryを[Renderer 3D](../3d/renderer-3d.md)へ渡して描画します。

21.1 Manualは画像入力とFBX Geometryへの適用例を説明していますが、**出力端子の内部型やREGIDはこの記述だけでは確定できません**。ここでのMaterialは接続上の役割を指し、内部型を実機検証したという意味ではありません。

## 主な設定項目

### U/V Offset：画像の位置をずらす

**U Offset**で横方向、**V Offset**で縦方向の参照位置を変えます。例えばロゴが板の左側へ寄っている場合、モデルを動かさず、ロゴだけを位置調整できます。

### U/V Scale：模様の広がりを変える

横・縦それぞれで、画像が表面に占める範囲を変えます。ロゴを横へ伸ばしたり、繰り返し柄の間隔を変えたりする用途です。Shape 3DやTransform 3DのScaleとは異なり、3Dモデルの大きさは変えません。

### Wrap Mode：画像からはみ出した部分をどう表示するか

OffsetやScaleを変えると、UVの参照位置が元画像の端より外へ出ることがあります。その扱いを指定します。

| 設定 | 範囲外の扱い | 使用例 |
| --- | --- | --- |
| **Wrap** | 反対側の端につながり、画像を繰り返す。 | タイルや壁紙の模様。 |
| **Clamp** | 端の画素の色を延ばす。 | 周囲を同じ色で埋めたい画像。 |
| **Black** | 黒・Alpha 0として扱う。 | 元の範囲外を透明にしたいロゴ。 |
| **Mirror** | 画像を縦横で鏡写しにして続ける。 | 繰り返しの継ぎ目を変えたい柄。 |

**ClampとBlackは異なります**。Clampでは端の色が広がり、Blackでは透明部分になります。背景に色付きの縁が見える場合は、Texture 2D側の境界処理も確認してください。

### Texture Filtering Mode：遠く・斜めから見たときの画質

細かな柄を縮小して表示すると、画面の1画素へ画像の複数画素が対応し、ギザギザやちらつきが起きる場合があります。Filteringでは、色の補間方法を選びます。

| 方法 | 特徴 |
| --- | --- |
| **Nearest** | 単純で高速。縮小時に粗さが現れやすい。 |
| **Bilinear** | 近くの画素から滑らかに補間する。拡大時に使いやすい。 |
| **Trilinear** | 縮小する画像の補間を改善する。 |
| **Anisotropic** | 斜めの面を見たときの角度や遠近を考慮する。 |
| **SAT** | Summed Area Tableによる高品質な方法。画像によってメモリを多く使う。 |

21.1 Manualは、**Renderer 3DのSoftware / OpenGL**と、それぞれの**LowQ / HiQ**に応じてFilteringを指定する仕組みを説明しています。1つの方法がどのRendererでも常に最良とは限りません。Bilinearを基準に、縮小時にちらつく画像ではTrilinearやAnisotropicなどを比較します。

## 主な用途

- **看板や商品モデルへのロゴ**：画像の貼り付け位置と大きさを調整し、端からはみ出した部分を透明にする。
- **床・壁の繰り返し模様**：Wrapで画像を連続表示し、Scaleで模様の密度を変える。
- **遠くにある細い柄**：Filteringを切り替え、斜めや遠方からの見え方を改善する。
- **FBXモデルの画像素材**：UV座標へグラデーションなどの2D画像を対応させる。

## 最小構成：平面にロゴを貼る

~~~text
ロゴ画像（MediaIn / Loader）
          ↓ 2D Image
      Texture 2D
          ↓ テクスチャ
Shape 3D［Plane / Material］──┐
Camera 3D ──────────────────┼→ Merge 3D → Renderer 3D → 2D Image
必要ならLight ──────────────┘
~~~

1. ロゴ画像を読み込み、Texture 2DのImage Inputへ接続します。
2. [Shape 3D](../3d/shape-3d.md)でPlaneを用意し、Texture 2Dの出力をShape 3DのMaterial入力へ接続します。
3. Camera 3DとShape 3DをMerge 3Dにまとめ、Renderer 3Dで表示します。
4. U/V Offsetで位置をずらし、U/V Scaleでロゴの大きさを変えます。
5. ロゴの端が表面の境界を越えるように動かし、Wrap・Clamp・Black・Mirrorの見え方を比較します。

これはManualに記載された入出力・設定に基づく**確認用の構成例**です。特定の素材における21.1実機の描画結果を確認したものではありません。

## 運用例：FBXモデルにグラデーションを貼る

21.1 ManualのTexture 2D節では、**Backgroundから入力した2DグラデーションへUV情報を設定し、FBX Geometryへ適用する例**を紹介しています。

1. [FBX Mesh 3D](../3d/fbx-mesh-3d.md)でモデルを読み込み、モデルにUVがあるか確認します。
2. Backgroundなどで2色のグラデーションを作り、Texture 2DのImage Inputにつなぎます。
3. その出力をモデルのMaterial側へ渡し、Renderer 3Dで表示します。
4. U/V Offsetを変え、グラデーションの色境界が表面上で移動するか確認します。
5. UVの向き自体が違うならTexture 2Dの値だけで補おうとせず、Geometry側のUV割り当てを見直します。

Manualは、選べる場合には[UV Map 3D](../3d/uv-map-3d.md)も推奨しています。UV Map 3Dは状況によってより高速で、Viewerに表示される操作用ガイドも使えます。**Texture 2Dは画像の対応範囲、UV Map 3DはGeometryのUV座標**を中心に扱うため、役割は完全に同一ではありません。

## 表示がおかしいとき

**一面が画像の隅と同じ色になる**：Manualは、UVのないレンダリング画像ではTexture処理が働かないこと、背景領域のU/Vが0ならテクスチャの隅の色が出る場合があることを説明しています。GeometryのUVや補助チャンネルを確認し、必要ならAlpha、Object ID、Material IDによるマスクで対象部分だけを処理します。

**ロゴの周囲の色が引き伸ばされる**：Wrap ModeのClampで画像端の色が延長されていないか確認します。

**細かな模様がちらつく**：Nearest以外のFilteringを試し、Renderer 3DのSoftware/OpenGLとLowQ/HiQの設定を確認します。

**物体の形が変わらない**：仕様どおりです。Texture 2Dは画像の貼り方を調整するNodeであり、物体の移動や変形には[Transform 3D](../3d/transform-3d.md)などを使います。

## 関連Nodeと考え方

- [Texture Transform](./texture-transform.md)：画像またはMaterialのUV**W**座標を移動・回転・拡大縮小する。
- [UV Map 3D](../3d/uv-map-3d.md)：Geometry側のUV/UVWの割り当てを変更する。
- [Blinn](./blinn.md)：画像をDiffuse Textureとして受け取り、ライトで照らされた材質を作る。
- [Classic 3Dの基礎](../../learn/02-data/classic-3d.md)：Image・Material・Geometry・Sceneの違い。
- [3D Material / Lightの一覧](./index.md)：周辺のNodeを探す。

## バージョンと出典

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 91「3D Texture Nodes」、**Texture 2D [3Tx]（pp.2102–2104）**。Image Input、U/V Offset・Scale、4種のWrap、5種のFiltering、Renderer別の設定、FBXの例を照合しました。

Manualの正式名称へ合わせてページ題名を**Texture 2D**に変更しましたが、既存リンクとの互換性のためファイル名とterm_idはtextureのまま残しています。実機のREGID・内部出力型・数値初期値・Edition差・描画結果は未検証のためverificationは**partial**です。
