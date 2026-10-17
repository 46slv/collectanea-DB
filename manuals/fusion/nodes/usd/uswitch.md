---
title: uSwitch
description: 複数のUSDシーンから後段へ送る1つを選ぶuSwitchについて、入出力、SourceとConfig、制作例、uVariantとの違いをResolve 21.1基準で説明する。
doc_type: node
term_id: uswitch
term_short: uSwitchは、複数のUSD入力から後段へ送る1つを選ぶノード。
verification: partial
aliases: [uSwitch, uSw]
concepts: [usd-scene]
nodes: [uSwitch]
node_family: usd
controls: [Source, Number of Inputs, Name]
inputs: [usd]
outputs: [usd]
tasks: [usd, switch-source, variant-workflow]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# uSwitch

**uSwitchは、別々のUSDデータをいくつか接続しておき、そのうち1つだけを選んで後段へ渡すノード**です。たとえば同じショットで車のモデルAとモデルBを見比べるとき、カメラや照明の構成をつなぎ直さず、使用するモデルを切り替えられます。

<Term id="usd-scene">USDシーン</Term>は、3Dモデルに加えてオブジェクトの配置、カメラ、照明などを含められるデータです。uSwitchが扱うのは**この3Dシーンのデータ**であり、完成した2D映像ではありません。

uSwitchは複数の候補を同時に重ね合わせるノードではありません。**選ばれた入力が1つだけ出力へ進みます。** 別々のUSDを同時に使う場合は[uMerge](./u-merge)でまとめます。

## 入力・出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| 入力（複数） | USDシーン／USDオブジェクト | 候補となるUSDソースを別々に接続する |
| 出力 | USDシーン | **Source**で選んだ入力を次のUSDノードへ渡す |

入力数は固定ではなく、Inspectorの**Config**で増減し、それぞれに名前を付けられます。21.1 Manualでは、スライダーで**9入力まで**設定でき、**9を超える数は数値欄へ直接入力できる**とされています。ただし、絶対最大入力数まではこの説明から確定できません。

~~~text
uLoader（車 A） ─┐
uLoader（車 B） ─┼→ uSwitch ────────────────┐
uLoader（車 C） ─┘                         │
uCamera ──────────────────────────────────┼→ uMerge → uRenderer → MediaOut
uDistant Light ───────────────────────────┘
~~~

この配線では、車A・B・Cのうち**選んだ1台だけ**を共通のカメラ・照明と組み合わせます。uSwitchの出力だけでは2D映像になりません。USDを画像にするには[uRenderer](./u-renderer)で描画します。

USDファイルにカメラや照明が最初から含まれる場合は、同じ要素を二重に加える必要はありません。どこまでをuSwitchの**切り替え対象**に含め、どこからを**共通部分**にするかで配線を決めます。

## Inspectorの操作

### Controls：Source

**Source**で、複数の入力のうち**どれを出力へ通すか**を選びます。Sourceを変更すると、後段で扱うUSDソースが切り替わります。

これは「AとBを何％ずつ混ぜる」といった合成比率ではありません。両方を同時に表示するなら、uSwitchではなくuMergeを使います。

### Config：Number of Inputs / Name X

| 項目 | 動作 | 確認すること |
| --- | --- | --- |
| **Number of Inputs** | 接続する入力の数を設定する | スライダーは9まで。9より多くする場合は数値欄へ直接入力 |
| **Name X** | 各入力を識別しやすい名前に変更する | モデル名や用途など、Sourceを選ぶ際に区別できる名前を付ける |

たとえば各入力を「Car_A」「Car_B」「Car_C」と名付ければ、番号だけより接続内容を判断しやすくなります。**入力名の変更は管理上の名称変更**です。USDファイル内のPrim名・材質・オブジェクト構造を変更する操作ではありません。

Number of Inputsを減らすときは、不要にする入力が現在のSourceとして使われていないか、接続と描画結果を確認してください。

### Settingsとアニメーションの確認範囲

SettingsはUSDノード間に共通する項目です。uSwitch固有のソース選択は**Source**と**Config**の項目で管理します。

