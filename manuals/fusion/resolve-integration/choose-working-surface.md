---
title: どの作業ページを使うか
description: "DaVinci Resolve 21.1で素材整理、編集、合成、グレーディング、音声、書き出しの担当ページを選ぶためのガイド。"
doc_type: concept
term_id: choose-working-surface
term_short: "Resolveの各ページで何を処理し、どこで受け渡すかを制作目的から選ぶためのガイド。"
verification: partial
product_scope: resolve
suite_surfaces: [edit, fusion, color, fairlight]
tasks: [choose-surface, route-task]
level: foundation
updated: "2026-10-16"
---

# どの作業ページを使うか

DaVinci Resolveでは、同じ映像の拡大、色変更、合成に複数の方法があります。**選ぶ基準は「その機能があるか」ではなく、「何を変更する仕事か」と「どこで後から直したいか」**です。例えば人物を切り抜くならFusion、人物を映す長さを変えるならEdit、前後のショットと肌の色を合わせるならColorが基本になります。

このページではDaVinci Resolve 21.1の主要な作業ページを比較し、ページをまたぐときに何が引き継がれるかまで説明します。

## 最初に選ぶページ

| 作業したいこと | まず使うページ | 作業の単位・判断基準 |
| --- | --- | --- |
| 素材を読み込み、確認し、Binやメタデータで整理する | Media | 編集前の素材を探しやすくし、Clip Attributesなどを確認する |
| 写真をアルバムで整理し、静止画として調整・書き出しする | Photo | 1枚ずつの写真を主な成果物として扱う |
| 取り急ぎカットをつなぎ、構成や尺を試す | Cut | 素早いアセンブリ編集や短尺コンテンツの構成を優先する |
| カット、トラック、タイミング、トランジションを細かく編集する | Edit | Timeline上のクリップ同士の関係を管理する |
| ショット内でキーイング、追跡、マスク、合成、動くグラフィックを作る | Fusion | 画像をどう作り、加工し、重ねるかをNodeで管理する |
| ショット間の色・露出をそろえ、ルックを仕上げる | Color | 色調整を複数ショットで比較・管理する |
| セリフ、効果音、音楽を整音・ミックスする | Fairlight | 音声トラック、バス、音量や音質の調整を管理する |
| 完成動画の形式、書き出し範囲、レンダーキューを管理する | Deliver | 最終ファイルや納品用の出力を設定する |

CutとEditは別の映像処理方式ではなく、編集をするための異なる画面です。**Cutで組んだ後にEditで詰める**ことも、Editだけで編集することもできます。Photoは動画の1フレームを静止画にするための専用ページという意味ではなく、写真の整理・調整・出力を扱うページです。

### 迷ったら、何が変わるかを見る

- **クリップの順番・開始位置・使う長さが変わる** → CutまたはEdit。細かなトラック管理が必要ならEdit。
- **同じ時刻の画面内で、人物や物体の形・位置・重なりが変わる** → Fusion。追跡やマスクをNodeとしてつなぐ。
- **画面全体やショット間の色を調整する** → Color。肌だけの補正も、画像の切り抜きが必要でなければColorで完結できることがある。
- **音声の聞こえ方やトラック間のバランスが変わる** → Fairlight。単純な仮ミックスならEditでも可能。
- **最終ファイルの仕様が変わる** → Deliver。軽い確認出力ならQuick Exportも候補。

「FusionでできるからFusionに入れる」と決めると、編集点や複数ショット共通の調整まで個々のFusion Compositionに分散し、変更しづらくなります。一方、追跡対象の看板だけをEditの画面全体のTransformで動かそうとすると、看板だけでなく映像全体が動いてしまいます。

## 例1：人物を抜き、別の背景へ重ねる

グリーンバックで撮影した人物と、差し替えたい背景がある場合、人物の輪郭を作る処理と背景クリップの編集は分けられます。

