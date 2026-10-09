---
title: Swizzler
description: 複数の画像からLayerとRGBA・Aux channelを選び、マルチレイヤー画像を組み立てるFusionノード。
doc_type: node
term_id: swizzler
term_short: 複数の画像のLayerやchannelを選択し、新しいLayerへ割り当てるノード。
verification: partial
aliases: [Swizzler, Swz]
concepts: [image-data, auxiliary-channels, multilayer]
nodes: [Swizzler]
node_family: color
controls: [Layer List, Add Layer, Keep Main Input Layers, Channels, Source, Source Layer, Source Channels]
inputs: [image]
outputs: [image]
tasks: [multilayer, auxiliary-channels, channel-remap]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Swizzler

Swizzlerは、複数の画像から必要なLayer（レイヤー）やchannel（チャンネル）を取り出し、**新しいLayerを持つ画像へ組み直す**ノードです。CGのレンダーパスを別々の画像で受け取ったとき、それぞれを名前付きLayerへまとめたり、ある画像のRGBAと別の画像の補助channelを組み合わせたりできます。

ここでいうLayerは、Fusionのタイムライン上に重ねるクリップではなく、**1つの画像データの中に保持できる名前付きのデータのまとまり**です。RGBAはRed・Green・Blue・Alpha、Aux（補助channel）は深度・法線・UVなどの追加データを指します。先に[Layerノードの概要](../layers/index)と[補助Channel / AOV](../../learn/02-data/auxiliary-channels)を読むと接続の意味が分かりやすくなります。

## 入力と出力

| 端子 | 接続するもの | 役割 |
| --- | --- | --- |
| **Input 1（オレンジ）** | 基準となる2D Image。通常のRGBA画像でも、複数Layerを持つ画像でもよい | 新しいLayerの素材になり、必要なら既存Layerも出力へ引き継ぐ |
| **Input X（白）** | 追加する2D Image。別のレンダーパスやマルチレイヤー画像など | Layerまたはchannelの追加供給元になる |
| **出力** | 後段の2D Image入力 | 選択したLayer / channelを組み込んだ画像を渡す |

複数の入力に接続しても、すべてが無条件に出力へ合成されるわけではありません。**出力Layerごとに、どの入力のどのchannelを使うか指定します。** Swizzlerは画像の見た目を重ねる[Merge](../compositing/merge)とは目的が異なります。

## Inspectorで設定する項目

| 設定 | 何を変えるか |
| --- | --- |
| **Layer List** | 出力側に作成するcustom Layerの一覧。Layerを選択し、その中身を設定する。名前も変更できる |
| **Add Layer** | 新しいLayerを一覧へ追加する |
| **Keep Main Input Layers** | Input 1に含まれる既存Layerを保持して出力へ通す。既存のマルチレイヤー画像へ追加するときに使う |
| **Channels** | 選択中のLayerへ転送するchannelを、どの単位で選ぶか決める |
| **Source** | channelの供給元となるSwizzlerの入力を指定する |
| **Source Layer** | Sourceがマルチレイヤー画像なら、その中のどのLayerを使うか選ぶ |
| **Source Channels** | Color/Auxモードで、選んだLayerのどのchannelを補助channelの材料として使うか指定する |

Layer Listで対象のLayerを選んでから、下の設定を変更します。別のLayerを選べば、そのLayerには別のSourceやchannelの組み合わせを指定できます。

### Channelsの4つの選択方法

- **All Channels**：選択したSourceのchannelをまとめて、現在の出力Layerへ転送します。レンダーパスを1つずつ独立したLayerにしたい場合に使います。
- **Color/Aux**：RGBAとAuxを分けて、異なる入力・Layerから取り出せます。見た目のRGBAを保ちながら、別のパスから法線などの補助データを受け取る場合に使います。
- **RGB/A**：RGBとAlphaを別々の供給元から選ぶ場合に使います。
- **R/G/B/A**：Red・Green・Blue・Alphaを個別に割り当てる場合に使います。

例えばUV座標をRGに、法線のXYZをRGBに保存したパスを受け取った場合、**Color/AuxのSource Channels**でそれぞれRGやRGBを取り出す選択ができます。ただし、RGB画像を選ぶだけで自動的に「法線」や「UV」と認識されるわけではありません。元のレンダーがどの値をどの成分に書き出したかを確認し、適切な補助channelへ対応付けます。

## 運用例1：別々のCGパスを名前付きLayerへまとめる

Beauty、Normal、UVが別ファイルとして渡され、合成中は1本の画像の流れで扱いたい場合です。

```text
Loader_Beauty（RGBA）──→ Swizzler : Input 1（オレンジ）
Loader_Normal（RGB）───→ Swizzler : Input 2（白）
Loader_UV（RGなど）────→ Swizzler : Input 3（白）
                              │
                              └──→ Layerを持つImage → 後段のLayer処理
```

