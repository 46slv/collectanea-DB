---
title: Connect
description: 個別に配置した点を一本の連続線で結ぶKrokodoveツール。WormやConnect 3Dとの違い、使い方の考え方と確認範囲。
doc_type: node
term_id: connect
term_short: 個別に位置を指定した点を、一本の連続した線でつなぐKrokodoveの画像用ツール。
verification: partial
aliases: [Connect]
concepts: [image-data]
nodes: [Connect]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-21'
---

# Connect

**Connectは、画面内に指定した複数の点を、一本の連続した線でつなぐ**Krokodoveのツールです。Blackmagic DesignのDaVinci Resolve 21.1 Reference Manualでは、点の位置を個別に決められると説明されています。点は線が通る位置を示す目印で、英語では *waypoint*（経由点）と呼ばれます。

たとえば「画面左下から中央を通り、右上へ向かう線」を描きたいとき、始点・中央付近・終点に相当する位置を考えます。Connectは、そうした点を使ってつながった線を作るための候補です。一方で、**点の接続順、線の曲がり方、点の追加操作までがManualで説明されているわけではありません。** 一般的なペンツールと同じ操作ができるとは限りません。

## どのような線を作るのか

重要なのは、点を一つずつ独立した印として描くのではなく、点と点の間がつながった**連続線**を作ることです。途中の位置を変えることで線の通り道を考えられるため、単純な直線だけでは表現しにくい経路の図柄に向いています。

これは「映像内の人物や物体を追跡して自動的に経路を描く」という意味ではありません。Manualが述べているのは、点の位置を個別に指定できることと、それらを線で結ぶことです。追跡機能、画像の輪郭検出、線が伸びていくアニメーションは確認できていません。

## 入力と出力

Connectは21.1 Manualの**Image Tools**に分類されています。ただし、カテゴリ名から物理的な接続端子の数や必須入力まで確定することはできません。

| 項目 | 確認できること | 未確認のこと |
| --- | --- | --- |
| 形を決める情報 | 実機例ではNumber Of Pointsを3にし、Point 1〜3の座標とLinearを指定した。 | 点の追加・削除操作、最大数、他のType。 |
| 入力 | 実機例ではBackgroundをImage入力へ接続した。 | 他の入力や、すべての条件で画像入力が必須かどうか。 |
| 生成するもの | 点を結んだ一本の連続線。 | 線幅・色・線端・曲線化・透明度をConnect単体で調整できるか。 |
| 出力 | 実機例ではConnectの出力をMediaOutに接続し、線を表示した。 | 他の出力、Alphaと画像範囲の具体的な挙動。 |

<Term id="image">Image</Term>は色や透明度を持つ2Dの画素データです。<Term id="shape-data">Shape</Term>は、描画する前の輪郭などを扱う別のデータです。ConnectはImage Toolsの項目であり、「点を結ぶ」という説明だけでShape出力と判断しないでください。

実機例では黒いBackgroundをImage入力へ接続しました。入力がない状態ではViewerは空でしたが、すべての条件で入力が必須かは未確認です。

## 主な用途

### 地図・案内図の経路線

地図画像の上に、通過する場所をいくつか示して一本の線で結ぶ表現です。道の曲がり方を正確に再現する地図ソフトではないため、実際の道路に沿わせたい場合は点の調整方法や描画結果を先に確認します。

### 画面内の要素をつなぐ説明グラフィック

複数の図形やラベルを一続きの線で関連づけたい場合にも候補になります。たとえば、三つの説明箇所をたどる線を背景の上に重ねます。Connect自身がラベルを認識したり、位置の変化に自動追従したりする機能は確認できていません。

<!-- capture:S291 -->

## 実機例：3点を折れ線で結ぶ

黒い `Background` を `Connect` のImage入力へつなぎ、3点を指定して `MediaOut` に出力します。TypeをLinear、Number Of Pointsを3にした例です。

Viewerには指定した3点を結ぶ白い折れ線が表示されます。点の印は編集ガイドです。[接続と設定の記録](/img/fusion/captures/S291/readback.json)に座標と条件を記載しています。

[![BackgroundをConnectとMediaOutへつないだ構成](/img/fusion/captures/S291/graph.png)](/img/fusion/captures/S291/graph.png)

背景画像をConnectのImageへ入力します。

[![Connectで3点の座標とLinearを設定したInspector](/img/fusion/captures/S291/controls.png)](/img/fusion/captures/S291/controls.png)

Number Of Pointsを3に設定します。

[![黒背景上で3点をつなぐ白い折れ線](/img/fusion/captures/S291/result.png)](/img/fusion/captures/S291/result.png)

3点を通る白い折れ線。編集ガイドも表示されています。

[再現用Graph](/img/fusion/captures/S291/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S291/capture.json)

<!-- /capture:S291 -->

## 制作例：背景画像へ経路線を重ねる

次は背景画像へ重ねるための構成案です。上の実機例では黒いBackgroundを入力しましたが、以下のMerge構成とAlphaの挙動は未確認です。

```text
Connectの結果 ─────────→ Merge（Foreground）
                             ↓
背景画像 ───────────────→ Merge（Background）→ MediaOut
```

1. まずBackgroundをConnectのImage入力へ接続してViewerに表示し、点を配置・変更する操作を確認します。少数の点から始め、線がどのようにつながるかを見ます。
2. Connectの結果が2D Imageとして接続できる場合、[Merge](../compositing/merge)のForegroundへつなぎ、背景画像をBackgroundへ入れます。
3. 線以外の部分まで背景を隠すなら、Connectの出力Alphaを確認します。背景が最初から透明になるとは限りません。必要に応じてマット処理や合成側のBlendを使ってください。
4. 線の色や太さが合わない場合は、Connectの実際の設定項目を確認します。対応する設定が見当たらなければ、後段の画像処理で見た目を調整する方法を検討します。
5. 線の先端が伸びる動きを付けたい場合は、まず静止した線を完成させてから別途アニメーション方法を選びます。ConnectにWrite Onの機能があると仮定しません。

## 関連ツールと選び分け

| ツール | 21.1 Manualなどで確認できる役割 | 選択の目安 |
| --- | --- | --- |
| **Connect** | 個別に配置した点を一本の連続線でつなぐ。 | 点を通る経路を一続きの線で示す。 |
| [Worm](./worm) | 指定点を使い、直線と曲線を組み合わせる。 | 線の直線部分・曲線部分の見え方に注目する。 |
| [Lines](./lines) | 一組または複数組の線を繰り返し、線模様を作る。 | 通過点より、繰り返すパターンを作りたい。 |
| [Connect 3D](./connect-3d) | 3D側の頂点を接続する別項目。 | 2Dの経路線と3Dの接続を混同しない。 |

ConnectとWormは「点を使う」という点では似ています。しかし、Connectの説明で強調されるのは**点を一本の連続線でつなぐこと**、Wormは**直線と曲線の組み合わせ**です。両者で同じ点編集UIや線の補間方法が使えるかは未確認です。

## 確認範囲・出典

**確認済み（Manual）**：ConnectはKrokodoveのImage Toolsに掲載され、位置を個別に指定した点同士を連続線で結ぶ。

**確認範囲**：Studio 21.1.0.14 / Windowsの実機例でImage入力、Linear、3点の座標と折れ線を確認しました。他の入力・出力、必須条件、Controlの既定値や範囲、他の線色・線幅・Alpha、アニメーション、Edition差は未確認のため、`verification: partial`を維持します。

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2434「Image Tools / Connect」。比較対象のWormとLinesは同章p.2435。Connect 3Dは[Krokodove全体の案内](./)で、2D項目とは分けて扱っています。
