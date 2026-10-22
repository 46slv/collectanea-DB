---
title: "sMerge"
description: "複数のShapeを画像化する前に重ね、入力順・Override Axis・sBooleanとの使い分けを理解する。"
doc_type: node
term_id: "smerge"
term_short: "複数のShapeを画像化せずに重ね、1つのShape出力へまとめるNode。"
verification: partial
aliases: ["sMerge"]
concepts: ["shape-data"]
nodes: ["sMerge"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["Override Axis"]
tasks: ["build-shape", "procedural-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-22"
---

# sMerge

sMergeは、円・四角形・文字など、別々に作った<Term id="shape-data">Shape</Term>を1つにまとめるNodeです。複数の図形を重ねたまま、次のShape系Nodeへ渡せます。まだ画像のピクセルには変換しません。

## 役割

たとえば円の上に星を重ね、その上に文字を置く場合、それぞれのShapeをsMergeへ接続すると、3つの図形を1つの出力として扱えます。後段でまとめて複製したり、最後に `sRender` で画像にしたりできます。

通常の `Merge` が2D Image同士を合成するのに対し、sMergeは**画像化する前の図形データをまとめる**ためのNodeです。ShapeとImageの違いは[シェイプ（Shape）](../../learn/02-data/shape)で説明しています。

## 入力

### Input[#] — 複数のShapeを受け取る

最初は2つの入力端子が表示されます。Shapeを接続するたびに空き端子が追加されるため、3つ以上のShapeも1つのsMergeへ接続できます。21.1 Reference Manualでは、入力数に固定の上限は設けられていないと説明されています。

**端子の順番で重なりの前後関係が決まります。** Manualの例では、最初のオレンジ色の入力が一番下、次の緑色がその上、3つ目のピンク色が最前面です。図形が隠れたときは、まずどの入力端子へ接続しているかを確認します。

## 出力

複数の図形を含む**Shapeデータ**を1つ出力します。後段の `sTransform`、`sGrid`、`sDuplicate` などでShapeのまま加工できます。

通常の画像用Nodeへ渡す場合は `sRender` で2D Imageに変換します。次の構成で結果を確認できます。

```text
sRectangle ─┐
sEllipse ───┼─ sMerge → sRender → Merge → MediaOut
sText ──────┘
```

通常の `Merge` に映像を背景としてつなぐ場合は、`sRender` からの画像を前景として使います。

## 主な設定項目

### Override Axis

InspectorのControlsタブにある、sMerge固有のチェックボックスです。各ShapeのAxis（Shapeの変換に使われる軸）の扱いを上書きする設定です。

21.1 Manualでは機能の存在を確認できますが、具体的な軸位置の計算規則や初期状態までは説明されていません。必要なら位置の異なる2つのShapeをまとめ、Override Axisのオン・オフで後段の変形結果を比較してください。**図形を前後に並べ替えるための設定ではありません。** 重なり順は入力端子で調整します。

SettingsタブにはShape系Node共通の設定がありますが、sMerge固有の項目とは区別します。

## 主な用途

- 丸い背景、アイコン、文字を重ねて、1つのバッジやラベルを作る。
- 異なる形の装飾をまとめてから、`sGrid` で同じ組み合わせを規則正しく並べる。
- 複数の図形をまとめ、後段のShape系Nodeで一括して扱う。
- 図形同士の前後関係を、sRenderより前の段階で決める。

## 運用例：図形と文字を重ねたバッジ

1. `sEllipse` で背景になる大きな円を作り、sMergeの最初の入力へ接続します。
2. `sStar` で小さな星を作り、2つ目の入力へ接続します。
3. `sText` で短い文字を作り、3つ目の入力へ接続します。
4. sMergeを `sRender` へつなぎ、円の上に星と文字が重なっているか確認します。
5. 星や文字が隠れる場合は、sMergeの入力順と各Shapeの位置・大きさを分けて確認します。

```text
sEllipse ──(1: 下)─┐
sStar ────(2: 中)─┼─ sMerge → sRender → 2D Image
sText ────(3: 上)─┘
```

同じバッジを繰り返したい場合は `sMerge → sGrid → sRender` の順にします。円・星・文字をそれぞれ画像に変換してから複製するのではなく、**組み合わせた図形をShapeのまま並べる**構成です。これは制作時に試す構成例であり、公式Manualの完成作例を再現したものではありません。

## 挙動と注意点

- **sBooleanとの違い：** `sMerge` は複数の図形を重ねてまとめます。`sBoolean` は重なり部分を残す・切り抜くなど、図形の領域そのものを演算します。穴を開けるなら[sBoolean](./sboolean)を選びます。
- **通常のMergeとの違い：** sMergeはShapeを受け取ります。映像や画像同士を合成する場合は、`sRender` の後に通常の `Merge` を使います。
- **表示されない場合：** 出力がImageではなくShapeのままではないか確認します。[sRender](./s-render)へ接続してから表示します。
- **順序が違う場合：** 図形を追加した時刻だけで判断せず、現在のInput[#]の接続位置を確認します。

## 関連する考え方・構成

- [シェイプ（Shape）](../../learn/02-data/shape) — 画像化する前の図形データの意味。
- [特殊なデータ領域のまま処理する](../../patterns/data-domain/defer-domain-conversion) — Shape処理を終えてからsRenderへ渡す構成。
- [sGrid](./sgrid) — まとめた図形を行と列に並べる。
- [sDuplicate](./sduplicate) — コピーごとに配置などを変える。
- [sBoolean](./sboolean) — 図形が重なる領域を演算する。
- [sRender](./s-render) — Shapeを2D Imageへ変換する。

## バージョンと検証状況

**確認済み：** DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 117「Shape Nodes」、pp.2746–2747。動的に増えるInput[#]、入力の重なり順、sRenderでの表示、InspectorのOverride Axisを照合しました。

**未確認：** 実機21.1での端子挙動、Override Axisの詳しい計算規則・初期値、エディション差。上記の運用例はManualに記載された動作から組み立てた確認案であり、実機検証済みの結果ではありません。そのため `verification: partial` を維持します。
