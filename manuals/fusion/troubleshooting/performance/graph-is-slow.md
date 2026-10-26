---
title: Flowが重い / 遅い
description: Fusionのプレビューとタイムライン再生の遅さを分け、Node、DoD・RoI、RAMキャッシュ、Proxyを順に診断する。
doc_type: diagnostic
verification: partial
aliases: [重い, 遅い, slow graph, slow Fusion, プレビューが遅い, Fusionがカクつく]
concepts: [domain-of-definition, region-of-interest, data-domain, frame-evaluation]
patterns: [last-good-first-bad, defer-domain-conversion]
nodes: [Text+, Background, Blur, Merge, MediaOut]
tasks: [debug, performance, optimize-graph]
symptoms: [slow-graph, slow-render, slow-viewer, slow-playback]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-26"
---

# Flowが重い / 遅い

FusionのFlowが重いとき、Nodeの数だけでは原因を判断できません。まず、**Viewerが1フレームを計算するのに時間がかかる**のか、**未キャッシュのフレームを再生している**のか、**Editページで完成結果の再生が遅い**のかを分けます。この違いによって、確認する設定と修正場所が変わります。

## まず確認すること

1. **遅い場所を決める。** FusionのViewerで静止フレームを更新するとき、Fusionページで連続再生するとき、Editページのタイムラインで再生するとき、Deliverで書き出すときのどれかを記録します。すべてを同じ「描画が遅い」とは扱いません。
2. **Viewerの表示対象を確認する。** Node Editorで実際に見ているNode名を確認し、問題のNodeとその直前を同じフレームで比較します。最終映像だけでは遅くなる段階を絞れません。
3. **再生範囲とキャッシュ状態を確認する。** FusionのTime Rulerに表示される緑の線は、現在Viewerで表示しているNodeについてRAMにキャッシュ済みのフレームを示します。未キャッシュの区間と、緑の区間を続けて再生した結果は分けて記録します。
4. **プレビュー品質と更新状態を確認する。** FusionのPrx（Proxy）、Aprx（Auto Proxy）、Selective Updatesの状態を控えます。Selective Updatesが**None（No Update）**だと描画そのものが止まるため、速くなったように見えても処理速度の改善ではありません。
5. **すぐに全体を初期化しない。** RAMキャッシュの削除、全Nodeの品質変更、出力解像度の変更をまとめて行わず、先にどの段階が遅いかを調べます。

## 最小の診断例：文字にBlurを加える

外部動画のデコード性能に影響されにくいよう、まず内蔵Nodeだけで比較できます。次の構成は**診断用の組み方**であり、この通りに作れば必ず重くなるという再現実験ではありません。

~~~text
Text1 ──→ Blur1 ───────────→ Merge1［Foreground］ ──→ MediaOut1
Background1 ──────────────→ Merge1［Background］
~~~

1. Fusionで1920×1080のCompositionを用意します。Text+（Text1）の文字列を「SLOW」、Background1を暗い不透明色にして、Merge1の前景・背景へ接続します。
2. Text1とMerge1をそれぞれViewerに表示します。**期待結果：** 文字が背景の上に見え、Merge1からMediaOut1へ画像が届きます。
3. Text1とMerge1の間へBlur1を接続し、Inspectorの**Blur Size**を0から20へ変えてみます。**期待結果：** Text1の輪郭はそのままで、Blur1以降の文字だけが柔らかくなります。Blurの設定を変えても見た目が変わらない場合は、性能診断より先に接続と表示対象を直します。
4. 同じ48フレームの範囲で、一度目の連続再生と、Time Rulerの緑線を確認した後の再生を分けて観察します。表示中の実測FPSと、どのNodeをViewerに出していたかを記録します。**緑線がない区間の再生が遅く、キャッシュ後だけ滑らか**なら、まず未キャッシュフレームの計算待ちを疑います。
5. Blur1の設定だけ元に戻して同じ区間を見ます。戻した状態、現在の表示フレーム、キャッシュの有無が異なると比較になりません。結果に差があっても、**Blur単体の処理時間を測定した**とは言いません。

この例で速度差が出なければ、それだけで元の案件の問題が消えたわけではありません。次の切り分け手順を実際に重いFlowへ適用します。

## 原因を切り分ける

### 1. 最後に軽かった段階を探す

元のFlowの配線や設定を保存したうえで、同じフレームを次の順にViewerへ出します。

~~~text
入力 → 前処理 → Blur / Key / Tracking → Merge → MediaOut
          ↑                ↑
       直前を観察       次の段階を観察
~~~

最後に問題がなかった地点と、最初に待ち時間が増えた地点を特定します。分岐が複数ある場合は、各分岐の出口を先に調べてからMergeを確認してください。

次に、該当Nodeを1つだけ一時的にパススルーにする、または検証用のコピーで切り離して比較します。**解除後に見た目も計算範囲も変わる**ため、改善しただけで「そのNodeの実装が悪い」とは断定しません。入力解像度・Alpha・DoD・参照フレームも合わせて確認し、元の構成へ戻します。

