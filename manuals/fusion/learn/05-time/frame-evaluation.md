---
title: フレーム評価（Frame Evaluation）
description: Fusionが各フレームの画像とパラメータ値をどう決めるかを、キーフレーム、式、リタイム、レンダリングの例で説明する。
doc_type: concept
term_id: frame-evaluation
term_short: 現在の時刻に応じて入力画像とパラメータ値を求め、Fusionの出力フレームを作ること。
verification: partial
aliases: [frame evaluation, composition time, source time, render request]
concepts: [evaluation, time, render-request]
tasks: [animate, debug, temporal-effect, automate]
prerequisites: [node-graph, keyframes]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-12"
---

# フレーム評価（Frame Evaluation）

同じNodeでも、再生位置を変えると画像や数値が変わります。Fusionはその位置で必要な入力画像を読み、キーフレームや式から値を求め、Nodeを通して結果を作ります。この一連の処理が**フレームの評価**です。

ここで区別したいのは、**「今どのフレームを出力するか」と「素材のどのフレームを読むか」は同じとは限らない**という点です。特にリタイムや、時間を参照するExpressionを使うときに重要になります。

## このページで分かること

- キーフレームに保存した値と、現在フレームで計算された値の違い
- コンポジションの時間と、素材から読み出す時間の違い
- Time Stretcherで動画を早送り・停止するとき、何が変わるか
- Viewerでは正しいのに書き出しで結果が違うときの確認順序

## 基本の考え方

時間を扱うときは、次の4つを分けて考えます。

| 確認するもの | 何を意味するか | 例 |
| --- | --- | --- |
| コンポジションの時間 | Fusionが今、どの出力フレームを作ろうとしているか | フレーム24を表示する |
| パラメータの評価値 | その時刻のキーフレーム・式・Modifierから求めた値 | フレーム24ではTransformのSizeが1.2 |
| 素材の参照位置 | 元の動画・連番画像のどこを読み出すか | 出力フレーム24で素材の99番目を読む |
| レンダリングの要求 | Viewerや書き出し側が、どの結果を必要としているか | 指定されたフレームを計算して返す |

「評価値」とは、単にInspectorへ入力した数値のことではありません。たとえばSizeのキーを0フレームに`0.8`、24フレームに`1.2`と置いた場合、途中の値はキーフレーム間の補間（Spline）によって決まります。SimpleExpressionが付いていれば、式の計算結果が値になります。

また、**素材の参照位置は必ずしも元ファイルのタイムコードではありません**。以下のTime Stretcherの`Source Time`は、Nodeが入力シーケンスから読むフレーム位置を指定する設定です。タイムライン上の時刻表示と数字が一致するとは限りません。

## 最小例：出力フレーム24で素材の99番目を表示する

DaVinci Resolve 21.1 Reference ManualのTime Stretcherの例を使います。100フレームの素材を、25フレームの出力へ縮める構成です。

```text
MediaIn → Time Stretcher → MediaOut
```

1. 動画をMediaInからTime Stretcherへ接続し、その出力をMediaOutへつなぎます。
2. Time StretcherのInspectorで`Source Time`を確認します。Nodeを追加した時点で、ここには値`0.0`のキーフレームが1つ入っています。
3. 出力フレーム0で`Source Time = 0`、出力フレーム24で`Source Time = 99`になるよう、キーフレームを配置します。
4. Spline Editorで、2点の間が直線（Linear）になっていることを確認します。
5. 出力フレーム0・12・24へ移動し、どの元フレームが表示されるかを確認します。

| 出力側のフレーム | Source Time（入力側の読み出し位置） | 何が起きるか |
| ---: | ---: | --- |
| 0 | 0 | 素材の先頭を読む |
| 12 | 49.5 | 素材の中ほどを参照する |
| 24 | 99 | 素材の終端を読む |

フレーム12の`49.5`は2つのキーを直線で結んだ場合の計算上の値です。実際にどの画像が表示されるかは、`Interpolate Mode`にも左右されます。

- `Nearest`は近い元フレームを使い、必要に応じて間引き・複製します。
- `Blend`は隣接フレームを混ぜます。動体には残像が見える場合があります。
- `Flow`は動きのベクトルから中間画像を作ります。ただし、前段でOptical FlowなどによりVector / BackVectorを用意する必要があります。

つまり、**「何番目を読むか」と「整数のフレーム間をどう描画するか」も別の設定**です。

Time Stretcherの端子、補間、初期キーフレームの詳細は[Time Stretcher](../../nodes/time-metadata/time-stretcher)にまとめています。

## パラメータの時間と素材の時間を分ける

今度はTime Stretcherの後ろへTransformを追加します。

```text
MediaIn → Time Stretcher → Transform → MediaOut
```

TransformのSizeに、出力フレーム0で`0.8`、出力フレーム24で`1.2`のキーを置きます。

