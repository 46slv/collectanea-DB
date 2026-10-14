---
title: uLoader
description: USDファイルをFusionに読み込むuLoaderの入出力、アニメーション範囲と再生速度の調整、材質の扱い、実際の接続例を説明する。
doc_type: node
term_id: uloader
term_short: uLoaderは、外部のUSDファイルを読み込み、形状やカメラなどを含む3DシーンをFusionのUSDノードへ渡すノード。
verification: partial
aliases: [uLoader, uLd]
concepts: [usd-scene, time]
nodes: [uLoader]
node_family: usd
controls: [Filename, Trim, Time Scale, Frame Offset, Reverse, Loop, Reload]
outputs: [usd]
tasks: [usd, load-usd, import-scene]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# uLoader

**uLoaderは、別の3Dソフトなどで作ったUSDファイルをFusionに読み込み、シーンとして後続のノードへ渡すためのノード**です。モデルの形だけでなく、ファイルに記録されているカメラ・ライト・材質・アニメーションなどもUSDシーンの一部として扱えます。

USDは、複数の立体物やその階層、各種設定を記述できる3Dシーン形式です。<Term id="usd-scene">USD scene</Term>を読み込んだ段階では、通常の2D画像にはなっていません。Fusion上で映像として表示するには、シーンを[uRenderer](./u-renderer)で描画します。[USDシーンの基礎](../../learn/02-data/usd)も参照してください。

## 入力・出力とファイル形式

| 項目 | 内容 | 役割 |
| --- | --- | --- |
| **ノードの入力端子** | なし | 別のノードからシーンや画像を受け取るのではなく、ファイルを指定して読み込む |
| **Filename** | USDファイルのパス | Inspectorの**Browse**から読み込むファイルを選ぶ |
| **出力** | USDシーン | [uMerge](./u-merge)、[uTransform](./utransform)、[uReplaceMaterial](./ureplacematerial)などのUSDノードへ渡す |

**DaVinci Resolve 21.1 Reference Manualで明記されている読み込み形式は、.usd / .usda / .usdc / .usdzの4種類**です。これらはUSDを保存するための形式で、Fusion側ではいずれもUSDシーンとして後続のノードへつなぎます。個々のファイルにカメラや材質が含まれるかどうかは、そのファイルの内容によって異なります。

uLoaderの出力を2DのMergeやMediaOutへ直接つないでも、映像を完成させる構成にはなりません。**USDをまとめるuMerge**と、**USDを2D画像にするuRenderer**を区別します。

## まずシーンを映す

~~~text
uLoader（USDモデル） ───┐
uCamera（カメラ） ─────┼→ uMerge → uRenderer → MediaOut
uDistant Light（照明） ─┘
~~~

1. Fusionに**uLoader**を置き、Inspectorの**Filename → Browse**でUSDファイルを選びます。
2. uLoaderの出力を[uMerge](./u-merge)につなぎます。
3. 必要なら[uCamera](./ucamera)と[uDistant Light](./udistant-light)を追加し、それぞれのUSD出力を同じuMergeへ接続します。
4. uMergeの出力をuRendererへ、uRendererの2D画像出力をMediaOutへつなぎます。
5. uRendererで使用する**Camera**と**Lighting**を確認し、モデルが想定した位置と明るさで描画されるか見ます。

この構成は「読み込んだモデルに新しいカメラと照明を追加する」例です。**USDファイルにすでにカメラや照明が含まれている場合、必ずしも追加する必要はありません。** まず読み込まれたシーンを確認し、必要な要素だけ足します。

USDでは、車体・タイヤ・窓などを階層の中の**Prim**として区別できます。個別のパーツを選んで位置や材質を変えたい場合は、後続ノードの**Prim Selection → Pick**からScene Treeを開きます。この選択操作はuLoaderのファイル読み込みとは別です。

## Inspector：どの範囲を、どの時間で再生するか

uLoaderの**Controls**タブには、ファイル指定のほかにアニメーションの時間を調整する項目があります。

| 設定 | 何を変えるか | 使いどころ |
| --- | --- | --- |
| **Filename** | 読み込むUSDファイル | 外部で作ったシーンの指定、別ファイルへの差し替え |
| **Trim** | USDアニメーションから使う**In / Out範囲** | 長い動きの一部分だけを使用したい |
| **Time Scale** | アニメーションの再生速度 | 元の動きを速く、または遅く見せたい |
| **Frame Offset** | タイムライン上で動きの開始位置をずらす | シーンの動き始めを映像に合わせたい |
| **Reverse** | アニメーションを逆方向に再生 | 開く動きを閉じる方向へ見せたい |
| **Loop** | アニメーションを繰り返す | 短い動きを反復させたい |
| **Reload** | Filenameで指定中のファイルを再読み込み | 外部ソフトで編集したUSDの変更をFusionへ取り込みたい |

たとえば、USDに「扉が開いてから閉じる」動きが入っていて、開く部分だけを使いたいとします。**Trim**で必要な区間を選び、**Time Scale**で速度を調整し、**Frame Offset**でショット内の開始位置を合わせます。繰り返したい場合は**Loop**を使います。

ここで動かしているのは、**読み込んだUSDシーンのアニメーションの時間**です。DaVinci Resolveのタイムライン上にあるクリップ自体をトリミングしたり、ほかの2Dノードのアニメーションを一括変更したりする操作ではありません。

