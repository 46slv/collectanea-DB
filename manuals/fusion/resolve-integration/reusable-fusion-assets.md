---
title: Fusion assetをResolveで再利用する
description: FusionのGraphをMacro・Title・Effect・Transition・Generatorとして再利用する方法と、.setting/.drfxの保存・配布。
doc_type: concept
term_id: reusable-fusion-assets
term_short: Fusionのノード構成をMacroやEditページ用Templateとして再利用する方法。
verification: partial
product_scope: resolve
suite_surfaces: [fusion, edit]
tasks: [template, reuse, motion-graphics]
level: intermediate
updated: "2026-10-16"
---

# Fusion assetをResolveで再利用する

Fusionで作ったタイトルや合成処理は、別のショットで最初から組み直す必要はありません。ただし**Fusion内で使い回すMacro**と、**EditページのEffects Libraryから配置するTemplate**は別の利用方法です。ぼかしと色補正の組み合わせをFusionで使い回すならMacro、編集担当者が文字だけ差し替えるタイトルならFusion Title Templateとして保存します。

## 用途に合わせて形式を選ぶ

| 再利用するもの | 形式 | 使う場所 |
| --- | --- | --- |
| 複数ノードを組み合わせた処理 | Macro（.setting） | FusionのNode Editor |
| 文字・図形によるタイトル | Fusion Title Template | EditのEffects Library → Titles |
| 背景やアニメーション素材 | Fusion Generator Template | EditのEffects Library → Generators |
| 既存クリップへの画像処理 | Fusion Effect Template | EditのEffects Library → Effects |
| カット前後の2クリップをつなぐ処理 | Fusion Transition Template | EditのEffects Library → Video Transitions |
| 複数のTemplateを配布 | Template Bundle（.drfx） | インストール後、対応するEffects Library |

どれも画像を処理するのはFusionのノードです。違うのは、**入力画像の受け取り方、利用する画面、公開する操作項目**です。

<Term id="groups">Group</Term>は同じcompositionのノードをまとめて内部を編集できる仕組みです。Macroはそのノード群を再利用可能なToolにし、外へ見せる入力・出力やInspectorの項目を選べます。違いの詳細は[Macro](../nodes/utility-io/macro)を参照してください。

## Macro Editorで公開する設定を選ぶ

たとえば、Fusion内でBlurとColorCorrectorをまとめます。

~~~text
MediaIn → Blur → ColorCorrector → MediaOut
            └──────────┘
            Macroにする範囲
~~~

1. FusionのNode Editorで**BlurとColorCorrectorだけ**を選びます。通常の画像処理MacroではMediaInとMediaOutを外側に残します。
2. 右クリックして**Macro > Create Macro**を開き、**Macro Name**を付けます。
3. **Export**列で、外部から受け取る画像入力・結果を渡す画像出力と、利用者に変更させる設定を選びます。
4. ぼかし量や色の値を公開し、細かな内部設定は隠します。**Name**列で分かりやすい名称を付け、**Inspector Preview**で並びやページ構成を確認します。
5. 保存前に**Copy Macro**で試作品をNode Editorに貼り付け、MediaIn → Macro → MediaOutをつないで画が届き、公開値を変更すると結果も変わるか確認します。
6. 問題がなければ通常Macroとして .setting に保存します。FusionではNode Editorの**Add Tool > Macros**などから呼び出せます。

画像の接続端子もInspectorのControlもExportの対象です。**入力または出力を公開し忘れると、Macroの外へ画像をつなげない**ので、Inspectorの見た目だけで完成を判断しないでください。

21.1のMacro Editorには**Tool/Input、Export、Name、Type、Default、Minimum、Maximum**の列があります。**Inspector Preview**では公開項目を移動したり、ページを追加したり、Separator・Spacer・Nestで整理できます。各操作は[MacroのReference](../nodes/utility-io/macro)、公開Controlの設計は[User Controls](../learn/06-reuse/user-controls)を参照してください。

## Editから使うならTemplateとして保存する

**通常Macroを作っただけではEditのEffects Libraryへ自動的に表示されません。** Macro Editorの**Save to**でTemplateカテゴリを選ぶか、作成した .setting を対応するTemplateフォルダーへ保存します。

### 文字を差し替えられるFusion Title

Text+で文字とアニメーションを作る場合、基本構成は次のとおりです。

~~~text
Text+ → Transform → MediaOut
~~~

21.1 ManualのTitle Template作成手順では、**タイトルを構成するノードを選び、MediaIn・MediaOutをMacroの選択から除外**します。Fusion StudioならLoader・Saverを除外します。**Macro > Create Macro**で文字内容、色、位置など編集担当者が変更する項目だけをExportし、Title Templateとして保存します。

たとえば3か所で同じローワーサードを使うなら、Editでテンプレートを置き、Inspectorから人物名・肩書だけ差し替えられます。Fusionでアニメーションを毎回作り直さずに済みます。

### 別のクリップへ適用するFusion Effect

Timeline上の映像にぼかしと色調整を掛けたい場合は、Editで任意のクリップをFusionへ開き、次のように接続します。

~~~text
MediaIn1 → Blur → ColorCorrector → MediaOut1
~~~

**Effect TemplateではMediaIn・MediaOutを含む構成**をMacroにしてEffectsカテゴリへ保存します。作成時に開いたクリップはEffectを組み立てるための素材で、保存したEffectにその撮影素材が固定で焼き込まれるわけではありません。別のクリップへ適用すると、そのクリップの画像を処理します。

複数トラック用のEffectなら、必要枚数のレイヤーを持つFusion Clipを作成してからGraphを組みます。21.1 ManualではMediaInの**Layer**をExportすると、EditのInspectorで対象レイヤーを調整できると説明されています。単一クリップ用のEffectが自動的に任意枚数のレイヤーを扱うわけではありません。

