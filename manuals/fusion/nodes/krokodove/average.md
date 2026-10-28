---
title: Average（Krokodove）
description: 連続する複数フレームを重ね合わせるAverageの仕組みと、残像・ちらつき・モーションブラーとの違いを解説。
doc_type: node
term_id: average
term_short: 連続する複数フレームを平均して、時間の異なる画像が重なったような結果を作るKrokodoveツール。
verification: partial
aliases: [Average]
concepts: [image-data]
nodes: [Average]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-20'
---

# Average（Krokodove）

**Average**は、連続する複数フレームの画像を平均し、**異なる時刻の映像を重ねたような見た目**にするKrokodoveの画像ツールです。DaVinci Resolve 21.1 Reference Manualでは、複数の連続フレームを平均することで「frame blending」の効果を作る、と説明されています。

たとえば、画面を横切る白い円を想像してください。通常は現在の位置の円だけが見えますが、異なる時刻の画像が混ざると、移動前後の位置にも薄い円が残ったように見える可能性があります。**一枚のフレーム内で周囲の画素をぼかす処理ではなく、時間の異なるフレームを材料にする**点が重要です。

公式Manualの当該項目は短い機能説明です。平均に使うフレーム数、過去と未来のどちらを参照するか、混合の重み、Inspectorの正式項目名は記載されていません。このページでは、公式に確認できた働きと、想定できる使い方を分けます。

## 何が起きるのか

動画は、わずかに異なる画像を時間順に並べたものです。Averageは、そのうち連続する複数の画像を組み合わせます。

- **動きの少ない部分：** 複数のフレームでほぼ同じ場所に写っているため、見た目の変化が小さいことがあります。
- **動く被写体：** フレームごとに位置が違えば、輪郭が重なったり、薄い残像のように見えたりする可能性があります。
- **一瞬だけ現れる明るい要素：** 前後のフレームと混ざると、単独フレームで見たときとは明るさや見え方が変わる可能性があります。

これらは時間方向に画像を平均する処理から考えられる**視覚的な傾向**です。21.1 Manualには各画素の具体的な演算式やAlphaの扱いまでは示されていません。「必ずノイズが消える」「必ず滑らかなモーションブラーになる」とは断定できません。

同じ「平均」でも、画面内の隣接ピクセルを混ぜる空間的なブラーとは別の考え方です。Averageを理解するときは、**どの位置の画素を混ぜるか**より先に、**どの時刻の画像を混ぜるか**を考えます。

<!-- capture:S268 -->

## 実機例：動く文字のフレームを重ねる

位置が時間とともに変わる合成文字 `A` を `Average` に接続し、Number of Framesを12に設定しました。フレーム60では、出力の文字が複数の位置で重なったように見えます。入力位置はフレーム50と60で異なることをSDKで読み戻しています。Viewerの市松模様は透明部分の表示です。ほかの時間設定やAlpha値は未検証です。[接続と設定の記録](/img/fusion/captures/S268/readback.json)に条件を記載しています。

[![動く文字をAverageへつなぐノード構成](/img/fusion/captures/S268/graph.png)](/img/fusion/captures/S268/graph.png)

合成文字をAverageへ渡します。

[![AverageのInspector](/img/fusion/captures/S268/controls.png)](/img/fusion/captures/S268/controls.png)

Number of Framesは12です。

[![フレーム60の入力文字A](/img/fusion/captures/S268/low.png)](/img/fusion/captures/S268/low.png)

入力の文字をフレーム60で表示しています。

[![重なって見えるAverageの出力](/img/fusion/captures/S268/high.png)](/img/fusion/captures/S268/high.png)

出力では文字が複数の位置で重なったように見えます。

[再現用Graph](/img/fusion/captures/S268/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S268/capture.json)

<!-- /capture:S268 -->

## 入力と出力

