---
title: Clone Multistroke
description: Paint内で多数の画素複製を効率よく行う描画方式。初期表示は1フレームで、描画後の個別編集はできない。
doc_type: node
term_id: clone-multistroke
term_short: Paintの内部で周囲や別画像の画素を複製して補修する方式。筆先と表示期間を描く前に決める。
verification: partial
aliases: [Clone Multistroke]
concepts: [paint, image-data]
nodes: [Clone Multistroke]
node_family: paint
controls: [Brush Shape, Size, Softness, Apply Mode, Duration]
inputs: []
outputs: []
tasks: [paint, cleanup, clone]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Clone Multistroke

Clone Multistrokeは、**映像の別の場所から画素を複製し、小さな不要物をまとめて隠すためのPaint内部ツール**です。例えば壁に貼ったトラッキングマーカーを周囲の壁の画素で覆うとき、1フレームに多数の補修を行えます。

[Multistroke](./multistroke)との違いは、**Clone Multistrokeではクローン用の描画設定が最初から選ばれる**ことです。Multistroke側もApply ModeをCloneに設定すれば画素複製に使えます。どちらも後から個々のストロークを編集できません。

## 入力と出力

Clone Multistrokeは独立したFlowノードではなく、[Paintノード](./paint)のViewerツールバーから選ぶ描画方式です。独自のFlow端子は持ちません。

- **PaintのInput（オレンジ）**：必須。作業する2D画像をつなぎます。画像の解像度がキャンバスの大きさになります。
- **PaintのEffect Mask（青）**：任意。補修を許可する領域を制限するマスクです。クローン参照元の端子ではありません。
- **Paintの出力**：補修した2D画像。次のMerge、Color、MediaOutなどへ接続できます。

~~~text
MediaIn → Paint（内部でClone Multistrokeを選択）→ MediaOut
~~~

Clone Multistrokeは、別の独立した画像データを流す仕組みではありません。参照元は同じ画像内の位置、またはPaint側に指定したSource画像から選びます。

## 基本操作

1. MediaInなどをPaintのオレンジ入力へつなぎ、補修したいフレームをViewerで開きます。
2. Viewer上部のPaintツールバーで**Clone Multistroke**を選びます。
3. Inspectorで**Brush Shape**、**Size**、必要に応じて**Softness**を設定します。硬い輪郭をまたぐ補修では、筆先を大きくしすぎない方が元の境界を保ちやすくなります。
4. **Duration**を設定します。初期値は1フレームです。複数フレームで同じ補修を使うなら描く前に期間を指定します。
5. **Alt / Optionを押しながら参照元をクリック**し、きれいな画素の位置を決めます。続けて不要物の位置を塗り、周囲となじむかを確認します。
6. 同じフレームの他の箇所も必要に応じて補修します。前後のフレームを確認し、不要な補修が残っていないことを確認します。

PaintのClone Apply Modeは、同じ画像の別位置や別画像を参照できます。**別ノードを参照したいとき**はPaintのInspectorにあるSource Tool / Source Nodeの参照欄へ対象ノードを指定します。この参照設定と、Flow上のInput・Effect Mask端子は別のものです。

## 描いた後の編集制限

Clone Multistrokeは大量の補修を軽く処理する代わりに、**描いた線を個別に選んで位置・形・表示期間を調整できません**。描く前に筆先、参照位置、Durationを決める必要があります。

- 期間の初期値は1フレームで、Keyframes Editorには期間を示す領域が表示されますが、描画後にそこで延長・トリムすることはできません。
- Modifiersタブでは、個々の小さな描画ごとではなく、複数の操作がまとまった項目として扱われます。
- 複数の補修をまとめて移動・回転させたい場合は、[Paint Group](./paint-group)へまとめてグループ全体を動かします。ただし、グループ化しても各線の個別編集が解放されるわけではありません。
- 修正を繰り返し、後から補修位置や経路を変える必要があるなら、編集可能な[Stroke](./stroke)を選びます。

## 実際の運用例

### 壁のトラッキングマーカーを1フレームだけ消す

~~~text
MediaIn（壁にマーカー）→ Paint → MediaOut
                           └─ Clone Multistroke
~~~

マーカーのすぐ隣にある模様や明るさが近い壁をAlt / Optionクリックで参照元に指定します。Clone Multistrokeでマーカーの上を塗ると、その位置の画素が周囲の壁と置き換わります。壁の目地や影をまたぐと違和感が出やすいため、参照元を変えて複数回に分けて補修します。初期Durationなら表示は1フレームだけです。

動画の全フレームに同じ場所の汚れがある場合、1フレーム分の補修だけでは全体の修整にはなりません。被写体の移動や模様の変化を見て、フレームごとに修正するか、長いDurationと追跡を組み合わせるかを決めます。

### 動く物体の複数マーカーを追従補修する

マーカーが付いた物体が10フレーム移動する場合、補修する前にDurationを必要なフレーム数へ変更します。複数の補修を作り、Paint GroupでひとまとめにしてGroupのCenterなどへTrackerの位置情報を接続します。これで補修全体を物体の動きに合わせる方法が取れます。動きに伴って新しい背景が現れる場合や物体が変形する場合は、元のクローン画素だけでは一致しないため、各フレームを見直します。

### 透明キャンバスにクローンを描く

~~~text
Background（Alpha 0）→ Paint → MergeのForeground
MediaIn ─────────────────────→ MergeのBackground
~~~

Paintを透明なBackgroundに接続して描画だけを別レイヤーにする場合、透明画像には**複製できる元画素がありません**。PaintのInspectorから実写画像のノードをSourceとして指定したうえでClone Multistrokeを使います。MergeのBackground側にMediaInをつないだだけではPaintの参照画像にならない点に注意します。

## ほかの描画方式との選び分け

| 方式 | 選ぶ状況 |
| --- | --- |
| [Multistroke](./multistroke) | 色を描くなど、クローン以外も含む大量の補修。Cloneへ手動で切り替えることもできる |
| **Clone Multistroke** | 画素複製を最初から使い、多数の小さな不要物を隠す |
| [Stroke](./stroke) | 補修後に線の形、位置、時間を編集・アニメーションさせる |
| [Paint Group](./paint-group) | 複数の補修操作をまとめて移動・回転・追跡する |

[Paint全体の解説](./paint)と[Paintツールの一覧](./overview)も参照してください。

## バージョンと出典

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 113「Paint Node」pp.2638–2645（Clone Multistrokeの仕様はp.2639、Clone Apply Modeはp.2643、Durationはp.2644、参照位置の操作はp.2645）、Chapter 80「Paint」pp.1748–1749、1756、1760を確認。初期Duration 1フレーム、描画後の編集制限、参照元指定、Paint Groupを使う運用を記載しました。現行Resolve 21.1実機での内部REGID、Inspectorの全項目・初期値と版差の確認は未実施のため、verificationはpartialです。
