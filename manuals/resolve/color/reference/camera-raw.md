---
title: Camera RAW：撮影データの現像とグレーディング
description: Resolve 21.1のCamera RAWでClip／Projectのデコード範囲、WB・露出、複数クリップ反映、Versionsとsidecarの扱いを解説。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Camera RAW, Decode Using, Color Temp, Tint, Exposure, Highlight Recovery, Use Changes, Use Settings, Reset, Revert, Update Sidecar]
tasks: [decode-raw, balance-color, correct-exposure, preserve-highlights, troubleshoot]
level: intermediate
updated: "2026-10-28"
---

# Camera RAW：撮影時の設定を見直す

RAW撮影した素材では、**Camera RAWで現像時の解釈を変更すること**と、**Colorノードで現像後の画像を調整すること**を分けて考えます。両方とも色と明るさに影響しますが、処理する信号の段階が違います。

Blackmagic Designの[Color公式ページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)は、RAWパレットでハイライト復元、ホワイトバランス、ガンマ、露出、色温度、ティント、シャープネスなどを調整できると説明しています。RAW処理は非破壊的で、**ノードエディターへの入力より前**で行われます。撮影時に保存されたRAW情報を再解釈する操作であり、記録されなかったディテールを必ず復元する機能ではありません。

このページはColorページのCamera RAWについて扱います。Fusion ColorノードやPhotoページのRAW処理は別領域です。以降の操作名と適用範囲は『DaVinci Resolve 21.1 Reference Manual』Chapter 7（pp.165–167、170–172）とChapter 130（pp.3135–3140）を直接確認したものです。実機での操作結果は未検証です。

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

## Project全体とクリップ個別のDecode Using

RAWデコードはColorページのノード処理より前、Node Editorの**Source**よりも前に行われます。Project Settingsの**Camera Raw**では、対応RAW形式のプロジェクト共通設定を管理します。一方、Colorページの**Camera Rawパレット**は、選択したRAWクリップの現像設定を個別に変更するための画面です。（21.1 Manual pp.166–167、3135–3137）

1. ColorページのタイムラインでRAWクリップを選択し、**Camera Raw**パレットを開きます。**Mode**は選択クリップのRAW形式に合わせて切り替わり、RAWではないクリップではRAWパレットの項目が無効になります。
2. そのクリップだけ調整する場合、**Decode Using**を**Clip**に変更します。これによりパレットのパラメータが編集でき、Project Settingsの共通RAW設定に対してクリップ個別の値を優先できます。
3. 表示されたパラメータから、対象形式で利用可能な**Color Temp**、**Tint**、**Exposure**などを確認します。利用可能な項目・初期状態はRAW形式で異なるため、別形式の項目や値を当てはめません。
4. プロジェクト全体へ共通する現像方針を変えたい場合は、個別Clipの設定を積み重ねる前にProject Settings側を検討します。ただし既存クリップの個別overrideの有無を先に確認します。

21.1 ManualはMedia／Cut／Editページの**Inspector > Image**にもRAWパラメータを示しています。どの画面から編集したかと、どのスコープへ変更したかを区別します。Project Settings、Clip設定、[Colorノード](../learn/color-node-graph)は同じ操作ではありません。

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

1. Colorページで対象のRAWクリップを選びます。公式Colorページが案内する、ツールバー左側のRAWアイコンからCamera RAWパレットを開きます。**21.1 Manual上の操作面は確認済みですが、実機画面の配置・OS差は未照合**です。
2. **Decode Using > Clip**を選び、撮影時のホワイトバランスと現在の解釈を記録します。色温度・ティントの調整がこの素材で利用可能か確認します。
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
4. 対象形式で**Highlight Recovery**などの機能が利用できる場合だけ試し、変化が得られないときは無理に適用しません。BRAWの**Highlight Recovery**は追加のセンサーハイライト情報を利用する設定で、復元箇所に不自然な色が出る場合があります（21.1 Manual p.172）。標準的なRAW調整の**Highlights**と同名・同動作の項目として扱わず、利用形式と処理結果を確かめます。
5. RAW段階の設定を決めてからColorノードでコントラストを整え、出力側も含めて再評価します。
6. 人物が暗くなっただけで外の情報が現れない場合、RAWの変更を戻し、撮影時点の限界と意図したハイライト表現を区別します。

