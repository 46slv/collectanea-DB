---
title: Vector Motion Blur
description: 3DレンダーやOptical Flowの移動ベクトルを使い、画素ごとに異なる方向と長さのモーションブラーを加えるFusionノード。入出力、チャンネル設定、実例と注意点を解説する。
doc_type: node
term_id: vector-motion-blur
verification: partial
aliases: [Vector Motion Blur, VMB]
concepts: [image-data, auxiliary-channels, motion-vectors]
nodes: [Vector Motion Blur]
node_family: blur-filter
controls: [X Channel, Y Channel, Flip Channel, Lock Scale X/Y, Scale]
inputs: [image, image, mask, mask]
outputs: [image]
tasks: [motion-blur, motion-vectors, aov]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# Vector Motion Blur

Vector Motion Blurは、**画像の各画素がどの方向へどれだけ移動したか**を示すデータを使い、動きに応じたぼかしを加えるノードです。車のボディー、回転するタイヤ、静止した建物が同じ画面にあっても、場所ごとに異なる方向・長さのブラーを作れます。

入力するのは、ぼかしたい2D画像と、移動方向・距離を記録した**モーションベクトル（Motion Vector）**です。ベクトルは3DソフトでレンダリングしたAOV（完成画像とは別に出力する情報）や、Fusionの[Optical Flow](../optical-flow/optical-flow)による解析結果から用意します。

## 何を変えるノードか

通常の[Directional Blur](./directional-blur)は、設定した方向や中心に従って画像を流します。一方、Vector Motion Blurは**画素ごとに与えられた移動ベクトル**を参照します。カメラが静止し、画面の右を車が横切る場合、車に大きな横方向のベクトル、背景にほぼゼロのベクトルを与えることで、背景を大きく流さずに車だけへ移動感を加えられます。

ベクトルは一般にX（左右）とY（上下）の2成分で構成されます。21.1マニュアルでは、Xが「1」なら右へ1ピクセル、「-10」なら左へ10ピクセルの移動を表す例が示されています。負の値も保持するため、**16-bitまたは32-bit浮動小数点（float16 / float32）**のデータを使います。

画面に見える赤・緑の色がそのまま移動の意味を持つとは限りません。RにX、GにYを格納した独立した画像もあれば、EXRの補助チャンネル（Auxiliary Channel）に格納されたデータもあります。[補助チャンネル / AOV](../../learn/02-data/auxiliary-channels)も参照してください。

## 入力と出力

| 接続 | 役割 |
| --- | --- |
| **Input（オレンジ）** | ぼかす対象の2D画像。MediaIn、Loader、合成済み画像などを接続します。 |
| **Vectors（緑）** | 移動ベクトルを収めた画像。別ファイルのMotion Vector AOVや、Optical Flowから保存したEXRなどを接続します。 |
| **Vector Mask（白）** | 任意。ブラー計算の**前**に入力画像を制限するマスク。 |
| **Effect Mask（青）** | 任意。計算済みの結果を適用する範囲を制限するマスク。 |
| **Output** | 動きに応じたブラーを加えた2D画像。MergeやMediaOut、別の画像処理ノードへ接続できます。 |

**Vector MaskとEffect Maskは同じものではありません。** Vector Maskは処理対象を前段で制限し、Effect Maskは処理後に効果をどこへ適用するかを決めます。輪郭付近の見え方が異なる場合は、どちらを使っているかを確認してください。マスクの基本は[Mask](../../learn/02-data/mask)で説明しています。

なお、21.1マニュアルの同じページでは入力を「3つ」と記す一方、実際には**Input、Vectors、Vector Mask、Effect Maskの4端子**を列挙しています。また、Vectorsを必須と記しながら、別章には補助チャンネルを含む画像をInputへ渡す構成例もあります。以下では両方の掲載例を区別し、全環境での接続互換性までは断定しません。

## Inspectorの主な設定

### X Channel / Y Channel

Vectorsから**横方向と縦方向の値を読むチャンネル**を選びます。例えばレンダラーの仕様で「RedにX、GreenにY」と保存されているなら、X ChannelをRed、Y ChannelをGreenに合わせます。ただし、レンダラーや書き出し設定によって保存先は異なります。色の見た目だけで判断せず、EXRのチャンネル名と書き出し元の仕様を確認してください。

