---
title: Resolutionを跨いでも位置関係を保つ
description: FusionのTransformで相対位置と固定ピクセルの移動量を分け、入力ImageのWidth / Heightから座標を計算する。
doc_type: pattern
verification: partial
aliases: [resolution-aware layout, pixel to normalized]
concepts: [normalized-coordinates, resolution, aspect-ratio]
patterns: [resolution-aware-positioning]
nodes: [Transform, Resize, Merge]
tasks: [position, layout, resize, align]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# Resolutionを跨いでも位置関係を保つ

1920×1080で作ったタイトルを3840×2160へ持っていくとき、「画面の中央から右へ10%」と「中央から右へ96px」は同じ配置ルールではありません。前者は解像度に対する割合を、後者はピクセル数を保ちます。Fusionではこの違いを**TransformのCenterに入れる正規化座標**で扱います。

この記事では、同じ比率の位置、同じピクセル数の移動、両者を組み合わせた配置を、実際に入力できるSimpleExpressionで説明します。基礎となる[正規化座標](../../learn/03-space/normalized-coordinates)と[解像度 / アスペクト比](../../learn/03-space/resolution-aspect)を先に確認すると、数値の意味を追いやすくなります。

## 何を維持したいかを決める

| 目的 | 位置の表し方 | HDからUHDにしたとき |
| --- | --- | --- |
| フレーム内の割合を保つ | 正規化したCenterを固定する | 中央からのピクセル距離は2倍になる |
| 中央から96px右を保つ | Xへ `96 / 幅` を加える | 正規化した移動量は半分になる |
| 画面幅の25%の点から96px右を保つ | `0.25 + 96 / 幅` | 相対位置と固定距離を別々に保つ |

正規化したXは画像の幅、Yは高さをそれぞれ1とする位置です。Centerの標準的な中央位置は`(0.5, 0.5)`です。**96pxをそのままCenterへ加えることはできません**。横方向なら幅、縦方向なら高さで割ってから加えます。

## 入出力とGraphの前提

次のように、前景の2D ImageをTransformで移動し、Mergeで背景へ重ねます。

~~~text
前景Image ─→ Transform1 ─→ Merge1（Foreground・緑）──→ MediaOut1
背景Image ─────────────────→ Merge1（Background・橙）
~~~

- **TransformのInput（橙）**には移動する2D Imageを接続します。**Effect Mask（青）**は必要な場合だけ接続します。TransformはCenterを変更しても出力ImageのWidth / Heightを変更しません。
- **MergeのBackground（橙）**に接続したImageが、合成結果のWidth / Heightを決めます。Foregroundに別解像度のImageを入れても、Foregroundの寸法へ自動的に切り替わるわけではありません。
- 以下の`Input.Width`と`Input.Height`は、**Transform1自身の橙Inputに入るImage**のピクセル寸法を参照します。**MergeのBackgroundやタイムラインの寸法を自動参照するものではありません**。

まず前景Imageと背景ImageのWidth / Heightを一致させてください。例では両方1920×1080、別の解像度で使う際は両方3840×2160とします。異なる解像度の画像を混在させる場合は、後述の「入力Imageと最終キャンバスが違う場合」を確認してください。

## Pattern 1：割合を保つ

画面の横75%、縦50%に位置を置くなら、Transform1のCenterを次の値にします。

~~~text
Center = (0.75, 0.5)
~~~

1920px幅ではX位置が1440px相当、3840px幅では2880px相当です。位置の割合は同じですが、左端からの距離をピクセルで測ると変わります。

Centerは**画像の配置基準点**であり、文字の左端・ロゴの輪郭・不透明なピクセルの端とは限りません。同じCenterでも文字幅や画像内の透明余白が違えば、見た目の余白は一致しません。

## Pattern 2：中央からの96pxを保つ

1920px幅で「中央から右へ96px」なら、正規化したX移動量は`96 / 1920 = 0.05`です。3840px幅なら`96 / 3840 = 0.025`に変わります。

