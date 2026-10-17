---
title: Vector Transform
description: Optical Flowが作ったVector / Back VectorやUV channelを平滑化・減衰・移動・scale・回転し、別の画像やsequenceへ合わせるStudio専用Node。
doc_type: node
term_id: vector-transform
term_short: "Vector Transformは、motion vectorやUV channel自体を整形して後段のwarpへ渡すNode。"
verification: partial
aliases: [Vector Transform, VXf]
concepts: [image-data, auxiliary-channels, motion-vectors, transform]
nodes: [Vector Transform]
node_family: warp
controls: [Smooth UV, Smooth Vector, Attenuate UV, Attenuate Vector, Center X, Center Y, Size X, Size Y, Use Size and Aspect, Size, Aspect, Angle]
inputs: [image, vector, mask]
outputs: [image, vector]
tasks: [warp-image, transform-vector]
product_scope: fusion-studio
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# Vector Transform

Vector Transformは、画像そのものを移動・拡大する通常のTransformではなく、Imageに含まれるmotion vectorやUV channelを平滑化・減衰・移動・scale・回転するNodeです。

Optical Flowで得たVector / Back Vectorを別の画像やsequenceへ合わせ直したいときや、Vector Warpへ渡す前にvector fieldを整えたいときに使います。

## 役割

```text
MediaIn → Optical Flow → Vector Transform → Vector Warp
```

Optical Flowが生成したVector / Back Vector channelを受け取り、そのvector情報の位置・大きさ・角度・強さを調整します。

見えているRGB Imageを直接変形することが主目的ではなく、後段が参照するmotion / UV dataを整えるNodeです。

## まず区別するデータ

**Motion Vector（Vector / Back Vector）** は、前後のフレーム間で画素がどちらへどれだけ動いたかを表す補助チャンネルです。Optical Flowは、この情報を画像に付随するチャンネルとして生成します。

**UV channel / Warp map** は、画像の位置を別の画像や基準フレームの位置に対応付けるための補助チャンネルです。Vector Warpは動きの情報を使い、基準フレームから現在のフレームへの対応をUV channelとして生成できます。考え方の詳細は[補助チャンネル / AOV](../../learn/02-data/auxiliary-channels)を参照してください。

Vector Transformは両者を同じものとして扱うわけではありません。Inspectorの **Smooth UV / Attenuate UV / Center / Size / Angle** は主にUV channel、**Smooth Vector / Attenuate Vector** はmotion vectorを対象に説明されています。どのチャンネルを入力が持っているかで、調整できる内容が変わります。

## 入力

### Input

オレンジ色のInputへ2D Imageを接続します。

21.1 Manualでは、Optical Flowの出力を接続し、そのImageに含まれるVector / Back Vector channelを変換する構成が示されています。Vector専用の別入力端子があるわけではなく、Imageに付随する補助チャンネルを読み取ります。UVを調整する場合は、必要なUV channelが入力に存在することも確認します。

### Attenuate Mask

白色のAttenuate Mask inputへMask shapeを接続します。

vector / UVの減衰を画面全体ではなく、必要な領域へ限定したい場合に使います。この端子は**Attenuate Mask**であり、Center・Size・Angleなどの全設定を一括して制限する汎用Effect Maskと同一視しないでください。21.1 Manualはマスクの入力型を示していますが、白黒の値と各Controlの厳密な合成式までは説明していません。

## 出力

2D Imageを出力し、その中のvector / UV channelへVector Transformの調整結果を反映します。独立したVector出力端子を追加するという意味ではありません。

後段ではVector Warpなど、motion vectorやUV channelを利用するNodeへ接続できます。

## 主な設定項目

### Smooth UV

近傍pixelのUV値を平均し、UV channelの局所的な乱れや不連続を滑らかにします。

### Smooth Vector

隣接frame間でvectorを滑らかにします。21.1 Manualでは、texture mapを使うVector Warpの前処理として使えると説明されています。

### Attenuate UV

