---
title: 肌の色を整える：Qualifier・Power Window・Scopes
description: HSL Qualifierで肌を選び、Power Windowで背景への波及を避け、Scopesと再生比較で局所的な色かぶりを直す。
doc_type: recipe
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Primaries, HSL Qualifier, Highlight, Matte Finesse, Power Window, Tracker, Scopes, Vectorscope, RGB Parade]
tasks: [skin-tone, secondary-grading, isolate-color, track-window, troubleshoot]
level: intermediate
updated: "2026-10-22"
---

# 肌の色を整える：Qualifier・Power Window・Scopes

顔の頬だけが赤く見える、暖色の背景と一緒に肌の彩度も高くなった、窓光と室内灯の影響で顔の左右に色の差がある。こうした場面で画面全体の色を変えると、衣装や背景の意図まで変わってしまいます。本レシピでは、**基本補正を整えてから、肌の必要な領域だけを二次補正する**方法を扱います。

DaVinci Resolve Colorページでは、HSL Qualifierが色相・彩度・輝度で領域を選び、Power Windowが位置と形で範囲を限定し、TrackerがWindowを動きに合わせて追従させます。Scopesは補正前後の信号変化を確認するために使います。各機能の基本用途は[Blackmagic Design公式Colorページ](https://www.blackmagicdesign.com/products/davinciresolve/color)で確認できます。この手順を実行した21.1実機の観測結果ではありません。

## 例：夕方のインタビューを補正する

夕方の室内で人物が話すショットを考えます。顔の片側には窓光、反対側には暖かな室内灯、背後には肌に近いオレンジ色の壁があります。基本補正の後も頬がやや赤く、唇の血色と顔の立体感は残したい状態です。

完成条件は、頬の不自然な赤みが減り、窓光と室内灯による陰影を保ち、壁や衣装・髪・唇に目立つ副作用がなく、クリップを再生してもキーの境界が見えないことです。**すべての人物の肌を同じ色や固定の数値に合わせることは目的ではありません。**

## 1. まず全体のグレードを整える

1. Colorページで対象クリップを開き、元の映像と現状のグレードを比較します。[カラーマネージメント](../learn/color-management-basics)により、Inputの色空間・ガンマの解釈、RCMとCSTの二重変換などを確認します。
2. [Primaries](../reference/primaries-color-wheels)で露出とホワイトバランスを整えます。窓側の寒色と室内灯の暖色が演出なら、その差を無理に取り除きません。
3. [Scopes](../reference/scopes)のWaveformやRGB Paradeで明るさ・色成分の変化を見ます。背景に赤い物が多ければ、Parade全体で赤成分が高くても肌の異常とは限りません。
4. 頬だけにまだ過度な赤みがある場合、[Node Graph](../learn/color-node-graph)で肌の二次補正用シリアルノードを分けます。基礎補正を変更せず、肌用ノードのみ無効化して比較できるようにします。

**判断例：** 顔と白いシャツが同時に青い場合は、肌を抽出する前に入力変換や全体バランスを再確認します。一方、シャツは正常で頬だけ赤いなら局所補正を検討します。

## 2. HSL Qualifierで肌の候補を選ぶ

1. 肌用ノードで[HSL Qualifier](../reference/hsl-qualifier)を開き、頬の代表的な部分をスポイトでサンプルします。明部と影部の色が違う場合は、必要な画素範囲を追加でサンプルします。
2. Viewerの**Highlight**を有効にして、額・頬・耳・首のうち必要な領域が選ばれるか確認します。**背後のオレンジ色の壁まで選ばれていないか**も点検します。
3. Hue／Saturation／Lumaの範囲を調整します。範囲が狭すぎると肌がまだらに抜け、広すぎると壁や衣装まで選ばれます。唇や反射を必ず同じキーに含める必要はありません。
4. マットに穴や点状の混入がある場合は、Matte FinesseでClean Black／Clean Whiteや境界の柔らかさを検討します。単に強いBlurを加える前に、色の選択自体が適切か確認します。
5. Highlightを解除して通常表示に戻し、背景との関係を確認します。

HSLは人物の肌を意味的に認識する選択機能ではありません。似た色相・彩度・輝度の画素なら背景も選ばれます。Highlightの形がきれいでも、色補正が自然とは限りません。

## 3. Power Windowで背景への波及を抑える

1. 同じ肌用ノードで[Power Window](../reference/power-windows)を追加し、顔の周辺へ配置します。頬の輪郭を硬く切り取るより、必要な部分を覆い、境界が周囲になじむ形を探します。
2. WindowとQualifierを併用した結果、壁や衣装へ補正がかからないことをViewerで確認します。OutsideやKeyの設定を変更したノードでは適用側が変わるため、現在の効果を目視で確認します。
3. 頬は補正されても耳や首だけ元の色が残るなら、Qualifierの色域が狭いのかWindowが小さいのか切り分けます。
4. 顔が動く場合は[Tracker](../reference/color-tracker)でWindowの追従を解析します。冒頭・中間・終盤、顔が横向きになる時点や手が顔に重なる箇所を確認します。

トラッキングが完走してもマットの形や補正量まで適切になるわけではありません。追跡精度と色の選択は別々に点検します。

## 4. 少しずつ補正し、Scopesで確認する

Highlightを解除し、肌用ノードのPrimariesやカーブを用いて赤みの印象を小さく調整します。肌の色相、彩度、明るさのどれが問題なのかを分けます。固定の色相角度やIRE値は指定しません。

| 症状 | 試す方向 | 確認する副作用 |
| --- | --- | --- |
| 頬が赤すぎる | 色相・バランスをわずかに変える | 肌の血色や照明の暖かさが消えないか |
| 彩度だけ強い | 選択範囲の彩度を弱める | 唇や影が灰色にならないか |
| 顔の一部が暗い | 必要な領域の明るさを調整する | 陰影の立体感を失わないか |
| 顔の縁に色の輪が出る | 選択境界と補正量を別々に確認する | 境界が動画中に浮かないか |

[Vectorscope](../reference/scopes)では補正による色相・彩度の分布の変化を確認します。ただし、画面全体のScopeは顔だけを計測していません。背景が大きければ肌の局所補正がScopeで小さく見えても不自然ではありません。肌色の参照線を表示できる環境でも、あらゆる人物をその線に一致させることを合格条件にしません。光源、肌の個人差、色管理、作品意図を優先します。

## 5. 再生して採否を決める

1. 肌用ノードの有効／無効を比較し、額・頬・鼻・耳・首・唇の色が不連続にならないか確認します。
2. 動画を通して再生します。顔が動くときにマットがずれる、影が横切ると斑点が出る、輪郭に色の帯ができるなら完成ではありません。
3. 壁、衣装、髪、窓の反射が目的外に変わっていないか確認します。
4. [Gallery／Stills](../reference/gallery-stills)で元のグレードと比較し、同じ人物の隣のショットへつないで見ます。撮影光が異なるカットまで同じRGB値に合わせません。
5. 効果が強ければ[Keyパレット](../reference/key-matte)の考え方で強度や選択を見直します。21.1のUI項目や具体値は実機未照合です。

**採否例：** 静止画で頬は自然でも、振り返った瞬間だけ赤い斑点が浮く場合は、HSL選択とWindowの追従を調整します。それでも不自然なら局所補正を弱めるか採用しません。

## 背景と肌の色が重なる場合

壁と肌の色域がほぼ同じなら、HSLを極端に狭めるほど肌がまだらになりがちです。Windowで顔周辺を限定し、緩やかなキーで弱い色補正を試します。境界が目立つ場合はWindow中心の明暗補正へ切り替えるか、二次補正自体を見送ります。複数人が写るショットも、全員を一つの肌色へ強制せず、照明条件と目的に応じて補正を分けます。

## よくある症状

| 症状 | まず見ること | 対応 |
| --- | --- | --- |
| 壁まで変色する | Highlightで背景が選ばれていないか | WindowとHSL条件を再確認 |
| 頬がまだらになる | 影・明部がキーから抜けていないか | Range／Matte Finesseを見直す |
| 顔の輪郭に色の帯が出る | WindowのSoftness、補正量 | 境界と強度を別々に調整 |
| 顔が動くと色が外れる | Trackerの追従と遮蔽 | 問題区間を再点検 |
| 唇が灰色になる | 唇が同じキーに入っていないか | 選択域と彩度補正を修正 |
| カット間で顔が合わない | 入力変換、露出、異なる光源 | 局所補正前に全体条件を比較 |
| キーがちらつく | HSL閾値、ノイズ、動くWindow | [二次補正のちらつき](../troubleshooting/secondary-matte-flicker)を参照 |

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design[『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（2026年9月8日公開）。この執筆時点で該当章の本文や21.1実機の操作は直接照合できず、UI配置・パラメータ値域・Free／Studio差の確定根拠としていません。
- **基本機能の直接根拠：** Blackmagic Design[「DaVinci Resolve — Color」](https://www.blackmagicdesign.com/products/davinciresolve/color)（2026年10月22日確認）。「Balance Image Color」「Work with Nodes」「Secondary Color Correction」「Target Objects Using Power Windows」「Track and Follow Objects」「Professional Scopes」を確認しました。
- **verification: partial。** 本文は公式機能に基づく想定レシピで、21.1実機の成功例ではありません。数値の推奨値、実素材での追従精度、すべての色管理方式、エディション差は未検証です。

関連：[HSL Qualifier](../reference/hsl-qualifier)／[Power Window](../reference/power-windows)／[Tracker](../reference/color-tracker)／[Scopes](../reference/scopes)
