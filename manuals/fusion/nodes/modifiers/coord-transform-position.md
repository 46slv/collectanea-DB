---
title: CoordTransform Position
description: 3D hierarchyの途中で変形されたobjectについて、元のPositionではなく指定したscene段階での現在位置を計算してParameterへ返すModifier。
doc_type: node
term_id: coord-transform-position
verification: partial
aliases: [CoordTransform Position, Coordinate Transform]
concepts: [classic-3d, coordinate-space, modifiers]
nodes: [CoordTransform Position]
node_family: modifiers
controls: [Target Object, SubID, Scene Input]
outputs: [parameter]
tasks: [3d-position, coordinate-convert, modifier]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-07"
---

# CoordTransform Position

CoordTransform Positionは、**3D objectがFusionのscene hierarchyを通ったあと、指定した段階で実際にどこへ移動しているかを計算し、そのXYZ位置をParameterへ返すModifier**です。

3D object自身が持つ元のPositionと、後段のTransform 3Dなどを通ったあとの位置は同じとは限りません。DaVinci Resolve 21.1 Reference Manualでは、最初は`1, 2, 1`にあるobjectが、後段でscale・offset・rotationを受けた結果、`10, 20, 5`の位置に移る例で説明されています。

## 役割

FusionのClassic 3Dは、Nodeを通るたびに変形を重ねられます。そのため、上流objectのPositionをそのまま別の3D objectへ接続しても、後段のTransformまで含めた現在位置にはなりません。

CoordTransform Positionは、次の2点を対応付けて現在位置を求めます。

- **Target Object** — 元の座標を持つ3D object
- **Scene Input** — そのobjectが後段の変形を受けた状態を含むscene

計算結果は、Modifierを追加したXYZ座標Parameterへ返されます。CoordTransform Position自身が3D objectを移動したり、Imageを生成したりするわけではありません。

## 追加方法

対象となるnumeric inputを右クリックし、**Modify With > CoordTransform Position**を選びます。

21.1 Manualでは、XYZ座標Controlへ追加して、3D hierarchy内の指定地点におけるobjectの現在位置を計算する用途が示されています。

## 入力と出力

通常の3D Nodeのように、Node Editor上でScene InputからScene Outputへ流すNodeではありません。Modifier tabで3D Nodeへの参照を設定し、計算した位置を対象Parameterへ供給します。

~~~text
Target Object ─┐
               ├─ CoordTransform Position → XYZ座標Parameter
Scene Input  ──┘
~~~

- 参照元: Target ObjectとScene Inputで指定するClassic 3DのNode / scene
- 出力: 指定したscene段階で計算されたXYZ位置
- 反映先: CoordTransform Positionを追加した座標Parameter
- Image input / output: なし

## 主な設定項目

### Target Object

変換したい**元の座標を作っている3D Node**を指定します。

Node EditorからNodeをText Edit欄へdragするほか、Controlのcontext menuから選ぶ、またはNode名を直接入力する方法が21.1 Manualで説明されています。

Target Objectには「最終位置を知りたいobjectそのもの」を指定し、後段でどこまで変形された状態を見るかはScene Input側で決めます。

### SubID

一部のgeometryが持つ個別要素を対象にするときに使います。

21.1 Manualで確認できる例は次の2つです。

- Text 3Dが生成した個別の文字
- Duplicate 3Dが生成した特定のcopy

つまり、Node全体の位置だけでなく、対応するgeometryでは内部の特定要素を対象にできます。どのNodeでもSubIDが有効とは限らないため、対応範囲はgeometry側の構造を確認します。

### Scene Input

Target Objectを含み、**変形後の位置まで到達した3D sceneを出力しているNode**を指定します。

Node EditorからNodeをText Edit欄へdragするか、context menuのConnect Toから指定できます。

Scene Inputをどこに取るかで、計算へ含まれるhierarchyの範囲が変わります。後段のTransform 3Dまで含めたい場合は、その変形を通過したsceneを指定します。

