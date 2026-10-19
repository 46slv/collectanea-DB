---
title: uVariant
description: USDのVariant Setで既存アセットの形状や外観の候補を切り替えるuVariantの接続・操作・注意点を、Resolve 21.1基準で説明する。
doc_type: node
term_id: uvariant
term_short: uVariantは、USDアセットにあらかじめ用意されたバリエーションを選び、シーンへ反映するノード。
verification: partial
aliases: [uVariant, uVa]
concepts: [usd-scene, scene-tree, usd-variant]
nodes: [uVariant]
node_family: usd
controls: [Pick, Selected Prims, Invert Prim Selection, Variant Set, Variant]
inputs: [usd]
outputs: [usd]
tasks: [usd, variant, switch-asset]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-19"
---

# uVariant

**uVariantは、USDファイルの中にすでに用意されている複数の候補から、使うものを選ぶノード**です。たとえば車のアセットに「屋根あり／屋根なし」が別バリエーションとして保存されていれば、Fusion内でどちらを使うか選べます。

ここで扱う<Term id="usd-scene">USDシーン</Term>は、モデル・カメラ・照明などを含められる3Dデータです。その中の個々の要素を **Prim（プリム）** と呼びます。たとえば車全体や車体のパーツがPrimになり、階層で整理されます。

**Variant Set（バリアントセット）** は、あるPrimに用意された「選択肢のまとまり」です。Variant Setが `roof`、選択肢（**Variant**）が `open` と `closed` なら、「屋根の状態」という項目から1つを選ぶ関係です。これは構造を理解するための例であり、実際の名前や内容はUSDファイルの作成者が決めます。

uVariantが**新しい屋根の形状やバリエーションを自動生成するわけではありません**。切り替えられる候補は、読み込んだUSDアセット内に定義されている必要があります。

## 入力・出力とデータの流れ

| 接続 | データ | 意味 |
| --- | --- | --- |
| 入力（必須・1つ） | USDシーンまたはUSDオブジェクト | 切り替え対象のアセットを受け取る |
| 出力 | USDシーン | 選んだVariantを反映したシーンを次のUSDノードへ渡す |

uVariantの出力は完成した2D画像ではありません。映像として見るときは、[uRenderer](./u-renderer)で3Dシーンを画像に変換します。

~~~text
uLoader（Variant入りのUSD） → uVariant ────┐
uCamera ───────────────────────────────────┼→ uMerge → uRenderer → MediaOut
uDistant Light ────────────────────────────┘
~~~

この図はカメラと照明を追加する構成例です。読み込むUSDシーンに必要なカメラ・照明がすでに含まれていれば、重複して追加する必要はありません。USDを読み込むのは[uLoader](./uloader)、複数のUSD要素をまとめるのは[uMerge](./u-merge)です。

## InspectorでVariantを切り替える

1. **uLoader**で、Variantが定義されているUSDファイルを読み込み、出力を**uVariant**へ接続します。
2. uVariantのInspectorにある **Pick** を押して**Scene Tree**を開きます。Scene TreeはUSD内のオブジェクトを階層で表示する画面です。
3. バリエーションを持つPrimを選びます。**Selected Prims**に選択対象が表示されるので、意図したオブジェクトか確認します。
4. **Variant Set**から変更したい選択肢のまとまりを指定します。
5. **Variant**から、そのまとまりに含まれる候補を1つ選びます。
6. uRendererの結果を見ながら別候補へ切り替え、形状・材質・表示内容など、どの要素が変わるか比較します。

Scene Treeの**Pick**はノードの配線先を選ぶ操作ではありません。**入力されたUSDシーンの、どのPrimに対して操作するか**を指定します。同じファイルに複数のオブジェクトが入っている場合、対象を間違えると目的のバリエーションが見つかりません。

### Controlsタブの項目

| 項目 | 動作 | 確認すること |
| --- | --- | --- |
| **Pick** | Scene Treeを開く | 対象のPrimを選ぶ |
| **Selected Prims** | 選ばれたPrimを一覧表示 | 意図した場所・名前か |
| **Invert Prim Selection** | 選択対象を反転する | 選んだ側ではなく、選んでいない側が対象になる。**21.1 Manualはこの項目のキーフレームアニメーションを明記** |
| **Variant Set** | 対象Primに用意された選択肢のグループを選ぶ | 候補がないときは **No Selection** |
| **Variant** | 選択中のSetに属する候補を選ぶ | 実際の候補名はアセットごとに異なる |

**Variant SetとVariantは別の設定です。** 先に「どの項目を変えるか」（Set）を選び、次に「その項目をどの状態にするか」（Variant）を指定します。項目が選ばれていない状態では、候補名を推測して入力することはできません。

**アニメーションの注意：** 21.1 ManualはInvert Prim Selectionのキーフレーム対応を明記していますが、このuVariant節だけでは**Variantメニュー自体のキーフレーム対応や切り替えタイミングの評価方法を確定できません**。ショット途中でVariantを変える場合は、使用中の21.1環境で操作と描画結果を確認してください。

## 制作例：車の異なる仕様を同じショットで比較する

1台の車のUSDに、ホイールの仕様A/Bやルーフの開閉状態などが**Variantとして保存されている場合**を考えます。カメラ・ライティングを組み直さず、同じ構図で仕様違いを比較できます。

