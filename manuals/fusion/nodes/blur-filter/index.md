---
title: Blur / Filterノード
description: Fusionのぼかし・発光・輪郭強調・画素の選別・凹凸画像生成に使う14ノードを、入力と仕上がりから選ぶための案内。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, blur, soften, defocus, motion-blur, sharpen, filtering, bump-map]
updated: "2026-10-14"
---

# Blur / Filterノード

このカテゴリには、2D <Term id="image">Image</Term>をぼかすだけでなく、輪郭を強調する、近くの画素から別の値を選ぶ、白黒の高さ画像を凹凸情報へ変換するといったノードも含まれます。ほとんどは**画像を入力し、加工後も2D画像を出力する**ノードです。

最初に決めるのは「どんな見た目にしたいか」です。ぼかしを使う場合はさらに、画面全体を同じ量でぼかすのか、場所・方向・動きに応じて変えるのかを分けます。

## 目的から選ぶ

| 目的 | ノード | 入力した画像がどう変わるか |
| --- | --- | --- |
| 全体を同じ設定で柔らかくする | [Blur](./blur) | 周囲の画素を参照して輪郭を広げる。X方向とY方向のぼかし量も調整できる。 |
| ピントが外れたような光点を作る | [Defocus](./defocus) | レンズのぼけに似た広がりを作り、Lens方式では光点の形も調整できる。 |
| 一定方向や中心に向かって像を流す | [Directional Blur](./directional-blur) | 直線、回転方向、ズーム方向など、設定した方向に像を引き延ばす。 |
| 画面内の場所ごとにぼかし量を変える | [Vari Blur](./variblur) | 別の画像の明暗やAlphaを読み、場所ごとのぼかし量を決める。 |
| 被写体の動きに応じてぼかす | [Vector Motion Blur](./vector-motion-blur) | 左右・上下の移動量を記録したベクトル情報に従い、画素ごとのブラーを作る。 |
| 明るい部分に光のにじみを加える | [Glow](./glow) | 発光成分を広げ、元の画像へ合成する。 |
| より柔らかな発光を重ねる | [Soft Glow](./soft-glow) | 光をなだらかに広げ、人物や光源、文字の輝きを調整する。 |
| 輪郭を少ない項目で強調する | [Sharpen](./sharpen) | 周囲との明暗差を強め、元からある輪郭を目立たせる。 |
| 輪郭の幅・強さ・弱い差の扱いを分ける | [Unsharp Mask](./unsharp-mask) | ぼかした画像との差を利用し、弱いコントラストの部分を除外しながら輪郭を強調する。 |
| 白いマットや図形を太らせる／細くする | [Erode Dilate](./erode-dilate) | 明るい領域と暗い領域の境界を移し、輪郭の幅を変える。 |
| 孤立した点を抑える、面を単純化する | [Rank Filter](./rank-filter) | 周辺画素を値の順に並べ、指定した順位の画素で置き換える。 |
| 輪郭抽出・ノイズ・エンボスなどから選ぶ | [Filter](./filter) | Sobel、Laplacian、Grainなど、用意された画像処理を切り替える。 |
| 周辺画素の計算方法を自分で指定する | [Custom Filter](./custom-filter) | 3×3などの行列に係数を入力し、近隣画素の組み合わせ方を指定する。 |
| 白黒の高さ模様から凹凸用画像を作る | [Create Bump Map](./create-bumpmap) | 明暗の変化を凹凸の向きに変換し、方向情報をRGBへ格納した2D画像を出力する。 |

**Blurは全体のぼかし量、Vari Blurは場所ごとのぼかし量、Vector Motion Blurは各画素の移動方向と距離**を主に扱います。「ブラー」という名前だけで同じ種類の入力が必要だと考えないことが重要です。

## 入力と出力を理解する

一般的な画像処理ノードでは、元画像をオレンジ色の入力へ渡し、出力を次の画像処理やMediaOutへ接続します。

~~~text
MediaIn ──→ Blur ──→ MediaOut
~~~

多くのノードには、青色の **Effect Mask** 入力もあります。これは元画像とは別に、**処理後の効果を使う範囲**を決めるものです。EllipseやPolygonなどで作ったマスクを接続します。

~~~text
MediaIn ──→ Blur ──→ MediaOut
               ↑ 青：Effect Mask
             Ellipse
~~~

Chapter 92・99の該当ノードでは、Effect Maskはフィルターの計算**後**に適用されると説明されています。効果を限定するマスクと、「どこをどれだけぼかすか」を決める別の画像入力は同じではありません。[Maskの基礎](../../learn/02-data/mask)と[Imageの基礎](../../learn/02-data/image)も参照してください。

### 別の画像でぼかし量を変える：Vari Blur

[Vari Blur](./variblur)では、ぼかしたい映像に加えて**Blur Image（緑の入力）**が必要です。例えば左から右へ明るくなるグラデーションを入力し、その明暗に応じて、画面の一方を強くぼかす表現を作れます。

~~~text
MediaIn ────────────────→ Vari Blur ──→ MediaOut
Background（グラデーション）→ Blur Image（緑）
~~~

