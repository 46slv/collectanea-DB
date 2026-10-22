---
title: KeyパレットとMatte（範囲と補正強度）
description: QualifierやWindowで選択した部分へ色補正を適用し、Key Output Gainでノードの効き方を調整する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Key, Key Output Gain, Qualifier, Power Window, Highlight]
tasks: [secondary-grading, matte-refinement, color-correct]
level: intermediate
updated: "2026-10-22"
---

# KeyパレットとMatte（範囲と補正強度）

Colorページの局所補正では、**どこを補正するか**と**どれだけ補正するか**を別々に扱います。[HSL Qualifier](./hsl-qualifier)は色相・彩度・輝度などの条件で画素を選び、[Power Windows](./power-windows)は形と位置で補正領域を限定します。これらによってできる選択情報が**キー／マット**です。Keyパレットは、ノードが作った補正の反映量を調節する際にも使います。

## Matteが表すもの

Matteは画素ごとの補正の通りやすさを表します。概念上、**白は選択、黒は非選択、灰色は部分選択**です。灰色の部分は輪郭をなじませるためにも使われます。実際のノード処理や合成モードごとの演算を、この単純な白黒モデルだけで説明できるわけではありません。

たとえば青いシャツをQualifierで選ぶと、同じ色を含む空や壁も選ばれることがあります。色条件だけで分離できないときは、Windowで位置を限定します。動く被写体なら[Color Tracker](./color-tracker)でWindowを追従させます。Trackerは色の選択を自動で完成させる機能ではありません。

**二次補正のキーと、映像トラックの透明度は同じではありません。** Colorでマットを作っただけで、背景が透明になるとは限りません。アルファを別の合成段階へ渡す構成は、接続と出力方式を別途確認する必要があります。

## Key Output Gainは何を変えるか

Keyパレットの**Key Output Gain**は、標準的なColor補正ノードの効果をまとめて弱めるために使えます。Blackmagic Design公式『The Colorist Guide to DaVinci Resolve 20』は、ノードの効果の不透明度を変える操作として紹介しています。**21.1の全ノードで同じ挙動・数値範囲になることまでは確認していません。**

次の違いが重要です。

| 問題 | 調整すべき対象 |
| --- | --- |
| シャツ以外の青が選ばれている | Qualifierの範囲、必要ならWindow |
| 顔の補正が輪郭で途切れる | WindowのSoftness、Qualifierのマットの境界 |
| 選択は正しいが顔が明るすぎる | 元の補正量、必要ならKey Output Gain |
| 動画の途中で補正が対象から外れる | Trackerの追従、フレームごとの選択 |
| CSTのあとで色が崩れる | 色空間・ガンマ・変換順序の整合 |

Gainを下げても**誤った場所の選択は正しい選択になりません**。また、[カラーマネージメント](../learn/color-management-basics)のための技術的な色空間変換と、見た目を調整するクリエイティブLookは役割が違います。CSTの出力を直すべき場面で、Gainによるブレンドを代用品にしないでください。

## 操作：選択と強さを分けて確認する

ここでは通常のシリアル補正ノードを想定します。21.1固有の細かなUI配置や初期値は未確認です。

1. Colorページで対象クリップを開き、[Node Graph](../learn/color-node-graph)に局所補正用のノードを分けます。全体補正と混ぜない方が原因を追えます。
2. 色で領域を指定するならQualifier、形・位置で指定するならWindowを使います。必要に応じて両者を組み合わせます。
3. Viewerの**Highlight（キーの選択表示）**で、必要な部分が選ばれ、他の部分が除外されているか確認します。境界の穴やまだらも見ます。
4. 選択が外れていれば、Qualifierの範囲・Softness・Matte Finesse、またはWindowの形・Softnessを見直します。動きがある場合は複数フレームを見ます。
5. Highlightを解除して[Primaries](./primaries-color-wheels)などの補正を加えます。まず色・明るさの変化の**方向**を決めます。
6. 方向が適切で効果だけ強い場合、Keyパレットの**Key Output Gain**を調整してノード全体の効き方を比較します。素材に共通する推奨値は固定しません。
7. ノードの有効／無効を切り替え、Viewerと[Scopes](./scopes)で比較します。再生中の輪郭の揺れや背景への影響も確認します。