Transform1のCenterへSimpleExpressionを追加し、次を入力します。

~~~lua
Point(0.5 + 96 / Input.Width, 0.5)
~~~

`Point(X, Y)`はXとYを持つ位置を返します。`Input.Width`はTransform1の入力Imageの幅です。幅が変わっても、移動量を「入力Imageの幅を基準にした96px相当」へ換算できます。

| Transform1の入力解像度 | Xの計算 | Center |
| --- | --- | --- |
| 1920×1080 | `0.5 + 96 / 1920` | `(0.55, 0.5)` |
| 3840×2160 | `0.5 + 96 / 3840` | `(0.525, 0.5)` |

これはCenterの移動に関する例です。画像の画素自体を96px広げることや、フレーム外にはみ出した絵柄を切り取らずに保持することとは別です。

### Inspectorで式を設定する

1. 前景ImageへTransformを接続して、Node名を`Transform1`にします。背景も同じ解像度のImageとし、MergeのBackgroundへ接続します。
2. Transform1を選択し、Inspectorの**Center**を確認します。`Reference Size`でピクセル表示にしている場合は、表示された数値を正規化値と取り違えないでください。
3. Centerの数値欄に`=`を入力してReturnを押し、表示された**SimpleExpression**欄へ上の`Point(...)`を入れます。21.1 Manualの「Using SimpleExpressions」で説明されている追加方法です。
4. Viewerで移動した位置を確認します。現在の幅が1920なら、正規化したXは`0.55`相当です。
5. **前景ImageとMerge Backgroundの解像度を両方**3840×2160に変更し、位置を確認します。正規化したXは`0.525`相当になり、中央からの横方向の距離は96px相当のままです。

`Input.Width`が有効な画像サイズを返しているかは、Transformの直前のNodeをViewerへ出して幅を確認します。入力が未接続、別データ型、または評価できない状態なら、この式の動作を前提にしないでください。

## Pattern 3：割合と固定距離を組み合わせる

画面幅25%・高さ75%の点を基準に、そこから右へ96px、上へ48px移動した位置を使う場合は、次のように計算できます。

~~~lua
Point(0.25 + 96 / Input.Width, 0.75 + 48 / Input.Height)
~~~

Fusionの標準的な2D座標でYを正方向へ増やすと上へ移動します。したがって上方向の移動量は加算です。もし画面下方向へ48px動かしたければ`0.75 - 48 / Input.Height`とします。

| 入力解像度 | X | Y（上方向へ48px） |
| --- | ---: | ---: |
| 1920×1080 | `0.25 + 0.05 = 0.30` | `0.75 + 0.044444… ≈ 0.794444` |
| 3840×2160 | `0.25 + 0.025 = 0.275` | `0.75 + 0.022222… ≈ 0.772222` |

`0.25`と`0.75`は画面内での割合、`96`と`48`はピクセル距離という別々の役割を持ちます。どちらかだけを変更したいときも意図が分かります。

## 入力Imageと最終キャンバスが違う場合

`Input.Width`を使う式は、入力ImageのWidthがレイアウトの基準幅と一致している場合に有効です。たとえば次のGraphでは問題になる可能性があります。

~~~text
960×540の前景 ─→ Transform1 ─→ Merge1（Foreground）
1920×1080の背景 ───────────→ Merge1（Background）
~~~

このまま`96 / Input.Width`を使うと`96 / 960 = 0.1`です。ところが1920px幅の合成画面で96px相当の移動を表したいなら、必要な正規化値は`96 / 1920 = 0.05`です。

この場合は**どのImageの寸法を基準に配置するか**を先に決めます。前景をレイアウト基準のキャンバス寸法へ揃えてからTransformするか、基準のWidth / Heightを明示した計算へ切り替えます。

~~~lua
Point(0.5 + 96 / 1920, 0.5)
~~~

上の固定値版では、出力を3840px幅に変更する際に分母も3840へ更新しなければなりません。固定値を入力しただけで自動的に別解像度へ追従するわけではありません。