UV magnitudeがwarpへ与える影響を強めたり、弱めたり、0まで落としたりします。

### Attenuate Vector

motion vectorの長さを短くし、vectorによるwarp量をfullから0まで減らします。

### Center X / Y

UV channelの位置を移動します。

### Size X / Y

UVをX / Y方向へ個別にscaleします。

### Use Size and Aspect / Size / Aspect

Use Size and Aspectを有効にすると、SizeでX / Yをまとめてscaleし、Aspectで縦横比を調整できます。

### Angle

UV channelの角度を回転します。

## どのControlを選ぶか

| 調整したいこと | Control | 変わる情報・確認点 |
| --- | --- | --- |
| 同じフレーム内でUV対応が細かく波打つ | **Smooth UV** | 周囲のUV値と平均して局所的な変化を抑える。細部の変形も丸くなる可能性がある。 |
| フレームを進めるとmotion vectorの方向や長さがちらつく | **Smooth Vector** | 隣接フレームのvectorを平滑化する。Smooth UVのような画面内の平均化とは異なる。 |
| UVを使うwarp mapの効きを変えたい | **Attenuate UV** | UV channelのwarpへの寄与を増減する。0まで減らす操作もできる。 |
| motion vectorに基づく動き・変形を弱めたい | **Attenuate Vector** | vectorの長さを短くし、後段のwarp量をfullから0へ近づける。 |
| UV mapの位置・寸法・向きが合わない | **Center / Size / Aspect / Angle** | UV channelの座標を移動・拡大縮小・回転する。元のRGBの構図を直接Transformする設定ではない。 |

似た名前でも **Smooth UVは空間方向**、**Smooth Vectorは時間方向** の平滑化です。また、**Attenuate UV**と**Attenuate Vector**は操作対象が違います。どちらも動きの推定そのものを修復する機能ではありません。

## 最小構成

```text
MediaIn → Optical Flow → Vector Transform → Vector Warp → MediaOut
                                      ↑
                              Texture / still
```

まずOptical Flowの出力でmotion vectorが得られていることを確認し、その後にVector Transformで位置・scale・角度・強さを調整します。

## 運用例1：シャツに貼ったロゴの動きを落ち着かせる

1. シャツの動画を**Optical Flow**へ接続します。ここでフレーム間の**Vector / Back Vector**を生成し、元映像の動きが大きく誤推定されていないか先に確認します。
2. Optical Flowの2D Image出力を**Vector TransformのInput**へ接続します。ロゴはシャツが見やすい基準フレームに合わせて、透明背景のstill Imageとして別に用意します。
3. Vector TransformのImage出力を**Vector WarpのInput**へ、ロゴを**Texture**へ接続します。Vector WarpのReference Frameをロゴを描いたフレームに合わせ、Operationを **Generate Warp + Map** にします。
4. 再生するとロゴが細かく震える場合、まず**Smooth Vector**を少量調整し、隣接フレーム間のvectorの変動を抑えられるか確認します。UV mapを生成・使用する構成で局所的な歪みが目立つなら、**Smooth UV**の効果も確認します。

ロゴが基準フレームからずれているなら、先に**ロゴの位置とReference Frame**を直します。Center / Size / Angleは21.1 ManualでUV channelの設定として説明されており、Optical Flowのmotion vectorだけを入力したときに、通常のTransformと同じようにロゴを配置できると考えないでください。大きな遮蔽や誤追跡は、平滑化だけでは解決しません。

## 運用例2：同じ動きから弱い変形を作る

動く素材からOptical Flowでmotion vectorを作り、Vector Transformで**Attenuate Vector**を調整してから、Vector Warpへ渡します。vectorの長さを減らすと、後段が利用する動きの量を小さくできます。たとえば布地に貼り付ける模様を元の布ほど大きく変形させず、変形を控えめに見せたい場合の出発点になります。