この方法は[Last Good / First BadでGraphを切る](../../patterns/debugging/last-good-first-bad)と[分岐を分離する](../../learn/07-debugging/isolate-branches)に沿っています。

### 2. DoDとRoIを分けて確認する

**DoD（Domain of Definition）**は画像に有効データがある矩形領域、**RoI（Region of Interest）**はViewerが今回描画を要求する領域です。同じ1920×1080でも、Text+の文字の周辺だけにDoDがある場合と、全画面を処理する場合があります。

1. 重いNodeの前後をViewerへ出し、右クリックして**Region > Show DoD**を有効にします。フレーム全体と有効領域の大きさを見比べます。
2. ViewerのRoIボタン、または右クリックの**Region > Show Region**でRoIを表示します。文字の周辺など、今確認したい場所へ矩形を縮めます。新しい矩形を描く場合は**Region > Set Region**を使います。
3. 同じフレームを更新し、必要な一部分だけが更新されるか確認します。**期待結果：** Viewerが計算を要求する範囲が狭まり、高解像度・複雑なFlowでは表示待ち時間が短くなる場合があります。短縮量は素材とNodeによります。
4. **Region > Reset Region**またはRoIの無効化で全体表示へ戻し、MediaOutの結果を確認します。

RoIは**プレビューの計算範囲**です。MediaOutやSaverから出る完成画像をその矩形で切り抜く設定ではありません。ただし、そのViewerで作成するFlipbook PreviewはRoIを反映します。RoIの外に古いピクセルが残っていても、画像データが失われた証拠にはなりません。

DoDは必要な領域の計算を省く助けになりますが、値を無条件に狭めると内容が欠けることがあります。Blurのように周囲の画素を参照する処理では、Inspectorの**Clipping Mode（Frame / Domain / None）**によって境界の見た目も変わります。速度を優先して設定を変えた場合でも、文字やマスクの縁が切れていないかを最後に確認してください。

詳しい違いは[有効領域（DoD）](../../learn/03-space/domain-of-definition)と[Blurの仕様](../../nodes/blur-filter/blur)で説明しています。

### 実機の参考画像：DoDとRoIの表示位置

<!-- capture-reuse:R49 -->

[![Text+の文字に対してDoDの矩形を表示したViewer](/img/fusion/captures/S26/dod.png)](/img/fusion/captures/S26/dod.png)

[![同じViewerにRoIとDoDの異なる矩形を表示した例](/img/fusion/captures/S26/roi.png)](/img/fusion/captures/S26/roi.png)

Resolve Studio 21.1.0.14／Windowsで撮影した既存S26の例です。文字周囲のDoDと、別範囲へ指定したRoIを示しています。**FPSの比較や速度改善を測定した画像ではありません**。RoI外には過去に計算されたピクセルが見える場合があります。[撮影条件と確認範囲](/img/fusion/captures/S26/capture.json)。

### 3. RAMキャッシュとプレビュー品質を確認する

FusionのViewerでは、描画済みフレームをRAMへ保持して再生時に再利用します。キャッシュがない範囲では新たな計算が必要です。

- **Time Rulerの緑線：** 現在表示しているNodeのキャッシュ済みフレームを示します。緑線がある区間で滑らかでも、同じGraphの未キャッシュ区間が速くなるとは限りません。
- **赤線：** 品質やProxy設定を切り替えた際、以前の品質のキャッシュを一時保持している表示です。緑線と同一条件の比較に使いません。
- **Prx（Proxy）：** Fusion内でViewerへ描画する画像を低解像度化する作業用設定です。輪郭や細部の最終確認時は元の品質へ戻します。
- **Aprx（Auto Proxy）：** Inspector等の値をドラッグしている間だけ低解像度表示にし、操作を離すと通常解像度へ戻す機能です。調整中の応答改善に使います。
- **Selective Updates：** 既定の**Some（Selective）**は現在のViewerに必要なNodeを描画します。**All**はNode Editorのサムネイル更新などを含め全Nodeを更新する用途、**None**は更新停止です。Noneのまま「処理が速くなった」と評価しないでください。

メモリ上限に達すると優先度の低いフレームキャッシュが破棄されます。Resolveでキャッシュの使用上限を確認する場合はPreferencesの**Memory and GPU > Limit Fusion Memory Cache To**を見ます。ただし、値を大きくすれば必ず速くなるわけではありません。ほかのアプリのRAM使用量や同じ区間の繰り返し再生も記録します。

### 4. タイムラインのキャッシュとは別に考える

**Fusionページ内で編集中の遅さ**と**Editページで完成クリップを再生するときの遅さ**は別に診断します。

