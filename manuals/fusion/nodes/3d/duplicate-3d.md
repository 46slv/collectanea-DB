---
title: "Duplicate 3D"
description: "3Dオブジェクトを一定の移動・回転・拡大率で繰り返し複製し、列・円弧・螺旋などの配置を作るNode。"
doc_type: node
term_id: "duplicate-3d"
term_short: "Duplicate 3Dは、1つの3D sceneやobjectに複製ごとのTransformを加え、規則的な配列を作るClassic 3D Node。"
verification: partial
aliases: ["Duplicate 3D", "3Dp"]
concepts: ["classic-3d"]
nodes: ["Duplicate 3D"]
node_family: "3d"
controls: ["Copies", "Time Offset", "Transform Method", "Transform Order", "Translation", "Rotation", "Pivot", "Scale", "Random Seed", "Randomize", "Jitter Probability", "Translation Jitter", "Rotation Jitter", "Pivot Jitter", "Scale Jitter", "Region Mode", "Region", "Winding Rule", "Winding Ray Direction", "Limit by Object ID", "Object ID"]
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Duplicate 3D

Duplicate 3D [3Dp]は、**入力した3Dオブジェクトを繰り返し複製し、それぞれに位置・回転・大きさの変化を加える**Nodeです。Cubeを横一列に並べる、回転を少しずつ足して円弧状に配置する、複製ごとに縮小して奥へ続く形を作る、といった用途に使います。

扱うのは<Term id="classic-3d">Classic 3D scene</Term>です。画像のpixelを並べる2DのDuplicateとは異なり、結果は3Dのまま次のNodeへ渡します。映像にするには[Renderer 3D](./renderer-3d.md)で描画します。

## 入力と出力

- **SceneInput（オレンジ、必須）**：複製したい3D objectまたは3D sceneを接続します。ここに入ったgeometryが、Controlsタブの設定に従って繰り返し配置されます。
- **MeshInput（緑、条件付き）**：Regionタブの**Region**を**Mesh**にしたときだけ現れる入力です。複製の表示範囲を判定するための3D modelを接続します。ここに接続したmodel自体を複製するわけではありません。
- **出力**：複製結果を含むClassic 3D sceneです。[Merge 3D](./merge-3d.md)に渡してCameraやLightと組み合わせたり、Renderer 3Dに直接渡したりできます。

通常の複製にはSceneInputだけで十分です。MeshInputは配置を制限したい場合にだけ使います。

## 使い方1：Cubeを横一列に並べる

    Cube 3D → Duplicate 3D ──┐
    Camera 3D ────────────────┼→ Merge 3D → Renderer 3D → Image
    Light ────────────────────┘

1. [Cube 3D](./cube-3d.md)をDuplicate 3Dの**SceneInput**へ接続します。
2. Controlsタブの**Copies**で表示する複製番号の範囲を設定します。たとえばFirst Copyを0、最後の番号を4にすると、元のobjectを含む5個分の配置になります。
3. **Translation**のX Offsetに間隔を設定します。X Offsetを1にすると、複製ごとにX方向へ1単位の移動が加わります。
4. Duplicate 3Dの出力をMerge 3Dへ接続し、Camera 3DとLightを加えてRenderer 3Dで表示します。

X Offsetだけを変えれば規則的な列になります。Scaleを変えると奥へ行くほど大きさが変わり、Rotationを変えると複製ごとに向きが変わります。

## 使い方2：回転する配列や螺旋を作る

同じCubeの入力で、Translationに加えてRotationを設定すると、各コピーの向きが変わります。さらに**Transform Method**を切り替えると、同じ数値でも配置結果が変わります。

- **Linear**：各コピー番号を基準にTransform量を計算します。前のコピーの変形結果を次へ順次引き継ぐ方式ではありません。
- **Accumulated**：前のコピーの位置・向き・大きさを出発点に、次のTransformを積み重ねます。回転と移動を組み合わせると、直線ではない軌跡や螺旋状の並びを作れます。

たとえばZ方向へ少し移動し、Y軸まわりの回転も各コピーへ加えると、複製した物体の位置と向きが段階的に変化します。思った軌跡にならない場合は、Transform Methodと後述するTransform Orderを確認します。

## Inspector：Controlsタブ

### Copiesと時間

- **Copies**：表示するコピー番号の範囲を指定します。First Copyが0なら元のobjectを含み、0より大きいと元のobjectを表示せず、指定した番号以降のコピーだけを表示します。単なる「複製を何個追加するか」のスライダーとして読むと個数を間違えやすい項目です。
- **Time Offset**：コピーごとに、入力geometryに設定されたAnimationの参照時刻をずらします。たとえば元のCubeを回転Animationにしておけば、列の各Cubeを異なる回転段階で表示できます。