これは公式Manualが説明する「vectorの長さを減らす」「別素材へのtracking情報の転用」という機能から組み立てた使用例です。物理的な材質を自動推定する機能ではなく、実際の見え方は入力vectorと後段のVector WarpのOperationによって変わります。

## 運用例3：UV mapの位置を別素材へ合わせる

既にUV channelを持つ画像をVector Transformへ入力し、**Center X/Y**で位置を、**Size X/Y**または**Use Size and Aspect**で大きさを、**Angle**で向きを調整します。別のサイズや構図へ合わせるとき、対応関係を確認するための操作です。

たとえば、基準フレームで作ったtextureとUV mapの対応領域がずれている場合、現在フレームと基準フレームを見比べて少しずつ合わせます。調整はUV channelに対して行われるため、RGB映像自体を移動したいだけなら通常のTransformを使います。解像度差を自動で補正する設定だとは断定できません。

### Attenuate Maskを加える場合

B-Splineなどで減衰させたい領域を描いたmaskを**Attenuate Mask**へ接続し、Attenuate UVまたはAttenuate Vectorと組み合わせます。たとえば画面内の一部分で動きによる変形を弱くしたいときに検討できます。21.1 Manualにmask input自体は記載されていますが、境界の補間や各Controlへの適用範囲の詳細は未確認なので、maskの白黒やフェザーを変えて出力を比較してください。

## Vector Warpとの違い

- **Vector Transform** — vector / UV dataそのものを整形する
- **Vector Warp** — そのvectorを使ってTextureやImageを実際にwarpする

Vector Warpの結果がずれているとき、warp処理そのものではなくvector fieldの位置・scale・角度を直したい場合はVector Transformを使います。

## 挙動と注意点

Vector Transformは、21.1 Manual Chapter 112の **Vector Warping Toolset (Studio Version Only)** に含まれます。

通常のTransform Nodeと違い、主な対象はRGB Imageの見た目ではなくvector / UV auxiliary channelです。前段で必要なVector / Back Vectorが生成されていない場合、意図したmotion warp用dataを調整できません。

## うまく変形しないとき

| 症状 | 確認する順序 |
| --- | --- |
| 何を調整しても見た目が変わらない | Vector Transformは主に補助チャンネルを変更する。表示中のRGBAではなく、後段のVector Warpまで接続して比較する。入力にVector / Back Vectorまたは必要なUVがあるかも確認する。 |
| Smooth UVで揺れが止まらない | 時間方向の揺れならSmooth Vector、画面内のUVの乱れならSmooth UVを確認する。Optical Flowが誤った対応を出している場合は前段へ戻る。 |
| CenterやAngleを変えても素材の位置が合わない | 調整対象がUV channelであることを確認する。Textureの元位置、Reference Frame、UV channelの有無を見直す。 |
| Attenuate Vectorを弱めると追従が足りない | Vectorの長さを短くしているため、元の動きより変形量が減る。強すぎるattenuationを戻す。 |
| Maskの効果が想定と違う | Attenuate Maskと通常のEffect Maskを取り違えていないか確認する。マスク値と減衰Controlを組み合わせ、短い区間で比較する。 |

この節の診断手順は、21.1 Manualで確認できる機能に基づく運用上の提案です。実機で同一ショットを検証した結果ではありません。

## 関連Node

- [Optical Flow](../optical-flow/optical-flow.md)
- [Vector Denoise](../optical-flow/vector-denoise)
- [Vector Warp](./vector-warp)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 112 pp.2630–2631で、Input / Attenuate Mask、Optical FlowからのVector / Back Vector利用、Smooth UV、Smooth Vector、Attenuate UV、Attenuate Vector、Center、Size、Aspect、Angleを確認しました。Vector Warpとの接続・Reference Frame・Operationは同章pp.2632–2633を参照しています。

全既定値・数値範囲、内部REGID、実機performance、Attenuate Maskと各Controlの厳密な演算関係は未確認です。制作例はManual-groundedな提案であり、実機検証済みレシピではありません。
