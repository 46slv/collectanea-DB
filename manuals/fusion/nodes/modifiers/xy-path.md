---
title: "XY Path"
description: "Position ControlのX・Yを別々のSplineでAnimationし、各軸の動きとPath全体の位置・大きさ・角度を独立して調整できるModifier。"
doc_type: node
term_id: "xy-path"
term_short: "XY Pathは、PositionのX・Yを別々のSplineとして扱い、各軸を独立してAnimationできるModifier。"
verification: partial
aliases: ["XY Path"]
concepts: ["parameter-data"]
nodes: ["XY Path"]
node_family: "modifiers"
controls: ["X Y Z Values", "Center", "Size", "Angle", "Heading Offset", "Plot Path in View"]
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter", "animate"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-13"
---

# XY Path

XY Pathは、**PositionやCenterのような座標Controlを、X軸とY軸の別々のSplineでAnimationするModifier**です。

Viewer上では通常のmotion pathに近い軌跡として扱えますが、Spline EditorではXとYが独立したcurveとして表示されます。そのため、「横方向は一定速度、縦方向だけeaseさせる」のように、各軸の時間変化を別々に調整したいときに向いています。

## 役割

XY PathをCoordinate Controlへ追加すると、Controlの位置変化はX軸用とY軸用のSplineへKeyframeとして記録されます。

~~~text
X spline ─┐
          ├─ XY Path ─→ Position / Center
Y spline ─┘
~~~

frameを移動してViewer上のControlを別の位置へ動かすと、その位置のX値とY値がそれぞれのSplineへ記録され、FusionがKeyframe間を補間します。

DaVinci Resolve 21.1 Reference Manualでは、XY Pathの利点を「個々のaxisに沿ったmotionを扱いやすいこと」と説明しています。

## 追加方法

対象のCoordinate Controlを右クリックし、次を選びます。

`Modify With > XY Path`

たとえばTransformのCenterや、位置を持つMaskなどのCoordinate Controlへ使えます。

追加後は、frameを移動してViewer上のControlを動かすことで位置をAnimationできます。XY Pathでは、Viewer上の軌跡そのものへKeyframe pointが作られるのではなく、Spline EditorにあるX / Y channelのSplineへ値がKeyframeとして記録されます。

## Pathとの違い

[Path](./path)もPosition ControlをAnimationするModifierですが、時間の扱い方が異なります。

**Path**は、Viewer上のmotion pathで「どこを通るか」を作り、Spline EditorのDisplacementで「その経路をいつ・どの速さで進むか」を調整します。

~~~text
Path
Viewer: motion path
Spline Editor: Displacement
~~~

**XY Path**は、XとYの位置そのものを別々のSplineとして持ちます。

~~~text
XY Path
Spline Editor: X position
               Y position
~~~

そのため、次のように選べます。

- 経路の形と、その経路上の進行タイミングを分けたい — **Path**
- X / Yそれぞれの値と速度curveを直接編集したい — **XY Path**

21.1 Manualでは、XY Pathは一見Displacement pathと同じように操作できる一方、Viewer上のpathへKeyframeを作らず、X / Y channel splineへKeyframeを作る点が違いとして説明されています。

## 入力と出力

XY PathはImageを処理するNodeではなく、Coordinate Controlへ付くModifierです。

- 対象: Position / CenterなどのCoordinate Control
- 入力として考えるもの: frameごとのX / Y位置
- 出力: そのframeでのPosition
- 主な編集場所: ViewerとSpline Editor
- Image input / output: なし

frontmatterの`inputs: parameter` / `outputs: parameter`はこのdata domainを表す分類であり、Node Editor上の画像端子を意味しません。

## 主なControl

### X Y Z Values

AnimationされるControlの位置をX / Y / Z値で表示します。

XY Pathの中心的な値で、Viewer上で位置を動かした結果もここへ反映されます。Spline EditorではXとYを別々のcurveとして編集できます。

### Center

Path全体の中心位置です。

各Keyframeを打ち直さなくても、Centerを変更してAnimation全体をまとめて移動できます。Center自体もAnimationできます。

### Size

Path全体の大きさを変更します。

すでに作ったX / YのAnimationを保ちながら、動く範囲だけを後から広げたり狭めたりできます。