- **Fusion RAM Cache：** Fusion Viewerでフレームを繰り返し見るときのメモリ内キャッシュです。
- **Fusion Output Cache：** Resolveのタイムラインにある、Fusion Effects適用クリップ等のFusion出力を保存して再生するキャッシュです。**Playback > Render Cache > Smart**を使うか、対象クリップの**Render Cache Fusion Output**を設定して動作を確認します。設定・対象クリップ・キャッシュ完成状況を確認してください。
- **Timeline Proxy Resolution：** Resolveの**Playback > Timeline Proxy Resolution > Half Resolution / Quarter Resolution / None**はタイムライン側の作業解像度を下げます。保存済みのProxy Mediaを作る機能とは別です。

Fusion Output Cacheはタイムライン上のクリップを対象にします。Media Poolの素材表示やFusion Viewer内のすべての計算を、常に速くするわけではありません。ColorページのNode CacheやRender Cache全体をFusionのRAMキャッシュと同じ設定と考えないでください。

## 主な原因と修正方法

| 確認した状態 | 考えられる原因 | 最小の修正・確認 |
| --- | --- | --- |
| 最初の再生だけ遅く、緑線の区間は滑らか | 未キャッシュフレームの計算待ち | 同じ区間でキャッシュ後の再生と区別し、必要な範囲の作業に絞る |
| Viewerで1フレームの更新自体が遅い | 特定Node、解像度、広いDoDなど | 直前と直後のNodeを比べ、RoIで必要範囲だけ表示する |
| 値のドラッグ中だけ反応が重い | 毎回フル品質でViewerを描画している | Aprxを試し、操作を離した後は通常品質で確認する |
| Prxを使うと滑らかだが輪郭が粗い | 作業表示を低解像度化している | 品質確認時にPrxを戻し、元解像度で出力を見る |
| Blur後に輪郭が途切れる | DoDとClipping Modeの組み合わせ | Frame / Domain / Noneを比較し、見た目を保つ設定を選ぶ |
| Fusion Viewerは動くがEditの再生が重い | タイムラインのFusion出力が未キャッシュ | 対象クリップのFusion Output CacheとPlayback設定を確認する |
| 重い分岐を1つ外すと改善する | その分岐に計算負荷が集中している可能性 | Nodeの入力・計算領域・重複処理を1つずつ見直す |

Shape、Particle、Classic 3D、USDなどは、それぞれ通常の2D Imageと異なるデータを扱います。早い段階でRendererを通して2D Imageへ変換すると後段で広い画面を処理する場合がありますが、**変換を後ろへ移せば常に速い**という規則はありません。Nodeの出力の種類と必要な合成順を確認したうえで、比較可能な構成だけを検討します。

時間方向へ複数フレームを参照する処理、3D、トラッキング、重いフィルター、同じ計算を繰り返す分岐も候補です。ただし、どれが律速かは対象Graphごとの観測なしには断定できません。

## 修正できたかの判定

同じ素材、同じフレームまたは48フレームの区間、同じViewer対象、同じプレビュー品質で比較し、変更前後の**最初の描画待ち**と**キャッシュ後の再生**を別々に記録します。変更した設定は1項目ずつに留めてください。

性能が改善しても、MediaOutの完成画像、文字・マスクの輪郭、透明部分、必要な解像度が維持されていることを確認します。RoIやPrxは作業時のプレビューに使い、完成結果の品質を確認するときは必要に応じて元に戻します。

原因の場所が分かったら、[Graphの診断方法](../../learn/07-debugging/diagnose-graph-not-symptom)で関連する分岐へ絞り、Node固有の設定は各Referenceで確認します。

## バージョン・出典・未検証範囲

一次資料はBlackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）です。

- **Chapter 63、pp.1292、1302–1304：** Fusion ViewerのRoI、Prx / Aprx、Selective Updates、Fusion RAM Cache、緑／赤のキャッシュ表示とメモリ上限。
- **Chapter 68、pp.1479–1481：** DoD・RoIの意味と操作、MediaOut/SaverはRoIに切り抜かれないこと、Flipbook Previewの例外。
- **Chapter 92、p.2111：** BlurのClipping Mode（Frame / Domain / None）とDoD境界。
- **Chapter 8、pp.195–196、200–202：** Timeline Proxy Resolution、Smart / User Render Cache、Fusion Output CacheとColor Node Cacheの区別。

**公式Manualで確認済み**なのは各機能の意味・名称・操作とキャッシュの適用範囲です。ここに示した切り分け順序とText+の48フレーム比較は、それらに基づく**診断手順案**です。S26はDoD/RoIの表示例であり、速度測定ではありません。現在のFusion 21.1実機におけるFPS・メモリ削減量、個別GPU/OS/Edition、全Node・全素材の性能差、具体的な最速設定は未検証のため、ページの状態は「partial」としています。

## 関連する症状

- [Viewerに何も表示されない](../viewer/nothing-visible)：キャッシュ・更新状態と、実際に画像がない場合を分ける。
- [Fusionで解像度が合わない](../position-size-resolution/resolution-does-not-match)：サイズ変更と画質・計算範囲の取り違えを確認する。
- [DoDと解像度を使った診断](../../learn/07-debugging/resolution-domain-of-definition)：端が欠ける場合の調査。
