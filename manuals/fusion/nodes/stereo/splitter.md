---
title: "Splitter"
description: "横並び・縦並びのStereo画像を左眼・右眼へ分離するFusion Node。入力、2出力、Split、Swap Eyesと運用例を解説。"
doc_type: node
term_id: "splitter"
term_short: "Splitterは、1枚に横並び・縦並びで収めた左右眼の画像を、左眼用と右眼用の2本の画像へ分けるStereo Node。"
verification: partial
aliases: ["Splitter", "Spl", "SPL"]
concepts: ["image-data"]
nodes: ["Splitter"]
node_family: "stereo"
controls: ["Split", "Swap Eyes"]
inputs: ["image"]
outputs: ["image"]
tasks: ["process-stereo"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Splitter

Splitter [Spl]は、**左眼用と右眼用の映像が横または縦に並んだ1枚の画像から、それぞれの眼の画像を取り出す**Nodeです。左右の視点を別々のNodeで調整したいときや、1枚にまとめて保存したStereo素材を再び2本に分けるときに使います。

たとえば、左半分に左眼、右半分に右眼の映像が入っている3840×1080の素材を読み込み、Splitを**Horiz**にすると、1920×1080の左眼画像と1920×1080の右眼画像を別々に出力できます。

**DaVinci Resolve Studio / Fusion Studio限定**です。左右の映像から奥行きを計算したり、1枚の通常映像から新しい視点を生成したりするものではありません。

## 何を分けるのか

ステレオ映像は、少し異なる位置から同じ場面を見た**左眼用画像と右眼用画像**を使います。この2枚を1枚にまとめる方式の一つが横並びの**Side-by-Side**、もう一つが縦並びの**Top-and-Bottom**です。

Splitterは、すでに1枚に配置された2つの視点を**画像の領域ごとに切り出す**処理をします。3D Sceneや3D Materialを分解するNodeではありません。入出力はいずれも**2D Image**です。画像データの説明は[画像（Image）](../../learn/02-data/image.md)を参照してください。

前段の[Combiner](./combiner.md)が左右画像を横や縦にまとめるのに対し、Splitterは逆の用途です。[Anaglyph](./anaglyph.md)のように2枚の視点を色チャンネルへ合成する処理とも異なります。

## 入力と出力

### 入力：左右を収めた画像

21.1 Manualで個別に説明されているのは**オレンジのLeft Input**です。ここへ、横並び・縦並びの左右両眼を含む画像を接続します。Leftという端子名でも、**左眼だけの画像を入れるわけではありません**。

ManualのInputs節には「2つの入力」との文言もありますが、明示的に定義されているのはLeft Inputのみです。未説明のもう一方の端子名・用途を推測で補っていません。

### 出力：左眼と右眼の2系統

| 出力 | データ | 用途 |
| --- | --- | --- |
| **Left Output** | 左眼の2D Image | 左眼だけを表示・補正・保存する。 |
| **Right Output** | 右眼の2D Image | 右眼だけを表示・補正・保存する。 |

一般的なFusion Nodeと異なり**出力が2本**あります。左右を別々のViewerや処理Nodeへ送れます。視差マップ（Disparity）やZ Depthを生成する出力ではありません。

## Inspectorの設定

### Split：左右の並べ方を指定する

| Split | 入力の解釈 | 出力結果 |
| --- | --- | --- |
| **None** | 切り分けない。 | **両方の出力が入力画像と同じ**になる。 |
| **Horiz** | 左右の像が横に並んでいる。 | 各出力が**入力の半分の幅**になる。 |
| **Vert** | 左右の像が上下に並んでいる。 | 各出力が**入力の半分の高さ**になる。 |

入力寸法の例を挙げます。

- **3840×1080の横並び画像** → Horiz → 左眼・右眼とも1920×1080。
- **1920×2160の縦並び画像** → Vert → 左眼・右眼とも1920×1080。
- **3840×1080の横並び画像** → None → 左眼・右眼とも3840×1080のまま。

寸法はManualの半幅・半高ルールから計算した例です。奇数ピクセル幅や通常と異なる配置での端数処理は実機未確認です。

### Swap Eyes：左右眼の出力を入れ替える

**Swap Eyes**は、Left OutputとRight Outputへ渡す像を交換する設定です。左右を逆順に読み込んだ疑いがあるとき、配線し直さずに確認できます。

**カメラ位置・視差量・上下方向のずれ・左右の時間差を補正する機能ではありません。** 左右を入れ替えた後も、実際の視差や同期は別途確認します。

### Settingsタブ

他のStereo Nodeと共通の設定群です。分離方法を決める中心はControlsタブの**Split**と**Swap Eyes**です。共通設定の初期値・数値範囲は確認できていないため、本記事では追加しません。

## 最小構成：Side-by-Sideを2つの画像へ戻す

左眼が左、右眼が右に収まった3840×1080のStereo素材を想定します。

~~~text
Stereo画像（3840×1080）
          │
     Left Input
          │
       Splitter
    Split: Horiz
     ／        ＼
Left Output   Right Output
 1920×1080      1920×1080
     │               │
 左眼を確認       右眼を確認
~~~

1. LoaderまたはMediaInで横並びの画像を読み込みます。
2. Splitterの**オレンジの入力**へ接続します。
3. Inspectorの**Split: Horiz**を選びます。
4. **Left Output**と**Right Output**をそれぞれViewerで確認します。
5. 左右が逆なら元画像の並びを確認し、必要に応じて**Swap Eyes**を切り替えます。

上下に並んだ素材なら**Split: Vert**にします。単に映像を拡大・縮小するのではなく、左右の像をそれぞれ独立した出力へ送れるのが利点です。

## 運用例：左右を別々に色補正してから再結合する

左眼用画像だけが右眼より明るいStereo素材を修正するとします。横並びの1枚をまとめて色補正すると、左右に同じ調整がかかりやすくなります。

Splitterで分け、それぞれの出力に色補正Nodeを接続すれば、左眼と右眼の明るさや色を**別々に調整**できます。最後に横並びへ戻す場合は[Combiner](./combiner.md)の**Image 1へ左眼、Image 2へ右眼**をつなぎ、**Combine: Horiz**を選びます。

~~~text
Stereo画像 ─ Splitter ─ Left Output  ─ 左眼の色補正 ─┐
              Split:   └ Right Output ─ 右眼の色補正 ─┤
              Horiz                                  Combiner
                                                   Combine: Horiz
                                                        │
                                                     Stereo出力
~~~

これは21.1 Manualに記載された端子・モードを使った応用例で、今回の実機テスト結果ではありません。作業後は左右が同じ時刻を示し、補正した色が両眼で不自然に異ならないか確認します。

## よくある取り違え

- **Noneのままでは左右が分離されない**：2出力とも元の画像がそのまま出ます。
- **HorizとVertを逆にする**：意図しない方向で画像が切られます。元画像の配置とSplitを一致させます。
- **上下左右の順番が違う**：21.1 ManualでのCombinerのVertは**左眼が下、右眼が上**です。ほかのソフトで生成された画像が同じ順序とは限りません。必ずViewerで左右の内容を確認します。
- **分離は視差の生成ではない**：通常の単眼画像を切り分けても、左右から見た映像は新しく作られません。
- **2出力は納品形式そのものではない**：納品先に必要なSide-by-Sideや別ストリームへの変換・保存方法は、後段で決めます。
- **ColorページのSplitterと区別する**：ColorページにはRGBチャンネルを分離するSplitter/Combinerもあります。ここで扱うのはFusionの**左右眼を分けるStereo Node**です。

## 関連Node

- **[Combiner](./combiner.md)**：左右眼の画像を1枚にまとめる逆方向のNode。
- **[Anaglyph](./anaglyph.md)**：左右眼を赤／シアンなどに分けて重ね、色付き眼鏡用の1枚を作る。
- **[Stereo Align](./stereo-align.md)**：左右の位置関係や輻輳に関する調整。Splitter自体は位置合わせしない。
- **[Disparity](./disparity.md)**：左右の画像のずれを解析し、視差データを扱う。
- **[Stereo 3Dノード](./index.md)**：Stereo系の全体像と選び方。

## バージョンと検証状況

**一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』、Chapter 118「Stereo Nodes」、Splitter [Spl]（pp.2790–2791）。** Studio限定、オレンジのLeft Input、左右の2出力、SplitのNone／Horiz／Vert、Swap Eyes、出力寸法の規則はこの資料で確認しました。Combinerの並び順は同章pp.2775–2776、Colorページの別種のSplitterはChapter 147（p.3441）によります。

**verification: partial**：21.1実機の処理結果、Manualに詳細がない入力、内部REGID、Inspector初期値、奇数サイズでの端数処理、外部形式の互換性は未確認です。本文の寸法とGraphは資料に基づいた説明例であり、実測値や納品仕様の保証ではありません。
