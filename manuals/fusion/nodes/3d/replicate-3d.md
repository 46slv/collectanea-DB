---
title: "Replicate 3D"
description: "3D Meshの頂点やParticleの位置を使い、別の3Dオブジェクトを繰り返し配置するNode。"
doc_type: node
term_id: "replicate-3d"
term_short: "Replicate 3Dは、Meshの頂点やParticleの位置に3Dオブジェクトのコピーを配置するClassic 3D Node。"
verification: partial
aliases: ["Replicate 3D", "3Rep"]
concepts: ["classic-3d"]
nodes: ["Replicate 3D"]
node_family: "3d"
controls: ["Step", "Input Mode", "Time Offset", "Alignment", "Color", "Translation", "Rotation Order", "XYZ Rotation", "XYZ Pivot", "Lock XYZ", "Scale", "Random Seed", "Randomize", "Translation XYZ Jitter", "Rotation XYZ Jitter", "Pivot XYZ Jitter", "Scale XYZ Jitter"]
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Replicate 3D

Replicate 3D [3Rep]は、**配置先の3D Meshの頂点やParticleの位置に、別の3Dオブジェクトのコピーを置く**Nodeです。たとえば球体の頂点に小さなCubeを並べたり、移動するParticleの一つひとつを宇宙船の3Dモデルに置き換えたりできます。

「配置先」と「コピーする物体」は別々に入力します。配置先の**頂点位置**がコピーを置く場所になり、コピーする物体の形はもう一方の入力から取ります。Meshの面全体へランダムに点を散布する処理とは異なります。

Replicate 3Dは<Term id="classic-3d">Classic 3D scene</Term>を扱います。出力は2D画像ではないため、映像へ合成するときは後段の[Renderer 3D](./renderer-3d.md)で描画します。

## 入力と出力