1. Editで人物をV2（上の映像トラック）、背景をV1（下の映像トラック）に置き、各クリップの長さを決めます。
2. V2の人物クリップからFusionを開き、MediaInとMediaOutの間にDelta Keyerを入れます。緑の背景を取り除き、透明度を表すAlphaを作ります。
3. Fusionから戻ったV2の透明部分には、Edit上のV1が見えます。背景を別のショットに差し替える作業はEditで続けます。
4. 最後にColorで、人物と背景の明るさや色のつながりを調整します。

~~~text
Edit: V2 人物 ─ Fusion: MediaIn → Delta Keyer → MediaOut ─┐
Edit: V1 背景 ──────────────────────────────────────────┤
                                                         └→ Edit上で合成 → Color
~~~

この例では、**背景をFusionへ取り込んでMergeで重ねる必要はありません**。反対に、背景も同じ動きに合わせて変形したり、人物の前後に物体を配置したりするなら、背景を別のMediaInとして追加してFusion内で合成する構成が向いています。詳しくは[MediaIn / MediaOutの境界](./media-in-out-boundary)と[Edit ↔ Fusionの境界](./edit-fusion-boundary)を参照してください。

## 例2：追跡した看板を差し替え、ショット全体を整える

看板のデザイン差し替えでは、Editで使うショットの範囲を決め、Fusionで元の看板を追跡します。差し替え画像を看板の遠近や動きに合わせて合成したら、Editで前後のカットとのテンポを調整します。露出や色のつながりはColorで確認します。

この場合、編集点の変更によってFusion内のアニメーション範囲が合わなくなることがあります。**Trim後は合成の最初と最後のフレーム、追跡結果、キーフレームを確認**します。EditのTrimがFusion内のすべての時間設定を自動で意図どおりに直すわけではありません。

## 例3：テキストを繰り返し使う

文字の配置、図形との合成、アニメーションを細かく作るならFusionを使います。Node構成をMacroやTemplateとして再利用できる形にした後は、Edit/Cutで既存のタイトルをTimelineに配置し、公開されたパラメータを調整する運用ができます。

毎回Node Graphを複製して文言やタイミングを個別修正するより、**内部の見た目を決める場所と、使用するカットを決める場所を分ける**方が継続的に使いやすくなります。詳しくは[Fusion assetをResolveで再利用する](./reusable-fusion-assets)と[再利用の境界を選ぶ](../patterns/reuse/choose-reuse-boundary)を参照してください。

## 例4：編集から音声仕上げ、納品まで

インタビュー映像なら、Cutで大まかな順番を作るか、Editで不要部分を切って発言の間を詰めます。人物の背景処理が必要なショットだけFusionで加工し、Colorでカメラ間の色を合わせます。

セリフ、環境音、BGMを細かく整える段階ではFairlightで音声トラックを調整します。確認用の簡単な出力にはQuick Exportを使えますが、納品用の形式・書き出す範囲・ジョブを管理するならDeliverで設定します。**映像の処理が終わったことと、音声・書き出しの仕様が完成したことは別**です。

## ページで操作した順と、画像の処理順は違う

**下部のページボタンの並びは、エフェクトが計算される順序を示すものではありません。** DaVinci Resolve 21.1 Reference ManualのChapter 75には、通常の単独クリップについて、次の順序が説明されています。

~~~text
元素材
  → RAWのデコード／デベイヤー（該当素材）
  → Clip Attributes
  → Fusionの画像処理
  → Edit / CutのInspector調整・プラグイン／Resolve FX
  → Colorの画像処理
~~~

ただし、**Edit/CutのLens Correctionは例外的にFusionより前**で処理されます。また、EditのTimelineに設定したリタイミングは、通常の単独クリップをFusionで開いたときの入力映像へそのままは引き継がれません。

例えばEditのInspectorでZoomをかけ、そのクリップをFusionで開いても、FusionのViewerにそのZoom済みの画像が入るわけではありません。Fusionで素材の一部を追跡し、その結果にEdit側のZoomが後からかかれば、Fusionで見た位置とEditで見た位置が異なることがあります。

**Fusion ClipやCompound Clipを作ると、この関係が変わる場合があります。** 内部に含まれるEditの調整やColorのグレードを、まとめたクリップの画像としてFusionへ渡せます。ただし、元クリップではなくTimeline解像度が基準になるため、解像度の選択とセットで考える必要があります。詳しい条件は[Edit ↔ Fusionの境界](./edit-fusion-boundary)にまとめています。

