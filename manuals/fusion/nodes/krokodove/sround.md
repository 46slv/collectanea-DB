---
title: sRound
description: KrokodoveのsRoundでShapeの角を丸める仕組み、接続例、sSmoothとの違いを説明する。
doc_type: node
term_id: sround
term_short: 図形の辺を保ちながら、角に曲線を作って丸めるKrokodoveのShapeツール。
verification: partial
aliases: [sRound]
concepts: [shape-data]
nodes: [sRound]
node_family: krokodove
inputs: [shape]
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# sRound

**sRound**は、図形の**角を曲線に変え、辺の形はできるだけ保つ**ためのKrokodoveのShapeツールです。四角形の角を丸めたアイコンや、角の鋭さを抑えたタイトル背景を作りたい場合に検討できます。

DaVinci Resolve 21.1 Reference Manualは、sRoundについて「曲線状の角を作り、辺を保持する」と説明しています。曲線の半径や点の配置方法までは説明していないため、「すべての角を指定した半径で正確に丸められる」とは断定できません。

ここで扱う<Term id="shape-data">Shape</Term>は、円や四角などをピクセル画像に変える前の図形データです。図形の輪郭をShapeのまま変更し、最後に[sRender](../shapes/s-render)で通常の2D画像へ変換します。Shapeそのものに慣れていない場合は、先に[シェイプ（Shape）](../../learn/02-data/shape)を参照してください。

## 何が変わるのか

四角形を例に考えると、輪郭には4本の辺と4つの角があります。**角**は辺と辺が出会い、進行方向が急に変わる部分です。sRoundはその角に曲線を作る方向の処理で、図形全体をぼかすエフェクトではありません。

- **元の図形**：辺が角で直接つながる。四角形なら角が直角に折れる。
- **sRoundを通した図形**：角の部分に曲線が生まれる。角と角の間にある辺は、基本的に保つことを意図した処理。
- **画像化する段階**：sRenderを通してから、通常のMergeやGlowなどへ渡す。

「辺を保つ」は**Manualで説明された設計上の特徴**です。実際の辺の長さ、接線のつながり、頂点数、輪郭の外接範囲まで不変という保証ではありません。角の丸みが大きい場合や、辺が極端に短い図形でどうなるかは実機で確認する必要があります。

## 入力と出力

| 段階 | データ | 役割 |
| --- | --- | --- |
| 入力 | Shape | 四角形、多角形など、角を持つ図形の輪郭を受け取る。 |
| 処理 | 角の形の変更 | 元の辺を保つ方向で、角に曲線を作る。 |
| 出力 | Shape | 丸めた図形を別のShapeツールへ送るか、sRenderで画像にする。 |

このShape入力・Shape出力という分類は、COLLECTANEAのノードカタログとManualのShape Tools分類に基づきます。**21.1 Manualの該当ページは、正式な入力端子名、端子数、Inspectorの個別パラメータを示していません**。Mask入力などの有無も未確認です。

通常の2D Imageを直接sRoundへ流すのではなく、Shapeを生成するノードを前段に置きます。通常の映像合成へ戻す場合は[sRender](../shapes/s-render)が境界になります。

## 最初に確かめる構成

まずは変化を見分けやすい図形で、sRoundを入れる前後を比較します。以下は**役割から考えた確認用の構成案**であり、21.1実機で接続と描画を検証済みの手順ではありません。

```text
sRectangle → sRound → sRender → MediaOut
  四角形      角を丸める   画像化    表示
```

1. [sRectangle](../shapes/srectangle)で四角形を作り、最初は `sRectangle → sRender` の状態で輪郭を確認します。
2. sRectangleとsRenderの間にsRoundを追加します。接続できない場合は、実際のノードの入力型・出力型を確認してください。
3. sRoundのInspectorを開き、利用可能な角の調整項目を確認します。**設定名・数値範囲・初期値は未確認**なので、特定のスライダー名や数値を前提にしません。
4. 一度に変更する項目を絞り、sRoundを通した状態と通さない状態を比較します。見るのは「角の丸まり方」と「角から離れた辺がどの程度保たれるか」です。
5. 輪郭が見づらければ、sRenderの出力を拡大して角と辺の境界を見ます。必要に応じて元図形の大きさや縦横比を変え、同じ設定で形がどう変わるかも確認します。

