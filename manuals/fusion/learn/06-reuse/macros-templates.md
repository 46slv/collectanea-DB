---
title: Macro / Templateで再利用単位を作る
description: 完成したGraphを、公開controlを持つ再利用可能なbundleとして扱う。
doc_type: concept
term_id: macros-templates
term_short: Graphと公開controlを再利用可能なbundleとして扱う仕組み。
verification: partial
aliases: [Macro, Template, Fusion Template]
concepts: [macros, templates, public-interface, reuse]
tasks: [reuse, package-graph, expose-controls, template]
prerequisites: [groups, user-controls, expressions]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion, edit]
---
# Macro / Templateで再利用単位を作る

## このページで分かること

複数Nodeの処理を別compositionやEdit Pageから使える単位にするとき、何を固定し、どのcontrolを公開するかを整理します。

## 基本の考え方

Macro / Templateは、**Graph内部の実装をbundle化し、利用者へ必要なinput / output / controlだけを公開する**再利用境界です。

```text
internal graph
   ↓
choose public inputs / outputs / controls
   ↓
Macro
   ↓
save / reuse
   ↓
Template when exposed to Resolve workflows
```

Blackmagic Designの現行DaVinci Resolve Fusionページでは、複数Nodeを選択してMacroを作成し、Edit Pageへ表示するcontrolを指定して独自templateとして再利用できることが案内されています。Resolve 21の新機能ページでもMacro EditorのInspector view更新が案内されています。

## 最小例

```text
Text+ → Transform → Merge
```

この3 Nodeを内部構造として持つtitleを考えます。

利用者に必要なのが

- text
- color
- position

だけなら、内部の全パラメータを公開せず、この3つをpublic インターフェースとして選びます。

## 共通ルール

- 再利用単位の目的を1文で説明できる。
- 公開controlは利用者の意思を表す。
- 内部Nodeの変更が外部インターフェースを不用意に壊さない。
- MacroにすることとEdit Page用Templateとして配布することを分けて考える。
- 保存場所・template種別・host境界はversion依存なので現在の manualを確認する。

## 1つずつ変えて確認する

内部Nodeを1つ変更し、public インターフェースを変えずに結果だけ改善できるか考えます。

それが可能なら、Macro境界が内部実装と利用インターフェースを分離できています。

## 他のNodeにも応用する

### Titles

Styled Textや色、配置だけを公開し、内部アニメーション graphを隠せます。

### Generators

背景やgraphic systemの意味パラメータだけを公開できます。

### Transitions

transitionの内部処理をbundle化し、Edit Pageへ必要なcontrolだけを露出できます。

## 初見のNodeを読む

Macro化する前に次を決められます。

1. external input / outputは何か。
2. userが変更すべきcontrolは何か。
3. internal implementationとして隠すものは何か。
4. <Term id="groups">Group</Term>で十分か、保存Macroが必要か。
5. Resolveのどのsurfaceから使うか。

## よくある誤解

**Macro = 複数Nodeを閉じただけの<Term id="groups">Group</Term>**と考えること。

Macroでは、どのinput / output / controlを公開するかというインターフェース設計が重要です。公開面が不要で、内部を頻繁に開きたいだけならGroupの方が適切な場合があります。

## 関連パターン

- [Expressionで値の関係を保つ](../../patterns/automation/link-values-with-expression)

## 関連Node

Macro / Templateは複数Nodeをbundle化するauthoring / distribution機構です。

## 次に読む

→ [データ領域（data domain）を辿って診断する](../07-debugging/trace-data-domain)

---
検証メモ: Macro作成、公開control選択、Edit Page用templateへの利用は2026-10-02時点のBlackmagic Design現行Fusionページで確認。詳細な保存path・template種別は21.1 Manualで個別確認します。
