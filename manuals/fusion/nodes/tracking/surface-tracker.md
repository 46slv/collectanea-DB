---
title: Surface Tracker
description: 変形する布や皮膚をメッシュで追跡し、ロゴ合成、動く素材の貼り付け、安定化しての修正を行う方法。
doc_type: node
term_id: surface-tracker
verification: partial
aliases: [Surface Tracker, SFt]
concepts: [tracking, image-data, mask-data, mesh-warp]
nodes: [Surface Tracker]
node_family: tracking
controls: [Bounds, Mesh, Track, Result, Motion Range, Mesh Rigidity, Quality, Output, Overlay/Alpha Source, Contract/Expand, Softness, Motion Blur, Positioning, Composite Type, Opacity]
inputs: [image, image, mask, mask]
outputs: [image]
tasks: [surface-track, texture-attach, stabilize-surface]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-20"
---

# Surface Tracker

Surface Trackerは、シャツのしわや肌の伸び縮みなど、**形を変えながら動く面**に画像を追従させるFusionノードです。映像中の表面に追跡用のメッシュ（複数の点を結んだ網目）を配置し、その点の動きをフレームごとに解析します。ロゴ、模様、映像、修正処理を、追跡した面の曲がりや伸縮に合わせて変形できます。

[Planar Tracker](./planar-tracker)は看板やディスプレイのように一枚の平面として扱える対象に適しています。Surface Trackerは、同じシャツの上でも胸と袖で動き方が違う、といった**面の内部の変形**を追うためのものです。メッシュを追跡する2D画像処理であり、布や人物の3Dモデルそのものを生成するノードではありません。

## 入力と出力

| 接続 | データ | 何を渡すか |
| --- | --- | --- |
| **Input（黄）** | 2D Image | 追跡する布・肌などが映った元映像。合成先にもなる。 |
| **Overlay（緑）** | 2D Image | 面に貼る静止ロゴ、動画、別のノードで作った画像。 |
| **Occlusion Mask（ピンク）** | Mask | **白い部分を追跡計算から除外**する。手前を横切る腕などが表面の特徴と誤認されないようにする。 |
| **Effect Mask（青・任意）** | Mask | ノードの**処理後の結果**が適用される範囲を制限する。 |
| **出力** | 2D Image | Resultで選んだ合成画像、変形したOverlay、アルファ画像、安定化した画像など。 |

~~~text
シャツの映像 ───→ Input（黄）  ┐
透明ロゴ ──────→ Overlay（緑）├ Surface Tracker → MediaOut
腕の除外マスク ─→ Occlusion（ピンク）
~~~

Occlusion Maskは「どの画素を追跡の手掛かりにしないか」、Effect Maskは「処理済み画像のどこを使うか」を決めます。同じマスクを接続しても意味が異なります。[Maskの基礎](../../learn/02-data/mask)も参照してください。

## 作業順序：Bounds → Mesh → Track → Result

### 1. Bounds：追う面を指定する

まず対象が**できるだけ大きく、カメラに正対して、折れ曲がりが少ないフレーム**を選びます。ここで設定する形が追跡の基準になります。

Boundsで対象の表面を最低3点の多角形で囲みます。点はシャツや肌の**表面上**に置き、輪郭の外の背景や別の物体を含めないようにします。

- **+ Bound**：同じ表面内に別の追跡領域を追加します。複数のBoundaryは一つの形として結合されます。
- **+ Hole**：領域の内部から追跡に使わない部分を除きます。顔を追う場合、瞬きや口の動きが大きい目・口周辺を避ける用途があります。
- **Boundary**：編集対象の領域・穴を選びます。不正な交差や点数不足があるとエラーが表示されます。
- **Delete / Clear All**：領域・穴を削除します。特にDeleteはマニュアル上、Undoできない操作として説明されています。

複数のBoundは**一つの同じ面**を扱うための機能です。シャツと背景の壁など、異なる面を一つのSurface Trackerにまとめないでください。別々のノードで追跡します。Boundsは物体の輪郭を切り抜くロトスコープの代用品でもありません。

### 2. Mesh：しわや曲がりに沿う追跡点を作る

Meshでは、Bounds内に変形を追うための点を配置します。折れ目・関節など、後で曲がる場所に点があるか確認します。点を手動で移動・追加でき、不要な点を取り除くこともできます。

**Point Locations**には次の方式があります。

| 方式 | 使い分け |
| --- | --- |
| **Automatic** | 追跡に使いやすい画像の特徴を探して点を配置する。通常はこちらから始める。 |
| **Uniform** | 一定間隔の格子を作り、内部の形状モデルで変形させる。細部が多い面などでAutomaticと比較する。 |

Automaticの**Point Number Limit**は最大点数、**Minimum Point Spacing**は点同士の最小間隔を設定します。点数はOverlayの曲がり方には影響しますが、マニュアルでは追跡速度を直接決める値ではないと説明されています。Uniformでは**Horizontal Spacing / Vertical Spacing**を調整します。

点は多ければよいわけではありません。無地で手掛かりが乏しい場所に大量に配置しても精度が上がらず、悪化する場合があります。**Regenerate Mesh**は現在の設定でメッシュを再生成し、手動調整を破棄します。

