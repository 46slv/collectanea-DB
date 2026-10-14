---
title: Create Bump Map
description: "白黒の高さ画像をRGBのバンプ画像へ変換するFusionノード。3D材質への接続、Inspectorの6設定、具体例と診断手順を解説。"
doc_type: node
term_id: create-bumpmap
term_short: "Create Bump Mapは、白黒の高さ画像から凹凸の方向データを作り、2D RGB画像として出力するFilter Node。"
verification: partial
aliases: [Create Bump Map, CBu]
concepts: [image-data, normal-map, texture]
nodes: [Create Bump Map]
node_family: blur-filter
controls: [Filter Size, Height Source, Clamp Normal.Z, Wrap Mode, Height Scale, Bump Map Texture Depth]
inputs: [image, mask]
outputs: [image]
tasks: [bump-map, height-map, texture-processing]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# Create Bump Map

Create Bump Map [CBu]は、**画像の明暗を高さとして読み取り、凹凸の向きをRGBに記録した2D画像へ変換するNode**です。白黒の石目模様から凹凸用のデータを作り、3Dの壁や床に細かな陰影を付けるときなどに使います。

ただし、このNode自身は3D材質も形状も出力しません。**出力は2D Image**なので、別の画像処理を挟むこともできます。実際に3Dの凹凸として使うには、[Bump Map](../materials-lights/bumpmap.md)でMaterialへ変換してから、[Blinn](../materials-lights/blinn.md)などのBump Map Material入力へ接続します。

高さ画像から材質を直接作るだけならBump Map Nodeへ白黒画像を入力する方法もあります。Create Bump Mapは、**高さ画像 → RGBの凹凸画像 → 材質**を分離して、途中のデータを確認・加工したいときに使います。

## 入力と出力

| 端子 | データ | 何に使うか |
| --- | --- | --- |
| **Input**（オレンジ） | 2D RGBA Image | 高さの元になる画像。選んだチャンネルの画素値から傾きを求める |
| **Effect Mask**（青、任意） | Mask | 凹凸生成の効果が適用される範囲を制限する |
| **Output** | 2D RGB Image | 方向データをRGBに格納した画像。ほかの2D NodeまたはBump Mapへ渡す |

Inputには[Fast Noise](../generators/fast-noise.md)、描画した高さ画像、読み込んだグレースケール画像を使えます。ここでいう高さは3D座標ではなく、**各画素の明暗の値**です。

Effect Maskは、[Rectangle Mask](../masks/rectangle-mask.md)などで範囲を限定するための端子です。21.1マニュアルでは、Maskは**Nodeの処理後**に適用されると説明しています。元の高さ画像を事前に切り抜く操作とは、境界の結果が異なり得ます。[Maskの基礎](../../learn/02-data/mask.md)も参照してください。

出力はViewerでカラー画像のように表示できますが、RGBは鑑賞用の色ではなく**方向を符号化したデータ**です。表示が青紫でも、3D材質と照明に通すまでは完成した凹凸とは判断できません。

## Height Map・Bump Map・Normal Map

- **Height Map（高さ画像）**：1画素ごとの高さを明暗で表した画像。隣り合う画素の値が変わる場所に傾きが生まれます。
- **Bump Map（バンプ画像）**：表面が元から持つ法線（面が向いている方向）に変化を加える情報をRGBに保存する画像。
- **Normal Map（法線画像）**：表面の法線そのものを置き換える情報をRGBに保存する画像。

この用語区分は**Fusion 21.1のマニュアルに沿ったもの**です。他の3Dソフトで「Normal Map」と呼ばれるものを、そのままFusionのBump Mapと同じ意味だと判断しないでください。

法線を変えると光の当たり方やハイライトは変わりますが、**メッシュの頂点位置や物体の輪郭は変わりません**。輪郭まで盛り上げたいときは[Displace 3D](../3d/displace-3d.md)などの形状変形と役割を分けます。

## Inspectorの設定

### Filter Size

