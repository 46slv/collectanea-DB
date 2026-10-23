---
title: 背景のLookから人物を守る：Layer Mixerで局所補正を重ねる
description: 同じベース映像から背景と人物の補正を分岐し、Layer Mixerの優先順とMatteを確認して人物の色を保つ手順。
doc_type: recipe
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Serial Node, Layer Mixer, Power Window, HSL Qualifier, Key Output Gain, Scopes, Tracker]
tasks: [layer-compositing, secondary-grading, subject-protection, node-order, shot-matching]
level: intermediate
updated: "2026-10-23"
---

# 背景のLookから人物を守る：Layer Mixerで局所補正を重ねる

夕景のライブ映像で、背景の青を濃くすると人物の顔まで青くなることがあります。全体のLookを弱めれば背景の狙いも変わります。Colorページの**Layer Mixer**では、共通のベース映像から作った複数の補正結果を重ね、どちらの色を重複領域で見せるか整理できます。

このレシピは、背景へ寒色のLookを適用しながら、顔と首には元の肌の色と照明の暖かさを残す例です。単に二つのノードを直列につなぐ方法とは、二次補正の入力と重なり方が異なります。構造そのものは[Serial／Parallel／Layerノード](../reference/serial-parallel-layer-nodes)で確認できます。

## 想定ショットと完成条件

ステージの後方には青いLEDウォールがあり、手前の歌い手には暖色のスポットライトが当たっています。カメラがゆっくり寄り、人物が横を向きます。背景を少し深い青にしつつ、肌を青く染めたくないショットです。

完成と判断する条件は次の通りです。

- 背景の青が変わっても、顔と首の血色や照明の方向が保たれる。
- 人物と背景が重なる輪郭に硬い縁、色のにじみ、ちらつきが出ない。
- 顔が動く区間で、保護する領域がずれない。
- 前後ショットと再生するときに、背景の色調と人物の明るさが不必要に跳ばない。

この条件に特定の色相値、IRE値、Key Output Gain値は設けません。照明の色をあえて肌に乗せる演出であれば、肌を中立色へ固定する必要もありません。

## 1. 共通のベースを整える

1. Colorページで対象クリップを選び、[カラーマネージメント](../learn/color-management-basics)により、入力色空間・Gammaと既存のCST／LUTが意図した位置にあるか確認します。
2. [Primaries](../reference/primaries-color-wheels)で全体の露出とホワイトバランスを整えます。ここでは背景の青を強めず、人物と背景が共に利用できる基準画像を作ります。
3. [Gallery／Stills](../reference/gallery-stills)または[Versions](../reference/versions-and-grade-comparison)に基準状態を残します。比較用の状態を確保したら、全体の補正ノードを変更せずに作業を始めます。
4. [Scopes](../reference/scopes)で大きな信号変化がないか確認します。Paradeの青成分だけで「肌が青い」と決めず、Viewerの顔や照明も見ます。

背景だけを選択したつもりで、実はColor Managementや全体のベース補正が変わっていれば、Layer Mixerに進む前に原因を分けます。

## 2. 二つの補正を共通入力から分ける

次の構造を目標にします。数字は記事内の識別用であり、Resolveが必ずこの番号を付けるという意味ではありません。

```text
                                  ┌→ [02 背景：寒色Look] ────┐
入力 → [01 露出・WBのベース] ───────┤                         ├→ [Layer Mixer] → 出力
                                  └→ [03 人物：肌を保護] ────┘
```

1. Node Editorで基本補正後の結果を二つのCorrectorへ分岐させます。両方が**01からの同じ入力**を受けることを接続で確認します。
2. 一方を背景用、もう一方を人物用として識別できるようにします。背景用では青の印象を調整し、人物用では必要な場合に限り肌の明るさと色を整えます。
3. 二つの結果をLayer Mixerへ接続します。**どちらの枝が重なった領域で優先されるかはMixerの入力順に依存**するため、人物用が意図通り前面になる入力関係をViewerで確かめます。
4. 画面上でノードを上下へ動かすことと、Mixerへ接続する入力順を変更することは同じではありません。見た目の配置より接続を確認します。

Blackmagic Design公式『The Colorist Guide to DaVinci Resolve 20』Lesson 5は、Layer Mixerを画像の層として扱い、上側のRGB入力から下側の入力へ向けて重ねる例を説明しています。同書には合成モードの変更や入力接続を入れ替える演習もあります。ただし**21.1でのメニュー表記と切替操作は今回直接検証していません**。Layer Mixerの既定のNormal合成から始め、別のComposite Modeを試した場合は最後に意図した方式へ戻してください。

## 3. 人物用のMatteを作る

分岐を作っただけでは、人物用の補正結果が画面全体に重なって背景のLookを隠す可能性があります。**人物をどこまで表示するかをMatteで定義する**ことが必要です。