暗すぎる、明るすぎる、Log画像でコントラストが低いといった理由で点が見つからない場合は、Surface Trackerの**前段に一時的なBrightness Contrast処理**を置いて解析し、Trackが終わってから無効にする方法が21.1マニュアルで案内されています。

### 3. Track：フレーム間の変形を解析する

Trackタブの方向ボタンで前後へ解析します。前方向・後方向の連続追跡だけでなく、1フレームずつ進む操作や一時停止もできます。

| 項目 | 調整する内容 |
| --- | --- |
| **Motion Range** | 対応点を探す移動範囲。動きが速く、点を見失う場合に広げる。 |
| **Mesh Rigidity** | メッシュの硬さ。下げると柔軟に変形し、上げると内部の変形が抑えられる。 |
| **Quality** | 計算品質。調整中はFaster、設定を固めた最終追跡ではBetterを検討する。 |
| **Interaction Overlays** | Show / Hide on Drag / HideでViewer上の点の表示を制御する。 |

追跡点が外れたら、問題が始まるフレームで点を手動で正しい位置に戻し、そこから追跡を続けられます。手動修正はそのフレームの追跡データを変更し、前後の未追跡フレームの補間にも反映されます。既に記録された隣接フレームの追跡値を一括して書き換える操作ではありません。

**Trimming**には現在フレームの前・当該・後の追跡データを消す操作と、**Track From Last Known Match**があります。手前を別の物体が横切る数フレームだけ追跡を外し、見えるようになったフレームで再びつなぐ際に使えます。

**BoundsやMeshの配置を変えると既存の追跡データはリセット**されます。追跡後に点を増減する場合も再追跡が必要です。全タブに表示される**Tracked Range**で、データがあるフレーム範囲を確認してください。

またSurface Trackerは元クリップの各フレームに追跡データを作ります。元クリップとタイムラインのフレームレートが違う場合、追跡が飛んで見えることがあります。21.1マニュアルでは、必要に応じてEditページのRender In Placeでリタイミング結果をフレームとして確定させる方法が挙げられています。採用する場合は元素材との対応を確認してください。

### 4. Result：追跡をどう使うか選ぶ

Trackが終わったらResultタブで出力を決めます。**Output**は6種類です。

| Output | 結果と使う場面 |
| --- | --- |
| **Warp Input 2 Onto 1** | 緑のOverlayをメッシュに沿って変形し、黄の元映像の上に合成する。シャツへのロゴ貼り付けに使う。 |
| **Warp Input 2 Onto Blank** | Overlayだけを変形し、アルファを保持した画像として出す。別のMergeや色処理を挟んで合成したいときに使う。 |
| **Warp Input 1's Alpha** | 追跡結果をEffect Mask入力へ適用する方式。Alphaの用途と接続を確認しながら使う。 |
| **Create Mesh Alpha Mask** | メッシュ外形を追従させたアルファを生成する。ほかの入力画像・アルファは無視される。 |
| **Stabilize-Warp Input 1** | 追跡面を基準フレームの形へ逆変形して止める。動く肌や布の一部を固定した状態で修正する。 |
| **Rewarp Stabilized Clip** | 安定化した画像に施した修正を、追跡した元の動きへ戻して合成する。前段のStabilize-Warpと組み合わせる。 |

「アルファ」とは画像の透明度を表す成分です。**Create Mesh Alpha Mask**は追跡結果からマスクを作る出力であり、**Warp Input 2 Onto Blank**はOverlayの画素とアルファを変形して出す方式です。同じではありません。

### Overlayの配置と合成

**Overlay/Alpha Source**はOverlayやアルファのどのフレームを使うかを決めます。

- **First Frame**：最初のフレームを静止テクスチャーとして使う。
- **Reference Frame**：追跡面の配置を決めた基準フレームを使う。
- **Each Frame**：動画の各フレームを順番に変形する。動くOverlayや安定化した映像をRewarpする場合はこちらを使う。

**Overlay Placement**では、**Set to Current**で基準フレームを決め、**Go To Reference**でそこへ移動できます。最初の貼り付け位置は**Positioning**のSliders（位置・拡大縮小・回転など）、Interactive Canvas（画面上の変形グリッド）、Interactive Pins（最大4点でコーナーや遠近を調整）から設定します。基準フレームでは面が大きく、歪みが少ないことが重要です。

仕上げでは**Contract/Expand**で貼り付けた画像の端を縮小・拡張、**Softness**で境界をぼかし、**Motion Blur**でOverlayに動きのぼけを加えられます。ただしContract/Expandで**拡張された領域は追跡されません**。輪郭を大きく広げるだけで、面の外側の動きまで追えるわけではありません。**Composite Type**で合成方式、**Opacity**でOverlayの不透明度を調整します。

## 制作例

### シャツのロゴを差し替える

