---
title: Formula
description: KrokodoveのFormulaを、Custom ToolをModifierとして利用する機能として整理。Text+との関係、確認できる範囲、検証方法を説明。
doc_type: node
term_id: formula
term_short: Custom ToolをModifierとして利用するKrokodoveの機能。式の入力仕様や適用先は実機確認が必要。
verification: partial
aliases: [Formula]
concepts: [parameter-data]
nodes: [Formula]
node_family: krokodove
inputs: [parameter]
outputs: [parameter]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-21'
---

# Formula（Krokodove）

**Formulaは、Custom ToolをModifierとして利用するKrokodoveの機能です。** DaVinci Resolve 21.1 Reference Manualでは「Text Modifiers」の一つとして紹介されています。ここでいうModifierは、映像のピクセルを直接加工するノードではなく、文字などの設定値を扱う仕組みです。

公式マニュアルのFormula固有の説明は短く、式の書き方、入力の数、返せる値、Inspectorの項目は掲載されていません。「Formula」という名前だけで、任意の計算式をText+の文字欄に入力できる、とまでは判断できません。

## 先に知っておくこと：ノードとModifierの違い

Fusionの<Term id="parameter-data">パラメータ</Term>は、文字列、位置、サイズなど、ノードの動作を決める値です。Modifierはその値を固定入力だけに頼らず、別の仕組みから供給したり変化させたりするために使います。

例えば[Text+](../generators/text-plus)は文字を画像として描くノードですが、その文字列を保持する「Styled Text」は画像入力端子ではなく設定項目です。Text+の画像をMergeへ送る操作と、Styled TextにModifierを適用する操作は別です。

    Text+ ──（生成された文字画像）──→ Merge → MediaOut
      └─ Styled Textなどの設定値
           └─ Modifierによって値を決める

この図は**Modifierの役割を示す概念図**であり、Formula固有の正式な接続図ではありません。Formulaをどの設定項目に直接適用できるかは実機で確認する必要があります。

[パラメータの値がどこから来るか](../../learn/05-time/modifier-parameter-sources)も参照してください。

## Formulaは何に使うものか

21.1 Manualから確実に言えるのは、KrokodoveのFormulaが**Custom ToolをModifierとして使うもの**であり、Text Modifiersの一覧に載っていることです。

Custom Toolは、Fusionに別途存在する画像処理ノードです。こちらは入力画像を使い、式で画像の各成分を計算できます。公式マニュアルでは、通常のCustom Toolに3つの画像入力があり、数値・位置なども計算に利用できると説明されています。

ただし、**Custom Toolノードの全機能がFormula Modifierへそのまま移植されているとは限りません。** 特に、Custom Toolで使える画像入力、変数名、出力チャンネル、式の評価タイミングを、そのままFormulaの仕様として扱わないでください。

## 入力・出力と確認範囲

| 観点 | 現在の確認内容 |
| --- | --- |
| 機能の位置づけ | KrokodoveのText Modifierに分類される |
| 処理の考え方 | Custom ToolをModifierとして使用する |
| 入力・出力の分類 | COLLECTANEAでは暫定的に `parameter` として整理 |
| 正式な接続名・入出力数 | 21.1 ManualのFormula個別説明では未確認 |
| Inspectorの項目・数式の構文 | 未確認 |
| 戻り値のデータ型 | 文字列・数値などの対応範囲は未確認 |
| 対応するTextノード・エディション | 実機未確認 |

Frontmatterの`inputs: [parameter]`と`outputs: [parameter]`は記事を分類するためのデータです。**Formulaの画面に「Parameter」という端子があることを意味しません。**

## 運用例：どの値を操作できるか確かめる

以下は実機でFormulaの動作を切り分けるための手順です。公式マニュアルが提供するFormula専用チュートリアルではありません。

1. 新しいFusion CompositionにText+を配置し、まず固定の「TEST」が表示されることを確認します。変更前の状態を残せるようにします。
2. 21.1 Manualに記載された一般的なText+ Modifierの操作に従い、InspectorのStyled Text欄を右クリックします。**Formulaが実際に選択肢に現れるか**を先に確認します。見当たらない場合は、それ以上の操作手順を推測しません。
3. Formulaを適用できた場合はModifiersタブを開き、表示された設定項目名・初期値・入力欄の種類を確認します。通常のCustom Toolと同じ項目が並ぶと決めつけず、実際のUIを記録します。
4. 入力欄に数式を記述できることを確認できた場合のみ、UIの説明に従い、変化しない最小の値を返す式から試します。構文が未確認のため、このページでは動作を保証できない式を提示しません。
5. 結果が得られたら時間を動かし、値の変化と文字表示の変化を別々に観察します。入力した式が毎フレーム評価されるか、文字列へ変換されるかは、この結果をもとに判断します。
6. 最後に、Formulaを外した状態と同じフレームを比べます。どの設定値が変更され、ほかの文字属性に影響したかを記録します。

「何を入力したか」「Inspectorでどこに適用したか」「どの値が返ったか」を分けて記録すると、単なる表示変化からFormulaの仕様を推測する危険を減らせます。

## 主な用途の考え方

### 文字列の生成・切り替えを検討するとき

文字を一定の規則で変えたい場合、Formulaは検討対象になります。ただし**計算結果を文字列として返せるかは未確認**です。既に内容が決まっている複数の行を順に表示するだけなら、[From File](./from-file)の役割のほうが明確です。

### 数式で時間や別の値を扱いたいとき

一定の速度で数値を変える、別のパラメータを参照する、といった処理を考えるときは、Formulaと標準の[Expression Modifier](../modifiers/expression)を区別します。後者はNumber・Pointなどの値を式で組み合わせる機能として文書化されています。Formulaに同じ入出力や式の書式があると考えず、必要なデータ型と操作対象から選びます。

### 文字の見せ方そのものを変えたいとき

文字が順に打ち込まれるように表示したい場合は[Write](./write)が、文字を不規則に混ぜたい場合は[Juggle](./juggle)が、それぞれ明示された役割を持ちます。Formulaはそれらと同じ効果が得られると確認されたわけではありません。

## 注意点

- **「式が使える」だけでは用途を確定できません。** 式の入力構文、参照可能な変数、戻り値の種類が分からないと、具体的な完成動作は保証できません。
- **通常のCustom Toolとは区別します。** 同名・関連機能であっても、画像端子やチャンネル式がFormula Modifierに存在すると推測しません。
- **Text Modifierの一覧に載っていることと、すべてのText欄に直接適用できることは別です。** 対応ノード、メニュー位置、他Modifierとの併用は実機で確認します。
- **エディション差は未確認です。** Resolve Free、Resolve Studio、Fusion Studioそれぞれについて、一覧表示と使用可否を個別に検証する必要があります。

## バージョンと出典

- **Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）**、Chapter 105「Krokodove Nodes」p.2438。「Text Modifiers / Formula」に、Custom ToolをModifierとして利用する旨の短い説明があります。
- 同Manual Chapter 103「Generator Nodes」p.2395。「Text+ Modifiers」に、Styled Text欄からのModifier追加とInspectorのModifiersタブの一般的な操作が記載されています。
- 同Manual Chapter 111「Miscellaneous Nodes」pp.2583–2585。通常のCustom Toolノードの機能を参照できますが、**Formula固有の入力・Inspector仕様の根拠としては使用していません**。

Formulaそのものの式の文法、正確な端子名、動作する設定項目、利用できるエディションは未確認のため、`verification: partial`を維持しています。[Krokodoveカテゴリ概要](./)も参照してください。