## 主な用途

### 後段Transformを含めた位置へ別objectを追従させる

上流objectのPositionではなく、複数のTransform 3Dを通ったあとの位置を別の3D objectへ渡したい場合に使います。

たとえばobjectをgroupのような階層でまとめて動かしていると、object自身のlocalなPosition値だけでは画面内の現在位置を表せません。CoordTransform Positionを使うと、そのhierarchyを通った結果の位置を別のXYZ座標Controlへ渡せます。

### Text 3Dの特定文字を位置参照する

Text 3D全体ではなく特定文字を対象にできるgeometryでは、SubIDでその要素を指定できます。

文字ごとに別objectを追従させる構成を検討するとき、Text 3D全体のPositionだけを見るより細かい単位を選べます。

### Duplicate 3Dの特定copyを位置参照する

Duplicate 3Dが作った複数copyのうち、対応する個別要素をSubIDで対象にできます。

複製全体ではなく、特定copyの現在位置を別の3D要素へ渡す必要がある場合の選択肢になります。

## 最小構成

以下は、Manualで確認できる各Controlの役割から組んだ**構成例**です。

~~~text
3D Source
    ↓
Transform 3D
    ↓
Transform 3D ────────────────┐
                              │ Scene Input
別の3D NodeのPosition ← CoordTransform Position
                              │
                              └ Target Object = 3D Source
~~~

1. 位置を参照したい3D Sourceを作る。
2. 後段へTransform 3Dを追加し、Sourceを移動・回転・scaleする。
3. 別の3D NodeのXYZ座標ControlへCoordTransform Positionを追加する。
4. Target Objectへ元の3D Sourceを指定する。
5. Scene Inputへ、参照したい段階まで変形を通した3D sceneを指定する。
6. 必要なgeometryではSubIDで個別要素を選ぶ。

この例はControlの役割を理解するための構成案です。特定Nodeの組み合わせに対するcurrent runtimeの動作確認を示すものではありません。

## Transform 3Dとの違い

[Transform 3D](../3d/transform-3d)は、Classic 3Dのobjectやsceneへ位置・回転・scaleの変形を**加えるNode**です。

CoordTransform Positionは、そのような変形を通ったobjectについて、指定したscene段階での位置を**計算してParameterへ返すModifier**です。

- objectを動かしたい — Transform 3D
- すでにhierarchy内で動いたobjectの現在位置を別Parameterから参照したい — CoordTransform Position

## 挙動と注意点

CoordTransform Positionが返す位置は、Target Objectだけでは決まりません。Scene Inputで「hierarchyのどこまで進んだ状態を見るか」を指定するため、sceneの途中を参照すれば、それより後段の変形は計算対象に入りません。

Target Objectは元の座標を作るNode、Scene Inputはそのobjectを新しい位置に含むsceneという役割を混同しないことが重要です。

SubIDは、Text 3Dの文字やDuplicate 3Dのcopyのように個別要素を持つgeometryで使うControlです。Manualで確認できていないgeometryについて、SubIDの意味や番号付けは推測しません。

## 関連ページ

- [Modifier Family Overview](./)
- [Transform 3D](../3d/transform-3d)
- [Text 3D](../3d/text-3d)
- [Duplicate 3D](../3d/duplicate-3d)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.2999–3000を基準にしています。同章で、3D hierarchy内の現在位置の計算、`Modify With > CoordTransform Position`、Target Object、SubID、Scene Inputを確認しています。

同Manual Chapter 88 pp.2017–2018にもCoordinate Transform 3Dとして同じ役割とControlの説明があります。

このページではManualで確認できる役割・Control名・接続方法を記載しています。current runtimeのREGID、内部Parameter ID、SubIDの全対応geometryと番号体系、Manualに記載されていないdefault / range、edition差は別のruntime verification対象です。
