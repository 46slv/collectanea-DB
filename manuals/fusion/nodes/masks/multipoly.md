---
title: MultiPoly
description: 複数のPolygonとB-Splineを1つのマスクとして管理するFusionノード。List viewでの形状編集、アニメーション、分割と接続例を説明。
doc_type: node
term_id: multipoly
term_short: 複数の自由曲線マスクを1つのノードのリストで編集し、まとめて出力する。
verification: partial
aliases: [MultiPoly, MPly]
concepts: [mask-data, spline, roto]
nodes: [MultiPoly]
node_family: masks
outputs: [mask]
tasks: [create-mask, roto, manage-masks]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# MultiPoly

MultiPolyは、複数の**Polygon（ベジェ曲線）**と**B-Spline（滑らかな自由曲線）**を、1つのノードのリストで管理するマスクノードです。人物の顔、髪、腕などを別々の輪郭で追いながら、最終的には1つのマスクとして後段へ渡せます。

動く対象の輪郭をフレームごとに合わせる作業を**ロトスコーピング（ロト）**と呼びます。MultiPolyはロトの自動追跡ツールではなく、複数の輪郭を選び、並べ替え、個別に編集・アニメーションするための作業面を持ったノードです。[マスクの基礎](../../learn/02-data/mask)と[Polygon Mask](./polygon-mask)を先に読むと、白黒の意味や制御点の編集が分かりやすくなります。

## 入力・出力と接続

MultiPolyが作るのは、RGBA映像ではなく、白・黒・グレーの値で処理範囲を示す**単一チャンネルのマスク**です。白は効果を適用する領域、黒は適用しない領域、グレーは部分的に適用する領域を表します。

| 接続先・データ | 役割 |
| --- | --- |
| **MultiPolyの出力：Mask** | リスト内で作成した複数の輪郭を、後段に渡す1つのマスクとして扱う |
| **BlurなどのEffect Mask入力（青）** | MultiPolyのマスクを受け取り、画像処理を適用する範囲を限定する |
| **Blurなどの画像入力** | 実際に加工する映像を受け取る。MultiPolyの出力とは別の経路 |

~~~text
MediaIn ───────────→ Blur ───────────→ MediaOut
                      ↑ Effect Mask
                   MultiPoly
                ┌── 顔のPolygon
                ├── 髪のB-Spline
                └── 腕のPolygon
~~~

最初に映像を`MediaIn → Blur → MediaOut`へ流し、MultiPolyの出力をBlurの青いEffect Mask入力へつなぎます。MultiPolyの形状を直すと、**Blurをかける場所**が変わります。映像自体の位置やBlurの強さをMultiPolyが変更するわけではありません。

21.1マニュアルのMultiPoly固有の説明は、形状リストと編集操作が中心です。MultiPoly側の追加入力端子の名称・型や、リスト内の輪郭同士の合成演算を一つずつ定義した仕様は、その節からは確定できないため、ここでは断定しません。

## 輪郭を作ってList viewで管理する

1. MultiPolyをFlowへ追加して選択し、対象の映像をViewerに表示します。
2. Inspectorの**Polygon**または**BSpline**ボタンで形状を追加します。Viewer上部の作成ツールから輪郭を描くこともできます。
3. Viewerで点を順に置きます。最後に**最初の点を再度クリック**すると輪郭が閉じます。
4. Inspectorの**List view**に追加された形状を選び、下側のコントロールでその形を編集します。
5. 対象の部位ごとに形状を追加し、用途が分かる名前へ変更します。

List viewでは、形状の**選択・改名・並べ替え・表示切り替え**ができます。例えば「顔」「右腕」「左腕」と名前を付けると、制御点が重なる場面でも編集対象を見失いにくくなります。並べ替えはリスト内の管理操作として説明されており、**並べた順序だけで特定のマスク演算になる**とは扱いません。結果は出力マスクをViewerで確認してください。

Polygonは制御点とベジェハンドルで曲線を細かく調整します。[B-Spline Mask](./b-spline-mask)は制御点とTensionを使い、少ない点で滑らかな輪郭を作る方式です。輪郭の一部を鋭く合わせたい箇所と、大きく滑らかに追いたい箇所とで使い分けられます。

## 形状をフレームごとに動かす

21.1マニュアルでは、Inspector下部の**Right-click here for shape animation**の横にある**ダイヤモンド**を押すか、その文字を右クリックして**Animate**を選ぶ方法が案内されています。

1. 動きの基準になるフレームで、編集したい形状をList viewから選択します。
2. Shape Animationを有効にして輪郭を合わせます。
3. 時間を進め、対象の形や位置が変わったフレームで輪郭を修正します。
4. 中間フレームで、補間された線が対象から外れていないか確認します。ずれていればそのフレームも調整します。
5. 次の部位へ移るときは、**List viewで対象の形状を選び直してから**編集します。

