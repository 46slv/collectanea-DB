---
title: Edit ↔ Fusionの境界
description: "Editの編集点・レイヤー管理とFusionのショット内合成を分担する。処理順序、時間、解像度、Fusion Clipの違いをResolve 21.1に沿って説明。"
doc_type: concept
term_id: edit-fusion-boundary
term_short: "Timelineの編集と、クリップ内部の合成・時間制御を分担するEdit／Fusion間の境界。"
verification: partial
product_scope: resolve
suite_surfaces: [edit, fusion]
tasks: [timeline, vfx, choose-surface, cross-page-workflow]
level: foundation
updated: "2026-10-16"
---

# Edit ↔ Fusionの境界

**クリップを「いつ・どこに置くか」は主にEdit、クリップの画像を「どう加工・合成するか」は主にFusionが担当します。** どちらにも移動・拡大・時間変更の機能があるため、同じ操作ができるかどうかより、後で何を修正するかを基準に分けると管理しやすくなります。

例えば、画面に映った看板を別のデザインへ置き換えるなら、看板の追跡と画像の合成はFusionで行い、そのショットを何秒使うか、前後のカットをどうつなぐかはEditで決めます。Fusionで作った効果は、そのクリップをEditで移動したり編集したりしても、クリップに付随します。

## 何をEditに置き、何をFusionに置くか

| やりたいこと | まず使う場所 | 理由 |
| --- | --- | --- |
| カットを並べ替える、編集点を動かす、ショットの長さを決める | Edit | Timeline全体の時間と順序を管理するため |
| V2の人物とV1の背景を別のカットとして編集する | Edit | 2つのクリップを独立して差し替えられるため |
| 人物からグリーンバックを抜く、看板を追跡して差し替える | Fusion | マスク、追跡、合成の処理関係をNodeで管理するため |
| 複数素材を1つの合成として組み、素材同士の位置と時間を合わせる | Fusion Clip + Fusion | 複数レイヤーを1つのNode構成へ渡せるため |
| ショットごとの色合わせや全体のルックをそろえる | Color | 複数ショットを比較してグレーディングするため |

「Fusionを使ったらEditのInspectorは触らない」というルールではありません。例えば画面全体の最終的な配置はEditで、画面内の看板だけの変形はFusionで、と目的を分ければ重複しません。

## 単独クリップからFusionを開くと何が渡るか

EditまたはCutのTimeline上で再生ヘッドをクリップに合わせ、Fusionページを開くと、通常は表示中の最上位クリップが対象になります。下位トラックのすべてが自動で取り込まれるわけではありません。

```text
Edit: V2の人物クリップ（V1には背景）
         │
         ▼
Fusion: MediaIn1 → 加工・合成Node → MediaOut1
         │
         ▼
Edit: V2の処理結果をV1の背景と重ねて表示
```

[MediaIn](../nodes/utility-io/media-in)は対象素材の画像をFusionへ渡し、[MediaOut](../nodes/utility-io/media-out)は加工後の画像をResolveへ返します。背景をFusion内で直接編集しないなら、V1を別のMediaInとして読み込む必要はありません。逆にV1とV2の両方へNodeによる処理をかけるなら、Fusion Clipにまとめる方法や、Media Poolから別素材を追加して[Merge](../nodes/compositing/merge)で重ねる方法があります。

### 実例：人物を切り抜き、下位トラックを背景にする

1. Editでグリーンバックの人物映像をV2、背景映像をV1に配置します。
2. V2の人物クリップをFusionで開き、`MediaIn1 → MediaOut1`の間に[Delta Keyer](../nodes/matte-keying/delta-keyer)を挿入します。
3. 背景の緑を抜いて人物以外の透明度（Alpha）を作り、その画像をMediaOut1へ渡します。
4. Editに戻ると、透明になった部分からV1の背景映像が見えます。背景の差し替えや編集点の変更はEditで行えます。

Alphaは画像の各画素の透明度です。画像とMaskの接続を混同しないための説明は[MediaIn / MediaOutの境界](./media-in-out-boundary)と[Alphaの基礎](../learn/04-compositing/alpha)を参照してください。

## 処理順序：Fusionで加工してからEditの効果をかける

Resolve 21.1 Manualでは、**Fusionページの画像処理はEditページで適用する効果より前**と説明されています。ただし、Editの**Lens Correction**は例外です。したがって「Editで先に設定したから、その結果をFusionが必ず受け取る」とは考えないでください。