1. 車のUSDをuLoaderへ指定し、uVariant → uMerge → uRendererにつなぎます。
2. カメラ位置と照明を決め、**uRendererの画像**を基準にします。
3. uVariantのPickで車に対応するPrimを選び、目的のVariant SetとVariantを設定します。
4. 別のVariantを選び、輪郭、反射、影、ほかのパーツとの干渉などを見比べます。

変わる内容はUSD側のVariant定義に依存します。「材質だけ」「形状ごと」「複数の要素をまとめて」など、あらゆるアセットに同じ差分が用意されているわけではありません。外観の差を比較する場合は**同じカメラと照明で描画**すると判断しやすくなります。

## 選んだVariantをUSDファイルで引き渡す場合

同じUSDアセットを別の3Dソフトへ渡すなら、[uExport](./uexport)で書き出す方法があります。たとえば屋根のVariantを `closed` にして車を渡す場合、**保存後も屋根が閉じて見えること**と、**受け取り側で `open` / `closed` を再選択できること**は別の確認事項です。

~~~text
uLoader（屋根のVariantが定義済みの車）
  → uVariant（roof / closedを選択）
  → uExport ⇒ shot.usdc
~~~

1. 書き出す前に、uVariantの**Selected Prims、Variant Set、Variant**を確認し、[uRenderer](./u-renderer)で選択結果を描画します。
2. uExportで保存し、ファイルを**別のuLoader**から読み直します。同じカメラ・照明でレンダリングして、屋根の見た目を比較します。
3. 後から仕様を変える必要があるなら、読み直したシーンを**別のuVariant**につなぎ、元のVariant Setと両方の候補が残っているか調べます。

Resolve 21.1 Reference ManualのuVariant節（pp.2925–2926）にはVariantの選択操作、uExport節（p.2900）にはUSDシーンの書き出しが説明されています。ただし、**選択したVariantだけが保存されるのか、Variant Setと未選択の候補も保存されるのか**は、これらの節からは確定できません。上の手順は保持条件を確かめるためのものであり、実機での結果は未検証です。

### VariantがないUSDではどうする？

1つの完成モデルしか保存されていないUSDには、uVariantで選べる別案がありません。複数の独立したUSDファイルから1つを使うなら、[uSwitch](./uswitch)で**入力ソースそのもの**を切り替えます。特定パーツの表示を変えるだけなら[uVisibility](./uvisibility)、材質を差し替えるなら[uReplaceMaterial](./ureplacematerial)が適しています。

## 似たノードとの使い分け

| ノード | 切り替えるもの | 適する状況 |
| --- | --- | --- |
| **uVariant** | 1つのUSDアセット内に定義されたVariant | 同じアセットの仕様・外観候補を選ぶ |
| [uSwitch](./uswitch) | 別々のUSD入力のうち1つ | ファイルAとファイルBなど、独立したソースを選ぶ |
| [uVisibility](./uvisibility) | シーン内のPrimの表示状態 | あるパーツだけ見せる・隠す |
| [uReplaceMaterial](./ureplacematerial) | 選択Primへ割り当てる材質 | 既存のVariantにない材質を後から指定する |

uVariantは**アセットを構成する選択肢を使用する**操作です。これに対してuSwitchは**ノードへ入ってくる別のUSDデータから選ぶ**操作です。「切り替え」という結果が似ていても、どこに候補が保存されているかが違います。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| **Variant SetがNo Selection** | 読み込んだUSDにVariantが存在するか、Pickで正しいPrimを選んだかを確認する |
| **期待したVariant名が表示されない** | 別のVariant Setを選んでいないか、USDの作成側でその候補が保存されているかを確認する |
| **設定しても何も変わらない** | Selected Prims、Variant Set、Variantの3箇所を見直し、uRendererの結果で比較する |
| **一部のオブジェクトだけ変わらない** | Scene Treeで選択したPrimの範囲を確認する。別のPrimにVariantが定義されている可能性を調べる |
| **意図しないオブジェクトが対象になる** | Invert Prim Selectionが有効になっていないか確認する |
| **Viewerに完成映像が出ない** | uVariantの出力はUSD。後段のuMerge / uRendererで2D画像に変換し、カメラと照明を確認する |
| **別ファイルにしたら選択肢が消えた** | USDファイルごとにPrim階層・Variant Set・候補名が異なる。新しいシーンを選び直す |
| **Variantを時間で切り替えたい** | このManual節でVariantメニュー自体のアニメーション可否は未確定。実機で確認するか、独立USDソースを切り替えるuSwitchの適合性も検討する |

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 121「USD Nodes」。**pp.2925–2926**でuVariantの役割、必須USD入力1つ、Pick、Selected Prims、Invert Prim Selection、Variant Set、Variantを確認しました。**p.2888**でScene TreeとPrim Selection、**p.2887**でUSDの基本的な読み込み・描画経路、**pp.2921–2922**でuSwitchの独立入力の切り替えを照合しました。公式資料の入手先：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

操作手順と制作例は、これらの仕様に基づく説明です。**個別Variant Setの内容、Variantメニューのアニメーション可否、正確なポート表示名・既定値・範囲、Edition差は21.1実機で未検証**のため、frontmatterの **verification: partial** を維持しています。