| 段階 | データ | 役割 |
| --- | --- | --- |
| 入力 | 2D <Term id="image">Image</Term> | 時間変化のある映像・合成画像を受け取る。 |
| 処理 | Average | 連続する複数フレームを平均し、frame blendingの結果を作る。 |
| 出力 | 2D Image | 時間方向の混合を適用した画像を後段へ渡す。 |

この分類は、21.1 Manualの「Image Pixel Tools」とCOLLECTANEAの既存カタログに基づきます。**実際の入力端子数・端子の色・正式名称、Effect Maskの有無、Alpha処理、境界フレームの扱い**は未確認です。入力を一つの画像系列として説明していることは、補助入力が存在しないことの証明ではありません。

静止画一枚よりも、位置や明るさが時間とともに変化する短い動画のほうが効果を観察しやすいでしょう。静止画で差が見えなくても、それだけで処理が無効だとは判断できません。

## 主な用途と向き・不向き

### 動きに残像感を加える

手や光点が素早く動く映像、図形が横切るモーショングラフィックスなどで、時間の異なる位置を重ねた表現を試す用途です。輪郭の重なり方によっては、動きを柔らかく見せるよりも**二重像・多重像**が目立つことがあります。

映画撮影のシャッターによって生じるモーションブラーや、動きベクトルに沿ってブラーを生成する処理と、同じ結果になるとは限りません。

### 時間的な揺らぎを弱める可能性を試す

固定カメラで撮った背景の細かな明滅などは、フレームを混ぜることで見た目が変わる場合があります。ただし、Averageが**ちらつき除去専用ツール**として説明されているわけではありません。周期的な光の明滅、局所的な露出変動、フレームごとに変わる対象を安定させたい場合は、[Deflicker](./deflicker)も候補です。

動く人物やカメラのパンがある映像では、揺らぎが弱まる代わりに像が重なって見える可能性があるため、効果の是非は素材ごとに判断します。

### デザイン上の時間の重なりを作る

文字・点・幾何学図形などを少しずつ移動させた素材に使えば、前後の位置が同じ画面に残るような表現を検討できます。これは公式作例ではなく、frame blendingという機能説明から考えた**制作案**です。

## 最小構成：移動する図形で確かめる

次は検証用の接続案です。公式Manualに掲載されたノードグラフの再現ではありません。

    Background（単色） → Merge ─→ Average ─→ MediaOut
                           ↑
                  Transform ← EllipseでマスクしたBackground

1. 透明背景に白い円が一つある短いアニメーションを作ります。上図は一例で、既存の動画素材をMediaInから渡しても構いません。
2. 円を数十フレームかけて左右に動かします。動きのないフレームと、位置が変わるフレームの両方を用意すると比較しやすくなります。
3. Averageの前後を別々のViewerへ表示し、同じ再生位置の形を比べます。出力に前後の位置の痕跡があるかを観察します。
4. Inspectorで時間方向の混合範囲や強さに相当する設定を**実際に確認できた場合に限り**、一項目ずつ変えて違いを調べます。今回の実機例ではNumber of Framesを12に設定しています。値を変えた比較は未検証です。
5. 最後に、元映像・Average後・合成後を同じフレームで比較します。特に輪郭の二重化、明るさ、透明部分の見え方を確認します。

円の代わりに文字を動かす場合は、細い文字ほど輪郭の重なりが読みづらさにつながることがあります。演出として使う場合も、完成サイズで読めるかを判断してください。

## 似たツールとの違い

### 標準のFrame Averageとの違い

Fusionには、名前も処理の目的も似た[Frame Average](../time-metadata/frame-average)という**標準ノード**があります。KrokodoveのAverageと同じものではありません。どちらも時間の異なるフレームを平均しますが、**Inspectorで何を指定できるかは分けて読む**必要があります。