出力フレーム24では、Time Stretcherが入力素材の99番目を選び、その後段のTransformがその時刻のSizeを使って画像を拡大します。**素材が99番目だからといって、後段Transformのキーフレームを99番目に置くわけではありません。**

この考え方は、リタイム後の素材に新しく文字を重ねる場合にも使えます。文字の表示タイミングを出力側に合わせたいなら、どこへNodeを置くかを確認してください。

反対に、TransformをTime Stretcherの**前**へ置いた場合は、Transformを通った画像の時間をTime Stretcherが読み直す構成になります。リタイムしたいのが「素材だけ」なのか「前段の処理を含む映像」なのかで接続順を決めます。複雑な時間依存Nodeを組み合わせる場合は、同じ出力フレームで前後のViewerを比較してください。

## 1つだけ変えて確認する：止めるのは素材か、アニメーションか

先ほどの構成のうち、Time Stretcherの`Source Time`だけを一定値にします。たとえば12番目を読み続けるように固定します。初期の`Source Time`キーフレームが残っている場合は、それを外して値が時間で変わらない状態にします。

```text
MediaIn → Time Stretcher（Source Timeを固定）→ Transform → MediaOut
```

これでTime Stretcherの出力は同じ元フレームを表示し続けます。一方、後段TransformのSizeにはキーフレームが残っています。したがって、静止した素材を拡大するアニメーションは作れます。

- **素材だけ止めたい**：Time StretcherのSource Timeを固定する。
- **拡大も止めたい**：Transform側のアニメーションも確認する。
- **出力フレームを変えても絵が全く変わらない**：Source Timeと後段パラメータの両方を見る。

「画面が止まっている」だけでは、素材の参照位置が固定されたのか、後段の値まで固定されたのかは分かりません。

## 値はどこから来るか：KeyframeとExpression

同じTransformのSizeでも、値の供給方法はいくつかあります。

### キーフレーム

InspectorでSizeをアニメーションさせると、指定したフレームの値が保存され、間の値はSplineで補間されます。InspectorとSpline Editorで、**キーの時刻・値・補間**を確認します。

→ [キーフレーム / スプライン / 時間](./keyframes-spline-time)

### SimpleExpression

式で値を決めている場合は、現在フレームや別パラメータを計算に使えます。21.1 Manualでは`time`が現在のフレーム番号を返します。

```lua
sin(time/20)/2+.5
```

この式をSizeへ使うと、値は時間に応じて周期的に変化します。`time`は秒数ではなくフレーム番号なので、秒ベースの式だと思い込まないでください。

別のフレームの値を参照する例もManualにあります。

```lua
Merge1:GetValue("Blend", time-5)
```

これはMerge1のBlendを現在より5フレーム前から読み出す式です。「1つ前のフレームで実行された処理の結果を記憶して使う」という意味ではありません。別時刻の値を明示的に要求しています。

→ [式（Expressions）](./expressions) / [Modifier / パラメータの供給元](./modifier-parameter-sources)

## 共通ルール：順番に1フレームずつ計算されるとは限らない

Viewerでフレームを飛ばして移動したり、キャッシュ済みの結果を再利用したりすると、観察する順番と計算が必要になる順番は一致しません。

さらにFusionのレンダリングには、複数フレームを同時に処理する設定があります。21.1 ManualのChapter 65では、ネットワークレンダリング用の`Render Several Frames at Once`と、複数の枝を並列に処理する`Simultaneous Branching`が説明されています。

そのため、Expressionや独自の処理を設計するときは、**「必ず0→1→2と順に評価される」「直前に実行した結果が次のフレームまで残る」ことを前提にしない**方が安全です。

前後フレームが必要な処理は、必要な時刻を明示して読みます。Time Speed / Time StretcherのようなNodeは近接フレームを読むことがあるため、ネットワークレンダリングでは素材の読み出し量が増える場合もあります。

これは時間依存処理を作るときの設計上の注意であり、各Nodeの内部キャッシュ方式やAPIの呼び出し順まで保証する説明ではありません。

## 他のNodeへ応用する

### Time Speed：一定速度なら対応を簡単に指定する

[Time Speed](../../nodes/time-metadata/time-speed)は、素材を一定の割合で早く・遅く再生したいときのNodeです。`Speed = 0.5`なら50%、`Speed = 2.0`なら200%です。21.1 Manualでは`Speed`をアニメーションできないと明記されています。

途中で加速・停止・逆再生を組み合わせたい場合は、Time Stretcherの`Source Time`をSplineで操作します。**一定速度の指定と、出力時刻から素材時刻への対応表を作ること**を使い分けます。

### Optical Flow：別の時刻の画像を補う

[Optical Flow](../../nodes/optical-flow/optical-flow)は連続フレームの動きを解析し、Vector / BackVectorを生成します。Time StretcherやTime Speedを`Flow`補間で使う場合、次のように前段へ接続します。

```text
MediaIn → Optical Flow → Time Stretcher → MediaOut
```

