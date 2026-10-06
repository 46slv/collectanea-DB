---
title: Center / Pivot / Size / Angle
description: 2D Transformの位置・変形中心・表示倍率・回転を別々の役割として理解し、TransformとMergeの配置Controlを読み分ける。
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
updated: "2026-10-04"
---

# Center / Pivot / Size / Angle

## このページで分かること

<Term id="transform">Transform</Term>の基本Controlを、「Imageをどこへ置くか」「どこを中心に変形するか」「どれだけ大きくするか」「どれだけ回すか」に分けて理解します。

同じImageが動いたように見えても、CenterとPivotでは役割が違います。

## 基本の考え方

21.1のTransformでは、次の4つを分けて考えます。

- **Center** — Imageの配置位置
- **Pivot** — rotation / scaleの中心
- **Size** — Imageの表示倍率
- **Angle** — Pivotを中心にした回転

TransformではCenterとPivotの既定値はいずれも0.5 / 0.5で、Imageの中央です。

## Center

Center X / Yを変えるとImage全体の位置が変わります。

```text
Center Xを増やす
→ Imageが右方向へ移動
```

Centerは正規化座標で保持されます。Reference Sizeを使うとInspector上ではピクセル値として表示できますが、内部値は正規化されたままです。

## Pivot

Pivotは、SizeとAngleの基準点です。

Pivotだけを動かしても、Size = 1かつAngle = 0ならImageの見た目がほとんど変わらない場合があります。Pivotをずらした状態でAngleを変えると、Imageが中央ではなく別の点を中心に回転するため違いが分かります。

## Size

SizeはImageの表示倍率です。

TransformのSizeは出力解像度そのものを変更しません。たとえば1920×1080のImageをSize 0.5にして小さく見せても、出力Imageは1920×1080のままです。

Width / Height自体を変えたい場合はResizeまたはScaleを使います。

## Angle

AngleはPivotを中心にImageを回転します。

21.1 Manualでは、正方向が反時計回り、負方向が時計回りです。

## 1つずつ変えて確認する

次の順で確認すると役割を分けやすくなります。

1. Centerだけを変えてImageを移動する。
2. Centerを0.5 / 0.5へ戻す。
3. Pivotだけを中央以外へ移す。
4. Angleを変え、回転中心が変わることを確認する。
5. Angleを戻し、Sizeを変える。

一度に複数Controlを変えない方が、「何が位置で、何が変形中心か」を追いやすくなります。

## Mergeにも似たControlがある

MergeにもForegroundのCenter / Size / Angleがあります。

単純なForeground配置ならMerge内部で済ませることもできます。配置責任を独立したNodeとして持たせたい、同じTransformを後からExpressionやAnimationで扱いたい場合はTransformを分ける方がGraphを読みやすくできます。

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

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 120、pp.2879–2883でTransformのCenter、Pivot、Size、Angle、Reference Sizeを確認しました。MergeのForeground sizingはChapter 94、p.2213で確認しています。

NodeごとのAnimation補間、Expression運用、実機表示差はこのConceptでは未確認です。