**アニメーションについて：** 21.1 ManualのuSwitch節ではSourceの切り替え方法が説明されていますが、**Sourceをキーフレーム化できるか、切り替え時の補間・評価がどうなるか**までは明記されていません。時間に沿って入力を変える用途では、使用中の21.1環境でキーフレーム操作とレンダー結果を確認してください。

## 制作例：3種類の車を同じ構図で比較する

1. [uLoader](./uloader)を3つ用意し、それぞれ異なる車のUSDファイルを指定します。
2. 3つの出力をuSwitchへ接続します。Configの**Number of Inputs**を3に設定し、**Name X**をモデル名に変更します。
3. uSwitchの出力と、共通で使うカメラ・照明をuMergeへ接続します。
4. uMerge → uRendererにつなぎ、最初のモデルを描画します。
5. uSwitchの**Source**を変え、同じフレーム・構図・照明で輪郭、反射、フレーミングなどを比較します。

モデルごとにスケールや原点が異なる場合、Sourceを切り替えても自動的に同じ位置・大きさにそろうわけではありません。[uTransform](./utransform)などで**uSwitchの手前に各入力固有の調整**を加えると、ソースごとの差を整理できます。逆にuSwitchの後段の変形は、どのモデルにも同じ調整をかける場合に向きます。

### シーン全体を切り替えるとき

背景やカメラ・照明まで含むUSDを入力すると、uSwitchは**それらを含むシーン**ごと選びます。モデルだけを切り替えてカメラと照明を共通にしたければ、uSwitchにはモデル側のソースだけを接続し、共通要素は**後段でuMergeに合流**させます。

## uVariantなどとの違い

| ノード | 対象 | 使い分け |
| --- | --- | --- |
| **uSwitch** | 複数の独立したUSD入力から1つ | 別ファイルのモデルA/Bなどを選ぶ |
| [uVariant](./uvariant) | **1つのUSD内**に用意されたVariant Set | アセットに保存済みの屋根・パーツ・外観などの候補を選ぶ |
| [uVisibility](./uvisibility) | USD内の選択したPrim | 同じシーンの一部だけを見せる・隠す |
| [uMerge](./u-merge) | 複数のUSD入力 | 車と道路などを**同時に**使うために統合する |

**uVariantはUSDファイル内に事前定義された候補を選び、uSwitchはノードに接続した別々の入力を選ぶ**という違いがあります。USDにVariant Setがなくても、切り替えたいモデルを独立したソースとして用意できればuSwitchを使えます。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| **Sourceを変えても見た目が変わらない** | 各入力が本当に異なるUSDにつながっているか、Sourceが目的の入力を選んでいるか |
| **使いたい入力が選べない** | ConfigのNumber of Inputsと実際の接続数が合っているか |
| **どの入力なのか分からない** | ConfigのName Xにモデル名・用途を設定する |
| **複数モデルを同時に表示したい** | uSwitchは1入力の選択用。uMergeで統合する |
| **モデルだけでなく照明まで変わる** | 切り替え対象のUSDに照明が含まれていないか。共通の照明は後段で合流する |
| **モデルの位置や大きさが候補ごとに違う** | 各ソースの原点・スケールを確認し、必要ならuSwitchより前で個別にuTransformを使う |
| **Viewerに2D映像が出ない** | uSwitchの出力はUSD。uRendererで描画し、カメラ・照明の構成を確認する |
| **時間での切り替えが期待どおりにならない** | 当該Manual節だけではSourceのキーフレーム仕様を断定できない。実機で操作とレンダーを確認する |

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 121「USD Nodes」、**pp.2921–2922**。複数USD入力の選択、Source、ConfigのNumber of Inputs、9を超える入力数の直接入力、Name X、共通Settingsを照合しました。資料の配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

配線と制作例は記載された機能を組み合わせた説明です。**入出力端子の厳密な表示名、Sourceの数値範囲・選択順、絶対最大入力数、キーフレーム挙動、Edition差は21.1実機では未確認**です。そのため **verification: partial** を維持しています。
