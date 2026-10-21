---
title: Camera Tracker
description: 実写映像の特徴点から撮影カメラの3D移動を推定し、CGを実景に固定するためのCamera 3DとPoint Cloudを作るノード。
doc_type: node
term_id: camera-tracker
term_short: Camera Trackerは、実写の特徴点を追って3Dカメラの動きと点群を復元するノード。
verification: partial
aliases: [Camera Tracker, CTra]
concepts: [tracking-data, classic-3d]
nodes: [Camera Tracker]
node_family: tracking
controls: [Auto Track, Preview AutoTrack Locations, Detection Threshold, Minimum Feature Separation, Track Channel, Track Range, Bidirectional Tracking, Gutter Size, New Track Defaults, Close Tracks When Track Error Exceeds, Solve Weight, Focal Length, Film Gate, Resolution Gate Fit, Average Solve Error, Accept Solve Error, Clean Tracks by Filter, Auto Select Seed Frames, Refine Focal Length, Enable Lens Parameters, 3D Scene Transform, Export, Update Previous Export]
inputs: [image, mask]
outputs: [image, 3d-scene]
tasks: [track-motion, camera-track, solve-camera, 3d-match-move]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-21"
---

# Camera Tracker

Camera Trackerは、撮影された映像の中で位置が変わらない壁や床の模様などをフレーム間で追跡し、**実写カメラが3D空間をどう動いたか**を推定するノードです。さらに、追跡点の一部を3D空間上の点群（Point Cloud）として復元します。たとえば歩き撮りした廊下の映像にCGの立体看板を置き、カメラが移動しても床の同じ位置に立っているように見せられます。

単に画面上の位置を追う[Tracker](./tracker)や、看板などの平面を追う[Planar Tracker](./planar-tracker)とは異なり、**カメラと奥行きのある空間との関係**を求めるときに選びます。

## 役割と向いている映像

撮影カメラが移動すると、手前の物体と遠くの物体は画面内で異なる量だけ動いて見えます。この視差（パララックス）と多数の追跡点を手がかりに、Camera Trackerはカメラの移動経路と各点のおおよその3D位置を計算します。この計算を`Solve`（ソルブ）と呼びます。

十分な視差がない固定カメラの映像や、三脚上でカメラの向きだけを変えたパンでは、距離の違いを推定できず、安定した3D復元が難しくなります。反射面、動く人物、風で揺れる植物も追跡を誤らせる原因です。これらの領域は解析から除外するか、2Dトラッキングなど別の方法を検討します。

Camera Trackerが復元するのは映像内のあらゆる物体の完全な3D形状ではありません。主な成果は**仮想カメラの動きと、追跡できた地点の点群**です。床の向き、作業用の原点、シーンの尺度は後から指定します。

## 入力と出力

### Background（オレンジ入力）

カメラの動きを解析したい2D映像を接続します。`MediaIn → Camera Tracker`が基本です。静止画一枚だけではフレーム間の視差を使ったカメラ移動の復元はできません。

### Occlusion Mask（白入力・任意）

追跡の解析に含めたくない人物や車などを、Polygon等のマスクで指定します。廊下を横切る人物を囲めば、その人物自身の動きをカメラ移動として誤認するのを避けるために使えます。この入力は**追跡する特徴点を選別するもの**で、最終合成でCGの手前に人物を表示するマスクとは別です。

**21.1マニュアル内で白黒の説明が矛盾しています。** Chapter 119のCamera Tracker入力説明（p.2805）は「**白い領域を追跡から除外**」と記載しています。一方、Chapter 85の操作説明（p.1879）は「**白を解析対象にし、黒を除外**」と説明し、同じ入力を`Track Mask`と呼んでいます。このページはNode個別の入力説明を暫定的な基準としますが、**どちらが21.1の実際の挙動かは未検証**です。

マスクをつないだら`Preview AutoTrack Locations`で接続前後を比較し、除外したい人物上に追跡候補が残っていないか確認します。期待と逆ならマスクの白黒を反転してもう一度比較し、不要な追跡点が減ったことを確かめてから`Auto Track`を実行します。黒白を資料の文言だけで決め打ちしないでください。

### 2D出力

追跡元の映像にトラッキング点や軌跡を重ねて確認するための出力です。TrackからSolveまでの作業では、この2D表示を主に使います。

### 3D出力

Solve後のカメラ経路とPoint Cloudを含む3Dシーンの出力です。`Camera Tracker → Merge 3D`などで3D Viewerに表示し、点群と実写の位置関係を確認できます。**3Dシーンはそのまま最終2D画像ではない**ため、合成結果を画像として出すときは[Renderer 3D](../3d/renderer-3d)が必要です。

