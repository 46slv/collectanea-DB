---
title: "Macro"
description: "Fusionの複数ノードを再利用可能なToolにまとめ、公開する入出力とInspectorを設計する方法。"
doc_type: node
term_id: "macro"
term_short: "Macroは複数のFusionノードをまとめ、外部に公開する端子と操作項目を選べる再利用用Tool。"
verification: partial
aliases: ["Macro"]
concepts: ["graph-as-flow"]
nodes: ["Macro"]
node_family: "utility-io"
tasks: ["route-data", "graph-organization"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-15"
---

# Macro

**Macroは、複数のFusionノードを1つの再利用可能なToolとして扱う仕組みです。** たとえばBlurとColor Correctorをまとめ、使う人には「ぼかし量」と「明るさ」だけを見せられます。

Macroそのものが新しい画像処理を追加するわけではありません。内部のノードが処理を続け、Macroは**外へ出す接続端子とInspectorの操作項目を選んで1つにまとめます**。21.1 Manualは、Macroを厳密には独立ノードではなく「1つのノードのように動作するノード群」と説明しています。

## 入力・出力と内部ノード

Macroに固定された数のImage入力・出力があるわけではありません。**何を外から受け取り、何を次へ渡すかは、内部ノードとMacro Editorで公開した接続によって決まります。**

| 要素 | Macroの外から見た役割 |
| --- | --- |
| 内部ノードの入力 | 外の画像などを受け取る接続として公開する |
| 内部ノードの出力 | 加工後の結果を後段へ渡す接続として公開する |
| InspectorのControl | 内部ノードの設定のうち、使い手が調整してよいものだけを表示する |
| 非公開のControl | Macro内部に設定を保持し、使い手には通常表示しない |

2D画像を受け取って2D画像を返すMacroは一般的ですが、それがすべてのMacroの固定仕様ではありません。**入力・出力のExportを選び忘れると、素材を接続できない、結果を取り出せない**といった状態になります。

## Macro Editorで作成する

1. Node Editorでまとめたいノードを選択します。
2. 選択したノードを右クリックし、**Macro > Create Macro**を開きます。選択順はMacro Editor内の並びに反映されます。
3. 上部の**Macro Name**で名前を付けます。
4. **Export**列で、外部に見せたいInput／OutputとControlを選びます。使い手に不要な設定は公開しません。
5. **Name**列で表示名を整え、右側の**Inspector Preview**で操作面を確認します。
6. 保存形式を選びます。保存前には、オプションの**Copy Macro**で試作品をNode Editorへ貼り付け、実際につなげて確認できます。

### Macro Editorの主な列

| 列 | 内容 |
| --- | --- |
| **Tool/Input** | 内部パラメータ名または入力接続 |
| **Export** | Macroに公開するかを選ぶ |
| **Name** | Macroに表示する項目名 |
| **Type** | その項目が受け取るデータ型 |
| **Default** | 公開Controlの既定値 |
| **Minimum / Maximum** | Controlに設定する最小値・最大値 |

たとえばBlurに多くのパラメータがあっても、必要なぼかし量だけを公開できます。公開項目を減らすことと、内部で計算される効果を削ることは別です。

### 21.1のInspector Preview

**Inspector Preview**は完成後の見た目を確認するだけでなく、Controlをドラッグして順序を変えたり、別ページへ移したり、ページを追加・改名したりできます。

| 操作 | 役割 |
| --- | --- |
| **Add Separator** | 設定項目の間に区切り線を入れる |
| **Add Spacer** | 設定項目の間に空白を作る |
| **Add Nest** | 詳細設定を折りたためるまとまりにする |

Nestの初期状態はDefault列の**1が開く、0が閉じる**です。強度や位置など頻繁に触る項目を上部に、詳細設定をNest内に配置すれば、使い手が必要なControlを見つけやすくなります。これらは画像に直接作用する設定ではなく、Inspectorの表示構造を作る機能です。

## 保存・再編集とEditページのTemplate

Macro Editorの**Save to**では、通常の`.setting`ファイル、またはFusion Title／Transition／Effect／GeneratorなどのTemplateカテゴリを選べます。

作成した通常MacroはNode Editorの**Add Tool > Macros**などから利用できます。オプションには**Open**、**Open Template Bundle**、**Save / Save As**、**Copy Macro**、**Update from Selected Tools**があります。最後の項目は、元ノードを編集した後、その変更をMacro Editorへ取り込みながら、すでに作った公開Controlの選択・レイアウトを維持するための機能です。

`.DRFX`はTemplateをまとめられるBundle形式です。Macro Nameにフォルダー名の接頭辞を付け、Bundle内を整理する方法もManualで説明されています。

**DaVinci Resolveの通常Macroが自動的にEditページのEffects Libraryへ現れるわけではありません。** Edit側で使うタイトルやエフェクトとして配布するには、対応したTemplateとして保存・配置します。

## 制作例1：Blurと色調整を1つにまとめる

複数ショットで、映像に軽いぼかしと色調整を加える場合です。

```text
MediaIn1 → Blur1 → ColorCorrector1 → MediaOut1
```

1. まず上のように接続し、BlurとColorCorrectorの結果をViewerで確認します。
2. **Blur1とColorCorrector1だけ**を選び、Macro Editorを開きます。
3. 外から画像を受け取る入力、後段に結果を渡す出力、使い手が調整するぼかし量と色の値をExportします。
4. Controlに分かりやすい名前を付け、Inspector Previewで並びを整えます。
5. Copy Macroで試作品を貼り付け、`MediaIn → Macro → MediaOut`として画像が届くか、Controlの変更が画像に反映されるか確かめてから保存します。

この構成なら別ショットに同じ処理を持ち込めます。ただしMacro化しただけで露出や色が自動的にそろうわけではなく、素材ごとに値の調整が必要です。

## 制作例2：編集担当者が文字を差し替えられるタイトル

Text+とTransformなどでタイトルを作り、**文字内容・大きさ・位置**など編集担当者が触る項目だけを公開します。

Fusionページの通常Macroではなく、**Title Templateとして保存**すれば、EditページのEffects Libraryから使う形にできます。21.1 Manualのタイトル作成手順では、内部の構成ノードを選び、ResolveのMediaIn／MediaOut（Fusion StudioではLoader／Saver）は選択対象から除きます。完成後はEditページで公開項目が正しく使えるか確認してください。

## Group・Underlayとの違いと注意点

[Group](./group)はノード群をまとめ、内部Node Editorを開いて編集する機能です。Macroは**使い手に公開する接続とControlを選べる**点が違います。[Underlay](./underlay)はノード群を背景で囲む表示上の整理手段で、1つのToolにはなりません。

- **接続できない**：入力・出力のExportを確認します。すべての端子が自動的に公開されるわけではありません。
- **Inspectorが複雑**：必要なControlだけをExportし、順序・Nest・Separatorを整理します。
- **元ノードの変更を取り込みたい**：Update from Selected Toolsを確認し、Copy Macroで試します。
- **Editページに表示されない**：通常Macroと、Edit用に保存・配置したTemplateを区別します。

## 関連ページ

- [Group](./group)：ノード群をまとめて内部を編集する
- [Underlay](./underlay)：Node Editor内を視覚的に整理する
- [MediaIn](./media-in)／[MediaOut](./media-out)：素材入力と完成画像の出力
- [I/O・Graph Utility一覧](./)：近い機能の一覧

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）**を基準にしています。

- Chapter 67「Node Groups, Macros, and Fusion Templates」**pp.1429–1434**：Macro Editor、Export／Name／Type／Default／Minimum／Maximum、Inspector Preview、Separator／Spacer／Nest、Copy Macro、Update from Selected Tools、保存とTemplate。
- Chapter 101「Flow Organizational Nodes」**pp.2351–2352**：Macroの定義・作成・再利用、Editページ用Title Template。
- 配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

制作例は21.1 Manualの機能を組み合わせたものです。すべてのData Typeにおける端子の公開結果、内部Registry ID、Templateの全配置条件、Edition差は実機で網羅確認していないため、`verification: partial`を維持しています。
