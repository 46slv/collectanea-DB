---
title: Color Matchとカラーチャート（撮影基準から色を合わせる）
description: Colorページでカラーチャートを使ったColor Matchの操作、色管理上の注意、Shot Matchとの使い分けを解説する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Color Match, Color Chart, Source Gamma, Target Gamma, Target Color Space, Shot Match]
tasks: [color-match, balance-color, match-shots, troubleshoot]
level: intermediate
updated: "2026-10-22"
---

# Color Matchとカラーチャート：撮影基準から色を合わせる

複数カメラで撮ったインタビューの人物や衣装が異なる色に見えるとき、撮影時にカラーチャートを記録していれば、Colorページの**Color Match**を初期補正の候補にできます。チャートの既知の色パッチを使い、撮影素材の色と階調を整えるための機能です。

ただし、Matchの実行だけでは最終的な色の正しさや、ショット間の一致は保証されません。チャートの照明条件、画面内でサンプルする位置、カラーマネージメントによる画像の変換段階が結果に関係します。補正前後を[Scopes](./scopes)とViewerで比較し、必要なら[Primaries](./primaries-color-wheels)で調整します。

Blackmagic Designの[現行Color製品ページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)は、チャートが写っているショットでColor Matchパレットを開き、チャートの種類を選んで映像上に重ね、Matchを実行する基本手順を紹介しています。本記事はこれに公式20教材の色管理上の説明を組み合わせています。**21.1の該当マニュアル本文と実機画面は未照合**です。

## Color Match／Shot Match／Auto Colorの違い

| 機能 | 比較する基準 | 典型的な用途 |
| --- | --- | --- |
| **Color Match** | 撮影された既知のカラーチャート | チャートがあるカットの初期較正 |
| **Shot Match** | 別のショットの見た目 | 近いショット同士を合わせる初期案 |
| **Auto Color** | 対象ショットの画像内容 | そのカットの自動バランス案 |
| **Primaries** | 人が定めた露出・色の基準 | 自動処理後の調整や手動での基準合わせ |

公式Colorページでは、Shot Matchは編集中のクリップと別クリップの色・コントラスト・明るさを合わせる操作、Color Matchは**カラーのチップチャートを使う操作**として別々に説明されています。したがってチャートのない2ショットをColor Matchだけで一致させることはできません。その場合は[Gallery／Stills](./gallery-stills)を基準にした比較や、[ショットマッチングRecipe](../recipes/matching-multicamera-interview)が適しています。

## Matchを実行する前に確認すること

### 1. チャート自体が基準になっているか

撮影した実物のチャートのメーカー・種類・世代を確認します。似た配色だからといって別の種類を指定すると、パレットが期待する色と実際のパッチが対応しなくなります。

チャートは、補正したい被写体とできるだけ同じ照明条件で記録されている必要があります。同じ部屋でも窓の直射を受けるチャートと、暖色灯の下にある顔は同じ条件ではありません。また、カメラの設定・照明・露出が途中で変わった場合、撮影冒頭のチャートが全尺を代表するとは限りません。

撮影時にチャートがなかった素材へ別撮影のチャート映像を置いても、その素材固有の撮影条件を測定したことにはなりません。過去の別シーンのチャートを安易に代用しないでください。

### 2. サンプリングできるフレームか

色パッチが鮮明で、反射や指、影、ブレが重ならないフレームを選びます。白いパッチが極端に白飛びしていたり、暗いパッチがつぶれていたりすると、元の階調情報が失われている可能性があります。Color Matchは、撮影時に存在しなかった情報を作り直す手段ではありません。

Blackmagic Design『The Colorist Guide to DaVinci Resolve 20』の操作例では、Viewer上の**Color Chart**オーバーレイを四隅で合わせ、内側の小さなサンプル領域を各パッチの中央に重ねます。黒い縁や指がサンプルに入らないことも確認します。21.1での正確なコントロール配置は別途実機確認が必要です。

### 3. Color Matchへ届く信号は何か

記録ファイルのLog／ガンマと、Color Matchが処理する時点のガンマが必ずしも一致するとは限りません。[カラーマネージメントの基礎](../learn/color-management-basics)で、Project Settings、RCM、入力変換、ノード内のCSTなどを先に整理します。

Blackmagic公式20教材は、**Source Gamma**をColor Matchが受け取る段階の信号に合わせる考え方を説明しています。色管理されていない素材なら記録時のガンマが判断の出発点ですが、RCMやCSTですでに変換している場合は、処理段の信号に合わせます。カメラでLog記録したという理由だけでSourceをそのLogに固定しないことが重要です。

| 項目 | 設定を考える基準 | 避けたい誤り |
| --- | --- | --- |
| **Source Gamma** | パレットに届く段階の信号のガンマ | 入力変換後なのに元のLogをそのまま指定 |
| **Target Gamma** | その段階で必要な出力側の階調表現 | 最終納品設定だけを見て決める |
| **Target Color Space** | 作業中の色域・後段の変換との整合 | ガンマと色域の役割を混同する |
| **チャート種類** | 撮影された実物に対応する種類 | 似ている別チャートを選ぶ |

公式20教材では、ノード内CSTでDaVinci Intermediateへ変換済みの作業例において、Source GammaとTarget Gammaを同じDaVinci Intermediateに指定します。この例では追加のLog変換ではなく、撮影環境の色の較正を行うためです。これは**その教材の処理構成に応じた設定例**であり、すべてのプロジェクトに適用する値ではありません。

## 操作例1：インタビューのチャートから初期補正する

室内の人物を撮影したAカメラで、冒頭に同じキーライトの下で撮ったチャートがあるとします。Aのホワイトバランスに軽い偏りがあり、チャートを使って補正してから人物ショットを仕上げたい場面です。

