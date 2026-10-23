---
title: Split Screen（複数ショット・グレードの同時比較）
description: Colorページで複数ショットやVersionを同時比較し、編集対象を確認しながら色と明暗を合わせる方法。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Split Screen, Selected Clips, Neighbor Clips, Versions, Image Wipe, Scopes]
tasks: [compare-shots, shot-matching, compare-versions, troubleshoot]
level: intermediate
updated: "2026-10-23"
---

# Split Screen：複数のショットを並べて比較する

Colorページの**Split Screen**は、複数のフレームをViewer内に並べ、色・明るさ・コントラストを同時に比較する表示方法です。同じインタビューのカメラAとBを交互に表示するだけでは気づきにくい差も、複数ショットを並べると把握しやすくなります。

目標は各ショットのRGB値をそろえることではありません。被写体の向き、照明、時間帯の違いを保ちながら、カットを連続再生したときの変化が意図に沿っているかを判断します。見た目の比較に[Scopes](./scopes)を併用します。

## Image Wipeとどう違うか

| 機能 | 比較の形 | 主な用途 |
| --- | --- | --- |
| **Image Wipe** | 2画像を境界や重ね表示で比べる | 類似構図の微妙な色差、Stillと現在ショットの比較 |
| **Split Screen** | 複数フレームをViewer内に並べる | 前後のカット、別カメラ、別Versionの同時評価 |
| **Lightbox** | Timeline内の多くのショットを一覧表示 | 補正漏れやシーン全体の不揃いを探す |
| **Gallery／Stills** | 基準フレームや補正を保存する | 基準への再照合、グレードの再利用 |

Blackmagic Designの公式Colorページは、Image Wipeの比較表示とSplit Screenの複数フルフレーム表示を別の方式として説明しています。[Gallery／Stills](./gallery-stills)は比較の基準を保持する場所であり、Split Screenの代わりにグレードを保存する仕組みではありません。

なお、ここでのSplit Screenは**Colorページの比較表示**です。最終映像に分割画面を作る合成処理とは区別します。

## 比較方法を選ぶ

公式『The Colorist Guide to DaVinci Resolve 20』には、Timelineで選択したショットを並べる**Selected Clips**と、隣接ショットを並べる方式が紹介されています。VersionやGalleryのグレードを比較する利用方法も公式Colorページで説明されています。21.1の全モード名・配置・表示上限は実機未照合です。

| 比較方法 | 適した場面 | 確認すること |
| --- | --- | --- |
| **Selected Clips** | 比べたい複数のショットが決まっている | Viewerの中で現在編集対象になっているクリップ |
| **Neighbor Clips** | カットの前後関係を確認したい | 意図する編集順のショットが並んでいるか |
| **Versions** | 同一素材の別グレードを評価する | 現在のVersionと採用候補 |
| **Galleryのグレード比較** | 保存済みLookを比較する | Still画像そのものと、Stillの補正を適用したプレビューの違い |

モードによって、Viewer上でのクリック／ダブルクリックが選択クリップ・Versionの変更やグレード適用につながる場合があります。21.1固有の挙動を決めつけず、操作前に現在選択中のクリップとグレードの状態を確認してください。

## Selected Clipsの基本手順

公式20 Colorist GuideのLesson 2では、ColorページのTimelineで複数クリップを選び、ViewerのSplit Screenを有効にしてSelected Clipsで比較しながらショットを補正しています。以下はその流れを基にした作業順です。21.1の正確なボタン位置は未検証です。

1. 比較したいショットを決め、必要なら[GalleryのStill](./gallery-stills)で調整前の状態を保存します。
2. 比較対象のInput色空間・Gamma、RCM／CST、技術LUTとLook用LUTを確認します。表示条件が不揃いなら先に[カラーマネージメント](../learn/color-management-basics)と[CST](./color-space-transform)を調べます。
3. ColorページのTimelineで複数のクリップを選びます。
4. ViewerのSplit Screenを有効にして、比較方法を**Selected Clips**へ切り替えます。ボタンが見えない場合はViewerの幅と表示メニューを確認します。
5. 並んだフレームのうち、**現在どのクリップを補正しているか**をViewerとTimelineの両方で確かめます。公式20 Colorist Guideは、比較表示で選択したショットにColorパレットの調整が作用する操作例を示しています。
6. [Primaries](./primaries-color-wheels)または[Custom Curves](./custom-curves)で対象ショットの明るさ・色の偏り・コントラストを調整します。必要に応じてWaveform、RGB Parade、Vectorscopeを使います。
7. Clip／Group／Timelineのどのノード領域で編集しているか確かめます。[Group](./group-grading)や[Timeline](./timeline-grading)の補正を変更すると、比較対象の複数ショットが同時に変わり得ます。
8. Split Screenを解除して通常のViewer表示に戻し、編集順で通して再生します。複数フレームで自然に見えても、カットの切り替わりで不連続に感じる場合があります。

### 判断例：2台のカメラで肌色が違う

