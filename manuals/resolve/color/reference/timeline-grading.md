---
title: Timelineグレーディング：全ショットに共通する補正
description: ColorページのTimelineノードとClip・Group補正の適用範囲を区別し、全編のルック調整とQC修正を安全に行う。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Timeline Grade, Clip Grade, Node Editor, Group Pre-Clip, Group Post-Clip, Scopes]
tasks: [timeline-grading, grade, match-shots, global-look, quality-control, troubleshoot]
level: intermediate
updated: "2026-10-22"
---

# Timelineグレーディング：全ショットをまとめて調整するとき

短編やCMを一通りグレーディングした後、作品全体のコントラストや色の方向を少しだけ変えたい場合があります。各ショットの補正を個別に修正するより、共通部分を一か所で管理したい場面です。

DaVinci ResolveのColorページには、選択したクリップのグレードを扱う **Clip** と、現在の編集タイムライン全体にかかる **Timeline** のグレード段階があります。Timelineグレードは、ショット間の差を自動でそろえる機能ではありません。**同じ補正を全ショットへ通す**ための段階です。適用前にショット別のバランスを整えておくと、意図しない変化を見分けやすくなります。

## 「Timeline」という名前で混同しやすい三つのもの

| 名称 | 何を指すか | 使い分け |
| --- | --- | --- |
| ColorページのTimelineグレード | Node Editorで現在の編集タイムライン全体に適用するノード群 | 全編共通の仕上げやQC修正 |
| EditページのAdjustment Clip | 配置した範囲の下にある映像へ効果をかける編集用クリップ | 一部の区間だけをまとめて調整したい場合 |
| カラーマネージメントのTimeline Color Space | RCMなどで使う色処理の作業空間に関する設定 | 入力・処理・出力の変換条件を決める場合 |

これらは「タイムライン」という語を共有していても、同じ設定ではありません。Timelineグレードを追加しても、プロジェクトのTimeline Color Spaceが自動的に変わるわけではありません。[カラーマネージメントの基礎](../learn/color-management-basics)と分けて扱います。

また、現在表示している**1本の編集タイムラインに共通して作用する**ことと、プロジェクト内に存在する別の編集タイムラインにも自動的に適用されることは同義ではありません。本記事は現在選んだ編集タイムラインを対象とします。複数タイムラインにまたがるグレード管理の細かな条件は21.1実機で未検証です。

## Clip・Group・Timelineの適用範囲

| グレード段階 | 影響する対象 | 適した補正 |
| --- | --- | --- |
| Group Pre-Clip | 同じグループのクリップ。各Clip補正より前 | 同条件で撮影した素材の共通処理 |
| Clip | 個々のショット | 露出、色かぶり、肌、局所的な修正 |
| Group Post-Clip | 同じグループのクリップ。各Clip補正より後 | シーン共通のLook |
| Timeline | 現在の編集タイムライン全体 | 全編に共通する仕上げ |

Colorページのノードは[Color Node Graph](../learn/color-node-graph)で補正を組み立てますが、**ノード同士のSerial／Parallel構成**と、**どのグレード段階にノードが属するか**は別の判断です。[Group Grading](./group-grading)で扱うPre-Clip／Clip／Post-Clipに対して、Timelineはさらに広い適用範囲を持ちます。

旧版のBlackmagic Design公式Reference Manualおよび公式のResolve 17 New Features Guideには、Clip／Group／Timelineという段階と、Timelineグレードを全編共通のノード処理に用いる考え方が記載されています。概念上は「Group Pre-Clip → Clip → Group Post-Clip → Timeline」の順に考えられます。ただし、この図は**色管理の入力／出力変換、RAW処理、全ての例外を含む21.1の完全なパイプライン図ではありません**。RCM／ACESやCSTの位置関係を、この簡略図だけから推定しないでください。

## Timelineモードへ切り替える前に

旧版の公式マニュアルでは、ColorページのNode Editor上部でClipとTimelineのグレードモードを切り替える操作が紹介されています。グループに属するクリップではGroup Pre-Clip／Post-Clipの選択も加わります。**21.1実機の正確なボタン表示・ドロップダウン配置は今回未照合**です。現在のResolve画面で、選択中のグレード段階を先に確認してください。

