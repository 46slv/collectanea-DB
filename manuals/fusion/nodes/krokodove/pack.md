---
title: Pack
description: 指定したカラーチャンネルに図形を重ねた模様を作るKrokodoveの画像ツール。チャンネルの意味、接続例、近いツールとの違いを説明。
doc_type: node
term_id: pack
term_short: 指定したカラーチャンネル内に、図形を重ねた模様を作るKrokodoveの画像ツール。
verification: partial
aliases: [Pack]
concepts: [image-data]
nodes: [Pack]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-17'
---

# Pack

Packは、**指定した色のチャンネルに、図形が重なった模様を作る**Krokodoveの画像ツールです。たとえば幾何学模様を画像に加えたいときや、特定の色成分だけに模様を持たせる表現を検討するときの候補になります。

DaVinci Resolve 21.1 Reference Manualは、Packを「Image Tools」に分類し、指定されたカラーチャンネル内に図形を積み重ねたパターンを生成すると説明しています。一方、図形の種類や数、重なり順を決める具体的な設定は、その説明にはありません。

## 「チャンネル」と「重なった図形」の意味

<Term id="image">Image</Term>は画素（ピクセル）の集まりです。一般的なカラー画像は、各画素の赤（R）・緑（G）・青（B）の成分を別々の**カラーチャンネル**として持ちます。透明度を表すAlpha（A）もありますが、色成分とは役割が異なります。

たとえば赤のチャンネルだけに明るい図形が現れ、緑と青が変わらなければ、合成されたカラー表示では赤みを帯びた模様として見える可能性があります。これは**チャンネルを理解するための例**であり、Packが必ずその描画方法を採る、あるいはRGBすべてを選択できるという確認結果ではありません。

「stacked shapes」は、図形を何枚も重ねるように並べたパターンを意味します。正方形・円形などの種類や、規則的に並ぶのかランダムなのかはManualの記述だけでは分かりません。また、ここでいう図形は**見た目の模様**であり、Fusionの<Term id="shape-data">Shapeデータ</Term>を入出力するという意味ではありません。

<!-- capture:S274 -->

## 実機例：大小の円を表示する

合成した白黒グラデーションを `Pack` に接続し、ChannelをAlpha、Shape TypeをCircleに設定しました。この静止画では大小の白い円が画面に並びます。Viewerの市松模様は透明部分の表示です。ほかの形やAlpha値は未検証です。[接続と設定の記録](/img/fusion/captures/S274/readback.json)に条件を記載しています。

[![グラデーションをPackへつなぐノード構成](/img/fusion/captures/S274/graph.png)](/img/fusion/captures/S274/graph.png)

合成グラデーションをPackへ渡します。

[![PackのInspector](/img/fusion/captures/S274/controls.png)](/img/fusion/captures/S274/controls.png)

ChannelはAlpha、Shape TypeはCircleです。

[![入力の白黒グラデーション](/img/fusion/captures/S274/low.png)](/img/fusion/captures/S274/low.png)

入力は黒から白へのグラデーションです。

[![大小の白い円が並ぶPack出力](/img/fusion/captures/S274/high.png)](/img/fusion/captures/S274/high.png)

出力には大小の円が見えます。

[再現用Graph](/img/fusion/captures/S274/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S274/capture.json)

<!-- /capture:S274 -->

## 入力と出力

| 段階 | 扱うもの | 確認できる範囲 |
| --- | --- | --- |
| 入力 | 2D画像 | COLLECTANEAの既存カタログでは画像入力に分類。正式な入力端子名と端子数は未確認。 |
| 処理 | 指定したカラーチャンネル内の図形パターン | 21.1 Manualに記載されたPackの役割。模様の生成方法や各チャンネルへの書き込み方は未確認。 |
| 出力 | 2D画像 | 既存カタログでは画像出力に分類。Alphaや他のチャンネルがどう変わるかは要確認。 |

出力は画像として後段へ渡す想定です。**3Dオブジェクトの積み重ねでも、Shapeストリームを作るノードでもありません。** ただしManualの一覧表には個別の端子仕様が載っていないため、実際の接続は使用中のFusionで確認してください。

