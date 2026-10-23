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
updated: "2026-10-13"
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

## 追加方法とKeyframeの作り方

TransformのCenterを例にすると、Pathの作り方は主に2つあります。どちらも、最終的には同じPath Modifierを編集します。

### 方法1: CenterをKeyframeにする

1. 動きを始めたいframeへplayheadを移動します。
2. TransformのInspectorでCenterの灰色のKeyframeボタンを押し、最初の位置を設定します。
3. 次のframeへ移動し、ViewerのCenterを別の位置へ動かします。新しい位置と、その時刻に対応するKeyframeが追加されます。
4. 必要な通過地点を同様に追加してから、Viewerで経路の曲がり方を整えます。
5. Spline EditorでDisplacementを表示し、移動する時間配分を調整します。

この方法で自動追加されるModifierは、Preferencesの`Point With`で選んだ既定のPath形式に従います。既定をXY Pathへ変更している場合、Displacementを持つPolyline PathではなくXY Pathが使われます。

### 方法2: 最初からPathを指定する

1. 開始frameで、TransformのCenterを始点へ置きます。
2. InspectorのCenter X/Y、またはViewerの位置Controlを右クリックし、コンテキストメニューの`Path`を選びます。
3. 別frameへ移動してViewer上のCenterを動かします。最初の位置から新しい位置へ線が引かれます。
4. 続けて点を追加し、Viewerで線の形、Spline EditorでDisplacementの変化を調整します。

Polylineのmotion pathは図形を囲むMaskとは異なり、**始点と終点を閉じる必要がありません**。どちらの方法でも、位置の調整はViewer、進行タイミングの調整はDisplacement splineで行います。

```text
Transform.Center（位置パラメータ）
        ↑
      Path Modifier
       ├─ Viewer: 曲線の形と通過地点
       └─ Spline Editor: Displacement（経路上の進行）
```

通常の1次元Slider（Blur Strengthなど）へ、同じ意味のmotion pathを追加することはできません。これは数値の時間変化をSpline Editorで編集できないという意味ではなく、2D/3D位置用の経路とは別の仕組みです。

## 実機の参考例

<!-- capture-reuse:R66 -->

TransformのCenterをキーフレーム化して作ったS35のPath1です。Centerはフレーム0の(0.25, 0.5)から48の(0.75, 0.5)へ進みます。Node Editorには画像処理の3Nodeが並び、Path1はTransformのModifiersタブに表示されています。

[![S35の実機撮影。画像の接続Graph](/img/fusion/captures/S35/graph.png)](/img/fusion/captures/S35/graph.png)

[![S35の実機撮影。フレーム0の入力と移動結果](/img/fusion/captures/S35/frame0.png)](/img/fusion/captures/S35/frame0.png)

[![S35の実機撮影。フレーム48の入力と移動結果](/img/fusion/captures/S35/compare.png)](/img/fusion/captures/S35/compare.png)

[![S35の実機撮影。Path1のModifiersタブとDisplacement1](/img/fusion/captures/S35/modifiers.png)](/img/fusion/captures/S35/modifiers.png)

[![S35の実機撮影。Path1のDisplacement曲線0から1](/img/fusion/captures/S35/spline.png)](/img/fusion/captures/S35/spline.png)

Resolve Studio 21.1.0.14／Windows、1920×1080、両Viewer 40%。緑の線と赤い軸は操作表示です。直線の2点経路とDisplacementを確認した最小例です。曲線経路、Path全体のSize/回転、Heading Offset、XY Pathとの比較は未確認です。 [撮影条件と確認範囲](/img/fusion/captures/S35/capture.json)

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

Headingは、**その時点で経路が向いている方向**をAngleなどへ渡すための出力です。Heading Offsetは、計算した向きへ角度を加減するControlです。

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

## 具体例2: 移動方向に合わせて向きを変える

Pathで位置を動かしただけでは、TransformのAngleは自動で変わりません。矢印や飛行する物体の向きも経路に沿わせたい場合は、AngleをPathのHeadingへ接続します。

1. TransformのCenterへPathを付け、2か所以上の位置をKeyframeで設定します。
2. 元のTransformへ戻り、Inspectorの`Angle`を右クリックします。
3. `Connect To > Path > Heading`を選びます（名前が変更されている場合はそのPathを選びます）。
4. Viewerで移動と回転を確認し、必要に応じてModifiers tabの`Heading Offset`で方向を補正します。