1. 人物用ノードに[Power Window](../reference/power-windows)を置き、顔と首の周囲を覆います。顔の輪郭に硬く密着させるより、最初は少し広く置いて境界をなじませます。
2. [HSL Qualifier](../reference/hsl-qualifier)を追加する場合は、肌と似た色の背景まで選ばれていないかHighlight表示で確認します。WindowとQualifierを重ねて選択範囲を絞る方法もあります。
3. 背景用ノードでは寒色Lookの強さを調整します。人物用ノードは共通のベース入力から作られているため、背景用で青くした結果を直列に受け取っていないか確認します。
4. Mixer後のViewerで、顔、髪の縁、衣装、背景のLEDの四か所を比べます。**顔が守られても、首や耳だけ青いまま**であれば、選択範囲が不足している可能性があります。
5. 補正を弱めたい場合は、人物側の[Keyパレット](../reference/key-matte)でマットの強さを調整する方法を検討します。Key Output Gainを下げると、守る領域の重なり方も変わるので、影とハイライト双方を見直します。

顔が動く素材では、[Color Tracker](../reference/color-tracker)でWindowの追従を検討します。動きを解析してもMatteの精度が保証されるわけではなく、横顔、髪が揺れる場面、背景の照明が切り替わる場面を連続再生して確かめます。

## 4. Mixer以外の原因と切り分ける

背景の青が人物へ漏れるとき、Layer Mixerの順序だけが原因とは限りません。次の順で個別に確認します。

| 見える症状 | 切り分ける対象 | 試すこと |
| --- | --- | --- |
| 人物用ノードを有効にすると背景の青が消える | 人物Matteの範囲、Mixerの接続 | Highlight表示で人物以外が白くなっていないか見る |
| 顔が青いまま残る | 前面の入力順、肌領域の選択 | Mixer入力と人物Windowを分けて確認する |
| 輪郭が硬い・明るい縁が出る | WindowのSoftness、Qualifierの境界、補正量 | Matteの境界を確認してから色差を弱める |
| 再生すると肌だけ色が明滅する | Tracker、Qualifier、Keyの時間変化 | [二次補正のちらつき](../troubleshooting/secondary-matte-flicker)に沿って原因を切る |
| 背景全体の色が想定より弱い | 人物Matteの広がり、Key Output | 背景用の枝を単独で見てからMixer後と比較する |
| ノードの順序を動かしても変化しない | 接続関係、合成モード、ノードの有効状態 | Node Editorの線を追い、片側ずつ無効化して比較する |

同じ二つの補正を[Parallel Mixer](../reference/serial-parallel-layer-nodes)で混ぜた場合とも比較できます。ただし**ParallelとLayerでは重複部分の合成が異なる**ので、片方を変更して見た目が変わったこと自体を失敗と判定しません。比較中はWindowと補正量を固定し、Mixerだけを切り替えて差を見ます。

## 5. 完成を確認する

1. まず背景側、次に人物側のノードを一つずつ無効化し、各枝の役割が明確かを確認します。両方戻したら、Layer Mixer後の結果を見ます。
2. Windowの輪郭表示を消し、通常のViewerで再生します。静止画で問題がなくても、人物の首や髪が動く瞬間に縁が出る場合があります。
3. 前後ショットと連続再生し、青の量と人物の血色が急に変わらないか比較します。必要なら[マルチカメラのマッチング](./matching-multicamera-interview)の考え方で基準Stillを使います。
4. [Scopes](../reference/scopes)で明暗・色成分を再確認します。全画面Scopeだけで顔の局所変化を数値化したつもりにならず、Viewerと併用します。
5. 診断で切り替えたノード、Highlight、合成モードを意図した最終状態へ戻して保存します。

Layer Mixerの導入でMatteが複雑になり過ぎ、Serial＋一つのWindowの方が自然なら、単純な構造へ戻して構いません。完成条件はノード数ではなく、意図した色とショット全体の連続性です。

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（[公式サポート](https://www.blackmagicdesign.com/support)、2026年9月8日公開）。21.1版のLayer Mixer該当章と実機操作は本runで直接照合できていません。
- **現行の一次資料：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)』（2026年10月23日確認）。ノードによる一次・二次補正の分離、Window、Qualifier、Tracker、Scopesの役割を確認。
- **Layer Mixerの補助一次資料：** Blackmagic Design『[The Colorist Guide to DaVinci Resolve 20](https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-20-Colorist-Guide.pdf)』Lesson 5「Mastering Node Trees」。ノードの重なり、Composite Modeと入力順の記述は公式検索本文で確認。大容量PDFの該当ページを直接表示できなかったため、ページの図と21.1への継続性は未照合。
- **verification: partial。** 実例は学習用に想定したライブ映像です。21.1実機でのLayer Mixer接続、合成数値、Key Output Gainの実測効果、Tracker精度、Free／Studio差は未検証です。正確なショートカット・Inspectorの表示項目・固定パラメータ値を指定していません。

関連：[ノード構造](../reference/serial-parallel-layer-nodes)／[Power Windows](../reference/power-windows)／[Keyパレット](../reference/key-matte)／[二次補正のちらつき](../troubleshooting/secondary-matte-flicker)。