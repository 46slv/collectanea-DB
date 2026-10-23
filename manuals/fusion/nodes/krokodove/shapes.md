---
title: Shapes（Krokodove）
description: 同じ中心を持つ円や四角形を何重にも重ねるKrokodove Shapesの役割、画像としての扱い、制作例とShapeデータとの違い。
doc_type: node
term_id: shapes
term_short: 同じ中心の周囲へ円や四角形を何重にも重ねた模様を作る、Krokodoveの画像生成ツール。
verification: partial
aliases: [Shapes]
concepts: [image-data]
nodes: [Shapes]
node_family: krokodove
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-20'
---

# Shapes（Krokodove）

**Shapesは、円や四角形などの図形を、同じ中心の周りに何重にも重ねた模様を作るKrokodoveのツール**です。たとえば的のように円が内側から外側へ並ぶ図形や、大小の四角形が入れ子になった模様を考えると、何が作られるか理解しやすくなります。

DaVinci Resolve 21.1 Reference Manualでは、Chapter 105の「Image Create Tools」に分類され、四角形や円を含む同心形状を複数段階で生成するツールとして説明されています。複雑な模様を作る機能ですが、**画面上に任意の図形を手描きするツール**や、**既存の映像から図形を検出するツール**とは説明されていません。

## 「同心形状」と「Shapeデータ」の違い

「同心」とは、図形が**中心を共有する**ことです。小さな円の外側へ大きな円を置く、さらに外側へ円を置く、という重なり方を指します。四角形でも、共通の中心の周囲に大きさの違う四角形を配置すれば同じ考え方になります。

ここでいう「形状」は**完成した模様の見た目**です。Fusionには、図形の輪郭や配置を画素に変換する前の状態で扱う<Term id="shape-data">Shapeデータ</Term>があります。しかしKrokodoveのShapesは、21.1 ManualではShape Toolsではなく**Image Create Tools**に掲載されています。名前が同じだからといって、標準のsEllipseやsRectangleと同じShapeデータを出力するとは考えません。

Shapeデータそのものを後段でも編集したい場合は、[Shapeの基本概念](../../learn/02-data/shape)と[標準Shapeノード](../shapes/)を先に確認してください。Krokodove Shapesは、まず**同心図形の模様を画像として利用したいときの候補**です。

Manualの「複数段階（multiple levels）」は、同心形状を何段にも作るという役割を表しています。3D空間の奥行き、タイムラインのレイヤー、Fusionのノード数を意味すると決まったわけではありません。段階の数や重ね方をどの設定で操作するかは、実機で確認する必要があります。

## 入力・出力とデータの扱い

| 項目 | 現時点で確認できること | 未確認のこと |
| --- | --- | --- |
| 入力 | ManualではImage Create Toolsに分類される。 | 必須の画像入力、Mask・Shape・その他の補助入力があるか。 |
| 生成するもの | 円や四角形を含む、複数段階の同心形状。 | 利用できる形の一覧、段階数、輪郭と塗りの扱い。 |
| 出力 | COLLECTANEA既存カタログでは**2D Image**として分類。 | 正式な端子名・端子数、解像度、Alphaの初期状態。 |

<Term id="image">Image</Term>は、色や透明度を持つ画素のデータです。ここではShapesを画像を作るツールとして説明しますが、表の「2D Image」は**リポジトリのデータ分類**であり、21.1実機で端子を読み取った結果ではありません。frontmatterにも未確認の入力端子を追加していません。

特に、**Shapesの入力へ必ずMediaInをつなぐ**と決めつけないでください。元記事の「Image / Source → Shapes」という図は、Manualからは裏付けられないため、以下ではShapesを単独で確認する手順から始めます。

## 主な用途

### タイトルの背後へ同心円を配置する

文字の背後に大小の円が並ぶ模様を作る用途です。同心円は、文字の中心に視線を集める背景の候補になります。文字を読みやすく保ちたいときは、Shapesの結果とText+を別々に作って、最後に合成します。Shapes自体に文字入力やテキスト処理があると仮定する必要はありません。

### 四角形を重ねてフレーム状の図案を作る

大小の四角形を同じ中心の周囲に並べると、入れ子になった枠のような図案を検討できます。ただし、枠線だけを描くのか、塗りつぶした四角形を重ねるのかはManualの短い説明から判断できません。最初にViewerで出力の見え方を確認します。

### 反復模様の比較・選定

ひとつの中心から形が広がる模様と、画面全体に図形を敷き詰める模様は用途が異なります。Shapesの同心模様が必要なのか、[Pattern](./pattern)のタイル状の模様が必要なのかを、画面に置く場所と視線の集まり方から選べます。

### 動くグラフィックの素材として使う

Shapesで作った模様を画像として取り出せる場合、その後段へ標準Transformなどを接続し、模様全体を動かす構成を検討できます。ただし、**Shapes単体で段階が増減するアニメーションやループを作れるか**は、21.1 Manualの一覧記述だけでは分かりません。

