---
title: sWriteOn
description: Shapeの輪郭を現したり隠したりして、線が描かれるように見せるKrokodoveツール。
doc_type: node
term_id: swriteon
term_short: Shapeの輪郭線を現す・隠すためのKrokodoveツール。
verification: partial
aliases: [sWriteOn, sWrite On]
concepts: [shape-data]
nodes: [sWriteOn]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape, animate-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# sWriteOn

**sWriteOn**は、入力した図形の**輪郭線を現したり、隠したりする**Krokodoveのツールです。輪郭の全体を最初から表示する代わりに、線が描かれていくような見せ方を作りたいときの候補になります。

ここでいう<Term id="shape-data">Shape</Term>は、画像のピクセルではなく、図形の輪郭などを保持したデータです。たとえば円のShapeには円周の形があり、sWriteOnはその**境界の線をどう見せるか**を扱います。画面全体に手書き風の筆跡を自動生成するツールや、文字列を一文字ずつ表示するツールとは役割が異なります。

## 何を変えるのか

円や四角の輪郭を常にすべて見せる場合、線は最初から完成した状態で表示されます。sWriteOnは、同じ輪郭を**見せる／隠す**処理を担当します。Blackmagic Designの21.1 Manualは、このツールを「Shapeの輪郭を描画し、その境界を現す、または隠す」と説明しています。

重要なのは、**元になる輪郭の形を作る作業と、輪郭の見せ方を変える作業を分けられる**ことです。たとえば、円の形を調整したいときは前段の[sEllipse](../shapes/s-ellipse)を編集し、輪郭を見せる演出はsWriteOn側で検討できます。

ただし、どの位置から描き始めるか、輪郭がどの方向に進むか、複数の輪郭をどう処理するかは、Manualの短い説明だけでは確定できません。筆順やパスの走査順まで指定できるとは断定しません。

<!-- capture:S278 -->

## 実機例：円の輪郭の一部を表示する

`sEllipse` を分岐し、一方を `sWriteOn` に接続してRange Endを0.5に設定しました。後段の `sOutline` で線幅0.02を与えてから `sRender` で画像化すると、円の一部が線として見えます。線幅はsOutlineの設定です。Viewerの市松模様は透明部分の表示です。アニメーションやAlpha値は未検証です。[接続と設定の記録](/img/fusion/captures/S278/readback.json)に条件を記載しています。

[![sWriteOnとsOutlineをつなぐノード構成](/img/fusion/captures/S278/graph.png)](/img/fusion/captures/S278/graph.png)

円を分岐しsWriteOnとsOutlineを通して画像化します。

[![sWriteOnのInspector](/img/fusion/captures/S278/controls.png)](/img/fusion/captures/S278/controls.png)

Range Endは0.5です。

[![処理前の白い円](/img/fusion/captures/S278/low.png)](/img/fusion/captures/S278/low.png)

処理前の円を表示しています。

[![円の一部の線を表示した結果](/img/fusion/captures/S278/high.png)](/img/fusion/captures/S278/high.png)

sOutlineを通した出力には円の一部が線として見えます。

[再現用Graph](/img/fusion/captures/S278/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S278/capture.json)

<!-- /capture:S278 -->

## 入力と出力

| 段階 | 扱うもの | 読み方 |
| --- | --- | --- |
| 入力 | Shape | 先に作成した図形の輪郭を処理対象にする。 |
| 処理 | 輪郭の表示 | 境界の線を現す・隠す。図形自体の作成や通常の画像合成とは別の役割。 |
| 出力 | Shape | 後段でShapeとして加工し、必要に応じて[sRender](../shapes/s-render)で画像にする。 |

入出力の**Shape分類は既存のCOLLECTANEAカタログに基づくもの**です。21.1 Manualの当該項目には、正式な端子名・端子数・必須／任意の別は記載されていません。特定の端子名や複数入力をここでは固定しません。

Shapeは通常の2D Imageとは異なるため、Mergeで背景と合成する前にsRenderで画像化します。データの違いは[シェイプ（Shape）の基礎](../../learn/02-data/shape)を参照してください。

## 最小構成と確認手順

次は**各ツールの役割から組み立てた実機確認用の構成案**です。Krokodoveの21.1環境で接続・アニメーションを検証済みのレシピではありません。

```text
sEllipse → sWriteOn → sOutline → sRender → Merge
  円の形     輪郭の表示     線幅      画像化     背景と合成
```