作業を始める際は、まず対象の編集タイムラインを確認し、現在のグレード段階を確認します。次に、Clip段階にある基本補正やグループ補正が想定どおりかを複数ショットで比較します。Timeline段階へ切り替えた後は、そこで作ったノードを「一つのクリップだけの補正」と思って操作しないようにします。

**確認用の簡単な試験：** Timeline段階で目で分かる程度に一時的な色変更を加え、異なるシーンの複数ショットを表示します。同じ方向の変化が現れることを確認したら試験用の変更を元に戻します。これは操作範囲を確かめる手順であり、納品用の補正値を提案するものではありません。

## 操作例1：CM全編のLookを最後に微調整する

室内の会話、屋外の移動、商品アップが連続する30秒CMを想定します。全体をわずかに落ち着いた印象へ寄せたいものの、各シーンの露出とホワイトバランスはすでに整っています。

1. ColorページでCMの編集タイムラインを選びます。[Scopes](./scopes)と[Gallery／Stills](./gallery-stills)を用い、室内・屋外・商品の代表ショットを比較します。
2. Clip段階でショットごとの露出・白バランスを確認します。屋外だけハイライトが強いなどの差は、共通補正より先にそのショットで調整します。
3. シーン別のLookが必要なら、対応ショットをグループ化し、[Group Post-Clip](./group-grading)でまとめます。全編共通の変更とシーン限定の変更を分けます。
4. Node EditorがTimelineグレード段階であることを確かめ、新しい補正ノードで全編共通のコントラストや彩度を少しずつ変えます。個別ノードを多用するより、変えた意図を識別しやすい構成にします。
5. 室内・屋外・商品アップを行き来し、人物の肌、白い商品、暗部、強い反射などが同じ調整で不自然になっていないか確認します。スコープ上の傾向も各シーンで比較します。
6. Timelineノードを一時的に無効化して差を確認し、全編共通に変更する利点が、個々のショットの副作用より大きい場合だけ採用します。

例えば室内の肌は自然でも屋外の空が過剰に鮮やかになったなら、Timeline側の彩度をさらに上げるのは適切ではありません。全編共通の処理を弱め、屋外だけ[Clip段階](./primaries-color-wheels)で調整するか、シーン別のGroup補正に移す方が範囲を制御できます。

## 操作例2：納品前のQCで全編共通の傾向を直す

長めのインタビュー映像で、各カメラをショットマッチングした後に全編の明るい部分がやや強すぎるように見える、と仮定します。補正対象が一部のカットだけなのか、実際に全カットで同じ傾向なのかを先に調べます。

1. 冒頭・中盤・終盤にある代表ショットをいくつか選び、[Waveform／Parade](./scopes)と通常表示を比較します。スコープ値だけで問題の有無を機械的に決めず、表示・納品条件もそろえます。
2. 特定カメラや特定の照明でのみ問題が生じるなら、Timeline補正ではなく[Group](./group-grading)またはClip段階へ戻します。
3. ほぼ全ショットで同じ調整が妥当と判断できた場合だけ、Timeline段階にQC専用ノードを用意し、ハイライトの見え方を小さく調整します。数値の推奨値は素材と出力条件で異なるため指定しません。
4. 顔、白い衣装、窓の外、字幕やグラフィックが重なる区間を実際に再生し、変更による副作用を確認します。素材間のばらつきが大きい場合、Timeline一括補正の採用を見送ります。
5. 変更の採否を決める際、元のグレードとの比較条件（タイムライン、監視環境、色管理、表示変換）を固定します。[Versions／グレード比較](./versions-and-grade-comparison)にあるグレード管理の考え方も参照してください。

**注意：** 特定の色を全編で抑える補正を作った場合、同じ色を持つ別の被写体も影響を受ける可能性があります。例えば赤い看板だけを直したつもりでも、他シーンの赤い衣装や肌に変化がないか確認が必要です。補正範囲が狭いときは[Qualifier](./hsl-qualifier)や[Power Window](./power-windows)をClip側で使う方が適しています。