Blur ImageのRed・Green・Blue・Alpha・Luminanceのどれを使うかは、InspectorのBlur Channelで選びます。これは**画像の値を使った演出的な奥行き表現**であり、実際のレンズの焦点や被写体の距離を自動計算するものではありません。黒いマップの厳密な挙動には21.1マニュアル内で解釈しにくい記述があるため、[個別記事](./variblur)に掲載した確認方法を参照してください。

### 動きの情報でぼかしを変える：Vector Motion Blur

[Vector Motion Blur](./vector-motion-blur)は、映像とは別に各画素の左右・上下の移動量を読み取ります。3Dソフトから書き出したMotion Vectorパスや、[Optical Flow](../optical-flow/optical-flow.md)で推定した移動情報を利用する方法があります。

~~~text
CGの完成画像 ────────→ Vector Motion Blur ──→ MediaOut
Motion Vectorパス ──→ Vectors入力
~~~

ベクトルのチャンネル配置、符号、単位は元データの仕様に合わせます。背景を止めたまま走行中の車だけを流したい場合には、画面全体へ一定方向のブラーを掛けるより、画素ごとの動きを生かせます。

## 仕上がりに応じた使い分け

### 光を広げたい場合

夜の街灯やネオンの周囲に光を足したいなら、[Glow](./glow)か[Soft Glow](./soft-glow)を選びます。これらは光の成分を広げて元画像へ重ねるためのノードです。画像全体を読みにくくするぼかしとは用途が異なります。

人物を残して背景だけを柔らかくする場合は、BlurまたはDefocusとEffect Maskの組み合わせから考えます。点光源がピント外れになったときの形を見せたいなら、[Defocus](./defocus)のLens方式を比較します。

### 輪郭を強調するか、マットを細くするか

髪や衣装、文字の輪郭をくっきり見せたいなら[Sharpen](./sharpen)か[Unsharp Mask](./unsharp-mask)です。どちらも既存の明暗差を強調するもので、失われたピント情報を復元するわけではありません。

キー抜き後の人物の白いマットを少し内側へ寄せたいなら、[Erode Dilate](./erode-dilate)でAlphaを処理する方法を検討します。Amountを小さな負の値へ調整すると、白い領域を縮める方向に働きます。ただし、マットの幅を調整しても、元映像に残った背景色が自動で除去されるわけではありません。

### 点状ノイズを抑えるか、輪郭を抽出するか

一様な壁に孤立した明るい点や暗い点があるなら、[Rank Filter](./rank-filter)で近くの画素を順位に従って選び直す方法が候補です。髪や細い線まで変わり得るため、元画像との比較が必要です。

輪郭画像を作ってGlowのマスクなどへ渡したいなら、[Filter](./filter)のSobelなどが候補です。周辺画素の計算係数を自分で定義してエンボスや独自の輪郭表現を作る場合は[Custom Filter](./custom-filter)を使います。これらは被写体を意味で認識して切り抜く機能ではありません。

## 凹凸情報を3D材質へ渡す場合

[Create Bump Map](./create-bumpmap)は白黒の高さ画像から**凹凸の向きをRGBに記録した2D画像**を作ります。3Dの材質や形状を直接出力するノードではありません。

~~~text
白黒の高さ画像
    ↓
Create Bump Map（RGBの凹凸画像）
    ↓
Bump Map（3D Materialへ変換）
    ↓
Blinnなどの材質 ──→ 3Dオブジェクト ──→ Renderer 3D
~~~

石の壁の細かな起伏を表したいなら、高さの模様をCreate Bump Mapへ渡し、出力を[Bump Map](../materials-lights/bumpmap)経由で材質へつなぎます。模様に応じて光の当たり方は変わりますが、これだけではメッシュや物体の輪郭は盛り上がりません。2D画像と3D材質の違いは[Classic 3Dの基礎](../../learn/02-data/classic-3d)を参照してください。

## 透明部分や画面の端が不自然なとき

周辺画素を参照するフィルターは、入力画像の有効領域（<Term id="domain-of-definition">Domain of Definition / DoD</Term>）に影響されます。Blurなどで透明な文字の外側や画面の端が不自然なら、Clipping Modeも確認してください。

- **Frame**：フレーム全体を有効領域として扱い、元の有効領域の外側は黒・透明として扱う。
- **Domain**：前段の有効領域を尊重する。大きなぼかしでは境界で結果が切れる場合がある。
- **None**：元画像のクリッピングを行わず、必要な参照先が有効領域の外なら黒・透明として扱う。

これらの選択肢がすべてのノードにあるわけではありません。個別記事とInspectorで確認してください。[DoDの基礎](../../learn/03-space/domain-of-definition)と[有効領域の確認手順](../../learn/07-debugging/resolution-domain-of-definition)も参照してください。

## 出典と確認範囲

一次資料はBlackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、**Chapter 92「Blur Nodes」pp.2108–2131**、**Chapter 99「Filter Nodes」pp.2327以降**です。正確な入出力・設定とその根拠ページは各ノードの記事で説明しています。[公式マニュアル](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)。

このページの接続例はマニュアルの仕様から組み立てた説明です。21.1実機でのすべての経路、内部計算、初期値・数値範囲、Free / Studio差を一括検証したものではないため、検証状況はpartialとしています。
