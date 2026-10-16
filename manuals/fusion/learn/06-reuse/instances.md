---
title: Instanceで設定を共有する
description: Paste InstanceでNode設定を同期し、Deinstance／Reinstanceで個別の調整を行う方法。
doc_type: concept
term_id: instances
term_short: 同種のNodeで設定を共有し、必要なパラメータだけ独立させられる関係。
verification: partial
aliases: [Instance, Paste Instance, Deinstance, Reinstance]
concepts: [instancing, shared-parameters, reuse]
tasks: [reuse, synchronize, branch]
prerequisites: [parameter-data, node-graph]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# Instanceで設定を共有する

二つの素材へ同じ色補正やぼかしをかけたいとき、Nodeを普通にコピーすると、後から片方の値を変えても、もう片方には反映されません。**Instanceは、Graph上では別々のNodeを置きながら、その設定を連動させる方法**です。

ただし、映像の入力元やNodeの接続先まで一つになるわけではありません。異なる映像をそれぞれのNodeへ通しながら、複数のInspector項目を同じ値に保てます。画像を運ぶ接続線については[入力・出力・接続](../01-flow/inputs-outputs-connections)を参照してください。

## 普通のCopyと何が違うか

通常のコピーでは、コピーした時点の設定が新しいNodeに複製されます。その後の設定変更は互いに独立しています。

**Paste Instance**で貼り付けたNodeは、元Nodeと設定を共有します。元Nodeだけでなく、Instance側で共有中のパラメータを変更しても、その変更は元Nodeと他のInstanceへ反映されます。

~~~text
通常のCopy
Blur1（Sizeを変更）       Blur2（コピーした時の値のまま）

Paste Instance
Blur1（Sizeを変更） ── 設定を共有 ── Instance_Blur1（同じSize）
~~~

これは**設定の共有**であって、画像を一度だけ処理して複数のNodeに同じ出力を渡す機能ではありません。別々の画像を入力した場合、それぞれのNodeが自分の画像を受け取り、共有している設定で処理します。

## 作り方：Paste Instance

DaVinci Resolve 21.1のNode Editorで次のように操作します。

1. 元になるNodeを選んで **Copy** します。
2. Node Editorの空白を右クリックし、**Paste Instance** を選びます。元Nodeと接続されていないInstanceができるので、必要な画像入力と出力先を自分で接続します。
3. 既存の流れの途中へ挿入する場合は、**接続線を右クリックしてPaste Instance** を選ぶ方法があります。上流Nodeを選んでからPaste Instanceする方法もManualに載っています。
4. 元NodeとInstanceのInspectorを表示し、一方の共有中の値を変更してもう一方へ反映されることを確認します。

作成されたInstanceの名前は **Instance_NameOfNode** という形です。Blur1を複製した場合の例は **Instance_Blur1** です。複数のInstanceでは番号が付く場合があります。

Manualのショートカット表記はCommandキー基準です。OS別のキーを推測せず、ここではコンテキストメニューでの操作を基準にしています。

### 緑の線は画像の接続ではない

元NodeとInstanceの間には、設定共有を表す**緑のリンク線**が表示されます。これは映像やMaskの画像データを運ぶ線ではありません。

Graphが混み合ったときは、Node Editorの空白を右クリックし **Options > Show Instance Links** でリンク線の表示を切り替えられます。**非表示にしても設定共有は解除されません。** 関係を確認したいときは、共有中の値を変えて両方に反映されるか見ます。

## 実例1：二つの映像に同じぼかしをかける

異なるカメラからの二つの映像を、それぞれ同じ値でぼかす構成です。

~~~text
MediaIn1 → Blur1 ────────────────→ Merge1（Background）
                                           ↓
MediaIn2 → Instance_Blur1 ───────→ Merge1（Foreground）
                                           ↓
                                         MediaOut1
~~~

まずBlur1でぼかし量を決め、Paste Instanceで二つ目のBlurを作ります。各MediaInから異なる画像を入力し、処理後の画像をMergeのBackgroundとForegroundへ渡して合成します。

元のBlur1でSizeを変更すれば、もう一方のInstanceにも設定が反映されます。**ただし、解像度や被写体の細部が異なれば、同じ値でも見た目のぼけ方は同一とは限りません。** 各Viewerで両方の結果を確認します。また、二つの画像を一枚に重ねることはInstanceの成立条件ではなく、Mergeはこの作例の出力先にすぎません。

## 実例2：拡大率を共有し、位置だけ分ける

二つの映像を左右へ別々に配置しながら、拡大率だけは同時に変更したい場面を考えます。