## Timelineグレードが不適切な場合

**1シーンだけ変える：** そのシーンのクリップを一つのグループとして扱うか、対象範囲が編集上明確ならAdjustment Clipの適否を検討します。Timelineグレードを使ってから全編のほかのショットで効果を相殺する方法は、保守が難しくなります。

**1台のカメラだけ変える：** 撮影ガンマ・色域・カメラ特性に依存する補正を、異なる素材が混ざるTimeline段階で一律にかけないようにします。入力変換は[Color Management](../learn/color-management-basics)、必要なら[Camera RAW](./camera-raw)やカメラ別Groupの役割と分けて判断します。

**ショット間の明暗差をそろえる：** 全編に同じ露出補正を足しても、ショット間の相対的な差は基本的に残ります。先にClipでバランスを整え、全体の仕上げにTimelineを使う方が確認しやすい構成です。

**複数の納品色空間を作る：** 一つのTimelineグレードを出力変換そのものと同一視しないでください。RCM／ACES、出力色空間、出力トランスフォーム、複数納品の扱いは別に設計します。Resolve 21にはMultiMaster Trimなどの新機能もありますが、本記事のTimelineノードと同じ機能として扱いません。

## 症状から確認する

| 症状 | 先に調べること | 判断 |
| --- | --- | --- |
| 1ショットを調整しただけなのに全編が変わった | Node EditorがTimeline段階になっていないか | 個別補正ならClipへ戻す |
| 同じ補正でも一部のシーンが不自然 | 入力素材、元のClip補正、Group補正の違い | 共通補正を弱めるか、適用範囲を分ける |
| グループ全体だけ変えたいのに別シーンも変わる | Group Post-ClipとTimelineを取り違えていないか | グループ限定ならPost-Clipを使う |
| 彩度変更後、特定の衣装だけ強く見える | 他ショットの同系色とスコープ | 局所補正へ移すか共通変更を控える |
| 複数の編集タイムラインで見た目が違う | 現在選択したタイムライン、Clip／Timelineのグレード、色管理 | グレードを共有していると決めつけず各面を確認 |
| 修正前と比較できない | 変更したノードの所在、グレード段階、有効／無効 | 比較する段階と表示条件を固定する |

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** [Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（2026年9月8日公開）。本記事執筆時はPDFが約183MBあり、該当章の直接照合を完了できていません。UIの正確な配置や21.1固有の例外を確定したものではありません。
- **現行公式Color機能：** [Blackmagic Design「DaVinci Resolve — Color」](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)（2026年10月22日確認）。クリップ単位のノード操作、グループによる前後段の補正、Scopes、Stillでの比較を確認しました。同ページだけでTimelineモードの全詳細は証明できません。
- **公式の旧版Reference：** [『DaVinci Resolve 11 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_11_Reference_Manual.pdf)「Clip vs. Timeline Grading」。TimelineグレードとClipグレードの基本的な役割、および切り替えという概念の歴史的根拠です。これを21.1のボタンや数値の証拠には用いていません。
- **公式の処理段階資料：** [『DaVinci Resolve 17 New Features Guide』](https://documents.blackmagicdesign.com/SupportNotes/DaVinci_Resolve_17_New_Features_Guide.pdf)「Image Processing Within Grades」。Pre-Clip／Clip／Post-Clip／Timelineという段階の存在を確認した旧版資料です。
- **21世代の区別：** [Blackmagic Design「What's New in DaVinci Resolve 21」](https://www.blackmagicdesign.com/products/davinciresolve/whatsnew)。MultiMaster TrimとGroup VersionsをTimelineグレードと混同しないための背景情報です。
- **verification: partial。** 21.1実機での操作、Timeline段階のUI表示、すべての処理順・RCMやACESとの詳細な前後関係、各パラメータ名／値域、Free／Studio差は未検証です。操作例は公式機能を組み合わせた設計例であり、実機での観測結果ではありません。

関連：[Group Grading](./group-grading)／[Color Node Graph](../learn/color-node-graph)／[Scopes](./scopes)／[Color Management](../learn/color-management-basics)／[Gallery／Stills](./gallery-stills)