例えばEditのInspectorで拡大した人物にFusionで追跡用のマスクを描くと、FusionのViewerで見る座標と、Edit上で拡大・配置した最終画面の座標が一致しないことがあります。追跡や画面内の合成はFusion側の素材画像を基準に考え、完成したショットをTimeline上のどこへ置くかはEdit側で調整します。

この処理順序の説明は、RAWデコード、色管理、Colorページのすべての処理までを一列に並べた図ではありません。色空間やガンマについては[Color ↔ Fusionの境界](./color-fusion-boundary)を参照してください。また、Lens CorrectionのEdit Inspector項目はResolve Studioで利用できる機能です。

## 編集点とFusion内の時間は同じ操作ではない

Editでクリップの端をTrimする操作は、**Timeline上でそのショットのどの部分を、どれだけの長さ表示するか**を変えます。SlipやSlideなども、編集位置や使うフレームを調整するTimelineの操作です。Fusionで作った合成はクリップに付随しますが、EditのTrimがFusion内のすべてのキーフレームを都合よく再配置してくれるという意味ではありません。

一方、FusionはNodeの値をキーフレームで時間変化させたり、Node Editorへ別途追加した素材の表示時間を設定したりします。特に**Media Poolから直接追加したMediaIn**には、Timeline由来のMediaInより多くの時間制御があります。

- **Global In/Out**：その素材を合成全体のどの時間範囲で使うかを指定します。
- **Trim In/Out**：素材の先頭・末尾から使う範囲を決めます。Editのクリップ端のTrimとは操作対象が違います。
- **Hold First/Last Frame**：先頭・末尾のフレームを保持して表示時間を延ばします。
- **Reverse / Loop**：素材を逆再生したり、繰り返し使ったりします。

例えばEditで10秒のクリップの使用範囲を短縮しても、Fusion内で追加した画像素材のGlobal In/Outや追跡・文字アニメーションが、新しい編集範囲と合っているとは限りません。**編集点を変えた後は、Fusionの先頭・末尾と重要なキーフレーム位置を再確認する**のが安全です。時間制御の詳しい設定は[MediaIn](../nodes/utility-io/media-in)を参照してください。

## 単独クリップとFusion Clipでは解像度が違う

4Kの素材を1920×1080のTimelineで編集する場合、どの方法でFusionを開くかが後の拡大余地を左右します。

| 開き方 | Fusionで基本となる解像度 | 後の拡大で注意すること |
| --- | --- | --- |
| Timelineの単独クリップからFusionを開く | **元クリップの解像度**（例：3840×2160） | Nodeで実際の画像解像度を落とさなければ、元素材の細部を使える |
| 複数クリップを選択して**New Fusion Clip**を作る | **Timeline解像度**（例：1920×1080） | 合成結果を後段で大きく拡大しても、元素材の4K情報には直接戻れない |
| **Referenced Composition**を使用する | **元クリップの解像度を保持** | 共通合成を複数箇所で再利用できるが、異なるフレームレートや速度変更済みクリップには制限がある |

さらにFusion内のNodeの選択にも違いがあります。**Transform**は、Fusion内で複数回縮小・拡大しても元の画像解像度を基準とする設計です。一方、**Resize**は指定した画像サイズにピクセル数を変更します。Cropや、異なるサイズの背景を受け取るMergeも最終出力サイズに影響します。

```text
3840×2160の元素材
  ├─ Transformで配置変更 → 素材解像度を利用した合成
  └─ Resizeで1920×1080化 → 以後はHD画像として処理
```

ただし**Fusion内のTransformが解像度に依存しない**ことと、**FusionからEdit／Colorへ戻した後も元素材へ無制限に戻れる**ことは別です。Manualは、Fusionを通した後の画像はMediaOutから渡された解像度を後段が実効的なソース解像度として扱うと説明しています。Fusionで小さくした画像を後からColorで無理に拡大すると、Fusion内のTransform同士で縮小・拡大を相殺する場合とは画質が異なります。

大きく寄る予定があるなら、Fusion Clip化する前に必要な解像度を確認し、できるだけ単独クリップの元解像度を保持する構成を選びます。詳しくは[MediaIn / MediaOutの境界](./media-in-out-boundary)を参照してください。

## 複数トラックをまとめるときの選択