### Angle

Path全体の角度を変更します。

個々のX / Y Keyframeを書き直さず、Animation全体を回転させたい場合に使います。

### Heading Offset

別のControlをXY PathのHeadingへ接続した場合に、計算された向きへ角度を足したり引いたりします。

21.1 Manualでは、MaskのAngleなどをHeadingへ接続する例が挙げられています。位置だけをAnimationする場合は必須ではありません。

### Plot Path in View

XY Pathの実際のpathをViewerへ表示するかどうかを切り替えます。

Spline Editorだけで数値curveを調整したい場合でも、Viewer上の軌跡を表示して位置関係を確認できます。

## 主な用途

XY Pathは、2D PositionのX / Yを別々の時間curveとして扱いたい場合に使います。

たとえば次のような用途があります。

- 横方向は一定速度で進ませ、縦方向だけ上下へeaseさせる。
- Xの移動はそのまま保ち、Yだけ後からタイミングや振幅を調整する。
- Viewerで作ったPosition Animationを、Spline EditorでX / Yごとに細かく整える。
- 作成済みのPosition Animation全体を、Center / Size / Angleで後から移動・拡大縮小・回転する。

## 最小構成

~~~text
Transform Center
      ↑
    XY Path
      ├─ X spline
      └─ Y spline
~~~

TransformのCenterへXY Pathを追加し、開始frameと終了frameでViewer上のCenter位置を変えるだけで、XとYのSplineが作られます。

その後Spline Editorで各curveを別々に編集できます。

## 運用例: 横移動と上下動を別々に整える

画面左から右へ進みながら、一度上へ動いて戻るgraphicを作る例です。

1. graphicを動かしているTransformのCenterへXY Pathを追加する。
2. 開始frameで左側、終了frameで右側へCenterを動かす。
3. 中間frameでCenterを上方向へ動かす。
4. Spline EditorでXとYのchannelを表示する。
5. Xはほぼ一定の傾きになるよう整え、横移動を安定させる。
6. Yだけcurveを調整し、上昇と下降のeaseを作る。

この構成では、横移動の速度を変えずに縦方向の動きだけを調整できます。PathのDisplacementで経路全体の進行を調整する場合とは異なり、X / Yそれぞれの値を直接編集できるのがXY Pathの利点です。

この例は21.1 Manualで確認したXY Pathの仕組みを使った構成例で、Manualに記載された固定presetではありません。

## 既存のPolyline PathをXY Pathへ切り替える

すでにPathで作った動きを、X座標とY座標を別々に編集できる状態へ変更するために、**最初からキーフレームを打ち直す必要はありません**。21.1 Manualでは、Polyline PathとXY Pathはコンテキストメニューから相互に変換できると説明されています。

### PolylineからXYへ

1. TransformのCenterなど、すでにPolyline Pathで動いている座標を用意します。Spline Editorに`Displacement`がある状態です。
2. Viewerにそのモーションパスを表示し、線の上で右クリックします。ManualのChapter 71では、パス名に続く`Path#: Polyline > Convert to X/Y Path`という項目が示されています。`#`は実際のPath番号です。
3. Trackerが生成した経路のように、Viewerのコンテキストメニュー下部に`Tracker1Tracker1Path:Polyline`などの項目がある場合は、そのサブメニューから`Convert to XY Path`を選びます。これも21.1 ManualのChapter 81に記載された操作です。
4. Spline Editorで対象Modifierを開き、`Displacement`ではなくX・Yの2本の曲線が表示されることを確認します。
5. 変換前に確認した開始・中間・終了フレームの位置を再生して確かめます。続けて、XまたはYの曲線だけを編集します。

2と3は異なる経路のコンテキストメニューの例で、**両方の操作を続けて行う手順ではありません**。表示されるPath名は、選択したModifierやTracker名によって変わります。`XY Path`と`X/Y Path`というメニュー表記の違いも、Manual内の記載箇所によるものです。

### XYからPolylineへ戻す

作業途中で「通過する場所を固定し、進行時間だけを別に調整したい」となった場合も、21.1 ManualではXY PathからPolyline Pathへの変換が可能とされています。Viewer上の対象経路を右クリックし、Pathの変換項目を確認してください。**逆方向の項目名は、今回確認したManualの本文では明示されていないため固定表記として記載しません**。

