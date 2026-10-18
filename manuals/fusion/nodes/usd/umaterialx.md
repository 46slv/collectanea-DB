---
title: uMaterialX
description: 外部のMaterialX（.mtlx）を読み込み、USDシーンのオブジェクトへ材質を割り当てるまでの接続と注意点を説明する。
doc_type: node
term_id: umaterialx
term_short: uMaterialXは、外部の.mtlxファイルを読み込み、USDで利用できる材質データを出すノード。
verification: partial
aliases: [uMaterialX, uMX]
concepts: [usd-scene, material, materialx]
nodes: [uMaterialX]
node_family: usd
controls: [Material File]
outputs: [usd-material]
tasks: [usd, material, materialx, load-material]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-18"
---

# uMaterialX

uMaterialXは、**外部で作成されたMaterialX（`.mtlx`）ファイルを読み込み、FusionのUSDシーンで使える材質を用意するノード**です。例えば別の3Dソフトで作った塗装材質を読み込み、Fusionに取り込んだ車のボディへ適用するときに使います。

材質（Material）は、表面の色や反射など「どう見えるか」の設定です。車体の形、位置、カメラを持つシーンそのものとは役割が違います。uMaterialXが読み込むのは**材質の定義**であり、車体などの立体モデルではありません。読み込んだ材質を実際のオブジェクトへ割り当てるには、[uReplaceMaterial](./ureplacematerial)などの後続ノードが必要です。

## 入力・出力：材質だけを持つUSDデータを作る

| 接続・項目 | 受け取るもの／出すもの | 役割 |
| --- | --- | --- |
| ノード入力 | **なし** | 画像やUSDシーンを直接つなぐ入力端子はない |
| **Material File** | `.mtlx`ファイルのパス | Inspectorのファイル選択から外部の材質定義を読み込む |
| 出力 | **材質を含むUSDデータ** | [uReplaceMaterial](./ureplacematerial)の**Material Input**などへ渡す |

21.1 Reference ManualはuMaterialXの出力を、**材質だけを含むUSDシーンを生成するもの**として説明しています。ここでいう「USDシーン」は<Term id="usd-scene">USD scene</Term>形式のデータであって、読み込み元の`.mtlx`が立体モデルやカメラに変わるという意味ではありません。また、この説明だけではディスク上に別の`.usd`ファイルを自動保存するとはいえません。

uMaterialXの出力は**完成した2D画像ではありません**。通常の2D Mergeに直接つなぐのではなく、USDノードの材質入力で使用します。

## 接続例：外部の材質を車体に割り当てる

~~~text
uMaterialX（.mtlxを読み込む）
          │ 材質データ
          ▼ Material Input
uLoader ──→ uReplaceMaterial ──→ uRenderer ──→ 2D Image
（車のUSD）  Scene Input           （描画）
~~~

この接続では、**uLoaderが変更対象の車を供給し、uMaterialXが新しい材質を供給**します。uReplaceMaterialが「その材質を車のどの部分へ使うか」を決めます。

1. [uLoader](./uloader)で車などのUSDアセットを読み込み、uReplaceMaterialの**Scene Input**へ接続します。
2. uMaterialXを追加し、Inspectorの**Material File**から`.mtlx`ファイルを指定します。
3. uMaterialXの出力をuReplaceMaterialの**Material Input**へ接続します。
4. uReplaceMaterialの**Type**を**MaterialX**にします。接続した入力から使用する材質を選ぶか、ファイル指定の経路を使います。どの材質を選んでいるかをInspectorで確認します。
5. **Prim Selection → Pick**で車体など、交換したい部分を選びます。PrimはUSDシーンの階層に含まれるオブジェクトなどの単位です。**Invert Prim Selection**の状態も確認します。
6. 後続の[uRenderer](./u-renderer)で材質の変化を確認します。シーンにレンダリング用のカメラ・照明がない場合は、[uCamera](./ucamera)や[uDistant Light](./udistant-light)を[uMerge](./u-merge)で追加します。

上の図は**材質の受け渡しに必要な部分**を示したものです。現場の構成では、カメラや照明の追加、uMerge、レンダー設定が別途必要になる場合があります。

**接続だけで「どの材質をどのオブジェクトへ使うか」が決まるわけではありません。** uMaterialX側で材質を読み込み、uReplaceMaterial側で使用する材質と対象Primを選ぶ、という二段階で考えます。

## Inspector：Material File

uMaterialX固有の主な設定は、**Material File**のファイル選択欄と**Browse**ボタンです。

- **Material File**：読み込むMaterialX定義（`.mtlx`）を指定します。
- **Browse**：コンピューター上の`.mtlx`ファイルを選択します。
- **Settingsタブ**：他のUSDノードとも共通の設定が配置されています。Material Fileとは別の共通項目です。

uMaterialXは、Inspector内で色やRoughnessを一から編集するためのノードではありません。**外部ファイルに定義された材質を読み込む役割**です。Fusion内で材質の値やテクスチャ接続を組み立てたい場合は[uShader](./ushader)を検討します。

## uShader・uLoader・uReplaceMaterialとの違い