[sPolygon](../shapes/spolygon)を使えば、直角だけでなく鋭角や鈍角を持つ図形でも比較できます。ただし、どの角度にどのような曲線が作られるかは、このManualの短い説明だけでは確定できません。

## 制作での使い方

### タイトル背景の角を調整する

文字の背後に置く帯やプレートを、角張った四角形からやわらかな輪郭に変える用途が考えられます。先に長方形の幅・高さを決め、その後に角を調整すれば、**図形のサイズ**と**角の見た目**を別の段階で扱えます。

```text
sRectangle → sRound → sRestyle → sRender → Merge
       図形      角      塗り・線     画像化    背景と合成
```

[sRestyle](./srestyle)は塗りや輪郭線の外観を上書きするツールです。sRoundで輪郭の形を考え、sRestyleで色や線の見え方を考える、という分担になります。この組み合わせの実機結果や各ノードの適用順による差は未確認です。

### ロゴの角の印象を比較する

同じ図形でも角が鋭いか丸いかで印象が変わります。ロゴの元形状を残しながら角の変更を試すには、sRoundの有無を切り替えて比較します。**元の角を正確な寸法で丸める必要があるロゴ**では、sRoundの計算規則と出力形状を実機で確認してから採用してください。

### 複数の図形をまとめて調整する

複数の図形に同じ種類の角処理をかけたい場合、[sMerge](../shapes/smerge)でまとめてからsRoundへ渡す構成も検討できます。ただし、**複数Shapeに対して個別に丸めが適用されるか、結合された輪郭をどう扱うか**は未確認です。最初は単独図形で動作を確認し、その後に複数の図形で比較します。

## sSmoothやほかのShapeツールとの違い

| ツール | 主に変える部分 | 選ぶ目安 |
| --- | --- | --- |
| **sRound** | 角 | 辺の性格を残し、角の鋭さを和らげたい。 |
| [sSmooth](./ssmooth) | 角と角を結ぶ線分 | 角を保ち、辺を曲げて滑らかにしたい。 |
| [sResample](./sresample) | 輪郭のサンプリング | 輪郭の点や線分の表現方法を調整したい。 |
| [sOffset](../shapes/soffset) | 輪郭の広がり | 図形の輪郭を外側へ広げる、または内側へ縮めたい。 |
| [sRestyle](./srestyle) | 塗り・輪郭線の外観 | 図形の形を変えずに見た目を変更したい。 |

特に混同しやすいのが**sRoundとsSmooth**です。角を曲線にしたいならsRound、角を保って辺を曲げたいならsSmoothという違いがあります。どちらも輪郭に関わりますが、同じ効果を強弱だけ変えて得るノードではありません。

また、「丸い輪郭」がほしいだけなら、最初から[sEllipse](../shapes/s-ellipse)で円や楕円を作る方が素直な場合もあります。四角形などの角を残した設計から変化させたいときにsRoundを使う、という選び方ができます。

## 注意点と確認範囲

- **公式資料で確認済み**：21.1のKrokodove Shape ToolsにsRoundが掲載され、角に曲線を作り、辺を保持する役割が説明されていること。
- **カタログに基づく整理**：Shapeを受けてShapeを返す処理として、sRenderより前に置く構成。
- **Inspector未確認**：設定項目の正式名称、数値範囲、初期値、アニメーション対応、丸めの計算法。
- **形状ごとの挙動未確認**：鋭角、短い辺、開いた輪郭、自己交差した図形、複数Shape、前後の処理順での結果。
- **環境差未確認**：内部REGID、DaVinci Resolve Free／Studio、Fusion Studioでの提供差、実機UIの表示。

## バージョンと出典

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 105「Krokodove Nodes」、p.2437「Shape Tools — sRound」。同ページに掲載されるsSmooth、sOffset、sResample、sRestyleの説明と比較して用途を整理しました。

Shapeから2D Imageへの変換は同ManualのChapter 117「Shape Nodes」と、[sRender](../shapes/s-render)の記事を参照してください。正式な端子・Inspector・実機結果をまだ照合していないため、`verification: partial`を維持します。