- **Krokodove Average**：21.1 ManualのChapter 105、p.2435では、連続する複数フレームを平均してframe blendingを作ると説明されています。参照方向・フレーム数・欠損フレームの設定名は、この項目には記載されていません。
- **標準Frame Average**：Chapter 111、pp.2596–2597では、単一の2D Image入力に加え、**Sample Direction**（Forward / Both / Backward）、**Frames**、**Missing Frames**を説明しています。前後のどの時刻を読むか、必要なフレームが存在しないときにどう扱うかを指定できます。

たとえば「動く物体の**過去の位置だけ**を残したい」という目的で、Sample DirectionのBackwardを使う手順は**標準Frame Averageについて確認できる操作**です。同じ名前の項目をKrokodove AverageのInspectorで探す手順にはしません。Krokodove版では、実際のノード表示と時間方向の結果を確認してから設定を決めます。


| ツール | 21.1 Manualなどで確認できる中心的な働き | 使い分け |
| --- | --- | --- |
| **Average** | 連続する複数フレームを平均し、frame blendingを作る。 | 異なる時刻の像を重ねる表現を試す。 |
| [Frame Average（標準Fusion）](../time-metadata/frame-average) | 複数フレームを平均。Sample Direction・Frames・Missing Framesを21.1 Manualで確認できる。 | 参照する時間方向や欠損フレームの扱いを明示して設定したい。 |
| [Deflicker](./deflicker) | 連続フレーム間の局所的・全体的なちらつきを取り除く。 | 明るさなどの時間変動の補正が主目的。 |
| [Time Mapper](./time-mapper) | 外部の画像マップによってシーケンス中の異なる時刻を組み合わせる。 | 画像内の場所に応じた時間の操作を検討する。 |
| [Seamless Loop](./seamless-loop) | コンポジションの時間を調整し、ループするシーケンスを作る。 | 動画の始点と終点をつなぐことが目的。 |

時間の混合は、動き情報を解析して新しい中間フレームを作る処理とも同義ではありません。フレームの位置ずれを考慮した補間やmotion-vector blurを必要とする場合、単純なframe blendingと目的を分けて検討します。

## 制作時に確認すること

- **前後のフレーム：** どの範囲の時刻を参照するか、クリップの先頭・末尾でどのように処理するかはManualの短い説明だけでは分かりません。
- **似た名前の設定：** 標準Frame AverageのSample Direction / Frames / Missing Framesを、Krokodove Averageの設定として流用しないでください。Chapter 105にはその対応関係が示されていません。
- **Alphaと合成：** 透明なグラフィックを混ぜたときのRGBとAlphaの処理方法は未確認です。背景に重ねる場合はMerge後まで確認してください。
- **動くエッジ：** 多重像は狙いによって長所にも欠点にもなります。人物の顔、細かい文字、輪郭の強い図形では特に見比べます。
- **パフォーマンス：** 複数時刻の画像を扱うため処理負荷を確認する価値はありますが、内部キャッシュの方式や具体的な負荷は未計測です。
- **バージョン／Edition：** 実機例ではNumber of Framesを確認しました。Node登録名、その他のInspector項目の意味・初期値・値域、Resolve Free／Studio／Fusion Studio間の差は未確認です。

## 出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2435、Image Pixel Tools — Average**。同ページの表では、複数の連続フレームを平均し、frame blendingの効果を作るツールとして説明されています。比較対象のDeflickerは同Chapterのp.2436、Time MapperとSeamless Loopも同Chapterに掲載されています。**標準Frame Average**は同Manual Chapter 111、pp.2596–2597で入力とInspectorの設定を確認しました。

公式資料の入口：[Blackmagic Design サポート](https://www.blackmagicdesign.com/jp/support/)。

用途・接続案・視覚的な傾向は、Manualの記載をもとにした説明または**検証の提案**です。実機例はフレーム60の一条件に限られます。正確な入力端子、他のControlの動作方式や製品差は未確認のため、verification: partialを維持します。関連するデータの考え方は[Imageの解説](../../learn/02-data/image)、Krokodove内の位置づけは[ファミリー概要](./)を参照してください。
