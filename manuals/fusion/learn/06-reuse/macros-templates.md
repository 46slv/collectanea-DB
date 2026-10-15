---
title: Macro / Templateで再利用単位を作る
description: Group・Macro・Edit用Templateの違いを理解し、公開する入出力と操作項目を設計する。
doc_type: concept
term_id: macros-templates
term_short: Fusionのノード群から再利用用のMacroやEditページ用Templateを作る考え方。
verification: partial
aliases: [Macro, Template, Fusion Template]
concepts: [macros, templates, public-interface, reuse]
tasks: [reuse, package-graph, expose-controls, template]
prerequisites: [groups, user-controls, expressions]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion, edit]
updated: "2026-10-16"
---

# Macro / Templateで再利用単位を作る

Fusionで同じノード構成を何度も使う場合、毎回ノードを並べ直す代わりに、まとまりとして保存できます。ただし「まとめて見やすくする」「別のCompositionでも使う」「Editページから効果を配置する」は、同じ作業ではありません。

このページでは、**何を再利用したいか**から形式を決め、外へ渡す画像と操作項目を設計します。Macro Editorの全項目や保存先のOS別パスは、[MacroのNode Reference](../../nodes/utility-io/macro)と[Resolveで再利用する手順](../../resolve-integration/reusable-fusion-assets)に分けてあります。

## Group、Macro、Templateの違い

| 形式 | 主に解決すること | 利用する場所 |
| --- | --- | --- |
| [Group](./groups) | 複数のノードをまとめ、必要なら内部を開いて編集する | FusionのNode Editor |
| Macro | ノード群を再利用し、外からつなぐ端子やInspectorの項目を選ぶ | FusionのNode Editor |
| Fusion Template | Fusionで作った処理をTitle・Effect・Generator・Transitionとして配置する | ResolveのEditページのEffects Library |

**Groupも保存して別のCompositionへ読み込めます。** したがって「再利用できるか」だけではGroupとMacroを区別できません。違いは、利用者に見せる操作や接続をどこまで選び直すかです。

Macroはそれ自体がぼかしや色補正を実行する新しいアルゴリズムではありません。内部にあるBlurやColor Correctorなどのノードが従来どおり処理し、Macroはそれらを一つのToolとして扱います。**Templateは、MacroをEditページで使える形式・配置にしたもの**です。通常のMacroを保存しただけでは、EditのEffects Libraryに自動で現れません。

## 境界を設計する三つの問い

たとえば、複数のインタビュー映像へ同じ「軽いぼかし＋色調整」をかけるとします。

~~~text
MediaIn1 → Blur1 → ColorCorrector1 → MediaOut1
           └──────── Macroにする範囲 ────────┘
~~~

1. **入力と出力は何か。** 外から元映像のImageを受け取り、処理後のImageを後段へ渡します。Macroに固定の入出力端子数があるわけではなく、公開する接続は内部のノード構成によって変わります。
2. **使う人に何を変えさせるか。** ぼかし量と補正の強さはショットごとに変えるので公開し、内部の細かな設定は固定します。
3. **どこで使うか。** Fusion内でつなぎ直すならMacroで十分です。EditページでクリップへドラッグしたいならFusion Effect Templateとして作ります。

これが「再利用単位を作る」という意味です。内部で何枚の画像を使うか、出力の種類は何か、どの調整だけを外に見せるかを決めてから保存します。Inspectorを単に短くすることが目的ではありません。

## Fusion内で使うMacroを作る

上の例なら、次のように組み立てます。

1. 元映像につながる **Blur1とColorCorrector1だけ**をNode Editorで選び、右クリックの **Macro > Create Macro** を開きます。
2. **Macro Name**で名前を付けます。Macro Editorの**Export**列で、Blur側の画像入力、ColorCorrector側の画像出力、公開したいControlを選びます。画像の接続端子もExport対象です。
3. **Name**列で表示名を整え、**Inspector Preview**で並びを見ます。必要ならSeparatorやNestで項目を整理します。
4. 保存する前にオプションメニューの**Copy Macro**で試作品をNode Editorへ貼り付け、`MediaIn1 → Macro → MediaOut1`として接続します。画像が出るか、公開値を変えると結果が変わるか確認します。
5. 通常のMacroとして`.setting`を保存し、別のCompositionでも呼び出して使います。

Macro Editorでは**Tool/Input、Export、Name、Type、Default、Minimum、Maximum**を設定できます。公開Controlの最小値や初期値も設計できますが、数値を設定しただけで内部の画像処理が安全・適正になるわけではありません。設定範囲は実際の素材で確認します。

**画像が接続できないときは、公開Controlの数より先に入力・出力のExportを確認**します。Macroを作っても内部ノードのすべての端子が自動で外へ出るわけではありません。

## Editで使うTemplateは、種類ごとに画像の受け取り方が異なる

