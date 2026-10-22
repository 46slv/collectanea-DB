---
title: 3カメラのインタビューをショットマッチングする
description: Colorページでカメラの異なるインタビューショットを基準Still、Scopes、Wipe、Lightboxで比較し、カット間の露出と色を整える手順。
doc_type: recipe
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Primaries, Scopes, Gallery, Still, Apply Grade, Image Wipe, Split Screen, Lightbox]
tasks: [shot-matching, match-shots, balance-image, compare-shots]
level: intermediate
updated: "2026-10-22"
---

# 3カメラのインタビューをショットマッチングする

同じ人物を3台のカメラで撮影しても、カメラの設定、レンズ、照明の当たり方、構図の違いでカットを切り替えた瞬間に明るさや肌の色が変わって見えることがあります。このレシピでは、**自然に見える1ショットを基準にし、他の2ショットをカット間で比較しながら整える**手順を扱います。

使うのはColorページのPrimaries、Scopes、GalleryのStill、Image Wipe／Split Screen、Lightboxです。個々の機能はBlackmagic Designの[Color公式ページ](https://www.blackmagicdesign.com/products/davinciresolve/color)で説明されています。手順の組み合わせと判断例は制作ワークフローとして再構成したもので、DaVinci Resolve 21.1実機での完了結果ではありません。

## 想定する素材と完成条件

同じ部屋のインタビューを、A＝正面、B＝斜めの寄り、C＝引きで編集しているとします。Aの肌と白いシャツは自然、Bは顔が少し暗く青みがあり、Cは背景の照明が暖かく見えています。3ショットの明るさを完全に同じ数値へそろえることは目的にしません。

完成条件は次の3点です。

1. A→B→Cと編集順に再生しても、顔の明るさと色に不要な跳びがない。
2. シャツなど同じ被写体の見え方がおおむね連続し、意図的な暖色照明や陰影は残っている。
3. 他ショットのグレードを流用した場合でも、各クリップの入力変換、WindowやTracker、ノード構成に意図しない影響が残っていない。

## 1. 比較する前に、変換条件をそろえる

まず3ショットの収録方式と入力色空間・ガンマを確認します。たとえばAはすでにRec.709へ変換された素材、BとCはカメラLogという場合、変換前の信号をそのまま比べても正しいマッチング判断にはなりません。

[カラーマネージメントの基礎](../learn/color-management-basics)を参照し、各素材のInputと共通のTimeline／Output、またはノード内CSTの責任を把握します。RCMで管理しているのに同じ変換をノードへ重ねていないかも確認してください。**入力の解釈が違う問題は、肌の色を手作業で追い込む前に解決**します。

スコープの読みもカラー処理と表示条件に依存します。ここではIREやRGBの固定目標値を指定しません。比較は同じプロジェクトと出力条件で行います。

## 2. Aカメラで基準を作り、Stillへ保存する

1. ColorページでAを選び、顔とシャツが見え、照明の急変がないフレームに移動します。
2. [Scopes](../reference/scopes)のWaveformで顔・シャツ・背景の明暗分布を確認し、RGB Paradeで色成分の関係を見ます。画面全体のRGBが一致するかだけでホワイトバランスを判断しません。
3. [Primaries](../reference/primaries-color-wheels)で明るさ、色の偏り、コントラストを必要な範囲で整えます。顔を明るくすると窓やシャツが不自然になる場合は、明部も同時に確認します。
4. Viewerを右クリックしてStillを作成します。Galleryのアルバムで、このStillがAの基準だと分かるようにします。

Stillは比較するフレームとグレードを保持するために使います。別のクリップへ適用する機能については[Gallery／Stills](../reference/gallery-stills)も参照してください。**Stillを作っただけでBとCが一致するわけではありません。**

## 3. Bの露出・色温度をAに近づける

1. Bを選び、Aと似た表情・顔の向き・照明のタイミングを含むフレームを探します。構図が異なる場合、背景全体の面積を同じにする必要はありません。
2. Galleryに保存したAのStillを使い、必要なら**Apply Grade**でAのグレードをBへ適用します。適用後は[Node Graph](../learn/color-node-graph)を見て、コピーされたノードや局所補正がBに適切か確認します。カメラや入力変換が違う場合は、無条件にコピーを採用しません。
3. Bの顔がAより暗ければ、Primariesで中間調を中心に調整し、WaveformとViewerで改善を確認します。顔を明るくした影響が白いシャツや背景にどう出たかも見ます。
4. Bのシャツや肌が青く感じられるなら、RGB ParadeとViewerを併用して色の偏りを調べます。ただし壁や照明の色まで無彩色へ戻さないようにします。
5. **Image Wipe**でAのStillなどの比較画像とBを並べ、顔・シャツ・壁など、共通して写る要素を見比べます。表示モードは用途に合わせて選択し、画像位置が異なる場合は輪郭の完全一致を判定基準にしません。
6. Bの補正を一時的に無効化するなどして、何を変更したか確認した後、A→Bのカットを実際に再生します。

コピーしたグレードに[Power Window](../reference/power-windows)や[Tracker](../reference/color-tracker)が含まれていれば、Aの位置・動きをBにそのまま適用できるとは限りません。Bに不要な局所補正があれば、その役割と範囲を再評価します。

**判断例：** Bの顔が暗いので全体を大幅に持ち上げると、背後の窓まで不自然に明るくなる場合があります。そのときは全体補正の量を戻し、顔の見え方と背景の意図を分けて考えます。窓をAと同じ明るさにすることは、この撮影条件では完成条件ではありません。

## 4. Cの暖かな背景を残し、人物を合わせる

Cは引きの構図で背景の暖色照明が広く写るため、RGB Paradeの全体分布がAと違っていても不自然とは限りません。

1. AのStillを参照して、まずCに写る**同じ人物**の顔とシャツの見え方を比べます。
2. 顔が暖色照明を受けているなら、その光まで完全に取り除くべきか、編集上の連続性と照明の演出から判断します。
3. Primariesで露出・色バランスを調整し、ViewerとScopesで補正による変化を確認します。
4. A、B、Cを**Split Screen**などで並べ、顔がカットごとに極端に暗くなったり、シャツが不必要に青／黄へ変わったりしていないかを確認します。
5. C単体を整えた後、B→C→Aの順でも再生します。隣り合うカットの違和感が少ないかを確かめます。

この例では、暖色の背景をすべてニュートラルにするより、人物の連続性を先に整える方が狙いに合っています。色を「一致」させる対象は画面の全画素ではなく、**作品内で連続して見せたい要素**です。

## 5. Lightboxと再生で最終確認する

Blackmagic Design公式Colorページによれば、Lightboxはタイムラインのクリップを適用済みグレードのサムネイルとして並べる機能です。Viewerでの細部比較だけでは気づきにくい、シーン全体の色の流れを見るのに使います。

1. Colorページ右上からLightboxを表示します。
2. A／B／Cを含む場面を一覧し、1ショットだけ顔や背景が大きく浮いていないか探します。
3. 気になるサムネイルを選び、Lightboxを閉じてそのクリップへ戻ります。必要な調整を行ったら再び一覧します。
4. 最後は編集した順序で通常再生し、人物の肌、シャツ、背景の明暗が**カットごとに不自然に変化しないこと**を確かめます。静止画だけで完了としません。

比較するフレームや照明のタイミングが異なれば、Scopesの形や色の分布が違うのは当然です。見た目・客観的な信号・場面の意図を合わせて最終判断します。

## 似た機能との使い分け

| 手段 | このレシピでの役割 | 注意点 |
| --- | --- | --- |
| Still／Apply Grade | Aの補正をB・Cの初期候補へ渡す | コピー先でクリップ固有の再調整が必要 |
| Image Wipe | 2つの画像を細かく比較する | 構図の違いを同じ画素位置の差と誤解しない |
| Split Screen | 複数ショットの連続性を一覧で比較する | 光源や背景の意図的な差は残してよい |
| Scopes | 明暗・RGB・色相と彩度の傾向を確認する | 分布が同じことは正しい見た目の十分条件ではない |
| Lightbox | 全カットのバランスと補正漏れを探す | サムネイル判断後に通常再生でも確認する |

公式Colorページには**Auto Balancing and Matching**と「Shot Match to This Clip」も案内されています。自動マッチングは比較の出発点として使えますが、このレシピでは処理方向や21.1の詳細UI・結果を実機照合していないため、特定のクリック順を自動処理の確定手順として示しません。自動結果も、人物と照明の意図を含めて手動で評価してください。

## よくある失敗

| 症状 | 確認する順序 |
| --- | --- |
| 同じStillを適用するとBだけ色が破綻する | カメラのInput／CST、二重変換、コピーされたノードの内容 |
| Bの顔は合うがシャツが色づく | 色の偏り、補正の対象範囲、同じ素材上のニュートラルな物体 |
| Cの背景までAの色にしてしまった | 背景光源が意図した演出か、人物と背景を分けて評価できるか |
| Scopesが大きく違う | 構図の面積比、照明条件、比較フレーム、処理・表示条件 |
| Stillでは似ているのに編集再生で目立つ | フレーム選定、被写体と照明の時間変化、切り替え前後のカット |
| Apply Grade後に顔の補正がずれる | WindowやTrackerの位置・追跡結果、適用先の被写体形状 |

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design[『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（2026年9月8日公開）。この実行環境ではPDF全体が大きく（約183 MB）、ショットマッチングの該当章を直接照合できていません。
- **操作の直接根拠：** Blackmagic Design[「DaVinci Resolve — Color」](https://www.blackmagicdesign.com/products/davinciresolve/color) の「Professional Scopes」「Auto Balancing and Matching」「Save, Copy and Re-use Grades」「Compare Shots」「Find Mismatched Shots」（確認日：2026年10月22日）。Still作成、Apply Grade、Image Wipe／Split Screen、Lightbox、Scopesの用途を照合しました。
- **verification: partial。** 本文の3カメラ例は想定ケースです。21.1実機でのUI操作、Shot Matchの詳細挙動、Free／Studio差、色管理方式ごとの適用結果、納品モニターでの最終判断は未検証です。固定の設定値や自動マッチング成功率は提示しません。

関連：[Gallery／Stills](../reference/gallery-stills)／[Scopes](../reference/scopes)／[Primaries](../reference/primaries-color-wheels)／[カラーマネージメント](../learn/color-management-basics)
