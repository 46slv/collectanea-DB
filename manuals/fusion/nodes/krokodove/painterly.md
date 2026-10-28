---
title: Painterly
description: 画像やグラフィックを絵画風の見た目に加工するKrokodoveのPainterly。入出力、合成例、似たツールとの違いを解説。
doc_type: node
term_id: painterly
term_short: 入力した画像やグラフィックを、絵画作品を思わせる見た目へ加工するKrokodoveの画像フィルター。
verification: partial
aliases: [Painterly]
concepts: [image-data]
nodes: [Painterly]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-21'
---

# Painterly

**Painterlyは、画像やグラフィックを絵画作品を思わせる見た目に変えるKrokodoveの画像フィルター**です。DaVinci Resolve 21.1 Reference Manualでは、画像やグラフィックに「artwork」風の見た目を与えるスタイル加工として紹介されています。

「絵画風」とは、写真をそのまま表示するのではなく、色や形の見え方を加工して、描かれた作品のように見せる表現の総称です。ただし、Painterlyが具体的にどのような筆跡を作るのか、輪郭をどう処理するのか、油絵・水彩画などの種類を選べるのかは、Manualの紹介文からは分かりません。**特定の画材を再現する機能としては確認されていません。**

## 何を変えるツールか

Painterlyは、入力された画像の**見た目を加工する**ツールです。写真を絵画調に寄せるほか、すでに作成した文字や図形のグラフィックへ、周囲の映像とは異なる表現を与えたい場合にも候補になります。

ここで扱う<Term id="image">Image</Term>は、画素の色や透明度を持った画像データです。図形の輪郭を編集可能なまま保持するShapeデータや、3D空間の形状を直接作るツールではありません。Krokodove内での分類は「Image Tools」です。

Painterlyの特徴は、**模様そのものを新しく作ることではなく、与えた画像やグラフィックを加工すること**にあります。とはいえ、画像のどの要素が保たれ、どの要素が大きく変化するかは実際の出力を比較する必要があります。

<!-- capture:S270 -->

## 実機例：文字の形の変化を見る

合成した文字 `PAINT` を `Painterly` に接続し、ModeをPeak、TypeをSquare、Radiusを5に設定しました。この静止画では、文字の角が入力より丸く見えます。Viewerの市松模様は透明部分の表示です。実映像やほかのMode、Alpha値は未検証です。[接続と設定の記録](/img/fusion/captures/S270/readback.json)に条件を記載しています。

[![文字をPainterlyへつなぐノード構成](/img/fusion/captures/S270/graph.png)](/img/fusion/captures/S270/graph.png)

合成文字をPainterlyへ渡します。

[![PainterlyのInspector](/img/fusion/captures/S270/controls.png)](/img/fusion/captures/S270/controls.png)

Peak、Square、Radius 5を指定します。

[![入力の文字PAINT](/img/fusion/captures/S270/low.png)](/img/fusion/captures/S270/low.png)

入力にはPAINTと表示されています。

[![角が丸く見えるPainterly出力](/img/fusion/captures/S270/high.png)](/img/fusion/captures/S270/high.png)

この設定では文字の角が丸く見えます。

[再現用Graph](/img/fusion/captures/S270/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S270/capture.json)

<!-- /capture:S270 -->

## 入力と出力

| 段階 | 扱うデータ | 確認できること |
| --- | --- | --- |
| 入力 | 2D Image | 公式Manualは「画像やグラフィックにかけるフィルター」と説明しています。入力端子の正式名称と本数は未確認です。 |
| 処理 | 画像のスタイル加工 | 絵画作品を思わせる見た目に変えます。処理アルゴリズムや、実機例以外のInspector設定は未確認です。 |
| 出力 | 2D Image | 画像フィルターとして、加工結果を後段の画像合成へ渡す用途を想定できます。出力端子名、Alphaの扱いは未確認です。 |

Frontmatterの `inputs: [image]` / `outputs: [image]` は**扱うデータの分類**です。特定の端子が何個あるか、Mask入力が使えるかを保証するものではありません。

画像をそのまま加工する構成を試すなら、次が出発点になります。

    MediaIn → Painterly → MediaOut

これは画像フィルターとしての概念的な接続例で、公式Manualに掲載された配線図ではありません。実際には、Painterlyのノードタイルに表示される入力を確認して接続します。

## 主な用途

### 写真や映像をグラフィックへなじませる

実写カットの一部だけを絵画調にしたい場合、Painterlyの結果を元映像と切り替えたり、混ぜたりする方法を検討できます。たとえばミュージックビデオで、現実の映像からイラストを思わせる画面へ変化させる演出です。Painterlyだけでその切り替えをアニメーションできると確認されたわけではありません。

