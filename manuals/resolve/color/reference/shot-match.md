---
title: Shot Match（別ショットを基準に色とコントラストをそろえる）
description: DaVinci Resolve 21.1のShot Matchについて、基準ショットの選び方、実行手順、Auto Colorとの関係、適用条件と限界を解説。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Shot Match, Shot Match to This Clip, Auto Color, Split Screen, Selected Clips]
tasks: [match-shots, balance-color, grade, troubleshoot]
level: intermediate
updated: "2026-10-25"
---

# Shot Match：別のショットに色を近づける

**Shot Match**は、Colorページの複数クリップを、選んだ基準クリップの色とコントラストへ自動的に近づける機能です。たとえばインタビューのAカメラとBカメラで背景の明るさや色の傾向が違うとき、手作業で合わせる前の初期案を作れます。

Shot Matchは、クリップを完全一致させる測色機能でも、作品のLookを自動で完成させる機能でもありません。公式21.1 Manualは、同じシーンのショットを近づけ、残りを手動で調整するための出発点と位置づけています。

以下はBlackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 129「Automated Grading Commands and Imported Grades」pp.3128–3133に基づきます。操作名と制約は資料で確認済みですが、21.1実機での結果は未検証です。

## Auto Color・Color Matchとの違い

| 機能 | 基準 | 使いどころ |
| --- | --- | --- |
| **Shot Match** | 別のクリップの色とコントラスト | 同一シーン内のカメラアングルやカット間の差を近づける |
| **Auto Color** | 現在の再生ヘッド位置のフレーム | 単独のクリップにニュートラルな自動補正案を作る |
| **Color Match** | 撮影したカラーチャートの既知の色 | チャートを記録した素材の初期色合わせ |

[Color Match／カラーチャート](./color-match-chart)は、既知のチャートの色を基準にします。Shot Matchは、**どのショットを正解に近い基準とみなすかを作業者が選ぶ**ため、基準側の色が不自然なら他のショットもその方向に寄ります。

## 適用前にそろえる条件

### 1. 信号を正規化してから比べる

公式Manualは、Shot Matchのアルゴリズムが**Rec.709／Gamma 2.4**の正規化された画像を想定して設計されていると説明しています。異なるLog素材をそのまま比較したり、Logのままの素材と表示変換済みの素材を混ぜたりする用途には向きません。

[カラーマネージメントの基礎](../learn/color-management-basics)を参照し、RCMなどで素材間の入力変換を整理します。特にLogCとRedLogCineのように記録方式が異なる場合、未正規化のままShot Matchへ渡さないことが重要です。ここに挙げたRec.709／Gamma 2.4は公式の設計上の条件であり、すべてのプロジェクトへ同じタイムライン設定を強制する指示ではありません。

### 2. 基準ショットと適用先のグレードを分ける

公式Manualが勧める条件は次のとおりです。

- **基準クリップ**は、必要ならLift／Gamma／Gainを中心とした簡単な一次補正までに留めます。大きなCustom Curvesや二次補正があると、合わせにくくなります。
- **合わせる側のクリップ**は、既存のノード調整がない状態を基本とします。調整済みクリップへのShot Matchは結果を予測しにくいと説明されています。
- **照明や画面構成が大きく違うカット**は、同じ外観へ近づく余地が限られます。極端な暗部と明部の差を無理に伸ばす処理は期待しません。

ManualのAuto Color説明では、各クリップへ先に**Aボタン**を適用してからShot Matchを使う流れも紹介されています。一方、詳細ガイドラインは「合わせる側を未グレードにする」と説明しています。両者を無条件に同じ手順として扱わず、Auto Colorを併用する場合も小数クリップで先に結果を確かめます。

## 操作：複数ショットを1つの基準へ合わせる

