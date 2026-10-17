---
title: uVisibility
description: USDシーン内で指定したオブジェクトやその階層を表示・非表示にするuVisibilityの操作、アニメーション、使い分けをResolve 21.1基準で解説する。
doc_type: node
term_id: uvisibility
term_short: uVisibilityは、USDシーン内の指定したオブジェクトや階層を表示・非表示にするノード。
verification: partial
aliases: [uVisibility, uVis]
concepts: [usd-scene, scene-tree]
nodes: [uVisibility]
node_family: usd
controls: [Pick, Selected Prims, Invert Prim Selection, Visible]
inputs: [usd]
outputs: [usd]
tasks: [usd, visibility, isolate-object]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# uVisibility

**uVisibilityは、USDシーンの一部だけを表示したり隠したりするノード**です。たとえば読み込んだ街並みから看板を消す、建物一棟を一時的に隠す、ショットの途中で車のパーツを出現させる、といった場面で使います。

<Term id="usd-scene">USDシーン</Term>は、3Dモデル、カメラ、ライトなどを階層的に管理できるデータです。その中の個々の要素を **Prim（プリム）** と呼びます。車全体が1つのPrimで、その下に車体やタイヤのPrimが並ぶこともあります。階層内のひとまとまりをここでは**ブランチ（枝）**と呼びます。

uVisibilityは**形状そのものを削除する操作ではなく、表示状態を指定する操作**です。別の形状を生成したり、材質を変更したりするノードではありません。

## 入力・出力

| 接続 | データ | 何が起きるか |
| --- | --- | --- |
| Scene Input（オレンジ・必須1つ） | USDシーンまたはUSDオブジェクト | 表示状態を変えたい3Dデータを受け取る |
| 出力 | USDシーン | 指定した対象の表示状態を反映したデータを次へ渡す |

**出力は2D画像ではありません。** 映像として確認するときは、[uRenderer](./u-renderer)でUSDシーンをレンダリングします。

~~~text
uLoader → uVisibility ────────────────────┐
uCamera ─────────────────────────────────┼→ uMerge → uRenderer → MediaOut
uDistant Light ──────────────────────────┘
~~~

この図はカメラと照明を別ノードで加える場合の例です。USDファイル内に使用するカメラやライトがすでに入っていれば、重複して追加する必要はありません。[uLoader](./uloader)はUSDファイルを読み込み、[uMerge](./u-merge)はUSDの構成要素をまとめます。

## どこを表示・非表示にするか

Inspectorの**Controls**タブで、対象と表示状態を指定します。

| 項目 | 役割 | 操作上の注意 |
| --- | --- | --- |
| **Pick** | **Scene Tree**を開いて操作対象を選ぶ | Scene TreeはUSD内のオブジェクト階層を表示する画面 |
| **Selected Prims** | 選んだPrimの一覧を表示 | 名前や階層が意図した対象と一致するか確認する |
| **Invert Prim Selection** | 選択対象と非選択対象を入れ替える | 「選んだもの以外」を操作したい場合に使う。キーフレーム対応 |
| **Visible** | 操作対象を表示するか、隠すかを切り替える | オフにすると対象が表示されなくなる。キーフレーム対応 |

**Pickはノード間の接続先を選ぶボタンではありません。** すでに入力されているUSDシーンの中から、どのPrimへ変更を適用するかを指定します。Scene TreeでPrimを選ぶと、Viewer上の対応する要素が強調表示されます。

たとえば `/World/City/Sign` というPrimがある場合（名前は説明用の例）、そのPrimだけを選び、**Invert Prim Selectionをオフ、Visibleをオフ**にすれば、その看板を隠す操作になります。

### オブジェクト1つと階層全体の違い

Scene Treeは親子関係を持つので、部品を1つ選ぶ場合と、建物などの上位ブランチを選ぶ場合では影響範囲が変わります。上位ブランチを非表示にすると、通常はその配下のオブジェクトも描画されなくなります。**「一部分だけ隠したい」のに全体が消える場合は、まずSelected Primsで親を選んでいないか確認**してください。

**Invert Prim Selection**をオンにすると、選んだPrimではなく選んでいない側が操作対象になります。Visibleをオフにした状態で反転すると、目的のものを残して周囲を隠すような確認に使えます。ただし、思いがけないオブジェクトまで対象になることがあるため、結果をViewerで確認してください。

## 制作例：街並みのUSDから看板だけを隠す

街路、建物、看板が1つのUSDファイル内に整理されているとします。映像に使わない看板だけを隠し、建物と道路は残します。

