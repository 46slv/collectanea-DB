---
title: OpenEXRのMotion Vectorで車の動きにブラーを加える
description: BeautyとMotion Vector AOVをFusionで組み合わせ、移動方向と距離に沿ったブラーを作る。接続、チャンネルの割り当て、Forward/Backの注意点を解説。
doc_type: recipe
verification: partial
aliases: [OpenEXR Motion Vector Blur, Vector Motion Blur AOV]
concepts: [auxiliary-channels, motion-vectors, image-data]
nodes: [Loader, Vector Motion Blur, Channel Booleans, Optical Flow]
tasks: [motion-blur, motion-vectors, aov]
prerequisites: [auxiliary-channels]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-20"
---

# OpenEXRのMotion Vectorで車の動きにブラーを加える

3Dで作った車が実写の背景を横切る場面を考えます。画像全体を同じ方向にぼかすと、動いていない背景まで流れてしまいます。**Motion Vector（移動ベクトル）**を使うと、画像の各画素に記録された移動方向と距離に応じてブラーを加えられます。

このレシピでは、車を描いた**Beauty（通常のRGBA画像）**と、同じショットから書き出した**Motion Vector AOV（動きの情報を収めた追加出力）**をFusionへ読み込みます。車だけが動くショットなら背景のベクトルは小さくなりますが、背景やカメラも動いている場合はそれらの領域も処理対象です。

## 必要な画像とデータ

- **Beauty**：ぼかしたい2D画像。車の色や透明度が入っています。
- **Motion Vectorパス**：画素ごとの横方向X・縦方向Yの移動量。Beautyと画角、解像度、フレーム範囲をそろえて出力します。
- **Loader 2個**：Beautyとベクトルを収めたOpenEXR連番をそれぞれ読み込みます。
- **Vector Motion Blur**：ベクトルに従ってBeautyへブラーを加えます。

ベクトルは負の値も必要なので、**float16またはfloat32**で保持します。DaVinci Resolve 21.1マニュアルではXが1なら右へ1ピクセル、-10なら左へ10ピクセルの移動です。通常の8-bit RGBに変換して負値を失うと正しく扱えません。

**Forward Vector**は現在フレームから次フレームへの動き、**Back Vector**は現在から前フレームへの動きです。どちらを保存したか、どのチャンネルにX/Yがあるか、数値の単位と符号の約束を出力元で確認します。画面上の赤や緑の色合いだけでは判別できません。

## 接続

~~~text
Loader（Beauty）────────────→ Input（オレンジ）
                                 Vector Motion Blur ──→ MediaOut
Loader（Motion Vector）────→ Vectors（緑）
~~~

**Input**にはぼかしたい画像、**Vectors**には画素ごとの移動情報を含む画像を接続します。任意の**Vector Mask（白）**はブラー計算前の画像を制限し、**Effect Mask（青）**は処理後の効果を適用する範囲を制限します。両者は別の役割です。

## 手順

1. 車を動かしたショットからBeautyとMotion Vectorパスを出力します。レンダラー側でベクトルが出力されていることを確認し、連番の開始・終了フレームと画像サイズを一致させます。
2. それぞれをLoaderで読み、Beautyを**Input**、ベクトルパスを**Vectors**へ接続します。
3. Inspectorの**X Channel / Y Channel**でデータの格納先を指定します。例えばレンダラーがRedにX、GreenにYを保存したと確認できた場合は、その組み合わせを選びます。
4. **Scale**を調整し、車の移動量とブラーの長さを見比べます。Scaleはベクトル値への倍率で、特定のシャッター角を厳密に再現する設定ではありません。
5. ブラーが逆方向へ伸びる場合、Forward/Backの取り違えとチャンネルの対応を先に確認します。そのうえで必要なら**Flip Channel**でXまたはYの符号を反転します。
6. 移動する車の輪郭、タイヤ、背景、遮蔽部分を複数フレームで比較します。背景まで大きく流れる場合は背景のベクトル値を確認します。

**Lock Scale X/Y**はXとYの倍率を共通・個別に調整するための設定です。21.1マニュアルは個別スライダーが現れる条件に記述の食い違いがあるため、実機のInspector表示を優先してください。

## RGBパスを補助ベクトルへコピーする別の経路

XをRed、YをGreenに入れた独立した画像がある場合、21.1マニュアルChapter 77には**Channel Booleans**でBeautyの補助チャンネルへ格納する構成も掲載されています。

~~~text
Loader（Beauty）───────→ Channel Booleans（Background）──→ Vector Motion Blur（Input）
Loader（Vector RG）────→ Channel Booleans（Foreground）
~~~

1. BeautyをBackground、ベクトル画像をForegroundに入れます。
2. **To Red / Green / Blue / Alpha = Do Nothing**で、BeautyのRGBAを変更しないようにします。
3. **Aux → Enable Extra Channels**を有効にし、**To X Vector = Red FG / To Y Vector = Green FG**へ設定します。
4. 出力の補助ベクトル値を確認し、Vector Motion BlurのInputへ渡します。

これは前節の**独立したVectors端子へ渡す経路とは異なります**。Chapter 77はInputへ渡す例を示しますが、Chapter 92はVectors端子を必須と記します。両節の説明に差があるため、**補助チャンネルだけを含むInputによって21.1実機でブラーが発生するかは未確認**です。最初は独立したVectors端子から試してください。

複数レイヤーのEXRと補助チャンネルも同じ仕組みではありません。レイヤーを選ぶだけでX/Yベクトルへ自動変換されるとは限りません。

## Motion Vectorパスを持たない動画なら

[Optical Flow](../../nodes/optical-flow/optical-flow.md)を使うと、連続する映像からForward / Back Vectorを**推定**できます。EXRに保存して使い回す場合は、Loaderから再読込した時点で必要なベクトルが保持されているかを確認します。隠れていた物体が現れる場所、反射、急な移動では推定が外れるため、撮影時の正確なモーションブラーを自動復元する処理とは考えません。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| ブラーが出ない | Vectors入力、X/Y Channel、ベクトルの非ゼロ値、Scale、SettingsのBlend |
| 横移動が縦へ流れる | X/Yの格納先を取り違えていないか |
| 向きが反対 | Forward/Back、符号、Flip Channel |
| 画面全体が長く伸びる | ベクトルの単位、Scale、Beautyとのフレーム・解像度の一致 |
| 車の輪郭が不自然 | ベクトルの境界、Vector Mask / Effect Mask、画像の位置合わせ |
| EXR再読込後に動きが取れない | Loaderのチャンネル割り当て、浮動小数点の精度、保存時の補助情報 |

## 関連ノードと出典

- [Vector Motion Blur](../../nodes/blur-filter/vector-motion-blur.md) — 入力端子、Scale、Maskの詳細
- [Channel Booleans](../../nodes/color/channel-boolean.md) — RGBを補助ベクトルへ割り当てる
- [Optical Flow](../../nodes/optical-flow/optical-flow.md) — 実写の移動ベクトルを解析する
- [補助チャンネル / AOV](../../learn/02-data/auxiliary-channels.md) — RGBA、補助データ、画像レイヤーの違い

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、**Chapter 77 p.1695**（Forward / Back VectorとChannel Booleans）、**Chapter 92 pp.2128–2130**（Vector Motion Blurの入力とInspector）、**Chapter 112 pp.2617–2618**（Optical FlowとEXR保存）。

[Blackmagic Design公式マニュアル](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)

21.1実機での全接続経路、外部レンダラーのベクトル規約、EXR再読込での全チャンネル保持、Edition差は未検証です。したがって`verification: partial`とします。
