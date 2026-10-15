---
title: Color ↔ Fusionの境界
description: "Fusionでの合成とColorでのグレーディングの分担、RCM・ACESと手動色管理、Viewer LUTとMediaOutの違いを説明。"
doc_type: concept
term_id: color-fusion-boundary
term_short: Fusion内で画像を合成する処理と、Colorページでショットの色を整える処理の分担。
verification: partial
product_scope: resolve
suite_surfaces: [fusion, color]
tasks: [choose-surface, color, composite, cross-page-workflow]
level: foundation
updated: "2026-10-15"
---

# Color ↔ Fusionの境界

**Fusionはショットの中身を作り替える合成、Colorはショット同士の色や明るさを整えるグレーディングが中心です。** Fusionにも色補正Nodeがあり、Colorでも部分的な合成はできます。使える機能だけで区切るのではなく、どの工程が何を仕上げるのかを決めます。

もう一つ重要なのは、**素材をFusionへ渡すときと、Colorへ戻すときの色空間**です。FusionのViewerで見えている色、合成に使う実際のRGB値、Colorページに届く値は必ずしも同じではありません。「Fusionで暗く見えたからGamutを追加する」だけでは、同じ変換を二度かけることがあります。

## FusionとColorの分担

| 作業 | まず使うページ | 理由 |
| --- | --- | --- |
| グリーンバックを抜いて別の背景と重ねる | Fusion | Keyerが作るAlpha（透明度）と画像の前後関係を管理する |
| 看板を消す、カメラに追従する文字を入れる | Fusion | 画像の一部を置き換え、MaskやTrackerを組み合わせる |
| CGを実写に合わせる | Fusion | 位置・ぼけ・反射・影など、合成する要素同士を合わせる |
| ショット全体の露出やホワイトバランスを調整する | Color | 同じシーンのほかのショットと比較して整える |
| シーン全体のルックを揃える | Color | ショット間の連続性と最終的な表示を見て調整する |

例えば、CGの明るさをそのショットの照明になじませる調整はFusion内で行えます。その結果を含む完成ショットの肌やコントラストを、前後のカットと揃える作業はColorに残せます。**局所的な合成の整合性**と**作品全体の色の連続性**を別の責任として考えます。

## 「素材の色」「計算する色」「Viewerの色」を分ける

色を合わせる際は、次の3つを混同しません。

1. **素材の解釈**：RGBの三原色・白色点が何か、Log／Gamma／Linearなどの符号化が何かを確定する。Color Spaceの情報を指定するだけでは、必ずしも画素値の変換は行われません。
2. **合成の処理空間**：光量に比例する**Linear（線形光）**で処理すると、光の加算、Blur、合成などを適切な値の領域で計算できます。「Linear」という名前だけではRGBの色域まで決まりません。
3. **モニターへの表示**：Fusionの**Viewer LUT**は、作業中の画像を表示用に変換するプレビューです。Viewer LUTを切り替えても、Node間で受け渡す画像データにその変換を焼き込むわけではありません。

例えば、3Dソフトから出したLinear EXRとLog撮影素材をそのままMergeしても、符号化の条件が一致しないため正しく合成できません。RGB色域も確認し、**合成する素材を共通の色域・ガンマへ揃える**必要があります。

## Resolve Color Management（RCM）を使う場合

DaVinci Resolveの**Project Settings > Color Management**で**Color Science**を**DaVinci YRGB Color Managed**にすると、21.1 Reference Manualは次の経路を説明しています。

~~~text
素材（Input Color Spaceを正しく割り当てる）
    ↓
MediaIn：Fusion用のLinear画像へ自動変換
    ↓
Fusion：Merge／Keyer／Blur／CG合成
    ↓
MediaOut：Timeline Color Spaceへ自動変換
    ↓
Color：ショット全体の色やルックを調整
~~~

**RCMが有効なとき、MediaIn直後とMediaOut直前にLinear変換用のGamut／CineonLogを機械的に追加しません。** RCMが自動変換するため、手動の変換を重ねると色や明るさが変わることがあります。

素材の入力解釈が誤っていれば、自動処理でも期待する色にはなりません。Media Poolの対象クリップを右クリックし、**Input Color Space**を収録素材と一致するように指定します。Color Management自体の不一致を、Fusionの補正Nodeだけで埋め合わせないようにします。

ViewerのLUTメニューを**Managed**にすると、RCMの設定に応じた表示で作業できます。ManualではRCMのOutput Color Spaceを使ってLinear画像をプレビューすると説明されています。表示変換とMediaOutの変換は別の経路です。**Managedを選択したことは、出力画像に追加のガンマ変換を保存したことではありません。**

### ACESの場合

Resolveプロジェクトを**ACES**で管理している場合も、ManualではFusionがLinear画像を扱うと説明しています。またRCM／ACESではMediaOutがColorページへの受け渡し時にTimeline側の色空間へ戻します。

ACES管理下のMediaInに「ACESだから」という理由だけで手動のLog→Linear変換を重ねません。一方、Fusionで独立して読み込むファイルの解釈が自動的に正しいとは決めつけず、その素材の色空間を確認します。

**Fusion Studio単独のACES運用**はResolveのプロジェクト管理とは異なります。StudioではOCIO（OpenColorIO）などを使って入出力変換を設計します。両者を同じ自動処理として扱わないでください。

## RCMを使わない場合：入口と出口を自分で管理する

Project Settingsで**DaVinci YRGB**などの非管理構成を使う場合は、RCMによるMediaInの自動Linear変換がありません。素材に応じてFusion内で変換を構成します。

~~~text
Log素材 → MediaIn → 必要なLog→Linear変換 ─┐
                                          ├→ Mergeなど → 必要な出力変換 → MediaOut
