---
title: "Vector"
description: "Originからの距離と角度で2D位置を作り、位置ParameterをoffsetするModifier。"
doc_type: node
term_id: "vector"
term_short: "Vectorは、Origin・Distance・Angleから2D vectorを作り、位置Parameterを基準点からずらすModifier。"
verification: partial
aliases: ["Vector", "Vector Result"]
concepts: ["parameter-data"]
nodes: ["Vector"]
node_family: "modifiers"
controls: ["Origin", "Distance", "Angle", "Image Aspect"]
inputs: ["parameter"]
outputs: ["parameter"]
tasks: ["drive-parameter", "animate"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-06"
---

# Vector

Vectorは、**基準位置となるOriginから、DistanceとAngleで2Dの位置を作るModifier**です。DaVinci Resolve 21.1 Reference Manualでは節名を「Vector Result」として説明されており、位置Controlを距離と角度でoffsetする用途が中心です。

たとえばMergeのCenterへ使うと、Originを中心に対象を離したり周回させたりできます。Angleを変えても対象そのものが回転するわけではなく、**Originに対する位置関係が回転する**のがポイントです。

## 何をするModifierか

通常のPosition Controlでは、X / Yの2値で位置を直接決めます。Vectorでは、その位置を次の3要素へ分けて扱います。

```text
Origin
  └─ Distance
      └─ Angle
          ↓
      2D Position
```

- **Origin** — vectorを作る基準位置
- **Distance** — Originからどれだけ離すか
- **Angle** — Originからどの方向へ離すか

Origin、Distance、Angleは静的な値にもAnimationにもできます。距離だけを変えれば中心から外側／内側へ移動し、Angleを変えればOriginの周囲を回るような軌道を作れます。

## 追加方法

位置Controlを右クリックし、`Modify With > Vector`を選びます。

21.1 Manualでは節名と作例中の表記に`Vector Result`も使われています。このページでは既存のCOLLECTANEA項目名に合わせて「Vector」と呼び、公式Manual上の`Vector Result`を同じModifierの名称として扱います。

追加後はInspectorのModifiers tabでVectorのControlを調整します。

## 入力と出力

VectorはImageを受け取って加工するNodeではありません。**位置を表すParameterへ付け、Origin・Distance・Angleから計算した位置をそのParameterへ返すModifier**です。

```text
Origin + Distance + Angle
          ↓
        Vector
          ↓
   Position Parameter
```

Node Editor上のImage input / outputを想定するより、対象Parameterの値をどのように作るかを見る方が分かりやすくなります。

## 主なControl

### Origin

DistanceとAngleを計算するときの基準位置です。

Originを固定したままAngleを動かせば、その点を中心に対象を周回させられます。Origin自体もAnimationできるため、**動く基準点の周囲を別の対象が回る**構成も作れます。

21.1 Manualの作例では、OriginへPath Modifierを追加し、Originそのものを画面左側で移動させています。

### Distance

Originから対象位置までの距離を決めます。

Distanceを大きくするとOriginから遠ざかり、小さくすると近づきます。Angleを変えずDistanceだけをAnimationすれば、同じ方向のまま放射状に移動させられます。

Viewer上ではVectorのonscreen controlを使ってDistanceとAngleを調整できます。

### Angle

Originに対する方向を決めます。

AngleをAnimationすると、対象位置はOriginの周囲を回ります。これはTransformの回転とは異なり、**対象の向きを回すControlではありません**。21.1 Manualの作例でも、AngleでTextの位置をOriginの周囲へ回しつつ、Text自体は回転しないことが明記されています。

### Image Aspect

異なるImage Aspectを補正するためのControlです。

21.1 Manualには次の例があります。

- 500 × 500の正方形Image → Image Aspect `1`
- 500 × 1000のImage → Image Aspect `2`

同じ段落では、既定値を現在のFrame Format Preferencesの`width/height`から取得すると説明されています。ただし、通常のwidth ÷ heightとして読むと500 ÷ 1000は0.5になるため、**記述された式と数値例はそのままでは一致しません**。

このページでは一方を推測で訂正しません。非正方形ImageでVectorの見た目が意図した距離・角度にならない場合は、現在のFrame FormatとViewer上の結果を確認しながらImage Aspectを調整してください。

## 運用例1: Originの周囲へTextを配置する

21.1 Manualの基本例では、BackgroundとTextをMergeへ接続し、MergeのCenterへVectorを追加します。

```text
Background ─┐
            ├─ Merge
Text ───────┘
              Center
                ↑
              Vector
```

1. MergeのCenterへVectorを追加する。
2. `Distance`を上げ、TextをOriginから離す。
3. `Angle`を動かし、TextをOriginの周囲へ移動させる。

このとき変わるのはTextの位置です。Text自体のRotationを変えているわけではありません。

## 運用例2: 動くOriginの周囲をorbitさせる

21.1 Manualでは、VectorのOrigin自体へPathを追加し、AngleもAnimationする例が示されています。

作例の流れは次のとおりです。

1. 100-frame Compositionを作る。
2. MergeのCenterへVectorを追加する。
3. VectorのOriginへPath Modifierを追加する。
4. frame 0でOriginを画面左下へ置く。
5. AngleへKeyframeを設定し、frame 0で`10`にする。
6. frame 100でOriginを画面左上へ移動する。
7. frame 100でAngleを`1000`にする。

Originが移動しながらAngleも大きく変化するため、Textは**移動する基準点の周囲を回りながら進む**動きになります。

ここで重要なのは、PathとVectorが別の役割を持っていることです。

- [Path](./path) — Origin自体が通る経路を作る
- **Vector** — そのOriginからのDistance / Angleで対象位置を作る

2つを組み合わせると、単純な1本のPathでは作りにくい「移動する中心の周囲を周回する」動きを構成できます。

## Pivotとの違い

VectorのOriginは、見た目としてはPivotに似た基準点として使えますが、役割は同じではありません。

Pivotを使ったRotationでは、対象そのものの向きも回転処理の影響を受けます。VectorのAngleは、**Originから見た対象位置の方向**を変えます。21.1 Manualの作例でも、Angleを変えてTextを周回させてもText自体は回転しないと説明されています。

「中心点の周囲へ配置したいが、対象の向きはそのままにしたい」という場合にVectorが適します。

## Offsetとの違い

[Offset](./offset-modifier)も元の値から別の値を作るModifierですが、Vectorは位置を**Origin + Distance + Angle**として扱える点が特徴です。

単に一定量を足すだけでなく、中心からの距離と方向として位置を制御したい場合はVectorの方が読みやすくなります。

## XY Path / Pathとの使い分け

位置Animationという目的だけを見ると、Vector以外にもPathやXY Pathを使えます。

- **Vector** — 基準点からの距離と角度で位置を決めたい
- [Path](./path) — Viewer上の経路とDisplacementで位置を動かしたい
- [XY Path](./xy-path) — X / Yを別々のSplineとして編集したい

Orbit、radial layout、動く中心に追従する周回など、**基準点との関係そのものをAnimationしたいとき**はVectorが候補になります。

## 注意点

Vectorは位置Control向けのModifierとして21.1 Manualで説明されています。任意の数値Parameterへ同じControl構成で適用できると推測して広げず、現在のUIで対象Controlに`Modify With > Vector`が出るか確認してください。

また、Image Aspectについては前述のとおり、21.1 Manual内の式と数値例が整合していません。runtime上の実際の計算式や内部Parameter IDは、このページでは確定していません。

## 関連ページ

- [Modifier Family Overview](./)
- [Offset](./offset-modifier)
- [Path](./path)
- [XY Path](./xy-path)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 124「Modifiers」pp.3029–3030を基準にしています。

同Manualで、Vector Resultの用途、`Modify With > Vector`、`Origin`、`Distance`、`Angle`、`Image Aspect`、Viewer上のonscreen control、Merge Centerを使った100-frameの作例、OriginへのPath追加、Angle Animationによるorbitを確認しています。

また、Fusion FundamentalsのModifier一覧（p.1585）でも、Vector ResultはOrigin・Distance・Angleからvectorを作り、Position ParameterをoffsetするModifierとして説明されています。

current runtimeのREGID、内部Parameter ID、Manualに記載されていないrange、Image Aspectの実際の計算式、edition差はこのrunでは確定していません。
