---
title: Center / Pivot / Size / Angle
description: TransformのCenterとPivotの役割、SizeとAngle、Reference Sizeの違いをタイトル配置の操作例で理解する。
doc_type: concept
term_id: center-pivot-size-angle
term_short: Centerは位置、Pivotは変形中心、Sizeは表示倍率、Angleは回転を担当する。
verification: partial
aliases: [Center, Pivot, Size, Angle, transform controls]
concepts: [coordinate-space, transform-controls]
nodes: [Transform, Merge]
tasks: [position, scale, rotate, layout]
prerequisites: [normalized-coordinates]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# Center / Pivot / Size / Angle

## このページで分かること

2D <Term id="transform">Transform</Term>の**Centerは画像を置く場所、Pivotは回転と拡大縮小の支点**です。Sizeは倍率、Angleは回転角度を決めます。似た結果に見えても、これらのControlは同じ値を指定するためのものではありません。

例えば、画面の右側に置いたタイトルをその位置で回転させたいとします。Centerを動かすとタイトルの配置が変わり、Pivotを変えると回転の軌道が変わります。素材に透明な余白があれば、タイトルの見た目の中央が画像の座標上の中央と一致するとも限りません。

本記事の対象は**2D ImageのTransform**です。3Dの座標系やShapeの変形とは区別します。

## 基本の考え方

DaVinci Resolve 21.1 Reference ManualのChapter 120では、次の役割が区別されています。

| Control | 主に変えるもの | 変わらないもの |
| --- | --- | --- |
| **Center X / Y** | 画像の画面内での配置位置 | 出力ImageのWidth / Height |
| **Pivot X / Y** | 回転・拡大縮小の基準点 | Centerの設定値 |
| **Size** | 画像の表示倍率 | 出力ImageのWidth / Height |
| **Angle** | Pivotを軸にした回転角度 | 入力素材の元ピクセル数 |

CenterとPivotの既定値はどちらも `(0.5, 0.5)` です。ただし「同じ数値だから同じ点を操作している」とは考えません。Centerは配置、Pivotは変形の支点です。

Transformは**画像の位置や見た目の倍率を変えても出力解像度を変更しない**Nodeです。解像度そのものを変える[Resize](../../nodes/transform/resize)や[Scale](../../nodes/transform/scale)と区別してください。

## Center

TransformのCenterはXとYを持つ位置Controlです。通常の内部値は、画面幅・高さを基準とした[正規化座標](./normalized-coordinates)で扱います。初期値 `(0.5, 0.5)` は中央、`(0.75, 0.5)` は横方向で幅の3/4・縦方向で中央の位置です。

1920×1080を基準にすると、Xを0.5から0.75へ変更した差 `0.25` は `1920 × 0.25 = 480px` 相当です。同じ値の差でも3840px幅なら960px相当になるため、**割合で位置を保つことと、固定ピクセルの余白を保つことは異なります**。

| Center | 1920×1080を基準にした換算位置 |
| --- | --- |
| `(0.5, 0.5)` | X 960px / Y 540px |
| `(0.75, 0.5)` | X 1440px / Y 540px |
| `(0.25, 0.8)` | X 480px / Y 864px |

これは位置Controlの座標換算です。テキストやロゴの**輪郭**が必ずその座標を通るわけではありません。素材内の余白、Size、Pivotや合成先の解像度も確認します。また0〜1は幅・高さの割合を読む基準であって、画像を画面外に置けないという制限ではありません。

### Reference Sizeで数値表示を変える

Transformの`Reference Size`はCenterの**Inspector表示**を変更する機能です。Reference Width / Heightに1920 / 1080を指定すると、内部Centerが `(0.5, 0.5)` でもInspectorには `(960, 540)` と表示できます。ここで表示Xを1056へ変えると、内部Xは `1056 / 1920 = 0.55` に相当します。

Reference Sizeを変更しただけで画像は動きません。21.1 Manualは、スクリプトで読み取ったり他NodeへPublishしたりした場合には、正規化された元の値が得られると明記しています。`Auto Resolution`の参照先は、DaVinci Resolve内Fusionでは**タイムライン解像度**、Fusion Studioでは**現在のFrame Format**です。入力画像の解像度とReference Sizeを無条件に同一視しないでください。

## Pivot

Pivotは**回転と拡大縮小の支点**です。初期値は `(0.5, 0.5)` で、画像の中央を基準とします。Centerだけを右へ移動しても、Pivotの設定値は別に管理されます。

例えばPivotを `(0.25, 0.5)` に変更してからAngleを動かすと、中央Pivotの場合とは異なる位置を基準に画像が回転します。一方、**Angleが0でSizeが等倍**なら、Pivotの位置だけ変えても見た目の違いが現れない場合があります。「Pivotを動かしたのに移動しない」ことは、Controlが無効になった証拠ではありません。

~~~text
同じ画像・同じCenter
  ├─ Pivot = (0.5, 0.5) → 中央付近を支点に回転
  └─ Pivot = (0.25, 0.5) → 左へ寄せた支点で回転
~~~

ただし、Pivot X=0.25は「ロゴの見える部分の左端」を意味しません。透過PNGやText+では、キャンバス内の余白と描画輪郭の位置が異なることがあります。画像のどこを支点にしたいかはViewerで確認します。

## Size

