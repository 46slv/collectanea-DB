---
title: "sBoolean"
description: "2つのShapeの重なりを使い、切り抜き・結合・交差部分の抽出などを行うShape Node。"
doc_type: node
term_id: "sboolean"
term_short: "2つのShapeの重なりから、結合・切り抜き・交差部分などの新しい形を作るNode。"
verification: partial
aliases: ["sBoolean"]
concepts: ["shape-data", "rasterization"]
nodes: ["sBoolean"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["Operation", "Style Mode", "Color", "Allow Combining"]
tasks: ["build-shape", "procedural-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-22"
---

# sBoolean

sBooleanは、2つの<Term id="shape-data">Shape</Term>が**どこで重なっているか**を調べ、その領域を使って新しい図形を作るNodeです。たとえば、大きな円から小さな円を切り抜いて輪を作ったり、2つの図形が重なった部分だけを残したりできます。

ここでいうShapeは、画像のピクセルになる前の図形データです。sBooleanが行うのは、2枚の画像を透明度で重ねる処理ではなく、**図形として残す範囲を決める処理**です。

## 役割

入力した2つの図形に対し、Inspectorの**Operation**で残す領域を選びます。入力と出力はどちらもShapeなので、切り抜いた結果をさらに変形・複製できます。通常の映像や画像と合成する際は、後段の `sRender` で2D Imageへ変換します。

単に図形を前後に重ねたい場合は[sMerge](./smerge)を使います。sBooleanは**図形同士が重なる部分を、形の計算に使いたい場合**に選びます。

## 入力

- **Input1（オレンジ・必須）**：基準となるShape。**Subtract**では、こちらの図形から一部を取り除きます。
- **Input2（緑・任意）**：もう一方のShape。**Subtract**では、Input1から切り抜く範囲を指定します。

Subtract以外の演算では、入力する図形を入れ替えても基本的な領域の結果は変わりません。Subtractだけは**Input1 − Input2**という順序に意味があります。

## 出力

演算後の形を、**Shapeデータ**として出力します。別のShape Nodeへつないで加工を続けるか、`sRender` で2D Imageへ変換して表示・合成します。

```text
sEllipse（大）── Input1 ┐
                      ├─ sBoolean → sRender → 2D Image
sEllipse（小）── Input2 ┘
```

sBooleanの出力をImage用の `Merge` に直接つなぐのではなく、**sRenderを間に入れる**ことがポイントです。

## 主な設定項目

### Operation：どの部分を残すか

2つの円を一部重ねた状態で、Operationを切り替えると違いが分かります。

| 操作 | 残る部分 | 使い方の例 |
| --- | --- | --- |
| **Intersection** | 2つの図形が**重なった部分だけ** | 図形同士が交差する範囲を取り出す |
| **Union** | どちらか一方でも図形がある部分 | 重なる図形を1つの大きなシルエットにする |
| **Subtract** | **Input1から、Input2と重なる部分を除いた**部分 | 円や文字の一部をくり抜く |
| **Xor** | 片方にだけある部分。**重なり部分は残さない** | 2つの形の違う部分だけを見せる |

「重なっているところだけ」ならIntersection、「どちらかにあるところ全部」ならUnion、「基準の形から削る」ならSubtract、「重なるところを除く」ならXorです。

### Style Mode / Color：出力図形の色

21.1 Manualで確認できるStyle Modeの選択肢は**Replace**です。入力した個々のShapeの色・Alphaをそのまま引き継ぐのではなく、sBooleanの**Styleタブ**で出力図形全体の色・Alphaを指定します。

色はカラースウォッチやスポイトで選べるほか、RGBAのスライダー・数値欄から調整できます。たとえば、赤い円と青い円を入力しても、演算後の色はsBoolean側で指定した色になります。

### Allow Combining：複製後に重なる部分のAlpha

これは**Boolean演算の種類を切り替える設定ではありません**。sBooleanの結果を後段で複製し、コピー同士が重なったときのAlphaの扱いを決めます。

- **オン**：重なっても指定したAlpha値を維持します。
- **オフ**：重なった場所ではAlphaが積み重なり、濃くなることがあります。

21.1 Manualの例では、Alphaを0.5にした楕円を複製して重ね、オンなら0.5を維持し、オフなら重なりに応じて値が累積することを説明しています。sBooleanを通した場合、**入力側の個々のShapeに設定したAllow Combiningより、sBoolean側の設定が優先**されます。

## 主な用途

- **ロゴの抜き形**：丸や四角の内側に穴を開け、リングや切り欠きのあるマークを作る。
- **交差した部分の装飾**：円と星などが重なる部分だけを取り出し、別の図形として使う。
- **一体化したシルエット**：複数の図形をUnionでつなぎ、1つの形として扱う。
- **重なりを除くパターン**：Xorで図形同士の共通部分を消し、抜けのある模様を作る。

## 運用例：中央をくり抜いたリング

1. `sEllipse`を2つ作り、一方を大きく、もう一方を小さくします。中心を揃えます。
2. 大きな円をsBooleanの**Input1**、小さな円を**Input2**へ接続します。
3. Inspectorの**OperationをSubtract**にします。大きな円のうち、小さな円と重なる中央部分が取り除かれます。
4. `sRender`につなぎ、輪の形で表示されることを確認します。
5. 出力の色・透明度を変えたい場合は、sBooleanの**Styleタブ**で調整します。

```text
sEllipse（外側）─ Input1 ┐
                       ├─ sBoolean〔Subtract〕→ sRender → Viewer
sEllipse（内側）─ Input2 ┘
```

**比較する場合**は、小さな円を外側の円から少しずらしたうえで、OperationをIntersection / Union / Subtract / Xorへ切り替えます。中央に完全に収まった円だけでは、SubtractとXorが似た形に見えるためです。

このリングはManualで説明されている演算から組み立てた制作例であり、21.1実機で完成形を確認した記録ではありません。

## 挙動と注意点

- **Subtractで穴が開かない**：外側の図形がInput1、くり抜く図形がInput2になっているか、両者が実際に重なっているかを確認します。
- **色が入力と違う**：sBooleanは入力ごとの色ではなく、Styleタブの色・Alphaで出力を置き換えます。
- **複製すると重なりが濃くなる**：Boolean演算の問題と混同せず、Allow Combiningの設定を確認します。
- **Viewerで通常の画像として見えない**：出力はShapeです。[sRender](./s-render)を通して表示します。
- **sMergeとの違い**：[sMerge](./smerge)は図形を重ねてまとめるNodeです。sBooleanのUnionは見た目が似る場合がありますが、重なりを演算して**新しい領域を作る**点が異なります。

## 関連する考え方・構成

- [シェイプ（Shape）](../../learn/02-data/shape) — ピクセル画像になる前の図形データ。
- [特殊なデータ領域のまま処理する](../../patterns/data-domain/defer-domain-conversion) — 図形をShapeのまま加工し、最後に画像化する考え方。
- [sMerge](./smerge) — 形を演算せず、複数の図形を重ねてまとめる。
- [sGrid](./sgrid) / [sDuplicate](./sduplicate) — 出力したShapeを並べたり複製したりする。
- [sRender](./s-render) — Shapeを2D Imageへ変換する。

## バージョンと検証状況

**確認済み：** DaVinci Resolve **21.1 Reference Manual**（September 2026）、Chapter 117「Shape Nodes」、**pp.2729–2732**。Input1 / Input2、4種類のOperation、Style ModeのReplace、StyleタブのColor / RGBA / Allow Combining、およびsRenderへの接続を照合しました。

**未確認：** Resolve 21.1実機での端子表示・描画結果、上記以外の設定、Free / Studioの差、内部REGID。制作例はManualの挙動から組み立てた確認案のため、`verification: partial`を維持します。
