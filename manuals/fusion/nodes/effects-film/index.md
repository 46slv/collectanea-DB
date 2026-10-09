---
title: Effect / Filmノード
description: 2D画像の複製・残像・光・不要物除去と、ログ変換・粒子・ノイズ処理を目的から選ぶガイド。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, stylize, film]
updated: "2026-10-09"
---

# Effect / Filmノード

FusionのEffect Nodesは2D画像へ複製・光・影・時間方向の効果を加える道具、Film Nodesはログ値・ノイズ・フィルム粒子などを扱う道具です。DaVinci Resolve 21.1 Reference ManualではそれぞれChapter 97と98に分かれています。このページでは実際の目的から選べるようにまとめます。

いずれも主に2DのImageを受け取り、加工したImageを出力します。ImageはRGBだけでなく透明度（Alpha）も持ちます。青いEffect Maskは、多くのノードで**処理後の結果をどこに表示するか**を制限します。特別な入力で「何を光らせるか」「何を消すか」を指定するノードもあるため、単に「マスク」と呼んで同じ端子へつなぐことはできません。[Imageの基礎](../../learn/02-data/image.md)と[Maskの基礎](../../learn/02-data/mask.md)も参照してください。

## 画像を増やす・動きの跡を残す

- **[Duplicate](./duplicate)**：入力画像を複数枚コピーし、各コピーの位置・回転・大きさを順に変えます。円状のロゴ配列や繰り返しパターンに向きます。Time Offsetを使えばコピーごとに異なる時刻の画像も参照できます。
- **[Trails](./trails)**：過去フレームの画像を内部バッファに蓄積して現在の画像へ重ねます。動く文字やライトの後ろへ時間方向の残像を引くときに使います。プレビュー位置を飛ばしたときに残像が足りない場合はRestart／Prerollでバッファを準備します。
- **[TV](./tv)**：入力画像に走査線・映像のゆがみ・ノイズ・流れる帯を加えます。古いテレビ画面や受信不良の演出向けで、Effect Maskを使えば画面内のモニター部分だけへ効果を限定できます。
- **[Pseudo Color](./pseudo-color)**：R/G/B/Aの各チャンネルをSine、Triangleなどの波形で変化させ、疑似カラーや周期的な色変化を作ります。Phaseのアニメーションで色を循環させる例があります。画像から距離を推定する機能ではありません。

**選択の目安**：枚数や配置を決めて並べるならDuplicate、動きがすでにある素材の残像を蓄積するならTrailsです。DuplicateのTime Offsetによる時間差コピーと、Trailsのフレーム蓄積は処理の仕組みが異なります。

## 光を伸ばす・反射を作る・影を付ける

- **[Highlight](./highlight)**：画像内の明るい点から星形の光の筋を伸ばします。街灯、イルミネーション、金属の反射などに向きます。Highlight Maskで発生源だけを限定しても、発生した光条はそのマスクの外へ伸ばせます。
- **[Rays](./rays)**：画像の明るい部分やAlphaをもとに、指定した中心へ向かう放射状の光条を作ります。窓から差し込む光や、文字の周囲から広がる筋を作るときに使います。各明点を中心に星形へ広げるHighlightとは異なります。
- **[Hot Spot](./hot-spot)**：Primary Centerで光源位置を指定し、主光源・副次的な反射・レンズ内反射風の要素を組み立てます。車のヘッドライトに付けるときは光源位置を追わせ、Occlusion入力で車体や人物による遮蔽を指定できます。
- **[Shadow](./shadow)**：入力画像の文字・ロゴ・図形などから2Dの影を作ります。OffsetやSoftnessで位置と柔らかさを調整し、Depth入力による距離情報も利用できます。3Dライトから実際の形状の影をレンダリングする処理とは区別します。

**選択の目安**：複数の明点を星状に光らせるならHighlight、指定中心に放射状の筋ならRays、特定の光源を指定して反射や遮蔽を制御するならHot Spotです。

## 消したいものがある

**[Object Removal](./object-removal)**は、消去対象をMaskで指定し、前後フレームの解析やClean Plateから背景を補って不要物を取り除きます。例えば固定カメラで人物が通り過ぎる映像なら、人物を指定してScene Analysisを行い、別フレームに見える背景を利用します。背景が一度も見えていない部分には外部Clean Plateを与えるなど、別の素材が必要になる場合があります。

