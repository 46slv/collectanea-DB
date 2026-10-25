---
title: 3D Qualifier（線で色を採取して補正範囲を作る）
description: DaVinci Resolve 21.1の3D Qualifierで加算・減算ストロークからキーを作り、モードとMatte Finesseを使い分ける。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Qualifier, 3D, Picker, "Picker +", "Picker -", Highlight, Strokes, Colorspace, Soft, Flat, Tight, Luma, Chroma Tolerance, Chroma Softness, Adaptive Chroma Softness, Matte Finesse, Despill]
tasks: [secondary-grading, isolate-color, matte-refinement, local-color-correction]
level: intermediate
updated: "2026-10-25"
---

# 3D Qualifier：画像に線を描いて色を選ぶ

**3D Qualifier**は、Colorページで色の付いた部分を線でなぞり、採取した色の組み合わせから**補正を適用する範囲（キー／マット）**を作る機能です。たとえば青い衣服の色を調整したいとき、明るい部分と陰の部分を数回なぞり、選択を加減できます。

「3D」は被写体の立体形状を認識するという意味ではなく、色を三次元の色空間内で選ぶ処理を指します。**色を採取するだけでは見た目は変わりません**。作成したキーを同じノードの色補正に用いて、初めて選択範囲の色や明るさが変化します。

以下の操作・設定名はBlackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 137「Secondary Qualifiers」pp.3241–3246、3256–3261で確認したものです。実機操作・素材に対する品質は未検証です。

## HSLやLUMとどちらを使うか

| モード | 選び方 | 初手として適した目的 |
| --- | --- | --- |
| **3D** | Viewer上のストロークから色を追加・除外する | 色が分かるシャツ、空、草木などを手早く抽出したい |
| **HSL** | Hue／Saturation／Lumaの範囲と柔らかさを個別に調整する | 色相だけ、彩度だけなど、条件を細かく制御したい |
| **LUM** | 明るさの範囲で抽出する | シャドウ・中間調・ハイライトだけを選びたい |

3Dは画像から色を素早く集められる一方、HSLのように**色相だけを有効にする**操作には向きません。3Dで複数回なぞっても狙う範囲が取れないなら、[HSL Qualifier](./hsl-qualifier)へ切り替えて条件を絞る方が適切な場合があります。明るさだけが目的ならLUMを選びます。

3Dの**Lumaモード**（後述）は、Qualifierパレットの独立した**LUMモード**とは別の選択肢です。混同しないでください。

## 最小手順：色を選んでから補正する

1. Colorページで対象クリップを開き、[ColorページのNode Graph](../learn/color-node-graph)に二次補正用のシリアルノードを用意します。全体補正と同じノードへ混ぜると、Qualifierによって全体補正まで局所化されるため、分けておきます。
2. **Qualifier**パレットで右上の**3D**アイコンを選び、**Picker**（スポイト）を有効にします。
3. Viewerで抽出したい色の部分を**ドラッグして線を描きます**。選択へ追加する線は**青色**で表示されます。単一画素だけを狙うより、色の変化を含む適度に長い線から始めます。
4. Viewer上部の**Highlight**を有効にし、選択された領域を確認します。足りない色があれば追加の線で採取します。公式Manualは、細かな線を多数重ねるより**2〜3本程度の長い線**から始める方法を勧めています。これは固定上限ではありません。
5. 余計な背景色が含まれたら、**Picker -**でその部分をなぞって選択から除外します。公式Manualのキーボード例では**Optionキーを押しながらドラッグ**して減算します。OS別キー対応は実機未確認なので、迷ったらパレットのPicker -を選びます。減算線は**赤色**です。
6. 左の**Strokes list**に並ぶサンプルを確認します。色パッチをクリックするとそのサンプルを一時的に無効／有効にでき、不要ならゴミ箱アイコンで削除できます。増やし過ぎたストロークをさらに重ねて修復する前に、効いていないものを取り除きます。
7. **Matte Finesse**で穴や境界を調整し、Highlightを解除して[Primaries](./primaries-color-wheels)などで実際の色を変えます。ノードのオン／オフ、前後のフレーム、[Scopes](./scopes)で望まない領域への影響を確認します。

ストロークは**画面上の位置を恒久的に指定するマスクではなく、色のサンプル**です。同じ色の別の場所も選ばれ得ます。被写体の位置で制限したい場合は[Power Window](./power-windows)を併用します。

## ストロークと表示に関する設定

| 項目 | 役割 | 判断の目安 |
| --- | --- | --- |
| **Picker／Picker +／Picker -** | 初期抽出／追加／減算ストローク | 選択の不足か、余計な領域の混入かで使い分ける |
| **Invert** | 選択域と非選択域を反転 | 背景側を処理したい場合などに使う |
| **Show Paths** | 描いた線の表示／非表示 | 画面が見づらい場合に消す。キー自体は変わらない |
| **Auto-B/W Highlight** | ストロークを描く間、自動的に白黒Highlightで選択を表示 | 採取中にキーを確認したいとき |
| **Colorspace** | サンプリング用の色空間をYUV／HSL／HSP／LABから選ぶ | 既定はYUV。結果が悪い場合、Qualifierをリセットして別の選択肢を比較する |
| **Strokes list** | 各線の平均色、加算／減算、オン／オフ、削除を管理 | 必要なサンプルだけ残す |

### 3D Qualifier内の4モード

| モード | 公式Manualが示す性格 | 選び方 |
| --- | --- | --- |
| **Soft** | キーの境界が柔らかく、細かな明暗や色の調整になじみやすい | 顔など、なだらかな照明変化を残したい場合 |
| **Flat** | 採取した色を明確に選ぶ既定モード | グリーン／ブルースクリーンのキーなど |
| **Tight** | 採取した正確な色を狭く選び、自動の柔らかさを付けない | 対象色を厳しく絞り、後からMatte Finesseで整えたい場合 |
| **Luma** | Tightに近い方式で色差を無視する、白黒素材向けの3D内モード | 白黒素材の抽出を検討するとき |

