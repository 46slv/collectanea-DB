---
title: "Path"
description: "Position Controlをmotion pathへ結び、経路の形と進行タイミングを別々に調整できるModifier。"
doc_type: node
term_id: "path"
term_short: "Pathは、Position Controlをmotion pathへ結び、経路の形と進行タイミングを別々に調整できるModifier。"
verification: partial
aliases: ["Path"]
concepts: ["parameter-data"]
nodes: ["Path"]
node_family: "modifiers"
controls: ["Center", "Size", "X Y Z Rotation", "Displacement", "Heading Offset"]
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-06"
---

# Path

Pathは、**PositionやCenterのような座標Controlをmotion pathへ結び、対象をその経路に沿って動かすModifier**です。

画像を直接加工するNodeではありません。対象ControlへPathを追加すると、Viewerには動く経路を表すmotion pathが現れ、Spline Editorにはその経路をいつ・どの速さで進むかを決めるDisplacement splineが現れます。

つまりPathでは、**「どこを通るか」と「いつそこを通るか」を分けて調整できます。**

## Pathが持つ2つのSpline

DaVinci Resolve 21.1 Reference Manualでは、Pathは2種類のSplineを使ってPointのAnimationを制御すると説明されています。

- **motion path** — Viewer上で経路の形を決めるspatialなSpline
- **Displacement spline** — Spline Editorで経路上の進行位置を決めるtemporalなSpline

~~~text
Viewer
motion path
「どこを通るか」
      +
Spline Editor
Displacement
「いつ、どこまで進むか」
      ↓
Position / Center
~~~

経路の形を変えても、同じDisplacementなら進行タイミングの考え方は維持できます。逆に、経路を変えずDisplacementだけ編集して、途中で減速・停止・逆方向へ戻る動きも作れます。

## 追加方法

Position系ControlをInspectorまたはViewerで右クリックし、contextual menuからPathを選びます。

Pathを追加した時点で現在位置にKeyframeが作られます。その後はplayheadを別frameへ移動し、ViewerのCenter / Position Controlをdragして新しい位置へ動かすとmotion pathを作れます。

~~~text
対象のPosition Control
        ↓
       Path
        ↓
Viewer: motion path
Spline Editor: Displacement
~~~

TransformのCenter、MaskのCenterなど、位置を持つControlへ使うのが基本です。

## 主なControl

### Center

Path全体の中心位置です。

個々のmotion path pointを描き直さなくても、Centerを動かせば経路全体をまとめて移動できます。Center自体もAnimationできます。

### Size

Path全体の大きさを変更します。

すでに作ったmotionの形を保ったまま、移動範囲だけ広げたり狭めたりできます。

### X / Y / Z Rotation

Path全体を各軸で回転します。

21.1 Manualでは、PathのControls tabからCenter、Sizeと合わせてpath全体の位置・scale・rotationを後から変更できる構成になっています。

### Displacement

Displacementは、**対象がPath上のどこにいるか**を0.0から1.0で表します。

- 0.0 — Pathの始点
- 1.0 — Pathの終点

Displacement splineの形を変えると、経路そのものではなくPath上の進み方が変わります。

たとえば次のような調整ができます。

- 前半を急に進み、後半をゆっくり進む
- 途中で止める
- 一度進んだあと逆方向へ戻す
- 特定区間だけ加速・減速する

Viewer上のcurved pathだけでは速度は決まりません。**motion pathは位置の経路、Displacementはその経路上の時間変化**として分けて考えると理解しやすくなります。

21.1 Manualでは、Viewer上のlocked pointには対応するDisplacement spline上のpointがあり、unlocked pointには対応するDisplacement pointがないことも説明されています。

### Heading Offset

PathのHeadingを別Controlへ接続すると、経路の向きに合わせて対象のorientationを変えられます。

Manualでは、MaskのAngleをPathのHeadingへ接続すると、MaskがPathの向きに沿って角度を変える例が示されています。

単に位置だけを追従させる場合はHeadingを使う必要はありません。進行方向に合わせて矢印、Mask、graphicなどの向きも変えたい場合に使います。

### Right-Click Here for Shape Animation