入力画像の周囲を調べて高さの傾きを求める際の範囲です。21.1マニュアルが示す選択肢は**3 × 3 pixel**と**5 × 5 pixel**です。5 × 5のほうが広い近傍を参照し、処理時間も増えます。

まず3 × 3で作り、細かな模様の角やノイズが荒く見える場合に5 × 5と比較します。「5 × 5は常に高品質」とは限りません。絵柄の細かさや必要な速度に合わせて選びます。

### Height Source

**どの入力チャンネルを高さとして読むか**を指定します。元画像がRGBの場合、選択によって得られる傾きが異なります。白黒に見える素材でも、そのチャンネルに実際に階調差があるかを先に確認します。

この節の公式資料は個別の選択肢名・既定チャンネルまで列挙していないため、Inspectorに表示される名称を基準にしてください。

### Clamp Normal.Z

出力のバンプ画像で、**青チャンネルの低い値を切り詰める**設定です。青は方向情報のZ成分に相当し、青い色を見栄えよくするための設定ではありません。

変更前後をViewerで比較し、さらに材質と光源を通した陰影も確かめます。数値範囲や内部のクリップ式はマニュアルの説明以上に断定しません。

### Wrap Mode

画像の**端の外側をどう参照するか**を決めます。傾きを求めるフィルターは隣接画素を使うため、繰り返し用テクスチャの境界では端の扱いが重要です。

床タイルのように繰り返す高さ画像では、左右・上下が滑らかにつながる素材を用意したうえで、それに合うWrap Modeを選びます。**元画像の端が不連続なら、Wrap Modeだけでは継ぎ目を解消できません**。正確なメニュー選択肢は21.1マニュアルのこの節に列挙されていないため、実際のInspectorを確認してください。

### Height Scale

生成されるバンプ値の**コントラスト**を変えます。値を上げると凹凸の方向変化が強調され、見た目の起伏が強くなります。物体の実寸の高さを指定するものではありません。

最初は控えめに調整し、材質へつないでライトの位置を動かしながら確認します。強めすぎる前に元画像の明暗差とFilter Sizeも比較してください。

### Bump Map Texture Depth

出力のbit depth（画素値の記録精度）を合わせる、または変換する設定です。弱い傾きを加工する場合には必要な階調精度を検討します。ただしbit depthを上げても、元画像に存在しない階調や空間的な細かさは増えません。

SettingsタブにはFilter Node共通の設定があり、その説明は21.1マニュアルのChapter 99末尾「The Common Controls」にあります。

## 制作例1：石目模様を3Dの壁に反映する

~~~text
Fast Noise（白黒の高さ画像）
    ↓ 2D Image
Create Bump Map（RGBのバンプ画像）
    ↓ 2D Image
Bump Map［Source Image Type: Bump Map］
    ↓ 3D Material
Blinn［Bump Map Material］
    ↓ 3D Material
Shape 3D［Material］ ─────────┐
Camera 3D ───────────────────┼→ Merge 3D → Renderer 3D
Point Light ─────────────────┘
~~~

1. Fast Noiseで明暗のある細かな模様を作り、Create Bump MapのInputへつなぎます。
2. Create Bump Mapの出力をViewerに表示します。Filter Sizeを3 × 3から試し、Height Scaleで強さを調整します。
3. 出力を**Bump Map NodeのImageInput**へ接続し、**Source Image TypeをBump Map**にします。既にRGB方向データなのでHeight Mapとして二重変換しないことが重要です。
4. Bump MapのMaterial出力をBlinnの**Bump Map Material**入力へ接続します。BlinnをShape 3DのMaterial入力へ渡します。
5. Shape 3DとCamera 3D、Point LightをMerge 3Dへつなぎ、Renderer 3Dで結果を見ます。ライトの角度を変え、模様に応じてハイライトや陰影が変わるか確認します。

