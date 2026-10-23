---
title: "Underlay"
description: "FusionのNode Editorで関連ノードを色付きの枠にまとめ、折りたたまずに配置と移動を管理する。"
doc_type: node
term_id: "underlay"
term_short: "UnderlayはNode Editor上のノード群を色付きの枠で囲い、位置関係を整理するための機能。画像処理や入出力の変更はしない。"
verification: partial
aliases: ["Underlay", "Underlay Box"]
concepts: ["graph-as-flow"]
nodes: ["Underlay"]
node_family: "utility-io"
tasks: ["graph-organization"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-15"
---

# Underlay

**Underlay（Underlay Box）は、FusionのNode Editorで関連するノードを色付きの長方形で囲う整理用の機能です。** たとえばトラッキング、マスク作成、合成という工程を色の異なる枠に分ければ、ノードを折りたたまなくても、それぞれの担当範囲を見分けられます。

囲った範囲のノードをまとめて移動することもできます。ただし、Underlayは画像・Mask・3D Sceneなどのデータを加工するノードではありません。**Underlayを追加しても既存の画像処理、接続順序、最終出力は変わりません。**

## 入力・出力とGraph上の役割

UnderlayにImageやMaskを入力し、加工後の画像を出力するような接続は行いません。Node Editor上でノードの背面に置き、**どのノードを同じ工程として扱うか**を位置によって示します。

たとえば次の接続があるとします。

    MediaIn → Tracker → Transform → Merge → MediaOut

TrackerとTransformをUnderlayで囲っても、信号は元の接続を通ります。UnderlayがTrackerとTransformの間に入ることはありません。元記事にあった「Source → Underlay → downstream」という構成は誤りなので、ここでは使用しません。

Underlayにノードを収めた状態で箱のタイトルバーをドラッグすると、箱と内部ノードを一緒に移動できます。ノード間のつながりは維持されるため、複雑になったGraphの配置替えに向いています。

## 作成する

DaVinci Resolve 21.1 Reference Manualでは、次の2通りを説明しています。

1. **空のUnderlayを置く**：Node Editorの空き領域をクリックし、Shift＋SpaceでSelect Toolを開き、「under」と入力してUnderlay Boxを選びます。Effects Libraryの「Tools > Node Editor」から追加する方法もあります。
2. **選択済みノードを囲う**：先に囲いたいノードを複数選択し、同じSelect ToolからUnderlay Boxを追加します。この場合、選択したノードを囲む大きさのUnderlayが配置されます。Effects Libraryからの追加も可能です。

空のUnderlayを置いた場合は、囲いたいノードを内側へ移動するか、箱の大きさを調整してノードが収まるようにします。箱は辺や角をドラッグしてリサイズできます。

## 名前と色を付ける

- **名前**：Underlayの箱だけを選択し、右クリックの「Rename」、またはF2で変更します。工程名を付けると、長いGraphでも目的を探しやすくなります。
- **色**：箱だけを選択して右クリックし、「Set Color」から色を選びます。たとえばマスク作成を青、合成を緑、最終調整を黄というように使い分けられます。
- **選択の注意**：公式Manualは、内部ノードを選ばずUnderlayだけを選択する操作を「Option-click」と記載しています。キー表記は使用OSや操作環境の違いに注意し、**箱だけが選択されていることを確認してから**Rename・Set Color・Deleteを行ってください。

名前と色は整理のための情報です。映像の色、ノードのパラメータ、レンダリング結果に影響する設定ではありません。

## ノードを出し入れする・移動する

**箱へ追加する場合**は、十分な広さのUnderlayの内側へノードをドラッグします。または、既存ノードを囲うようにUnderlayを広げます。Manualでは、箱に収まるサイズが必要と説明されています。

**まとめて移動する場合**は、内部ノードとUnderlayの選択を解除した状態から、箱のタイトルバーをドラッグします。箱の中のノードが一緒に移動します。個別のノードの配置を調整するときは、移動させたいノード自体を選択してください。

**箱から外す場合**は、対象ノードを選んで外へドラッグします。また、Underlayを小さくしてノードが箱から外れる状態にする方法もManualに記載されています。これはGroupのUngroupとは異なり、ノードの接続構造を変える操作ではありません。

### 削除時は内部ノードに注意

Underlayを選択してDeleteすると、**箱の中にあるノードも一緒に削除される操作**がManualに記載されています。飾りの枠だからといって、選択状態を確認せずに削除しないでください。

内部ノードを残して**Underlayだけ削除する**には、箱だけを選択してからDeleteします（ManualではOption-clickで箱のみを選択）。安全を優先するなら、先に必要なノードを箱の外へ移してからUnderlayを消す方法もあります。

## 制作例：人物の背景差し替えを工程ごとに整理する

人物の背景を差し替えるFusionコンポジションを考えます。MediaInから人物素材を読み込み、MaskやKeyerで人物を切り抜き、別の背景とMergeで合成し、最後に色を合わせます。

このとき、次のようにUnderlayを分けると、ノードを全部表示したまま工程を把握できます。

1. 人物の切り抜きに関係するMask・Keyer・マット調整ノードを「01 Matte」というUnderlayで囲います。
2. 背景素材のTransformやMergeを「02 Composite」という別のUnderlayで囲います。
3. 合成後のColor Correctorなどを「03 Finishing」で囲います。
4. あとからキーの輪郭を調整するときは「01 Matte」を見つけて内部のノードを直接編集します。Graphが混雑していれば、Underlayのタイトルバーから工程全体の配置を移して余白を作ります。

ここで重要なのは、**Underlayを追加しても切り抜きや合成を実行する処理が増えるわけではない**ことです。実際の映像は各ノードで処理され、Underlayは見やすさと配置のためだけに使います。

## Underlayを使った移動・検索

UnderlayはNode Editorの**Bookmarkにも自動的に登録**されます。大きなGraphでは、Optionsメニューや「Go To Bookmarks」からUnderlayの位置へ移動できます。これは単に色を付けるだけではない利点です。

Manualによれば、Go To Bookmarksダイアログの「Show Underlays」をオフにすると、Underlayはブックマーク一覧とOptionsメニューに表示されなくなります。Underlayそのものや内部ノードが削除されるわけではありません。

## Group・Macro・Sticky Noteとの違い

| 機能 | 適した目的 | 接続や処理への影響 |
| --- | --- | --- |
| **Underlay** | ノードを展開したまま色分けし、まとまった範囲を移動する | 元の処理や接続は変えない |
| [Group](./group) | 複数ノードを1つの箱として折りたたみ、内部を開いて編集・再利用する | 内部ノードの接続に応じて外部端子をまとめる |
| [Macro](./macro) | 複数ノードを再利用し、公開するControlを選ぶ | 選択したControlや入出力を使い手に提供する |
| [Sticky Note](./sticky-note) | 判断理由や作業メモをGraph内へ書き残す | 画像処理を行わない |
| [Pipe Router](./pipe-router) | 長い接続線の経路を整理する | 接続線の見通しを改善する |

見えているノードの配置を整理するならUnderlay、折りたたんで内部を隠したいならGroup、別のコンポジションで使いやすいToolを作るならMacroを選びます。

## 出典・確認範囲

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）**

- Chapter 66「Working in the Node Editor」**pp.1417–1418**, 「Using Underlay Boxes」：作成、サイズ・名前・色の変更、ノードの出し入れ、まとめて移動、内部ノードを残す削除方法。
- Chapter 66 **p.1384**, 「Using Underlays as Bookmarks」：UnderlayのBookmark登録、Options / Go To Bookmarksでの移動、Show Underlays。
- 公式配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。
- 関連カテゴリ：[I/O・Graph Utility一覧](./)。

21.1 Manualに説明されているNode Editor操作を根拠にしています。OSごとの修飾キー表記、内部Registry ID、詳細なInspector属性の21.1実機確認は行っていないため、verificationはpartialを維持します。
