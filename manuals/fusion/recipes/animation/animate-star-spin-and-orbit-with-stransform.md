---
title: sStarとsTransformで自転・公転する星を作る
description: 星の向きの回転と、画面中央を回る移動を別のノードへ分けるShapeアニメーションの制作例。
doc_type: recipe
verification: partial
aliases: [星の自転と公転, orbiting star, sStar sTransform animation]
concepts: [shape-data, transform, keyframes]
patterns: [defer-domain-conversion]
nodes: [sStar, sTransform, sRender]
tasks: [animation, shape, orbit, motion-graphics]
prerequisites: [shape-data, keyframes]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-24"
---

# sStarとsTransformで自転・公転する星を作る

## 作るもの

星形の図形を**自転**（星自身の向きが変わる回転）させながら、画面中央を中心に**公転**（中心から少し離れた星が周囲を回る動き）させる構成を作ります。

星の向きは`sStar`の`Angle`、公転は後段`sTransform`の`Rotation`と`X / Y Pivot`で管理します。両方の回転を同じ設定項目へ重ねず、あとから速さや回転方向を個別に直せるようにするのが目的です。

以下は**1920×1080・開始から48フレーム以上あるFusion Composition**を想定した作成例です。表示フレームが0始まりでない場合は、以下の0と48を「開始フレーム」と「48フレーム後」に読み替えてください。記載した数値とアニメーションは**再現のための設定案**で、実機で同条件の結果を測定した値ではありません。

## 必要なものと入力条件

- `sStar`：Shapeを生成します。画像や動画を入力する必要はありません。
- `sTransform`：`Input1`にShapeを受け取り、位置・大きさ・回転・Pivotを追加します。
- `sRender`：Shapeを2D Imageへ変換し、Viewerへ表示します。
- `Inspector`、`Viewer`、`Time Ruler`。画面へ出力する場合のみ`MediaOut`も使います。

## 接続

```text
sStar（Angle：自転）
  │ Shape
  ▼
sTransform（PivotとRotation：公転）
  │ Shape
  ▼
sRender（2D Image）
  │
  ▼
MediaOut（必要な場合）
```

`sStar → sTransform`の間は画像ではなくShapeデータです。完成結果の確認は`sRender`をViewerに表示して行います。

## 手順

### 1. 回る星を中央から離して置く

1. `sStar`を追加し、`Solid`をオンにします。`Points = 5`、`Depth = 0.5`を開始値にします。
2. `Width = 0.18`、`Height = 0.18`を開始値にして、星の大きさを決めます。`Style`で見分けやすい色と`Alpha = 1.0`を設定します。
3. `sStar`の`X Offset = 0.25`、`Y Offset = 0.0`とし、星の中心を画面中央から右へ離します。`Offset`はピクセル数ではなくフレーム幅基準の正規化値です。

### 2. 回転中心を分離する

1. `sTransform`を追加し、`sStar`のShape出力を`sTransform`の`Input1`へ接続します。
2. `sTransform`の`X Offset = 0.0`、`Y Offset = 0.0`、`X Size = 1.0`、`Y Size = 1.0`を開始値にします。
3. `X Pivot = 0.0`、`Y Pivot = 0.0`にして、図形を離して置いた位置とは別の回転中心を画面中央へ設定する構成にします。`Pivot`はViewerで赤いX印として確認・移動できます。
4. `sTransform`を`sRender`へ接続し、`sRender`をViewerで表示します。星が右寄りに見える状態から始めます。

### 3. 公転のキーフレームを設定する

1. 開始フレーム（例：0）で`sTransform`の`Rotation = 0°`にし、Inspectorのキーフレーム操作でアニメーションを有効にします。
2. 48フレーム後（例：48）で`Rotation = 360°`を設定します。
3. 再生し、**途中のフレーム**で星の位置が移動するか確認します。360°回転後の終点は開始位置と重なる想定なので、開始と終了だけの比較では公転したことを判断できません。
4. 必要ならSplineでキー間の変化速度を調整します。等角速度を狙う場合、途中で速度が変わっていないかをViewerで確認してください。初期補間が常に線形とは断定しません。

### 4. 自転のキーフレームを追加する