1. 3つの画像をSwizzlerの各入力へ接続します。
2. **Layer List → Add Layer**で必要な数のLayerを作り、`Normal`、`UV-Texture`など用途の分かる名前にします。
3. `Normal`を選び、**Channels = All Channels**、**Source = Input 2**を指定します。
4. `UV-Texture`を選び、**Channels = All Channels**、**Source = Input 3**を指定します。
5. Input 1のBeautyを含む既存Layerも残すなら、**Keep Main Input Layers**を有効にします。
6. Viewerで各Layerを選び、期待したパスが入っているか確認します。

この操作は**各パスを独立したLayerへ格納する例**です。後段のノードに「法線Aux channel」や「UV Aux channel」として渡すことが目的なら、次の例のようにchannel単位で割り当てます。Layerの名前を`Normal`にしただけでは、必ずしも後段のNormal入力として解釈されません。

## 運用例2：RGBAと補助channelを1つのLayerへ組み合わせる

合成の見た目にはBeautyを使い、後段の処理で法線やUVを参照したい場合です。

```text
Beauty（RGBA）────────→ Swizzler : Input 1
Normal pass（RGB）───→ Swizzler : Input 2
UV pass（RG）────────→ Swizzler : Input 3
                              │
                              └──→ RGBA + 必要なAuxを持つLayer
```

Layer Listで出力先のLayerを作成・選択し、**Channels = Color/Aux**にします。ColorにはBeautyのRGBAを、Auxには目的のパスを供給元として指定します。法線がRGBのXYZ成分で書き出されていればRGB、UVがRGの2成分で書き出されていればRGをSource Channelsとして選びます。

この例で行っているのは**すでにレンダーされた値の配置換え**です。Swizzlerが2D Beauty画像から正しい深度・法線・UVを計算するわけではありません。各Auxに何を入れるかはレンダーのchannel仕様に従ってください。

### Alphaだけ別素材から使う場合

RGBとAlphaを別の画像から取るなら、同じLayerの**Channels = RGB/A**を使います。RGBのSourceをBeauty、AlphaのSourceを別のマット画像にする設定です。Red・Green・Blueもそれぞれ異なる入力から構成したい場合は**R/G/B/A**を使います。Alpha素材がRGBA画像のどのchannelに格納されているかも確認してください。

## 運用例3：既存マルチレイヤー画像へ後からパスを足す

Input 1にBeauty・Depthを含むEXR、Input 2に追加のMotionパスを接続する場合は、**Keep Main Input Layers**を有効にしたうえで、Motion用のLayerを作成します。SourceをInput 2へ向けると、元のBeauty・Depthを残しながら追加Layerを持つ出力を構成できます。

Input 2自体が複数Layerを持つ場合は、**Source Layer**で対象を選びます。単純に2つのマルチレイヤー画像のLayerを結合するだけなら[Layer Muxer](../layers/layer-muxer)、不要なLayerの削除だけなら[Layer Remover](../layers/layer-remover)の方が設定は少なく済みます。

## 想定した結果にならないとき

- **出力の既存Layerがなくなった**：Keep Main Input Layersを確認します。Input 1から何を引き継ぐかを決める設定です。
- **違う画像がLayerに入った**：Layer Listで目的のLayerを選んだ状態で、Sourceを確認します。Sourceがマルチレイヤー画像ならSource Layerも確認します。
- **色は見えるのにAuxが使えない**：All Channelsで名前付きLayerを増やしただけなのか、Color/Auxで後段が必要とする補助channelへ値を割り当てたのかを区別します。元画像の成分の意味も確認します。
- **Alphaだけ期待と違う**：RGB/AやR/G/B/AでAlphaに指定したSourceとchannelを見直します。
- **Viewerでは見えるが書き出し先で消える**：書き出し形式と保存側のLayer / Aux対応を別途確認します。Swizzlerの出力と最終ファイルの保持仕様は同じとは限りません。

## 関連ノードと使い分け

- [Channel Booleans](./channel-boolean)：2D ImageのchannelをCopy・Multiplyなどで計算・置換する。Swizzlerは**Layerの作成と複数入力からの割り当て**が中心。
- [Copy Aux](./copy-aux)：補助channelをRGBA側へ写すなど、値を別channelとして扱うときの候補。
- [Layer Muxer](../layers/layer-muxer)：2つのマルチレイヤー画像からLayerを選んで結合する。
- [Layer Regex](../layers/layer-regex)：Layer名の規則で名称変更・選別・削除をする。
- [Layer Remover](../layers/layer-remover)：すでにある不要Layerを削除する。

## バージョンと出典

**DaVinci Resolve 21.1 Reference Manual（2026年9月版）、Chapter 106「Layer Nodes」、pp.2445–2450**のSwizzler [Swz]を確認しました。入力の色と役割、Controlsタブの項目、Channelsの4モード、RGBパスをAuxへ割り当てる例、および複数パスから新しいLayerを作る例は同章に基づいています。

記事中のBeauty・Normal・UV・Motionという入力名と接続順は、動作を説明するための例です。**実機の入力上限、個別channelの初期値、Free / Studio差、出力ファイル形式ごとの保持挙動は未検証**です。ここで扱うLayerはFusionのマルチレイヤー画像であり、Deep Imageのpixelごとの複数depth sampleとは異なります。
