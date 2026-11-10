---
title: "sOffset"
description: "KrokodoveのShapeツール。輪郭を外側・内側へずらし、Numberで処理を反復する。"
doc_type: node
term_id: "soffset"
term_short: "Shapeの輪郭を膨張・収縮させ、反復処理もできるKrokodoveツール。"
verification: partial
aliases: ["sOffset"]
concepts: ["shape-data"]
nodes: ["sOffset"]
node_family: "krokodove"
inputs: ["shape"]
outputs: ["shape"]
controls: ["Number"]
tasks: ["build-shape"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-11"
---

# sOffset

sOffsetは、入力した<Term id="shape-data">Shape</Term>の**輪郭を外側へ広げたり、内側へ縮めたりする**Krokodoveのツールです。図形を画面内で平行移動させる「位置のOffset」ではありません。輪郭そのものを加工します。

Shapeは、画像のピクセルに変換する前の図形データです。まず[Shapeの基本](../../learn/02-data/shape)を読むと、通常の画像やMaskとの違いが分かります。sOffsetは画像の輪郭検出や映像のワープを直接行うためのノードではありません。

## 入力と出力

- **入力：Shape**。例えば[sEllipse](./s-ellipse)で作った円、[sRectangle](./srectangle)で作った四角形など、輪郭を持つ図形を渡します。
- **出力：加工後のShape**。別のShape系ノードで加工を続けられます。通常の2D Imageとして合成するときは[sRender](./s-render)で画像化します。

データ領域は21.1 Manualの「Shape Tools」分類に基づきます。下の実機例ではsEllipseの出力をsOffsetのInputに接続し、その出力をsRenderへ渡しました。その他の端子や接続条件は未確認です。

```text
sEllipse → sOffset → sRender → Merge → MediaOut
  Shape     Shape      Image    Image
```

元の円をsOffsetに渡して輪郭を変え、sRenderで画像にしてから映像へ重ねる流れです。MergeにShapeを直接入れる構成ではありません。

## 確認できる設定と、未確認の設定

DaVinci Resolve 21.1 Reference Manualは、sOffsetについて次の二点を説明しています。

1. 入力Shapeの輪郭を**拡張または収縮**できる。
2. **Number**というスライダーを使い、その処理を**繰り返す**ための追加設定がある。

Numberは複製の配置数を指定する[sGrid](./sgrid)のような機能だと読み替えないでください。Manualに書かれているのは「Offset効果の反復」であり、**Numberの値と最終的な輪郭数が1対1になるか、各段階の輪郭が同時に残るかは未確認**です。

実機例のInspectorではNumberとOffsetを確認し、Offset 0.05でNumber 1と2を比較しました。数値の単位、正負の対応、初期値、範囲や他の項目の動作は未確認です。

<!-- capture:S290 -->

## 実機例：Numberを変えて円を広げる

`sEllipse` のShapeを `sOffset` に接続し、元のShapeと処理後のShapeをそれぞれ `sRender` で画像化します。Offsetを0.05に固定し、Numberを1と2に変えて同じフレームで比較しました。

この円では、Number 2の出力はNumber 1より大きく表示されました。左は元の円、右は処理後です。市松模様はViewerの透明表示です。撮影後はNumber 1へ戻して保存しました。[接続と設定の記録](/img/fusion/captures/S290/readback.json)に条件を記載しています。

[![sEllipseをsOffsetへ接続し前後をsRenderで画像化する構成](/img/fusion/captures/S290/graph.png)](/img/fusion/captures/S290/graph.png)

元ShapeとsOffset後のShapeを別々に画像化します。

[![sOffsetのNumber 1とOffset 0.05の設定](/img/fusion/captures/S290/controls.png)](/img/fusion/captures/S290/controls.png)

Number 1、Offset 0.05で比較します。

[![元の円とNumber 1で広げた円の比較](/img/fusion/captures/S290/number-one.png)](/img/fusion/captures/S290/number-one.png)

右はNumber 1の出力です。

[![元の円とNumber 2で広げた円の比較](/img/fusion/captures/S290/number-two.png)](/img/fusion/captures/S290/number-two.png)

右はNumber 2の出力です。

[再現用Graph](/img/fusion/captures/S290/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S290/capture.json)

<!-- /capture:S290 -->

## 実際の制作での使い方

以下は機能説明から組み立てた構成例です。上の実機例とは異なる構成や設定は未検証です。

### 図形の周囲に余白を作る

```text
sRectangle → sOffset → sRender ─┐
                                ├→ Merge → MediaOut
Text+ ──────────────────────────┘
```

sRectangleでテロップの背景となる四角形を作り、その輪郭をsOffsetで外側へ広げてから画像化します。文字はText+で別に作って重ねます。背景の外形だけを加工したい場合に、四角形全体を拡大する操作とは別の選択肢になります。

sOffsetは**文字の寸法を測って背景を自動追従させるツールではありません**。背景の位置と大きさは別に調整します。初めに元のsRectangleを見て、次にsOffset出力を確認すると、広がった範囲を判断できます。

### 元の図形と加工後の差から外周を作る

```text
                 ┌→ sOffset（外側へ拡張）→ sBoolean Input1 ┐
sEllipse ────────┤                                       ├→ sBoolean（Subtract）→ sRender
                 └────────────────→ sBoolean Input2 ─────┘
```

同じ円のShape出力を二つに分け、一方だけsOffsetで外側へ広げます。[sBoolean](./sboolean)の**Subtract**ではInput1に残したい領域、Input2に差し引きたい領域を接続します。拡張した円から元の円を引くことで、外周だけが残る形を作る考え方です。

これはsOffsetの輪郭変更とsBooleanの領域演算を組み合わせた提案です。Krokodove特有の反復結果やStyleの引き継ぎは未検証なので、まずNumberの反復を抑えた状態でViewerの中間結果を確認してください。線の外観を直接指定したい場合は[sOutline](./soutline)も比較対象になります。

### 多角形の輪郭を調整してから角を加工する

```text
sStar → sOffset → sRound → sRender
```

[sStar](./sstar)で角のある図形を作り、sOffsetで外形を変えたあと、[sRound](../krokodove/sround)で角を曲線へ変更する構成です。逆にsRoundを先に置けば、丸めた輪郭に対してOffsetをかける順序になります。**どちらが同じ形になるとは限らない**ので、元Shapeと両方の接続順序を見比べて選びます。

sRoundは「辺を保ちながら角を丸める」、[sSmooth](../krokodove/ssmooth)は「角を保ちながら辺を滑らかにする」とManualに記載されています。Offsetで輪郭全体を変える作業とは役割が異なります。

## sExpandや同名のOffsetとの違い

| ツール | 対象と目的 | 21.1資料で確認できる点 |
| --- | --- | --- |
| **sOffset** | KrokodoveのShape。輪郭の拡張・収縮 | **Number**による効果の反復 |
| [sExpand](./sexpand) | 標準Shape。領域の膨張・収縮 | **Amount、Border Style、Miter Limit**を使った調整 |
| [sTransform](./stransform) | Shapeの位置・大きさ・回転の変換 | 輪郭を膨張させる処理ではない |
| [Offset（Krokodove）](../krokodove/offset-krokodove) | **2D Image**の横・縦方向のワープ | Image Warp Toolsに属する別ツール |

輪郭の太らせ方だけでなく**角の接合形状まで設定したい**なら、Inspectorの設定がManualで詳しく説明されているsExpandから試せます。sOffsetは、特に**Numberによる反復**を試したい場合に比較する候補です。二つのノードで同じ形・同じ数値結果が得られるという保証はありません。

名前が似ていても、Krokodoveの「Offset」は画像を水平方向・垂直方向へ歪ませるツールであり、**sOffset（Shape Tools）とは別項目**です。[Krokodoveのカテゴリ案内](../krokodove/)から扱うデータ別に探してください。

## 確認上の注意

- 結果が見えない場合は、まずShapeからsRenderまで正しく接続したかを確認します。通常のImage処理へ進む前に画像化が必要です。
- Numberを増やしたときに元の輪郭が残るか、反復で輪郭がどう変化するかは、入力を単純な円にして結果を比較します。Manualの短い説明だけで最終形を断定しません。
- 同じ見た目を作るなら、sExpandやsOutlineも選択肢です。後段で輪郭のStyleや重なり方を扱う場合は、各ノードの出力を個別に確認します。
- このページでは、現在のEffects Library上の表示位置、REGID、Edition差、全Inspector項目、既定値、数値範囲を確認できていません。

## バージョン・出典

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、**Chapter 105「Krokodove Nodes」、p.2437**の「Shape Tools > sOffset」を参照しました。同ページで確認できる事実は、Shape輪郭の拡張・収縮とNumberによる反復です。また、p.2436の「Image Warp Tools > Offset」は別項目です。

入出力のデータ領域はShape Toolsとしての分類と[Shapeの基本](../../learn/02-data/shape)を踏まえて説明しています。実機例は単一の円と固定設定で確認しました。その他の端子・Controlの動作やEdition差は未確認のため、`verification: partial`のままにしています。