A1→B1→A2→B2の順に編集されたインタビューを想定します。Selected Clipsで4カットを並べ、まずA1とA2に共通する肌色、背景の白さ、衣服の階調を確認します。B1とB2だけが赤いなら、背景の無彩色部分も赤いかどうかを比較します。

背景も赤ければホワイトバランスや入力変換の問題を疑い、[Primaries](./primaries-color-wheels)で全体のバランスを確認します。背景は合っているのに肌だけ赤いなら、[HSL Qualifier](./hsl-qualifier)を利用する局所調整も候補です。ただし照明の色や顔の向きが違えば、肌の見かけの色が完全には一致しない場合があります。

複数ショット表示では「どれが外れているか」を見つけ、最後は連続再生で「カット間の移動が不自然でないか」を判断します。実際の作業例は[マルチカメラのショットマッチング](../recipes/matching-multicamera-interview)にもあります。

### 判断例：朝から夕方への中間ショット

朝の青いショットと夕方の暖かいショットの間に昼のショットがある場合、昼のカットをどちらか一方に完全に合わせると、もう一方へ切り替わるときの変化が唐突になることがあります。

Selected Clipsで前後と中間の3カットを並べ、まず露出の大きな段差を整え、次に空や壁の色が時間の経過としてつながるよう中間ショットを調整します。公式20 Colorist GuideのLesson 7には、異なる時間帯の映像をつなぐ**Intermediary Matching**の例があります。

この場合の判断基準は数値の一致ではなく、時間帯の変化を残しながら唐突な飛びを減らすことです。これは操作判断の仮想例であり、特定素材での実測結果ではありません。

## 同じショットのグレード案を比べる

一つのショットで「自然な肌を優先」と「背景の暖かさを優先」の2案を評価する場合は、先に[Versions](./versions-and-grade-comparison)で案を保存し、Version系のSplit Screen比較で同じフレームを見ます。現在有効なVersionがどれかを確認してから採用します。

Galleryに保存したStill由来のLookを比べる場合は、Stillの**画像そのものを比較する表示**と、Stillに保存された**グレードの候補を現在のショットで見る表示**を混同しないようにします。既存のノードを置き換えるApply Gradeと追記するAppend Node Graphは別操作です。[グレードのコピーと追記](./grade-copy-and-append)を参照してください。

比較の前に「肌が自然」「窓の階調を維持」「前後ショットと明るさがつながる」など、選ぶ条件を明確にしておくと案の評価が安定します。

## 誤解しやすい点とトラブルシューティング

- **並べたショットが違う。** Selected ClipsとNeighbor Clipsのどちらを使っているか、Timelineで現在選んでいるクリップを確認します。
- **別のショットが変わった。** 比較表示内の選択状態とClip／Group／Timelineの編集範囲を再確認します。[Shared Nodes](./shared-nodes)を共有していればその影響も調べます。
- **Split Screenボタンが見えない。** Viewerの幅を広げるか、表示モードのメニューを確認します。公式20 Colorist GuideにはViewerが狭い場合にボタンが折りたたまれる例があります。
- **Power Windowの操作形状が見えない。** 比較表示を解除して通常のViewerへ戻し、Windowの表示・選択状態を確認します。比較中のオンスクリーン操作表示は21.1で未検証です。
- **同時表示では合うがカット時に違和感がある。** Split Screenを解除して前後を連続再生します。照明方向や時間帯も含めて判断します。
- **細い境界やノイズが分からない。** 分割すると1フレームの表示領域が小さくなるため、[Power Windows](./power-windows)の境界や暗部ノイズは通常表示で確認します。
- **Viewerでは一致するのに外部モニターでは違う。** Split Screenだけでは表示経路の一致を保証できません。[外部モニタリング](./external-monitoring)と出力変換を確認します。

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（[公式サポート](https://www.blackmagicdesign.com/support)、2026年9月8日公開）。該当章を直接照合できていません。
- **直接確認した公式Web資料：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/products/davinciresolve/color)』「Compare Shots」「Save, Copy and Re-use Grades」「Find Mismatched Shots」（2026年10月23日確認）。Wipe／Split Screen／Gallery／Lightboxの用途を確認。
- **操作例の公式根拠：** Blackmagic Design『[The Colorist Guide to DaVinci Resolve 20](https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-20-Colorist-Guide.pdf)』Lesson 2「Using Split-Screen Views to Compare Clips」（印刷ページ68–69）およびLesson 7「Intermediary Matching Between Clips」（印刷ページ293前後）。公開検索可能な本文抜粋を参照しましたが、PDF全体・該当ページ画像の直接確認は未完了です。
- **verification: partial。** Resolve 21.1実機、正確なモード一覧・順序・表示上限・選択／ダブルクリック挙動、Free／Studio差、外部出力の表示結果は未検証。上記2カメラ／時間変化の例は仮想例です。

関連：[Color QC](../recipes/pre-delivery-color-qc)／[Gallery／Stills](./gallery-stills)／[Scopes](./scopes)。
