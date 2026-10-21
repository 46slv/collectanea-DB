---
title: Trackerの追跡点が隠れる・画面外へ出る
description: Point Trackerの追跡点が見えなくなったとき、再出現後の追跡と別の模様への切り替えを使い分ける。
doc_type: diagnostic
verification: partial
aliases: [point tracker occlusion, tracker lost pattern, 追跡点消失]
concepts: [tracking, coordinate-space]
nodes: [Tracker]
tasks: [debug, point-track, match-move]
symptoms: [tracking-lost, tracking-jump, tracking-drift]
prerequisites: [tracking]
level: intermediate
product_scope: fusion
updated: "2026-10-22"
---

# Trackerの追跡点が隠れる・画面外へ出る

車のドアノブを追跡して文字を追従させているとき、電柱が手前を横切ってドアノブが見えなくなることがあります。そこで追跡点が電柱へ乗り移ったり、文字が急に跳んだりしたら、**追跡の失敗区間を調べ、正しかった動きは残したまま続きを求めます**。文字の配置用Transformでごまかす前に、Trackerの追跡点だけを表示して確認してください。

DaVinci Resolve 21.1のTrackerは**IntelliTrackが既定**です。短い遮蔽に対応しやすい方式ですが、どの素材でも必ず追えるわけではありません。以下の**Pattern Rectangle**、**Adaptive**、**Path Center**による復旧は、従来の**Point**方式を対象にします。IntelliTrackにも同じ画面操作があるとは扱いません。

## 追跡対象が戻るかで方法を分ける

| 状況 | 復旧の考え方 |
| --- | --- |
| 数フレーム隠れた後、**同じ模様が再び見える** | 隠れる前後を個別に追跡し、間の位置を補間する。 |
| 模様が画面外へ出て**戻らない**、または外観が大きく変わる | 近くにある別の模様へ追跡対象を切り替え、同じパスへ追記する。 |
| 模様は見えているのに点が背景へ移る | PointのPattern / Search RectangleやAdaptiveを見直す。 |
| 点は正しいが文字だけずれる | [追跡と合成のずれを切り分ける](./track-drifts)。 |

たとえばドアノブが一時的に隠れて再び見えるなら、まず同じドアノブを追い直す方法を検討します。車が完全にフレーム外へ出てドアノブが使えなくなるなら、車体の近くの別の模様を使う方法が候補です。

## 正しかった区間を残す

1. TrackerをViewerに表示し、追跡点が**最後に正しく模様を追っていたフレーム**を見つけます。最初に外れたフレームからではなく、最後の正常フレームを基準にします。
2. Point方式で選択中の追跡点に、誤った追跡キーがすでに記録されている場合は、必要に応じてそのフレームで**Trim to End**を使います。これは選択した追跡点の**現在フレームより後**の記録を消します。**Delete all tracking data**とは異なり、全区間を初期化する操作ではありません。
3. それ以外の追跡点が正しく、再解析したくない場合は、Tracker Listの**Suspended**で既存データを保持する方法もあります。Suspendedの点は新たな解析には参加しませんが、記録済みのパスは利用できます。

削除・Trimの前後では、Viewerで正常区間のパスが残っていることを確認します。

## 方法A：同じ模様が再び現れる場合

ドアノブが電柱に数フレーム隠れ、その後に同じドアノブが現れる場合です。

1. 遮蔽前の見える区間を追跡し、最後の正常フレームまでの位置を確認します。
2. ドアノブが再び明瞭に見えるフレームへ移動し、**同じ模様**を基準に後半の区間を追跡します。前半を誤った模様で上書きしないよう、解析範囲と結果を確認します。
3. Trackerは前半と後半の追跡区間の**間を補間**します。隠れている間に車の進行方向が曲がるなど、直線的な補間では不自然なら、Viewerのパス編集ツール（**Insert and Modify**など）で中間の軌跡を調整します。
4. 遮蔽の直前・最中・直後を連続再生し、追跡位置が急に跳んでいないか確認します。

補間は「隠れている間の正しい動きが解析できた」という意味ではありません。特に被写体が加速・旋回する場合、隠れた区間は手動調整が必要になることがあります。

## 方法B：別の模様へ切り替える場合（Point）

追跡中の模様が画面外へ出るか、別の原因で使えなくなり、近くの別の模様で続きを追う場合です。

1. 追跡を停止し、**最後に正常に追えたフレーム**へ戻ります。すでに誤った後半のキーがあれば、上の手順で必要な範囲だけTrimします。
2. TrackerのInspectorにある**Path Center**を**Track Center (append)**にします。
3. Viewerで**Pattern selector**を別の追える模様へ移します。可能なら元の模様に近く、同じ物体の**ほぼ同じ奥行き**にある特徴を選びます。ドアノブから同じドア表面の傷やマークへ移す例です。
4. **Track Forward From Current Time**で現在フレームから追跡を再開します。新しい模様の位置は元のパスにつながるようにオフセットされます。
5. 継ぎ目と終盤で、追跡点だけでなく、そのパスで動かす文字や画像の位置を確認します。

**Pattern Center**は新しい模様の中心からパスを続ける扱いで、以前のパスへの継ぎ足しが目的なら**Track Center (append)**と使い分けます。ただしAppendでも、元の点と新しい点が異なる奥行きにあれば、カメラ移動に伴う**視差**（近くと遠くの物体で画面内の動き方が異なること）は補正されません。画面上で近いだけの背景の看板へ切り替えると、位置が次第にずれる可能性があります。

## 復旧しても結果が合わないとき

| 症状 | 確認すること |
| --- | --- |
| 継ぎ目で位置が跳ぶ | Path CenterがPattern Centerになっていないか、最後の正常フレームから再開したか。 |
| 後半ほど徐々にずれる | 切り替え前後の模様が同じ面・同程度の奥行きにあるか。 |
| 前半も壊れた | Trimの位置や再追跡した区間。最初から再解析する前に残存データを確認する。 |
| 一時的な遮蔽部分だけ不自然 | 前後の区間の追跡結果と、その間の補間パス。 |
| 追跡点は正しいのにラベルが動かない | 別NodeのCenterが**Connect To**で追跡値を参照しているか。画像出力の配線とは別の設定。 |

追跡をロゴやテキストへ渡す作業そのものは、[Trackerで車へ文字を追従させる](../../recipes/tracking/point-track-text-callout)を参照してください。ノードの入力・出力、Tracker ListやAdaptiveの説明は[Tracker](../../nodes/tracking/tracker)にまとめています。

## バージョン・根拠・確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Fusion Fundamentals Chapter 81 pp.1787–1788（遮蔽の前後を追う方法、補間、Track Center (Append)の手順）、Fusion Page Effects Chapter 119 pp.2840–2845（IntelliTrackとPoint、Track Buttons、Trim to End、Path Center、Tracker List）。

ここに示した車の例は公式機能を組み合わせた説明です。21.1実機でのメニュー表示順・映像ごとの追跡精度は未検証のため、`verification: partial`としています。