Sizeは画像の**表示倍率**です。`Size = 1` が等倍の基準で、`Size = 0.5` なら見た目をおおむね半分にします。ただし、1920×1080の入力ImageをSize 0.5にしても**出力Imageは1920×1080のまま**です。960×540という別の画像解像度を作る処理ではありません。

`Use Size and Aspect`が有効な場合は、1つのSizeとAspectで縦横を調整します。無効にするとX / YのSizeを個別に設定できます。Aspectを1より大きくすると横方向へ伸びるため、**全体を2倍にするSizeと、横長にするAspectは別のControl**です。21.1 ManualはAspectが使える条件とSizeの調整方式を明示しています。

## Angle

AngleはPivotを中心として画像を回転させます。21.1 Manualでは、値を増やす方向が**反時計回り**、減らす方向が**時計回り**です。

同じCenter・Angleでも、Pivotを中央からずらすと画像が通る軌道は変わります。画像そのものがどちらの方向へ動いたかを確かめるため、Viewerでは**Pivotを変える前後でほかのControlを固定**します。

## 実例：タイトルを移動し、回転の支点を変える

背景映像の上にText+のタイトルを重ねる例です。

~~~text
MediaIn1（背景） ─────────────→ Merge1（Background） ─→ MediaOut1
Text1 → Transform1 ─────────→ Merge1（Foreground）
~~~

Text1の出力は2D Imageで、Transform1も2D Imageを受け取り、変形後の2D Imageを出力します。Merge1はForegroundをBackgroundへ合成します。**Merge出力の解像度はBackground入力の画像が決める**ため、TransformのSizeを小さくしてもキャンバス解像度は変わりません（Chapter 94、p.2212）。

1. Transform1のCenterとPivotを `(0.5, 0.5)`、Sizeを `1`、Angleを `0` にして、まずタイトルの位置を確認します。
2. Centerを `(0.75, 0.5)` に変えます。タイトルは右へ移動します。Pivotは触りません。
3. Centerを維持したまま、Pivot Xだけ `0.25` に変え、Angleを少しずつ増やします。中央Pivotだった場合と回転の様子を比較します。
4. Angleを `0` に戻し、Sizeを `0.5` にします。画像の見た目は小さくなりますが、Transformの出力解像度は変わりません。
5. ViewerでText1、Transform1、Merge1の出力を順に見比べ、配置・変形・背景への合成を切り分けます。

これは公式のControl仕様を使った操作例で、特定フォントの描画範囲や実機での軌道を検証した結果ではありません。タイトルの字形や余白によって、見える位置は変わります。

### うまくいかないとき

| 症状 | まず確認すること |
| --- | --- |
| Pivotを変えても見た目が同じ | Angleが0・Sizeが等倍のままではないか |
| 回転と同時に大きく移動する | Pivotの支点と画像内の透明余白、Centerの配置を分けて確認する |
| HDとUHDで同じ移動値の距離が違う | 正規化座標は画面幅・高さの割合。固定pxの距離は[解像度対応配置](../../patterns/transform/resolution-aware-positioning)で計算する |
| Centerが960、540などで表示される | Reference SizeによるInspectorのピクセル表示を確認する |
| Sizeを変えても出力が1920×1080のまま | Transformの仕様。出力解像度を変えるならResize / Scaleを使う |

## Mergeにも似たControlがある

MergeのForeground Sizing Controlsにも**Center / Size / Angle**があります（21.1 Manual、Chapter 94、p.2213）。単純なタイトル・ロゴ配置だけなら、Merge内部で位置と大きさを調整できます。

ただし、**Pivotの設定を明示したい場合**や位置・変形を合成処理から分離したい場合は、独立したTransformを挿入します。MergeのCenterはForegroundをBackgroundのフレーム内へ配置するため、Backgroundの解像度が異なれば同じ数値に相当するピクセル距離も異なります。

## Resize / Scaleとの違い

- **Transform Size** — 同じ出力解像度の中で見た目を拡大縮小する
- **Resize** — Width / Heightをピクセル数で変更する
- **Scale** — 元解像度に対する倍率でWidth / Heightを変更する

「小さく見える」という結果だけで同じ処理と考えないことが重要です。

## よくある誤解

### Pivotを動かせばImageの位置も移動する

Pivotは変形中心です。Image自体の配置はCenterが担当します。

### Size 0.5なら解像度も半分になる

TransformのSizeでは出力解像度は変わりません。Scale 0.5とは役割が異なります。

### Reference SizeでCenterの内部値がピクセルになる

Reference SizeはInspector上の表示方法を変えます。内部のCenterは正規化値のままです。

## 関連するNode

- [Transform](../../nodes/transform/transform)
- [Merge](../../nodes/compositing/merge)
- [Resize](../../nodes/transform/resize)
- [Scale](../../nodes/transform/scale)

## 関連パターン

- [複数要素の位置関係を共有する](../../patterns/transform/share-position-across-elements)

## 次に読む

→ [解像度 / アスペクト比（Resolution / Aspect）](./resolution-aspect)

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 120「Transform Nodes」pp.2879–2883でCenter、Pivot、Use Size and Aspect、Size、Aspect、Angle、Reference Size、および出力解像度を変更しないことを確認しました。MergeのBackgroundによる出力解像度とForeground Sizing ControlsはChapter 94「Composite Nodes」pp.2212–2213で確認しています。

数値換算は公式の正規化座標仕様に基づく計算例です。タイトル配置Graphの実機結果、文字の描画境界、具体的な回転軌道、Edition差、Expressionを含む実機挙動は未検証のため `verification: partial` としています。