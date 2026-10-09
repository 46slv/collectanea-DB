---
title: "Z to World"
description: "Z深度と撮影カメラから各画素の3D空間内の位置を再構成し、World Position PassとZ深度を相互変換するNode。"
doc_type: node
term_id: "z-to-world"
term_short: "Z to World Posは、Z深度とカメラ情報から各画素の3D位置を計算し、逆に位置情報からZ深度を求めるNode。"
verification: partial
aliases: ["Z to World", "Z to World Pos", "Z to World Position", "Z2W"]
concepts: ["image-data"]
nodes: ["Z to World Pos"]
node_family: "position"
controls: ["Mode", "Camera", "Blend", "Process When Blend Is 0.0"]
inputs: ["image", "mask", "classic-3d"]
outputs: ["image"]
tasks: ["process-stereo"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-10"
---

# Z to World Pos（Z to World）

Z to World Pos [Z2W]は、画像に記録された**奥行き（Z深度）**と、その画像を撮った**3Dカメラ**の情報から、各画素が3D空間のどこにあるかを計算するNodeです。反対に、各画素の3D位置が記録された画像からZ深度を作ることもできます。

たとえばCGのレンダリング画像にZ深度しか入っていなくても、レンダリング時のカメラがあれば、空間上の位置に合わせて霧をかけたり、特定の位置にだけマスクを作ったりするための情報を用意できます。**画像から立体メッシュを生成するNodeではありません。**

21.1 Reference Manualでは正式見出しが **Z to World Pos [Z2W]** で、**Position Nodes（Chapter 115）**に収録されています。このサイトでは既存の参照経路を維持するため、Stereo 3Dのフォルダーに記事を置いています。実際の分類をStereo専用Nodeと混同しないでください。

## 何を変換するのか

通常のカラー画像は、各画素に赤・緑・青などの色を記録します。Z深度は、画素に写っている面がカメラの前後方向のどこにあるかを表す**1つの値**です。

一方、**World Position Pass（WPP）**は、画素ごとに3D空間内の位置を**X・Y・Zの3つの値**で記録した画像です。たとえばXが「左右」、Yが「上下」、Zが「奥行き」に相当します。位置をRGBの3チャンネルに格納することがありますが、そのRGBは**色として鑑賞するための値ではありません**。0～1の範囲外や負の値も、座標として意味を持ちます。

- **Z深度 → World Position**：各画素の深度と、画像を撮った3Dカメラの位置・向き・画角などを使い、各画素が空間内のどこにあるかを再構成します。
- **World Position → Z深度**：各画素の3D位置とカメラの情報から、カメラ基準の深度情報を求めます。

どちらの方向も**カメラ情報が重要**です。画像に写っているものと異なるカメラを使うと、位置や深度が正しく計算されません。

## 入力

21.1 ManualのNode Editor説明では、3種類の入力端子が確認できます。

| 端子 | 色・データ | 接続するもの |
| --- | --- | --- |
| **Image** | オレンジ・2D Image | 変換元の画像。Z深度またはWorld Position Passを含み、Modeに対応した情報を持つ必要があります。 |
| **Effect Mask** | 青・Mask | 変換を適用する範囲を絞るマスク。ManualではWorld Position Passの適用範囲を制限すると説明されています。 |
| **Scene Input** | マゼンタ・3D Scene / Camera | 元画像に対応するCamera 3D、またはカメラを含む3Dシーン。複数のカメラがある場合はInspectorで選びます。 |

**Imageに通常のRGB映像だけを入れても、欠けている深度や位置は復元できません。** 前段のレンダリングやトラッキングで得たZ／位置データが必要です。2D Imageについては[画像（Image）](../../learn/02-data/image.md)を参照してください。

Scene InputのCameraは、単に任意のCamera 3Dを接続するのではなく、**元画像を撮影・レンダリングしたカメラと一致させる**必要があります。

## 出力

出力は**2D Image**です。Modeに応じ、World Position Pass、またはZ深度を持つ画像になります。

| Modeで選ぶ方向 | 生成する情報 | 後段での使い道 |
| --- | --- | --- |
| **Z深度からWorld Position** | 各画素の空間内のX・Y・Z位置 | [Volume Fog](./volume-fog.md)で空間的に霧を配置する、[Volume Mask](./volume-mask.md)で位置に基づくマスクを作る |
| **World PositionからZ深度** | カメラ基準のZ深度 | Z深度を参照する画像処理へ渡す |

WPPを作るときも、画面上に3Dオブジェクトを表示するのではなく、**画素に対応した座標データを画像へ書き込みます**。後段のNodeがその値を読んで、霧やマスクなどの効果を計算します。

## 主な設定項目

### Controlsタブ

**Mode**は変換方向を切り替えます。Z深度からWorld Positionを作るか、World PositionからZ深度を作るかを、手元の画像データに合わせて選びます。21.1 Manualはこの2方向を説明していますが、メニューの選択肢の正確な表示文字列は本記事では実機確認していません。

**Camera**はScene Inputに複数のカメラが含まれるとき、計算に使うカメラを選ぶ項目です。間違ったカメラを選択すると、生成される座標や深度が元画像と対応しなくなります。

### Settingsタブ

Position系Node共通の**Blend**は、元画像と処理結果の混合量です。Manualによると0.0では通常、処理せず入力画像をそのまま返します。**Process When Blend Is 0.0**を有効にすると、Blendが0.0でもNodeを評価します。これらは変換の向きやカメラの設定とは別です。

## 運用例：CGのZ深度からWorld Positionを作る

CGソフトから、元のカラー画像、Z深度パス、レンダリングに使ったカメラを書き出せるケースを考えます。目的は、あとから3D空間の位置に応じて霧を調整することです。

~~~text
CGのZ深度パス ──→ Channel Booleans ──→ Z to World Pos / Image
CGと一致するCamera 3D ─────────────────→ Z to World Pos / Scene Input

Z to World Pos（World Position） ──→ Volume Fog ──→ 合成結果
~~~

1. CGのZ深度パスを読み込みます。深度が補助チャンネル（Aux Z）に格納されている素材では、**Channel Booleans**を使って、Zを後段で扱う画像チャンネルへ割り当てます。これは21.1 Manualに掲載された接続例に沿った構成です。
2. Z to World Posの**Image**へその画像を接続します。
3. レンダリング時のカメラと一致するCamera 3Dを**Scene Input**へ接続します。シーンに複数カメラがある場合は**Camera**で正しいものを選びます。
4. **Mode**でZ深度からWorld Positionを作る方向を選びます。
5. 結果の座標値を確認し、World Positionを利用する[Volume Fog](./volume-fog.md)などへ渡します。

これはManualの機能説明と作例を基にした**構成例**で、21.1実機でのレンダリング結果を確認した記録ではありません。Volume Fogへの接続時には同Node側の画像・Scene入力要件も確認してください。

## 主な用途

- **CG素材の不足パスを補う**：Z深度だけを出力できるレンダラーから、位置に基づく合成に必要なWorld Position Passを作ります。
- **実写の3Dトラッキング結果を利用する**：画素ごとのZ深度と対応する3Dカメラが得られた場合、[Volume Mask](./volume-mask.md)や[Volume Fog](./volume-fog.md)を使うための位置情報へ変換します。
- **位置パスを深度処理へ渡す**：World Position Passとカメラがある素材からZ深度を計算し、深度を読む後段の処理へ利用します。

## 注意点

- **World Spaceで用意する**：21.1 ManualのWPP説明では、Position系Nodeに渡すWorld Positionは**World Space**が前提です。Eye SpaceやObject Spaceで書き出した位置パスを、そのまま同じものとして扱わないでください。
- **精度はZ深度に依存する**：元のZに穴、誤差、粗い境界があれば、計算されたWorld Positionにも影響します。カメラ情報だけで欠損画素を回復するわけではありません。
- **WPPは32-bit floatが推奨**：位置の数値範囲と精度を保つため、ManualはWPPを32-bit浮動小数点で扱うよう説明しています。表示用に0～1へ正規化した画像を、座標の正本と混同しないでください。
- **背景の空白には位置がない**：3Dレンダリングの何も描かれていない領域ではWPPが(0, 0, 0)として扱われ、Volume Fogが意図しない背景まで埋める場合があります。Manualは、十分遠方の値を持たせるため、レンダーに**背景を覆う球体や箱**を加える方法を紹介しています。
- **ステレオ視差の変換ではない**：[Disparity To Z](./disparity-to-z.md)は左右画像の視差からZ深度を計算します。一方、Z to World Posは**既にあるZ深度とカメラ情報**から3D位置を求めます。左右眼画像の対応点を自動解析するNodeではありません。

## 関連Node

- [Volume Fog](./volume-fog.md)：World Positionを使い、空間に沿って霧を合成する処理。
- [Volume Mask](./volume-mask.md)：World Positionを使い、3D空間の位置に基づくマスクを作る処理。
- [Disparity To Z](./disparity-to-z.md)：ステレオ視差からZ深度を作る処理。入力の前提が異なります。
- [Z To Disparity](./z-to-disparity.md)：Z深度をステレオ視差へ変換する処理。
- [Stereo 3Dノード一覧](./index.md)：既存サイト内の分類上の参照先。

## バージョンと検証状況

**一次資料**：Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』、**Chapter 115「Position Nodes」pp.2716–2719**（Z to World Pos [Z2W]、WPP Concept、The Common Controls）。背景の空白領域についてはChapter 84「3D Compositing Basics」p.1868も参照。

**verification: partial**：変換方向、Image／Effect Mask／Scene Input、Mode／Camera、World Spaceと32-bit floatの注意はManualで確認済みです。実機でのControl選択肢の正確な表記、補助チャンネルの最終配置、REGID、処理結果、edition差は未確認です。