順番は**選択の適切さ → 境界 → 補正内容 → 補正の強さ**です。先にGainだけを下げると、範囲の誤りを見逃す可能性があります。

## 例1：顔だけを少し明るくする

室内インタビューで顔は暗いが、背景の雰囲気は保ちたいとします。ベース補正とは別のノードで顔よりやや大きい柔らかなWindowを作り、Highlightで補正範囲を確かめます。人物が動く場合はTrackerで追従させ、序盤・中盤・終盤と大きく動く箇所で外れていないか確認します。

次に顔の明るさを調整します。**顔の明るさは良い方向だが補正が強すぎる**なら、Key Output Gainで効きを弱めて比較します。顔の外周に不自然な明暗の輪がある場合は、GainではなくWindowの位置とSoftnessを見直します。合格条件は、再生しても顔だけが突然浮いたり、明るさが跳ねたりしないことです。

## 例2：Lookの色味を穏やかに戻す

全体の露出を整えた後、別のノードで暖色のLookを作ったとします。暖かい印象は狙いどおりでも、肌や白い物体が強く色づくことがあります。

まずLookノードを無効／有効にして、そのノードが原因かを切り分けます。**色の方向が違う**場合はカラーホイールやカーブを修正します。**方向は合っていて強さだけが過剰**なら、Key Output Gainを下げて比較します。肌・白い壁・暗部・ハイライトで違和感が出ないかを見て、ノードの役割を保ちます。

## Node GraphのKey接続とは区別する

ColorのノードグラフにはRGB画像の接続とは別に、**キー用の入出力**があります。公式『The Colorist Guide to DaVinci Resolve 20』はCorrectorノードのRGB接続とKey Input／Outputを区別しています。別ノードで作った選択を受け渡すときはキー接続を使う構成があります。

**KeyパレットでGainを変えることは、キーの配線を追加することではありません。** Key Mixer、外部マット、アルファ出力などの詳細な結線は、本記事で21.1実機確認をしていないため確定手順として扱いません。

## 期待どおりにならないとき

- **Gainを変えても見た目が変わらない**：選択したノードが正しいか、そもそもそのノードに補正があるかを確認します。ノードの有効／無効でも差がないなら、まず補正そのものを点検します。
- **意図しない背景まで変わる**：HighlightでMatteを見直し、色条件だけで難しければWindowを併用します。
- **境界が目立つ**：補正量だけでなく、Softnessやキーの穴、追従ずれを確認します。
- **静止画では自然だが動画でちらつく**：複数フレームのキーを見て、照明変化やTrackerのずれを分けます。
- **背景を透明にできない**：二次補正のキーと、合成用アルファの出力は目的も接続も異なります。

## 出典・対象版・検証範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design [『DaVinci Resolve 21.1 Reference Manual』](https://www.blackmagicdesign.com/support)（公式公開：2026年9月8日）。公開は確認しましたが、**今回の取得環境ではPDFのKeyパレット該当章の本文を直接照合できていません**。
- **機能の直接根拠：** Blackmagic Design [Color公式ページ](https://www.blackmagicdesign.com/products/davinciresolve/color)「Secondary Color Correction」「Target Objects Using Power Windows」「Track and Follow Objects」。選択・形による限定・追跡の基本関係を確認しました。
- **Key機能の補助根拠：** Blackmagic Design [『The Colorist Guide to DaVinci Resolve 20』](https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-20-Colorist-Guide.pdf)。Key Output Gainの役割とRGB／Key接続の区別を参照。**20の資料から21.1の全UI・数値範囲・ノード別挙動を確定しません。**
- **verification: partial。** 21.1実機操作、値の初期状態、Key Mixer／アルファ出力、Free／Studio差は未検証。2つの操作例は学習用シナリオであり、素材を用いた実機受入結果ではありません。

関連：[HSL Qualifier](./hsl-qualifier)／[Power Windows](./power-windows)／[Color Tracker](./color-tracker)／[Node Graph](../learn/color-node-graph)