### 複製ごとのTransform

- **Transform Method**：LinearまたはAccumulated。コピー間の変形を独立計算するか、前のコピーの結果から順に積み重ねるかを選びます。
- **Transform Order**：Scale・Rotation・Translationを計算する順序です。Manualが記載する初期順序はSRT（Scale → Rotation → Translation）です。順序を変えると、同じ値でも最終位置が変わります。
- **Translation**：X・Y・Z Offset。複製ごとに適用する移動量です。
- **Rotation**：X・Y・Zの回転量と、その3軸の適用順序を設定します。
- **Pivot**：複製を回転させるときの中心位置です。Pivotを変えると、同じRotationでも回転軌跡が変わります。
- **Scale / Lock XYZ**：コピーごとの拡大率です。Lock XYZを外すと3軸の拡大率を別々に設定できます。

## Inspector：Jitterタブ

Jitterは、Controlsタブで作った規則的な配列にばらつきを加える設定です。完全に同じ間隔・向きの列では人工的に見える場合に使います。

- **Random Seed / Randomize**：ばらつきの並びを決めるSeedと、その値を作り直すボタンです。
- **Jitter Probability**：Jitterの影響を受けるコピーの割合です。1.0なら全コピー、0.5なら約半数が対象です。
- **Translation Jitter**：複製ごとのX・Y・Z位置に変化を加えます。
- **Rotation Jitter**：各コピーのX・Y・Z回転に差を加えます。
- **Pivot Jitter**：Jitterで追加された回転の中心に差を加えます。Controlsタブの基本Rotationにそのまま適用する設定ではありません。
- **Scale Jitter**：大きさに差を加えます。Lock XYZを外すと軸別に調整できます。
- **Time Offset**：入力geometryのAnimationに対する時刻Offsetです。Controlsタブにも同名のControlがあるため、設定場所を混同しないようにします。

Jitterを上げるだけでは「別の場所に点を新しく生成する」わけではありません。まずControlsタブでコピーを作り、その配置に変化を加える処理です。

## Inspector：Regionタブ

Regionは**どのコピーを表示するか**を位置で選別する機能です。Copiesで作ったすべての配置から、領域内にあるものだけ、あるいは領域外にあるものだけを残せます。

- **Region Mode**：Ignore region（領域判定を使わない）、When inside region（領域内だけ表示）、When not Inside region（領域外だけ表示）を選びます。
- **Region**：All、Cube、Sphere、Rectangle、Meshから範囲の形を選びます。Meshを選ぶと緑色のMeshInputが現れます。
- **Winding Rule / Winding Ray Direction**：Meshを立体的な領域として判定する方法を調整します。Meshが複雑に重なり、内外判定が期待と異なる場合に確認します。
- **Limit by Object ID / Object ID**：MeshInputに複数のmodelが入っている場合、判定へ使うmodelをObject IDで限定します。

たとえば長い列を作っておき、RegionをSphereにしてWhen inside regionを選ぶと、球形の範囲内に入るコピーだけが表示されます。RegionをAnimationすれば、表示されるコピーが時間とともに変わる演出も作れます。

## Replicate 3Dとの違い・注意点

- **Duplicate 3D**：1つの入力を、コピーごとの移動・回転・Scaleで順に配置します。「同じ間隔で10個並べる」など、コピー自体に配置規則を持たせる用途です。
- **[Replicate 3D](./replicate-3d.md)**：別のMeshの頂点やParticleの位置を配置先に使います。「球体の各頂点へ小物体を置く」など、別データの位置に従わせる用途です。

MeshInputはReplicate 3DのDestinationとは異なり、**Duplicate 3Dが作ったコピーの表示範囲を決める**ためのものです。

多くのコピーを作ったり、複雑な3D scene全体を入力したりすると、描画するgeometryが増えます。最初は少ないCopiesで配置を決め、必要な数まで増やします。

## 関連と出典

- [Classic 3Dノード一覧](./index.md) / [Classic 3D sceneの基礎](../../learn/02-data/classic-3d.md)
- [Cube 3D](./cube-3d.md) / [Merge 3D](./merge-3d.md) / [Renderer 3D](./renderer-3d.md) / [Replicate 3D](./replicate-3d.md)
- **一次資料**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）, Chapter 88「3D Nodes」, pp.1938–1942, 「Duplicate 3D [3Dp]」。SceneInput / MeshInput、Controls、Jitter、Regionの記述を確認しました。
- **未検証**：実機でのREGID、Edition差、複雑なMeshに対するRegionの実際の表示結果。これらをManual確認済みの事項と区別するため、verificationはpartialとしています。