CGのEXR → Loader → 色域・ガンマを確認 ──┘
                           ↑
               Viewer LUTは表示のためだけ
~~~

Log素材にはMediaInのガンマ解釈と**Remove Curve**を使うか、[Gamut](../nodes/color/gamut)／CineonLogを使って、実際にLinearの画素値へ変換します。合成後は、後工程に必要な出力色空間・ガンマへ戻してMediaOutへ渡します。**RCMが有効な構成にこの手順をそのまま追加しない**のがポイントです。

最初からLinearとして保存されたEXRは、さらにLog→Linear変換する必要はありません。ただし、**LinearでもRGBの色域が違えば、同じRGB値は同じ色ではない**ため、CG側のレンダリング仕様を確認します。

また、Linear画像を表示変換なしでViewerに出すと暗く、ハイライトが極端に見えることがあります。このときはまずViewer LUTを確認します。Viewer表示を直すためだけに、画像データへ表示用の変換を焼き込む必要はありません。

## 実例：人物とCGを合成してColorで仕上げる

1. Editページから人物のショットをFusionで開き、[MediaIn](../nodes/utility-io/media-in)を確認します。RCMが有効なら素材のInput Color Spaceの割り当てを点検します。
2. 背景に使うCGのEXRを[Loader](../nodes/utility-io/loader)で読み込みます。Linearかどうか、どのRGB色域で書き出したかを調べ、実写側と同じ合成用空間へ揃えます。Loaderのファイル解釈を、MediaInに対するRCMの自動処理と同一だと仮定しません。
3. 人物のグリーンバックを[Delta Keyer](../nodes/matte-keying/delta-keyer)などで抜き、CGを背景として[Merge](../nodes/compositing/merge)します。人物のAlphaがStraight（非乗算）かPremultiplied（乗算済み）かも確認します。二重乗算は輪郭を暗くする原因になります。
4. 結果を[MediaOut](../nodes/utility-io/media-out)へ接続します。RCMまたはACESの自動変換が有効なら、重複するTimeline用の変換を追加しません。
5. Colorページでショット全体の露出、肌の色、コントラストを周囲のカットに合わせます。

この分担なら、CGの位置や素材の差し替えはFusionで、シーン全体の色の連続性はColorで直せます。人物だけをColorで補正したいときは、Fusionから追加のMediaOutでMatteを渡し、Colorの**Add Source**からCorrectorの**Key入力**へ接続する方法もあります（[MediaOutの制作例](../nodes/utility-io/media-out)参照）。

## 色が違うときの調べ方

| 症状 | まず確認すること |
| --- | --- |
| FusionのViewerでだけ暗い／強いハイライトになる | Linear画像をViewer LUTなしで表示していないか。RCMならManagedの設定を確認 |
| FusionのViewerとEdit／Colorの見え方が違う | MediaOutの**Color Grade（None／Color／Mix）**はプレビューの切り替え。後段のグレーディングやEdit側エフェクトを含めているか |
| 合成結果が異常に暗い・明るい | RCM／ACESの自動変換とGamut・CineonLog・Remove Curveの手動変換が重複していないか |
| CGだけ色や明るさが合わない | EXRと実写のRGB色域、Gamma／Linear、色空間メタデータと実際の画素値が一致するか |
| 人物の縁だけ黒い／白い | 色だけでなく、Straight／Premultiplied AlphaとAlpha Multiply／Divideも調べる |
| EXR保存後にTimelineとは色が違う | [Saver](../nodes/utility-io/saver)の出力色空間・Apply Curveと、MediaOutのTimeline向け変換を区別する |

**MediaOutはResolve内部へ返す出口、Saverはディスクへ書き出す出口**です。Viewer LUTやColorページの処理を通した見た目と、Saverが保存したEXRの画素値を同じものとして比較しないようにします。

## 関連ページ

- [MediaIn／MediaOutの境界](./media-in-out-boundary) — Fusionへ入る素材とTimelineへ戻る画像
- [MediaIn](../nodes/utility-io/media-in) — Source Color Space／GammaとRemove Curve
- [MediaOut](../nodes/utility-io/media-out) — RCM／ACESの受け渡し、Color Gradeプレビュー、Matte
- [Loader](../nodes/utility-io/loader) — EXRの色・Alphaを読む
- [Saver](../nodes/utility-io/saver) — ファイル出力時の色空間・ガンマ設定
- [Gamut](../nodes/color/gamut) — 手動での色変換
- [Alpha](../learn/04-compositing/alpha) — 透明度と色の関係
- [どの作業ページを使うか](./choose-working-surface) — 各ページの役割

## バージョンと出典

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（2026年9月）に基づきます。

- **Chapter 9「Data Levels, Color Management, and ACES」p.243**：RCMのMediaIn→Linear→MediaOut→Timelineの処理、Viewer LUT、RCM無効時の手動管理。
- **Chapter 76「Managing Color for Visual Effects」pp.1653–1659**：Linearでの合成、Gamut／CineonLog／MediaInのRemove Curve、Viewer LUT、RCMの自動変換とInput Color Space。
- **Chapter 76 pp.1660–1661**：ResolveのACESとFusion StudioのOCIO、ACES時のLinear処理。
- **Chapter 104「I/O Nodes」pp.2419–2422**：MediaOutの色管理・Color Gradeプレビューと複数MediaOut。
- **Chapter 104 pp.2407–2419、2423–2430**：Loader・MediaInの入力設定とSaverの出力色空間・ガンマ設定。

実機ごとのInspector項目・既定値、個々の素材での色変換結果、全Edition差については追加検証していません。