**採否例：** 窓枠と人物の階調が自然に見えるなら採用します。RAW設定を変えても失われた輪郭が現れないなら「復元」できたとは判断しません。21.1実機での結果を示したものではありません。

## カラーマネージメントとの整合

Camera RAWの設定によって現像された結果が、RCMや手動CSTの入力に渡ります。RAW側のガンマ解釈を変更した後、別のカメラLog信号を前提にしたCSTを同じまま使えば、変換の前提がずれる可能性があります。

変換後の見た目が急に変わったときは、RAW現像がどの信号を出力している想定なのか、RCMのInputやCSTのInputに合うか、別のLUTが重複していないかを順に確認します。「カメラがLogで撮った」という情報だけで、現像後の信号も元のLogであるとは判断しません。[カラーマネージメント](../learn/color-management-basics)の区分へ戻して調べます。

### 複数カメラ・複数クリップの扱い

AカメラのBRAWとBカメラの通常動画が混在するとき、BにはCamera RAWでの同じ調整を求めません。各素材を正しく解釈した後に共通の作業空間と表示条件で比較し、[Color Match](./color-match-chart)、[Gallery／Stills](./gallery-stills)、Primariesで差を整えます。BRAW同士でも、撮影時に照明やホワイトバランスが異なるなら、同一設定を無条件にコピーしません。

Blackmagic RAWには埋め込みメタデータのほか、同じ素材に付随する**.sidecar**ファイルもあります。21.1 Manual pp.170、3139–3140では、sidecarが存在すると、そのメタデータがBRAW内部の埋め込み値に優先すると説明されています。別環境で同じ素材が違って見える場合はsidecarの有無、RAW解釈、色管理を分けて確認します。他形式のRAWにも同じsidecar方式があるとは限りません。

## 複数クリップへRAW調整を反映する

同じRAW形式の複数カットで色温度だけをそろえたい場合、選択中の全パラメータをコピーする必要はありません。21.1 Manual p.3137は二つの反映操作を区別しています。

1. Colorページのタイムラインで、変更対象となるRAWクリップを複数選択します。
2. Camera Rawパレットで現在のクリップを調整します。変更したパラメータの**項目名が琥珀色（amber）**になり、未変更の項目は灰色のままです。
3. **Use Changes**は、琥珀色になった変更項目だけを、選択した別クリップへ反映します。変更していないRAW項目の各クリップ固有の差は保持されます。
4. **Use Settings**は、現在のクリップのRAWパラメータを**すべて**反映し、選択先の既存RAW設定を置き換えます。

例えばA／BカメラのBRAW素材で**Tintだけ**共通の方向へ修正し、ショット別に調整したExposureは残したいなら、Use Changesが候補です。Use SettingsではExposureなど未変更項目まで揃うため、カメラ・露出条件が異なるカットでは避けるか、対象を限定します。この判断例は機能仕様から組み立てたもので、実機で結果を測定したものではありません。

## Versions・グレードコピー・リセット

- **Versionを作るとき**、現在のCamera Raw設定も新Versionへコピーされます。その後はVersionごとにRAW調整を変更できます。同じショットでRAW解釈の案を比べたい場合に利用します。（21.1 Manual p.3136）
- **Stillを保存する／グレードをコピーする場合**、Camera Raw設定も原則としてグレードとともに扱われます。別クリップのRAW解釈を上書きしたくないときは、Galleryのコンテキストメニューにある**Copy Grade: Preserve Camera Raw Settings**を確認します。（pp.3136–3137）
- **Reset**はCamera Rawパレットのパラメータを既定状態へ戻す操作、**Revert**は現在のクリップを最初に選択した時点のRAW設定へ戻す操作です。どちらもOptionsメニューにあり、意味が異なります。（p.3139）

