---
title: "Group"
description: "Fusionの複数ノードを1つに折りたたみ、内部を編集・保存・再利用する方法。"
doc_type: node
term_id: "group"
term_short: "Groupは複数のFusionノードをまとめて表示し、内部の処理を保ったまま整理・再利用する仕組み。"
verification: partial
aliases: ["Group"]
concepts: ["graph-as-flow"]
nodes: ["Group"]
node_family: "utility-io"
tasks: ["graph-organization", "route-data"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-15"
---

# Group

**Groupは、複数のFusionノードを1つのノードのように折りたたんで管理する仕組みです。** たとえばキーイング、マットの調整、色補正を別々のノードで組んだあと、関連するノードだけをGroupにまとめられます。

Groupに入れても、各ノードの処理や接続が別の効果に置き換わるわけではありません。内部のノードは引き続き画像を計算し、Groupはその構成を整理します。必要なときは開いて編集でき、Groupを解除しても内部のノードを残せます。

## 入力と出力は内部の接続で決まる

Groupには、すべてのGroupに共通する固定個数のImage入力・出力があるわけではありません。**まとめたノードと、Groupの外側にあるノードとの接続**に応じて端子が現れます。

- **入力**：Groupの外から内部ノードへ接続されていたデータを受け取ります。外部へ接続されていない内部ノードの入力は、Groupの外側に自動表示されません。
- **出力**：内部の結果をGroupの外へ渡す接続です。どのような結果を外へ返すかは、内部ノードの接続で決まります。
- **内部処理**：Image、Maskなどを実際に加工するのは内部の各ノードです。Group自体が新しい画像処理を付け加えるわけではありません。

たとえば次の2つのノードをまとめる場合です。

```text
MediaIn1 → Blur1 → ColorCorrector1 → MediaOut1
               └─ Groupにする範囲 ─┘
```

BlurとColor Correctorを選んでGroupにすると、メインのNode Editorには概ね次のように表示されます。

```text
MediaIn1 → Group1 → MediaOut1
```

画像はGroupの入力からBlurへ進み、Color Correctorで調整された結果がGroupの出力からMediaOutへ渡ります。外からは短い接続として見えても、内部の処理順序は維持されます。

複数の素材を内部のMergeへ接続する構成なら、Groupの外部接続もそれに応じて変わります。**「Groupは必ず入力1本・出力1本」と覚えないこと**が重要です。端子の厳密な名前やデータ型は内部に入れたToolと接続に依存するため、実際のNode Editorで確認してください。

## Groupを作成・編集する

1. Node Editorでまとめたいノードを選択します。素材の入口やMediaOutまでまとめる必要はありません。
2. 選択したノードのいずれかを右クリックし、**Group**を選びます。
3. 選択ノードが折りたたまれ、メインのNode Editorに1つのGroupとして表示されます。
4. 内部を編集するときはGroupを**ダブルクリック**するか、右クリックして**Expand Group**を選びます。
5. 開いたGroup専用のNode Editorで、パラメータの調整、ノードの追加・接続変更・削除を行います。作業後はGroupウィンドウを折りたたみます。

開いたGroupのウィンドウは、メインのNode Editorとは独立して拡大・縮小・移動できます。Groupを開いたまま別の箇所も編集できるため、全体の流れと一部分の構成を分けて確認できます。

Groupの中に別のGroupを作る**入れ子構造**も可能です。ただし階層を深くしすぎると、どこで画像やマットが変わったのか追いにくくなります。ショット内の処理のまとまりが明確な範囲で使うと整理しやすくなります。

## UngroupとDeleteは異なる

| 操作 | 結果 |
| --- | --- |
| **Expand Group／ダブルクリック** | Groupを開き、内部ノードを編集する。Group自体は残る |
| **Ungroup** | Groupの箱だけを解除し、内部ノードをメインのNode Editorに戻す |
| **Delete** | Groupと、その中に含まれるノードをまとめて削除する |

一時的に内部を全部見たいだけなら、削除するのではなくExpand Groupを使います。今後Groupとしてまとめる必要がなくなった場合は**Ungroup**です。Deleteでは内部ノードも消えるため、同じ操作として扱わないでください。

## 保存して別のショットで使う

Groupは内部ノードと設定を含めて`.setting`ファイルとして保存できます。

1. Groupを右クリックし、**Settings > Save As**で保存します。
2. 別のショットやコンポジションでは、保存したファイルをファイルブラウザーからNode Editorへドラッグすると、同じ内部ノードを持つGroupを追加できます。
3. 同じノード構成を持つ既存Groupへ設定を読み込みたい場合は、そのGroupを右クリックして**Settings > Load**を使います。

Fusion Studioでは、Groupを**Bins**ウィンドウへドラッグして保存・管理する方法もManualに記載されています。これはFusion Studio側の操作であり、Resolve内のFusionページにも同じBins操作があると決めつけないでください。

保存したGroupは再利用のための構成データです。ドラッグして作成した別Groupが、元のGroupのパラメータ変更に自動追従する「共有インスタンス」になるという意味ではありません。複数ショットへ修正版を配る場合は、保存し直した設定を適切なショットへ読み込んで確認します。

## 制作例1：グリーンバックのキーイング工程をまとめる

人物のグリーンバック素材を使う場合、キーの抽出、背景色の残りを抑える処理、輪郭マットの調整を複数ノードに分けて作れます。

1. MediaInから人物素材を読み込みます。
2. キーイングとマット調整のノードを順番に接続し、透明部分や輪郭をViewerで確認します。
3. **キーイング関連のノードだけ**を選択してGroup化します。素材のMediaInと最終出力のMediaOutは外に残します。
4. 後から髪の毛の輪郭を修正する必要があればGroupを開き、内部のマット調整を変更します。

これにより、メインのGraphでは「人物を抜く処理」という1つのまとまりが分かりやすくなります。Group化しただけでキーが改善するわけではありません。画像の結果は内部ノードの設定で決まります。

## 制作例2：複数素材を合成する工程を整理する

背景映像と前景グラフィックをMergeで合成し、さらに色やぼかしを調整する構成を考えます。

- 背景と前景は、Groupの外から内部のMergeへ接続します。
- Merge以降の補正ノードも同じGroupに含めます。
- Groupの出力を後段へ接続し、Viewerで背景と前景の双方が表示されるか確認します。

この場合は外側から**複数の素材を受け取る**ため、1入力の例とGroupの接続構造が異なります。Groupを作成する前後で端子がどう現れたかを確認すると、意図しない接続の欠落を見つけやすくなります。

## 制作例3：調整済みのノード群を別ショットへ移す

同じ処理手順を繰り返す複数のショットでは、調整済みのBlurと色補正をGroupにして`.setting`として保存します。次のショットのNode Editorへ読み込み、MediaInとMediaOutを接続します。

最初のショットで使用したぼかし量や補正値は再利用できます。ただし露出や背景が違うショットでは、Groupを開いて値を調整する必要があります。「同じノード構成を使い回す」ことと「映像が自動的に一致する」ことは別です。

## Macro・Underlayとの違い

| 機能 | 何をまとめるか | 編集・再利用の考え方 |
| --- | --- | --- |
| **Group** | 複数ノードとその接続 | 折りたたんで整理し、必要に応じて内部を直接編集する。設定を保存・読み込みできる |
| [**Macro**](./macro) | 複数ノードと、選択して公開した接続・Control | 使い手に見せるInspector項目まで設計し、1つのToolとして再利用する |
| [**Underlay**](./underlay) | Node Editor上のノードを背景で囲う範囲 | 接続や処理を折りたたまず、位置関係を視覚的に整理する |

制作中の複雑なGraphを読みやすくしたいならGroup、別の担当者が少数のControlだけを調整する汎用エフェクトにしたいならMacroが向いています。まとめた内部へ入り直す必要がない単純な視覚的分類ならUnderlayを使います。

## 関連ページ

- [Macro](./macro)：Controlを公開する再利用Toolの作成
- [Underlay](./underlay)：Graphを折りたたまずに整理
- [MediaIn](./media-in)／[MediaOut](./media-out)：Resolve側の素材入力と出力
- [I/O・Graph Utility一覧](./)：関連項目から探す

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）**に基づきます。

- Chapter 67「Node Groups, Macros, and Fusion Templates」**pp.1427–1429**：Groupの作成、外部接続に応じた端子、展開・解除・削除、入れ子、`.setting`保存と再利用、Fusion StudioのBins。
- Chapter 101「Flow Organizational Nodes」**p.2350**：Groupの位置づけと基本操作。
- 公式配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

具体的な制作例はManualに記載された機能を組み合わせた説明です。すべてのData Domainにおける端子名・内部Registry ID・Edition差は実機で網羅確認していないため、`verification: partial`を維持しています。
