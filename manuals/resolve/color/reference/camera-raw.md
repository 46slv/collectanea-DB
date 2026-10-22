---
title: Camera RAW：撮影データの現像とグレーディング
description: RAW素材のホワイトバランス・露出・ハイライトを調整する判断、ノード補正との違い、カラー管理との整合を解説。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Camera RAW, White Balance, Exposure, Highlight Recovery, Color Temperature, Tint]
tasks: [decode-raw, balance-color, correct-exposure, preserve-highlights, troubleshoot]
level: intermediate
updated: "2026-10-22"
---

# Camera RAW：撮影時の設定を見直す

RAW撮影した素材では、**Camera RAWで現像時の解釈を変更すること**と、**Colorノードで現像後の画像を調整すること**を分けて考えます。両方とも色と明るさに影響しますが、処理する信号の段階が違います。

Blackmagic Designの[Color公式ページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)は、RAWパレットでハイライト復元、ホワイトバランス、ガンマ、露出、色温度、ティント、シャープネスなどを調整できると説明しています。RAW処理は非破壊的で、**ノードエディターへの入力より前**で行われます。撮影時に保存されたRAW情報を再解釈する操作であり、記録されなかったディテールを必ず復元する機能ではありません。

このページはColorページのCamera RAWについて扱います。Fusion ColorノードやPhotoページのRAW処理は別領域です。

## RAWとノード補正の役割

| 目的 | Camera RAWで確認すること | Colorノードで行うこと |
| --- | --- | --- |
| 白の基準を見直す | 現像時のホワイトバランス、色温度、ティント | 現像後の色かぶり補正や局所的な色の調整 |
| 全体の露出を見直す | RAW現像時の露出解釈 | コントラスト、明暗の配分、作品のルック |
| 明部を残したい | RAWに有効な階調があるか、復元機能が適用できるか | LUT／CST／Gain／出力側の影響を確認 |
| 一部分だけ色を変えたい | 全体のRAW解釈をまず整える | [Qualifier](./hsl-qualifier)やWindowで範囲を分ける |
| 他カメラの素材と合わせたい | 各素材のRAWコーデックと撮影メタデータ | 同じ作業・表示条件で[Scopes](./scopes)とStillを使って比較 |

Camera RAWを使った方が常に[Primaries](./primaries-color-wheels)より画質が良い、とは一律に判断できません。現像可能なRAWデータかどうか、後段の色管理、必要な補正に応じて選択します。

### 信号の段階

```text
RAW撮影ファイル／撮影メタデータ
    ↓
Camera RAWによる現像・解釈
    ↓
入力側のカラー管理（プロジェクト設定による）
    ↓
Colorノードによる補正
    ↓
出力側のカラー管理・表示
```

これは**概念上の順序**です。各段階が独立したノードとして並ぶという意味ではなく、色管理モードなどによって処理位置は異なります。[カラーマネージメントの基礎](../learn/color-management-basics)を参照し、RAWからどの色域・ガンマの画像が後段へ届く想定なのかを確認してください。

## パレットを操作する前に

1. **元ファイルがRAWか確認する。** RAW撮影できるカメラでも、受け取った素材が変換済みの動画なら同じRAW現像操作はできません。撮影形式と現在のメディア形式を区別します。
2. **素材に応じた対応範囲を確認する。** 公式Colorページは一般的な機能を説明しています。すべてのRAWコーデックで全項目が有効になるとは限らないため、実際に選択したクリップの項目を確認します。
3. **撮影メタデータと現状を控える。** カメラ、記録モード、ISO、ホワイトバランス、照明、色管理、既存のRAW調整を把握し、変更前の状態に戻れるようにします。
4. **観察対象を決める。** 白シャツ、顔の肌、暗い壁、窓枠などを選び、同じフレーム・Viewer倍率・ノード状態で前後を比べます。
5. **一度に複数段階を変えない。** RAW、RCM／CST、Colorノード、出力変換を同時に変更すると、どこで見た目が変わったか判断できなくなります。

