---
title: "Spherical Stabilizer"
description: "360°映像の揺れを球面上の回転として解析・補正するNode。入力形式、追跡、補正強度、Smoothingと回転設定をResolve 21.1基準で解説。"
doc_type: node
term_id: "spherical-stabilizer"
term_short: "Spherical Stabilizerは、360°映像の特徴点を追跡してカメラの向きの揺れを抑えるVR用Node。"
verification: partial
aliases: ["Spherical Stabilizer"]
concepts: ["image-data"]
nodes: ["Spherical Stabilizer"]
node_family: "immersive"
controls: ["Reject Dominant Motion Outliers While Tracking", "Track Controls", "Append to Track", "Stabilization Strength", "Smoothing", "Offset Rotation"]
inputs: ["image"]
outputs: ["image"]
tasks: ["process-immersive", "stabilize-360"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-10"
---

# Spherical Stabilizer

Spherical Stabilizerは、手持ち撮影などで**360°映像の見える方向が細かく揺れてしまう**場合に、その揺れを抑えるNodeです。映像の中の目印を追跡して、カメラの向きが時間とともにどう変わったかを調べ、その回転を補正します。

通常の平面映像を左右にずらす処理ではなく、**球面上でカメラがどちらを向いているか**を扱います。視点を固定することも、意図したパン（左右への見回し）を残しながら揺れだけを滑らかにすることもできます。

**DaVinci Resolve Studio／Fusion Studio限定**です。21.1 Reference Manualでは「VR Nodes」に掲載されています。

## 役割

360°映像には、正面だけでなく周囲の風景も含まれています。撮影中にカメラが傾いたり、意図せず少し右を向いたりすると、再生時には景色全体が揺れて見えます。

Spherical Stabilizerは、建物や地面など画面内の特徴を自動で追跡し、カメラの動きを**パン（左右回転）・チルト（上下回転）・ロール（傾き）**として解析します。解析した回転に応じて映像の向きを変え、不要な揺れを抑えます。

**動く人物を画面中央に固定するNodeではありません。** また、ステレオの左右画像から奥行きを求めたり、360°の投影形式を変換したりする処理とも目的が異なります。

## 入力と出力

### 入力：Image（オレンジ、1系統）

球面として配置された<Term id="image">2D Image</Term>を接続します。21.1 Manualで入力例として明記されているのは、次の形式です。

| 形式 | 画像の配置 |
| --- | --- |
| **Lat Long（2:1 equirectangular）** | 周囲の360°を幅が高さの2倍の横長画像へ展開した形式。 |
| **VR 180** | 半球側の視界を表すVR映像。 |
| **Horizontal / Vertical Cross** | 立方体の各方向の画像を十字状に配置した形式。 |
| **Horizontal / Vertical Strip** | 各方向の画像を横一列または縦一列に並べた形式。 |

通常の16:9映像を接続するだけで、自動的に正しい360°素材になるわけではありません。元の画像がどの投影・配置形式で保存されたかを先に確認します。

### 出力：向きを補正したImage

出力は、解析結果に基づいて視点の回転を補正した**2D Image**です。Viewerや後段の360°用処理、MediaOutへ送れます。視差・Z深度や追跡点を別のデータとして出力するNodeではありません。

出力端子の内部名やREGID、各形式での継ぎ目処理などは実機未確認です。

## 主な設定項目

### Reject Dominant Motion Outliers While Tracking

背景と異なる方向へ動く特徴を、追跡の判断から外す設定です。21.1 Manualでは**既定で有効**とされています。

たとえば歩道の360°撮影で人や車が横切ると、被写体自体の移動をカメラの揺れとして誤認する可能性があります。この設定は、周囲にある安定した目印を優先するために使います。空や無地の壁など、そもそも目印が少ない素材の解析精度を保証するものではありません。

### Track Controls：動きを解析する

Controlsタブの追跡ボタンで、解析の方向と開始位置を選びます。

| ボタン | 意味 |
| --- | --- |
| **Track Backward from End Frame** | 現在のレンダー範囲の終端から逆方向へ追跡する。 |
| **Track Backward from Current Time** | 現在フレームから逆方向へ追跡する。 |
| **Stop** | 追跡を止め、途中までの結果を保持する。 |
| **Track Forward from Current Time** | 順方向の追跡を開始する。 |
| **Track Forward from Start Frame** | 順方向の追跡を開始する別のボタン。 |

**順方向の開始位置に注意してください。** 21.1 Manualでは、最後の2つについてボタン名の「Current Time」と「Start Frame」に対する説明文が**逆に対応しているように読めます**。本記事では実際の開始フレームを断定せず、必要なショットでは実機の追跡範囲で確認する扱いとします。

Manualは、**最初に追跡したフレームが安定化の基準フレームになる**と説明しています。開始位置は補正後の視点にも関わります。

**Append to Track**には次の2つがあります。

- **Replace**：これまでの追跡結果を破棄し、新しい解析結果へ置き換える。
- **Append**：以前の結果へ、今回の追跡結果を追加する。

再解析するときは、古い結果を残したいのか最初からやり直すのかを確認します。

### Stabilization Strength：補正の強さ

追跡で求めた回転を、どの程度補正するかを決めます。Manual上の範囲は**0.0〜1.0**です。

**0.0は補正なし、1.0は最大の補正**です。中間値なら元の回転が一部残ります。最大にすれば必ず自然になるわけではなく、意図して向きを変えた撮影では次のSmoothingも重要です。

### Smoothing：向きを固定するか、動きを残すか

Manualでは**0.0がStill、1.0がSmooth**です。

- **Still（0.0）**：回転をできるだけ取り除き、正面を向く視点を固定する方向。
- **Smooth（1.0）**：意図したパン・チルト・ロールを残しながら、急な向きの変化を滑らかにする方向。
- **中間値**：固定する動きと残す動きの間で調整する。

**Stabilization Strengthは補正量、Smoothingは補正後に残したい動きの性質**を調整します。同じ設定ではありません。

### Offset Rotation：補正した後の向きを調整する

水平線をまっすぐにしたり、映像の正面として見せたい方向を変えたりするための手動回転です。

| 軸 | 回転 | 運用例 |
| --- | --- | --- |
| **X** | Pitch／Tilt（上下方向） | 視点を少し上・下へ向ける。 |
| **Y** | Pan／Yaw（左右方向） | 正面に見せたい建物の方向を合わせる。 |
| **Z** | Roll（水平線の傾き） | 地平線や建物の垂直を整える。 |

回転の適用順は**X → Y → Z**とManualに記載されています。複数軸を調整するときは、必要なら1軸ずつ変更して結果を確認します。

### Settingsタブ

VR系Nodeに共通の設定があります。追跡、強度、滑らかさ、回転の中心となる設定は**Controlsタブ**です。未確認の初期値やGPU処理結果は追加していません。

## 主な用途

- **手持ちの360°動画を見やすくする**：歩行時にカメラの向きが細かく振れる映像で、不要な回転を減らす。
- **ゆっくりしたパンを残す**：観光地を見回す意図は残しつつ、小さな首振りの揺れを滑らかにする。
- **水平線を整える**：補正後に地平線が傾く場合、Offset Rotationで見える方向を合わせる。
- **360°映像を補修する前に安定化する**：後段で映像の一部を修正する前に、元の視点がどれほど動いているか整理する。

## 最小構成

2:1のLat Long動画を読み込み、Manualで示された1入力の構成を使います。

~~~text
MediaIn / Loader（2:1 Lat Long）
               │
               ▼
       Spherical Stabilizer
        オレンジ：Image
               │
               ▼
         Viewer / MediaOut
~~~

1. 2:1の360°動画を読み込み、Spherical Stabilizerのオレンジ入力へ接続します。
2. 映像の背景に建物・地面などの追跡しやすい特徴があるか確認します。
3. Controlsタブから追跡し、解析結果を得ます。必要に応じて**Reject Dominant Motion Outliers While Tracking**を確認します。
4. **Stabilization Strength**を調整して揺れの減り方を見ます。
5. 意図した見回しまで止まる場合は、**Smoothing**をSmooth側へ調整します。
6. 地平線が傾いていれば**Offset RotationのZ**を使い、ショットの開始・中間・終端を再生して確認します。

これは21.1 Manualに記載された接続とControlsを組み合わせた**実施手順の例**です。今回の実機レンダリング結果ではありません。

## 運用例：歩き撮りのパンを残す

街を歩きながら360°カメラで撮影し、曲がり角では意図して向きを変えた素材を想定します。歩行で発生する細かい揺れは減らしたい一方、角を曲がるパンまで固定すると不自然になります。

まず背景の建物を目印に追跡します。Stabilization Strengthを上げて揺れが減るか確認し、**SmoothingをSmooth側へ動かして大きなパンを残す**方向へ調整します。地平線が斜めに見えるなら最後にOffset RotationのZを調整し、曲がり角を通して見え方を確認します。

ここで補正するのは「映像内の人が移動すること」ではなく、**周囲の景色に対するカメラの向きの揺れ**です。

## 挙動と注意点

- **球面入力が前提**：単なる平面動画の手ぶれ補正とは区別します。
- **目印の少ない映像には限界がある**：無地の壁や暗い空などでは、確かな特徴点を追跡できない場合があります。
- **動く被写体を追わない**：人物や車の移動とカメラの回転は別の現象です。外れ値の除外設定を確認します。
- **基準フレームに注意**：最初に追跡したフレームが安定化の基準です。開始位置を変更したら、補正後の向きも再確認します。
- **StrengthとSmoothingは別**：強さだけで意図したパンの保持を完全に調整できるとは限りません。
- **納品形式への適合は別確認**：VR180やCube形式などの入力互換性がManualにあっても、外部プレーヤーの表示・継ぎ目処理・出力形式を保証するものではありません。
- **左右眼の位置ずれを直す処理ではない**：立体視の左右画像の整列・視差解析は[Stereo 3Dノード](../stereo/index.md)を参照してください。

## 似たNode・関連Node

- **[PanoMap](./panomap.md)**：投影形式の変換をしたいときの候補。Spherical Stabilizerは**時間方向の回転の揺れ**を扱います。
- **[Lat Long Patcher](./latlong-patcher.md)**：パノラマの一部を補修する場合の候補。映像全体の揺れ解析とは目的が異なります。
- **[Spherical Camera](./spherical-camera.md)**：3Dシーンを球面・パノラマでレンダリングするカメラ。**既存の360°動画を安定化するImage処理Nodeではありません**。
- **[Immersive / 360°ノード](./index.md)**：この分野のNodeの選び方。

## バージョンと検証状況

**出典：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 122「VR Nodes」、Spherical Stabilizer（pp.2955–2957）、共通Settings（pp.2958–2959）。** Studio限定、Image入力1系統と対応形式、追跡方法、Reject Dominant Motion Outliers While Trackingの初期状態、Track／Append／Stabilization Strength／Smoothing／Offset Rotationと回転順を本文で確認しています。

**資料上の不整合**：Track Forward from Current TimeとTrack Forward from Start Frameについて、21.1 Manualのボタン名と開始位置の説明が一致しないように読めます。実機未確認の開始位置を断定しません。

**verification: partial**：DaVinci Resolve／Fusion 21.1実機での解析結果、各投影形式の出力、内部REGID、端子内部名、順方向の追跡開始位置、GPU動作、外部VRプレーヤーでの表示は未検証です。
