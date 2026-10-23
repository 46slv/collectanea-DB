---
title: SpeedWarp
description: DaVinciのニューラルネットワークでフレーム間の動きを解析し、スローモーション用の中間フレームを生成するFusionノード。
doc_type: node
term_id: speedwarp
term_short: "SpeedWarpは、フレーム間の動きをAIで解析し、新しい中間フレームを作りながら映像の再生速度を変えるFusionノード。"
verification: partial
aliases: [SpeedWarp, SPDw]
concepts: [image-data]
nodes: [SpeedWarp]
node_family: time-metadata
controls: [Speed, Delay, Mode]
inputs: [image]
outputs: [image]
tasks: [retime]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# SpeedWarp

SpeedWarpは、映像の前後フレームに写った物体の動きをDaVinciのニューラルネットワークで解析し、存在しない中間フレームを生成するリタイムノードです。速度を落としたときに同じフレームを繰り返すのではなく、動いている人物や物体が途中の位置にある画像を推定します。

たとえば通常速度で撮影した人物の動きを50%にしたい場合、元のフレームだけを2回ずつ表示すると動きが段階的になります。SpeedWarpは隣り合うフレームの間に新しい画像を作り、より連続した動きにすることを狙います。ただし、撮影されていない部分まで必ず正確に復元できるわけではありません。

## 入力と出力

- **Input（オレンジ）**：速度を変更したい2D Imageの連続フレームを受け取ります。
- **Output**：指定した速度と時間オフセットでリタイムした2D Imageを後段へ渡します。

DaVinci Resolve 21.1 Reference ManualのSpeedWarp項目で個別に説明されている入力はInputです。外部のMotion Vectorを入力する端子や、解析結果をVectorとして取り出す端子は、この項目には記載されていません。

基本接続は次のとおりです。

    MediaIn → SpeedWarp → MediaOut

MediaInから映像を接続し、SpeedWarpで速度を決め、MediaOutへ送ります。ほかのFusion処理と組み合わせるときも、SpeedWarpには時間的に連続した画像を渡すことが重要です。

## 何が変わるのか

速度変更では、出力する各フレームが元映像のどの時刻に対応するかを決めます。元映像にぴったり一致する時刻だけでなく、その中間を表示する必要があるときに、SpeedWarpが新しい画像を推定します。

一般的なリタイムには、元フレームを繰り返す方式と、前後のフレームを重ねる方式があります。前者は動きが飛び飛びになり、後者は速く動く輪郭が二重に見える場合があります。SpeedWarpは画像間の動きを解析して中間フレームを構成する点が異なります。

映像の速度を変えるノードであって、撮影時のフレームレート、プロジェクトのフレームレート、MediaInの素材そのものを書き換える機能ではありません。

## Inspectorの主な設定

### Speed

出力の再生速度を倍率で指定します。Manualで説明されている値は次のとおりです。

| 値 | 動作 |
| --- | --- |
| 1.0 | 元の速度のまま再生する。Manual上の初期値 |
| 0.5 | 50%速度。元より長い時間をかけて再生する |
| 2.0 | 200%速度。元より短い時間で再生する |

**Speed = 0.5**では、元の隣接フレーム間に中間画像を作る処理が必要になりやすくなります。一方、**Speed = 2.0**は時間を詰める処理です。中間画像を増やすことが主目的なら、1.0未満の速度を設定して結果を確認します。

速度変更後に出力できる長さは、入力の利用可能なフレーム範囲やFusionコンポジション側の時間範囲にも左右されます。Speedの値だけでクリップやタイムラインの終了位置が自動的に期待どおり延びると考えず、再生範囲を確認してください。

### Delay

出力の開始位置をフレーム単位でずらします。

- **+10.0**：出力を10フレーム前方へオフセットする
- **-10.0**：出力を10フレーム後方へオフセットする

これは21.1 Manualで示されている方向です。Speedが再生速度の倍率を決めるのに対し、Delayは映像の時間位置を調整します。音との同期や別レイヤーとの位置合わせでは、出力を見ながら必要なフレーム数を調整します。

### Mode

補間の処理速度と品質の優先度を選びます。

- **Faster**：処理時間を短くしたい場合のモード。
- **Better**：処理負荷を増やして、より高い補間品質を優先するモード。

21.1 Manualはこの2モードの方向性を示していますが、内部モデルの構造、GPUメモリ量、処理時間の倍率までは記載していません。Betterを選べば、すべての素材の破綻が解消するという意味でもありません。

Inspectorには、このほか多くのFusionノードと共通のTransformタブとSettingsタブがあります。SpeedWarp独自の時間制御は上記のControlsタブで行います。

## 実際の使い方

### 通常撮影の人物を50%スローにする

    MediaIn（連続した人物の映像）
       ↓
    SpeedWarp（Speed 0.5）
       ↓
    MediaOut