### Flip Channel

XまたはYの**符号を反転**します。マニュアルの例では、Xベクトルの値が5の場合、Xの反転を有効にすると-5として扱われます。

動きの方向が期待と逆なら、まずX/Yの対応が正しいかを調べ、その後Flip Channelを試します。時間方向の解析をやり直す機能ではありません。

### Lock Scale X/YとScale

**Scale**はベクトルの値に倍率を掛けます。マニュアルの例では、ベクトル値10にScale 2を指定すると20として扱われます。横向きに10ピクセル動く対象なら、Scaleを増やすと横方向のブラー量が増えることになります。

XとYを同じ倍率で調整する場合は共通のScaleを使い、別々に調整する場合は**Lock Scale X/Yを解除**してScale X / Scale Yを操作します。例えば横方向の移動だけを強調したい場合は、X側の倍率を上げ、Y側を抑える設定を比較します。

ただし、21.1マニュアルのLock Scale X/Y説明には「選択すると別々のスライダーを使える」と読める文と、「解除すると分かれる」とする文が併存します。この記事は後者の記述に従い、実機でスライダーの表示が異なる場合はUIを優先してください。

Scaleは移動ベクトルに掛ける倍率です。**Scale 1が特定のシャッター角や露光時間を厳密に再現する**といった換算は、21.1マニュアルからは確定できません。

### Settings：Blendとチャンネル

Settingsタブの**Blend**は、元画像と処理後の画像を混ぜる共通設定です。0では元画像、値を上げるとブラー後の結果が強くなります。RGB / Alphaのチャンネル選択では、効果を適用する出力チャンネルを限定できます。

これらは**移動ベクトルのX/Y Channel指定とは別**です。SettingsでRedを無効にしても、X ChannelをRedにしたベクトルの読み取り先を変更する操作にはなりません。共通設定は[Blur / Filterノード](./index)でも扱います。

## 接続例1：3Dレンダーの独立したMotion Vectorパスを使う

車が右から左へ移動するCGショットに、レンダリング後から移動ブラーを足す例です。

~~~text
Loader（Beauty）─────────────→ Input
                              Vector Motion Blur ──→ MediaOut
Loader（Motion Vector AOV）──→ Vectors
~~~

1. CGソフトから完成画像（Beauty）とMotion Vectorパスを出力します。**Motion Vector側は符号付きの浮動小数点値を保つ形式**で保存してください。
2. Beautyを**Input**へ、Motion Vectorパスを**Vectors**へ接続します。
3. AOVの仕様を確認し、例えばXがRed、YがGreenなら**X Channel = Red / Y Channel = Green**にします。
4. **Scale**を小さな値から変え、動く車の長さと方向を見比べます。背景まで流れる場合、背景のベクトルがゼロに近いかを確認します。
5. ブラーの向きが逆なら、チャンネルの入れ替わり・符号の約束・Flip Channelの順に確認します。

この構成では、車と背景の動きを別々に扱えるため、画面全体へ同じ方向のブラーを掛けるより、3Dレンダーが持つ移動情報を生かせます。ただし、ベクトルの**座標系、単位、前フレーム向き／次フレーム向き**は書き出し元によって異なります。

## 接続例2：RGBのベクトルパスを補助チャンネルへ格納する

21.1マニュアルChapter 77には、**RにX、GにYが入った独立したRGB画像**を、[Channel Booleans](../color/channel-boolean)でBeautyの補助チャンネルへ移してからVector Motion Blurに渡す例があります。

~~~text
Loader（Beauty）───────→ Channel Booleans（Background）──→ Vector Motion Blur（Input）
Loader（Vector RG）────→ Channel Booleans（Foreground）
~~~

1. Channel BooleansのBackgroundにBeauty、ForegroundにベクトルのRGB画像を接続します。
2. To Red / To Green / To Blue / To Alphaをすべて**Do Nothing**にし、Beautyの色を上書きしないようにします。
3. **Aux**タブで**Enable Extra Channels**を有効にします。
4. **To X Vector = Red FG**、**To Y Vector = Green FG**に設定し、ForegroundのR/Gを補助ベクトルへコピーします。
5. Channel Booleansの出力を**Vector Motion BlurのInput**へ接続します。