1. **uLoader**でUSDファイルを読み込み、出力を**uVisibility**のScene Inputへ接続します。
2. uVisibilityの**Pick**を押し、Scene Treeで目的の看板のPrimを選びます。
3. **Selected Prims**に目的の対象が表示されていることを確認します。建物全体の親Primを選ばないようにします。
4. **Invert Prim Selection**をオフにし、**Visible**をオフにします。
5. 後段のuMergeとuRendererを通した結果で、看板だけが消え、建物や道路が残っているか確認します。

ここで重要なのは、**「何を隠すか」はScene Tree、「隠すかどうか」はVisibleで指定する**という分担です。USDファイル内のPrim構成はアセットごとに異なるので、同じ名称や階層が必ず存在するわけではありません。

## ショット途中で表示を切り替える

**Visibleはキーフレームでアニメーションできます。** たとえば前半では小道具を隠し、後半から表示するといった制御が可能です。

1. 表示を切り替えたいPrimをPickで選びます。
2. 前半の時点でVisibleをオフにし、キーフレームを設定します。
3. 表示を始めたい時点へ移動し、Visibleをオンにしてキーフレームを設定します。
4. タイムラインを再生し、**uRendererの画像**で切り替わるタイミングを確認します。

これは**表示／非表示の切り替え**です。透明度が少しずつ変わるフェードとは異なります。なめらかな出現演出が必要なら、レンダリング後の2D合成など別の方法を検討します。キーフレーム間の評価タイミングや補間の細部は21.1実機で確認してください。

なお、**Invert Prim Selectionもキーフレーム対応**です。こちらを動かすと「対象がどちら側か」自体が変わるため、単に1つの小道具を出し入れしたい場合は通常Visibleだけを動かす方が意図を確認しやすくなります。

## 似たノードとの使い分け

| ノード | 変更するもの | 使う場面 |
| --- | --- | --- |
| **uVisibility** | 同じUSDシーン内のPrimの表示状態 | 看板だけ隠す、部品を出し入れする |
| [uVariant](./uvariant) | USDアセット内に定義済みのVariant | 車の屋根あり／なしなど、あらかじめ用意された仕様を選ぶ |
| [uSwitch](./uswitch) | 複数の独立したUSD入力のうち1つ | 別々のUSDファイルやシーンを切り替える |
| [uReplaceMaterial](./ureplacematerial) | 選択Primに割り当てる材質 | 同じ形状のまま色・材質を変更する |
| [uTransform](./utransform) | 選択Primの位置・回転・大きさ | 見せたままオブジェクトを動かす |

uVisibilityは**「そこにあるものを見せるか」**を変えます。uVariantは**「USD内のどの仕様を使うか」**、uSwitchは**「どの入力シーンを使うか」**を変えます。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| **Visibleをオフにしても何も変わらない** | Pickで正しいPrimを選んだか、Selected Primsに表示されているか、後段のuRendererの結果を見ているか |
| **建物や車が丸ごと消える** | 部品ではなく親ブランチを選んでいないか |
| **残したいオブジェクトまで消えた** | Invert Prim Selectionが有効になっていないか。選択範囲を再確認する |
| **選択したい部品が見つからない** | Scene Treeの階層を展開し、読み込んだUSDのPrim構成を確認する |
| **別ファイルに替えると意図した対象が消えない** | ファイルごとにPrimの名前・階層が異なる。Pickから選び直す |
| **Viewerに完成映像が表示されない** | uVisibilityの出力はUSD。カメラ・照明・uMerge・uRendererを含む描画経路を確認する |
| **アニメーションのタイミングが違う** | Visibleのキーフレーム位置を確認し、レンダリング結果で切り替えを検証する |
| **徐々に透明になる演出を作れない** | Visibleは表示状態の切り替えであり、透明度フェードではない。後段の合成方法を検討する |

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 121「USD Nodes」。**pp.2927–2928**でuVisibilityの目的、必須Scene Input 1つ、Pick、Selected Prims、Invert Prim Selection、Visibleと両チェックボックスのキーフレーム対応を確認しました。**p.2888**でScene Treeの階層・選択操作を照合しています。入手先：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

ManualのScene Input説明には、Visibilityの節なのに「second set of transformation controls」という文言があります。本稿ではそこから**移動・回転などのTransform機能があるとは解釈せず**、同節のIntroductionとInspectorで裏付けられる表示制御だけを説明しています。

制作例とトラブル診断は上記仕様に基づく操作例です。**正確な出力端子のUI表示名、既定値、キーフレーム補間の詳細、Edition差は21.1実機で未検証**のため、frontmatterの `verification: partial` を維持しています。
