---
title: "Bounding Box"
description: "画像の選択チャンネルから矩形を描くKrokodoveのツール。閾値の意味と文字の囲み枠を作る検証例、Thresholdとの違いを説明。"
doc_type: node
term_id: "bounding-box"
term_short: "画像の選択したチャンネルから矩形を描き、Thresholdでその大きさを調整するKrokodoveの画像ツール。"
verification: partial
aliases: ["Bounding Box"]
concepts: ["image-data"]
nodes: ["Bounding Box"]
node_family: "krokodove"
inputs: ["image"]
outputs: ["image"]
tasks: ["motion-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-20"
---

# Bounding Box

Bounding Boxは、**画像の指定したチャンネルから矩形（四角い枠）を描く**Krokodoveのツールです。DaVinci Resolve 21.1 Reference Manualでは「Image Tools」に分類され、選択したチャンネルを使って矩形を描き、**Threshold（閾値）**で矩形の大きさを調整すると説明されています。

たとえば文字やロゴの周囲に四角い囲みを作るときに候補になります。ただし、矩形が画像のどの画素を囲むのか、複数の対象がある場合にどうなるのか、余白や線の太さを指定できるのかは、Manualの短い記述では分かりません。以下では**資料で確認できた役割**と**制作のための構成案**を区別します。

## チャンネル・閾値・Bounding Boxの意味

**チャンネル**は画像を構成する情報の一つです。一般的な<Term id="image">Image</Term>には、赤・緑・青を表す情報や、透明度を表すAlphaなどがあります。Bounding Boxは、そのうち選択されたチャンネルを手掛かりに矩形を描くツールです。どのチャンネルを選択できるか、Inspector上の正式な選択欄の名前は未確認です。

**閾値（Threshold）**は、ある値を判定に含めるかどうかを決める境目です。画面内には明るい画素だけでなく、暗い画素や半透明の縁があります。判定に含める範囲が変われば、そこから作る枠にも影響することが考えられます。ただし、21.1 Manualが明示しているのは**Thresholdで矩形の大きさを調整できる**ことまでです。値を上げると必ず枠が小さくなる、といった変化の方向は確認していません。

一般に「Bounding Box」は対象が存在する領域を四角形で示す意味で使われます。ただし、Krokodove版の矩形が常に全画素に接する外接矩形か、枠を回転できるか、対象ごとに複数作れるかは名称から判断しません。

## 入力と出力

| 段階 | 扱うデータ | 確認できる範囲 |
| --- | --- | --- |
| 入力 | 画像中の選択チャンネル | Manualは選択チャンネルを参照すると記述。画像入力の端子名・数、必須接続条件は未確認。 |
| 処理 | 矩形とThreshold | 選択チャンネルから矩形を描き、Thresholdで大きさを調整。詳細な判定式や描き方は未確認。 |
| 出力 | 2D Imageとして扱う結果 | 既存COLLECTANEAカタログの分類。実際の出力端子名やAlpha、背景の扱いは未確認。 |

Frontmatterの入力・出力にある image は、**データの種類**を示す分類です。Fusion 21.1実機の正確な端子名・個数まで確定するものではありません。また、Bounding Boxの「矩形」は、FusionのShapeデータや3Dオブジェクトを出力するという意味ではありません。

## 主な用途

### 文字やロゴを四角で囲む

文字の輪郭をそのままなぞるのではなく、**文字全体の位置や広がりを枠で示す**用途を考えられます。Title、注釈、モーショングラフィックスのアクセントなどが候補です。ただし、文字列の長さに応じて枠が自動更新されることは、実機で確認していません。

### 画像のチャンネルと枠の関係を調べる

輪郭がはっきりした図形と、ぼけた縁を持つ図形を入力して比べると、Thresholdの変化を観察しやすくなります。Alphaを選択できる場合には透明部分との関係も調べられますが、**Alphaを選べるか自体が未確認**です。最初に選択可能なチャンネルを確認してください。

### 合成する映像の上に枠を重ねる

描画された矩形が2D画像として得られれば、映像に重ねる構成を検討できます。出力が透明な背景を持つかどうかは不明なので、合成したときに元映像が隠れないか確認する必要があります。

## 制作例：Text+を使って矩形の動きを確認する

次は**検証を兼ねた作例案**であり、Bounding Boxの公式接続図ではありません。既知のInspector項目は「チャンネルの選択」と「Threshold」の役割だけです。

1. FusionでText+を作り、短い文字を表示します。まずText+単体をViewerで確認し、文字の周囲に透明部分がある状態を用意します。
2. KrokodoveのBounding Boxを追加して、単体の出力をViewerで見ます。画像が現れない場合は、実際の入力端子と必要な接続を確認します。
3. Image入力を受け付けることが確認できた場合だけ、Text+を接続します。選択チャンネルの候補を調べ、矩形が文字のどこを囲むか観察します。
4. Thresholdを一度に大きく変えず、少しずつ調整します。枠の幅、高さ、位置のどれが変わるかを記録します。半透明の文字の縁がどう影響するかも確認します。
5. 矩形の画像が得られたら、標準の[Merge](../compositing/merge)で映像と合成します。映像をBackground（BG）、Bounding Boxの出力をForeground（FG）へ接続する案です。

~~~text
Text+ ──［Image入力を確認した場合］──→ Bounding Box ──→ Merge（FG）
映像・背景画像 ────────────────────────────────────→ Merge（BG） ──→ MediaOut
~~~

枠の外側まで画像が覆ってしまう場合は、Bounding Boxの出力AlphaをViewerで確認します。**出力に透明な余白があるとは限りません**。また、Text+の文字を変えたとき、枠の大きさが追従するかも実際のフレームで比較します。キーフレーム対応や更新タイミングはManualだけでは未確認です。

## 関連ノードとの違い

| ツール | 何をするか | 選ぶ目安 |
| --- | --- | --- |
| **Bounding Box（Krokodove）** | 選択チャンネルから矩形を描き、Thresholdで大きさを調整 | 画像の情報を手掛かりに矩形を作りたい |
| [Threshold（Krokodove）](./threshold) | 指定チャンネルから狭い色・明るさの範囲を取り出す | 枠を描くより、条件に合う画素を選別したい |
| 標準のRectangle Mask | 手動で配置した長方形を効果範囲として使う | 画像の色・透明度とは独立して長方形を置きたい |
| 標準のCrop | 画像の一部を切り取る | 矩形を新たに描くのではなく表示範囲を制限したい |

Bounding Boxは**選択した画像チャンネルを参照する**点が特徴です。手動で長方形を配置する操作や、画像を矩形に切り抜く処理とは区別します。Krokodove内の画像・Shape・3D・Regionの分類は[Family Overview](./)を参照してください。

## 注意点・未確認事項

- **端子**：Image入力の正式名称と接続条件、補助入力、出力端子名・数は未確認です。
- **チャンネル**：選べるチャンネルの種類、Alphaや輝度を選べるか、複数選択できるかは未確認です。
- **Threshold**：Inspectorの正式項目名、初期値、範囲、判定式、値の増減と枠の大きさとの関係は未確認です。
- **矩形の形**：軸に平行か、余白・線幅・塗り・角丸を設定できるか、離れた領域を複数の枠として描くかは未確認です。
- **描画**：出力RGB・Alpha、解像度、時間変化、キーフレーム可否、HDRでの挙動は未確認です。
- **製品差**：Resolve Free / Studio / Fusion Studioの差、実機のEffects Library上の位置、REGIDは未確認です。

## バージョン・出典

- **一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月版）、Chapter 105「Krokodove Nodes」、p.2434「Image Tools / Bounding Box」。選択チャンネルから矩形を描き、Thresholdで大きさを調整する説明を確認しました。
- **公式配布案内**：[Blackmagic Design Support Center](https://www.blackmagicdesign.com/support)。2026年9月8日付のDaVinci Resolve 21.1 Manual掲載を確認。
- **関連**：[画像（Image）](../../learn/02-data/image)、[Krokodoveの全体像](./)、[Merge](../compositing/merge)。

Text+を使う例はManualの役割説明から考えた**制作・検証案**です。実機で端子・Inspector・出力を確認した公式作例ではないため、verificationは partial のままにしています。