1. [sEllipse](../shapes/s-ellipse)で円を作り、**Solidを無効**にしてBorder Widthを設定します。塗りつぶしではなく、輪郭が見える状態にします。これらは標準sEllipseの21.1 Manualに記載された設定です。
2. sEllipseをsRenderにつないで、最初に**完成した円の輪郭が正常に表示されること**をViewerで確認します。
3. sEllipseとsRenderの間にsWriteOnとsOutlineを置きます。今回の例ではsOutlineを通さない開いた塗り形状は表示されず、sOutlineのThickness 0.02で線を表示しました。
4. Inspectorで輪郭の表示を変える項目を確認し、ひとつの値だけを動かします。今回の実機例はRange End 0.5です。値域や他の設定での結果は未確認です。
5. 表示の変化を確認できた場合に、その項目がキーフレーム対応かを調べ、開始フレームと終了フレームで結果を比較します。表示が変わらない場合は、まず輪郭線があるか、sRenderで画像化できているかを切り分けます。

**sWriteOnの設定項目を探す前に、sEllipse → sRenderだけで結果が見えるかを確認する**と、Shapeの生成・輪郭の表示・画像化のどこに問題があるか分けやすくなります。

## 主な用途

### タイトルの周囲を囲む線

文字の周囲に円や枠線を配置し、その**輪郭が現れてから文字を見せる**演出を検討できます。タイトルそのものをsWriteOnに入力するのではなく、文字の外側に置く装飾用のShapeを入力する構成です。輪郭と文字の表示タイミングは別に管理します。

### ロゴの外周を見せる

ロゴの外周をShapeとして用意できれば、完成した外周を最初から表示せず、線を現す演出に利用する候補になります。ただし、複数の閉じた輪郭、内側の穴、交差部分をどの順に処理するかは未確認です。複雑なロゴを使う前に、単純な一筆の線や円で挙動を確認します。

### 図形を隠して別のカットへつなぐ

輪郭を現すだけでなく、**隠す**側の役割もManualに明記されています。輪郭を減らして次の画面へつなぐ表現を考える場合にも候補になります。ただし、消える方向、消え方の補間、複数輪郭への順序指定は確認が必要です。

## 似たノードとの使い分け

| ノード | 主な役割 | 最初に選ぶ目安 |
| --- | --- | --- |
| **sWriteOn** | Shapeの輪郭を現す・隠す | 図形の境界線の表示を変えたい |
| [sEllipse](../shapes/s-ellipse)のLength | 円・楕円の輪郭の表示範囲を調整する標準設定 | 円弧を描く演出なら、まず標準sEllipseだけで足りるか確認する |
| [sRestyle](./srestyle) | Shapeの塗り・輪郭線の見た目を変更する | 線や塗りのスタイルを変えたい |
| [sKill](./skill) | 条件に該当するShapeの線分を取り除く | 条件に基づいて線分を除去したい |
| [Write](./write) | **文字用Modifier**。入力中のような文字表示、カーソルや固定Prefixを扱う | 文字列をタイプ表示したい |

特に**sWriteOnとWriteは別物**です。21.1 Manualでは前者を「Shape Tools」、後者を「Text Modifiers」に分類しています。Writeにはカーソル／キャレットや、書き込み効果の対象外として表示し続けるPrefixが説明されていますが、それをsWriteOnの設定と混同しないでください。

また、標準sEllipseのLengthでも円の輪郭を描いていく表現を作れます。**円だけを扱う場合は、Krokodoveを増やす前にsEllipse単体の方法を検討する**方が構成が簡単になることがあります。

## 注意点と検証範囲

- **輪郭と塗り**：Manualが明記するのは輪郭の表示です。塗りつぶされた内部やAlpha全体にどう作用するかは未確認です。
- **進行方向・始点・終点**：実機例ではRange Endを0.5に設定しました。値域、初期値、キーフレーム対応、複数輪郭での走査順は未確認です。
- **線の見た目**：線幅や色そのものを変えたい場合は、前段のShape設定やsRestyleを確認します。sWriteOnがその設定を持つとは断定しません。
- **環境差**：内部REGID、Resolve Free／Studio／Fusion Studioの提供差、別条件での接続結果は未確認です。

## バージョンと出典

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2437「Shape Tools — sWriteOn」。ここで確認できるのは**輪郭を現す・隠すという役割**です。正式なポート仕様やInspector項目はこの説明から読み取れません。

Shapeを2D Imageへ変換するsRender、およびsEllipseのSolid・Border Width・Lengthは、同ManualのChapter 117「Shape Nodes」の記述と各ノード記事を参照しています。演出例は未検証の構成案です。実機例は静止画の一条件です。部分的な根拠のみのため`verification: partial`を維持します。