Templateは単なる「保存先を変えたMacro」ではなく、Editページで使う状況に合う入出力を含めて設計します。21.1 Manualの作成手順では、選択するノードが種類によって違います。

| Template | 何を処理するか | 作成時に含めるノード |
| --- | --- | --- |
| **Title** | 元画像なしで文字や図形を生成し、Timelineへ重ねる | タイトルを構成するノード。**MediaIn / MediaOutは選択しない** |
| **Generator** | 背景・パターンなど新しい画像を生成する | 生成ノードと**MediaOut** |
| **Effect** | 配置先クリップから受け取った画像を加工する | **MediaInとMediaOut**を含む構成 |
| **Transition** | 切り替え前後の2クリップを合成・変形する | **MediaIn1、MediaIn2、MediaOut**を含む構成 |

たとえば**Effect**では、作成時に使った撮影素材そのものは保存したEffectへ固定されません。別のクリップへ置くと、そのクリップの映像が入力になります。一方、**Transition**ではMediaIn1が切り替え前、MediaIn2が切り替え後の映像です。Titleの「MediaIn/MediaOutを選ばない」という手順をEffectやTransitionへ流用してはいけません。

Fusion Clipの複数レイヤーを扱うEffectでは、MediaInの数と各レイヤーの対応も設計対象です。レイヤーの差し替えをEdit側で許したい場合は、該当MediaInの**Layer**を公開します。詳しくは[Resolveで再利用する手順](../../resolve-integration/reusable-fusion-assets)を参照してください。

### 実例：人物名だけ変えられるTitle

~~~text
Text1 → Transform1 → MediaOut1
~~~

まずFusion Compositionで、Text+による文字画像をTransformで配置し、MediaOutへつないで見た目を作ります。次に**Text1とTransform1を選択**してMacro Editorを開きます。Title Templateの作成ではMediaOutを選択に含めません。

公開する項目を**Styled Text（氏名）**、文字色、Transformの**Center（位置）**などに絞れば、編集担当者は内部Graphを開かずに名前と位置だけ変えられます。Title Templateとして保存してResolveを再起動すると、EditのEffects LibraryからTimelineへ配置できます。作成後には別の名前・尺でも文字が正しく表示されるか確認します。

## 保存形式と長さの扱い

**.setting**はMacroや個別Templateの保存に使うファイルです。同じ拡張子でも保存するフォルダーによって利用場所が変わります。Windows・macOS・LinuxのEdit用Template配置先は[保存・配布ガイド](../../resolve-integration/reusable-fusion-assets)に記載しています。

**.drfx**は複数のTemplateや関連アセットを所定のフォルダー構造ごとまとめて配布するBundleです。個別Macroの別名ではありません。インストール時に個々の`.setting`へ展開されるわけではなく、Bundleを削除すると中のTemplateも利用できなくなります。

また、**Templateの長さをEditで変える場合**、固定キーフレームが常に適切に伸び縮みするとは限りません。21.1 ManualではAnim CurvesやKeyframe Stretcherを使い、尺を変えてもアニメーションが成立するよう調整する方法が紹介されています。Transitionの時間制御にはResolve Parameter Modifierを用いる方法があります。実際の作り分けは[再利用ガイド](../../resolve-integration/reusable-fusion-assets)を参照してください。

## 使い回せるかを判断する

作る前と保存後に、次を確認すると失敗を減らせます。

- **Fusion内でまとめたいだけか、Editへ配置したいのか。** Group・Macro・Templateのどれが必要かを選びます。
- **外側の画像が本当に入って出ているか。** 公開端子とMediaIn／MediaOutの選択範囲を確認します。
- **使う人に必要な調整だけが見えるか。** 名前、範囲、並びを試し、内部の構造が変わっても操作が分かるか確認します。
- **別の素材と別の尺でも動くか。** 最初のテスト素材だけで完成としません。

細かなMacro Editor操作は[Macro](../../nodes/utility-io/macro)、意味のある調整項目の作り方は[User Controls](./user-controls)、Graphをまとめるだけなら[Group](./groups)を参照してください。式で複数の値を連動させる場合は[Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)も参考になります。

## 次に読む

→ [データ領域（data domain）を辿って診断する](../07-debugging/trace-data-domain)

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）**を基準としています。

- Chapter 67「Node Groups, Macros, and Fusion Templates」**pp.1429–1434**：Groupの保存・再利用、Macro Editorの公開端子・Control・保存。
- 同章 **pp.1435–1446**：Title／Transition／Generator／Effectの作成手順、MediaIn／MediaOutの扱い、尺の変更。
- 同章 **pp.1447–1449**：Media Drop Zone、Templateアイコン、.drfx Bundleと削除時の注意。
- [Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

例は21.1 Manualの機能を組み合わせて説明したものです。全OS・Editionやすべての端子型について実機検証したものではないため、`verification: partial`を維持しています。
