---
title: Surface Trackerでシャツのロゴを追従させる
description: 変形する衣服をメッシュで追い、透明ロゴをしわと動きに合わせて貼り付ける手順。
doc_type: recipe
verification: partial
aliases: [surface track shirt logo, cloth logo tracking]
concepts: [tracking, image-data, mask-data, mesh-warp]
nodes: [Surface Tracker, MediaIn, Polygon, Merge]
tasks: [surface-track, texture-attach]
prerequisites: [image-data, mask-data]
level: intermediate
product_scope: fusion
updated: "2026-10-21"
---

# Surface Trackerでシャツのロゴを追従させる

## できあがるもの

人物が動く映像のシャツに、透明な背景のロゴを重ねます。胸の布が折れたり伸びたりしても、ロゴがシャツの表面に印刷されているように変形する合成を目指します。

ここで使うのは、**変形する面の動きを追うSurface Tracker**です。看板のように一枚の平面として扱える対象には[Planar Trackerを使うレシピ](./planar-track-graphic)の方が簡単です。Surface Trackerは布の3Dモデルを生成しません。映像の模様を手掛かりに、画像を変形するためのメッシュを追跡します。

## 用意するものと接続

- シャツに模様やしわが見え、極端に隠れる区間が少ない動画
- 透明背景にロゴを置いたPNGなどの画像
- Surface Tracker（追跡、変形、合成を一つのノードで担当）
- 必要な場合だけ、手前を横切る腕などを除外するPolygon等のマスク

~~~text
シャツの映像 ─────────→ Surface Tracker：Input（黄）
透明ロゴ画像 ─────────→ Surface Tracker：Overlay（緑）
腕の追跡除外マスク ──→ Surface Tracker：Occlusion Mask（ピンク・任意）
                               │
                               └─ 出力（合成済みの2D Image）→ MediaOut
~~~

黄のInputは**追跡する映像と合成先**を兼ね、緑のOverlayは**貼り付ける画像**です。ロゴを別のMergeへ接続するだけでは、布のしわに合わせた変形は生まれません。通常はResultの`Warp Input 2 Onto 1`を選ぶと、Surface Trackerがロゴを変形して元映像へ合成します。

青のEffect Mask入力は、ノードで処理した**結果の適用範囲**を制限します。一方、ピンクのOcclusion Mask入力は、白い領域を**追跡計算から除外**します。二つの目的は異なります。[マスクの基礎](../../learn/02-data/mask)も参照してください。

## 手順

### 1. 基準となるフレームを決める

シャツの胸がなるべくカメラに正対し、ロゴを貼る部分が大きく見えるフレームへ移動します。このフレームで追跡領域とメッシュを整えると、他のフレームへの変形を確認しやすくなります。

Surface Trackerの`Bounds`タブで、シャツの**同じ布面の内側**を3点以上の多角形で囲みます。輪郭の外の背景、腕、首などを含めると、布と異なる動きが解析に混ざります。複数のBoundsを使う場合も、一つの同じ面だけを対象にします。

シャツの柄の一部を避けたい場合は`+ Hole`で追跡領域から除外できます。ただしBoundsやHoleは前景を切り抜くための完成マスクではありません。

### 2. Meshの点を配置する

`Mesh`タブの`Point Locations`をまず`Automatic`にし、胸や折れ目など、動きを識別できる模様の上に点が分布しているか確認します。点が偏ると、シャツ全体が一枚板のように動いたり、逆にメッシュが不規則に引っ張られたりします。

必要なら`Point Number Limit`と`Minimum Point Spacing`を調整し、折れ目を追いたい場所の点は手動で追加・移動します。**無地の部分に点を大量に足しても、追跡できる画像上の特徴は増えません。** `Uniform`は格子状の点を配置する別方式なので、細部が多くAutomaticが合わない場合に比較します。

元映像が暗すぎる、明るすぎる、またはLog素材で模様が見えにくい場合、Surface Trackerの前段で一時的に明暗・コントラストを調整してから追跡し、解析後にその補助処理を無効にする方法があります。

### 3. 前後方向にTrackする

`Track`タブの方向ボタンで、基準フレームから必要な範囲を前後へ追跡します。Viewer上でメッシュの点が**同じしわや柄を追い続けているか**を、冒頭・中盤・終盤で確認します。

点がシャツから外れたら、失敗が始まるフレームで点を元の場所へ戻し、そこから追跡を続けます。素早い動きで点を見失う場合は`Motion Range`を広げます。しわに十分追従しない場合は`Mesh Rigidity`を下げ、点がばらばらに動く場合は上げて比較します。調整中は`Quality: Faster`、設定が決まってから`Better`を検討します。

追跡後もメッシュ点の位置は修正できますが、点を追加・削除するには追跡をリセットして再追跡する必要があります。

