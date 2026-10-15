---
title: MediaIn / MediaOutの境界
description: "ResolveのTimeline・Media PoolからFusionへ画像を渡し、MediaOutからEdit・Colorへ戻す仕組み。Fusion Clip、解像度、Alpha、追加出力も説明。"
doc_type: concept
term_id: media-in-out-boundary
term_short: "Resolveの素材をFusionへ渡すMediaInと、合成結果をTimeline・Colorへ戻すMediaOutの関係。"
verification: partial
product_scope: resolve
suite_surfaces: [edit, fusion, color]
tasks: [cross-page-workflow, inspect-flow, choose-surface]
level: foundation
updated: "2026-10-16"
---

# MediaIn / MediaOutの境界

**MediaInはResolve側の素材をFusionへ渡す入口、MediaOutはFusionで作った画像をResolveの後工程へ渡す出口です。** ここでいう「入口」「出口」はファイルの読み書きではなく、同じDaVinci Resolveプロジェクトの中で処理を受け渡す境界を指します。

例えばEditページのクリップからFusionを開くと、通常は次の接続から始まります。

~~~text
Edit / Cutのクリップ
       ↓
    MediaIn1
       ↓
   加工・合成Node
       ↓
    MediaOut1
       ↓
Edit / Cutでの表示 → Colorでのグレーディング → Deliverでの書き出し
~~~

**MediaInとMediaOutを一本の線でつなぐこと自体が合成ではありません。** その間にMask、Keyer、Merge、Transformなどを置き、画像に何をするかを決めます。また、すべてのFusion CompositionにMediaInが1つあるとは限りません。空のFusion Compositionでは、最初はMediaOutだけが置かれます。

## Nodeの端子で何を受け渡すか

| Node | 端子 | 役割 |
| --- | --- | --- |
| [MediaIn](../nodes/utility-io/media-in) | 青いEffect Mask入力 | PolygonなどのMaskで、読み込んだ画像の表示範囲を制限する |
| MediaIn | 2D Image出力 | Resolveが参照する素材の画像を後段へ渡す |
| [MediaOut](../nodes/utility-io/media-out) | オレンジ色のImage入力（必須） | Fusionで仕上げた2D画像をResolve側へ戻す |

MediaInに画像入力端子はありません。素材は接続線ではなく、TimelineやMedia Poolのクリップ参照から取得します。MediaOutも、後続のFusion Nodeへ画像を加工しながら流すためのNodeではなく、出力先を示す終端です。

**Alpha（透明度）も画像の一部です。** 例えば人物をKeyerで抜いた画像をMediaOut1に渡すと、Editページでその人物クリップの下に置いた背景が透明部分から見えます。一方、MediaOutへ何も接続しなければ、仕上げた画像をTimelineへ返せません。

## どの素材がMediaInになるか

MediaInの参照元は、Fusionを開いた方法と、素材を追加した方法で変わります。

| 開き方・追加方法 | Fusionに現れるもの | 向いている使い方 |
| --- | --- | --- |
| Timeline上の単独クリップからFusionを開く | 通常はMediaIn1 → MediaOut1 | 1ショットの不要物除去、キーイング、トラッキング |
| Editの複数クリップを選び「New Fusion Clip」にする | 各レイヤーのMediaInと、それらを重ねるMerge | 複数素材の位置・時間を合わせて一つの合成にする |
| FusionのMedia Poolから素材をNode Editorへドラッグ | 追加のMediaIn（通常は未接続） | 別の動画、静止画、テクスチャを合成する |
| 空の「Fusion Composition」を開く | 最初はMediaOutのみ | 文字やBackgroundなど、素材クリップなしでグラフィックを作る |
| Fusion Transitionを開く | 通常は切り替え前後の2つのMediaIn | 2ショット間のTransitionを作り直す |

**単独クリップからFusionを開いても、下のビデオトラックのクリップが自動的に全部MediaInとして並ぶわけではありません。** 通常はその位置で最も上にある表示中のクリップが対象です。複数トラックをFusion内で合成したいならFusion Clipにするか、別素材をMedia Poolから追加します。

### Timeline、Background、Media Poolという参照先

Timelineから作られたMediaInのInspectorには、Imageタブの **Media Source** があります。

- **Timeline**：Editの対象クリップを参照する通常の設定です。
- **Background**：そのクリップより下のビデオトラックを、下位トラック間で合成された状態で参照します。
- **Media Pool**：EditのTimelineを介さず、Media Poolの素材を直接参照します。

「Timelineの人物だけを加工したい」のか、「下位トラックをFusionの素材として利用したい」のかで選びます。Backgroundは単なる黒いBackground生成Nodeではありません。Editページの下位トラックが関係する参照方式です。