### GeneratorとTransitionで必要なノード

**Generator**は元映像なしで色・形・粒子などを組み合わせ、新しい画像を作るものです。21.1 ManualのGenerator例はFusion Compositionから作り、**MediaOutを含めて**Template化します。

**Transition**は切り替え前後の映像を必要とします。EditへFusion Transitionを置き**Open in Fusion Page**で開くと、**MediaIn1が切り替え前、MediaIn2が切り替え後**のクリップです。新しいTransition Templateの作成手順では、**2つのMediaInとMediaOutをすべて含める**ようManualが指示しています。さらにこのTransition Templateの最終保存はResolveのFusionページで行う必要があり、Fusion Studioだけでは完結しないとされています。

**タイトルの「MediaIn・MediaOutを除外する」という選択手順を、Effect・Generator・Transitionへ流用しない**ことが重要です。

## .settingと.drfx、保存する場所

**.setting**は個別のMacroまたはTemplateを保存するファイルです。**同じ拡張子でも置くフォルダーによって使う画面が違います。** 21.1 ManualのWindowsユーザー別Edit Templateの保存先は次の構造です。

~~~text
C:\Users\<ユーザー名>\AppData\Roaming\Blackmagic Design\DaVinci Resolve\Support\Fusion\Templates\Edit\
    Titles\
    Generators\
    Effects\
    Transitions\
~~~

macOSでは **~/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Templates/Edit/**、Linuxでは **~/.local/share/DaVinciResolve/Fusion/Templates/Edit/** 配下へ対応するカテゴリを置きます。

保存したら**Resolveを終了して再起動**し、EditのEffects Libraryに表示されるか確認します。表示されない場合は、まず保存先とカテゴリを見直します。WindowsのAppDataは通常隠しフォルダーです。

**.drfx**は複数Template・アイコン・関連アセットをまとめて配る**Template Bundle**です。.settingの拡張子だけを変更したものではありません。

1. 配布する種類に応じて **Edit/Titles、Edit/Effects、Edit/Transitions** などのフォルダー構成を用意します。
2. .settingと必要なPNGアイコン・関連アセットを配置します。
3. そのフォルダー構成をZIP形式で圧縮し、.zipを**.drfx**に変更します。
4. 受け取るPCでは.drfxをダブルクリックするか、ResolveのFusionページへドラッグしてインストールします。

21.1 Manualでは、Bundleは個別の.settingファイルへ自動展開されず、**Bundleのまま保持**されると説明されています。Bundleを削除すると中のTemplateも一緒に使えなくなるため、元の.settingを別途保管しておくと再編集しやすくなります。Macro Editorの**Open Template Bundle**ではBundle内のMacroを選んで編集できます。

Templateのサムネイルは、**.settingと同じファイル名のPNGを同じフォルダーに置く**と変更できます。Manualの推奨サイズは104×58ピクセルです。

## 再利用でつまずきやすい点

**アニメーションの長さが変わる**：EditでTitleやEffectの尺を変える場合、固定のキーフレームが期待どおり伸縮するとは限りません。21.1 Manualは**Anim Curves**と**Keyframe Stretcher**を、長さを変えてもアニメーションを扱うためのModifierとして説明しています。冒頭と末尾の動きを保ち、中央の静止区間だけ伸ばしたいTitleではKeyframe Stretcherを検討します。Fusion Transitionの時間変更については、**Resolve Parameter Modifier**を使う別の方法が示されています。

**Media Poolの素材を差し替えたい**：Template内のMediaInで**ClipName**をExportすると、EditのInspectorへ映像をドロップできる**Media Drop Zone**を作れます。内部にMediaInがあるだけで自動的に出現するわけではありません。

**別PCで見た目が変わる**：.drfxへ関連アセットを同梱できても、別のPCに同じフォントや外部プラグインがあるとは限りません。配布先で実際の画像とアニメーションを確認します。

**Macroを後から修正したい**：21.1の**Update from Selected Tools**は、元ノードの変更を取り込みながら公開ControlとInspector配置を保つ機能です。変更後もCopy Macroで試してから保存します。

## 完成を判断する

Edit用のTemplateは保存しただけでは完成ではありません。**Effects Libraryに表示されるか、Timelineに配置できるか、公開Controlが操作できるか、違う素材でも入出力が正しいか**を確認します。Title・Effect・Transitionでは必要な入力ノードが異なる点が、制作上の重要な違いです。

## 関連記事

- [Macro：公開端子とMacro Editor](../nodes/utility-io/macro)
- [Macro / Templateで再利用単位を作る](../learn/06-reuse/macros-templates)
- [User Controlsで公開インターフェースを作る](../learn/06-reuse/user-controls)
- [GroupでGraphをまとめる](../learn/06-reuse/groups)
- [再利用の境界を選ぶ](../patterns/reuse/choose-reuse-boundary)
- [Edit ↔ Fusionの境界](./edit-fusion-boundary)

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）**を基準にしています。

- Chapter 67「Node Groups, Macros, and Fusion Templates」**pp.1429–1437**：Macro Editor、Title Template、保存先と再起動。
- 同章 **pp.1438–1446**：Transition／Generator／Effectの構成、複数レイヤー、時間調整。
- 同章 **pp.1447–1449**：Media Drop Zone、PNGアイコン、.drfx Bundleと削除時の注意。
- 公式資料：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

制作例は21.1 Manualの機能を組み合わせた説明です。全OS・Edition・外部アセットでの実機検証は行っていないため、verificationはpartialを維持しています。