## 制作例：同心図形の上に見出しを載せる

次はShapesの役割を観察しながら使うための**構成案**です。公式Manualの接続図や、Shapesに存在するすべての端子を再現したものではありません。

~~~text
Shapes（模様） ─────────────→ Merge A（Foreground）
                                  ↓
Background（地色） ────────→ Merge A（Background） → Merge B（Background） → MediaOut
Text+（見出し） ─────────────────────────────────→ Merge B（Foreground）
~~~

1. Shapesを追加し、単独でViewerへ表示します。出力端子や必須入力があるかを調べ、円・四角形などがどのように描かれるか確認します。必要な入力がある場合は、その種類を先に調べてください。
2. Inspectorの実際の項目を見て、同心図形の種類や段階に関わる調整ができるか調べます。**Size、Levels、Spacing**などの名前が設定として存在するとは、この資料だけでは断定できません。
3. Backgroundで地色を作ります。Shapesの結果を2D Imageとして渡せることを確認したら、Merge AのForegroundへつなぎ、地色の上に合成します。
4. 図形の外側まで不透明な画像が出る場合は、合成後に地色が覆われます。そのときはViewerでShapesのAlphaを確認し、Merge側のBlendやApply Modeなど、**合成側の設定**で目的の見え方を検討します。図形以外が自動的に透明になるとは限りません。
5. Text+で見出しを作り、Merge BのForegroundへ接続します。文字を最後に重ねれば、見出しの画素をShapesに加工させずに表示できます。
6. 出力を確認し、文字と同心図形の中心が意図どおり重なっているか、図形が文字の読みやすさを損なっていないかを判断します。

この例の**Foreground / Background / Blend / Apply Modeは標準[Merge](../compositing/merge)の機能**です。Shapes側のInspectorにそれらの項目があることを意味しません。また、ShapesをViewerへ表示できない場合は、無理に合成へ進まず入力・出力の条件から確認します。

## 近いツールとの使い分け

| ツール | 21.1 Manualで確認できる役割 | 模様の考え方 |
| --- | --- | --- |
| **Shapes** | 円・四角形などを複数段階の同心形状として作る | 同じ中心の周囲に形を何重にも重ねる |
| [Blobs](./blobs) | 指定した点へ円形の図形を作る | **点の位置**を基準に円を配置する |
| [Lines](./lines) | 1組または複数組の線を段階的に繰り返す | **線の反復**を中心に模様を作る |
| [Pattern](./pattern) | 敷き詰めた図形で画面全体の模様を作る | **画面全体に図形を並べる** |
| [Rasterize](./rasterize) | 画像を点・四角・ひし形などに置き換えて表現する | **元の画像を別の図形で描き直す** |

さらに、[sEllipse](../shapes/s-ellipse)や[sRectangle](../shapes/srectangle)のような標準Shapeノードでは、図形を<Term id="shape-data">Shapeデータ</Term>として保持したまま加工できます。必要な段階で[sRender](../shapes/s-render)に渡して2D Imageへ変換する設計です。

**すでにできた同心模様を画像として使う**ならKrokodove Shapesを検討し、**輪郭や複製の工程をShapeデータのまま組み立てたい**なら標準Shape系を検討すると、接続先の選択を誤りにくくなります。ただしKrokodove Shapesの内部処理方式を推定した比較ではありません。

## 注意点と未確認事項

- **入力端子**：必須入力の有無、追加の画像・Mask・Shape・Region入力、正式なポート名・数は21.1実機で未確認です。
- **Inspector**：形の種類、同心形状の段階数、間隔、太さ、色、中心、回転などを操作できるか、正式項目名・初期値・値域は未確認です。用途の説明に出した言葉をUI名称と混同しないでください。
- **図形の見え方**：輪郭のみか塗りを持つか、図形の重なる順序、背景の透明度、画面端の扱い、出力解像度は未確認です。
- **アニメーション**：段階数の時間変化、各段階の個別制御、シームレスなループの有無は未確認です。
- **バージョン・製品差**：Resolve 21.1のManual掲載は確認済みですが、Free / Studio / Fusion Studio間の利用条件と内部REGIDは実機で確定していません。

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2435「Image Create Tools / Shapes」**。円・四角形を含む同心形状を複数段階で生成するという役割と、Image Create Toolsへの分類を確認しています。

Blobs、Lines、Pattern、Rasterizeとの役割比較も同ページに基づきます。具体的な用途、図案、Mergeによる構成は**公式Manualの掲載例ではなく、役割から組み立てた制作案**です。個別Inspector表・端子表・Alphaの仕様は掲載されていないため、verificationはpartialのままにしています。

[Krokodoveの全体像](./)も参照してください。公式資料の改訂は[Blackmagic Designのサポートページ](https://www.blackmagicdesign.com/jp/support/)で確認できます。