Media Poolから追加したMediaInには **Global In/Out、Trim In/Out、Hold、Loop** などの時間制御が増えます。GlobalはFusionの合成内でいつ出すか、Trimは元素材のどこを使うかを指定します。Timelineから開いたMediaInでは時間がEdit側で決まっているため、同じ設定がすべて表示されるわけではありません。詳しくは[MediaInの時間設定](../nodes/utility-io/media-in)を参照してください。

## Fusion Clip、単独クリップ、Referenced Compositionの解像度

**Fusionが処理する画像サイズは、Timelineの解像度と常に同じとは限りません。** これは拡大・縮小、CG合成、Maskの位置合わせに直接影響します。

| 構成 | Fusionでの基本解像度 | 注意点 |
| --- | --- | --- |
| Timelineの単独クリップをFusionで開く | 元クリップの解像度 | 4K素材をHD Timelineに置いても、基本的には4Kの画像として処理する |
| 複数クリップを「New Fusion Clip」でまとめる | Timelineの解像度 | HD Timelineでまとめた4K素材はFusion内ではHDになり、元の4K解像度を直接使えない |
| Referenced Composition | 元素材の解像度を保持 | 複数Timelineで共通の合成を参照できるが、通常のFusion Clipと同一の挙動ではない |

例えば3840×2160の人物映像と背景を1920×1080のTimelineで**Fusion Clip**にすると、内部の合成は1920×1080を基準にします。後から大きく寄りたいなら、単独クリップを開き、追加の素材をMedia Poolから持ち込む構成などを検討します。

さらに、Fusionの**Mergeの背景入力の解像度**、Crop、Resizeなどによって、MediaOutへ渡す画像サイズ自体が変わることがあります。MediaOutはその画像を渡すNodeであり、Timelineへの表示に必要なスケーリングはResolveのProject Settings側も関与します。Viewerの画像サイズを確認し、解像度の不一致を単なる表示倍率の違いと決めつけないでください。

### Referenced Compositionを使う場合

DaVinci Resolve 21.1のManualには、Editで作成したReferenced CompositionをMedia Poolに保持し、複数のクリップやTimelineにリンクして同じ合成を再利用する方法も記載されています。複数トラックから作ると、MediaInは参照トラックに対応し、上の選択クリップを指すMediaIn1と下位トラックを参照するMediaInが作られます。

通常のFusion Clipとは異なり、**元クリップの解像度を保持する**と説明されています。一方、異なるフレームレートのクリップや速度変更済みのクリップには制限があります。単に「Fusion Clipの上位版」と捉えず、使い回しや解像度保持が必要かで選びます。

## 制作例1：人物を抜いてEditの下位トラックを見せる

グリーンバックの人物映像をV2（上）、背景映像をV1（下）へ配置したとします。

1. V2の人物クリップからFusionを開き、MediaIn1 → MediaOut1を確認します。
2. その間に[Delta Keyer](../nodes/matte-keying/delta-keyer)を挿入し、緑色の背景を透明にします。
3. Delta Keyerの画像出力をMediaOut1へ接続します。透明になった部分のAlphaもMediaOutへ届きます。
4. Editへ戻ると、人物の透明部分からV1の背景が見える構成になります。

~~~text
V2 人物 → MediaIn1 → Delta Keyer → MediaOut1
                                          ↓
                         EditでV1の背景が透けて見える
~~~

この方法なら、V1の背景をFusionのNodeとして読み直す必要はありません。背景までFusion内でぼかしたり、人物との前後関係を複雑に組み替えたりしたい場合は、背景も別のMediaInとして取り込み、[Merge](../nodes/compositing/merge)で合成します。

## 制作例2：FusionからColorへ人物のMaskを渡す

**MediaOut1は完成画像をTimelineへ返しますが、追加のMediaOutはColorで使うMatte（補正範囲）も渡せます。** Matteは「画像のどこに補正をかけるか」を示す濃淡の領域データです。

1. Fusionで人物をDelta Keyerなどで抜き、背景とMergeした完成画像を**MediaOut1**へつなぎます。
2. 人物のAlphaを含む画像を別系統で用意して**MediaOut2**へつなぎます。人物と背景でサイズが異なる場合は、Maskが完成画像と同じ位置・大きさになるよう合成後の範囲に合わせます。
3. ColorページのNode Editorの空白を右クリックし、**Add Source**で追加のSourceを表示します。
4. そのSource（MediaOut2に対応）をCorrectorの**Key入力**へ接続し、人物の部分だけ肌の色や明るさを補正します。

~~~text
人物 → Keyer ──┬─ Merge(背景) → MediaOut1 → Edit / Colorの完成画像
               └─ Matte調整    → MediaOut2 → Colorの追加Source → CorrectorのKey
~~~

**MediaOut2を追加しただけで、Editに完成映像が2本表示されるわけではありません。** 最初のMediaOutが通常の映像出力、追加分がColorのMatteとして使われます。色を補正する画面とMatteの解像度・位置がずれていると、補正範囲もずれます。