出力は2Dと3Dの2系統です。Inspectorで作成・編集する追跡データと、ノード端子から流れる画像／3Dシーンを混同しないでください。

## 最小構成と作業順

```text
MediaIn ──→ Camera Tracker
               ├─ 2D出力：映像と追跡点を確認
               └─ 3D出力 → Merge 3D：Solve後の点群を確認

Track → Camera設定 → Solve → 3D Scene Transform → Export
```

まず`Track`で画像内の特徴点を追います。次に`Camera`で焦点距離や撮像面の情報を与え、`Solve`で3Dカメラを推定します。結果を検証し、`Export`内の`3D Scene Transform`で床面と原点を整えた後、`Export`で独立した3Dノードへ展開します。`Options`は主にViewerの点や軌跡の表示方法を調整するタブです。

## Track：どこを追跡するか

`Auto Track`は、コントラストのある特徴を自動検出してフレーム間で追います。最初に`Preview AutoTrack Locations`を有効にし、点が画面の一部分だけでなく、手前・奥・左右へ分布しているか確認します。

| 設定 | 何が変わるか |
| --- | --- |
| `Detection Threshold` | 特徴点として検出する画像パターンの条件。検出点が不足したり、模様のない場所に偏ったりするときに調整します。 |
| `Minimum Feature Separation` | 自動生成する点同士の間隔。小さくすると点数が増えますが、追跡・Solveに必要な時間も増えやすくなります。 |
| `Track Channel` | Red / Green / Blue / Luminanceから解析に使うチャンネルを選択。模様や境界が最も見分けやすいものを選びます。 |
| `Track Range` | Global（タイムライン全体）、Render（レンダー範囲）、Valid（元素材の有効範囲）、Custom（指定範囲）のどこを追うかを選択します。 |
| `Bidirectional Tracking` | 最初に前方向へ追った点を、後ろ方向へも延長します。後ろ向き処理では新しい点を増やさず、既存の追跡を長くします。 |
| `Gutter Size` | 画像端に近づいた追跡点を終了させる余白。値は追跡パターンの大きさに対する割合で、既定は100%です。パターンサイズが0.04なら余白も0.04になります。 |

点数を増やすこと自体は目的ではありません。**長く安定して追える、実際の景色に固定された点**を広く確保する方が重要です。追跡途中で被写体に隠れる点や、反射の動きを追った点は見直します。

`Reset`は追跡データとSolve結果の**両方**を削除します。Solve結果だけをやり直したい場合は、Solveタブの`Delete`を使ってください。

### 自動追跡点の初期設定（New Track Defaults）

`New Track Defaults`では、新しく作る追跡点の追跡方式と終了条件を設定します。Camera TrackerはまずOptical Flowで特徴点を追い、Fusion TrackerまたはPlanar Trackerを使って位置をさらに精密化します。Planar方式では追跡パターンの変形モデルを選べます。標準の`TRS`（移動・回転・拡大縮小）を基本とし、`Affine`や`Perspective`は、変形を捉えるのに十分な大きさのパターンがある場合に検討します。モデルを複雑にすれば、細かい模様でも必ず追えるというわけではありません。

`Close Tracks When Track Error Exceeds`は、参照フレームのパターンと現在フレームのパターンの不一致が閾値を超えたとき、その追跡点を終了させます。閾値を高くすると追跡を長く続けられる一方、誤った位置まで追ってしまう可能性も高くなります。たとえば床の目地が途中から別の線へ乗り移る場合は、単に閾値を上げるのではなく、その点がずれ始めるフレームとパターンの選び方を確認します。`Solve Weight`は新規追跡点がカメラのSolveへ与える重みで、通常は均等のまま使用します。

## Camera：撮影カメラの条件を与える

このタブの値はSolveの初期条件になります。分かっている撮影情報を使い、不明な値を正確な実測値として扱わないことが重要です。

- **`Focal Length`**：撮影レンズの焦点距離。一定の焦点距離で撮った映像について指定します。
- **`Film Gate` / `Aperture Width` / `Aperture Height`**：撮像面の大きさ。プリセット選択、または幅と高さを**インチ**で指定します。
- **`Resolution Gate Fit`**：映像のアスペクト比を撮像面へどう対応させるかを選びます。Width / Heightのほか、Inside / Outside / Stretchedがあります。
- **`Center Point`**：光軸の中心位置。標準位置は`(0.5, 0.5)`です。
- **`Use Source Pixel Aspect`**：素材側のピクセル縦横比を使用。無効にするとPixel X / Yを個別設定できます。
- **`Auto Camera Planes`**：Solveされた点群を収めるようカメラの表示用planeを自動調整します。極端に遠くへ飛んだ誤った点のせいで3D表示が扱いにくくなるときは、点を整理するか自動調整を見直します。

