---
title: Color Stabilizer（露出・色の時間変動を補正）
description: Resolve FX Color Stabilizerでショット途中の明るさやホワイトバランスの変化を揃える。分析範囲、基準フレーム、補正方式、注意点を21.1基準で解説。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Color Stabilizer, Region of Analysis, Entire Frame, Selected Area, Analyze Now, What to Stabilize, Stabilize]
tasks: [grade, stabilize-exposure, stabilize-white-balance, troubleshoot]
level: intermediate
updated: "2026-10-24"
---

# Color Stabilizer：ショット途中で変わる露出と色を揃える

撮影中にオート露出やオートホワイトバランスが働き、同じショットの途中で画面が明るくなったり、色温度が揺れたりすることがあります。**Color Stabilizer**は、基準にした1フレームの明るさ・色を解析し、同じクリップの他のフレームをそこへ近づけるResolve FXです。DaVinci Resolve 21.1では**Studio版のみ**で利用できます。

色を一定にしたい素材へ使う機能であり、手持ち撮影の揺れを抑える画像の「スタビライズ」とは別です。また、被写体の一部分だけにグレードを掛ける機能でもありません。**選んだ範囲で変動を測り、クリップ全体の色・明るさを補正する**のが基本です。

以下のコントロール名と動作は、Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）Chapter 156、pp.3545–3546で確認しています。21.1実機での処理結果は未検証です。

## 何を基準に補正するか

Colorページの対象クリップにColor Stabilizerを適用し、画面内の「この見え方に揃えたい」フレームを選んで**Analyze Now**を実行します。以後、クリップを再生すると、解析結果を基準にフレーム間の露出・色の変化が補正されます。

例えば、室内で撮影した人物のショットにオート露出による明暗の揺れがある場合、人物と背景が自然に見えるフレームを基準にします。ただし、窓から差す光や照明演出など、残したい変化まで平坦になるなら分析範囲を見直します。

## 分析範囲：Entire FrameとSelected Area

| Region of Analysis | 解析する場所 | 適した素材 |
| --- | --- | --- |
| **Entire Frame** | フレーム全体 | 画面全体に同じ露出変化・色の揺れが起きているショット |
| **Selected Area** | Viewer上の矩形で囲んだ範囲 | 人や暗い物体の出入りなど、解析を邪魔する変化を避けたいショット |

**Entire Frame**は、基準フレームを表示してAnalyze Nowを実行する最も簡単な方法です。

**Selected Area**にするとViewerへ解析用の矩形が表示され、位置・大きさを調整できます。解析したい被写体が移動する場合は、**FX Tracker**で矩形を追従させてから解析します。領域外で起きる望ましい明るさの変化を、解析から外す目的でも使えます。

Selected Areaは部分補正のマスクではありません。選択矩形は解析値を得る場所であり、補正結果はショット全体へ作用します。

## どの成分を揃えるか

解析後の**What to Stabilize**には、次の選択肢があります。

| 選択肢 | 有効にできる補正 | 判断例 |
| --- | --- | --- |
| **White Balance and Brightness** | Stabilize White Balance／Stabilize Brightnessを個別に選択 | 露出だけが揺れるならBrightness、色味だけならWhite Balanceを有効にする |
| **R, G, B Channels Separately** | Stabilize Red／Green／Blue Channelを個別に選択 | RGBの特定チャンネルの変動を切り分けたい場合 |

**Stabilize**の補正方式は**Levels and Contrast／Offset／Gain**から選べます。同じ素材でも結果が異なり得るため、ある方式で明暗や色が不自然なら別の方式を試し、基準フレームとクリップ全体を比較します。

解析後は**Captured Analysis Values**が表示されます。White Balance and Brightnessでは**Normalized White Balance、Low Level、High Level**、RGBを個別に扱う場合は**各チャンネルのHigh／Low Level**を調整できます。基準の解析値を手動で補うための項目です。

## 最小の確認手順

1. Colorページで露出・ホワイトバランスの揺れがあるクリップを開き、Color Stabilizerを専用ノードに適用します。
2. 明るさと色が適切なフレームへ移動します。画面全体の揺れなら**Entire Frame**、部分的な動きが解析を妨げるなら**Selected Area**を選びます。
3. Selected Areaの場合は矩形の位置と大きさを決め、動く対象ならFX Trackerで追従させます。
4. **Analyze Now**を実行し、**What to Stabilize**で補正したい成分を選びます。
5. ショットの先頭・中間・末尾を再生し、効果を一時的に無効化した状態とも比較します。意図した照明変化が消える、色が逆に揺れる場合は分析範囲か補正方式を変えます。

観察したい結果は、基準フレームに対して**不要な明るさ・色の時間変化が減ること**です。撮影中に実際の照明条件が変わる素材では、すべてを一定にすることが最適とは限りません。

## ノード順と苦手な素材

公式Manualは、ハイライトがクリップしていない素材で結果が良くなると説明しています。Colorページでは、保持したいハイライトをManual記載の「1023以下」に収める調整を先に置き、その後段でColor Stabilizerを適用する構成を推奨しています。この数値はManual内の指針として扱い、すべての色管理・スコープ表示で共通の調整目標だとは解釈しません。

一方で、**完成ルックを作ってからColor Stabilizerを掛けると予測しづらい結果になり得る**とも記されています。必要なハイライト対処を前段で行い、時間変動の補正を済ませてからショットの最終的なグレードを詰めると、処理目的を分けやすくなります。

うまく揃わないときは、次を切り分けます。

- **明るさがまだ揺れる**：Entire Frame内で人物や窓などの占有面積が大きく変わっていないか。Selected Areaの方が一定の参照面を取りやすいか確認します。
- **Selected Areaの結果が不安定**：矩形内の対象が途中で移動・遮蔽されていないか。必要ならFX Trackerの追従を見直します。
- **ハイライトの階調が戻らない**：元の画にクリップがある場合、解析によって失われた情報が復元されるとは期待できません。
- **演出上の照明変化まで消える**：解析範囲を限定するか、適用自体を見直します。
- **全体の階調・色が不自然**：What to Stabilizeの補正対象を減らし、Stabilizeの方式を比較します。

前後の明るさを見るときは[Video Scopes](./scopes)、基準フレームの明暗調整は[Primaries Color Wheels](./primaries-color-wheels)、手動の局所補正が必要なら[Power Windows](./power-windows)を参照してください。

## 出典と検証範囲

- Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*, September 2026, Chapter 156「Resolve FX Color」pp.3545–3546（Color Stabilizer）。2026-10-24に該当箇所を直接確認。
- [Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support) — Reference Manualの配布元。
- [Blackmagic Design：Colorページ](https://www.blackmagicdesign.com/products/davinciresolve/color)

**確認済み**：Studio限定の表記、解析範囲、Analyze Now、FX Tracker、補正対象、補正方式、解析値の項目、ハイライトと処理順の注意。

**未検証**：DaVinci Resolve 21.1 Studio実機でのUI配置・各方式の画質差・速度・追従精度・色管理条件別の挙動。記事の`verification: partial`はこれらを含むためです。
