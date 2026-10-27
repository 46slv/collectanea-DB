---
title: 人物の逆光にハレーションを加え、Bloomと使い分ける（Film Look Creator）
description: Resolve 21.1 StudioのFilm Look Creatorで、人物の明るい輪郭だけをにじませ、ネオン光のBloomや肌への影響を分けて確認するMV制作例。
doc_type: recipe
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Film Look Creator, Clean Slate, Halation, Highlights Only, Bloom, Effects Blend, Color Space Overrides, Scopes]
tasks: [create-look, grade, film-emulation, troubleshoot]
level: intermediate
updated: "2026-10-27"
---

# 逆光の輪郭だけにハレーションを加える

夜のMVで人物の背後から光が当たるとき、輪郭にはフィルムらしい色づいたにじみを残し、背景のネオンは別の広がり方で見せたい場合があります。DaVinci Resolve **21.1 Studio**のFilm Look Creatorには、輪郭周辺の光を扱う**Halation**と、明部の周囲に柔らかい光を広げる**Bloom**があります。同じ「発光」として同時に強めず、役割を分けて仕上げます。

このレシピは公式マニュアルに書かれたコントロールから組んだ**仮想制作例**です。特定の画素や実機で測った効果ではありません。

## 素材と完成条件

想定素材は、Sony FX3でS-Gamut3.Cine／S-Log3、10-bit、UHD 3840×2160、25fpsで撮った約8秒の架空のワンカットです。人物の背後に暖色のリムライトがあり、背景には青いLEDサイン、手前には自然な肌の中間調、暗い髪、白い衣装があります。カメラはゆっくり横に動き、輪郭と光源の重なりが変わります。

プロジェクトはResolve Color Managementを利用し、入力を撮影素材に対応するS-Gamut3.Cine／S-Log3、タイムラインをDaVinci Wide Gamut／Intermediate、出力をRec.709 Gamma 2.4とする**作業条件**です。実素材ではメタデータ、クリップInput設定、納品仕様を確認してください。入力変換を手動CSTで重ねないことも重要です。詳細は[カラーマネージメント](../learn/color-management-basics)を参照してください。

完成条件は、明るい髪と肩の輪郭に控えめなにじみが見え、肌の色や白い衣装が不自然にオレンジへ染まらず、背景の青い看板の形も読めることです。動いている8秒間で効果が突然目立ったり消えたりしないかも判定します。再現するための固定数値は設定しません。

## 1. 基本補正と光学効果を分ける

1. Colorページで対象Clipを選び、独立したSerial Nodeを**基本補正 → Film Look Creator**の順に置きます。[Node Graph](../learn/color-node-graph)を参考に、Group／Timeline側に別のLookが掛かっていないかも確認します。
2. 基本補正ノードで肌の露出・WBと、背後のLEDに残る色の差を整えます。[Scopes](../reference/scopes)のWaveform／RGB Paradeだけで判断せず、Viewerで顔と白い服を見ます。
3. 次のノードへEffects Libraryから**Film Look Creator**を追加します。これは**Studio版のみ**のResolve FXです。エフェクト全般の機能は[Film Look CreatorのReference](../reference/film-look-creator)で確認できます。
4. **Clean Slate**から始め、初期のBlackmagic Film Lookによる色変化を含めずにHalationの効果を比較します。マニュアルでは**Default No Effects**は追加効果を切っても基本フィルムルックが残る一方、Clean Slateはその基本ルックを適用しない設定です。
5. RCMを使うこの例では、Film Look Creatorは既定でタイムラインの色空間を入出力として利用します。手動のdisplay-referred構成で試す場合、同じ設定をそのまま流用せず、**Color Space Overrides**で入力・出力色空間とGammaを明示的に確認します。Overridesの変更自体にトーンマッピングは付きません。

## 2. Halationの輪郭を決める

1. Film Look Creatorの**Enable Halation**をオンにし、最初は**Bloom、Grain、Flicker、Gate Weave、Film Gate**をオフにしておきます。どの処理が変化を起こしたか判断するためです。
2. **Highlights Only**をオンにして、ハレーションの対象を明るい輪郭へ限定した場合を見ます。オフにした場合と比較し、顔の輪郭や暗い衣装まで色づいていないか確認します。
3. **Amount**でにじみの強さ、**Radius**で輪郭から広がる大きさを調整します。最初は効果が分かる程度から増減し、髪の毛の束や肩の境界が識別できるところまで戻します。
4. **Saturation**でにじみの色の濃さ、**Hue**で色方向を調整します。暖色リムライトがあるからといって一律に赤を最大にするのではなく、元の光源と肌・白い衣装を並べて比較します。
5. 先頭、人物がLEDと重なる中盤、終盤を同じ表示条件で確認します。Halationは人物を認識して輪郭を選ぶマスクではないため、明るい別の縁にも作用し得ます。

