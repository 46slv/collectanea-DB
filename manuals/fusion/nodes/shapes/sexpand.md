---
title: "sExpand"
description: "Shapeの輪郭を外側へ広げたり内側へ縮めたりし、図形の大きさと角のつながり方を調整するNode。"
doc_type: node
term_id: "sexpand"
term_short: "Shapeの領域を膨張・収縮し、輪郭の大きさと角の形を調整するNode。"
verification: partial
aliases: ["sExpand"]
concepts: ["shape-data"]
nodes: ["sExpand"]
node_family: "shapes"
inputs: ["shape"]
outputs: ["shape"]
controls: ["Amount", "Border Style", "Miter Limit"]
tasks: ["build-shape", "procedural-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-22"
---

# sExpand

sExpandは、入力した図形の**外側に領域を足して大きくしたり、内側から領域を削って小さくしたりする**Nodeです。たとえば、星形のロゴを少し太くする、複数の図形を組み合わせた後で全体の輪郭を調整するといった場面に使います。

ここで扱う<Term id="shape-data">Shape</Term>は、まだ通常のピクセル画像になっていない図形データです。sExpandはこのShapeを加工してShapeとして返すため、後段でさらに図形を編集できます。映像へ合成するには、最後に[sRender](./s-render)で2D Imageへ変換します。

## 役割

sExpandの「拡張（dilate）」と「収縮（erode）」は、**図形が占める範囲そのもの**を変える処理です。

- 拡張すると、元の輪郭より外側まで図形が広がります。細い部分は太く、狭い隙間は小さく見える方向へ変わります。
- 収縮すると、輪郭が内側へ移動します。細い部分は細くなり、小さな部分は見えにくくなることがあります。

線の太さだけを追加する処理ではありません。図形の境界を変える点が、輪郭線を作る[sOutline](./soutline)との大きな違いです。

## 入力

### Input1（オレンジ・必須）

別のShape Nodeが出力したShapeを接続します。[sEllipse](./s-ellipse)の円のような単一Shapeも、[sMerge](./smerge)や[sBoolean](./sboolean)で複数の図形をまとめたShapeも受け取れます。

DaVinci Resolve 21.1 Reference Manualでは、外部入力はこの1つとして記載されています。通常の2D Imageを直接受け取る入力ではありません。

## 出力

拡張または収縮した**Shapeデータ**を出力します。後段のShape Nodeへ渡すか、sRenderで画像化します。

```text
sEllipse → sExpand → sRender → 2D Image
```

sExpand単体を通常の画像として見ようとしても、表示できるImageがまだありません。結果を見ながら調整するときは、sRenderをViewerで確認します。

## 主な設定項目

21.1 ManualのInspector「Controls」タブで確認できる設定です。

| 項目 | 何が変わるか | 確認するときの目安 |
| --- | --- | --- |
| **Amount** | 図形の輪郭を外側または内側へ動かす量 | 正の値と負の値を切り替え、元の形と比較する |
| **Border Style** | 輪郭が角でつながる形 | 尖った星や多角形を使い、角の見た目を比較する |
| **Miter Limit** | 尖った角をどこまで保持するかのしきい値 | Miter系の設定で、鋭い角の処理を比較する |

### Amount：広げるか、縮めるか

- **正の値**：図形を外側へ広げる（dilate）。
- **負の値**：図形を内側へ縮める（erode）。

まずAmountを0にして元の輪郭を確認し、少しずつ正負へ動かすと変化が分かりやすくなります。ここではManualに記載のない数値範囲や初期値、単位は断定しません。

### Border Style：角をどうつなぐか

拡張・収縮した輪郭の角の形を指定します。選択肢は次の4つです。

| 設定 | 角の見た目 |
| --- | --- |
| **Bevel** | 尖った角の先端を斜めに切り落とす |
| **Round** | 角を丸くつなぐ |
| **Miter** | 尖った角を保持する方向の処理 |
| **Miter Clip** | Miterと同じく鋭い角を扱う、別の接続方法 |

MiterとMiter Clipの細かな見た目は、角度の鋭いShapeで切り替えて確認してください。Manualでは両者が鋭い角を一定の条件まで保つことは説明されていますが、数値ごとの最終形状まではここで確認できていません。

### Miter Limit：尖りすぎる角を制限する

**Border StyleがMiterまたはMiter Clipのときだけ表示される**設定です。角を形成する辺が鋭く交わる場合、尖った部分をどこまで維持するかを調整します。しきい値の判断にはShapeの厚みに対する比率が関係します。

BevelやRoundを選んでいるときにMiter Limitが表示されなくても異常ではありません。

## 主な用途

- 星や多角形のロゴを、輪郭の形を見ながら少し太く・細くする。
- 複数の図形を結合した後、全体を一括して広げたり縮めたりする。
- 角の丸め方や切り落とし方を変え、ロゴや装飾図形の印象を調整する。
- 規則的に並べる前の図形の太さを統一して、反復パターンの見え方を整える。

## 最小構成：円の大きさを変える

```text
sEllipse → sExpand〔Amount〕→ sRender
```

1. sEllipseで円を作成し、sExpandのInput1へ接続します。
2. sExpandの出力をsRenderへつなぎ、sRenderをViewerで表示します。
3. Amountを0にして元の円を確認します。
4. Amountを正の方向へ動かし、円の外周が広がる様子を見ます。
5. 負の方向へ動かし、円が小さくなる様子を比較します。

円には鋭い角がないため、Border Styleの違いは分かりにくい例です。角の比較には次の星形の構成を使います。

## 運用例：組み合わせたロゴの輪郭を一度に調整する

星と円を重ねた図形を作り、合成後の形をまとめて調整する例です。

```text
sStar ─────┐
           ├─ sBoolean〔Union〕→ sExpand → sRender
sEllipse ──┘
```

1. [sStar](./sstar)で星形、sEllipseで円を作ります。
2. それぞれをsBooleanへつなぎ、重なった図形を**Union（結合）**で1つの形として扱う設定にします。
3. sBooleanの出力をsExpandへ接続し、sRenderで結果を確認します。
4. Amountを正の方向へ調整し、外周や星の細い部分がどう広がるか確認します。
5. Border StyleをBevel、Round、Miter、Miter Clipへ切り替え、星の先端を見比べます。
6. Miter系を選んだ場合はMiter Limitも変え、角がどのように処理されるか確認します。

図形ごとの位置・比率・重なり方はsBooleanより前で調整し、**結合後の輪郭**をsExpandに任せる構成です。これはManualで確認できるNodeの挙動から組み立てた制作手順で、21.1実機の結果画像は未検証です。

## 挙動と注意点

- **sOutlineとの違い**：[sOutline](./soutline)は図形に輪郭線を作るためのNodeです。sExpandは図形が占める領域の大きさを変えるため、同じ結果にはなりません。
- **sBooleanとの違い**：[sBoolean](./sboolean)は2つのShapeの重なりを結合・切り抜きなどの方法で処理します。sExpandは、その結果の輪郭をさらに広げたり縮めたりします。
- **sGridとの順序**：[sGrid](./sgrid)へ渡す前にsExpandを置くと、複製元の図形の輪郭をそろえてから並べられます。
- **強い収縮**：細い部分や小さな図形は、縮める量によって形が大きく変わる場合があります。必要な輪郭が残る範囲でAmountを調整します。

## うまくいかないとき

- **Viewerで図形が見えない**：sExpandの出力はShapeです。sRenderの出力を表示しているか確認します。
- **Miter Limitが見当たらない**：Border StyleがMiterまたはMiter Clipになっているか確認します。
- **角の設定を変えても違いが分からない**：円ではなく星や多角形を使い、角を拡大して比較します。
- **形が痩せすぎる**：Amountの負の値を弱めます。元の図形の細さも前段で確認します。
- **輪郭線だけ太くしたい**：形全体を広げるsExpandではなく、sOutlineのThicknessを検討します。

## 関連する考え方・Node

- [Shapeとは何か](../../learn/02-data/shape)：Shapeと通常のImageの違い。
- [データ領域を辿る](../../learn/07-debugging/trace-data-domain)：Node間で接続できるデータの種類を確認する。
- [sOutline](./soutline)：輪郭線を作り、太さや線端を調整する。
- [sBoolean](./sboolean)：2つのShapeを結合・切り抜きする。
- [sRender](./s-render)：Shapeを2D Imageへ変換する。

## バージョンと検証状況

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、**pp.2741–2742**。Input1（オレンジ・必須）、Shape出力とsRenderへの接続、Amountの正負、Border Styleの4種類、Miter Limitの表示条件を確認しました。

**未確認：** Resolve 21.1実機での描画結果、各設定の初期値と厳密な数値範囲、内部REGID、Free / Studioでの差。上の制作例はManual記載の挙動に基づく確認手順であり、実機での検証済み結果としては扱いません。このため`verification: partial`を維持します。
