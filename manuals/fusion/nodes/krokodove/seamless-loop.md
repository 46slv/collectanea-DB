---
title: Seamless Loop
description: KrokodoveのSeamless Loopでコンポジションの時間を調整し、繰り返し再生の継ぎ目を考えるための使い方と注意点。
doc_type: node
term_id: seamless-loop
term_short: コンポジションの時間を調整して、終端から冒頭へ戻る繰り返し映像を作るKrokodoveツール。
verification: partial
aliases: [Seamless Loop]
concepts: [image-data]
nodes: [Seamless Loop]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# Seamless Loop

**Seamless Loopは、コンポジションの時間の扱いを変え、繰り返し再生できる映像を作るためのKrokodoveツール**です。DaVinci Resolve 21.1 Reference Manualでは、時間を調整するコントロールを備え、継ぎ目のないループシーケンスを組み立てるものと説明されています。

ここでいう「継ぎ目」は**画面の左右端ではなく、映像の最後から最初へ戻る瞬間**です。同じKrokodoveの[Seamless](./seamless)は画像の反対側の端を鏡映しにして混ぜるツールであり、対象が異なります。

## 「時間の継ぎ目」をなくすとは

短いアニメーションを何度も再生すると、通常は最後のフレームの直後に最初のフレームへ戻ります。最後と最初で物体の位置、明るさ、模様などが大きく違うと、そこだけ急に飛んだように見えます。

```text
通常の繰り返し
最初 → 中間 → 最後 │ 最初 → 中間 → 最後 ...
                  ↑ ここで映像が跳ぶことがある
```

**時間方向のループ**は、この戻り目を目立ちにくくするように映像の時間構成を考える作業です。Seamless Loopは、そのためにコンポジションのタイミングを調整する候補となります。

ただし、21.1 Manualには「どのフレームを再利用するか」「時間を重ねてブレンドするか」「どのような補間を行うか」といった**具体的な内部処理は記載されていません**。クロスフェードや自動モーション補間を必ず行うツールとしては案内しません。

## 入力・処理・出力

| 項目 | 説明 |
| --- | --- |
| 扱う対象 | 時間の変化を持つコンポジション、映像シーケンス |
| 入力の分類 | 既存COLLECTANEAカタログでは **2D Image** に分類 |
| 主な処理 | コンポジションのタイミングを調整し、ループするシーケンスを作る |
| 出力の分類 | 同カタログでは **2D Image** に分類 |
| 実機例 | Text+をInputへつなぎ、Loop Length 100とDissolve Length 25を設定して3つの静止フレームを確認 |
| 未確認 | 他の端子・設定、既定値・範囲、フレーム補間の方式と連続再生 |

<Term id="image">Image</Term>はピクセルを持つ画像データです。静止画の色や形を変えるだけの効果と異なり、Seamless Loopの目的を理解するには**複数フレームを時間順に確認する**必要があります。

frontmatterの `inputs: [image]` / `outputs: [image]` は既存カタログのデータ種別であり、実機の全端子仕様を示すものではありません。また、Manualの *comp* はコンポジションを指します。単一画像だけでなく、前段で組み立てた動きのある結果を考えると用途が分かりやすくなります。

## どんなときに使うか

### 繰り返すモーショングラフィックス

背景の模様、線、光、抽象的な動きなどを短い区間で繰り返したい場合に候補になります。たとえば背景の明るい帯が移動するアニメーションなら、最後から最初へ戻ったときに帯が突然違う位置へ移らないかを確認します。

### 画面内で流し続ける背景

配信画面やタイトルの背後に置く映像を繰り返し使うとき、ループのたびに変化が見えると気になる場合があります。Seamless Loopは**時間上の継ぎ目を調整する候補**ですが、動きの複雑さや素材の内容によって見え方は変わるため、完成を目視で判断します。

### 既存のコンポジションをループ化する

複数のノードで作ったアニメーションをまとめて扱う場合にも、前段の各ノードを個別に反復させるのではなく、出力されるシーケンスの時間構成を検討できます。ただし、Seamless Loopがどの種類のコンポジションや時間範囲に適用できるかは、実機で確認が必要です。

<!-- capture:S289 -->

## 実機例：動く文字の前後を確認する

横に動く `Text+` を `Seamless Loop` に接続し、Loop Length 100、Dissolve Length 25に設定します。左Viewerに入力、右Viewerに出力を表示し、frame 0、99、100の静止画を確認しました。

入力の文字位置は時間とともに変わり、出力はframe 0と100で似た位置に見えます。この3枚だけでは連続再生の滑らかさや画素の一致は判断できません。[接続と設定の記録](/img/fusion/captures/S289/readback.json)に条件を記載しています。