1. ColorページでAのクリップを選び、パッチに反射や影がないフレームへ移動します。最初にViewerと[Scopes](./scopes)で白・黒・RGB各チャンネルの状態を把握します。
2. [Node Graph](../learn/color-node-graph)で既存の補正と入力変換を確認します。既存ルックの後段で較正するのか、作業信号の前段で行うのかを曖昧にしたまま進めません。
3. Color Matchパレットを開き、**撮影した実物に合うチャート種類**を選択します。現行製品ページの基本操作に基づきます。21.1のパレット位置や全プリセット名は未確認です。
4. ViewerのColor Chartオーバーレイを表示し、四隅を実物に合わせます。各小さなサンプル枠が色パッチの中央に重なり、チャートの外縁や指、影を含まないことを確認します。この詳細は公式20教材の操作例です。
5. Source／TargetのガンマとTarget Color Spaceを、現在の色管理とその処理段の信号に照らして決めます。特定の数値を機械的にコピーしません。
6. **Match**を実行し、補正前後のViewerとRGB Parade・Waveformを比較します。極端な変化や反対方向の色かぶりが生じたら、さらに補正を重ねる前にチャートの種類、サンプリング、ガンマ設定を見直します。
7. チャートのない本編に戻り、人物の肌、白シャツ、背景の暗部、ハイライトを評価します。必要なら別ノードでPrimariesを使い、撮影意図に沿って追い込みます。

**判断例：** チャートは自然な色に見えても人物だけが緑色なら、人物とチャートに違う光が当たっていないかを先に確認します。チャートに反射や混色光が入っていたなら、その結果を最終基準にしない方が適切な場合があります。

この操作例は公式資料に記載された機能から組み立てた**想定手順**です。21.1実機で完成確認したものではありません。

## 操作例2：A／Bカメラの人物色を比較する

同じインタビューをA・Bの2台で撮影し、それぞれが同じ場所でカラーチャートを記録した場面を考えます。Bはカメラ固有の色の傾向や露出がAと異なります。

1. A／Bそれぞれの記録形式と入力変換を確認し、比較可能な表示条件にそろえます。撮影時刻やライトの向きが違うチャートを「同じ条件」とは仮定しません。
2. AをA自身のチャートでColor Matchし、人物ショットの基準フレームを[Gallery／Stills](./gallery-stills)に記録します。元の補正状態とも比較可能にします。
3. Bも**B自身のチャート**で同じ手順を試します。AとBでSource Gammaなどの条件が異なるなら、Aの設定値を単純コピーしません。
4. A／Bの人物ショットを切り替えて、肌の中間調、白い壁、背景の彩度、ハイライトをViewerとScopesで比較します。チャートが一致しても、照明角度や被写体の反射の違いが残る場合があります。
5. Bの顔がAより暗ければ、露出の違いか、チャートの条件や色管理の問題かを切り分けます。必要に応じてPrimariesで補います。全カットに同じルックをかける前に基礎バランスを評価します。

**採用判断：** 白壁の色は近づいた一方でBの顔だけが赤いとき、B全体の赤を大きく下げる前に照明と反射色を確認します。局所的な補正を行うなら[HSL Qualifier](./hsl-qualifier)などを後段で検討します。Color Matchだけで複数センサーの描写が完全に同一になると期待しません。

## よくある失敗と確認先

| 症状 | 確認する項目 | 見直し方 |
| --- | --- | --- |
| Match後に色が極端に変わる | Source Gamma、RCM／CST、Target設定 | 現在の信号と重複変換を確かめる |
| 明るさが想定以上に変わる | チャートの露出、パッチの飽和、ガンマ | サンプルが有効かを先に確認 |
| 色パッチが大きくずれる | チャートの種類、四隅、サンプル枠 | 実物とプリセット、位置を再照合 |
| 肌だけ不自然な色になる | チャートと人物の照明、反射、混色光 | 同じ照明基準として扱えるか判断 |
| Aは合うがBが合わない | 各カメラの記録形式と色管理 | 別カメラの設定を無条件に流用しない |
| 本編に戻すと合わない | チャート撮影後の照明・露出変化 | チャートが代表する区間を限定 |
| Shot Matchと結果が違う | チャート基準か別カットの見た目基準か | 目的に合う比較方法を選ぶ |

Matchの成功表示やチャートの一見した一致は、正しい測色や全シーンの補正完了の証明ではありません。元映像と補正後を比べ、人物や背景が意図した表現を維持するか判断します。

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design [『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（2026年9月8日公開）。大容量PDFを直接取得できず、**21.1のColor Match該当章・画面・全パラメータは未照合**です。
- **現在の機能説明：** Blackmagic Design [『DaVinci Resolve — Color』](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)の「自動バランスおよびマッチング」（2026年10月22日確認）。Color Match／Shot Match／Auto Colorの区別、チャート種類の指定、重ね合わせ、Match操作の根拠です。
- **詳しい公式教材：** Blackmagic Design [『The Colorist Guide to DaVinci Resolve 20』](https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-20-Colorist-Guide.pdf)、Lesson 7「Using Groups」。Color Chartオーバーレイ、サンプルの合わせ方、Color MatchでのSource／Target設定と色管理の関係を説明しています。**20の画面や設定例を21.1の確定仕様として扱っていません。**
- **verification: partial。** 本記事の操作例は公式資料に基づく判断例で、21.1実機レンダーや全UI操作は未検証です。21.1でのコントロール位置、全選択肢、初期値、精度、Free／Studio差は推測していません。

関連：[Scopes](./scopes)／[Primaries](./primaries-color-wheels)／[カラーマネージメント](../learn/color-management-basics)／[Gallery／Stills](./gallery-stills)／[ショットマッチングRecipe](../recipes/matching-multicamera-interview)