### 4. ロゴを貼り付ける

`Result`タブで`Output: Warp Input 2 Onto 1`を選びます。これは緑のOverlayを追跡メッシュに合わせて変形し、黄のInputの映像に重ねる方式です。

`Overlay Placement`の`Set to Current`で初期配置の基準フレームを決め、そのフレームで`Positioning`を使ってロゴの位置・大きさ・向きを合わせます。`Interactive Canvas`では画面上のグリッドを、`Interactive Pins`では最大4点のピンを使って初期配置を調整できます。

静止ロゴなら`Overlay/Alpha Source: First Frame`を出発点にします。動画を貼る場合は`Each Frame`を選び、毎フレームのOverlay画像を変形します。`Reference Frame`は、指定した基準フレームを起点にする方式です。どのフレームのOverlayを使うかと、ロゴをどこへ置くかは別の設定です。

仕上げに`Contract/Expand`で縁を調整し、`Softness`で境界をなじませ、必要なら`Motion Blur`を加えます。`Composite Type`と`Opacity`は見え方の調整に使います。Contract/Expandで外へ広げた部分は**メッシュによって追跡された領域ではない**ため、広げすぎないようにします。

### 5. 映像を確認する

ロゴを貼った状態で、布が折れる瞬間、腕が横切る瞬間、人物がカメラへ近づく瞬間を再生します。ロゴが元の胸の表面に付いているかを確認し、必要ならTrackの修正へ戻ります。**ロゴの見え方を先に手直ししても、追跡点が別の物体へ移っている問題は直りません。**

## ロゴを別のノードで合成したい場合

Resultの`Warp Input 2 Onto Blank`は、追跡した動きでOverlayを変形し、アルファ付きの画像として出力します。出力を別のMergeのForegroundへ接続し、元映像をBackgroundへ接続すれば、合成の順番や色調整を後段で管理できます。

~~~text
シャツ映像 → Surface Tracker（黄）─ Warp Input 2 Onto Blank ─→ Merge（Foreground）
透明ロゴ ─→ Surface Tracker（緑）                             ↑
シャツ映像 ────────────────────────────────────────────────→ Merge（Background）→ MediaOut
~~~

ロゴの手前に腕が来る場合、Occlusion Maskは**腕の追跡を除外**するだけで、腕をロゴの手前に合成し直す機能ではありません。人物の前後関係を作るには、腕を切り抜くマスクなどを別に用意し、後段の合成で処理します。

## うまくいかないとき

| 症状 | 最初に見る場所 | 対処の方向 |
| --- | --- | --- |
| ロゴが胸から滑る | Trackのメッシュ | 点が同じ布の模様を追っているか確認し、失敗フレームから追い直す。 |
| ロゴが硬く見える | Meshの分布、Mesh Rigidity | 折れ目に点があるかを見直し、Rigidityを下げて比較する。点の追加後は再追跡する。 |
| ロゴが激しく歪む | Bounds、Occlusion Mask、Mesh Rigidity | 背景や腕を含めていないか確認し、必要なら追跡除外と硬さを調整する。 |
| ロゴが静止画のまま動かない | 追跡済み区間、ResultのOutput | 対象区間の追跡データと`Warp Input 2 Onto 1`の選択を確認する。 |
| 動画Overlayが最初の画で止まる | Overlay/Alpha Source | `Each Frame`へ切り替える。 |
| 腕がロゴの後ろへ回る | 最終合成 | Occlusion Maskだけで前後関係は作れない。腕を前景として別途合成する。 |
| 特定フレームで追跡が飛ぶ | 追跡済み区間、元クリップとタイムラインのfps | 追跡データの欠落・補間・リタイミングを確認する。 |

## 関連資料

- [Surface Tracker](../../nodes/tracking/surface-tracker) — 入出力と各タブ・出力方式の仕様
- [Trackingノードの選び方](../../nodes/tracking/index) — Point / Planar / Surface / Cameraの違い
- [平面追跡で看板にロゴを貼る](./planar-track-graphic) — 変形しない面ならこちらを選ぶ
- [Maskの基礎](../../learn/02-data/mask) — 追跡除外と合成のためのマスク
- [トラッキング結果がずれる](../../troubleshooting/tracking/track-drifts) — 追跡と適用先の切り分け

## バージョンと確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 119「Tracking Nodes」pp.2830–2838。4つの入力、Bounds / Mesh / Track / Result、Outputモード、Overlay Placement、Overlay/Alpha Source、マスク用途、追跡データの扱いを確認しています。

このレシピは、マニュアルに記載された機能を組み合わせた再現手順です。DaVinci Resolve / Fusion 21.1実機での追跡精度、個別UIの表示位置、Free / Studioの利用差は未検証なので`verification: partial`としています。