1. シャツが映った動画を黄のInput、透明背景のロゴを緑のOverlayへ接続します。
2. 胸ができるだけ正面を向いたフレームを選び、シャツ上にBoundsを描きます。首・腕・背景を含めません。
3. しわや胸の形に沿うようMeshの点を調整します。手掛かりが多い場所からAutomaticで始めます。
4. 前後へTrackし、袖や手が横切る場合はピンクのOcclusion Maskでその領域を解析から除外します。
5. Resultを**Warp Input 2 Onto 1**にし、Reference Frameでロゴの初期位置と大きさを合わせます。
6. 追跡のずれを確認し、Softness、Motion Blur、Composite Type、Opacityを映像に合わせて調整します。

ロゴが大きくなりすぎると、元のシャツ面にない部分まで伸ばして貼ることになります。まず追跡した範囲内で成立する配置にします。

### 肌の小さな傷やほくろを修正する

動く頬の一部を直接フレームごとに修正する代わりに、**動きを止めて修正し、再び動かす**方法です。

~~~text
元映像 ─→ A（Stabilize-Warp）→ Paint ─→ B：Overlay（緑）
   └─────────────────────────→ B：Input（黄）
B（Rewarp Stabilized Clip）→ MediaOut
~~~

Aは元映像を黄のInputへ受け取り、頬を追跡してResultのOutputを**Stabilize-Warp Input 1**にします。安定化した画像をPaintなどへ接続すると、動く頬の一部を基準フレームの位置で修正できます。

Bには**Aを追跡設定・データごと複製したノード**を使い、Outputを**Rewarp Stabilized Clip**に切り替えます。Bの黄の**Inputには元映像を直接分岐して接続**し、緑の**OverlayにはPaint後の画像を接続**します。Bの**Overlay/Alpha SourceはEach Frame**にして、修正した各フレームを元の顔の動きへ戻します。Aの出力だけを直列にBのInputへ入れる構成では、Bが合成先として必要とする元映像を渡せません。Bを新規作成して別々に追跡することも、二つの変形が一致しなくなる原因になります。

### 動く布へ映像を貼る

旗や衣装へ短い映像を貼る場合、元映像を黄のInput、再生する素材を緑のOverlayへ接続します。**Overlay/Alpha SourceをEach Frame**にして、毎フレームの映像が布の変形に従うようにします。合成を後段で調整したい場合は**Warp Input 2 Onto Blank**で透明なOverlay出力を作り、別のMergeへ渡します。静止画を貼る場合のFirst Frameとは使い分けます。

## 追跡がずれる、合成が不自然なとき

| 症状 | 確認すること |
| --- | --- |
| 胸のロゴが袖や背景へ引っ張られる | Boundsが**同じ面だけ**を囲んでいるか。背景、腕、顔の動く部分はHoleやOcclusion Maskで除外する。 |
| 点が少なく追従しない | 過度な暗部・白飛び・低コントラストを確認。一時的に前段のコントラストを調整してMeshを作り直す。 |
| しわに追従せず硬い | Mesh Rigidityを下げる。必要な折れ目にMeshの点があるか、**再追跡前**に見直す。 |
| 点がばらばらに崩れる | Mesh Rigidityを上げる、Motion Rangeを見直す、失敗するフレームで点を手動修正する。 |
| 一部のフレームだけ飛ぶ | Tracked Range、Tracking Dataの欠落、クリップとタイムラインのフレームレート差を確認する。 |
| Overlayの動画が静止する | Overlay/Alpha SourceがFirst FrameではなくEach Frameか確認する。 |
| ロゴの縁が浮く・切れる | Contract/Expand、Softness、Motion Blur、Composite Type、Opacityを見直す。拡張した縁は追跡されない。 |
| 安定化後の修正が戻らない | 二つのSurface Trackerが同じ追跡データを持ち、AがStabilize-Warp、BがRewarpか確認する。 |

## 関連ノード・基礎

- [Trackingノードの選び方](./index.md)：点・平面・柔らかい面・3Dカメラの違い。
- [Planar Tracker](./planar-tracker)：一枚の平面として追える面の追跡。
- [Planar Transform](./planar-transform)：平面の追跡データを別画像やマスクへ適用。
- [Mask](../../learn/02-data/mask)：Occlusion MaskとEffect Maskで扱うデータ。
- [トラッキングがずれる場合](../../troubleshooting/tracking/track-drifts)：追跡と合成のどちらでずれたかを分けて確認する。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、**Chapter 119「Tracking Nodes」、pp.2830–2838**。4入力の色と働き、Bounds・Mesh・Track・Result、6種類のOutput、Overlay/Alpha Source、Overlay Placement、Contract/Expand、Motion Blur、合成設定、フレームレート差による注意を照合しています。 安定化した面の修正と再ワープを組み合わせる際の2入力の接続は、同Manualの**Chapter 168「Resolve FX Transform」、pp.3719–3720**にある元映像・修正後映像を分けた実例とも照合しています（同例はColorページのResolve FX構成）。[Blackmagic Design公式サポート](https://www.blackmagicdesign.com/jp/support/)。

制作例と症状別の判断手順は、確認した機能から組み立てた運用上の例です。Resolve/Fusion 21.1の実機での追跡精度、Inspectorの内部ID、パラメータの厳密な数値範囲、Free / Studioの差は検証していないため、verificationはpartialです。