**TransformのReference Size / Auto Resolutionは別機能です。** Reference SizeはInspector上でCenterをピクセル値として表示する設定であり、内部の正規化値やImageの解像度を変えません。ResolveではAuto Resolutionがタイムライン解像度を基準に表示幅・高さを設定しますが、`Input.Width`をその値へ置き換える機能ではありません。

また、Resizeで実際の画像サイズを変更した場合、**Resizeの前後のどちらでTransformが式を評価するか**によって`Input.Width`は変わります。Merge Backgroundの寸法も含めて、Graph上のどこを配置基準にするかを統一してください。

## ピクセルAspectと見た目の余白

ここまでの数値は正方形ピクセルの1920×1080と3840×2160を前提にしています。非正方形ピクセル素材では、同じWidth / Heightでも表示上の横幅・縦幅の比率が変わります。Centerの計算に使うピクセル数と、最終的に見える輪郭同士の距離は区別します。

同様に、入力画像に透明な余白があったり、TransformでSizeやPivotを変えたりすると、Centerを指定しただけでは「ロゴの左端から96px」を保証しません。必要なのが画像の中心点の配置なのか、不透明な輪郭やテキストのベースラインの整列なのかを確認します。

## うまくいかないとき

| 症状 | 最初に確認すること |
| --- | --- |
| 解像度を2倍にしたら移動量も2倍に見える | 固定の正規化差分（例：`+0.05`）を使っていないか |
| 96pxのつもりが192pxずれる | Transform入力ImageとMerge Backgroundの解像度が違わないか |
| Centerが`960,540`のように表示される | Reference SizeによるInspector表示か、内部の正規化値か |
| 式が期待どおりに動かない | Transformの橙Input、入力ImageのWidth / Height、Node名、SimpleExpression欄を確認 |
| テキストの端の余白だけ合わない | Centerと文字の輪郭・透明余白・Pivot・Sizeを混同していないか |
| ViewerとEditページで大きさが違う | 最終ImageのWidth / Heightと、Edit側のImage Scalingを確認 |

## 関連記事

- [正規化座標](../../learn/03-space/normalized-coordinates)：Center、ピクセル換算、Reference Size
- [解像度 / アスペクト比](../../learn/03-space/resolution-aspect)：Transform / Resize / Scaleと出力解像度
- [TransformでImageを移動する](../../recipes/layout/move-image-with-transform)：基本の操作Recipe
- [2つのTransform位置を連動する](../../recipes/automation/link-transform-centers)：別NodeのCenterを参照するExpression
- [複数要素の位置関係を共有する](./share-position-across-elements)：複数要素の配置責任
- [Transform](../../nodes/transform/transform) / [Resize](../../nodes/transform/resize) / [Merge](../../nodes/compositing/merge)：個別Nodeの機能と接続

## 出典・version・検証範囲

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（2026年9月）。

- Chapter 73「Using Modifiers, Expressions, and Custom Controls」pp.1585–1590：SimpleExpressionの追加方法、`Point(...)`による位置の返却、Image入力の`Width`等の参照、`self.Input.Height / self.Input.Width`を用いた公式計算例。
- Chapter 94「Composite Nodes」pp.2211–2218：MergeのBackground / Foreground、Backgroundが合成結果の解像度を決めること、CenterのReference Size。
- Chapter 120「Transform Nodes」pp.2879–2883：Transformが画像の解像度を変更しないこと、Input / Effect Mask、Center、Reference SizeとAuto Resolution。
- Chapter 11「Image Sizing and Resolution Independence」およびChapter 75「Controlling Image Processing and Resolution」：Fusion内でのImage解像度と、Resolveタイムラインへ戻す場合の注意点。

`Point`、Imageの`Width`/`Height`参照、Reference Sizeの意味は21.1 Manualに基づきます。配置式と数値表はこれらから導いた例で、式を含むGraph全体の21.1実機実行、異なるホスト / Edition、非正方形ピクセル素材の結果は未検証です。このため`verification: partial`としています。
