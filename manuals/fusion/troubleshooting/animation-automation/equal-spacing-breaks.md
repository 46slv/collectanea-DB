---
title: 等間隔配置が崩れる
description: TransformのCenterが不規則に並ぶ症状を、要素番号・個数・正規化座標・式・素材の余白に分けて診断する。
doc_type: diagnostic
verification: partial
aliases: [spacing broken, distribution wrong, 等間隔にならない]
concepts: [expressions, normalized-coordinates, resolution]
patterns: [master-follower-parameters, resolution-aware-positioning]
nodes: [Transform, Text+, Merge]
tasks: [debug, layout, distribute, automate]
symptoms: [uneven-spacing, wrong-distribution]
prerequisites: [normalized-coordinates]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-27"
---

# 等間隔配置が崩れる

複数の文字や画像をTransformで横に並べるとき、「3個目だけずれる」「要素を増やすと末尾が合わない」「4Kにすると距離が変わる」は、必ずしも同じ原因ではありません。まず揃えたいのが「各TransformのCenterの間隔」なのか「文字や画像の輪郭どうしの空白」なのかを分けます。このページではCenter間隔を基準に、式の入力と出力を順に診断します。

## まず確認すること

1. TransformのCenterを確認し、隣同士のX値の差が揃っているか。見た目だけでは判定しません。
2. 番号（index）が0始まりか1始まりか、要素数（count）をいくつとして計算したか。
3. 始点と終点を固定する方式か、隣接間隔を固定する方式か。二つを混ぜていないか。
4. Centerが正規化座標で表示されているか、Reference Sizeによるピクセル表示か。
5. ずれたNodeに別のExpression、Keyframe、手動位置補正がないか。
6. Centerは揃っているのに、文字幅や透過画像の余白だけが異なっていないか。

入力と期待位置を確認するまでは、複数のCenterや式を一度に書き換えないでください。

## 原因を切り分ける：3要素だけで試す

1920×1080・同じフレームを使えるFusion Compositionを用意します。背景を作るBackground1と、同じ大きさの文字「●」を生成するText1～Text3を用意し、それぞれTransform1～Transform3を通します。三つのTransform出力をMergeで順に前景として重ね、最後のMergeからMediaOutへ接続します。文字が小さく全て見える状態にし、TransformのSizeやAngleは変更しません。

~~~text
Background1 ──────────────→ Merge1［Background］→ Merge2［Background］→ Merge3［Background］→ MediaOut1
Text1 → Transform1 ───────→ Merge1［Foreground］
Text2 → Transform2 ─────────────────────────────→ Merge2［Foreground］
Text3 → Transform3 ─────────────────────────────────────────────────────→ Merge3［Foreground］
~~~

このGraphは配置の確認用です。各Text+の内部位置、Size、文字の見た目を揃えてください。五つの要素を使う完成Recipeは[複数要素を等間隔に配置する考え方](../../recipes/automation/equal-spacing-by-index)にあります。

### 1. 基準と式の供給元を一つにする

1. Transform1を選び、CenterをX = 0.20、Y = 0.50にします。Inspectorがピクセル表示の場合はReference SizeのAuto ResolutionをオフにしてReference Width / Heightを各1へ変更し、正規化値を表示します。これは表示の基準を変える操作であり、画像を拡大・縮小する操作ではありません。
2. Transform1のInspectorヘッダーでNode名を右クリックし、Edit Controlを開きます。IDを「EndX」、表示名を「End X」、型をNumber、表示ページをControlsとするUser Controlを追加し、End Xに0.80を入力します。EndXは自分で追加するControlで、Transformの標準Controlではありません。
3. Transform2のCenterの数値欄に「=」を入力してReturnを押し、SimpleExpressionを追加します。Center全体へPointを返す式として、次を入力します。

~~~lua
Point(Transform1.Center.X + (Transform1.EndX - Transform1.Center.X) * (1/2), Transform1.Center.Y)
~~~

4. Transform3のCenterにもSimpleExpressionを追加し、次の式を設定します。

~~~lua
Point(Transform1.Center.X + (Transform1.EndX - Transform1.Center.X) * (2/2), Transform1.Center.Y)
~~~

Node名が違う場合は、参照する名前を実際の名前へ合わせます。式中の「1/2」「2/2」は、0始まりの番号1・2を「3要素－1＝2」個の区間で割っています。CenterはXとYを持つPoint型の値なので、式もPointを返します。

### 2. 正しい値を確認する

Transform1～3を一つずつViewerに表示し、同じフレームのInspectorのCenterと位置を確認します。

| 要素 | 番号（0始まり） | Center X | Center Y | 幅1920pxでのX位置 |
| --- | ---: | ---: | ---: | ---: |
| Transform1 | 0 | 0.20 | 0.50 | 384px |
| Transform2 | 1 | 0.50 | 0.50 | 960px |
| Transform3 | 2 | 0.80 | 0.50 | 1536px |

隣接Centerの差はX = 0.30、1920px幅で576px相当です。End Xを0.90へ変更した場合の期待Xは0.20 / 0.55 / 0.90で、差は0.35に変わります。これはManualで説明されるSimpleExpressionと正規化座標を組み合わせて計算した期待値であり、この3要素Graphを今回新たに実機測定した値ではありません。

### 3. ずれ方から原因を絞る