切り替え後にSpline Editorで`Displacement`が現れれば、進行タイミングを経路形状から分けて編集できます。変換操作はキーフレームをゼロから作り直さずに方法を変更するものですが、元のSplineのX/Y値・曲線ハンドル・Displacementの点を同一形式で保持するという意味ではありません。重要なフレームの位置と速度はViewerとSpline Editorで確認します。

## XY Pathの点とキーフレームの関係

XY Pathでは、Viewerで指定した位置に対応する時刻に、Spline Editorの**X曲線とY曲線それぞれへキーが作られます**。Chapter 72では、Viewerの経路上の点とX/Y曲線のキーは対応しており、一方で点を追加すればもう一方にも追加されると説明されています。

一方、Polyline Pathには**locked point**と**unlocked point**があります。Viewerで経路の曲がり方だけを変える点を増やしても、Displacementの時刻キーが増えるとは限りません。XY PathではX/Yの値を変えることが軌跡とその時刻での位置を直接変えるため、両者の編集感覚は異なります。

例えば説明用に、0フレームで`(X=0.2, Y=0.5)`、20フレームで`(0.8, 0.5)`、40フレームで`(0.8, 0.8)`と設定した場合、最初は横へ、後半は縦へ動く構成になります。Xのキーだけを調整すれば、Yのキーの時刻・数値を直接書き換えずに横方向の移動を変更できます。ただしXとYを合成した最終的な軌跡や移動速度は変化するので、Viewerで確認します。数値は操作説明用であり、既定値を表すものではありません。

### Trackerで得た動きを軸別に修正する

Trackerが作ったPolylineの経路をXY Pathへ変換すると、Spline EditorでXとYの動きを分けて確認できます。例えば追跡位置の上下の振れを整えたい場合、まずY曲線を確認し、X方向の動きまでまとめて変更しないように編集できます。ManualのChapter 81も、追跡データをDisplacementからX/Y座標のSplineへ変換する例を挙げています。

ただしこれは**追跡解析をやり直す機能ではなく、得られた座標アニメーションの編集方法を変える操作**です。Pathを参照する他のパラメータがある場合は、変換後の動作も再生して確認します。

## 既定のPathをXY Pathへ変更する

Coordinate Controlで`Animate`を選んだときにXY Pathを既定で使いたい場合は、DaVinci Resolveの`Fusion > Fusion Settings`（Fusion Studioでは`Fusion > Preferences > Globals`）を開き、`Defaults`カテゴリの`Point With`を`XY Path`へ変更できます。

以後、Coordinate Controlのcontextual menuから`Animate`を選ぶと、Displacement pathではなくXY Pathが使われます。

これはXY Path自体のInspector設定ではなく、Fusion全体の既定のPoint Animation typeを変えるPreferenceです。

## 注意点

XY PathのX / Yは、それぞれ独立したSplineです。片方のcurveだけを編集すると、Viewer上の最終的な2D軌跡も変わります。

Pathと同じようなViewer上の軌跡が見えても、内部の時間表現は同じではありません。PathのDisplacementを前提にした調整を、そのままXY Pathへ当てはめないようにします。

また、このページでは21.1 Manualで確認できるControl名と動作を基準にしています。current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差はこのrunでは確定していません。

## 関連ページ

- [Modifier Family Overview](./)
- [Path](./path)
- [Bezier Spline](./bezier-spline)
- [Cubic Spline](./cubic-spline)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 71「Animating in Fusion’s Spline Editor」p.1546、Chapter 72「Animating with Motion Paths」pp.1572–1574、Chapter 81「Using the Tracker Node」pp.1779–1780、およびChapter 124「Modifiers」pp.3030–3031を基準にしています。

同Manualで、X / Yを別々のSplineとして扱うこと、`Modify With > XY Path`で追加する操作、Polyline Pathとのコンテキストメニューからの相互変換、Viewer上の点とX/Yのキーの対応、Tracker由来のPolylineからの変換、各Controlの役割、および`Point With`でXY Pathを既定にできることを確認しています。

current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差は別のruntime verification対象です。