SoftやFlatでうまくいかないからといって、必ずTightが正しいわけではありません。Tightは硬い境界になりやすく、Matte Finesse側の調整を伴う場合があります。

## 色の許容範囲を追加調整する

ストロークで選択を作った後は、色空間の図とその下の明るさの帯を使って、**採取した色の周辺をどこまで選ぶか**を調整できます。

- **Chroma Tolerance**：選択対象に含める色の範囲を広げる／狭める。
- **Chroma Softness**：近い色へ移るときの選択の滑らかさを調整する。
- **Adaptive Chroma Softness**：高彩度・低彩度の両方で動作を安定させるための設定。公式Manualでは通常オンを勧め、Soft／FlatでSoftness調整が難しい場合にオフを試すとしています。Tight／Lumaでは自動的に無効になります。
- **X／Y／Angle**：色空間内で選択した色領域を移動・回転する。
- **Low／High、Low Soft／High Soft**：明るさ方向の選択範囲と境界の滑らかさを調整する。

調整の度にHighlightを確認します。範囲を広げると欲しい色が入る一方、似た色の背景も入りやすくなります。**いま不足しているのが色の範囲なのか、空間的位置の区別なのか**を見極めます。

## Matte Finesseは採取後の仕上げ

サンプル数を増やすだけでマットの穴・点状ノイズ・硬い輪郭をなくそうとすると、かえって境界が扱いにくくなることがあります。

- **Clean Black**：選択しない黒側に残る白い点を減らす。
- **Clean White**：選択する白側の黒い穴を埋める。
- **Blur Radius**：キーの輪郭をぼかす。広げ過ぎると補正領域の周囲にハローが出ることがある。
- **In/Out Ratio**：Blur Radiusのぼかしが内側／外側のどちらへ広がるかを調整する。
- **Pre-Filter**：色を採取する前段で画像のノイズやブロック状の乱れを抑える用途の調整。

まずサンプルの選択が大体合っているかを確かめ、**欠けはClean White、背景の点状ノイズはClean Black、輪郭はBlur RadiusとIn/Out Ratio**の順で原因に応じて調整します。すべての項目を機械的に増やす必要はありません。[KeyパレットとMatte](./key-matte)では、範囲と補正強度を分ける考え方を扱っています。

## 判断例：青いジャケットを背景から分けたい

青いジャケットの彩度を下げたいが、背景に似た青い看板も写っているショットを想定します。

1. 二次補正ノードの3D Qualifierで、ジャケットの明部と陰を含むように青い線を描きます。Highlightで袖や襟まで選べているか確認します。
2. 看板まで選ばれたら、まず看板側を**Picker -**で減算します。ただしジャケットと看板が非常に近い色なら、減算によってジャケットの一部も失われる可能性があります。
3. 色のサンプルだけで両者を分けられない場合は、**Power Windowでジャケットの位置を囲みます**。人物が移動するなら[Color Tracker](./color-tracker)でWindowの追従を確認します。
4. Highlightで輪郭や穴を整え、通常表示へ戻して彩度を少し下げます。顔・背景・ジャケットの陰影に不自然な変化がないか、数フレームを再生して確かめます。

これは**21.1の機能説明から組んだ作業例**であり、ジャケット素材に対する実測結果ではありません。全フレームで選択が安定し、看板に明確な副作用が出ないことを合格条件にします。

## うまくいかない場合

| 症状 | 最初に確認する点 |
| --- | --- |
| なぞってもキーが増えない | 対象ノード、3Dモード、Picker選択、Highlight表示、サンプルの有効状態 |
| 画面の別の場所も選ばれる | 同じ色が画面中に存在するか。色で区別できなければWindow併用 |
| ストロークを増やすほど輪郭が硬くなる | サンプルの重ね過ぎ。不要な線を無効／削除してMatte Finesseへ移る |
| 境界に白い点・黒い穴がある | Clean Black／Clean Whiteを役割別に調整 |
| 輪郭の外へ色がにじむ | Blur Radius、In/Out Ratio、補正量を確認 |
| 明部だけを選びたい | 3Dに固執せず独立した**LUM Qualifier**を検討 |
| 色の抜き取りに緑／青の色かぶりが残る | 3Dの**Despill**はクロマキー用にあるが、通常の彩度調整へ流用する前提にはしない |

## 出典・対象版・検証範囲

- **対象版：DaVinci Resolve 21.1**。Blackmagic Design、[『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)、Chapter 137「Secondary Qualifiers」、**PDF pp.3241–3246「Which Qualifier Do I Use?」「Basic Qualification Using the 3D Qualifier」／pp.3256–3261「3D Qualifier Controls」「Matte Finesse Controls」**。2026-10-25に該当本文を直接確認。
- **配布元：** [Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support)。
- **資料で確認済み：** Pickerの加算・減算、Highlight、Strokes list、4つの3Dモード、Colorspace、Chroma／Luma系調整、Matte Finesse、Despillの用途。
- **未検証：** Resolve 21.1実機でのUI配置・OS別キー操作、Free／Studio差、処理時間、素材ごとのキー精度、動き・ノイズ・色空間設定の違いによる結果。上のジャケット例は検証案であり、実機受入の証明ではありません。**verification: partial**。

関連：[HSL Qualifier](./hsl-qualifier)／[Power Windows](./power-windows)／[Keyパレット](./key-matte)／[Colorページ索引](../)