**Fusion Clip**は、Editの複数クリップをひとまとまりの合成として扱いたい場合に向きます。Edit上で重ねたクリップを選び、右クリックから**New Fusion Clip**を選ぶと、各素材がMediaInになり、重ね合わせはMergeを使った構成としてFusionへ引き継がれます。元素材をタイミングごと編集してからまとめると、最初の配置を生かせます。ただし前述のとおり、Fusion ClipではTimeline解像度が基準です。

**Referenced Composition**は、合成そのものをMedia Poolに保持し、別のTimelineクリップへリンクして同じ合成を使いたい場合の選択肢です。例えば複数カットで共通のロゴ差し替え処理を使う場合、参照するトラックの内容だけを替えながらNode構成を共有できます。Resolve 21.1では元クリップの解像度を保持しますが、速度変更済みクリップや異なるフレームレートのクリップには対応しません。

**空のFusion Composition**は、人物映像などの素材がなく、文字や図形だけを作る場合に向きます。EditのEffects LibraryからFusion Compositionを配置して開くと、最初はMediaOutだけがあり、BackgroundやText+などを自分で追加します。

これらは名称が似ていますが、**複数の映像をまとめる**、**同じ合成を参照して使う**、**空の合成を作る**という用途が違います。

## 実例：追跡した看板を差し替える

1. Editで看板が映るショットのIN/OUTと前後のカットを決め、対象の単独クリップからFusionを開きます。
2. Fusionで看板の動きを追跡し、差し替え用の画像をその動きに合わせて変形し、元の映像へ合成します。元の映像と差し替え画像を別々に処理できるよう、Nodeの接続を分けます。
3. MediaOutから戻る画面を確認したらEditへ戻り、ショット全体の配置と編集点を調整します。
4. カットの長さを変えた場合はFusionのアニメーション範囲、最初と最後のフレーム、必要なら追跡結果を確認します。

この構成では、看板だけの移動や遠近の修正はFusion、ショットを長く使うか短く使うかはEditと区別できます。看板の処理をEditの画面全体のTransformでも代用しようとすると、素材全体まで動いてしまいます。

## 迷ったときの確認点

| 症状・状況 | 先に確認すること |
| --- | --- |
| Fusionでは合うのにEditでは位置がずれる | Edit側のTransform／SizingとFusion内のTransformを重複させていないか |
| Fusion Clipにすると拡大が甘くなる | そのClipがTimeline解像度に固定されていないか |
| Trim後に文字やMaskの動きが合わない | Fusionのキーフレーム位置とMediaInの表示範囲 |
| 下位トラックの背景がFusionに見えない | 単独クリップだけをFusionへ開いていないか。必要ならFusion Clipまたは追加MediaInを使う |
| Fusionから戻ると透明部分が黒くなる | MediaOutに渡すAlpha、Editの下位トラック、合成Nodeの出力を確認する |

## 関連記事

- [どの作業ページを使うか](./choose-working-surface) — Edit・Fusion・Color・Fairlightの担当を選ぶ
- [MediaIn / MediaOutの境界](./media-in-out-boundary) — TimelineとNodeの入出力、Alpha、解像度
- [Color ↔ Fusionの境界](./color-fusion-boundary) — 色管理と後段のグレーディング
- [Fusion assetをResolveで再利用する](./reusable-fusion-assets) — 合成の再利用先
- [Graphとして考える](../learn/01-flow/graph-as-flow) — Nodeの接続を読む基本
- [MediaIn](../nodes/utility-io/media-in) — 素材参照と時間制御

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）**に基づく説明です。

- Chapter 11「Image Sizing and Resolution Independence」pp.289–290：FusionとEditの処理順序、Lens Correctionの例外、単独クリップとFusion Clipの解像度、Transform／Resizeと後段でのサイズ変更。
- Chapter 64「Getting Clips into Fusion」pp.1332–1334：単独クリップのMediaIn／MediaOut、最上位表示クリップ、Delta KeyerでのAlpha受け渡し、New Fusion Clipの構造、Edit操作に付随するFusionの合成。
- 同章 pp.1335–1338：Referenced Compositionの再利用・解像度・制限、空のFusion Composition。
- 同章 pp.1341–1345：MediaInの参照先、Media Pool素材のGlobal In/Out・Trim・Hold・Loop。

本記事は21.1 Manualに記載された一般的な動作を説明します。実機の全ケースにおけるEditのInspectorとFusionのキーフレームの同期、各EditionでのUI表示差は網羅的には検証していません。
