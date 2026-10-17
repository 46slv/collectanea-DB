---
title: GroupでGraphをまとめる
description: 複数Nodeを一つにまとめ、外部との接続と内部編集を保ちながらGraphを整理・保存する。
doc_type: concept
term_id: groups
term_short: 複数Nodeを内部Graphを保ったまま1つの構造単位へまとめる仕組み。
verification: partial
aliases: [Group, Node Group]
concepts: [groups, graph-structure, reuse]
tasks: [organize-graph, reuse, reduce-clutter]
prerequisites: [node-graph]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# GroupでGraphをまとめる

FusionのNode Editorで処理が増えると、一本の映像を作るために何十個ものNodeや分岐を追うことがあります。**Groupは、関連するNodeを内部に残したまま、Graph上では一つのまとまりとして表示する機能**です。画像処理を置き換えたり、内部のNodeを消したりするものではありません。

たとえば「ぼかしの後に色を整える」二つのNodeをまとめると、外側からは一つの処理として見られ、必要なときだけ内部を開いて調整できます。Graphの基本的な読み方は[Graphを処理の流れとして読む](../01-flow/graph-as-flow)、端子と線の意味は[入力・出力・接続](../01-flow/inputs-outputs-connections)を参照してください。

## Groupの内側と外側

次のGraphでは、元映像がBlurを通ってぼかされ、その結果がColor Correctorで調整され、最後にMediaOutへ送られます。

~~~text
Group化する前
MediaIn1 → Blur1 → ColorCorrector1 → MediaOut1

Group化した後
MediaIn1 → [ Title Look ] → MediaOut1
                │
                └─ 内部: Blur1 → ColorCorrector1
~~~

この例でGroupの**画像入力**はMediaIn1から来る画像、**画像出力**はColorCorrector1による処理後の画像です。Group自体が新しいぼかしや色変換を計算するわけではなく、内部の二つのNodeがそれぞれ処理します。

Groupには複数のNodeを入れられ、Groupの中に別のGroupを作ることもできます。ひとつのNodeへ押し込んだように見えても、内部の接続関係は残ります。

### 外から見える端子はどう決まるか

**Groupの端子は、内部Nodeが外部Nodeとどう接続されているかに依存します。** DaVinci Resolve 21.1 Manualによると、Group化した時点で外部と接続している内部Nodeの入力はGroup上に表示されます。一方、内部に未接続の入力があっても、Groupの外側へ入力端子として自動表示されるわけではありません。

つまり、Groupは「好きな端子をすべて公開した再利用Tool」ではありません。複数の画像やMaskを受け取る構成なら、まずどの線がGroupの境界をまたぐかを確認します。外部から触る端子やInspector項目を明示的に選び直したい場合は[Macro / Template](./macros-templates)が適しています。

## Groupを作って確認する

前述の「ぼかし＋色調整」を例にします。

1. Fusionページで `MediaIn1 → Blur1 → ColorCorrector1 → MediaOut1` を接続し、まず通常のGraphで映像が表示されることを確かめます。
2. **Blur1とColorCorrector1だけを選択**します。MediaIn1とMediaOut1はGroupの外に残します。
3. 選択中のNodeを右クリックし、コンテキストメニューから **Group** を選びます。二つのNodeが一つのGroupとして表示されます。
4. Groupの前後がMediaIn1、MediaOut1につながっているかを確認します。Viewerの画像はGroup化前と同じであるはずです。
5. Groupをダブルクリックするか、右クリックの **Expand Group** で内部を開きます。Blur1のぼかし量を変え、外側のMediaOut1の画像にも変更が反映されることを確認します。

21.1 Manualでは、開いたGroupは独立したNode Editorのウィンドウとして扱われ、内部でNodeの追加・挿入・削除・接続変更ができます。作業後はそのウィンドウを折りたためば、外側のGraphを再び簡潔に見られます。

この構成を実案件へ応用するなら、背景素材ごとの軽いぼかしと色の統一を一つのGroupにまとめ、ショットの合成全体では「背景の質感を調整する処理」として読めるようにします。Groupの内側でBlurやColor Correctorを調整すれば、外側にあるMergeなどの合成処理を探し直さずに済みます。

## 開く、ばらす、消すは別の操作

Groupを**開く**操作では、内部のNodeを編集できる状態にするだけです。Group自体は残ります。

Groupを**Ungroup**する場合は、Groupを右クリックして **Ungroup** を選びます。囲いだけが外れ、内部Nodeは通常のNode Editorへ戻ります。構成を細かく調べたいときや、今後Group化が不要になったときに使います。