これは**独立したVectors端子へ画像を渡す例とは異なる経路**です。マニュアルに掲載された設定を示していますが、前述のInputs節とは接続条件の説明に食い違いがあります。対象バージョンで実際にブラーが発生するか、Vector表示でデータを確認してください。

補助チャンネルの扱いは[補助チャンネル / AOV](../../learn/02-data/auxiliary-channels)で解説しています。

## 接続例3：Optical Flowで映像から移動を推定する

3DソフトのAOVを持たない通常の動画でも、[Optical Flow](../optical-flow/optical-flow)で連続フレームを解析して移動ベクトルを生成できます。

1. 元動画をOptical Flowへ送り、動く領域の**Forward / Back Vector**が生成されているか確認します。
2. 解析結果を、必要なベクトルチャンネルを保持したEXRとして保存するか、補助チャンネルを維持できる経路でVector Motion Blurへ送ります。
3. ベクトルを独立画像として渡す場合は**Vectors**に、補助チャンネル付き画像を利用する場合は前節と同様に**Input経路**での挙動を確認します。
4. Vector Motion BlurのScaleを変え、手や髪の動きと背景の輪郭を比較します。

Optical Flowは画像の変化から移動を**推定**します。遮蔽、細い髪、反射、急なカットなどで解析が間違うと、その誤ったベクトルに沿ってブラーが出る場合があります。結果を確認せず「撮影時の正確なモーションブラーを復元する機能」とは扱いません。

## うまくいかないとき

| 症状 | 最初に確認すること |
| --- | --- |
| ブラーが出ない | Beautyとベクトルが接続されているか。選んだX/Y Channelに非ゼロの値があるか。ScaleやSettingsのBlendがゼロになっていないか。 |
| 横方向の動きが縦へ伸びる | X ChannelとY Channelの格納先が逆になっていないか。AOVのチャンネル配置を確認する。 |
| 向きが逆 | 前後フレームのベクトルを取り違えていないか。X/Yの符号とFlip Channelを比較する。 |
| 画面全体に長い筋が出る | 背景のベクトル値、レンダラー側の正規化・単位、Scaleを確認する。 |
| 動きが段階的で不自然 | 8-bit画像などへ変換する途中で負値・浮動小数点値を失っていないか、EXRのデータを調べる。 |
| 輪郭から不自然な色が伸びる | Vector MaskとEffect Maskの違い、ベクトルパスとBeautyの位置合わせ、ベクトルの境界を確認する。 |
| Optical Flowの結果が破綻する | 元の連続フレームを確認し、遮蔽や高速移動付近の推定ベクトルを先に検査する。 |

赤緑の「カラフルな画像」に見えても、チャンネルに格納された数値や符号が正しいとは限りません。ベクトルの表示方法は[Optical Flow](../optical-flow/optical-flow)と[補助チャンネル / AOV](../../learn/02-data/auxiliary-channels)を参照してください。

## 関連ノード

- [Directional Blur](./directional-blur)：ベクトルパスがなく、一定の方向や中心から流す場合。
- [Optical Flow](../optical-flow/optical-flow)：撮影素材の連続フレームから移動ベクトルを推定する場合。
- [Channel Booleans](../color/channel-boolean)：RGBのベクトルパスを補助チャンネルへ割り当てる場合。
- [Vari Blur](./variblur)：別画像で**場所ごとのぼかし量**を指示する。移動の方向・長さをベクトルで与える本ノードとは異なる。
- [Mask](../../learn/02-data/mask)：Vector Mask / Effect Maskの考え方。

## バージョンと確認範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、**Chapter 92「Blur Nodes」pp.2128–2131**（本ノードの入力、X/Y Channel、Flip Channel、Scale、共通Settings）、**Chapter 77「Understanding Image Channels」p.1695**（XY Vector / XY BackVectorとChannel Booleansを使う接続例）。

[Blackmagic Design公式マニュアル](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)

ここで説明した端子とInspector設定は上記のマニュアルに基づきます。接続例は理解用の手順であり、21.1実機でのすべての経路・各レンダラーの符号規約・初期値・Edition差・処理性能は検証していません。Inputs節の入力数とVectors必須条件、Lock Scale X/Yの説明には前述の記述不一致があるため、検証状況はpartialとしています。
