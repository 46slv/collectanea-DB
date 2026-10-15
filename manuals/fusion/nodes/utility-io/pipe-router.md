---
title: "Pipe Router"
description: "Fusionの接続線を曲げ、分岐点を整理する中継ノード。画像を加工せずGraphを読みやすくする。"
doc_type: node
term_id: "pipe-router"
term_short: "Pipe RouterはFusionの接続線に途中点を作り、線の経路と分岐を整理する中継ノード。映像そのものは加工しない。"
verification: partial
aliases: ["Pipe Router", "Router"]
concepts: ["graph-as-flow"]
nodes: ["Pipe Router"]
node_family: "utility-io"
tasks: ["route-data", "graph-organization"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-15"
---

# Pipe Router

**Pipe Router（Router）は、FusionのNode Editorで接続線の通り道を整理するための中継ノードです。** ノードが増えて接続線が交差したり、無関係なノードの上を横切ったりするとき、途中にRouterを置いて経路を曲げられます。

Routerは画像を加工するためのノードではありません。接続線を整えても映像の色、形、マスクは変わらず、**Router自体はレンダリング時間にも影響しません**。ただし、Routerは単なる背景の線ではなく、接続上に置かれたノードなので、入力・出力と分岐点を持ちます。

## 入力・出力と役割

DaVinci Resolve 21.1 Reference Manualでは、Routerは**入力1つ、出力1つ**の小さなノードとして説明されています。

- **入力**：前段ノードの出力から接続を受け取ります。
- **出力**：後段のノードへデータを渡します。ひとつの出力から複数の後段へ接続を伸ばすこともできます。「出力端子が複数ある」という意味ではありません。
- **Inspector**：画像処理用のパラメータはなく、接続の意図などを書き残す**Comments**欄があります。

たとえば、次のどちらでもBlurへ渡る画像の意味は同じです。

```text
MediaIn1 ──────────────→ Blur1 → MediaOut1

MediaIn1 → Router1 ────→ Blur1 → MediaOut1
              ↑
       位置を動かして線を迂回
```

Routerを追加しただけでBlurの強さは変わりません。RouterはLoaderのようにファイルを読み込むものでも、Mergeのように複数画像を合成するものでもありません。

もうひとつの用途は**分岐を見やすい場所に集めること**です。

```text
                     ┌→ ColorCorrector1 → …
MediaIn1 → Router1 ──┤
                     └→ Blur1 ─────────→ …
```

同じ素材を2系統へ渡せますが、それぞれの加工はColor CorrectorとBlurが行います。Routerに「コピー枚数」や「合成率」の設定があるわけではありません。分岐後の結果を重ねたい場合は、さらにMergeなどへ接続します。

なお、21.1 Manualに記載された入出力の個数は確認済みですが、接続可能なすべてのData Domainや内部Registry IDを実機で網羅確認したわけではありません。Routerそのものを画像からMaskへの変換器とみなさず、接続先が必要とするデータの種類を確認してください。

## 追加・移動・分岐・削除

21.1 Manualで確認できる基本操作は次のとおりです。

1. **線の途中に追加**：既存の接続線を、Windowsでは**Altクリック**、macOSでは**Optionクリック**します。クリックした箇所にRouterが入ります。
2. **線を曲げる**：Routerをドラッグして、ほかのノードや接続線を避ける位置へ動かします。前後の接続線はRouterを経由して描き直されます。
3. **分岐する**：Routerの出力から、追加のノードの入力へドラッグして接続します。同じ出力から必要な数だけ枝を伸ばせます。
4. **コメントを付ける**：Routerを選んでInspectorの**Comments**欄に入力します。「人物Matteを作る枝」「背景の色調整へ分岐」など、後から接続を辿る人が理解できる内容が適しています。
5. **削除する**：Routerを選択してDeleteキーを押すか、右クリックからDeleteを選びます。削除後は前後の接続が意図どおり残っているか確認します。

画像を変える目的でRouterを動かしても効果はありません。処理結果が変化した場合は、Routerを別の入力へつなぎ直していないかを確認してください。

## 制作例1：長い前景の接続を迂回させる

人物を別の背景へ合成する作業を考えます。人物素材をMediaInで読み込み、Delta Keyerで背景色を抜き、Matte Controlで輪郭を整えます。その結果を、別系統で用意した背景素材とMergeで合成します。

Graphを工程ごとに離して配置すると、Matte ControlからMergeのForeground入力までの接続線が、背景処理のノード群を横切ることがあります。

ここで**Matte ControlからMergeへ向かう線**にRouterを挿入し、人物処理の下側を迂回する位置までドラッグします。人物の切り抜き結果はそのままで、前景のデータがどこから来たかを視覚的に追いやすくなります。

この例で人物の輪郭を変えるのはDelta KeyerやMatte Control、前景と背景を重ねるのはMergeです。Routerは配線の見通しを良くするだけで、キーの品質を改善するわけではありません。

## 制作例2：元画像とぼかし画像に分岐する

ひとつの素材を、元画像とBlur処理後の画像に分けて合成する構成です。

```text
                              ┌────────────→ Merge1 (Background)
MediaIn1 → Router1 ───────────┤
                              └→ Blur1 ────→ Merge1 (Foreground)
                                                  ↓
                                               MediaOut1
```

MediaIn1の出力をRouter1へ入れ、Router1の出力からMerge1のBackgroundとBlur1の入力に枝を伸ばします。Blur1の出力をMerge1のForegroundへつなぎ、Merge側でぼかし画像の重なり方を調整します。

このGraphでは元画像とぼかし画像が同じ分岐点から来ることが一目で分かります。**Routerは元画像を加工せずに両方の枝へ渡し**、Blurがぼかし、Mergeが合成を担当します。RouterをなくしてMediaIn1の出力から直接2本接続しても、接続先が同じなら処理の意味は変わりません。

## Direct Pipes・Orthogonal Pipesとの違い

接続線の見え方をGraph全体で変更するなら、Node Editorの空白部分を右クリックして次を選びます。

- **Options > Direct Pipes**：ノード間の接続線を直線で描きます。
- **Options > Orthogonal Pipes**：接続線を直角に曲げて描きます。

この切り替えもレンダリング結果に影響しません。Graph全体の線を整理するならDirect／Orthogonalの設定、**特定の線だけを意図した位置で曲げる**ならPipe Routerが適しています。Routerは直線表示でも直角表示でも使用できます。

### 孤立Routerの自動削除

**Auto Remove Routers**が有効な場合、接続先を失ったRouterは自動的に削除されます。21.1 ManualのNode Editorオプション説明では、この設定は既定で有効です。

前段または後段のノードを削除したあとRouterも消えているときは、孤立した接続点が自動整理された可能性があります。必要ならNode Editorのオプションを確認してください。

## Group・Underlay・Sticky Noteとの違い

| 機能 | 整理するもの | 映像・接続への関わり |
| --- | --- | --- |
| **Pipe Router** | 接続線の通り道と分岐点 | 接続データを通すが、加工はしない |
| [Underlay](./underlay) | 関連ノードの位置と色分け | 元の処理・接続は変えない |
| [Group](./group) | 複数ノードと内部接続のまとまり | 内部処理を残し、外部との接続をまとめる |
| [Macro](./macro) | 再利用する処理と公開Control | 内部処理を1つのToolとして再利用する |
| [Sticky Note](./sticky-note) | 作業上の説明や引き継ぎメモ | 接続にも映像にも関与しない |

接続の意味を短く注記するならRouterのComments、長い文章を残すならSticky Noteが向いています。Node Editorの工程を色付きの枠で示したい場合はUnderlayを使います。

## 注意点

- Routerは**MergeやSwitchの代わりにはなりません**。複数の処理を合成・切り替えたい場合は、対応するノードが必要です。
- Routerをたくさん配置しすぎると、かえって接続が追いづらくなります。配置を変える前にDirect／Orthogonal Pipesの表示方法も検討してください。
- Routerの削除や接続先の変更後は、特に複数に枝分かれした箇所の入力先を確認します。
- 画像を加工しないため、Routerを追加してもViewer上の映像に新しい効果は現れません。

## 出典・確認範囲

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）**

- Chapter 66「Working in the Node Editor」**pp.1404–1406**：「Connection Options and Routers」「Using Routers to Reshape and Branch Connections」。入出力1つずつ、Comments欄、Alt／Optionクリック、移動・分岐・削除、Direct／Orthogonal Pipes。
- Chapter 66 **p.1424**：Node Editorオプション「Auto Remove Routers」と既定状態。
- Chapter 101「Flow Organizational Nodes」**pp.2352–2353**：Pipe Routerの役割と、レンダリング時間へ影響しないこと。
- Chapter 73「Fusion Preferences」**p.1602**：孤立Routerが自動削除される条件。
- 公式配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。
- [I/O・Graph Utility一覧](./)：関連ノードの索引。

制作例は上記Manualで確認できる操作を組み合わせた説明です。21.1実機でのすべての入力型・内部Registry ID・UI差は確認していないため、`verification: partial`を維持しています。
