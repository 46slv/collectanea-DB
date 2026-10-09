---
title: "Merge 3D"
description: "複数の3Dオブジェクト・カメラ・ライトを同じシーンへまとめるNode。グループ全体のTransformとライトの引き継ぎ方を説明する。"
doc_type: node
term_id: "merge-3d"
term_short: "Merge 3Dは、形状・カメラ・ライトなどを同じClassic 3DシーンへまとめるNode。複数の入力を自動的に増やせる。"
verification: partial
aliases: ["Merge3D", "Merge 3D", "3Mg"]
concepts: ["classic-3d", "scene-graph"]
nodes: ["Merge 3D"]
node_family: "3d"
controls: ["Pass Through Lights", "Transform"]
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["combine-3d", "scene", "composite-3d"]
level: intermediate
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Merge 3D

**Merge 3D [3Mg]は、別々に作った3Dの要素を、同じ空間に存在する1つのシーンへまとめるNode**です。形状だけでなく、Camera 3D、Light、別のMerge 3Dが出力するシーンも受け取れます。

たとえば、写真を貼った板、カメラ、ライトをそれぞれ作っただけでは、互いに同じシーンにあるとは限りません。Merge 3Dへ接続して初めて、そのカメラから板を見たり、ライトで板を照らしたりする構成になります。

ここでいう<Term id="classic-3d">Classic 3Dシーン</Term>は、物体の形や位置、カメラ、ライトなどを持つ**3Dデータ**です。Merge 3Dの出力はまだ画像ではありません。通常の2D映像に重ねるには、[Renderer 3D](./renderer-3d.md)で画素に変換します。

## 入力と出力

### SceneInput：接続すると入力が増える

