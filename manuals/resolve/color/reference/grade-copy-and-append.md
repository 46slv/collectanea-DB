---
title: グレードのコピーと追記（Apply Grade／Append Node Graph）
description: Resolve 21.1のGrade Managementに沿って、グレードの上書き・ノード追記・属性コピー・キーフレーム位置を使い分ける。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Gallery, Still, Apply Grade, Append Node Graph, Node Editor, Paste Attributes, Keyframe Timeline Mode, Versions, Scopes]
tasks: [grade, reuse-grade, match-shots, node-order, troubleshoot]
level: intermediate
updated: "2026-10-27"
---

# グレードのコピーと追記：既存の補正を守って再利用する

別ショットのLookを使いたいときは、**コピー先のグレードを置き換えるか、既存ノードを残して追加するか**を最初に決めます。Colorページには、クリップやGallery Stillからグレード全体を適用する方法と、保存済みノードグラフを追記する方法があります。さらに、ノードの設定だけを転用することもできます。

DaVinci Resolve 21.1 Reference ManualのChapter 142「Grade Management」pp.3363–3368を根拠として、操作とコピー範囲を整理します。実機画面・効果の再現は未検証です。

## どこまで再利用するか

| 目的 | 21.1の操作 | コピー先への影響 |
| --- | --- | --- |
| グレード全体を置き換える | クリップ／Stillを中クリック、または右クリックして**Apply Grade** | コピー先にあったグレードを上書きする |
| 現在のグレードの後段へ足す | Gallery Still／Memoryの**Append Node Graph** | 保存したノードグラフ全体を末尾へ追加する |
| ノードグラフの途中へ挿入する | Still／MemoryをNode Editorの接続線へドラッグ | ドロップした接続位置に保存済みノード群を追加する |
| あるノードの設定を別のノードへ移す | **Edit > Copy／Paste** | コピー先ノードの既存設定を上書きする |
| 設定の一部だけを移す | **Edit > Paste Attributes** | パレット・Windowなどの選択単位で設定を転用する |
| 複数ショットを後から同時更新する | [Shared Node](./shared-nodes) | 共有ノードを使用するクリップへ変更が及ぶ |
| グループ単位の共通処理 | [Group Grading](./group-grading) | Group Pre-Clip／Post-Clipの対象クリップへ作用する |

**Append Node Graphは「Lookだけを自動抽出する」機能ではありません。** 保存したノード群には、コピー元に固有の入力変換、露出、Window、FXが含まれることがあります。追加後に不要なノードを見極める必要があります。

## 操作前に確認する範囲

1. **コピー先**のクリップを確認します。選択中のClipと、編集したいショットが一致しているかThumbnail Timelineで確かめます。
2. 残す必要があるグレードは、必要なら[Versions](./versions-and-grade-comparison)で別案として保持するか、[Gallery／Stills](./gallery-stills)へ保存します。StillはUndo履歴やプロジェクトバックアップの代わりではありません。
3. Node EditorがClip／Group Pre-Clip／Group Post-Clip／Timelineのどの段階を表示しているか確認します。21.1 Manual p.3363によると、グループグレードの保存・適用先は**現在選択した段階**に左右されます。
4. コピー元と先で、入力色域・ガンマ、RCM／CST、LUTの適用場所を確認します。[色管理](../learn/color-management-basics)、[CST](./color-space-transform)、[LUT](./luts)を参照してください。入力変換やカメラ固有の補正まで複製しないかを判断します。

### Colorだけか、Sizingも含めるか

21.1 Manual p.3363では、**Mark > Keyframe Timeline Mode**（Keyframes Editor右上のモード選択）によって、コピー対象が変わると説明されています。

| モード | コピーされるもの |
| --- | --- |
| **All** | グレードとSizingの両方 |
| **Color** | グレードのみ。コピー先のInput Sizingは保持 |
| **Sizing** | Input Sizingのみ。コピー先のグレードは保持 |

たとえばカメラごとの露出とLookだけを共有し、各カットのフレーミングを変えたくないなら、Colorモードでの適用を検討します。「Colorを選べば全種類の変形や位置設定が完全に不変になる」とまでは、この表から一般化できません。[Color Sizing](./color-sizing)でInput／Output／Nodeなどの適用範囲も確認します。

