---
title: ColorページのSizing（Edit／Input／Output／Node／Reference）
description: DaVinci ResolveのColorページで、5種類のSizingの適用範囲と構図合わせの手順を整理する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Sizing, Edit Sizing, Input Sizing, Output Sizing, Node Sizing, Reference Sizing]
tasks: [reframe, match-shots, image-comparison, grade]
level: intermediate
updated: "2026-10-22"
---

# ColorページのSizing：どの範囲の構図を変えるか

Colorページで人物のサイズを合わせたつもりが、ほかのカットまで拡大された。あるいは、比較用のStillだけ位置を動かしたかったのに、作業中のクリップが変わった。このような場合はZoomの値を調整し直す前に、**Sizingのモードと適用範囲**を確認します。

Sizingは画像の位置、大きさ、角度を調整するための機能です。色を調整する[Primaries](./primaries-color-wheels)とは目的が異なります。Colorページでは同じように見える移動や拡大でも、クリップ個別、タイムライン全体、ノード、比較画像のどれを対象にするかによって結果が変わります。

## 五つのモードを適用範囲で選ぶ

| モード | 主な適用先 | 最初に考える用途 |
| --- | --- | --- |
| **Edit Sizing** | Editページのクリップ変形と関係する設定 | Edit側で調整済みのTransformとの関係を確認する |
| **Input Sizing** | 選択したクリップの入力側 | Bカメラだけ被写体の大きさを合わせる |
| **Output Sizing** | タイムライン全体の出力側 | 多数のカットに共通のフレーミングを試す |
| **Node Sizing** | 選択したColorノード | ノードの処理と関連付けた画像変形を試す |
| **Reference Sizing** | 比較表示する参照画像 | WipeのStillと現ショットを見比べやすくする |

この五つの区分は、Blackmagic Designの公式旧版教材『The Colorist Guide to DaVinci Resolve 17』のSizing Paletteの説明を基にしています。**21.1 Reference ManualのSizing章と実機画面を直接照合できていないため、最新版の項目・配置・例外条件が同じとは断定しません。**

まず「変えたい画像」と「変えたくない画像」を一つずつ決めてください。Bカメラだけを寄せたいならA・Cを維持対象とし、参照Stillを見やすくしたいなら現在のクリップを維持対象とします。この区別がないまま操作すると、一つのフレームがよく見えても意図しない場所へ調整が波及する可能性があります。

## Input Sizing：ショット個別の構図をそろえる

A・B・Cの三台で撮影したインタビューを想定します。Bカメラの人物だけ小さく写っており、Aを基準に顔の大きさを合わせたい場合、Input Sizingを候補にします。色や露出をそろえる作業は[ショットマッチングのRecipe](../recipes/matching-multicamera-interview)と分けて考えます。

### 手順：Bカメラだけを少し寄せる

1. Aのショットで顔の見かけの大きさと上下の余白を確認します。必要なら[Gallery／Stills](./gallery-stills)に基準画像を保存します。
2. Bのクリップを選び、ColorページのSizingパレットから**Input Sizing**を選びます。21.1での正確なアイコン位置・開き方は未照合です。
3. Zoomを少しずつ調整し、Aと比べて顔の大きさが近いか確認します。必要ならPan／Tiltに相当する位置調整で顔の位置を合わせます。数値を固定プリセットとして流用しません。
4. クリップの冒頭・中間・終盤を再生またはスクラブし、頭頂部や手、画面端の物体が不自然に切れていないか確認します。
5. AとCに切り替え、**B以外の構図が変わっていないか**を確認します。もし変わっていたら、最初にSizingモードを見直します。

**採否例：** Aと顔のサイズはそろったが、Bだけ指先や頭の上部が切れるなら、顔の大きさの一致より画面内で必要な情報を優先してZoomを弱めます。拡大で細部が甘く見えるなら、素材の解像度と納品解像度も確認対象です。Sizingは失われた画素の解像感を保証しません。

この工程は構図合わせです。ホワイトバランス、露出、彩度が自動で一致するわけではありません。色差の評価は[Scopes](./scopes)やStill比較で別に行います。

## Output Sizing：全カットに共通の調整を考える

旧版のBlackmagic教材では、Output Sizingはタイムライン全体に適用されるモードとして説明されています。クリップ固有のInput Sizingと混同すると、**一つの変更が別のショットにも波及する**原因になります。

たとえば複数カメラの映像を同じ納品フレームへ少し寄せたい場面で検討できます。ただし、すでに個別に拡大したカットまで同じ出力側の変形を受けると、人物の頭が切れたり端の余白がなくなったりすることがあります。

### 手順：共通フレーミングの副作用を見る

1. ワイド、バストアップ、人物が端に寄るショットを、それぞれ代表として選びます。
2. 各クリップにEditページのTransformやInput Sizingが加わっていないか把握します。
3. ColorページでOutput Sizingを選び、共通の構図変更を小さく試します。
4. 最初のショットだけで判断せず、代表ショットとタイムラインの前後を確認します。顔、手、重要な背景、字幕用の余白を評価します。
5. 共通調整が有効でも一部だけ不都合なら、全体の倍率を上げ続けず、共通の出力調整とクリップ固有の入力調整を整理します。

**Output Sizingを「全クリップに個別のZoom値をコピーする機能」とみなさない**ことが重要です。また、映像の位置・倍率を変えることと、タイムライン解像度・アスペクト比・Output Blankingを設定することは別の操作です。21.1の設定項目の正確な名称と優先関係は実機で確認してください。

## Node Sizing：Colorノードに紐づく変形