~~~text
MediaIn1 → Transform1 ────────────→ Merge1（Background）
MediaIn2 → Instance_Transform1 ──→ Merge1（Foreground）
                                      ↓
                                    MediaOut1
~~~

1. **Transform1**を用意し、Paste Instanceで**Instance_Transform1**を作ります。それぞれ異なる映像を入力します。
2. Instance側のInspectorで **Center** の項目名または値を右クリックし、**Deinstance**を選びます。これでそのパラメータだけ共有を外します。
3. 両方のCenterを別々の位置へ調整します。一方、**Size**などDeinstanceしていない項目は共有を保ちます。
4. 元のTransform1のSizeを変更し、拡大率だけが連動すること、Centerの配置は別々のままであることを確かめます。

この方法では、**共通にしたい値だけ同期し、個別の値は分ける**という構成にできます。ここでのCenterはTransformの画面内位置です。ほかの種類のNodeに同じ名前の項目があっても、同じ働きとは限りません。

## DeinstanceとReinstance：切り離す範囲が違う

21.1 Reference Manualは、**Node全体の共有を解除する方法**と、**特定のパラメータだけを切り離す方法**を区別しています。

| 操作 | 対象 | 結果 |
| --- | --- | --- |
| Nodeを右クリック → **Deinstance** | Node全体 | 元Nodeや他Instanceから独立する |
| Inspectorの項目名または値を右クリック → **Deinstance** | そのパラメータ | その値だけ独立し、ほかの項目は連動し続ける |
| Inspectorの項目名または値を右クリック → **Reinstance** | 個別に切り離したパラメータ | 共有へ戻し、**元Nodeの設定値を引き継ぐ** |

**Node全体をDeinstanceした後で、その同じNodeをReinstanceして元の関係へ戻すことはできません。** Undoできる状態なら操作を取り消せます。Undoできなくなった場合は、元NodeをCopyして新たにPaste Instanceします。

一方、**パラメータ単位**のDeinstanceは、後でその項目をReinstanceできます。ただしReinstanceすると、ローカルで調整していた値を保ったまま関係が戻るのではなく、**元Nodeの現在の設定値を受け継ぎます**。個別値が必要なら再接続する前に記録しておきます。

### 意図せず設定が連動するとき

まず緑のリンク線を表示し、どのNodeがInstanceか調べます。線がないように見えても、**Options > Show Instance Links** で非表示になっている可能性があります。

次に独立させたいのがNode全体なのか、一つのパラメータだけなのかを決めます。位置だけ個別に変えたいなら、そのパラメータをDeinstanceすれば、ほかの共通設定は残せます。独立させるために緑の線の表示を切り替えても、共有状態そのものは変わりません。

## Group・Macro・Expressionとの使い分け

| 目的 | 適する仕組み |
| --- | --- |
| 同じ種類のNodeを複数置いて、設定を一括調整する | **Instance** |
| 複数NodeのGraphをまとめ、必要なら内部を編集したい | [Group](./groups) |
| Node群を再利用し、外へ出す入力・出力や操作項目を設計する | [Macro](./macros-templates) |
| 別の種類のNode間でも特定の値を関連付けたい | [Expression](../../patterns/automation/link-values-with-expression) |
| Nodeに独自のInspector項目を追加したい | [User Controls](./user-controls) |

Instanceは複数の**Nodeの接続構造**までまとめて同期する仕組みではありません。複数Nodeを一つのまとまりとして扱う場合は、GroupやMacroを検討します。逆に、同種Nodeの多くの値を連動させたいだけなら、個々の項目をExpressionで結ぶよりPaste Instanceが簡潔な場合があります。

## 次に読む

- [Graphを処理の流れとして読む](../01-flow/graph-as-flow)
- [GroupでGraphをまとめる](./groups)
- [Macro / Templateで再利用単位を作る](./macros-templates)
- [User Controlsで公開インターフェースを作る](./user-controls)

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）**を根拠としています。

- **Chapter 66「Working in the Node Editor」pp.1413–1414、「Instancing Nodes / Using Instanced Nodes」**：通常Copyとの違い、Paste Instance、命名、緑のリンク線、Show Instance Links。
- **同章 p.1414「De-Instancing and Re-Instancing Specific Parameters」**：Node全体のDeinstanceとUndo、パラメータ単位のDeinstance／Reinstance、元Nodeの値への復帰。
- [Blackmagic Design公式Support Center](https://www.blackmagicdesign.com/support/)：21.1 Reference Manualの入手先。

制作例はManual記載の機能を組み合わせて構成したものです。各OS／Editionの実機操作を独立に検証したわけではないため、`verification: partial`を維持しています。