### タイトルや図形の見え方を変える

Text+やBackgroundなどから画像として組み立てたグラフィックを加工する使い方も考えられます。文字の輪郭がどの程度残るかは未確認なので、読ませたい小さな文字より、装飾用の大きな文字や図形から試すと比較しやすくなります。

### 複数の加工を比較する

素材を同じフレームで見比べて、Painterlyによるスタイル加工が合うかを判断します。細かな模様や階調を作ること自体が目的なら、後述のDither、Rasterize、Generateのほうが目的を明確にできます。

## 制作例：元映像とPainterlyの結果を混ぜる

次は標準の[Merge](../compositing/merge)を使った**検証を兼ねる構成案**です。実機例は合成文字の静止画に限られます。

    MediaIn ──────────────────→ Merge（Background）→ MediaOut
       └────→ Painterly ──────→ Merge（Foreground）

1. Fusionページで、色と形の変化が分かりやすい画像をMediaInから読み込みます。同じ画像をPainterlyへ渡します。
2. MediaInとPainterlyをそれぞれViewerに表示します。輪郭、細部、色のまとまり方などを見比べ、どのような絵画風の変化が実際に起きるかを確認します。
3. 元のMediaInをMergeのBackgroundへ、Painterlyの結果をForegroundへ接続します。Mergeの**Blend**を動かし、元の画像と加工結果の割合を比較します。BlendはMerge側の設定であり、Painterlyのパラメータではありません。
4. 画面の一部分だけを変えたい場合は、MergeのEffect Maskを利用する方法を検討します。Painterly自身に専用Mask入力があることを意味しません。
5. 動画で使うなら、動きが大きい場面と細部が多い場面を複数フレーム確認します。加工結果がフレーム間で安定するか、細かな輪郭が意図せず変化しないかを実際に観察します。

この手順で分かるのは、使用している環境・素材での出力と合成結果です。特定の絵画技法やフィルム調の再現精度を保証するものではありません。

## 似たKrokodoveツールとの違い

| ツール | 21.1 Manualに記載された役割 | 選ぶ目安 |
| --- | --- | --- |
| **Painterly** | 画像・グラフィックを作品風の見た目に加工する | 全体を絵画調に寄せたい |
| [Dither](./dither) | ノイズ模様で陰影を表現し、粗い質感を作る | 階調を粒状・粗いパターンで見せたい |
| [Rasterize](./rasterize) | 画像を点・四角形・菱形などの集まりに変える | 網点やハーフトーンの見た目を作りたい |
| [Generate](./generate) | 元画像へグレースケールの不規則なテクスチャを加える | 明暗の質感を加えたい |
| [Plastic](./plastic) | 人工的なベベルやプラスチックの光沢を表現する | 表面を立体的・光沢のある印象にしたい |

どれも画像の雰囲気を変えますが、同じフィルターではありません。**画面全体を作品調へ加工する**のがPainterly、**点や図形などの具体的なパターンへ置き換える**のがRasterize、と目的を分けると選びやすくなります。Painterlyの内部処理がこれらとどう異なるかは未確認です。

## 注意点と未確認事項

- **Inspectorの設定**：筆跡の太さ、画材の種類、色数、輪郭強度などの項目があるとは確認できていません。別ツールの設定名を当てはめないでください。
- **元画像の保持**：細線・文字・透過部分・高輝度部分がどの程度残るかは未確認です。合成に使う前に、ViewerでRGBとAlphaを見比べます。
- **動画の時間変化**：スタイルが動きに追従する仕組みやちらつきを防ぐ仕組みは、Manualの紹介文に記載されていません。動画では複数フレームの確認が必要です。
- **色・出力範囲**：HDR値やscene-linear画像の処理、解像度、DoD（有効画像領域）、正式な入出力端子名・本数は未確認です。
- **製品・バージョン差**：Resolve Free / Studio、Fusion Studioでの表示や利用条件、内部REGIDは実機未確認です。

## バージョンと出典

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2434「Image Tools / Painterly」。画像やグラフィックを作品風の見た目に変えるフィルターであることを確認しました。
- **比較資料**：同Manual p.2434「Dither」、p.2435「Rasterize」「Generate」、p.2436「Plastic」。それぞれの用途の比較に使用しています。
- **関連**：[Krokodove全体像](./)、[Imageとは](../../learn/02-data/image)、[Merge](../compositing/merge)。

実機例では合成文字の一条件を確認しました。別の設定、実映像、端子の詳細は未検証のため、`verification: partial`を維持しています。