**期待する見え方：** 元画像のリムライトに沿って輪郭付近のにじみが加わり、白い衣装やネオンの輪郭は保たれる。ただしこれは調整目標です。どの半径・強度で達成できるかは素材と表示環境に依存します。

## 3. 背景の広い光だけBloomと比較する

1. Halationだけを表示した状態を[Gallery Still](../reference/gallery-stills)またはVersionで比較用に残します。
2. **Enable Bloom**をオンにして、**Amount**と**Radius**を小さな変化から試します。Bloomは明部周辺への柔らかな光の広がりを扱い、Halationの色づいた輪郭とは別に評価します。
3. ネオンの広がりが必要でも、文字の輪郭と白い衣装までぼけるならBloomを弱めます。HalationとBloomの両方を一度に強くすると、どちらが輪郭を失わせたか判別しにくくなります。
4. **Effects Blend**で空間的効果をまとめて弱める場合は、Halation／Bloom個別のAmountとは別の調整として扱います。色のLookを混ぜる**Color Blend**とは対象が違います。
5. 青いLEDだけに大きな発光を作る必要がある場合は、[二層Glowでネオンを作るレシピ](./neon-sign-dual-glow)も比較します。Film Look CreatorのHalationだけで光源を個別に分離できるとは限りません。

## 4. 全尺とフレーミングを確認する

1. エフェクトノードを無効／有効にして、同じフレームの髪、肩、顔、白い衣装、LEDを比較します。変化が肌の露出や色にまで及ぶなら、基本補正の問題とHalationによるにじみを区別します。
2. 全8秒を通常速度で再生し、人物が移動して輪郭が背景のLEDに重なる瞬間に、光が大きく膨らんだり不自然に途切れたりしないか確認します。
3. **映像がフレーム全体を満たさない場合**は、HalationやFilm Gateが予期しない結果になると21.1 Manualに記載されています。レターボックスや意図した余白を残す作品では、単にズームして構図を壊さず、Sizing／入力スケーリングと効果適用位置を見直します。
4. 前後のショットと合わせて再生し、発光量が突然変わる箇所と出力側の階調を点検します。[納品前Color QC](./pre-delivery-color-qc)にも接続してください。

## うまくいかない場合

| 症状 | 確認すること | 次の調整 |
| --- | --- | --- |
| 顔や白い衣装まで色づく | HalationのHighlights Only、Amount、Radius、Saturation | 元の肌の色と輪郭を比較し、範囲・強さを戻す |
| 文字の縁が分からなくなる | BloomとHalationを個別にオフにした比較 | 広がり過ぎた側のAmount／Radiusを弱める |
| Effectsをすべて切っても全体の色が変わる | Clean SlateとDefault No Effectsの違い、Color Space Overrides | 基本ルックと色管理の影響を切り分ける |
| 画面端や黒帯付近で変化が不自然 | クリップがフレームを埋めているか、Sizing状態 | 余白・構図を保ったまま処理前後を比較する |
| LUTへ書き出すとにじみが消える | 3D LUT Compatible、LUTが扱える情報 | 空間的なHalation／BloomはLUTへ移せないため別工程を用意する |
| 再生中だけ違和感が出る | LEDとの重なりや照明変化、キャッシュ、前後ショット | 静止画だけで合格にせず全尺を確認する |

## 出典・未検証範囲

- Blackmagic Design, [DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（September 2026）, Chapter 157「Resolve FX Film Emulation」**pp.3560–3564**。2026-10-27に該当ページ本文を直接確認。Studio制限、scene-referred設計、Clean Slate／Default No Effects、Color Space Overrides、Halation（Highlights Only、Amount、Radius、Saturation、Hue）、Bloom、Effects Blend、フルフレームの注意に基づきます。
- 撮影条件、ノード順、評価フレーム、強度の決め方は**制作例として設計した条件**です。Blackmagicが推奨する固定プリセット値ではありません。
- **verification: partial。** Resolve 21.1 Studio実機でのUI操作、S-Log3素材でのレンダー、エフェクトの実際の空間的広がり、Effects Blendの出力比較、Free／Studioの実機差、外部モニターの確認は未実施。画面の見え方や処理速度は保証しません。