リタイム処理ではこれらの補助チャンネルが消費されるため、**リタイム後の映像の動きを解析したい場合は、後段でもう一度Optical Flowを使います**。素材の読み出し時刻と、動きを推定する対象時刻を混同しないための例です。

### Merge：画像のタイミングと合成量を分ける

MergeのBlendをキーフレームで変えると、同じ入力でも合成の強さが時間で変化します。一方、Time Stretcherで前景の映像を止めると、前景に使われる画像自体が固定されます。

「前景が動かない」と「前景が見えなくなる」は別の操作なので、MergeのBlendと前景に入るImageを別々に確認します。

## 初見のNodeで確認する順序

どのNodeで時間の問題が起きても、次の順序で確認できます。

1. **出力時刻**：Viewerまたは書き出しで問題が起きるのは何フレームか。
2. **素材時刻**：Time Speed / Time Stretcher / MediaInの前後で、どの元フレームが表示されるか。
3. **パラメータ**：そのフレームでInspectorの値が想定どおりか。値の供給元はKeyframeかExpressionかModifierか。
4. **接続順**：時間を変更するNodeより前と後のどちらで処理しているか。
5. **補間方式**：Nearest / Blend / Flowの違いによる見た目か。
6. **再評価**：一部だけ書き出す、問題フレームへ直接移動するなど、連続再生に依存しない条件でも再現するか。

最初は問題のNodeと前後のNodeをそれぞれViewerへ表示し、表示内容を比較します。複数の設定を一度に変えない方が原因を特定しやすくなります。

## よくある誤解と確認先

| 症状・思い込み | 先に確認すること |
| --- | --- |
| 出力フレーム24だから素材も24番目だと思った | Time Stretcherの`Source Time`と、Time Speedの速度・時間オフセット |
| Freezeしたのに画面が拡大し続ける | 固定されたのは素材だけか。後段Transformのキーが残っていないか |
| 静止したつもりなのに別のフレームへ変わる | Source Timeの初期キーやSplineが残っていないか |
| スロー再生で映像がカクつく | `Nearest`がフレームを複製していないか |
| スロー再生で二重像・歪みが出る | `Blend`の残像、`Flow`の動き推定の失敗を比較する |
| 式に`time`を入れたが速さが合わない | 現在フレーム番号を使う式か、時間の単位を秒と取り違えていないか |
| 連続再生では正しいが特定フレームの書き出しで違う | 前フレームの評価結果へ暗黙に依存する構成になっていないか |
| 画像が変わらないのにInspectorの値だけ動いている | 後段Nodeがそのパラメータの変化を表示に反映する接続になっているか |

最後の2項目は原因を断定するものではありません。問題を切り分けるための確認候補です。画像接続自体の問題であれば[Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)も参照してください。

## 関連する再利用構成

- [Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)：Nodeごとに期待した結果が出ているかを順番に比較する。
- [キーフレーム / スプライン / 時間](./keyframes-spline-time)：パラメータの時間変化と補間を調整する。
- [式（Expressions）](./expressions)：現在時刻や別時刻の値を明示的に参照する。

## 関連Node

- [Time Stretcher](../../nodes/time-metadata/time-stretcher)
- [Time Speed](../../nodes/time-metadata/time-speed)
- [Optical Flow](../../nodes/optical-flow/optical-flow)

## 次に読む

リタイムが目的なら[Time Stretcher](../../nodes/time-metadata/time-stretcher)を、キーフレームを整えるなら[キーフレーム / スプライン / 時間](./keyframes-spline-time)を、値の出どころを調べるなら[Modifier / パラメータの供給元](./modifier-parameter-sources)を参照してください。

## バージョンと出典

基準：**DaVinci Resolve 21.1 Reference Manual（2026年9月）**。

- Chapter 65「Rendering Using Saver Nodes」p.1376：複数フレームの同時レンダリング、並列枝処理、リタイム時のI/O負荷。
- Chapter 70「Animating in Fusion’s Keyframes Editor」pp.1519–1520：Inspectorでのキー操作と時刻編集。
- Chapter 71「Animating in Fusion’s Spline Editor」pp.1535–1536：時間に対するパラメータ値、Splineによる補間。
- Chapter 73「Using Modifiers, Expressions, and Custom Controls」pp.1586–1588：`time`、`GetValue()`、SimpleExpressionの仕組み。
- Chapter 111「Miscellaneous Nodes」pp.2607–2612：Time Speed / Time Stretcher、`Source Time`、補間方式、100→25フレームの例。
- 公式配布元：[Blackmagic Design Support Center](https://www.blackmagicdesign.com/support)。

フレーム番号とパラメータ値の例は説明用です。ここではManualに記載された動作と診断上の考え方を整理しており、21.1実機での全Nodeの評価順、内部キャッシュ、host別・edition別の違いまでは検証していません。そのため`verification: partial`を維持します。