焦点距離と撮像面の情報は組み合わせて働きます。レンズの焦点距離だけ正しくても、誤ったFilm Gateを指定すると実際の画角と一致しなくなるため注意してください。

## Solve：結果を評価して修正する

`Solve`は、Trackで得た2D点とCameraの条件から、カメラ経路と3Dの点群を計算します。最初のSolveで必ず完成するとは限りません。映像と点群を見比べ、問題のある追跡点を少しずつ除外して再計算するのが基本です。

### Average Solve ErrorとAccept Solve Error

**`Average Solve Error`**は、追跡した2D点と、推定した3D点を仮想カメラで画像へ戻した位置とのずれを、ピクセル単位で要約したものです。21.1マニュアルでは、フルHDを想定した目安として1ピクセル未満が良好、0.6〜0.8ピクセル程度が非常に良好とされています。ただし、これは**すべての解像度・ショットで成功を保証する合格値ではありません**。高解像度素材ではより小さい誤差が求められますし、局所的な点のずれもViewerで確認する必要があります。

**`Accept Solve Error`**は、単に結果へ合否ラベルを付ける設定ではありません。Solve誤差がこの値を超えると、solverは焦点距離を変えながら条件を満たす解を探そうとし、見つからなければConsoleへ失敗を表示します。誤差を小さく見せるために閾値だけ変更するのではなく、焦点距離や追跡点の品質を見直します。

### 追跡点の整理

`Clean Tracks by Filter`は、Track Filteringで指定した条件に合う追跡点を選択します。`Minimum Track Length`は短すぎる追跡、`Maximum Track Error`はパターン追跡の不一致、`Maximum Solve Error`は3Dから再投影したときのずれで判定します。**`Auto Delete Tracks by Filter`を有効にしていると選択と同時に削除される**ので、内容を見てから削除したい場合は無効にしておきます。

`Clean Foreground Tracks`は、動く前景に付いたと判断された追跡点を`Foreground Threshold`に基づいて選択します。こちらにも`Auto Delete Foreground Tracks`があります。

誤りが後半だけに現れた長い追跡は、丸ごと捨てる前に`Trim Next`などで悪くなった区間だけ切り落とせます。追跡点の`Solve Weight`を0にすると、その点をカメラのSolve計算へ影響させず、3Dの位置確認用の点として残せます。複数の点を一度に大量削除すると結果が悪化することもあるため、少数ずつ調整して再Solveします。

### Seed Framesとレンズ補正

`Auto Select Seed Frames`は、Solve開始時の基準となる2フレームを自動選択します。良い組み合わせには、**共通して追える点が多いこと**と、**両フレーム間に十分な視差があること**の両方が必要です。

`Refine Focal Length`は焦点距離をSolve中に調整できるようにします。実測値が信頼できる場合と、おおよその値しか分からない場合とで、固定するか調整を許すかを判断します。`Enable Lens Parameters`は、撮影映像のレンズ歪みをモデル化するための設定です。既に歪みを補正した素材や歪みが小さいレンズでは、不要な補正を重ねないようにします。歪みモデルの詳細は元映像のレンズ特性と合わせて判断してください。

## Export：3Dシーンへ取り出す

Solve直後の3Dシーンは、床がどこにあるか、現実の1メートルが仮想空間のどれほどかを自動確定しているわけではありません。先に`3D Scene Transform`でシーンを扱いやすく整えます。**この調整は求めたカメラの相対的な動きそのものを変更する処理ではありません。**

1. Exportタブの`3D Scene Transform`を`Unaligned`へ切り替えます。
2. 床面にあると判断できる点を、できるだけ広い範囲から複数選びます。`Orientation`の`Selection Is`が選択面の向きに合っていることを確認し、`Set from Selection`を押します。壁面を基準にするときはその向きに対応する設定を選びます。
3. `Origin`では、CGを配置する基準にしたい位置の、誤差が小さい点を選び`Set from Selection`を押します。`Scale`は実寸の参照物などに合わせて調整します。
4. `Aligned`へ戻して設定を固定し、`Export`を実行します。