例えば歩く人物の腕は、手が体に重なるフレームで見かけの輪郭が変わります。顔のマスクを編集したまま腕の点を動かそうとしないよう、リストの選択状態を先に確認してください。キーフレームの補間やViewerでの点編集については[Polygon Mask](./polygon-mask)を参照できます。

## 右クリックメニュー

List view内の形状を右クリックすると、21.1マニュアルには以下の操作が記載されています。

| 操作 | 結果と使いどころ |
| --- | --- |
| **Duplicate** | 選択したマスク形状のコピーをリストへ追加する。似た輪郭から作り直したい場合に使う |
| **Split here** | 選択した形状と**その下にある形状**を、新しいMultiPolyノードへコピーして分ける。リストを分割したいときに使う |
| **Rename** | 選択した形状の名前を変える。部位や役割を明示できる |
| **Reset to default** | リストの項目は残し、輪郭形状を消してその項目の設定を初期化する |
| **Delete** | 選択したマスク形状の項目を削除する |

**Split here**は「選択した1形状だけを別ノードに移す」操作ではありません。選択行より下の形状も新しいMultiPolyへコピーされるため、分割前にList viewの順序を確認します。元ノードの項目が削除されるかどうかなど、マニュアルが明記していない副作用はここでは推測しません。

## 運用例

### 顔・髪・腕を分けて一度にぼかす

人物の顔をPolygon、細かな髪の外形をB-Spline、腕を別のPolygonで囲います。顔が正面から横向きになるときは顔の形状を、腕を振るときは腕の形状を選んで直します。これらをMultiPolyで管理し、その出力をBlurのEffect Maskへ接続すれば、3つの部位を対象にした部分ぼかしの範囲をまとめて扱えます。

一方、顔だけはBlur、腕だけは別の色補正をかけたい場合、同じマスク出力を共有するより**別ノードや別マスク経路**を設けた方が、どの効果がどの領域にかかるかを追いやすくなります。

### まとめた人物マスクから看板の領域を除く

人物の複数部位をMultiPolyで囲った後、手前の四角い看板と重なる部分だけをぼかし対象から除外する例です。

~~~text
MultiPoly（人物） ─→ Rectangle Mask（看板、Paint Mode: Subtract）
                                         ↓ Effect Mask
MediaIn ───────────────────────────────→ Blur ─→ MediaOut
~~~

[Rectangle Mask](./rectangle-mask)の青いEffect Mask入力へMultiPolyの出力をつなぎ、Rectangle Maskで看板を囲って**Paint Mode = Subtract**にします。その出力をBlurへ渡すと、人物のマスクから看板に重なる範囲を差し引いた領域だけがぼかされます。MultiPoly内部の形状順序に演算を期待するのではなく、Flow上で除外操作を明示する組み方です。

### 形状が増えたら分割する

長いロト作業で顔・髪・手・持ち物を同じMultiPolyに入れていると、編集したい形状を選ぶだけでも時間がかかります。例えば持ち物に関する形状をリスト下側へ集め、先頭の持ち物形状を右クリックして**Split here**を選びます。新しいMultiPolyに持ち物の形状群がコピーされるので、両ノードの出力を個別に確認し、必要なマスク経路へ接続します。分割後の合成方法は用途に合わせて設計し直してください。

## 選び方と関連項目

- **[Polygon Mask](./polygon-mask)**：複雑でも1つの輪郭を細かく編集したい場合。
- **[B-Spline Mask](./b-spline-mask)**：少ない点で滑らかな輪郭を作りたい場合。
- **MultiPoly**：複数の輪郭を1つのList viewで選択・整理し、まとまったマスクとして管理したい場合。
- **複数の独立したMaskノード**：効果を分けたい場合や、[Paint Modeによる合成](./)をFlow上で明示したい場合。

解像度、Clipping Mode、Motion Blurなど、形状そのもの以外の設定は[Mask共通Controls](./common-controls)を参照してください。マスクとRGBA画像の違いは[Image / Mask / Data](../../learn/02-data/image-mask-data)で説明しています。

## バージョン・出典・未確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 108「Mask Nodes」**pp.2478–2480**「MultiPoly [MPly]」を参照しました。Polygon / BSplineの追加、Viewerでの閉じ方、List viewの選択・改名・並べ替え・表示、Shape Animationの開始操作、右クリックメニューの5項目は同節の説明に基づきます。

`MPly`はマニュアル内の選択用略号で、内部REGIDだとは確認していません。上記の接続例はMaskノードの一般的な働きを踏まえた構成例です。**21.1実機での個々の入力端子、MultiPoly内部の形状合成順、キー補間・Free／Studio差は未検証**のため、`verification: partial`を維持します。