Pathは位置だけでなく、**Path自体の形をAnimationしたり、別のPolylineへ接続したり**できます。

21.1 Manualでは、Polyline MaskやPaint Strokeのpath controlと接続できることが明記されています。

既存のSpline形状を移動経路として再利用したい場合は、対象のPositionだけを手描きし直すのではなく、Path側のshape connectionを使えるか確認します。

## 具体例1: Transformを曲線に沿って動かす

1. TransformのCenterへPathを追加する。
2. 開始frameで最初の位置を決める。
3. 別frameへ移動し、ViewerでCenterを次の位置へdragする。
4. 必要な位置を追加してmotion pathを作る。
5. Spline EditorでDisplacement splineを開く。
6. Displacement curveを調整し、各区間の速度を整える。

この場合、Viewerで編集している線は「通過する場所」、Spline Editorで編集しているcurveは「その場所を通過する時間」です。

同じ経路でもDisplacementを変えるだけで、一定速度、ease、停止、逆行などを作り分けられます。

## 具体例2: 経路に沿って向きを変える

位置だけPathで動かすと、対象自体のAngleは自動では変わりません。

進行方向へ向けたい場合は、対象のAngle ControlをPathのHeadingへ接続します。ManualではMaskのAngleを例に、Pathの向きへorientationを追従させる方法が説明されています。

~~~text
Path Position ──→ Center
Path Heading  ──→ Angle
~~~

「移動」と「向き」を別Controlとして扱えるため、位置だけ追従させる構成と、進行方向まで追従させる構成を分けられます。

## Perturbを組み合わせる場合

[Perturb](./perturb)はPathと組み合わせる場所によって結果が変わります。

- PositionへPerturbを挿入する — Pathで動く位置そのものへ揺れを加える
- PathのshapeへPerturbを使う — 経路自体を揺らす
- DisplacementへPerturbを挿入する — Pathから外れず、経路上を前後に揺らす

「物体を揺らしたい」「経路を揺らしたい」「進行位置を揺らしたい」を先に分けると、どこへPerturbを入れるか判断しやすくなります。

## XY Pathとの違い

[XY Path](./xy-path)もPosition Controlを動かすModifierですが、時間の持ち方が異なります。

PathはViewer上のmotion pathと、経路上の進行位置を表すDisplacement splineを組み合わせます。

XY PathはX軸とY軸を別々のSplineとして持ち、各axisの値を直接Keyframeで扱います。21.1 Manualでは、XY Pathは個別axisのmotionを編集しやすいことが利点として説明されています。

- 経路の形と、その経路上の進行タイミングを分けたい — **Path**
- X / Yを別々のcurveとして編集したい — **XY Path**

## 入力と出力の考え方

PathはNode Editor上でImage Input / Outputを持つ画像処理Nodeではありません。

~~~text
Path → Position Parameter
~~~

対象になるのはPosition / Centerなどの座標Controlです。PathはViewer上のSplineと時間方向のDisplacementを評価し、そのframeでの位置を対象Parameterへ返します。

このページの inputs: parameter / outputs: parameter はそのdata domainを表すための分類であり、画像Nodeの端子数を意味しません。

## 注意点

Pathの曲線だけを見ても、対象の速度は判断できません。速度や停止、逆行はDisplacement spline側で決まります。

また、Headingを使う場合も、PositionへPathを追加しただけで対象のAngleが自動接続されるとは考えず、向きを追従させたいControlとのconnectionを確認します。

このページでは21.1 Manualで確認できるPathの役割とControl名を基準にしています。current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差はこのrunでは確定していません。

## 関連ページ

- [Modifier Family Overview](./)
- [XY Path](./xy-path)
- [Perturb](./perturb)
- [Track](./track)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.3019–3020を基準にしています。

同Manualで、motion pathとDisplacement splineの役割、Center、Size、X / Y / Z Rotation、Displacement、Heading、shape animation、およびPosition ControlへPathを追加する操作を確認しています。

補足としてFusion Fundamentals Chapter 72 pp.1565–1570で、motion pathの作成、Displacementによる速度調整、既存PolylineをPathへ接続する運用例を確認しています。