- **Destination（オレンジ）**：コピーを配置する位置を持った3D Geometry / Sceneを受け取ります。Meshなら頂点、3D Particleなら各Particleの位置が配置位置になります。
- **Input[#]（緑）**：複製したい3D Geometry / Sceneを受け取ります。1つ接続すると次のInputが現れ、複数の異なる物体を配置先へ交互に割り当てることもできます。
- **出力**：複製されたGeometryを含むClassic 3D sceneです。後段のMerge 3DやRenderer 3Dへ渡します。

実際にオブジェクトを複製配置するには、配置先とコピー元の両方を用意します。2D Imageを直接Inputへつないで画像の複製を作るNodeではありません。画像を3Dの板として複製したい場合は、先に[Image Plane 3D](./image-plane-3d.md)などでGeometryにします。

## 使い方1：球体の頂点に小さな物体を並べる

```text
Shape 3D（Sphere：配置先のMesh） ──→ Destination ┐
                                            Replicate 3D ──┐
Shape 3D（小さなCube：コピー元） ──→ Input 1 ──┘              ├→ Merge 3D → Renderer 3D → Image
Camera 3D ──────────────────────────────────────────────────┘
```

1. [Shape 3D](./shape-3d.md)でSphereを作り、Replicate 3Dの**Destination**へ接続します。
2. 別のShape 3Dで小さなCubeを作り、**Input 1**へ接続します。
3. Replicate 3Dの結果をMerge 3Dへ渡し、Camera 3Dと合わせてRenderer 3Dで描画します。
4. コピー数が多すぎる場合は、**Step**を上げて使用する頂点を間引きます。コピーの向きを表面に沿わせたい場合は**Alignment**を変更します。

この例でCubeが置かれるのはSphereの**頂点**です。Sphereの分割数が増えるほど候補となる頂点も増えるため、コピー数と描画負荷が変わります。

## 使い方2：Particleを3Dモデルに置き換える

```text
pEmitter → pRender（3D出力） ──→ Destination ┐
                                          Replicate 3D → Merge 3D → Renderer 3D → Image
FBX Mesh 3D（宇宙船） ────────→ Input 1 ─────┘
```

Particleを発生・移動させ、pRenderから3Dとして渡した位置を配置先にします。[FBX Mesh 3D](./fbx-mesh-3d.md)で読み込んだ宇宙船をInput 1へ接続すると、各Particleの位置に宇宙船が配置されます。Particleの移動によって宇宙船の群れを動かせます。

Particleが持つ向きにコピーを合わせる場合はAlignmentを使います。Particleの色を外観へ反映させる場合は後述の**Color**を設定します。これは通常の2D Particle画像を直接複製する接続ではなく、pRenderからの**3D出力**を使う例です。

## Inspector：Controls

### コピーを置く場所と種類

- **Step**：配置先の頂点を何個おきに使うかを決めます。`1`はすべての頂点、`3`は3番目ごとの頂点を使います。細かいMeshでコピー数を抑える際に役立ちます。
- **Input Mode**：複数のInputを接続したときの選び方です。`Loop`は順番に繰り返し、`Random`はJitterタブのRandom Seedに基づいて配置位置ごとのInputを選びます。Inputが1つなら違いはありません。
- **Time Offset**：コピー元にAnimationがある場合、コピーごとに異なる時点の動きを表示します。たとえば回転するCubeを並べ、コピーごとに回転の進行をずらせます。

### 向き・色・大きさ

- **Alignment**：`Not Aligned`はコピー元の向きを保ち、`Aligned`は配置先の法線（表面に対して垂直な方向）を使い、`Aligned TBN`は接線・従法線・法線を使って向きを合わせます。Meshの頂点法線によって結果が異なります。
- **Color**：`Use Object Color`はコピー元の色を保持します。`Combine Particle Color`はコピー元のShaderを保ちながらParticleの色をDiffuseへ反映し、`Use Particle Color`は標準Shaderへ置き換えてParticleの色をDiffuseに使います。
- **Translation**：コピーごとのXYZ位置Offsetを設定します。
- **Rotation Order / XYZ Rotation / XYZ Pivot**：回転の適用順序、各軸の回転量、回転中心を指定します。
- **Lock XYZ / Scale**：3軸の拡大縮小をまとめるか、軸ごとに設定するかを切り替えます。

### Jitter：コピーごとに変化を加える

Jitterタブでは、各コピーの値にランダムな差を付けます。規則的に並んだ物体の位置・向き・大きさにばらつきを付けたいときに使います。

- **Random Seed / Randomize**：ばらつきの組み合わせを決めます。Seedを変えると別の配置になります。
- **Time Offset**：ControlsタブのTime Offsetがコピー順に応じたずれを加えるのに対し、こちらはランダムな時間差を付けます。
- **Translation XYZ Jitter / Rotation XYZ Jitter / Pivot XYZ Jitter / Scale XYZ Jitter**：それぞれ位置、回転、Jitterによる回転の中心、Scaleのばらつきを設定します。Pivot JitterはControlsタブで指定した基本回転そのものではなく、Jitterの回転に作用します。

## Duplicate 3Dとの違い・注意点

- [Duplicate 3D](./duplicate-3d.md)は、コピー間のTransformを使って規則的な列や配列を作る用途です。**Replicate 3Dは別のGeometry / Particleが持つ位置を使う**ため、配置先の形や動きにコピーが追従します。
- **頂点が多いほどコピーが増える**ため、重いMeshを配置先にすると負荷が大きくなります。Stepや配置先Meshの分割数を調整します。
- `Aligned`と`Aligned TBN`は、頂点法線や接線の扱いによって見た目が変わります。重なった位置に分離された頂点があるMeshでは、同じ位置のコピーでも向きが異なる場合があります。
- Particleの生成・消滅によって配置位置の識別や順序が変わる場合、複数Inputの割り当て順も変わることがあります。映像で結果を確認します。

## 関連と出典

- [Classic 3Dノード一覧](./index.md) / [Classic 3D sceneの基礎](../../learn/02-data/classic-3d.md)
- [Shape 3D](./shape-3d.md) / [FBX Mesh 3D](./fbx-mesh-3d.md) / [Renderer 3D](./renderer-3d.md)
- **一次資料**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）, Chapter 88「3D Nodes」, pp.1983–1988, 「Replicate 3D [3Rep]」。入力、Controls / Jitter、粒子を使う基本例を確認しました。
- **未検証**：21.1実機でのREGID、Edition別の表示、特定のMesh / GPUでの描画結果。これらはManualの記述と区別するため、`verification: partial`としています。