## 色管理と「出力の見た目」

MediaOutはRGB値を何も考えずにディスクへ保存するNodeではありません。**Resolve Color Management（RCM）またはACESを使う場合、ManualはMediaInの画像をFusion用のLinearへ変換し、MediaOutからColorへ渡す際にTimelineの色空間へ戻す経路を説明しています。** Linearは光量に比例する値を扱う表現で、合成時の加算やぼかしに適します。

MediaOutのInspectorの **Color Grade** には **None / Color / Mix** というプレビューがあります。NoneはFusion出力のみ、ColorはColorページの処理を含む表示、MixはCut／EditのエフェクトとColorページの処理も含む表示です。**この切り替えはViewerの確認方法であり、MediaOutの実際の画像出力を変更しません。**

色が違って見える場合は、RCM／ACES、素材の色空間・ガンマ、FusionのViewer LUT、MediaOutのプレビューを分けて確認します。必要な変換を重複させないための手順は[Color ↔ Fusionの境界](./color-fusion-boundary)で説明しています。

## MediaOutとSaverは別の出口

Resolveの通常の作業では、**MediaOut → Timeline → Deliver**という流れで完成動画を書き出します。MediaOutの役割はResolve内の受け渡しです。レンダーキャッシュの有無や形式はProject Settings／キャッシュ設定が関係します。

Fusion Studioでは通常、**Saver**がファイル名・形式・保存先を指定して画像や動画を書き出します。Resolve内のFusionページでもLoader／Saverは扱えますが、21.1 Manualでは特に**マルチチャンネルEXRの入出力**に利用する境界として説明されています。MediaOutをSaverで置き換えると、Timelineに完成画像を返す役割まで同じになるわけではありません。

詳しくは[Saver](../nodes/utility-io/saver)と[Loader](../nodes/utility-io/loader)を参照してください。

## 表示されない・合わないときの確認

| 症状 | まず確認すること |
| --- | --- |
| Fusionで結果を作ったのにEditで見えない | 最後の画像がMediaOut1へ接続されているか。別の未接続分岐だけをViewerで見ていないか |
| MediaInが透明／真っ黒 | Media Source、素材の存在、Globalの範囲、形を描いていないEffect Maskをつないでいないか |
| 上下のTimelineクリップをFusion内で両方扱いたい | 単独クリップで開いていないか。Fusion Clipか追加MediaInを使う構成が必要か |
| Fusion Clipにしたら画像が小さくなった | Timeline解像度で処理されていないか。単独クリップやMedia Pool追加と比較 |
| Colorで人物だけ補正できない | MediaOut2のMatteとColorの追加Source→Key入力、Matteの画像サイズが合っているか |
| FusionとColorで色が違う | MediaOutのNone／Color／Mix、Viewer LUT、RCM／ACES、手動変換の重複を確認 |
| FusionのNodeからMP4を書き出したい | MediaOutはディスク書き出し設定ではない。通常のTimeline出力はDeliverで行う |

## 関連記事

- [MediaIn](../nodes/utility-io/media-in) — 参照元、時間設定、Alpha、EXRチャンネル
- [MediaOut](../nodes/utility-io/media-out) — 追加MediaOutとColor Gradeプレビュー
- [Edit ↔ Fusionの境界](./edit-fusion-boundary) — 編集点と合成処理の分担
- [Color ↔ Fusionの境界](./color-fusion-boundary) — RCM／ACESとViewer表示
- [どの作業ページを使うか](./choose-working-surface) — 作業内容からページを選ぶ
- [Graphとして考える](../learn/01-flow/graph-as-flow) — Nodeと接続の基本
- [Alpha](../learn/04-compositing/alpha) — 透明部分の表し方
- [Merge](../nodes/compositing/merge) — 2つの画像を重ねる

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）**を基準にしています。

- Chapter 64「Getting Clips into Fusion」pp.1332–1345：単独クリップ、Fusion Clip、Referenced Composition、Fusion Transition、Media Pool追加、MediaInの参照元と時間設定。
- Chapter 11「Image Sizing and Resolution Independence」pp.289–290：単独クリップとFusion Clipの解像度、Crop／Resize／Mergeが出力解像度に与える影響。
- Chapter 104「I/O Nodes」pp.2419–2422：MediaOutの必須Image入力、最初と追加のMediaOut、Color GradeのNone／Color／Mix、RCM／ACES。
- Chapter 146「Combining Keys and Using Mattes」pp.3428–3430：MediaOut2からColorページのAdd SourceとCorrectorのKey入力へMatteを渡す例。
- Chapter 65「Rendering Using Saver Nodes」p.1358：MediaOutによるTimelineへの受け渡し、キャッシュ、Saverでのファイル書き出し。

特定のResolve 21.1実機における全てのInspector表示条件・Edition差・特殊なTimeline構成は未検証です。