| ノード | 何を担当するか | 選び方 |
| --- | --- | --- |
| **uMaterialX** | 外部の`.mtlx`から材質定義を読み込む | 既存のMaterialXファイルを使いたい |
| [uShader](./ushader) | Fusion内で色・反射などの材質設定を組み立てる | InspectorやuTextureで材質を調整したい |
| [uLoader](./uloader) | `.usd`などのUSDシーンを読み込む | 立体モデルやシーンを取り込みたい |
| [uReplaceMaterial](./ureplacematerial) | 材質をUSDシーンの対象オブジェクトへ割り当てる | ボディだけ塗装を交換するなど、適用先を選びたい |

**uShaderの「Shader Model = MaterialX」とuMaterialXは同じ操作ではありません。** 前者はuShader内で使うシェーダーモデルの選択、後者は外部`.mtlx`の読み込みです。MaterialXを採用していても、どのノードで材質を用意したかによって操作が違います。

また、[uLoader](./uloader)から読み込んだUSDシーン内にも材質が含まれる場合があります。**外部のMaterialXファイルを新たに読む**方法には、uMaterialXを独立させる方法と、uReplaceMaterialのType = MaterialXでファイルを直接指定する方法があります。元のシーンにある材質をそのまま使う場合は、どちらも必須ではありません。

## uReplaceMaterialだけで直接読み込む場合

**外部の`.mtlx`を使うたびにuMaterialXが必要なわけではありません。** 21.1 Reference Manual（p.2916）では、uReplaceMaterialの**Type = MaterialX**からファイルを直接指定する方法と、Material Inputに接続した材質から選ぶ方法の両方が説明されています。

```text
直接指定: uLoader（USD scene） → uReplaceMaterial（Type = MaterialX、.mtlxを選択） → uRenderer
ノード経由: uMaterialX（.mtlx） → uReplaceMaterial（Material Input）
            uLoader（USD scene） → uReplaceMaterial（Scene Input） → uRenderer
```

単に一つのモデルの材質を置き換えるなら、**uReplaceMaterialから直接指定するほうが短い構成**です。材質ファイルの読み込みを独立して示したい場合や、材質データの供給元を後段の処理と分けたい場合にuMaterialXを使います。どちらの場合も、uReplaceMaterialで対象Primを選ぶ必要があります。

## 用途と運用上の注意

**アセット間の材質交換**では、形状の異なる複数モデルへ同じ外部材質を試し、uReplaceMaterialで適用対象を変更できます。例えば木材の材質を読み込み、家具の天板だけへ割り当てるとき、材質の読み込みと家具の選択を分けて管理できます。

**複数材質を含むファイル**では、ファイルを指定したことと、狙った材質が適用されたことを区別します。uReplaceMaterialのMaterialX選択欄で、入力からどの材質を選んだかを確認してください。ファイル内に複数の材質がある場合の列挙順や命名規則まで、この章から断定しません。

**テクスチャを参照する外部素材**では、`.mtlx`本体だけでなく、それが参照する画像などの依存ファイルも必要になる場合があります。読み込めても見た目が違うときは、ファイルの場所だけでなく参照先・色空間・現在のレンダー結果を分けて調べます。MaterialXの全ノードや外部レンダラー固有の表現が21.1で同一に描画されることは、この資料だけでは保証できません。

## うまく表示されないとき

| 症状 | 確認する場所 |
| --- | --- |
| `.mtlx`を読み込めない | uMaterialXの**Material File**でファイル形式とパスを確認する |
| 接続しても車体の色が変わらない | uReplaceMaterialの**Material Input**、**Type = MaterialX**、使用する材質の選択を確認する |
| 車体以外まで変わる | uReplaceMaterialの**Prim Selection / Invert Prim Selection**を確認する |
| 期待と異なる材質になる | uReplaceMaterialで選択中の材質名と、読み込んだ`.mtlx`の内容を照合する |
| 模様や反射が想定と違う | 外部テクスチャ等の参照先、材質の互換性、カメラ・照明・uRendererの設定を分けて確認する |
| ノード出力を2D Mergeで表示できない | uMaterialXの出力は画像ではなく材質を含むUSDデータ。uReplaceMaterialで適用してuRendererで描画する |
| `.mtlx`の値をFusion内で細かく変えたい | 外部定義の読み込みだけではなく、uShaderで材質を組み立てる方法が適切か検討する |

## 関連項目

- [USD sceneの基礎](../../learn/02-data/usd)：USDのオブジェクト階層、Scene Tree、Primの意味
- [uReplaceMaterial](./ureplacematerial)：材質の割り当て先とMaterialXの選択
- [uShader](./ushader)：Fusion内で材質を作る別の方法
- [uLoader](./uloader)：形状・カメラ・既存材質を含むUSDを読み込む
- [uRenderer](./u-renderer)：材質を適用したシーンを2D画像へ描画する

## バージョン・出典・未確認範囲

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 121「USD Nodes」、pp.2904–2905**で、入力なし、`.mtlx`から材質だけを含むUSDデータを作ること、Material File、uReplaceMaterialへの接続を確認しました。**pp.2915–2917**でuReplaceMaterialのMaterial Input、Type = MaterialX、直接ファイル選択と入力経由の選択、Prim Selectionを確認しています。

接続例とトラブル対処は、これらの仕様を基に組み立てた運用例です。**対応MaterialXバージョン、全ノードの互換性、外部テクスチャの解決方法、実機の表示順・既定値・Edition差は未検証**です。`verification: partial`を維持します。