このノードでは**Maskは消したい範囲**、**Clean Plateは補完用の背景画像**、**Effect Maskは処理結果の適用範囲**を担当します。入力の意味が異なるので、記事の接続図と手順を確認してください。

## ログ変換・粒子・ノイズを扱う

- **[Cineon Log](./cineon-log)**：Cineon、ARRI Log C、BMD Filmなど、指定したログ形式と線形値を変換します。Log to Linで合成しやすい値へ変換し、必要な場合はLin to Logで戻します。色域変換まで含めた全カラーマネジメントを自動処理するノードではありません。
- **[Light Trim](./light-trim)**：ログ状態の画像の露出を、フィルムスキャナー／ラボのtrim pointを模した尺度で調整します。一般にLog to Lin変換の前に置きます。Manualでは8 pointsが1 stop相当とされています。
- **[Remove Noise](./remove-noise)**：色チャンネルを柔らかくして細かなノイズを抑え、Detailで輪郭を戻します。キーイング前のグリーンバック素材の粒子を減らす例が示されています。時間方向の動き解析による高度なノイズ除去とは別の方法です。
- **[Film Grain](./film-grain)**：画像へ生成粒子を加えます。素材をクリーンにして合成を済ませた後、画面全体の粒状感を揃える目的に向きます。Size・Strength・Roughness・Log Processingなどで見え方を調整します。
- **[Grain](./grain)**：旧来の粒子生成ノードです。既存コンポジションの再現や互換性確認に参照します。新規の粒状感調整ではFilm Grainから検討してください。

**Remove Noiseは元のノイズを減らす処理、Film Grainは新しい粒子を追加する処理**です。異なる撮影素材やCGを合成するとき、前処理と仕上げのどちらに置くかで結果が変わります。

## 実際の接続例

### タイトルに軌跡を残す

    Text+ → Transform（位置を動かす）→ Trails → Glow ┐
                                                    ├→ Merge → MediaOut
    背景映像 ───────────────────────────────────────┘

Text+で文字を作り、Transformの位置をアニメーションさせます。Trailsが過去の文字を残し、Glowが軌跡の光を広げた後、Mergeで背景へ重ねます。最初はTrailsのGainで残像の長さを調整し、必要なときだけOffsetやBlurを追加します。

### キーイング後に粒状感を揃える

    撮影素材 → Remove Noise → Delta Keyer ┐
                                         ├→ Merge → Film Grain → MediaOut
    背景・CG ─────────────────────────────┘

細かいノイズがキーの境界を乱す場合にRemove Noiseを先に使い、合成後のFilm Grainで全体へ共通の粒子を加えます。元の粒子が問題なければRemove Noiseは必須ではありません。髪や細い輪郭を失わないよう、前処理の強さはキー結果を見て決めます。

### ログ素材を線形で合成する

    ログ素材 → Light Trim → Cineon Log（Log to Lin）→ 合成処理
                                                        ↓
                                      必要なら出力側でLin to Log

Light Trimはログ値での露出調整、Cineon Logはログ値と線形値の変換です。すでに自動色管理や別のノードで線形へ変換済みなら、Log to Linを二重に入れないでください。素材のログ形式と実際の合成空間を確認します。

## Mask入力を選ぶときの注意

Effect Maskは処理結果の表示範囲を制限するのに対し、Highlight Maskは光条が**発生する点**を指定し、Hot SpotのOcclusionは**光を遮る場所**、Object RemovalのMaskは**除去対象**を指定します。発生源からマスク外へ光を伸ばしたい場合、HighlightのEffect Maskでは完成後の光条まで切れてしまいます。Highlight Maskを使用してください。

なお、[Depth Map](./depth-map)の個別記事は現在このディレクトリ内にありますが、21.1 ManualではMatte Nodesに属します。2D画像から見かけの距離に応じたAlpha matteを生成するもので、3Dジオメトリや正確なカメラ空間Zを出力するノードではありません。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 97「Effect Nodes」pp.2271–2308とChapter 98「Film Nodes」pp.2309–2324、および各ノードの個別節に基づきます。接続例と選択の目安は確認された入出力と機能を組み合わせた運用案です。実機描画、Inspectorの初期値・範囲、内部REGID、edition差を全件確認したものではないため、verificationはpartialとしています。