**注意：** 21.1 Manualは各項目の役割を説明していますが、TrimとTime Scaleを同時に使ったときの厳密な計算順序や、範囲外の全フレームでの評価規則まではこの節から確定できません。正確な同期が必要なショットでは、開始・中間・終了フレームを実際に確認します。また、静止したUSDファイルにこれらの値を設定しても、元データにない動きが自動的に生まれるわけではありません。

## 外部のUSDを更新したとき

uLoaderの**Reload**は、Filenameで現在指定しているUSDファイルを読み直すためのボタンです。

たとえばBlenderなどで車のモデルを修正し、同じUSDファイルとして再出力した場合、Fusion側でuLoaderを作り直す代わりにReloadを使います。これによって、既存のuMergeやuRendererへの接続を保ったまま、**変更後のファイルを再読み込み**できます。

モデルの階層やオブジェクト名を変更した場合は、読み込みが成功しても後続の**Prim Selection**が意図したパーツを選べているか確認します。USDが参照する外部テクスチャなどについても、実際に描画して結果を確かめます。Reloadによってすべての外部参照・対応形式の互換性が保証されるわけではありません。

## 材質を差し替える：uMaterialXとの違い

**uLoaderはシーンを読み込むノード**です。読み込んだUSDに元から材質が含まれていれば、それもシーンの一部として利用できます。別の材質へ変える場合は、[uReplaceMaterial](./ureplacematerial)を追加します。

~~~text
uLoader（車のUSD） ────────────→ uReplaceMaterial → uMerge → uRenderer
                                  ▲ Material Input
uMaterialX（外部の.mtlx） ────────┘
~~~

この例では、uLoaderが**変更する車のシーン**を供給し、[uMaterialX](./umaterialx)が**新しい材質の定義**を供給します。uReplaceMaterialで**Prim Selection**を使い、車体など適用したい部分を選びます。外部ファイルを使わずFusion内で材質を組み立てるなら[uShader](./ushader)も候補です。

21.1 ManualのuLoader節（p.2902）には、**MaterialXファイル（.mtlx）をUSD Loaderから読み込んで材質交換に使う**という説明があります。一方、直後の**Filename**の説明（p.2903）で列挙される形式はUSDの4種類で、.mtlxは含まれません。**この記述だけでuLoaderのFilenameから.mtlxを直接選べると断定しません。** MaterialXの定義ファイルを個別に読み込む手順は、同章で入力なし・Material File指定と明記されるuMaterialXを使うと説明できます。

## うまくいかないとき

| 症状 | まず確認すること |
| --- | --- |
| ファイルを読み込めない | **Filename**のパス、拡張子（.usd / .usda / .usdc / .usdz）、ファイルの実在を確認する。具体的な読み込み失敗理由は個別に調べる |
| uLoaderをViewerで見ても完成画像にならない | 出力は**USDシーン**。uMergeから**uRenderer**へつないだ2D画像を確認する |
| モデルが真っ黒、または映らない | uRendererの**Camera / Lighting**、カメラと被写体の位置、ライトの有無を分けて調べる |
| 動くはずのモデルが止まる | 元のUSDにアニメーションがあるか、**Trim / Time Scale / Frame Offset**と現在フレームを確認する |
| 必要な動きだけ取り出せない | **TrimのIn / Out**を確認し、速度を変えているだけではないか見直す |
| 同じ動きを繰り返したい | **Loop**が有効かを確認し、区間のつなぎ目も実際に確認する |
| 外部でモデルを修正したのに古いまま | **Reload**を実行し、Filenameが編集したファイルを指しているか確認する |
| 一部のパーツへ変更が効かなくなった | モデルの階層・Prim名の変更と、後続ノードの**Prim Selection**を照合する |
| 材質や模様が想定と違う | USD内の元の材質、外部参照、uReplaceMaterialの対象Prim・Material Inputを分けて確認する |
| .mtlxの読み込み先に迷う | **uMaterialXのMaterial File**を使う方法を確認する。uLoaderのFilenameでの直接指定はこの資料では確定していない |

## 関連ノード

- [uMerge](./u-merge)：複数のUSD要素を同じシーンへまとめる。
- [uRenderer](./u-renderer)：USDシーンを2D画像に描画する。
- [uCamera](./ucamera)：描画する視点を用意し、既存のUSDカメラも扱う。
- [uTransform](./utransform)：USDシーン内の位置・回転・拡大縮小を調整する。
- [uReplaceMaterial](./ureplacematerial)：対象Primの材質を差し替える。
- [uMaterialX](./umaterialx)：外部のMaterialX定義を読み込む。
- [uExport](./uexport)：USDをファイルとして書き出す。uLoaderの読み込みと逆の役割。

## バージョン・出典と確認範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 121「USD Nodes」。**pp.2902–2903**でuLoaderの対応形式・入力なし・Filename・Trim・Time Scale・Frame Offset・Reverse・Loop・Reloadを確認しました。**p.2887**でUSDの読み込みからuMerge・uCamera・uRenderer・MediaOutまでの基本構成、**p.2888**でScene TreeとPrim Selection、**p.2904**でuMaterialXの入力と用途を照合しています。公式資料の入手先：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

接続例・制作例・トラブル対処は、これらの仕様に基づく説明です。**実機の正確な時間評価順序、外部依存ファイルとUSDの全機能の互換性、個別Inspectorの既定値・数値範囲、Edition差は未検証**です。このため、frontmatterの**verification: partial**を維持します。