1. 人物が歩く、振り返るなど、前後の動きが確認できる素材をMediaInへ用意します。
2. MediaInとMediaOutの間へSpeedWarpを置き、Speedを0.5にします。
3. まずFasterで全体の速度と動きを確認します。
4. 髪、指先、服の縁など、元フレームの間で形が変わりやすい部分をフレーム単位で見ます。
5. 品質を優先する場合はBetterへ変更し、同じ箇所を比較します。
6. 最後に、必要な区間がFusionの出力範囲へ収まっているか確認します。

この処理では人物の間の動きを推定しているため、顔の向きが急に変わる箇所や、物体がほかの物体の背後へ隠れる箇所では、形がゆがむことがあります。

### 背景に対して動く被写体をゆっくり見せる

固定カメラの映像で車が画面を横切る場合を考えます。SpeedWarpへ映像全体を入力し、Speedを0.5にすると、静止している背景だけでなく移動する車の位置も中間フレームで推定されます。

車の輪郭と背景の境界を重点的に確認します。車が通過して新しく背景が見える場所には、元の二つのフレームだけでは確定できない情報があります。境界が伸びたり、背景の模様が変形したりする場合、Modeの比較だけでなく、補間する区間を短くする、素材側を修正するといった対応を検討します。

### SpeedとDelayを分けて調整する

複数レイヤーのタイミングを合わせたい場合、まずSpeedで再生の速さを決め、続いてDelayで出力の位置を移動します。先にDelayを動かして速度の違いを補おうとすると、ある一点では合ってもほかの時刻でずれます。

出力フレームに対する元映像の対応関係を確認しながら作業すると、タイミングの問題とAI補間による画質の問題を切り分けられます。

## Time Speed、Time Stretcher、Optical Flowとの違い

| ノード | 主な役割 | 中間フレームの扱い |
| --- | --- | --- |
| [Time Speed](./time-speed.md) | 一定の再生速度やDelayを指定する | Nearest / Blend / Flowを選択。Flowでは前段でMotion Vectorを用意する |
| [Time Stretcher](./time-stretcher.md) | Source Timeをキーフレームで動かし、加減速や停止・逆再生を作る | Nearest / Blend / Flowを選択。Flowでは前段のMotion Vectorを使う |
| **SpeedWarp** | AIによる動きの解析とリタイムを一つのノードで行う | 内部で中間フレームを推定し、Faster / Betterで処理方針を選ぶ |
| [Optical Flow](../optical-flow/optical-flow.md) | 前後フレームからMotion Vectorを計算する | 画像をリタイムするのではなく、ほかのノードが使う動きのデータを生成する |

一定速度で、補間方式を明示的に選びたいならTime Speedが直接的です。速度を途中で変えたい場合はTime StretcherのSource Timeを使います。AIによるフレーム補間の品質を目的とする場合はSpeedWarpを検討します。

**SpeedWarpの前にOptical Flowノードを置くことは、21.1 Manualの基本接続では要求されていません。** Time Speed / Time StretcherのFlow補間と、SpeedWarp自身のAI処理を混同しないでください。

## 結果を確認するときの注意点

- **輪郭がゆがむ**：人物同士の交差、速い手足の動き、細い線などを確認します。FasterとBetterの両方で同じ位置を比較します。
- **背景の模様が変形する**：移動物体が隠していた背景が急に現れる区間などでは、画像だけから正しい中間状態を決められないことがあります。
- **期待した長さにならない**：Speedだけでなく、Fusionコンポジションと元素材のフレーム範囲を確認します。
- **プレビューが重い**：まずFasterで時間設定を確認し、品質判断が必要な区間でBetterへ切り替えます。
- **タイミングがずれる**：Speedによる時間の伸縮とDelayによる位置の移動を別々に確認します。

これらは一般的なフレーム補間の確認観点であり、特定の21.1環境での再現試験結果ではありません。最終出力のフレームを実際に確認して採否を決めます。

## 関連する記事

- [Time / Metadata / Utilityノード](./)
- [Time Speed](./time-speed.md)
- [Time Stretcher](./time-stretcher.md)
- [Optical Flow](../optical-flow/optical-flow.md)
- [Tween](../optical-flow/tween.md)
- [Repair Frame](../optical-flow/repair-frame.md)

## バージョン・出典・未確認事項

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 111「Miscellaneous Nodes」pp.2604–2605（**SpeedWarp [SPDw]**）を一次資料としています。Inputがオレンジ色の2D Image入力であること、ニューラルネットワークによるフレーム間の解析、Speedの初期値1.0と0.5 / 2.0の例、Delayの正負方向、ModeのFaster / Better、共通Transform / Settingsタブを確認しました。

本記事はFusionノードとしてのSpeedWarpを扱います。Edit / Colorページの速度変更UIと、操作項目が同一であることは前提にしていません。

Free / Studio間の利用可否、Fusion Studio単体版との表示差、内部REGID、全パラメータの数値範囲、実機での処理性能と補間品質は未検証です。これらを確定事項として扱わないため、frontmatterのverificationはpartialのままにしています。