1. `sStar`に戻り、開始フレーム（例：0）の`Angle = 0°`へキーフレームを設定します。
2. 48フレーム後（例：48）の`Angle = 180°`にします。ここは360°でも構いませんが、最初は公転との違いが確認しやすい量から始めます。
3. 再生して、星の向きが変わりながら、星全体の位置も移動するか観察します。
4. `sStar`の`Angle`だけを一時的に一定値にすると、公転の移動だけを切り分けられます。反対に`sTransform`の`Rotation`を一定値にすると、自転だけを切り分けられます。

## 期待される結果と確認ポイント

- `sStar Angle`が一定・`sTransform Rotation`だけ変化：星の向きとは別に、設定したPivotの周囲を移動する構成。
- `sTransform Rotation`が一定・`sStar Angle`だけ変化：星はその場で向きを変える構成。
- 両方が変化：移動の周期と星自身の向きを別々に編集できる構成。

この3通りは、21.1 Manualにある各Controlの役割を組み合わせた**期待結果**です。今回の48フレーム設定で描画・速度・軌道のピクセル位置を実測した結果ではありません。

## この構成で動く理由

`sStar`の`Angle`は星形そのものの角度を指定し、`sTransform`は入力されたShape全体へ追加の`Rotation`と`Pivot`を与えます。元の星形を中心からずらし、後段の回転中心を中央に置くことで、個々の星の向きと全体の移動を別の段階で制御できます。

Shapeをそのまま扱う理由は[Shapeの基本](../../learn/02-data/shape)を参照してください。画像化は[最後に2D Imageへ変換するパターン](../../patterns/data-domain/defer-domain-conversion)に従い、`sRender`で行います。

## バリエーション

- **逆回転**：`sStar Angle`の終了値を`-180°`にすると、公転と自転の向きを分ける比較ができます。
- **軌道の大きさを変える**：`sStar X Offset`を変えて、回転中心からの距離を調整します。必要なら`Y Offset`も使います。
- **複数のShapeを一緒に動かす**：元図形を`sMerge`でまとめた後に`sTransform`を置く構成が考えられます。個別Shapeと全体変形の評価差は実機で確認してください。

## うまくいかないとき

- **星が画面中央で回るだけ**：`sStar X Offset`が0に戻っていないか、`sTransform`の`Pivot`が星と同じ位置になっていないか確認します。
- **星の向きだけ変わらない**：`sTransform Rotation`ではなく`sStar Angle`に異なるキーフレームがあるか確認します。
- **開始と終了で変化が見えない**：公転は360°で元の位置へ戻るため、途中フレームを確認します。
- **速度が一定でない**：`Spline`で補間を確認します。キー間隔が同じでも必ずしも同じ速度にはなりません。
- **図形が表示されない・Image処理へ接続できない**：`sRender`以降をViewerで表示し、Shapeと2D Imageの接続境界を確認します。

## 関連資料

- [sStarのNode Reference](../../nodes/shapes/sstar)
- [sTransformのNode Reference](../../nodes/shapes/stransform)
- [sRenderのNode Reference](../../nodes/shapes/s-render)
- [TransformのCenterを動かすRecipe](./animate-transform-center)
- [Shapeを2D Imageへ変換する最小Recipe](../shapes/basic-shape-render)
- [Shapeの基本](../../learn/02-data/shape)
- [画像化を後段へ延ばすパターン](../../patterns/data-domain/defer-domain-conversion)

## 出典と検証範囲

**一次資料（仕様の参照元）**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）Chapter 117「Shape Nodes」、pp.2762–2765（sStarのAngle、Offset、Sizeなど）、pp.2766–2767（sTransformのInput1、Rotation、Pivot、階層アニメーション）。[公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)。本稿のControl名・役割は同Manualに基づいて作成された既存[sStar解説](../../nodes/shapes/sstar)・[sTransform解説](../../nodes/shapes/stransform)とも照合しました。

**既存の実機記録**：sStarの形状比較（S21）と、sTransformを使った静止フレームでの変形比較（S22）が各Node Referenceにあります。ただし**今回の自転・公転同時アニメーションを再現した証拠ではありません**。

**今回の静的確認**：接続するデータの種類、21.1に記載されたControlの意味、関連資料リンク、執筆対象パス。

**未検証（NOT_RUN）**：本稿の数値によるResolve / Fusion 21.1実機でのframe 0–48の再生、旋回軌道・補間速度・画素位置、`Transform Axis`のオン／オフ差、保存・再読込後のアニメーション、Free / Studio差、別OS・GPUでの挙動。`verification: partial`を維持します。