1. Colorページで、基準とするショットを決めます。照明、肌の色、ハイライト、背景がシーン全体の意図に近いものを選びます。
2. Thumbnail Timelineで、**合わせたいクリップをCommand-clickまたはShift-clickで選択**します。基準クリップ自体は選択に含まれていても、含まれていなくてもかまいません。
3. 必要ならViewer Optionsの**Split Screen → Selected Clips**を使い、対象クリップを並べて比較します。
4. **基準クリップを右クリック**し、**Shot Match to This Clip**を選択します。選択していたクリップが基準側へ近づく処理です。
5. Viewerと[Scopes](./scopes)で、人物の中間調、白い物体の色、暗部、明部を比較します。その後、前後のカットを再生して違和感が減ったか判断します。

Shot Matchによる補正は、公式Manualによれば**使用時に選択されていたノードの最終段へ、LUTに似た形で内部的に適用**されます。ColorページのLiftやGainなど、ユーザーが編集できる個々のコントロールへ調整量が表示される方式ではありません。ホイールの数値が変化しなくても適用失敗とは限りません。

また、クリップごとにUndo履歴が独立するため、**複数クリップへの一括Shot Matchを1回のUndoでまとめて戻すことはできません**。最初からシーン全体を選択せず、少数のクリップで結果を確認します。

## 判断例：3アングルのインタビュー

同じ部屋で撮ったA（出演者の正面）、B（別アングル）、C（全景）のカットが混在し、Cの露出と色が最も安定している場面を考えます。

1. Cから照明と肌の見え方が意図に合う1カットを基準にします。
2. Bから1カットだけ選択し、Cを右クリックして**Shot Match to This Clip**を試します。
3. Bの肌や壁の色が近づき、不自然な暗部の持ち上がりがなければ、ほかのBカットへ適用範囲を広げます。
4. Aもまず1カットだけ試します。Aの背景色がCと大きく違う場合は、既にそろえたBを基準にする方が自然か比較します。
5. [Gallery／Stills](./gallery-stills)とScopesで基準を見比べ、最後は[Primaries](./primaries-color-wheels)などでショット別に微調整します。

これは公式Manual pp.3132–3133の「アングルを1つずつ試し、適した基準を選ぶ」考え方から組み立てた想定例です。全アングルで一致することや、実機での成功率を保証するものではありません。

## 結果が合わないとき

| 症状 | 優先して確認すること |
| --- | --- |
| 色や明暗が極端にずれる | 素材ごとのLog／Gamma、RCM・CSTの適用位置、正規化の有無 |
| 基準と近づいたが人物が不自然 | 基準ショットの一次補正、肌へ影響する背景色の分布、異なる照明条件 |
| 既に補正したカットだけ合わない | 合わせる側に残っているノード調整、基準側のCurves／二次補正 |
| 同じ照明のカットまでかえって違う | もともと一致していたカットに自動調整を重ねていないか |
| 全アングルを一度に合わせるとばらつく | 角度ごとに少数クリップを試し、より近い基準へ段階的に合わせる |

Manualは、背景に大きな単色の壁があるショットと屋外の緑が多いショットのように、画面内の色の分布が異なる場合を注意例に挙げています。画像全体の色分布を同じとみなしてしまう前に、人物と背景のどちらを合わせるべきか判断します。

## 出典・対応版・未検証範囲

- **一次資料：** Blackmagic Design, [*DaVinci Resolve 21.1 Reference Manual*](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（September 2026）, Chapter 129「Automated Grading Commands and Imported Grades」pp.3128–3133。「Auto Color」「Shot Match」「Shot Match Guidelines」「How to Use Shot Match」「Suggestions for Using Shot Match」を2026-10-25に直接確認。
- **公式配布元：** [Blackmagic Design Support](https://www.blackmagicdesign.com/support)。
- **確認済み：** 機能の目的、Shot Match to This Clip、複数選択、Selected Clips比較、Rec.709／Gamma 2.4に関する前提、調整先ノードでの適用方式、Undoとグレードに関する注意。
- **未検証：** Resolve 21.1実機の操作位置、Free／Studio差、特定のRCM／CST構成での挙動、AIアルゴリズムの精度、処理時間、実素材での画質と一括操作後の復元操作。**verification: partial**。