```text
Path Position ──→ Center（画面内の位置）
Path Heading  ──→ Angle （対象の向き）
```

位置と向きは別の値です。位置を追従させるだけならHeadingとの接続は不要です。

## 具体例3: 描いたMaskの輪郭を移動経路として使う

動かしたい位置を一つずつ打つ代わりに、**あらかじめ描いた線の形を、そのまま移動経路にする**方法です。21.1 ManualのChapter 72では、Polyline Maskや編集可能なPaint Strokeを公開し、Pathのshapeへ接続する手順が紹介されています。

1. Polygon Maskで通過させたい曲線を描きます。線を閉じる必要はありません。Paint Strokeを使う場合は、先に`Make Editable`で編集可能にします。
2. Polygon Maskの`Right-click here for shape animation`から、自動で付いたPolylineのKeyframe animationを取り除きます。Manualの例では`Remove Polygon1Polyline`を選びますが、実際の名前はNode名に応じて変わります。
3. 同じ箇所を右クリックして`Publish`を選び、他のControlから参照できるようにします。
4. 動かしたい画像のTransform Centerへ`Path`を追加します。
5. Path側のModifiers tabにある`Right-click here for shape animation`から`Connect To > [公開したPolyline]`を選びます。
6. PathのDisplacementを0.0から1.0までKeyframeで変化させ、始点から終点へ進む動きを作ります。自動で入ったDisplacement Keyframeが操作の妨げになる場合は、Manualの手順どおりいったん解除してから打ち直します。

これでMaskの線を描き直さずに経路として再利用できます。**線の形（Polyline）**と**線の上を進む時刻（Displacement）**は独立しています。PolylineのKeyframeを残してしまうと、時間とともに経路自体も変形するため、静的な移動経路を作る場合は手順2が重要です。

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

## Displacementを編集して速度を変える

Spline EditorでDisplacementを表示すると、横軸が時間、縦軸が**経路上の進行位置**になります。縦軸はViewerのX座標やY座標ではありません。

- 2点を**横方向へ近づける**と、同じ経路上の区間を短い時間で進みます。
- ほぼ水平な区間では、Displacementが変わらないため位置が止まります。
- 右下がりの区間を作ると、進行位置が小さくなり、経路を逆向きに戻ります。
- 点を**縦方向へ動かす**と、そのframeで経路のどこにいるかを変えます。

例えば開始frameで0.0、20frame後で0.5、60frame後で1.0とすれば、経路前半を20frame、後半を40frameで進む設定です。これは動きを考えるための例で、既定のKeyframe値ではありません。経路の曲がり方や長さによって、画面上での見かけの速度は変わります。

### Viewerの点を増やすときの注意

Viewerに表示される経路のControl Pointは、すべてがDisplacementのKeyframeと一対一とは限りません。Manualでは、**locked point**は対応するDisplacementの点を持ち、**unlocked point**は経路の形を変えるための点で、Displacementの点を持たないと説明されています。

速度を変えずにカーブの曲がり方だけを整えるなら、時間のKeyframeを増やす操作と、経路の形状点を増やす操作を区別してください。Viewerの線を細かく調整したいだけなら、必ずしもその位置の通過時刻を追加する必要はありません。

## 問題が起きたときの確認

| 症状 | 最初に確認する点 |
| --- | --- |
| ViewerでPathを動かしても速度が変わらない | 触っているのは位置の形状点か、Spline EditorのDisplacementか |
| Pathを付けたのにDisplacementが見えない | 対象ParameterがXY Pathになっていないか。Preferencesの`Point With`も確認する |
| Splineを動かしてもX/Yの値が直接変わらない | Displacementの縦軸は画面座標ではなく経路上の進行率 |
| 位置だけ動いて矢印の向きが変わらない | Angleを`Path > Heading`へ接続しているか |
| 既存の線を接続したら経路自体が時間で変形する | Publish元のPolylineに不要なKeyframe animationが残っていないか |
| 曲線をなめらかにしたら通過時刻まで変わった | locked / unlockedの点と、対応するDisplacement Keyframeを見分ける |

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

補足としてFusion Fundamentals Chapter 72 pp.1564–1573で、motion pathの作成、Displacementによる速度調整、既存PolylineをPathへ接続する運用例を確認しています。