[![Text+をSeamless LoopとMediaOutにつないだ構成](/img/fusion/captures/S289/graph.png)](/img/fusion/captures/S289/graph.png)

動く文字をSeamless Loopに入力します。

[![Loop Length 100とDissolve Length 25の設定](/img/fusion/captures/S289/controls.png)](/img/fusion/captures/S289/controls.png)

Loop Length 100、Dissolve Length 25の例です。

[![frame 0の入力文字とSeamless Loop出力](/img/fusion/captures/S289/frame0.png)](/img/fusion/captures/S289/frame0.png)

frame 0。左が入力、右が出力です。

[![frame 99の入力文字とSeamless Loop出力](/img/fusion/captures/S289/frame99.png)](/img/fusion/captures/S289/frame99.png)

frame 99の入力と出力です。

[![frame 100の入力文字とSeamless Loop出力](/img/fusion/captures/S289/frame100.png)](/img/fusion/captures/S289/frame100.png)

frame 100の入力と出力です。

[再現用Graph](/img/fusion/captures/S289/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S289/capture.json)

<!-- /capture:S289 -->

## 制作例：動く背景を繰り返す

次は**構成を考えるための例**であり、Manual掲載の端子図やInspector操作を再現した手順ではありません。

```text
アニメーションのあるImage / Comp
              ↓
        Seamless Loop
              ↓
         Viewer / 出力
```

1. まずSeamless Loopなしで短いアニメーションを用意します。開始と終了で、模様の位置・色・明るさがどう変わるかを見ます。
2. シーケンスを繰り返し再生し、最後から最初へ戻るフレーム境界を確認します。ここでの段差が比較基準です。
3. コンポジションの後段にSeamless Loopを置く構成を検討し、**実機で端子と時間範囲を確認してから**接続します。
4. 調整後は境界の直前・直後を連続再生します。静止フレームだけでは、位置が跳ぶ、明るさがちらつく、動きが一瞬止まるといった問題を判断できません。
5. ループを2周以上再生し、途中に新しい不連続な動きが現れていないかも確認します。

試す素材には、一定方向に動く帯やグラデーションのように**変化を追いやすいもの**が向きます。最初から複雑な実写や粒子表現で試すと、どの変化が時間調整によるものか分かりにくくなります。

## 近いツールとの違い

| ツール | 21.1 Manualなどで確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Seamless Loop** | コンポジションのタイミングを調整してループシーケンスを作る | 再生終端と冒頭の時間的なつながりを検討する |
| [Seamless](./seamless) | 画像の反対側の端を反転して元画像と混ぜる | 画面の**空間的な端**の処理を考える |
| [Time Mapper](./time-mapper) | 外部画像マップでシーケンスの異なる時刻を組み合わせる | 画像で時間の参照を制御したい |
| [Time Stretcher](../time-metadata/time-stretcher) | `Source Time`のSplineで、各出力フレームが読む入力時刻を指定する | 時間の対応関係を自分で設計したい |
| [Time Speed](../time-metadata/time-speed) | 一定の速度比率・時間オフセットで映像を読み直す | 一定速度のスロー・倍速・逆再生を作る |

Seamless Loopは、単純な倍速処理やフレーム数の変更と同じ目的ではありません。また、**映像の時間的なループと、横スクロールするテクスチャの左右端をつなぐ処理は別の問題**です。必要なら両方を個別に確認します。

## 注意点と未確認事項

- **必ず自然につながるとは限らない**：素材に急なカットや大きな位置変化がある場合、時間の調整だけで違和感が消える保証はありません。これは素材選びと目視確認に関する運用上の注意です。
- **映像と音声は別**：本文はFusionの画像シーケンスを対象とします。音声まで自動的にループ処理されるとは確認していません。
- **Alphaと補助チャンネル**：透明部分、モーションベクターなどの補助チャンネルがどう処理されるかは未確認です。
- **Inspector**：実機例ではLoop LengthとDissolve Lengthを確認しました。その他の設定の働き、既定値と範囲は未確認です。
- **製品差**：21.1 Manualに掲載されていることは確認済みですが、Resolve Free / Studio / Fusion Studioごとの利用条件、Effects Libraryでの表示、内部REGIDは未確認です。

## 出典と確認範囲

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2436、Image Pixel Tools / Seamless Loop**。公式記述で確認できるのは、コンポジションの時間を調整してシームレスに繰り返すシーケンスを作るためのツール、という役割です。

画像データの入出力分類は既存COLLECTANEAカタログに基づきます。ループ境界の確認方法や制作例は一般的なモーショングラフィックスの運用案であり、実機例はInput接続と2項目の設定、および3つの静止画に限ります。連続再生・画素一致・内部処理・エディション差は未確認のため、`verification: partial`を維持しています。

[Krokodoveの全体像](./)も参照してください。