Blackmagic RAW（.braw）について、[公式製品資料](https://www.blackmagicdesign.com/jp/products/blackmagicraw)は撮影時の設定がメタデータとして保存され、DaVinci Resolveで後から編集できると説明しています。これは**Blackmagic RAW固有**の根拠であり、他社のRAW形式に同じメタデータ仕様を一般化しません。

## ホワイトバランスと色温度・ティント

撮影時の白の基準を見直したい場合、RAWのホワイトバランスを確認します。[Blackmagic RAWの公式解説](https://www.blackmagicdesign.com/jp/products/blackmagiccinemacamera/blackmagicraw)は、色温度を撮影後に変更できること、ティントが緑とマゼンタのバランスに関係することを説明しています。

ただし、実際の照明で生じた色まで一律に消すのが目的とは限りません。白いシャツと顔が緑に偏っている場合、撮影時の解釈を確認する価値があります。一方、窓の昼光と暖色の電球が混ざる空間では、全画面を一つの白として補正すると、元の光の印象を失う可能性があります。

### 操作例1：BRAWのインタビューで緑かぶりを調整する

固定カメラの室内インタビューを想定します。白シャツと顔が少し緑に見え、背景の暖色灯は作品の表現として残したい場面です。

1. Colorページで対象のRAWクリップを選びます。公式Colorページが案内する、ツールバー左側のRAWアイコンからCamera RAWパレットを開きます。**21.1の画面上の正確な配置は実機未照合**です。
2. 撮影時のホワイトバランスと現在の解釈を記録し、色温度・ティントの調整がこの素材で利用可能か確認します。
3. 白シャツ、顔、暖色灯を同時に見ながらRAW側の調整を少しずつ試します。[RGB Parade](./scopes)は偏りの観察に使いますが、色付きの照明下の白シャツを無条件に無彩色へ合わせません。
4. 顔と白シャツの緑かぶりが減ったか確認します。背景の暖色まで大きく失われる場合は戻します。
5. RAWの解釈を決めた後、[Primaries](./primaries-color-wheels)で明暗を整え、必要な場合だけ局所的な色調整を別ノードへ加えます。

**採否例：** 人物の不自然な偏りが減り、背景の照明色を保持できたら採用します。白シャツだけ緑なら、RAWの設定ではなく照明の反射や局所的な色かぶりを調べます。これは一次資料に基づく想定手順であり、21.1実機で測定した完成例ではありません。

## 露出とハイライト復元

RAWの露出設定を変更できても、撮影時点で記録できなかった情報を必ず取り戻せるわけではありません。公式ColorページはRAWパレットに露出とハイライト復元の機能があると説明しています。また、[Blackmagic RAW公式資料](https://www.blackmagicdesign.com/jp/products/blackmagiccinemacamera/blackmagicraw)は、同形式でISOなどの設定を撮影後に調整できると説明しています。

明部が白く見える原因は、RAW現像段階、ColorノードやLUT／CST、出力側のトーンマッピング、または撮影時に有効な情報が得られなかったことなどに分けられます。[Colorノードの基本](../learn/color-node-graph)とカラーマネージメントを確認し、白く見えている段階を調べます。

### 操作例2：窓が明るい室内

人物は自然に見えるのに背景の窓が白いBRAW素材を想定します。目的は窓の外を必ず見えるようにすることではなく、**窓枠・カーテン・人物の階調を無理なく保つこと**です。

1. 窓と人物が映るフレームを選び、Viewerと[Waveform](./scopes)で明部・中間調を確認します。
2. 既存のColorノード、LUT、入力・出力変換を確認し、後段の補正が原因で明部が切れていないかを調べます。
3. 対象RAW形式で調整できる場合、露出の解釈を慎重に変更し、窓枠・カーテン・肌の相対的な階調を比べます。
4. ハイライト復元がその素材で利用できる場合だけ試し、変化が得られないときは無理に適用しません。正確な項目名や値域をここでは指定しません。
5. RAW段階の設定を決めてからColorノードでコントラストを整え、出力側も含めて再評価します。
6. 人物が暗くなっただけで外の情報が現れない場合、RAWの変更を戻し、撮影時点の限界と意図したハイライト表現を区別します。

**採否例：** 窓枠と人物の階調が自然に見えるなら採用します。RAW設定を変えても失われた輪郭が現れないなら「復元」できたとは判断しません。21.1実機での結果を示したものではありません。

## カラーマネージメントとの整合

Camera RAWの設定によって現像された結果が、RCMや手動CSTの入力に渡ります。RAW側のガンマ解釈を変更した後、別のカメラLog信号を前提にしたCSTを同じまま使えば、変換の前提がずれる可能性があります。

変換後の見た目が急に変わったときは、RAW現像がどの信号を出力している想定なのか、RCMのInputやCSTのInputに合うか、別のLUTが重複していないかを順に確認します。「カメラがLogで撮った」という情報だけで、現像後の信号も元のLogであるとは判断しません。[カラーマネージメント](../learn/color-management-basics)の区分へ戻して調べます。

### 複数カメラ・複数クリップの扱い

AカメラのBRAWとBカメラの通常動画が混在するとき、BにはCamera RAWでの同じ調整を求めません。各素材を正しく解釈した後に共通の作業空間と表示条件で比較し、[Color Match](./color-match-chart)、[Gallery／Stills](./gallery-stills)、Primariesで差を整えます。BRAW同士でも、撮影時に照明やホワイトバランスが異なるなら、同一設定を無条件にコピーしません。

Blackmagic RAWには埋め込みメタデータのほか、付随する**sidecarファイル**もあります。公式資料では、sidecarは元の.brawファイルを変更せずにメタデータの解釈を上書きできると説明しています。別環境で同じ素材が違って見える場合は、sidecarの有無と色管理の違いを分けて確認します。他形式のRAWにこの仕組みを一律に適用するものではありません。

## 困ったとき

| 症状 | 確認すること | 判断 |
| --- | --- | --- |
| RAW項目が使えない | 元ファイル形式、コーデック、選択クリップ | その素材に利用可能なRAW調整か確認 |
| 色温度を動かすと背景が不自然 | 混在光、反射光 | 全体の白の解釈と局所補正を分ける |
| 露出を下げても明部が戻らない | 記録の限界、ノード、色管理 | 撮影時の欠損と処理上の見え方を区別 |
| RAW調整後に色が大きく変わる | RAW出力ガンマ・色域、RCM／CST | 変換の前提と重複を確認 |
| 別PCでBRAWの見え方が異なる | メタデータ、sidecar、出力管理 | RAW解釈と表示条件を切り分ける |
| 調整の原因が追えない | RAWとノードで同時変更した項目 | 一段ずつ戻して比較 |
| 暗部に斑点や粒がある | 撮影ノイズ、露出変更 | 必要なら[Noise Reduction](./noise-reduction)で別途評価 |

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Designの[サポートページ](https://www.blackmagicdesign.com/support)は『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』を**2026年9月8日公開**と記載しています。Camera RAW該当章・全Controlと21.1実機UIは直接照合できていません。
- **直接確認したColor機能の根拠：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)』の「ネイティブRAWイメージの編集」（2026年10月22日確認）。Camera RAWの場所、一般的な調整対象、ノードより前の非破壊処理を確認。
- **BRAW固有の根拠：** 『[Blackmagic RAW](https://www.blackmagicdesign.com/jp/products/blackmagicraw)』と『[Blackmagic Cinema Camera — Blackmagic RAW](https://www.blackmagicdesign.com/jp/products/blackmagiccinemacamera/blackmagicraw)』（同日確認）。撮影メタデータ、色温度・ティント・ISO、sidecarの説明に使用。
- **`verification: partial`。** 2つの操作例とトラブルシューティングは一次資料に基づく判断例です。21.1実機操作・レンダー、コーデック別の制御項目、初期値、値域、Free／Studio差は未検証です。未確認の数値を示していません。

関連：[カラーマネージメント](../learn/color-management-basics)／[Primaries](./primaries-color-wheels)／[Scopes](./scopes)／[Color Match](./color-match-chart)