### Keyframesをコピーする場合

21.1 Manual p.3363によれば、Galleryの**灰色背景を右クリック > Apply Grades Using**で、コピー時のKeyframe配置を選べます。

- **No Keyframes**：Keyframeをコピーせず、Stillを保存したフレームでのグレード状態を適用します。
- **Keyframes Aligning Source Timecode**：素材のsource timecodeに沿って配置します。コピー元と先にtimecodeの重なりがない場合は、編集開始フレームを基準に配置します。
- **Keyframes Aligning Start Frame**：コピー元・コピー先の編集開始フレームをそろえて配置します。別素材のショットへ時間変化を転用する場合の候補です。

この選択は以後のグレードコピーにも使われます。以前のコピーで設定を変更している可能性があるため、時間変化を含むGradeを適用する前に確認します。[Color Keyframes](./color-keyframes)も参照してください。

## Apply Grade：コピー先のグレードを置き換える

21.1 Manual pp.3364–3366では、Thumbnail Timelineで**先にコピー先を選択**してから、コピー元のクリップやGallery Stillを操作します。

1. ColorページのThumbnail Timelineで適用先クリップを選びます。複数クリップへ適用する場合は、選択対象を先に確認します。
2. コピー元のクリップのThumbnail、Gallery Still、またはMemoryを**中クリック**すると、そのグレードが選択先へコピーされます。別の操作方法は、コピー元を右クリックして**Apply Grade**です。
3. 適用後にNode Editorを調べ、元のグレードが必要な部分まで置き換わっていないか確認します。Viewerと[Scopes](./scopes)で露出・肌・白・暗部を比較し、前後のカットも再生します。

**注意：適用先の既存グレードは上書きされます。** これは21.1 Manual p.3365に明記されています。すでに仕上げたBalanceや入力変換を残したい場合は、Apply Gradeをそのまま使用するより、次のノード追記や設定の選択的コピーが適しています。

## Append Node Graph：現在のグレードへ追加する

21.1 Manual p.3366では、Galleryに保存したStillまたはMemoryのノードグラフを、選択中クリップのグレードへ**追記**できると説明されています。

1. コピー先のノード構成を確認し、末尾へ追加してよい処理か判断します。もともとの入力変換・Balance・Lookの位置を把握します。
2. GalleryのStill／Memoryを右クリックして**Append Node Graph**を選びます。保存済みグラフ全体が現在のNode Graphの末尾に追加されます。
3. グラフの途中に置きたい場合は、Still／MemoryをNode Editorの**接続線へドラッグ**し、プラス記号が出た位置へドロップします。21.1 Manualは、指定接続位置への追加方法として記載しています。
4. 追加されたノードに、元ショット専用のCST／LUT、露出、Window、Trackerが含まれていないか確認し、不要なら構成を整理します。追記後の接続順と最終結果を見直します。
5. 追記前の[Version](./versions-and-grade-comparison)と比較し、静止フレームだけでなく時間方向の副作用も確認します。Keyframesの配置は前節の**Apply Grades Using**設定に依存します（21.1 Manual p.3367）。

21.1 Manual p.3367には、Still／Memoryを**Commandを押しながら接続線へドラッグ**して、ノード群をCompound Nodeとして追加する方法もあります。これはManualに記載されたキー表記です。Windowsの対応修飾キーと実機操作は本記事で検証していません。

## 個別ノード・一部の設定だけをコピーする

ノードグラフ全体を追記するより、単一ノードの設定を移す方が変更範囲を小さくできる場合があります。21.1 Manual pp.3367–3368は、次の操作を説明しています。

- 元ノードを選び、**Edit > Copy**を実行します。転用先のノードを選択し、**Edit > Paste**を実行すると、コピー先ノードの設定が置き換わります。
- **Edit > Paste Attributes**では、パレット・Window・OFX／Resolve FXなどを選択して貼り付けられます。Keyframesのコピー可否とStart Frame／Source Timecodeによる位置合わせも指定できます。
- Paste Attributesで選べる粒度は原則**パレット単位**です。同一パレットの任意のスライダー1項目だけを選んで貼り付ける機能として説明しないでください。Windowと付随するTrackerには、個別に選択できる例外があります。