Manual上の入力名は **SceneInput[#]** です。Nodeを追加した直後は2つの入力が表示され、そこへ接続するたびに次の空入力が現れます。接続できる要素は次のとおりです。

- **形状**：[Image Plane 3D](./image-plane-3d.md)、[Shape 3D](./shape-3d.md)、Text 3Dなど。画面内に置く物体です。
- **カメラ**：[Camera 3D](./camera-3d.md)。どこからシーンを撮るかを定義します。
- **ライト**：Spot Lightなど。3Dの物体を照らします。
- **別の3Dシーン**：ほかのMerge 3Dの出力など。すでに組んだ要素の集まりを追加できます。

**入力数に固定の上限はありません。** これは2D MergeのForeground／Backgroundのように役割が固定された2本の入力ではなく、同じ3D空間へ要素を集めるための入力です。入力を何本つないでも、それだけで「手前」「奥」が決まるわけではありません。見える位置関係は、物体・カメラの3D上の配置とレンダリング結果によります。

### 出力：まとめたClassic 3Dシーン

出力は、接続された形状・カメラ・ライトなどを含むClassic 3Dシーンです。[Renderer 3D](./renderer-3d.md)や、さらに別のMerge 3Dなどの3D入力へ渡します。

Blurや通常の2D Mergeは画素を処理するNodeなので、Merge 3Dの出力をそのまま2D Imageとして扱いません。

## 基本例：画像を3D空間に置いて実写と合成する

次は、ポスター画像を3Dの板として配置し、カメラで撮った結果を実写映像へ重ねる構成です。

```text
Image Plane 3D ─┐
Camera 3D ──────┼→ Merge 3D → Renderer 3D ─┐
Spot Light ─────┘                           ├→ Merge（2D）→ MediaOut
MediaIn（背景映像）─────────────────────────┘
```

1. ポスター画像をImage Plane 3Dへ接続し、3D空間に置く板として扱います。
2. Camera 3Dを追加し、板が見える位置と向きに配置します。
3. 必要に応じてSpot Lightを追加し、板へ光が当たるようにします。
4. これらの3D出力を**同じMerge 3D**へ接続します。順番に接続すると、Merge 3D側に空のSceneInputが追加されます。
5. Merge 3Dの出力をRenderer 3Dへ接続し、カメラとライティングを確認しながら2D画像へ変換します。
6. Renderer 3Dの画像を通常の2D MergeのForeground側へ、背景映像をBackground側へ接続して合成します。

**3D空間の中で物体同士を配置する処理**と、**レンダリング済みの画像を背景映像に重ねる処理**は別段階です。前者がMerge 3D、後者が通常のMergeです。

## 複数のMerge 3Dを使う理由

### まとめた物体を一緒に動かす

Merge 3Dには、Classic 3D Nodeで共通の**Transform**があります。ここで位置・回転・大きさを変更すると、そのMerge 3Dへ接続されている要素が**まとめて**変わります。

たとえば看板の文字、枠、背景の板をMerge 3D Aへまとめ、そのAをMerge 3D Bへ渡します。AのTransformを変更すれば、看板の構成要素を別々に動かさず、一体のグループとして移動できます。Bに後から接続した別の物体までAのTransformで動かすわけではありません。

```text
Text 3D ──────────┐
Image Plane 3D ───┼→ Merge 3D A ─┐
Shape 3D ─────────┘              ├→ Merge 3D B → Renderer 3D
別の3Dオブジェクト ──────────────┘
```

個々の要素を調整するTransformと、複数要素を一緒に動かすTransformを分けられる点が、3Dシーン内での親子関係を組む基本になります。

### Pass Through Lights：ライトを後段へ引き継ぐか

**Pass Through Lights**は、Merge 3Dの**Controls**タブにある、このNode固有の設定です。ここに接続されたライトを、さらに後段のMerge 3Dで追加した物体にも作用させるかを決めます。

次のように、照明のあるシーンAへ、別の物体Bを後から加える場合を考えます。

```text
Image Plane A ─┐
Spot Light A ──┼→ Merge 3D A ─┐
Camera 3D ─────┘              ├→ Merge 3D B → Renderer 3D
Text 3D B ────────────────────┘
```

- **Pass Through Lightsを無効にした場合**：Aに接続したライトは、後段で追加されるBを照らすためには引き継がれません。Aに属する要素へ照明の影響を限定したい構成で使います。
- **有効にした場合**：Aのライトを後段へ通し、Bのように後から加えた要素にも作用させられます。複数のMerge 3Dへ分けていても、共通のライトを使いたい場合に選びます。

Manualは、この制御を使う理由として、後から加えたジオメトリに不要な**プロジェクション（投影）**が及ばないようにする例も挙げています。たとえば、特定の面だけに画像を投影したい場合、投影を含むシーンを先に構成し、後段への引き継ぎを意図的に止めるという使い方です。

この項目は**ライトを下流へ引き継ぐか**の設定であり、シーン全体の明るさを直接決めるスライダーではありません。明るさや影が見えないときは、Light側の設定やRenderer 3DのLighting／Shadows設定も別に確認します。

## 操作上の判断と注意点

- **1つの形状を確認するだけ**なら、形状をRenderer 3Dへ直接接続する単純な構成でも足ります。カメラ・ライト・複数の物体を一緒に扱うときにMerge 3Dが役立ちます。
- **物体の並び順を変えたい**なら、入力の接続順より3D位置とカメラを確認します。通常の2D MergeのForeground／Backgroundとは考え方が異なります。
- **グループの一部だけを動かしたい**なら、その物体のTransformを調整するか、複数のMerge 3Dでグループを分けます。最終Merge 3DのTransformを動かすと、接続したシーン全体に作用します。
- **別のMerge 3Dに追加した物体へライトが効かない**場合は、上流のPass Through Lightsを確認します。ただしRenderer 3D側のLighting設定や物体の材質・位置も結果に関わります。
- **最終的に2Dエフェクトを使いたい**場合は、Renderer 3Dを挟んでからBlurや通常のMergeへ進みます。

## 名前の似たNodeとの違い

- **[Merge（2D）](../compositing/merge.md)**：背景と前景の2D画像を合成します。SceneInputを増やして3D空間をまとめるNodeではありません。
- **pMerge**：Particleのデータをまとめます。Classic 3Dシーンを直接統合する用途とは異なります。
- **uMerge**：USDシーン用のNodeです。Classic 3DのMerge 3Dとはデータの種類が異なります。
- **[Renderer 3D](./renderer-3d.md)**：まとめたClassic 3Dシーンを2D画像へ変換します。Merge 3Dだけでは最終画像になりません。

[Classic 3Dノード一覧](./index.md)から、形状生成・ライト・変形・レンダリングに使うNodeを確認できます。3Dデータと2D画像の違いは[Classic 3Dシーンの基礎](../../learn/02-data/classic-3d.md)も参照してください。

## 出典と確認範囲

**一次資料**：Blackmagic Design『*DaVinci Resolve 21.1 Reference Manual*』（September 2026）、Chapter 88「3D Nodes」、**Merge 3D [3Mg]（pp.1957–1959）**。

SceneInput[#]が接続に応じて増えること、接続可能な要素、Transformによるグループ操作、Pass Through Lightsによる下流ライトの引き継ぎはこの節に基づきます。ポスター合成と看板グループの例は、Manualで確認できる機能を使った説明用の構成であり、21.1実機での再現テストではありません。

内部REGID、処理性能、特定のプロジェクションや材質での表示結果、Free／Studioの差は未検証のため、`verification: partial`を維持しています。