Node Sizingは、Colorページの[Node Graph](../learn/color-node-graph)上で、選択したノードと関連付けて画像を変形する目的のモードです。旧版の公式Reference Manualには、ノードの処理と画像変形を組み合わせる例があります。

通常のクリップ全体の構図合わせに使う前に、**どのノードを選んでいるか、そのノードが有効か、後段にどの処理があるか**を確認します。基本の入力側の変形、ノード内の変形、出力側の変形は、役割が異なります。旧版資料はInput→Node→Outputという処理順を示していますが、21.1の全経路や例外は未照合です。

### 手順：Power WindowとSizingの役割を区別する

1. 独立したノードに[Power Window](./power-windows)を設け、人物の一部へ弱い補正を加えます。まずSizingを触らず、何が変わるか確認します。
2. 作業中の構図とノード状態を記録し、Node Sizingを使うノードを明示的に選びます。
3. 小さな移動だけを試し、**元画像が移動したのか、見かけの補正範囲が動いたのか、後段の結果が変わったのか**をViewerで確認します。
4. ノードを無効・有効に切り替え、変形を加える前後の違いを見ます。意図しない結果ならノードの選択と接続を先に見直します。

これはColorノード内での変形を理解するための**検証手順**です。21.1のマスク合成順序、キーフレーム処理、Node SizingとWindowの演算順を確認済みとするものではありません。動く被写体にWindowを追従させる目的なら、静的なSizingと[Color Tracker](./color-tracker)を区別します。

## Edit Sizing：Editページの変形との関係を見る

Edit Sizingは、Blackmagicの旧版公式Colorist GuideにおいてEditページのInspectorで扱うTransformに対応するモードとして説明されています。Colorページで既に拡大されたクリップを見た場合、まずEditページにTransformが設定されていないか確認します。

Edit側の変形とColor側の個別Sizingを混在させると、どこで拡大したか後から追いにくくなります。「Colorページに表示されるから、Edit側とは独立した設定だ」と推測せず、現在のクリップの編集状態を確認します。納品時の意図しないトリミングを避けるため、構図変更の責任を作業上決めておくと確認しやすくなります。

## Reference Sizing：比較するStillの位置を合わせる

[Gallery／Stills](./gallery-stills)からAカメラのStillを表示し、Bの現在フレームとImage Wipeで比較するとき、顔の位置やサイズが違いすぎると明暗・色差を見比べにくくなります。旧版の公式教材ではReference Sizingを、比較用の参照画像の位置・大きさを調整する用途として説明しています。

1. 比較に使うStillを表示し、Wipeで現ショットと見比べます。
2. Reference Sizingを選び、参照側の顔と背景の位置が比較しやすくなるように調整します。
3. Wipeを外し、現在のクリップそのものの構図が変わっていないか確認します。
4. 参照画像の位置合わせを完了したあと、露出と色相の差を評価します。位置合わせとグレーディングの採否を分けます。

**Reference Sizingで比較画像の見え方を変えたことと、元クリップのグレードを変更したことは別**です。21.1で対応する参照ソースの種類、設定の保存範囲、メニュー位置は未確認です。

## 期待と異なる結果になったとき

| 症状 | 最初に確認すること | 次の判断 |
| --- | --- | --- |
| 別のクリップも拡大した | Output Sizingを選んでいないか | 個別ならInputを検討 |
| Editページで既に拡大されている | Edit SizingとEdit側Inspector | 変形の担当箇所を整理 |
| ノードを変えると見た目が変わる | Node Sizingの有無と選択ノード | Node Graphの処理位置を確認 |
| Stillだけ大きさを変えたい | Reference Sizingか | 現クリップが変わらないか比較 |
| 拡大後に人物の端が切れる | Zoom、Pan／Tilt、元素材の画角 | ショット全尺で再評価 |
| Windowが途中で外れる | 静的な変形と追跡を混同していないか | Trackerの結果を確認 |
| 構図を変えたらScopesが変化した | 画面内に占める被写体の面積 | グレードの変更と切り分け |

## 出典・対象版・確認範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design [『DaVinci Resolve 21.1 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)の公開は[公式サポート](https://www.blackmagicdesign.com/support)で確認しました。ただしPDF全体の取得制約により**Sizing該当章は直接照合しておらず、21.1の操作手順を実機で再現していません**。
- **モードの分類と適用先（旧版）：** Blackmagic Design [『The Colorist Guide to DaVinci Resolve 17』](https://documents.blackmagicdesign.com/UserManuals/DaVinci-Resolve-17-Colorist-Guide.pdf)、「Understanding Timeline Resolutions and Sizing Palette Modes」。五つのモードを説明する旧版の公式教材です。17の操作画面を21.1の確定情報として扱いません。
- **処理順・Node Sizing（旧版）：** Blackmagic Design [『DaVinci Resolve 11 Reference Manual』](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_11_Reference_Manual.pdf)、「The Four Color Page Sizing Modes」「Sizing Order of Processing on the Color Page」「Using Node Sizing」。旧版の処理構造を参照し、21.1の細かな演算は断定しません。
- **現行の一般的なColor機能：** Blackmagic Design [『DaVinci Resolve — Color』](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)（確認日：2026-10-22）。ノード、Gallery／Stillによる比較、Scopesの説明。**この製品ページ単独ではSizingモードの細部を確認できません**。
- **verification: partial。** 操作例は一次資料にある機能の使い方を基にした判断例です。21.1のメニュー位置、正確な値の範囲・初期値、キー／マスクの合成、Free／Studio差、レンダリング結果は未検証です。

関連：[Node Graph](../learn/color-node-graph)／[Power Windows](./power-windows)／[Gallery／Stills](./gallery-stills)／[ショットマッチング](../recipes/matching-multicamera-interview)／[Scopes](./scopes)