| 観察・再現条件 | 計算例・確認点 | 修正するところ |
| --- | --- | --- |
| 3個目がX = 0.60で止まる | 番号0/1/2の分母に3を使うと、Xは0.20 / 0.40 / 0.60 | 分母を要素数ではなく区間数「count - 1」にする |
| 1個目が0.50、3個目が1.10になる | 1始まりの番号1/2/3をそのまま2で割っている | 番号を0/1/2にするか、式中で1を引く |
| 4個へ増やした後、末尾がずれる | 4要素なら区間は3個。旧式の分母2のままでは一致しない | Node数と各式の分母・分子を揃える |
| End Xを変えても一部だけ追従しない | 対象Centerに式があるか、実在するTransform1.EndXを参照するか | SimpleExpression、Node名、User Control IDを確認する |
| Inspectorに384や960と表示される | Reference Sizeが1920×1080ならCenterがピクセル表示になる | まずReference Sizeを確認し、表示値を正規化値と混ぜない |
| 4K化で見た目の間隔が倍になる | X差0.30は幅1920で576px、幅3840で1152px | 相対位置を守るか、固定pxを守るか決める |
| Center値は等間隔なのに輪郭の隙間が不均等 | 文字幅・Scale・Pivot・透明余白が異なる | Centerの式ではなく素材の寸法と基準点を確認する |

上表の誤式による値は算術上の再現例です。実機のエラーメッセージや全Controlの内部動作を断定するものではありません。

## 主な原因と修正方法

### 要素数と番号が対応していない

始点XをstartX、終点XをendX、要素数をcount、0始まりの番号をindexとすると、考え方は次のとおりです。

~~~text
t = index / (count - 1)
x = startX + (endX - startX) * t
適用条件: count >= 2、index = 0 ... count-1
~~~

count = 1では分母が0になるため使えません。一つの要素だけならCenterを始点へ直接置きます。indexとcountはこの説明上の変数であり、Transformが自動で要素を数えたりNodeを複製したりする標準Parameterではありません。

### 基準の置き方が途中で変わった

「終点を0.80に固定して3要素を収める」と「始点から0.30ずつ配置する」は、要素数が変わったときの結果が違います。前者は要素を追加すると間隔を再計算し、後者は間隔を保つ代わりに終点が変わります。両方の式や個別オフセットを混在させず、どちらを基準にするか決めます。

### ピクセル値と正規化値を混同している

TransformのReference SizeはInspectorの表示方式です。Manualには、Scriptで値を取得したりPublishしたりすると内部の正規化値が得られると明記されています。画面に「960」と見えたからといって、Expression内のTransform1.Center.Xに960が入っているとは考えません。

固定で96pxの余白が必要なら、1920px幅では正規化差0.05、3840px幅では0.025です。解像度ごとに換算する必要がある場合は[解像度を跨ぐ配置設計](../../patterns/transform/resolution-aware-positioning)を参照してください。

### 式以外の値が結果を変えている

値が期待どおりでなければ、対象NodeのCenterに残ったKeyframe、Modifier、別Nodeへの接続、独立した手動補正を確認します。特に式が更新されない場合は、[Expressionが更新されない](./expression-does-not-update)の切り分けを参照し、Node名やControl IDと式の返す型を確認します。既存設定を消す前に供給元を把握してください。

## 直ったかの判定

1. 元の3要素だけで、Center Xが0.20 / 0.50 / 0.80、Yが全て0.50になる。
2. End Xを0.90にしても0.20 / 0.55 / 0.90へ追従し、3つのCenter差が揃う。
3. 元の要素数へ戻したとき、番号0～count-1と分母count-1が揃い、最初と最後が指定位置にある。
4. 最終MergeからMediaOutに同じ配置が届き、異なる字幅による見た目の隙間はCenter計算の不具合と区別できる。

単発で数値を均等に並べるだけなら、21.1 Manualの複数Control編集にある「Set Values To > Spread」も選択肢です。ただし、後で始点や終点を変更しても自動で再配置される仕組みではありません。追従させたい場合はSimpleExpressionを使います。

## 関連する考え方・記事

- [複数要素を等間隔に配置するRecipe](../../recipes/automation/equal-spacing-by-index)
- [正規化座標](../../learn/03-space/normalized-coordinates)
- [式（Expressions）](../../learn/05-time/expressions)
- [親・追従パラメータ](../../patterns/automation/master-follower-parameters)
- [Transform](../../nodes/transform/transform)
- [Expressionが更新されない](./expression-does-not-update)

## バージョン・出典と未検証範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月、[公式サポート](https://www.blackmagicdesign.com/jp/support)から配布）。以下の本文を確認しています。

- Chapter 69、pp.1515–1517：複数Controlの「Set Values To > Spread」、Edit ControlからのUser Control追加とID・Name・Number型。
- Chapter 73、pp.1586–1588：SimpleExpressionの追加、別Nodeの値参照、Point型の返り値、Pick Whip、Remove Expression。
- Chapter 120、pp.2879–2883：TransformのCenter、Reference Sizeによる表示変換、内部の正規化値、Auto Resolution。

今回の3要素・0.20～0.80の数値と、分母間違い・番号ずれの表は、上記仕様と数式に基づく診断用の構成案です。3要素Graph全体の現行21.1実機再現、ExpressionとKeyframeの競合、すべてのOS・Edition、違う文字幅の見た目、連続再生での挙動は新たに測定していません。したがってverificationはpartialを維持します。
