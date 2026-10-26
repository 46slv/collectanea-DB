---
title: 正規化座標（Normalized Coordinates）
description: FusionのCenterを相対値として読み、Reference Sizeのピクセル表示やExpressionとの違いを理解する。
doc_type: concept
term_id: normalized-coordinates
term_short: 画像の幅・高さを基準に、位置や距離を相対値で表す座標。
verification: partial
aliases: [正規化座標, normalized position, Center]
concepts: [normalized-coordinates, coordinate-space]
nodes: [Transform, Merge]
tasks: [position, align, layout, automate]
prerequisites: [image-data, parameter-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-26"
---

# 正規化座標（Normalized Coordinates）

Fusionで画像を動かすとき、TransformのCenterにある `0.5` は「0.5ピクセル」ではありません。画像の幅や高さを基準にした**相対的な位置**です。1920×1080のフレームでも、3840×2160のフレームでも、Centerが`(0.5, 0.5)`なら中央を示します。

一方で、TransformにはCenterをピクセル数で表示する`Reference Size`があります。見えている数値と内部で扱う値が異なるため、両者を区別しておくと、位置合わせやExpressionでの制御が分かりやすくなります。

## 0〜1を位置の基準として読む

TransformのCenterはXとYの二つの数値を持ちます。標準的な正規化表示では、各軸の`1.0`をそれぞれの**幅全体・高さ全体に相当する距離**として読みます。

| Center | 位置の読み方 |
| --- | --- |
| `(0.5, 0.5)` | 横・縦とも中央 |
| `(0.25, 0.5)` | 横は左から幅の1/4、縦は中央 |
| `(0.75, 0.5)` | 横は左から幅の3/4、縦は中央 |

`0.5`は基準となる長さの半分、`0.25`は4分の1です。これは「入力画像に何ピクセルあるか」を数えて入力する方式とは異なります。

ここでの0〜1は、**Transformの位置を理解するための基準**です。FusionのあらゆるNodeやControlが同じ座標空間を使う、あるいはすべての位置が0〜1に制限される、という意味ではありません。Centerと[Pivot](./center-pivot-size-angle)も役割が異なります。Centerは画像の配置、Pivotは回転・拡大縮小の基準点です。

## ピクセルへ読み替える

1920×1080のフレーム幅・高さを基準にする場合、正規化座標とピクセル位置の対応は次のように計算できます。

```text
Xのピクセル位置 = 正規化X × 1920
Yのピクセル位置 = 正規化Y × 1080

例: Center = (0.25, 0.50)
X = 0.25 × 1920 = 480
Y = 0.50 × 1080 = 540
```

同じ`0.1`の差でも、1920×1080では横方向なら192px、縦方向なら108pxに相当します。「XとYを同じ数値だけ増やす」ことと、「XとYを同じピクセル数だけ動かす」ことは同じではありません。

| 変更量 | 幅1920px、高さ1080pxでの距離 |
| --- | ---: |
| Xを`+0.10` | 192px相当 |
| Yを`+0.10` | 108px相当 |
| Xを`+0.05` | 96px相当 |
| Yを`+0.05` | 54px相当 |

これは**指定した幅・高さを基準にした換算**です。実際の画面で見える輪郭位置は、画像内の余白、Pivot、拡大縮小、合成するフレームの大きさなどにも左右されます。文字列の両端やロゴの輪郭を揃える場合、Center同士が等間隔でも見た目の余白は均等になりません。

### 実機の参考例

<!-- capture-reuse:R22 -->

1920×1080の画像に対し、CenterをX 0.65／Y 0.55にしています。Viewerは40%表示なので、画面上の移動量をそのまま素材内のピクセル数として測りません。

[![S06の実機撮影例。Inspectorの設定値](/img/fusion/captures/S06/inspector.png)](/img/fusion/captures/S06/inspector.png)

[![S06の実機撮影例。左右Viewerの比較](/img/fusion/captures/S06/compare.png)](/img/fusion/captures/S06/compare.png)

Resolve Studio 21.1.0.14／Windowsで撮影済みのS06を再利用した参考例です。Size 1.25とAngle 12°も設定しています。Centerだけの比較やReference Sizeの表示切り替えは含めていません。 [元の撮影条件と確認範囲](/img/fusion/captures/S06/capture.json)

## TransformのReference Sizeは何を変えるか

`Reference Size`はTransformのInspectorにある表示用の設定です。**Centerの表示数値をピクセル位置として読みやすくする**ためのもので、画像そのものの位置や解像度は直接変更しません。

たとえばTransformの内部Centerが`(0.5, 0.5)`のとき、Reference Widthを1920、Reference Heightを1080とすると、InspectorではCenterが`(960, 540)`として表示されます。

| 内部のCenter | Reference Width / Height | Inspectorに表示されるCenter |
| --- | --- | --- |
| `(0.5, 0.5)` | 100 × 100 | `(50, 50)` |
| `(0.5, 0.5)` | 1920 × 1080 | `(960, 540)` |
| `(0.25, 0.5)` | 1920 × 1080 | `(480, 540)` |

Inspectorで`(960, 540)`と見えても、**内部でのCenterは`(0.5, 0.5)`のまま**です。Reference Width/Heightを変更したときに数値欄の見え方が変わることと、映像が動くことは区別してください。

### 実機で表示を切り替えた比較

S126では、同じTransform1・同じフレームのままReference Sizeだけを切り替えています。数値を読むInspectorと、位置が変わっていないことを見るMediaOut1のViewerを、各状態ごとに分けて示します。

**正規化表示（Reference Size 1 × 1）**

[![S126のInspector。Reference Sizeは1×1、Auto Resolutionはオフ、Center表示は0.5と0.5](/img/fusion/captures/S126/normalized-inspector.png)](/img/fusion/captures/S126/normalized-inspector.png)

[![S126のMediaOut1 Viewer。透過チェッカーボード中央にオレンジ色の楕円がある](/img/fusion/captures/S126/normalized-viewer.png)](/img/fusion/captures/S126/normalized-viewer.png)

**ピクセル表示（Reference Size 1920 × 1080）**

[![S126のInspector。Reference Sizeは1920×1080、Auto Resolutionはオフ、Center表示は960と540](/img/fusion/captures/S126/reference-inspector.png)](/img/fusion/captures/S126/reference-inspector.png)

[![S126のMediaOut1 Viewer。透過チェッカーボード中央に、正規化表示と同じオレンジ色の楕円がある](/img/fusion/captures/S126/reference-viewer.png)](/img/fusion/captures/S126/reference-viewer.png)

2組は同じプロジェクト・タイムライン・フレーム・Graphで撮影しました。SDKで読み出した内部Centerは両方とも`(0.5, 0.5)`で、比較したViewer領域のピクセル差はありません。 [S126の読み出し値](/img/fusion/captures/S126/readback.json) · [撮影条件と確認範囲](/img/fusion/captures/S126/capture.json) · [Graph export（再import未確認）](/img/fusion/captures/S126/fixture.comp)

DaVinci Resolve 21.1 Reference ManualのTransformの項目では、スクリプトからCenterを取得した場合や、他のNodeで使用するためにPublishした場合、取得されるのは元の正規化値だと説明されています。Reference Sizeのピクセル表示を、Expressionで参照する値へそのまま持ち込まないことが重要です。

### Auto Resolution

`Auto Resolution`を有効にすると、Reference Width / Heightの基準は次のように設定されます。

- **DaVinci Resolve内のFusion**：タイムライン解像度
- **Fusion Studio**：現在のFrame Format設定

したがって、Resolveでタイムラインが1920×1080なら、入力に小さなPNGが使われていても「Auto ResolutionはそのPNGのピクセル数を示す」とは考えません。現在どの寸法を基準にしているかは、Reference Width / Heightで確認します。

Reference Sizeは表示の基準であり、実際に画像のWidth / Heightを変更する[Resize](../../nodes/transform/resize)とは別の機能です。[Transform](../../nodes/transform/transform)自体も、移動・拡大縮小しても出力画像の解像度を変更しません。

## 実際に動かして確かめる

Fusionページで画像を表示できる状態にし、次の簡単なGraphを作ります。

```text
MediaIn1 → Transform1 → MediaOut1
```

1. `Transform1`を選び、InspectorのCenterを`(0.5, 0.5)`にします。Viewerで画像の中央位置を確認します。
2. Reference Sizeを正規化値が表示される状態にし、Center Xだけ`0.25`へ変えます。中央から横方向へ画像が移動します。
3. Centerを`(0.5, 0.5)`に戻し、Reference Width / Heightを`1920 / 1080`に設定します。InspectorのCenterが`(960, 540)`と表示されることを確認します。
4. 表示上のCenter Xを`1056`へ変更します。元の`960`から96px相当の差で、内部の正規化Xは`0.55`に対応します。
5. Reference Width / Heightの基準を変更してInspectorの数値表示を比較します。表示数値と画像の実際の位置を別々に観察します。

この例はTransformの標準的なCenter操作とReference Sizeの仕様を確認するためのものです。Viewerの拡大率が100%でない場合、画面上で測るピクセル数とフレーム内の距離は一致しないので注意してください。

## Expressionで位置を共有する場合

二つのTransformの位置を連動させ、二つ目だけ横にフレーム幅の10%分ずらすなら、二つ目のCenterに次のSimpleExpressionを設定できます。

```lua
Point(Transform1.Center.X + 0.1, Transform1.Center.Y)
```

`Point(X, Y)`はXとYを持つ位置の値を返します。上の式は`Transform1`のCenterを参照してXだけ`0.1`を足すもので、`0.1px`を足す式ではありません。21.1 Manualは別NodeのCenterを`Point(...)`で参照する構文を説明しています。

Reference Sizeを1920×1080にして二つ目のTransformのInspectorがピクセル表示になっていても、Expressionで参照する`Transform1.Center.X`は正規化された内部値です。**表示のために1920を掛けた値を、同じ式の中でさらに正規化値として扱わない**ようにします。

詳しい接続手順は[2つのTransform位置を連動する](../../recipes/automation/link-transform-centers)、複数要素の配置式は[等間隔の配置Recipe](../../recipes/automation/equal-spacing-by-index)を参照してください。これらは公式の構文に基づく設計例で、個々のGraph全体の21.1実機動作は未確認です。

## 解像度が変わるときの選び方

フレーム内での相対位置を保ちたい場合は、`(0.2, 0.5)`のような正規化値を基準にします。1920×1080から3840×2160へ変わっても、位置の**割合**を保てます。ただしピクセル数で測った余白は変わります。

逆に、常に96pxだけ右へ移動したいなら、Xのオフセットを基準幅から計算します。

```text
幅が1920pxの場合: 96 / 1920 = 0.05
幅が3840pxの場合: 96 / 3840 = 0.025
```

固定ピクセルの余白が目的なら、正規化されたオフセット値を固定せず、参照する解像度に合わせて換算する必要があります。この設計判断は[Resolutionを跨いでも位置関係を保つ](../../patterns/transform/resolution-aware-positioning)で扱います。

縦横比やピクセルアスペクト比が異なる素材同士では、同じ相対座標でも画面上の見た目の距離は変わり得ます。また、Maskや3D Transformなど、扱うデータや座標空間が異なるNodeへ「Centerの0.5」という数値だけをそのまま適用しないでください。[解像度 / アスペクト比](./resolution-aspect)も併せて確認してください。

## 間違えやすい点

| 状況 | 確認すること |
| --- | --- |
| Centerが`960, 540`と表示される | Reference Sizeでピクセル表示になっていないか。内部値と表示値は別。 |
| `0.1`動かしたのに10pxではない | それは正規化された距離。基準幅・高さを掛けて換算する。 |
| 縦と横で同じ数値なのに移動量が違う | Xは幅、Yは高さが基準。 |
| 解像度を変えると余白のピクセル数が変わる | 相対値は割合を保つ。固定ピクセルの余白には再換算が必要。 |
| 複数の素材の輪郭が揃わない | Centerの配置だけでなく、素材の余白、サイズ、Pivot、合成フレームを確認する。 |
| 別のNodeでは値の意味が違う | 対象Controlの座標空間とReference Sizeの有無を確認する。 |

## 関連する記事

- [Center / Pivot / Size / Angle](./center-pivot-size-angle)：配置点と変形の中心を区別する。
- [解像度 / アスペクト比](./resolution-aspect)：幅・高さ・表示比率を整理する。
- [Transform](../../nodes/transform/transform)：CenterとReference Sizeを持つ基本Node。
- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)：値の参照と演算。
- [等間隔の配置Recipe](../../recipes/automation/equal-spacing-by-index)：相対位置を使った実際のレイアウト例。

## 出典と検証範囲

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（2026年9月）：

- Chapter 120「Transform Nodes」pp.2879–2883：Transformの役割、Center / Pivot、Reference Sizeの表示変換、スクリプトとPublishが元の正規化値を取得すること、Auto Resolutionの基準。
- Chapter 73「Using Modifiers, Expressions, and Custom Controls」pp.1586–1588：SimpleExpression、`Point()`による別Nodeの位置参照。

計算例と操作例は上記仕様から構成しました。正規化された位置とReference Sizeの関係は21.1 Manualで確認済みです。Viewer操作や複数Nodeにまたがる作例は21.1実機での検証をしていないため、`verification: partial`としています。DaVinci Resolve Free / Studioの差、すべてのNodeの座標系までは本記事の確認範囲に含めません。