標準のExport構成には、アニメーション付きの[Camera 3D](../3d/camera-3d)、[Point Cloud 3D](../3d/point-cloud-3d)、床面用の[Shape 3D](../3d/shape-3d)、[Merge 3D](../3d/merge-3d)、Renderer 3Dが含まれます。`Export Options`ではCamera、Point Cloud、Ground Plane、Renderer、Lens Distortion、カメラのImage Planeなど、書き出す要素を選択できます。

Export後にSolveや床面の指定を直した場合は、`Update Previous Export`で以前作成したノードへ結果を反映できます。`Automatically Update Previous Export After Solves`を有効にしている場合を除き、元のCamera Trackerを変更しただけでは以前のExportが更新されたと考えないでください。

大量の2D追跡情報を持つCamera Trackerを残すより、Export後の独立した3Dノードの方が軽く扱える場合があります。ただし、**再Solveする可能性がある間は元のTrackerを保持**しておくと安全です。

## 運用例：歩き撮りの床へCGを配置する

廊下を歩きながら撮影した映像に、床に立つCGの案内板を追加する例です。

1. `MediaIn`をCamera TrackerのBackgroundへ接続します。画面を横切る人物がいる場合、その人物を追跡から除外するマスクをOcclusion Maskへ接続します。
2. `Preview AutoTrack Locations`で床の模様、壁の角、遠景の固定点などに追跡点が分布するよう調整し、`Auto Track`します。
3. 撮影時の焦点距離・センサー情報を分かる範囲で入力し、`Solve`します。Viewerを移動して追跡点と再投影位置のずれを確認し、不良点を整理して再Solveします。
4. 床の点群を選んでOrientation、看板を立てたい場所の点でOriginを設定し、`Aligned`へ戻して`Export`します。
5. Exportされた`Merge 3D`へ試しにCube 3Dなどを追加します。Point Cloudと床面を手がかりに、その立体を案内板の位置へ動かします。
6. `Renderer 3D`で2D画像に変換し、ショットの前半・中盤・後半を確認します。立体が地面から滑って見える場合は位置合わせだけでなく、追跡点・Solve・原点と床面の設定を順に見直します。

Renderer 3Dの結果を元映像へ重ねる場合は、Export設定のカメラImage Planeなどによって**背景映像がすでに結果へ含まれているか**を確認してください。含まれていないときは元映像を背景にしてMergeで重ねます。含まれている映像を再度合成すると二重表示になるため、実際のViewer結果を基準に接続を決めます。

## うまくいかないとき

| 状況 | 確認すること |
| --- | --- |
| カメラの軌跡が大きく乱れる | 動く人物・車・反射を追跡していないか。Occlusion MaskとClean Foreground Tracksを確認します。 |
| Solve Errorが高い | 短い追跡や途中からずれた点、焦点距離・Film Gate、レンズ歪みの扱いを順に見直します。 |
| エラーは低いのにCGが滑る | 平均値だけで判断せず、CG付近の追跡点と再投影位置を各フレームで確認します。 |
| 点群の向きや尺度が使いにくい | 3D Scene TransformのOrientation / Origin / Scaleを確認し、必要ならUpdate Previous Exportを実行します。 |
| 固定ショットや三脚パンで奥行きを復元できない | 視差が足りない可能性があります。3D Solveを繰り返すより、Planar Trackerなどの2D手法を検討します。 |

## 関連する考え方とノード

- [Classic 3Dの基本](../../learn/02-data/classic-3d) — 3Dシーンと画像の違い。
- [データ領域を辿って診断する](../../learn/07-debugging/trace-data-domain) — 2Dと3Dの接続を確認するとき。
- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track) — 解析と配置を分離する考え方。
- [Tracker](./tracker) — 特徴点の2D位置を利用。
- [Planar Tracker](./planar-tracker) — 平面への画像貼り付けや安定化。
- [Camera 3D](../3d/camera-3d) / [Point Cloud 3D](../3d/point-cloud-3d) — Export後の主要な受け皿。

## バージョンと確認範囲

DaVinci Resolve **21.1 Reference Manual（September 2026）** のChapter 119 pp.2804–2819で入力、Track / New Track Defaults / Camera / Solve / Export / Options、Solve誤差、追跡点の整理、3D Scene Transform、Export Optionsを確認しました。Fusion Fundamentals Chapter 85 pp.1872–1889で**2D・3Dの2出力**と、3Dシーンへ立体を配置する手順を確認しました。

記事内のInspector名と説明はこれらの一次資料に基づきます。運用例は記載された動作を組み合わせた手順であり、実機での成功を保証する検証記録ではありません。ショットごとのSolve精度、実行速度、製品Edition差は未検証のため、`verification: partial`としています。