RAW調整を含むグレードを転用する際は、[Gallery／Stills](./gallery-stills)と[Versions](./versions-and-grade-comparison)の違いに加えて、**コピー先のRAW設定を保持するか**を先に判断します。複数クリップへの一括コピーやVersionの実機動作は未検証です。

## BRAWのsidecarをディスクに反映する場合

21.1 Manual pp.3139–3140は、BRAWのRAW Look調整を**Update Sidecar**でsidecarへ書き出す手順を説明しています。これはタイムライン内の補正を切り替えるだけの操作ではなく、**素材に隣接する外部ファイルを更新する**操作です。ほかのBRAW対応アプリが同じsidecarを参照する場合、その見え方にも影響します。

公式手順は、ColorページでBRAWを選択し、Camera Rawパレットの**Decode UsingをClip**に設定してRAW値を調整し、**Update Sidecar**を実行します。既存sidecarを変更してよいか、素材の共有先や引き継ぎ先を確認してから使ってください。この記事のために実ファイルへのsidecar更新は行っていません。

## 困ったとき

| 症状 | 確認すること | 判断 |
| --- | --- | --- |
| RAW項目が使えない | 元ファイル形式、Decode Using、選択クリップ | RAWでない素材では無効。RAWで個別編集する場合はClipを確認 |
| 色温度を動かすと背景が不自然 | 混在光、反射光 | 全体の白の解釈と局所補正を分ける |
| 露出を下げても明部が戻らない | 記録の限界、ノード、色管理 | 撮影時の欠損と処理上の見え方を区別 |
| RAW調整後に色が大きく変わる | RAW出力ガンマ・色域、RCM／CST | 変換の前提と重複を確認 |
| 別PCでBRAWの見え方が異なる | メタデータ、sidecar、出力管理 | RAW解釈と表示条件を切り分ける |
| 調整の原因が追えない | RAWとノードで同時変更した項目 | 一段ずつ戻して比較 |
| 複数カットのRAW設定が想定以上に揃った | Use Changes／Use Settings、選択対象 | 全設定を置き換えていないか比較 |
| 別クリップへグレードを移したらRAWの色まで変わった | GalleryのPreserve Camera Raw Settings | RAW設定を保護したコピー方法を確認 |
| RAW設定を元に戻したい | Reset／Revertの違い、クリップ選択時の状態 | 初期化か選択時へ戻すかを区別 |
| 暗部に斑点や粒がある | 撮影ノイズ、露出変更 | 必要なら[Noise Reduction](./noise-reduction)で別途評価 |

## 出典・対象版・確認範囲

- **一次資料：** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月版）、**Chapter 7「Camera Raw Settings」pp.165–167、170–172、およびChapter 130「Camera Raw Palette」pp.3135–3140**。2026年10月28日に公式PDF本文を直接確認。RAWデコードの処理順、Project／Clipの適用範囲、ModeとDecode Using、Use Changes／Use Settings、Versions、グレードコピー、Reset／Revert、BRAW sidecar更新の項目・手順の根拠です。
- **補助一次資料：** Blackmagic Design『[DaVinci Resolve — Color](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)』と『[Blackmagic RAW](https://www.blackmagicdesign.com/jp/products/blackmagicraw)』。RAWパレットの一般的な用途とBRAWメタデータの概要を参照。
- **`verification: partial`。** 21.1 Manual上の操作名・説明と、想定シナリオの区別を確認しました。Resolve 21.1実機での画面配置・実操作・各RAW形式の実際の項目提供・複数選択の反映結果・VersionとStillのコピー結果・sidecar書き込み・レンダー、Windows／macOS差、Free／Studio差は未検証です。想定例は実測結果ではなく、コーデック別の数値や初期値を一般化していません。

関連：[カラーマネージメント](../learn/color-management-basics)／[Primaries](./primaries-color-wheels)／[Scopes](./scopes)／[Color Match](./color-match-chart)／[BRAW RAW設定のトラブルシューティング](../troubleshooting/braw-raw-settings-copy-scope)
