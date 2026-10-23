---
title: "Vector Visualisation（Krokodove）"
description: "モーションベクトルの方向と動きの大きさを画面上で確認するKrokodoveツール。Vector/BackVectorの基礎、検証例、未確認事項を整理。"
doc_type: node
term_id: "vector-visualisation"
term_short: "画像中の動きを示すモーションベクトルの向きと速さを可視化するKrokodoveツール。"
verification: partial
aliases: ["Vector Visualisation"]
concepts: ["image-data", "auxiliary-channels", "motion-vectors"]
nodes: ["Vector Visualisation"]
node_family: "krokodove"
outputs: ["image"]
tasks: ["analyze-motion", "motion-vectors"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-21"
---

# Vector Visualisation（Krokodove）

**Vector Visualisationは、モーションベクトルがどちらへ向かい、どのくらいの動きを表しているかを画像上に重ねて見せるツール**です。DaVinci Resolve 21.1 Reference Manualでは、Krokodoveの「Image Vector Tools」に分類され、モーションベクトルの方向と速度を可視化するオーバーレイを生成するものと説明されています。

たとえば映像の右側へ人物が歩くとき、画面のどの部分が右へ動いていると推定されたのか、背景まで一緒に動いているのかを調べる用途が考えられます。ただし、**矢印・線・色のどれで表示するか、表示の長さや色がどの値に対応するかは公式Manualの短い記述からは分かりません**。特定の表示形式やInspector設定を前提にしないでください。

## 先に知っておくこと：モーションベクトルとは

モーションベクトルは、画面上の点や画素が**あるフレームから別のフレームへ、横と縦にどれだけ移動したか**を表す情報です。位置そのものではなく、位置の変化を示します。

- **方向**：右・左・上・下など、動きが向かう先。
- **移動量**：基準とするフレーム間で、横方向と縦方向に何画素動いたか。
- **速さとの関係**：同じ時間間隔なら移動量が大きいほど速い動きに相当します。ただし「1秒当たりの速度」を考えるときはフレームレートも関係します。

例として、ある画素の対応位置が次フレームで右に6画素、上に2画素ずれたとします。その動きを表すベクトルは「右に6、上に2」という2方向の成分を持ちます。**この例の数値は概念説明用**であり、Vector Visualisationの画面に「6」「2」と表示されるという意味ではありません。

Fusionの[Optical Flow](../optical-flow/optical-flow.md)は、連続する画像を解析して画素ごとの動きを推定します。結果は通常のRGBA画像のほか、<Term id="auxiliary-channels">補助チャンネル</Term>である**Vector / BackVector**として保持できます。

- **Vector**：現在のフレームから次のフレームへの動き。
- **BackVector**：現在のフレームから前のフレームへの動き。

これらの値はフル解像度を基準とした**画素単位の移動量**です。Proxyで縮小表示しても、そのまま縮小画面の画素数として読んではいけません。詳細は21.1 ManualのChapter 87、pp.1909–1910にあります。

## 何をするツールか

Vector Visualisationが行うと公式資料で確認できるのは、**既存のモーションベクトルが表す方向・速度を見える形にすること**です。

一方、映像からベクトルを**計算する**工程と、計算されたベクトルを**可視化する**工程は分けて考えます。前者の代表がOptical Flowであり、後者がこのツールの説明上の役割です。Vector Visualisation自身が不足したベクトルを自動計算するかどうかは、21.1 Manualの掲載行からは確定できません。

映像に動きがあることと、入力データにモーションベクトルが含まれていることも別です。<Term id="image">Image</Term>のRGBAが表示できても、Vector / BackVectorが存在する証拠にはなりません。

## 入力・出力と確認範囲

| 項目 | 確認できること | 実機・追加資料で確認すること |
| --- | --- | --- |
| 主な役割 | モーションベクトルの方向・速度をオーバーレイとして可視化する。 | ベクトルの取得先と、Vector / BackVectorのどちらを参照するか。 |
| 入力 | 画像を扱うKrokodoveのImage Vector Toolsに分類されている。 | 正式な入力端子の名称・数、必要なチャンネル、画像のみで動作するか。 |
| 出力 | 既存COLLECTANEAカタログではImage系の出力に分類されている。 | 正式な出力端子、元画像の保持、背景・透明度・表示内容の扱い。 |
| 表示 | 方向と速度を可視化するという目的。 | 矢印・線・色などの表現形式、凡例、表示密度、数値との対応関係。 |

ここでいう**オーバーレイ**は、動きの情報を確認しやすいよう画面に重ねた表示を指します。通常の色補正やぼかしのように、元画像の見た目を改善することが主目的ではありません。オーバーレイが最終出力へどのように含まれるかは未確認です。

Frontmatterの「outputs: [image]」は既存カタログのデータ分類で、**21.1実機の端子仕様を保証する記述ではありません**。従来の「inputs: [image]」は、正式な入力構成の裏付けがないため削除しています。

## 主な用途

### Optical Flowの結果を調べる

スロー再生や動き補償の結果が不自然なとき、ベクトルを可視化すると、どこで動きの推定が乱れているかを探す手掛かりになります。特に人物が背景の前を横切る場面では、輪郭の内側と外側で異なる動きが混在します。

これは**ベクトルを見るという用途の提案**であって、Vector Visualisationが必ず誤推定箇所を自動検出・修正するという意味ではありません。見た目が分かりやすくても、数値が正しいかどうかは別に確認します。

### カメラ移動と被写体の動きを区別する

固定カメラの映像では、止まった背景と動く被写体を比較しやすくなります。カメラがパンする映像では、背景も画面内を移動するため、ベクトルが広い範囲に分布する可能性があります。

こうした違いを観察する目的で使えますが、Vector Visualisationがカメラモーションと被写体モーションを**自動分類する機能**は確認されていません。

### 別のベクトル処理に入る前の確認

[Vector Motion Blur](../blur-filter/vector-motion-blur.md)は動きに沿ったぼかしを作るツール、[Vector Denoise](../optical-flow/vector-denoise.md)はベクトルで前後フレームの対応位置を合わせながら画像を平均するツールです。これらは**ベクトルを使って画素を加工する**のに対し、Vector Visualisationは**ベクトルの様子を確認する**目的で選びます。

## 制作例：横に動く四角形で確かめる

はじめから複雑な実写で試すと、動きの推定と可視化のどちらが原因で表示が変わったのか分かりにくくなります。まずは背景が静止し、四角形だけが右へ一定速度で移動する数秒の動画を用意します。

想定するデータの流れは次のとおりです。

~~~text
連続フレームのImage
       ↓
  Optical Flow  ── Vector / BackVectorを推定・保持
       ↓
Vector Visualisation（接続端子・channel要件は実機で確認）
       ↓
      Viewer
~~~

**この図は検証のための構成案であり、Vector Visualisationの公式配線図ではありません。** 実際にノードを追加して受け付ける端子とデータを確認してから接続します。

1. 四角形を数秒間、右方向へ動かします。カメラや背景は動かさず、動きのある部分を限定します。
2. Optical Flowに連続フレームを渡します。まずOptical Flowの出力をViewerで開き、「Channel > Vectors」と「Options > Normalize Color Range」を使ってベクトルがあるか確認します。これは**Optical Flow側の公式Manualで確認できる操作**です。
3. Vector Visualisationを追加し、入力の型と必要なチャンネルを実機で調べます。接続できる場合は表示を比較し、四角形・背景・輪郭で何が違うか記録します。
4. 四角形を左移動へ変え、**方向を反転させたときの変化**を比較します。次に移動距離を大きくして、**動きの量の違い**がどう表れるか確認します。表示の長さや色が数値へ比例すると決めつけずに観察します。
5. 最初と最後のフレームも確認します。前後フレームが存在しない場合、Optical Flowの対応するVector / BackVectorがゼロになります。境界フレームだけ表示が変わる場合は、この条件と区別します。

この比較で「Vector Visualisationが描いたもの」と「Optical Flowが計算したもの」を同一視しないことが重要です。可視化結果を使って、元データをどのように調べ直すかまで考えます。

## 関連ツール・注意点

- **Optical Flow**：映像からベクトルを求める。Vector Visualisationとは解析と表示で役割が違います。
- **Vector Motion Blur / Vector Denoise**：ベクトルを使って画像のぼかしやノイズを処理します。ベクトルを表示するだけの目的とは異なります。
- **[補助チャンネル / AOV](../../learn/02-data/auxiliary-channels.md)**：RGBAに加えて別の値を保持する仕組み。RGB画像が読めることだけではVector / BackVectorの存在は証明できません。
- **遮蔽・フレーム端**：物体が隠れたり画面から出たりすると、前後フレームで対応する画素が見つからないことがあります。解析結果の限界と表示方式の限界を分けて考えます。
- **エディション差**：Resolve Free / Studio / Fusion Studioでの利用条件、現在のEffects Libraryでの表示、内部REGIDは未確認です。Chapter 112の一部ベクトル処理がStudio限定であっても、このKrokodoveツールへ同じ条件を推定しません。

## バージョン・出典・未確認事項

**固有機能の一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2436**、Image Vector Tools / Vector Visualisation。公式説明から確定できるのは**モーションベクトルの方向と速度を可視化するオーバーレイを生成する**という役割です。

**ベクトルの背景知識**：同Manual、Chapter 87 **pp.1909–1910**（Vector / BackVectorの時間方向、画素単位、端のフレーム、Proxy時の注意）、Chapter 112 **p.2618**（Optical Flowが前後のベクトルを補助チャンネルに書き込み、Viewerで確認する方法）。

[Blackmagic Design公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)

**21.1実機で未確認**：全端子名・端子数、どのベクトルチャンネルを参照するか、オーバーレイの表示形式と数値への対応、Inspector項目・既定値・範囲、Alpha・出力の保持、Edition差、現在のツール登録状態。このため「verification: partial」を維持します。

[Krokodoveの全体像](./index.md)から画像・Shape・3D・Regionの別も確認できます。