Bump Map Nodeを省いてCreate Bump MapのRGB画像をBlinnのBump Map Materialへ直接接続する構成では、必要なMaterial型への変換が抜けます。**2D Imageと3D Materialは別のデータ**です。詳しくは[Classic 3Dの基礎](../../learn/02-data/classic-3d.md)を参照してください。

## 制作例2：繰り返す床材の端を整える

繰り返し可能な白黒の高さ画像を用意し、Create Bump Mapへ入力します。Wrap Modeをタイルのつながりに適した設定にして、出力をBump Map経由で床の材質へ渡します。

まず高さ画像自体の左右端・上下端がつながるか確認します。そのあとFilter Sizeを3 × 3と5 × 5で比較し、タイルの境界に余計な線が現れないか3Dで確かめます。素材そのものの不連続と、フィルターの端処理が原因の継ぎ目は分けて診断します。

## 制作例3：生成したRGBバンプ画像へ2D処理を挟む

~~~text
高さ画像 → Create Bump Map → Blur（必要な場合だけ）→ Bump Map → Blinn
~~~

Create Bump Mapが2D Imageを出すため、別の画像処理を挟めます。例えば細かな凹凸が目立ちすぎるとき、**ごく弱いBlur**を挟んで方向データの変化をなだらかにする方法を比較できます。

ただし、RGBを任意に塗り替える、ガンマを変更する、チャンネルを入れ替えるといった操作は、**色ではなく方向データそのものを変更します**。加工後はBump Map・材質・照明へ通して、法線の向きやハイライトが不自然になっていないか確認してください。元の高さ画像を先に加工するほうが適切な場合もあります。

## うまくいかないとき

| 症状 | 調べる箇所 |
| --- | --- |
| RGB画像は出るが3Dの凹凸がない | Bump Map Nodeを挟んでいるか、そのMaterial出力がBlinnなどのBump Map Materialへ届いているか |
| 陰影の向きがおかしい | Bump Mapの**Source Image Type**がBump Mapになっているか。途中のRGB画像処理で方向データを変えていないか |
| 凹凸が弱い | Height Sourceに階調差があるか、Height Scale、ライトの角度を比較 |
| 凹凸が荒い | 元画像のノイズ、Filter Size、Height Scale、Clamp Normal.Zを一つずつ変更 |
| 繰り返し境界に線が出る | 元の高さ画像の端の連続性、Wrap Mode、Filter Sizeを確認 |
| 階調が縞になる | 入力画像と途中処理の精度、Bump Map Texture Depthを確認 |
| 物体の輪郭が盛り上がらない | このNodeはメッシュを変形しない。必要ならDisplace 3Dなどへ切り替える |

## 関連Node

- [Bump Map](../materials-lights/bumpmap.md)：高さ画像またはRGBバンプ画像を材質へ変換。Create Bump Mapを挟まない場合はSource Image TypeをHeight Mapにします。
- [Blinn](../materials-lights/blinn.md) / [Ward](../materials-lights/ward.md)：Bump Map Materialを受け取り、陰影やハイライトへ反映します。
- [CreateReliefMap](../materials-lights/createreliefmap.md)：ReliefMap用の別種のデータを生成します。後段のNodeが異なります。
- [Texture 2D](../materials-lights/texture.md)：UV上の画像配置や境界・フィルタリングのためのNodeで、バンプ方向の生成とは役割が異なります。
- [3D Material / Lightノード一覧](../materials-lights/index.md)：材質と照明の選択。
- [Blur / Filterノード一覧](./index.md)：2Dの画像処理Nodeを探す。

## 出典と確認範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 99「Filter Nodes」**Create Bump Map [CBu]（pp.2328–2329）**。2入力、2D RGB出力、6つのInspector設定、Height / Bump / Normalの用語を確認しました。後段のBump Map [3Bu]の接続およびSource Image TypeはChapter 91「3D Texture Nodes」（pp.2082–2084）に基づきます。

制作例はマニュアルに記載された処理を組み合わせたものです。21.1実機での描画、内部REGID、パラメータの初期値・範囲、Edition差は未検証のため`verification: partial`を維持します。
