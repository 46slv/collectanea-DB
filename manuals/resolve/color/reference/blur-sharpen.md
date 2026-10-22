---
title: ColorページのBlur／Sharpen（ぼかしと輪郭調整）
description: Colorページでぼかしとシャープ処理を使い分け、Windowによる局所処理、ノイズ除去との順序、画質の評価を実例で確認する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Blur Palette, Blur, Sharpen, Power Window, Qualifier, Resolve FX]
tasks: [blur, sharpen, secondary-grading, preserve-detail, troubleshoot]
level: intermediate
updated: "2026-10-22"
---

# Blur／Sharpen：ぼかす範囲と輪郭を強める範囲を決める

顔の周囲を少し柔らかくしたい、背景の文字を目立たなくしたい、商品に映る細い縁をわずかに見せたい。ColorページでのBlur／Sharpenは、こうした**細部の見え方**を調整する処理です。同じ映像のコントラストを上げる操作や、撮影ノイズを取り除く操作とは役割が異なります。

Blackmagic Designの旧版公式教材では、ColorページのBlurパレットにぼかしとシャープの操作が紹介されています。一方、現行の[公式Colorページ](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)は、**Open FX／Resolve FXライブラリにもブラーやシャープニング用プラグインがある**と説明しています。ここではColorページのノード上でぼかし／輪郭調整を考える方法を中心に扱います。個々のResolve FXプラグインの設定表ではありません。

## まず何を変えたいのか

| 目的 | 処理の考え方 | 確認する失敗 |
| --- | --- | --- |
| 肌の細かな凹凸を控えめにする | 必要な部分だけ弱くぼかす | 目、髪、唇まで均一に甘くならないか |
| 背景の情報量を減らす | 背景を選択し、その範囲へぼかしを加える | 人物の輪郭や動きにぼかしが漏れないか |
| 商品の輪郭を明瞭に見せる | 補正後に少量のシャープ処理を試す | 明暗境界に不自然な縁取りが出ないか |
| ノイズの多い暗部を整える | まず[Noise Reduction](./noise-reduction)でノイズを評価する | シャープ処理で粒状ノイズを強調していないか |

Blurは一般に隣接する画素の細かな違いを平滑化するため、輪郭や模様が穏やかになります。Sharpenは輪郭の局所的な差を目立たせますが、**元の映像に存在しない細部を確実に復元する機能ではありません**。ピント外れや強い圧縮で失われた情報を、単純な輪郭強調だけで戻せると考えないでください。

同じ「柔らかくする」処理でも、肌のノイズを減らしたいのか、背景を意図的にぼかしたいのかで適切な手段が変わります。先に対象と目的を分けると、Blurを強め続けて細部を消してしまう失敗を防ぎやすくなります。

## BlurパレットとResolve FXを混同しない

旧版のBlackmagic Design公式資料『The Colorist Guide to DaVinci Resolve 17』では、Colorページの**BlurパレットにSharpenモードがある**ことと、シャープ処理を控えめに用いる考え方を説明しています。これらは旧版の操作体系を確認した根拠です。**21.1 Reference Manualの対応章と21.1実機のパレット配置、モード名、各値域は今回直接確認できていません。** 操作時は実際の画面に表示される項目を優先してください。

一方、公式Color製品ページで確認できるOpen FXの操作は、目的のエフェクトをノードへドラッグし、表示されるInspectorでそのプラグインを調整する流れです。これはColorページの標準パレットにある処理と、呼び出し方も調整箇所も異なります。DaVinci Resolve 21の公式製品案内には新しいResolve FXとしてUltraSharpenも紹介されていますが、本記事のBlur／Sharpenパレットと**同じ効果、同じ操作、同じライセンス条件であるとは扱いません**。

使う前に、現在選んでいるのが次のどちらかを確認します。

- Colorページのパレットから選択ノードのBlur／Sharpenを調整している。
- Open FXライブラリから追加した**個別のエフェクト**をInspectorで調整している。

Open FX側に表示されるパラメータを、そのままパレット側の名称・値域と読み替えないことが重要です。[Color Node Graph](../learn/color-node-graph)で、処理を加えたノードを区別します。

## 操作例1：人物の背景だけを柔らかくする

対談映像で人物は十分に明瞭だが、背景の看板や細かな模様に視線が引っ張られる場面を想定します。背景の存在感を弱め、目や髪の輪郭を維持することが目的です。これは**公式機能に基づく想定手順**であり、21.1の実機結果ではありません。

1. Colorページで対象ショットを開き、基本の露出と色を整えます。元のショットを確認できる状態を残し、新しいシリアルノードを用意します。
2. [Power Window](./power-windows)を使い、ぼかしたい背景を選びます。人物がWindowの外に残るよう、形と境界の柔らかさを調整します。単純な図形では分離できない場合、[HSL Qualifier](./hsl-qualifier)などの選択方法も検討します。
3. 選択したノードでぼかしを少量ずつ加えます。21.1の正確なコントロール名・数値は未照合のため、旧版の数値を入力例として指定しません。
4. Windowの表示を外し、人物の髪・耳・肩と背景の境界を通常映像で確認します。境界が白くにじむ、人物の輪郭だけ急に甘くなる、といった変化があれば範囲と補正量を見直します。
5. クリップを通して再生し、人物が動いても選択範囲が合っているか確認します。移動によってWindowが外れる場合は[Tracker](./color-tracker)で追従を検討します。
6. ノードを一時的に無効化し、背景の情報量が減った一方で人物が自然に見えるか比較します。

