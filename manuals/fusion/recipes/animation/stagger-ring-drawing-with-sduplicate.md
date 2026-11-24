---
title: sDuplicateのTime Offsetで円の輪郭を順番に描く
description: 1つのsEllipseのLengthをアニメーションさせ、sDuplicateのTime Offsetで横一列の円に描画の時間差を付ける。
doc_type: recipe
verification: partial
aliases: [円の連続描画, 時間差アニメーション, sDuplicate Time Offset]
concepts: [shape-data, keyframes, normalized-coordinates]
patterns: [defer-domain-conversion]
nodes: [sEllipse, sDuplicate, sRender]
tasks: [animation, shape, repetition]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-25"
---

# sDuplicateのTime Offsetで円の輪郭を順番に描く

## 作るもの

横一列に並んだ5個の円の輪郭を、左から順に描き進めるアニメーションを作ります。各円に個別のキーフレームを打つ代わりに、1個のsEllipseで動きを作り、sDuplicateで複製ごとの時間差を指定します。

このレシピは公式Manualに記載された機能を組み合わせた構成案です。以下の設定値は実機での再現・計測を終えた値ではありません。

## 必要なものと入力条件

- Fusion Composition。少なくとも60フレーム分の作業範囲を確保します。最後のコピーがフレーム36の元Shapeを参照するのはフレーム52の想定です。
- sEllipse、sDuplicate、sRenderを各1個。
- sRenderの出力は1920×1080、正方形ピクセルを想定します。背景素材は不要です。
- 以下のフレーム番号はComposition内の開始位置から数えた相対的な番号です。開始位置が0でない場合は、その分を加えて読み替えます。

## 接続

~~~text
sEllipse（輪郭のアニメーション）
    ↓ Shape
sDuplicate（配置と時間差）
    ↓ Shape
sRender → Viewer
~~~

sDuplicateのInput1にsEllipseのShape出力を接続します。画像のMergeで背景などと合成する場合はsRenderの後に置きます。

## 手順

### 1. 元の円に描画アニメーションを付ける

1. sEllipseのSolidをオフにし、Border Widthを0.008程度から調整します。輪郭が見えやすい色とAlphaを設定します。
2. WidthとHeightを0.09、X Offsetを-0.28、Y Offsetを0に設定します。
3. フレーム12でLengthを0.2にし、キーフレームを設定します。
4. フレーム36でLengthを1.0にして、2つ目のキーフレームを設定します。
5. PositionとAngleは固定します。sEllipseをsRenderで表示し、途中で円弧が伸び、終点で閉じた円になることを確認します。

LengthはSolidがオフのときに表示されます。ここでは完全に消えた輪郭から始めるのではなく、短い円弧から始めて変化を比較します。

### 2. 同時に動く5個の円を作る

sEllipseとsRenderの間にsDuplicateを入れ、Controlsタブで以下の開始値を設定します。

| 設定 | 値 |
| --- | --- |
| Copies | 4 |
| Copy Probability | 1 |
| X Offset / Y Offset | 0.14 / 0 |
| X Size / Y Size | 1 / 1 |
| Rotation | 0 |
| Time Offset | 0 |

Jitterによるばらつきは加えません。Copiesは追加分の数なので、元の円を含めて5個になります。元の円とコピーが重ならず並び、同じタイミングで円弧が変化する状態を先に確認します。

### 3. 時間差だけを変える

1. sDuplicateのTime Offsetを-4に変更します。位置・サイズ・回転・複製数は変えません。
2. フレーム28を表示し、左から右に輪郭の描画の進み具合が異なるか比較します。
3. 同じフレームでTime Offsetを0に戻して表示し、時間差が消えるか確認します。
4. -4に戻して再生し、順に円が閉じる動きになるか確認します。

## 期待される結果と確認ポイント

ManualのTime Offsetの説明をこの構成に適用すると、フレーム28での各円は次の時刻の元Shapeを参照する想定です。

| 円（左から） | Time Offset = 0 | Time Offset = -4 |
| --- | ---: | ---: |
| 元の円 | 28 | 28 |
| コピー1 | 28 | 24 |
| コピー2 | 28 | 20 |
| コピー3 | 28 | 16 |
| コピー4 | 28 | 12 |

これは参照時刻の計算例で、実機から読み取った値ではありません。全参照時刻がキーフレーム間に入るフレーム28で比較することで、範囲外の時刻の扱いと時間差そのものを分けて確認できます。

## この構成で動く理由

sDuplicateのTime Offsetは、上流のShapeに付けたアニメーションをコピーごとに異なる時刻で参照するための設定です。X Offsetは円同士の位置の差、Time Offsetは動きの時間の差です。

元のsEllipseのキーフレームを変更すれば、各コピーの動きの元になるアニメーションも変更できます。Time Offset自体は新しい動きを作る機能ではないので、元Shapeが静止した状態では比較できません。

[フレームごとの評価](../../learn/05-time/frame-evaluation)と[キーフレーム・補間](../../learn/05-time/keyframes-spline-time)も参照してください。

## バリエーション

- 時間差を-2にすれば、コピー間の参照時刻の差を小さくする構成になります。
- Lengthの代わりに元ShapeのWidthとHeightを動かし、順番に拡大するドットに応用できます。両寸法のキーフレームを揃えてください。
- 最後に図形をまとめて動かす場合は、[sMergeとsTransformによる全体移動](./move-shape-group-with-stransform)と同様に、複製後のShapeに変形を加える構成が候補になります。

## うまくいかないとき

- 輪郭が塗りつぶされている場合は、sEllipseのSolidとBorder Widthを確認します。
- 円が1個に見える場合は、Copies、Copy Probability、X Offsetを確認します。
- 時間差が見えない場合は、sDuplicateを外した元Shapeがフレームによって変化するかを確認します。次にTime Offsetだけを0と負の値で比較します。
- 開始直後や終了後の見え方が想定と異なる場合は、参照時刻が元Shapeのキーフレーム範囲を外れていないか確認します。範囲外の評価方式は本記事では保証しません。
- Viewerで表示できない場合は、最後のShape出力をsRenderに接続しているか確認します。

## 関連資料

- [sEllipse](../../nodes/shapes/s-ellipse)
- [sDuplicate](../../nodes/shapes/sduplicate)
- [sRender](../../nodes/shapes/s-render)
- [Shapeの基礎](../../learn/02-data/shape)
- [画像への変換を後段に置くパターン](../../patterns/data-domain/defer-domain-conversion)
- [sDuplicateで段階的に小さくなる円を作る](../shapes/progressive-shrinking-dots-with-sduplicate)

## 出典と検証範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 117 Shape Nodesの以下のページを直接確認しました。

- pp.2735–2738：sDuplicateのShape入出力、Copies、Copy Probability、Time Offset、Offset、Size、Rotation、Jitter。
- pp.2739–2740：sEllipseのSolid、Border Width、Length、位置・寸法・色。
- pp.2759–2760：sRenderによるShapeの画像化、出力解像度。

[公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)

ManualのTime Offsetの具体例には3D形状も登場します。上記の円弧アニメーションでLengthの時間差が期待どおり評価されるかは、Resolve 21.1実機で未確認です。参照時刻、補間、範囲外の評価、Alpha、描画品質、エディション差、性能も未検証のため、verificationはpartialとします。