元のノードを転用するときは、Windowの位置、Qualifierの抽出、追跡データ、FXが新しいクリップへ合うか確認します。コピー操作による**追跡データの扱いは手法で異なる**ため、単一ノードの貼り付けとグレード全体の適用を同じ動作とみなさないでください。

## 判断例：2カメラのLookだけを転用する

AカメラとBカメラで収録したインタビューを考えます。両方とも入力変換と露出合わせが済み、Aで作った暖色LookだけをBにも適用したい状況です。

```text
A: Input A → Balance A → Warm Look → Face Window A
B: Input B → Balance B
```

AのStillをBへ**Apply Grade**すると、Bの既存グレードは置き換わります。一方、**Append Node Graph**ならBの既存ノードを残してAのグラフを追加できますが、Input A／Balance A／Face Window Aまで追記され得ます。追加した不要ノードを整理するか、Warm Lookノードだけをコピーする方法を検討します。

```text
目標: Input B → Balance B → Warm Look
```

Bの肌が赤くなり過ぎるなら、まず入力変換、Balance、Lookの順を確認します。AとBで人物の位置が違えばFace Window Aをそのまま使いません。これは21.1 Manualで確認した機能に基づく**想定例**で、実素材での成功例ではありません。

複数ショットのLookを後から同時更新する必要があるなら、[Shared Node](./shared-nodes)や[Group](./group-grading)を検討します。これらはコピーではなく補正の共有範囲を扱う機能です。

## よくある症状と確認先

| 症状 | 最初の確認点 |
| --- | --- |
| コピー先の補正が消えた | Apply Gradeで上書きしていないか。残すならAppend Node Graphや個別コピーを検討 |
| 追記後にLogのような表示や過大なコントラストになる | CST／LUTを含む入力・出力変換の重複 |
| 位置やズームまで変わった | Keyframe Timeline ModeがAll／Sizingではないか、Input Sizingのコピー範囲 |
| キーフレームの変化位置が合わない | Apply Grades UsingのNo Keyframes／Source Timecode／Start Frame |
| 肌だけ不自然な色になった | 元素材専用のBalance、Qualifier、Window、Tracker |
| ほかのショットまで変わった | Shared Node／Group／Remote Version／Timeline補正の共有範囲 |
| 一部のパラメータだけを貼り付けられない | Paste Attributesの選択単位がパレット単位かどうか |

原因が分からない場合は[ノード無効化とグレードバイパス](../troubleshooting/node-bypass-diagnostics)で、変更した処理の前後を比べます。比較対象のグレードを保持したうえで試してください。

## 出典・対象版・未検証範囲

- **一次資料：** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（September 2026）、**Color Chapter 142「Grade Management」pp.3363–3368**。2026年10月27日に公式PDF本文を直接確認。All／Color／Sizing、Apply Grades Using、Apply Grade、Append Node Graph、接続線への挿入、Compound Node、Copy／Paste、Paste Attributesの記述に基づきます。
- **関連する公式配布元：** [Blackmagic Design Support](https://www.blackmagicdesign.com/support)／[Colorページ](https://www.blackmagicdesign.com/products/davinciresolve/color)。
- **確認できたこと：** 21.1 Manual上のコマンド名、基本的な操作順、グレード置換と追記の違い、Keyframe配置の選択、Paste Attributesの選択粒度。
- **未検証：** Resolve 21.1実機での画面配置、Windows／macOSの修飾キー差、OS別ショートカット、全Node／FX／Window／Trackerの転用結果、Free／Studio差、RCM／RAW環境や実素材での挙動、レンダリング結果。**verification: partial**。

関連：[Gallery／Stills](./gallery-stills)／[Versions](./versions-and-grade-comparison)／[Color Keyframes](./color-keyframes)／[Scopes](./scopes)／[納品前Color QC](../recipes/pre-delivery-color-qc)。