## 主な用途

- **チャンネルを使ったモーショングラフィックスの試作**：図形模様を画面に加える前に、どの色成分に変化が出るかを確かめる。
- **抽象的な背景の制作**：生成した模様を別の映像と合成する素材として使えるか試す。
- **チャンネル別の処理を伴う表現**：後段で色成分を分けたりずらしたりする構成の入力候補にする。

いずれも公式の短い機能説明から考えられる**制作上の使用案**です。上記の実機例はChannel Alpha、Shape Type Circleの一条件です。透過値やアニメーション対応は未検証です。

## 制作例：単色画像から模様の変化を確認する

まず実写素材ではなく、単純な画像を入力して、Packが実際にどの成分を変えているかを調べます。

```text
Background（単色画像） → Pack → MediaOut
                         │
                         └─ Viewerで処理前後を比較
```

1. **元画像を用意する**：Backgroundで明るさや色の均一な画像を作り、Packへ接続します。上の図は画像入出力という既存分類に基づく構成案です。正式なポート名は固定していません。
2. **最初の出力を見る**：Packの前後をViewerに表示し、バイパス時と比べます。図形が見えるかだけでなく、背景の色や透明度が変わっていないかにも注目します。
3. **チャンネルごとに調べる**：Viewerのチャンネル表示を使い、赤・緑・青・Alphaを個別に確認します。カラーチャンネルを選ぶInspector項目がある場合は、選択を変える前後で同じ比較をします。項目名や選択肢は実機優先です。
4. **合成を試す**：模様を別の背景に重ねたい場合は、画像出力を[Merge](../compositing/merge)へ送ります。ただし、**模様のRGBに変化があってもAlphaが透明とは限りません**。背景が覆われるならAlphaを確認し、必要なマット処理を別途検討します。

形状の種類・密度・重なり・時間変化をどこまで調整できるかは、21.1 Manualの一覧説明では分かりません。上記は**操作を検証するための手順**であり、特定の見た目を保証するプリセット手順ではありません。

## 似たKrokodoveツールとの違い

| ツール | Manualで説明される役割 | 選び分け |
| --- | --- | --- |
| **Pack** | 指定したカラーチャンネル内に、重なった図形のパターンを作る | **チャンネルと図形パターンの関係**を扱いたいとき |
| [Pattern](./pattern) | タイル状に繰り返す図形で画面全体を埋める | **画面全体に広がる規則的な模様**が欲しいとき |
| [Shapes](./shapes) | 正方形や円などの同心形状を複数の層として作る | **中心を共有して重なる図形**を作りたいとき |
| [Channel Shifter](./channel-shifter) | RGBAの各チャンネルを分け、位置・ぼかし・大きさを操作する | **既存の色成分を移動・変形する**とき |

Packが画像内のどのチャンネルをどう選択するか、PatternやShapesと組み合わせた際にどのような模様になるかは、実機で評価する必要があります。名前だけで相互互換と判断しないでください。

## 出典・バージョン・未確認事項

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 105「Krokodove Nodes」、p.2434（Image Tools／Pack）。ここで確認できるのは、指定したカラーチャンネル内に図形を重ねたパターンを作るという役割です。
- **補助資料**：Blackmagic Design『DaVinci Resolve 21 New Features Guide』p.108（Krokodove統合とPackの説明）。[公式PDF](https://documents.blackmagicdesign.com/SupportNotes/DaVinci_Resolve_21_New_Features_Guide.pdf)。
- **関連資料**：同21.1 Manual、p.2435（Pattern・Shapes・Channel Shifterの役割）。
- **未確認**：正式な端子名・端子数、今回の例以外のチャンネルと図形、配置・重なり方、Inspector項目の意味・初期値・数値範囲、Alpha処理、アニメーション、Editionごとの利用可否。

`verification: partial`はこれらが未確認であることを示します。Krokodove全体の分類は[Family Overview](./)を参照してください。
