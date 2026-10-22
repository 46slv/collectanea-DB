---
title: "TransformのCenterをキーフレームで動かす"
description: "FusionのTransformでCenterに2つのキーフレームを置き、画像の移動とSplineによる速度調整を行う基本レシピ。"
doc_type: recipe
verification: partial
aliases: ["animate transform", "keyframe center"]
concepts: ["keyframes", "frame-evaluation", "transform-controls"]
patterns: ["base-and-animation-offset"]
nodes: ["Transform", "Merge"]
tasks: ["animate", "move", "motion-graphics"]
prerequisites: ["keyframes", "transform-controls"]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-23"
---

# TransformのCenterをキーフレームで動かす

Fusionで画像やロゴを左から右へ動かす、最小のアニメーションを作ります。**位置を決めるのはTransformの「Center」**です。キーフレームは「ある時点でのCenterの値」を記録し、Fusionはその間の位置を補間します。

このレシピではCenterだけを動かし、拡大縮小や回転は変更しません。複数の設定を一度に動かさないため、キーフレームとSplineの働きを区別して確認できます。

## 完成する動き

透明な背景を持つロゴ画像を、画面の左寄りから右寄りへ移動させます。

- 開始時点：Center X = **0.25**、Center Y = **0.5**
- 終了時点：Center X = **0.75**、Center Y = **0.5**

Centerは通常、画面を0〜1で表す正規化座標です。Xの0.5は画面中央、0.25は左寄り、0.75は右寄りを指します。Yを0.5のままにすれば、縦方向の位置を変えずに横へ移動できます。

これは位置の例であり、移動に必要な時間や速度を固定するものではありません。使用する映像に合わせて開始・終了フレームを決めます。

## 用意するものとノード構成

- 移動させたい画像。背景に重ねる場合は、透明部分（Alpha）を持つロゴなどが扱いやすいです。
- 背景映像または背景画像。
- **Transform**：画像の配置と移動を担当します。
- **Merge**：動く画像を背景へ重ねます。

```text
ロゴ画像 ──→ Transform ──→ MergeのForeground ──┐
背景映像 ─────────────────→ MergeのBackground ──┤
                                                 ↓
                                            MediaOut
```

動きの確認だけなら、まず `ロゴ画像 → Transform` の出力をViewerに表示すれば十分です。映像に重ねる段階でMergeを使います。Transformは**2D Image**を受け取り、変形後の2D Imageを返します。Shapeのまま入力するノードではありません。

## 手順：Centerに2つのキーフレームを置く

1. ロゴ画像の後に**Transform**を接続し、Transformを選択してInspectorを開きます。
2. 再生ヘッドを動きの開始フレームに置きます。Transformの**Center**を `X = 0.25 / Y = 0.5` にし、Centerのキーフレームを有効にします。
3. 動きの終了フレームへ再生ヘッドを移動し、CenterのXを **0.75** に変更します。Centerのアニメーションが有効な状態なので、終了時点の値が新たなキーフレームになります。Yは0.5のままです。
4. 開始と終了の間へ再生ヘッドを戻し、Viewerで途中の位置を確認します。
5. 再生して移動を確認します。速度の変化を加えたい場合だけ、次のSpline Editorへ進みます。

**注意：Control名は「position」ではなく「Center」です。** 入力画像の表示位置を変える場合、TransformのInspectorで操作する項目名を使ってください。

キーフレームを有効にした時点と、値を変更する時点を分けるのが重要です。単に別フレームで数値を変えただけで動かない場合は、Centerがアニメーション対象になっているか確認します。

## Spline Editorで速さを調整する

キーフレームの数値と時刻を変えなくても、**キーフレームの間をどのような速さで移動するか**はSpline Editorで調整できます。Splineとは、時間に対してCenterなどの値がどう変わるかを示す曲線です。

1. Fusionの**Spline**パネルを開きます。
2. 対象のTransformを探し、Centerのアニメーション曲線を表示します。XとYが分かれている場合、横移動を調整するのはXです。
3. 開始から終了まで等速で移動させたいときは、変化が直線的な補間を基準にします。
4. 動き出しをゆっくりにしたい、終わりで減速させたいときは、曲線の始点・終点付近の傾きを調整します。
5. ViewerとSplineを見比べ、意図した位置を通りながら速度が変わっているか確認します。

Spline Editorは**値の間の変化**を調整する場所です。開始・終了の位置自体が間違っている場合は、まずInspectorでキーフレームごとのCenterを直します。キーフレームの時刻を移したい場合はKeyframes Editorも使えます。

## CenterとPivotを混同しない

- **Center**：画像を画面のどこに置くか。今回キーフレームを設定する項目です。
- **Pivot**：回転・拡大縮小の基準点。横へ移動するだけなら、通常は既定のままで構いません。
- **Size / Angle**：大きさや回転角度。今回の位置移動とは独立した設定です。

Transformは表示位置やサイズを変えても、入力Image自体のWidth / Heightを変更しません。Resizeのように出力解像度を作り替える処理と区別します。

詳しい違いは[Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)と[Transformのノード解説](../../nodes/transform/transform)を参照してください。

## 応用：基準の配置と動きを分ける

同じ動きを保ったままロゴ全体の配置を調整したい場合は、Transformを2つに分ける方法があります。

```text
ロゴ画像 → Transform（基準の配置）→ Transform（アニメーション）→ Merge
```

上流では静的なサイズ・配置を、下流では時間とともに変えるCenterを管理します。後から「ロゴの基準位置だけ変える」「動きの幅だけ変える」といった修正を、別のノードで行いやすくなります。

ただし2つのTransformのCenterは、いつでも単純な数値の足し算になるわけではありません。各ノードの座標やPivotを含む結果をViewerで確認してください。詳しくは[Base値とアニメーションOffsetを分ける](../../patterns/animation/base-and-animation-offset)を参照してください。

## 想定どおり動かない場合

- **動かない**：Centerのアニメーションが有効か、開始と終了に異なるX値が記録されているかを確認します。
- **一瞬で移動したように見える**：2つのキーフレームの時間間隔と、現在の再生範囲を確認します。
- **途中の動きが急すぎる**：SplineでXの補間曲線を確認します。Yだけを調整していても横移動の速度は変わりません。
- **Viewerに表示されない**：Transformの出力をViewerへ表示しているか、Centerで画像が画面外へ移動していないかを確認します。
- **背景に重ならない**：動かす画像がMergeのForeground、背景がBackgroundへ接続されているか確認します。ロゴ素材に透明部分があるかも確認します。
- **値を変えたのに別の動きになる**：同じCenterにModifierやExpressionが適用されていないか確認します。

## 関連する解説

- [キーフレーム・Spline・時間](../../learn/05-time/keyframes-spline-time)
- [Transform](../../nodes/transform/transform)
- [Base値とアニメーションOffsetを分ける](../../patterns/animation/base-and-animation-offset)
- [Merge](../../nodes/compositing/merge)

## 出典と確認範囲

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 120「Transform Nodes」、**pp.2879–2883**を参照しました。TransformのCenter / PivotとImage入出力、解像度を変更しない性質は同章に基づきます。FusionのSpline EditorとKeyframes Editorの役割は同Manual **p.1288**を参照しています。

この記事の数値や移動手順は、上記の仕様を使って組み立てた**制作例**です。21.1実機での操作画面、各環境の初期フレーム番号、Splineの詳細なUI表示、Edition差は未確認のため、`verification: partial` を維持します。