これは一般的な単独クリップの説明であり、Resolve全機能の厳密な計算順を一本の矢印へ還元したものではありません。Colorページ内部を含む処理順序はManualのChapter 144で別途説明されています。

## 4K素材をHD Timelineで使うとき

3840×2160の素材を1920×1080のTimelineに置く場合、Fusionへ入れる方法によって利用できる解像度が変わります。

| Fusionへ入れる方法 | Fusionで基本となる画像サイズ | 選ぶ理由 |
| --- | --- | --- |
| Edit/Cut上の単独クリップを開く | 元の3840×2160 | 追跡・切り抜き・拡大で元素材の細部を残したい |
| 複数クリップをFusion Clipにまとめる | Timelineの1920×1080 | 複数トラックをひとまとまりにし、内部で合成したい |
| 複数素材を単独クリップのFusionへ追加する | 元クリップを基準にした構成が可能 | 元の解像度を使いつつ別素材をNodeで合成したい |

Fusionで生成するBackgroundやText+の既定サイズ、Mergeの背景入力、Resizeなども最終的な画像サイズに関わります。4K素材をFusion ClipへまとめてHDで処理した後に拡大しても、失われた4Kの情報が戻るわけではありません。**複数トラックをまとめる前に、後から大きく寄るショットかどうかを確認**すると選びやすくなります。

## ページ間で見た目が違うとき

| 見えている症状 | 確認する場所 |
| --- | --- |
| Fusionで位置が合うのにEditではずれる | EditのTransform／SizingがFusionの後段で適用されていないか |
| Fusionでは色が違って見える | Fusion Viewerの表示設定、Colorのグレード、RCM／ACESの設定を区別する |
| 下のトラックがFusionに見えない | 単独クリップを開いていないか。必要なら別のMediaInやFusion Clipを使う |
| Fusion Clipにしたら拡大が甘い | Timeline解像度へ変わっていないか |
| 編集点を変えると合成がずれる | Fusionのキーフレームと追加素材の時間範囲を確認する |
| 人物の透明部分が黒い | Fusionから返すAlpha、Editの下位トラック、MediaOutへの接続を確認する |

FusionのViewerは、通常の単独クリップではEditのInspector調整やColorのグレードを含まない表示です。一方、EditのTimeline Viewerはそれらを含む完成状態を表示します。同じ素材でも**どの段階を表示しているか**が違うため、Viewerの見た目だけで合成結果や色管理の誤りと断定しないでください。色管理については[Color ↔ Fusionの境界](./color-fusion-boundary)を参照してください。

## 関連記事

- [FusionはResolveのどこにいるか](./where-fusion-fits) — Fusionが担当する仕事の全体像
- [Edit ↔ Fusionの境界](./edit-fusion-boundary) — 編集点・時間・処理順・解像度
- [MediaIn / MediaOutの境界](./media-in-out-boundary) — TimelineからFusionへの素材とAlphaの受け渡し
- [Color ↔ Fusionの境界](./color-fusion-boundary) — Fusion Viewerと色管理、グレーディングの関係
- [Fusion assetをResolveで再利用する](./reusable-fusion-assets) — FusionのMacro／TemplateとEdit/Cut
- [Graphとして考える](../learn/01-flow/graph-as-flow) — Nodeの接続関係の読み方

---

**参照・検証範囲：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 26（Photo、p.571〜）、Chapter 33（Cut、p.635〜）、Chapter 40（Edit、p.792〜）、Chapter 75（Fusionの処理順・解像度、pp.1641–1645）、Chapter 144（Colorの処理順、p.3407〜）、Chapter 170（Fairlight、p.3746〜）、Chapter 186（Deliver、p.4094〜）。本稿のページ間の役割と、通常の単独クリップの画像処理順はManualに基づきます。具体例の編集判断は運用上の提案であり、全ての複合クリップ・カラー設定・エフェクトに一律に当てはまる処理順は主張しません。