**採否例：** 背景の看板は落ち着いたが、人物が手を上げた瞬間に手の縁だけぼけるなら、そのままBlurを弱めるだけでなく、Windowの選択や追従が適切かを先に調べます。ぼかし量とマスクのずれは別問題です。

## 操作例2：商品ショットの輪郭を控えめに強める

金属製品の近景で、ラベルや稜線を少しだけ見やすくしたい場合を考えます。撮影時のピントと実際のディテールを確認してから試します。

1. [Primaries](./primaries-color-wheels)や[Scopes](./scopes)で明暗の基礎調整を終え、シャープ処理専用のノードを分けます。コントラストの変化と輪郭強調の変化を区別するためです。
2. ColorページのBlur／Sharpen関連操作、または目的に合うResolve FXを選びます。**どちらを使うかを決めてから**その画面にある調整項目だけを操作します。
3. まず効果のない状態からごく小さく処理を加え、ラベル文字、光沢の縁、斜めの輪郭を比較します。最初から強い設定を使いません。
4. 明るい金属と暗い背景の境界に、白い線・黒い線のような縁取りが生じないか確認します。細い模様がざらついた場合、強調しすぎた可能性があります。
5. 静止フレームだけでなく動画を再生し、ピントの変化、カメラの動き、圧縮ノイズの目立ち方を確認します。納品解像度でも比較します。
6. 同じノードの有効・無効を切り替え、輪郭が自然に見える利点が、ノイズや縁取りの増加を上回る場合だけ採用します。

**採否例：** ラベルは読みやすくなったが、金属表面の細かな粒や暗部の圧縮ノイズも目立つなら、全体へのシャープを弱めるか、必要な領域だけに処理を限定します。画面の一部だけが目的なら、ショット全体を変える必要はありません。

## Noise Reduction・色調整・Sharpenの順序

暗い素材では、細かな輝度ノイズまでSharpenによって目立つ場合があります。[Noise Reduction](./noise-reduction)を先に評価し、必要ならノイズを抑えてから輪郭調整を試すと、二つの目的を切り分けやすくなります。ただし、これは**検証しやすい作業順の一例**です。全素材・全色管理モードでの唯一の正解という意味ではありません。

例えば「ノイズを抑える → 基本の明暗と色を整える → 選択領域の補正 → 仕上げの輪郭調整」という流れを試します。ノードの処理順が変わると、後段のSharpenが受け取る画像も変化します。先に全体を強くぼかした場合、後段のSharpenを増やしても細かな質感が元どおりに戻るとは限りません。

また、RCMやCSTを使うプロジェクトでは、どの作業空間で処理を行っているかが変わります。見え方を比較するときは[Color Management](../learn/color-management-basics)の入力・作業・出力の条件も固定し、異なる表示変換の結果を同じ補正の効果として比較しないでください。

## よくある症状から確認する

| 症状 | 最初に確認すること | 次の判断 |
| --- | --- | --- |
| シャープを加えると輪郭の周囲に縁取りが出る | ノードの強さと元映像のコントラスト | 処理を弱め、必要な領域へ限定する |
| 髪や文字が全体的に溶けたように見える | Blurが強すぎないか、選択範囲が広すぎないか | Blur量を戻してマスクを再調整する |
| 静止フレームは良いが、再生すると境界が揺れる | Windowの動きと選択範囲 | 複数フレームで追従とSoftnessを見直す |
| 暗部の粒だけが目立つ | Sharpen前後のノイズと圧縮状態 | Noise Reductionと輪郭強調を別ノードで再評価する |
| 全ショットが急に柔らかくなった | 現在編集しているGroup／Clip／Timelineの段階 | [Group Grading](./group-grading)などで適用範囲を確認する |
| 画面上の項目が説明と違う | 標準パレットかResolve FXか、使用版が何か | 21.1実機の表示を優先し、旧版の値を流用しない |

[Gallery／Stills](./gallery-stills)で基準ショットと比較するときも、人物の大きさやズーム条件が違うと輪郭の見え方を誤認しやすくなります。ぼかしとシャープの評価は同じ表示倍率・同じ確認条件で行います。

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** [Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support)には、2026年9月8日公開の『DaVinci Resolve 21.1 Reference Manual』が掲載されています。([PDF](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf))。今回は同PDFのBlur／Sharpen該当章を直接照合できていません。
- **Colorページの現行公式説明：** [Blackmagic Design「DaVinci Resolve — Color」](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)（2026年10月22日確認）。ノードとOpen FXライブラリ、各種ブラー・シャープ系プラグイン、WindowとTrackerの基本的な関係を確認しました。
- **パレットの旧版根拠：** [Blackmagic Design『The Colorist Guide to DaVinci Resolve 17』](https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-17-Colorist-Guide.pdf)「Sharpening Key Elements」。旧版のBlurパレット／Sharpenモードの存在と控えめな処理の考え方を参照しました。21.1の値域やUI配置の証明には用いていません。
- **21世代の追加FX：** [Blackmagic Design公式DaVinci Resolve製品紹介](https://www.blackmagicdesign.com/products/davinciresolve)のResolve FX紹介でUltraSharpenが言及されています。本記事は当該FXのパラメータ仕様やFree／Studioの対応表を扱いません。
- **verification: partial。** 21.1実機のパレット操作、UIの名称・初期値・数値範囲、効果の見え方、Free／Studio差は未検証です。二つの操作例は公式資料で確認できた機能を組み合わせた設計例であり、実機検証結果ではありません。

関連：[Color Node Graph](../learn/color-node-graph)／[Noise Reduction](./noise-reduction)／[Power Window](./power-windows)／[Color Tracker](./color-tracker)