一方で、**Groupを選択してDeleteする場合は、Groupとその内部Nodeをまとめて削除します。** 「整理のために作ったGroupだけを消したい」ならDeleteではなくUngroupを使ってください。これは見た目の違いではなく、処理そのものを失うかどうかの違いです。

## Groupを保存し、別のCompositionで使う

Groupは表示を整理するだけの機能ではなく、内部の設定を保存して別のショットやプロジェクトへ持ち込むこともできます。

- **保存する**：Groupを右クリックし、**Settings > Save As** を選びます。Groupの構成と設定をファイルに保存します。
- **別のCompositionへ読み込む**：保存したファイルをOSのファイルブラウザーからFusionのNode Editorへドラッグします。保存時と同じ内部Nodeを含む新しいGroupが作られます。
- **既存Groupの設定を読み直す**：内部に同じNode群を持つGroupでは、右クリックの **Settings > Load** で保存済み設定を読み込む方法があります。

たとえばグリーンバックの抜き処理を複数Nodeで組んだ担当者が、そのGroupを保存して別の担当者へ渡せます。受け取った側は内部Nodeを開いてMatteを調整し、更新した設定を保存して元の作業へ戻せます。ただし、**一つのGroupを保存しただけで、別ショットへ配置したすべてのGroupが自動同期されるわけではありません。** 保存・読み込みと、[Instanceによるパラメータ共有](./instances)は別の仕組みです。

Fusion Studioには、GroupをBinsへドラッグして保存する方法も公式Manualに記載されています。これは**Fusion Studio側の操作**として案内されているため、Resolve内Fusionでも同じBins操作ができるとは断定しません。通常のSettingsによる保存・読み込みを基本にします。

## Group、Macro、Templateを選び分ける

| やりたいこと | 適する形式 |
| --- | --- |
| 複雑なGraphを読みやすくし、必要なとき内部を直接編集したい | **Group** |
| Node群を再利用し、利用者に見せる画像端子やInspector項目を選びたい | **Macro** |
| 作ったタイトルや効果をEditページのEffects Libraryから配置したい | **Fusion Template** |
| 離れた場所にある同種Nodeの設定を同期したい | **[Instance](./instances)** |

Groupも保存して再利用できます。「保存できるかどうか」だけでMacroと区別しないことが重要です。Macroは公開する端子と操作項目を設計でき、TemplateはさらにEditページでの利用形態を持ちます。詳しい作成手順は[Macro / Templateで再利用単位を作る](./macros-templates)と[ResolveでFusion assetを再利用する](../../resolve-integration/reusable-fusion-assets)を参照してください。

## うまくいかないとき

**Group化後に画像が出なくなった場合**は、まず外側に残したMediaIn・MediaOutとの線を確認します。内部Nodeの入出力とGroup境界の接続は別々に辿れます。内部のどこまで画像が流れているかは、[Viewerで途中結果を見る](../01-flow/intermediate-results-viewer)手順で確認できます。

**外側に必要な入力が見つからない場合**は、内部のその入力がGroup作成時に外部へ接続されていたか確認してください。未接続の内部入力が自動的に外へ出るとは限りません。公開インターフェースを作りたいならMacroのExport設計を検討します。

**Groupが大きくなりすぎて逆に読みにくい場合**は、外から見た役割が一文で説明できる範囲に分けます。単に全Nodeを一つへ集めるより、「背景の前処理」「Matte作成」「合成後の調整」など、処理の境界が分かるまとまりにします。

## 次に読む

- [Macro / Templateで再利用単位を作る](./macros-templates)
- [User Controlsで公開インターフェースを作る](./user-controls)
- [画像を段階的に重ねる](../../patterns/compositing/stack-images-with-merge)

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月8日公開）**を基準としました。

- **Chapter 67「Node Groups, Macros, and Fusion Templates」pp.1427–1429**：Groupの作成、接続に応じた端子、内部編集、UngroupとDeleteの違い、保存・再利用、Fusion StudioのBins。
- **Chapter 101「Flow Organizational Nodes」p.2350**：Groupの展開、内部編集、Ungroupの操作。
- [Blackmagic Design公式Support Center](https://www.blackmagicdesign.com/support/)：21.1 Manualの公開情報。

操作名と動作の説明は公式Manualを根拠にしています。Resolve 21.1の全OS・全Editionで実機操作を再検証したものではないため、`verification: partial`を維持します。
