---
title: "Sticky Note"
description: "FusionのNode Editorに作業メモや引き継ぎ事項を残す注釈。画像処理やノード間の接続は行わない。"
doc_type: node
term_id: "sticky-note"
term_short: "Sticky Noteは、FusionのNode Editorに説明や作業メモを置くための注釈。映像の処理経路には入らない。"
verification: partial
aliases: ["Sticky Note", "NTE"]
concepts: ["graph-as-flow"]
nodes: ["Sticky Note"]
node_family: "utility-io"
tasks: ["graph-organization"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-15"
---

# Sticky Note

**Sticky Noteは、FusionのNode Editor（ノード同士の接続を編集する画面）に文章を残すための注釈です。** たとえば、特定のマスクを作った理由、クライアントからの修正指示、後日確認するフレーム番号を、関係する処理の近くへ書いておけます。

Effects LibraryではToolとして扱われますが、通常の画像処理ノードとは異なります。**Sticky Note自体は映像を加工せず、レンダリング結果にも現れません。** Blackmagic Designの21.1 Reference Manualでも「実際にはノードではない」と説明されています。

## 入力・出力と配置場所

Sticky Noteには、画像やMaskを流すための入出力接続はありません。既存のノードの間に挿入したり、後段のノードへ接続したりするものではありません。

たとえば人物の背景を差し替える次の処理があるとします。

```text
MediaIn → Delta Keyer → Matte Control → Merge → MediaOut
             ↑
      この付近にSticky Noteを置く
```

「キーの境界を確認する」「背景の色に合わせて髪の毛を調整する」といった説明をDelta Keyerの近くへ置いても、**映像の流れはMediaInからMediaOutまでの接続だけ**で決まります。

Sticky NoteはNode Editorの背景上に置かれるもので、特定のノードへの接続や追従を意味しません。関連するノード群をまとめて移動したい場合は、[Underlay](./underlay)を使います。

## 作成と編集

DaVinci Resolve 21.1 Reference Manualに記載された基本操作は次のとおりです。

1. **作成**：Node Editorの空白部分をクリックし、Shift＋SpaceでSelect Toolを開きます。「sticky」と入力してSticky Noteを選びます。Effects Libraryから追加する方法もあります。
2. **展開**：小さく折りたたまれたSticky Noteをダブルクリックすると、文章を編集できる大きな黄色の箱になります。
3. **本文編集**：展開した箱の本文部分をクリックして文字を入力します。タイトルを変更する操作とは別です。
4. **名前の変更**：右クリックして「Rename」を選ぶか、Sticky Noteを選択してF2を押します。見出しに「Matte調整」「要確認」などと付けると探しやすくなります。
5. **位置と大きさ**：タイトル部分をドラッグすると移動できます。展開状態では辺や角をドラッグして大きさを変えられます。
6. **折りたたみ**：左上の小さな閉じるアイコンを押すと、本文を残したまま小さな表示に戻ります。**折りたたみは削除ではありません。**
7. **削除**：右クリックの「Delete」か、選択した状態でDeleteキーを使います。これはSticky Noteを取り除く操作です。

右クリックのメニューでは、色の変更、コピー、編集を防ぐロックも扱えます。**ロックされている場合は本文を編集できません。** 解除してから修正します。

### Effects Libraryの表記について

21.1 Manual内では、Sticky Noteの追加場所がChapter 66では「Tools > Node Editor」、Chapter 100では「Tools > Flow」と記載されています。カテゴリ表示の表記に差があるため、このページではどちらか一方を現行UIの唯一の名称として固定しません。見つからない場合は、Select Toolで「Sticky Note」を検索してください。

## 制作例：背景差し替えの修正指示を残す

人物をキーイングして別の背景へ合成するショットを想定します。Delta Keyerで人物を抜き、Matte Controlで輪郭を調整し、Mergeで背景へ重ねています。

このGraphのキーイング部分にSticky Noteを置き、タイトルを「人物Matte・引き継ぎ」にします。本文には、たとえば次のように書きます。

> 髪の毛の輪郭は逆光に合わせて少し柔らかくする。フレーム130付近で背景の赤が抜けに回り込まないか確認。キーの調整後、Mergeの結果もViewerで見る。

次に編集する人は、その文章を読んで、**どのノードを、何のために、どのフレームで確認すればよいか**を判断できます。単に「Matte修正」と書くより、確認条件まで記す方が実作業に使えます。

ただし、Sticky Noteを置いてもマスクが自動で修正されるわけではありません。指示に沿った調整は実際のノードで行います。また、修正作業の完了状態を管理する専用のタスク管理機能ではありません。

## Underlay・Group・コメントとの使い分け

| 機能 | 何のために使うか | 画像・接続への影響 |
| --- | --- | --- |
| **Sticky Note** | 作業理由、注意点、引き継ぎ内容を文章で残す | なし |
| [Underlay](./underlay) | 関連ノードを色付きの枠で囲い、見た目と配置を整理する | 元の処理は変わらない |
| [Group](./group) | 複数ノードをひとまとめにして、内部の処理を整理する | 内部の接続に応じて外部との入出力をまとめる |
| [Macro](./macro) | 複数の処理を、公開するControlを選んだ再利用Toolにする | 実際に画像処理を行う |
| [Pipe Router](./pipe-router) | 長い接続線の経路を曲げ、Graphを読みやすくする | レンダリング結果は変えない |

Inspectorの**Commentsタブ**も注記に利用できます。特定の処理の近くへ目立つ説明を置きたいときはSticky Note、ノード自体に説明を付けたいときはCommentsタブ、工程単位の配置を整えたいときはUnderlay、と目的で分けると整理しやすくなります。

## 注意点

- Sticky Noteは図の上に置く文章です。通常のノードのように「Source → Sticky Note → MediaOut」と接続する説明は誤りです。
- 遠くへノードを移動すると、Sticky Noteだけが元の場所に残ることがあります。処理を組み替えた際はメモの位置と内容も確認します。
- 説明が古いまま残ると判断を誤らせます。ノード構成や修正方針を変えた際は、関係する注記も更新します。
- 文字数を増やすことより、対象ノード、理由、確認する条件を明確にすることを優先します。

## 出典・確認範囲

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）**

- Chapter 66「Working in the Node Editor」**pp.1416–1417**、「Using Sticky Notes」：作成、展開、本文編集、Rename、サイズ変更、折りたたみ、削除。
- Chapter 100「Flow Nodes」**p.2347**、「Sticky Note [NTE]」：注釈としての役割、タイトルバーでの移動、コピー・色・ロックと編集条件、Commentsタブとの関係。
- 公式配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。
- 関連カテゴリ：[I/O・Graph Utility一覧](./)。

これらは21.1 Manualに記載された操作です。端子を持つ画像処理ノードではないため、未確認のInspectorパラメータ表を補っていません。OS別の操作差や現行実機のEffects Library表示は確認していないため、`verification: partial`を維持します。
