---
title: "sOutline"
description: "複数のShapeの輪郭線をまとめて整え、太さ・角・線端・描画範囲を設定するNode。"
doc_type: node
term_id: "soutline"
term_short: "Shapeの輪郭線を作り、太さや角の形、描く範囲をまとめて調整するNode。"
verification: partial
aliases: ["sOutline"]
concepts: ["shape-data"]
nodes: ["sOutline"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["Thickness", "Border Style", "Cap Style", "Position", "Length"]
tasks: ["build-shape", "procedural-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-22"
---

# sOutline

sOutlineは、入力した<Term id="shape-data">Shape</Term>の**輪郭を線として描き、その線の太さや形をそろえる**Nodeです。たとえば円と星を重ねた図形に対し、線幅をまとめて変えたり、輪郭の一部だけを表示して描き進むアニメーションを作ったりできます。

Shapeは、まだピクセル画像になっていない図形データです。sOutlineの出力もShapeなので、後段でさらに加工できます。普通の2D Imageとして表示・合成するには、[sRender](./s-render)で画像化します。

## 何をするNodeか

[sMerge](./smerge)や[sBoolean](./sboolean)で複数の図形をまとめた**複合Shape**に使うと便利です。個々の図形の色・サイズ・位置などを保ちながら、**輪郭の太さ、角と線端の形、描く区間**をsOutlineで統一できます。

円や星の位置を並べ直すNodeではありません。元の図形は前段で編集し、輪郭線の仕上げをsOutlineに分担させます。単一Shapeにも使え、Manualでは輪郭を重ねる使い方にも触れています。

## 入力と出力

- **Input1（オレンジ・必須）**：1つのShape入力。単独のShape、またはsMerge / sBooleanからの複合Shapeを受け取ります。
- **出力：Shape**：輪郭の設定が適用されたShapeデータ。別のShape NodeかsRenderへ接続します。通常のImage出力ではありません。

```text
sEllipse ─┐
          ├─ sMerge → sOutline → sRender → 2D Image
sStar ────┘
```

## 主なInspector項目

21.1 ManualのControlsタブで確認できる項目です。

| 項目 | 変化するもの | 使いどころ |
| --- | --- | --- |
| **Thickness** | 輪郭線の幅 | 細いアクセント線／太いロゴの線 |
| **Border Style** | 角のつながり方 | 尖った角や丸い角の描き分け |
| **Cap Style** | 開いた線の端の形 | 線が現れるアニメーションの先端 |
| **Position** | 輪郭上で線が始まる位置 | Lengthでできた切れ目の移動 |
| **Length** | 線を描く長さ | 輪郭の部分表示・Write-on演出 |

### Border Style：角をどうつなぐか

- **Bevel**：角の先端を斜めに切り落としたような形。
- **Round**：角を丸めた形。
- **Miter**：辺の延長が交わる尖った角を保つ形。

星形や多角形を使うと違いが分かりやすくなります。

### Cap Style：線端の形

- **Flat**：終端で平らに切る。
- **Rounded**：終端を半円状に丸くする。
- **Squared**：終端を線幅の半分だけ延長し、四角く切る。

Cap Styleが見えるのは、**Lengthを1.0未満にして線を開いたとき**です。Lengthが1.0の閉じた輪郭では端が現れません。

### Position / Length：輪郭の一部を表示する

**Length = 1.0**で輪郭は閉じ、**1.0未満**では輪郭の一部に切れ目ができます。Positionは輪郭の始点を動かし、Lengthと併用すると切れ目の位置が変わります。

ここでの**Positionは、図形を画面内で移動するX/Y位置ではありません**。輪郭上のどこから線を描くかを決める設定です。

Lengthにキーフレームを付けると、線が徐々に描かれるWrite-on風の演出を作れます。

## 制作例1：複数の図形の輪郭をそろえる

1. [sEllipse](./s-ellipse)で円、[sStar](./sstar)で星のShapeを作ります。
2. 両方を[sMerge](./smerge)へつなぎ、出力をsOutlineのInput1へ接続します。
3. Thicknessで輪郭全体の太さを調整します。
4. 星の角を見ながらBorder Styleを切り替えます。
5. [sRender](./s-render)で画像化し、結果を確認します。

```text
sEllipse ─┐
          ├─ sMerge → sOutline〔Thickness / Border Style〕→ sRender
sStar ────┘
```

図形ごとの配置や色は前段に残し、線幅をそろえる処理だけを後段に集めます。この手順はManual記載の挙動から組み立てた確認例で、実機の完成画像は未検証です。

## 制作例2：ロゴの輪郭を描き進める

1. ロゴを構成するShapeをsMergeまたはsBooleanでまとめ、sOutlineへつなぎます。
2. sRenderで結果を表示したまま、Lengthを**1.0未満**にして切れ目を確認します。
3. Lengthが小さい状態から**1.0**へ変化するキーフレームを設定します。
4. 描き始める場所はPositionで、線端の形はCap Styleで調整します。
5. 複数の閉じた輪郭がある場合は、どの部分に切れ目が現れるかViewerで確認します。

## 関連Nodeとの違い

- [sExpand](./sexpand)：図形の境界そのものを外へ広げたり内へ縮めたりする。sOutlineは輪郭線の仕上げを担当します。
- [sMerge](./smerge)：複数のShapeを重ねてまとめる。輪郭線の設定はその後にsOutlineで統一できます。
- [sBoolean](./sboolean)：Shapeの重なりを計算して切り抜き・結合する。計算した図形に輪郭線を付けるならsOutlineを後段へ置きます。
- [sRender](./s-render)：Shapeから2D Imageへ変換し、通常の画像処理へ渡します。

## うまくいかないとき

- **通常の画像として見えない**：sOutlineはShape出力です。後段にsRenderがあるか確認します。
- **Cap Styleを変えても違いがない**：Lengthが1.0では線端が閉じています。1.0未満で比べます。
- **Positionで図形が動かない**：Positionは画面内の位置ではなく輪郭上の開始位置です。Lengthを下げて比較します。
- **複数図形の線幅が同時に変わる**：複合Shape全体へ共通の設定を適用する仕様です。個別調整したい部分は結合前に分けて処理します。

## バージョンと検証状況

**確認した一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、**pp.2750–2752**。sOutlineの入力、Shape出力、Thickness、Border Style（Bevel / Round / Miter）、Cap Style（Flat / Rounded / Squared）、Position、Length、sRender接続を照合しました。

**未確認：** Resolve 21.1実機の描画結果、各パラメータの初期値・数値範囲、内部REGID、Free / Studioでの差。制作例はManualの挙動から構成したため、`verification: partial`を維持します。
