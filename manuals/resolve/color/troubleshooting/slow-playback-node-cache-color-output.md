---
title: ノイズ除去で再生が重いとき：Node CacheとColor Output Cacheの使い分け
description: Colorページの重い補正を、Smart／User、ノード単位のキャッシュ、クリップ全体のキャッシュ、キャッシュ形式に分けて診断する。
doc_type: troubleshooting
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Render Cache, Smart, User, Node Cache, Render Cache Color Output, Render Cache Format, Noise Reduction]
tasks: [troubleshoot, playback-performance, cache, noise-reduction, grading]
level: intermediate
updated: "2026-10-28"
---

# ノイズ除去で再生が重いとき：Node CacheとColor Output Cacheの使い分け

Colorページでノイズ除去を有効にすると、静止画では補正を確認できても再生が途切れることがあります。そこで使う**レンダーキャッシュ**は、重い計算を済ませた中間結果を保存し、再生時に再利用する仕組みです。ただし、素材のデコード、Colorノード、Editページの合成はキャッシュの対象が異なります。

このページでは、**どこまでを事前計算し、どの調整を引き続き動かしたいか**によって方法を選びます。ノイズ除去そのものの品質問題は[Temporal NRの残像診断](./temporal-nr-motion-artifacts)で扱います。

## 診断用の素材とノード構成

次の**想定素材**で確認します。実機での性能測定結果ではありません。

- DaVinci Resolve **21.1 Studio**、3840×2160／25fps／10-bit Logのインタビュー素材を2ショット（各10秒）。人物の顔と暗い壁が映り、一部で手が動きます。収録コーデックやPC性能は固定しません。
- ColorページのClipノード：**01 基礎補正 → 02 Temporal Noise Reduction → 03 Look**。02の前段は補正済み、03では彩度やコントラストを仕上げていく段階です。
- 比較するのは、02を通した**再生の安定性**と、03を調整したときに**02のキャッシュを作り直す必要があるか**。画質の評価は別に行います。

この例でTemporal NRを使う理由は処理負荷の切り分けです。**Motion EffectsのNoise Reductionは21.1 Manual上Studio版専用**であり、Free版に同じ操作を要求しません。別の重いResolve FX／OFXを使う場合にも、キャッシュの考え方を応用できます。

## まず重い場所を切り分ける

| 観察 | 可能性と次の確認 |
| --- | --- |
| 02のNRを無効化すると再生が改善する | NRを含むノード計算が候補。まずノードキャッシュを試す |
| NRを無効化しても、元素材の再生から重い | H.264／HEVC／RAWなどのデコードやストレージの影響を確認。Fusion Output CacheとNode Cacheを混同しない |
| キャッシュが完成しても03のLook変更で再計算が始まる | Clip全体のColor Outputをキャッシュしていないか確認 |
| キャッシュ再生でハイライトだけ不自然に切れる | キャッシュ形式が範囲外の信号値を保持できているか確認 |

まず同じ10秒間を補正前後で再生します。[Colorノードの基本](../learn/color-node-graph)と[Noise Reduction](../reference/noise-reduction)で、重い処理がどのノードにあるか確認してください。再生が止まっただけで元映像のノイズや残像が増えたと判断せず、画像の副作用と処理速度を別々に記録します。

## 手順1：Smartで重いノードを自動キャッシュする

1. **Playback > Render Cache > Smart**を選択します。Resolve 21.1 Manualでは、SmartはNoise Reduction／Motion Blur／Resolve FX・OFXを使うColorノードを自動キャッシュ対象にします。
2. 02のNRノードを確認します。Colorページではキャッシュ対象ノードの番号に状態が表示されます。Editページのタイムラインでは**赤が要キャッシュ、青が完了**です。
3. クリップを再生するか、プロジェクトでBackground Cachingが有効なら無操作時間後の処理を待ち、対象区間がキャッシュされるか確認します。赤のままなら、まだ完了していません。
4. 02の処理が完了した後、03のLookだけを変えます。02とその上流をキャッシュした構成なら、下流の03を調整するたびに02の計算まで繰り返さずに済む、というのがノードキャッシュの利点です。

**期待する変化：** NRを含む処理が先に計算され、03の補正を動かしながら02の結果を再利用できます。ただし、01または02の内容を変えれば、その変更に依存するキャッシュは更新が必要です。02の後段にも重い処理があれば、02のキャッシュだけで全体が滑らかになる保証はありません。

## 手順2：Userでキャッシュ位置を明示する

Smartで対象にならない処理を自分で指定したい場合、**Playback > Render Cache > User**へ切り替え、02を右クリックして**Node Cache > On**を指定します。ManualのUserモードでは、明示的にOnにしたノードとその上流がキャッシュ対象です。

同じメニューの**Auto**はSmartで自動条件を満たした場合の対象、**Off**はSmart／Userのどちらでも対象から除外する設定です。02がOffなら、Smartに切り替えるだけでは期待どおりにキャッシュされません。

01に重い処理がなく02のNRだけが重いときは、02をキャッシュ位置にして03を編集可能に保つ構成から試します。**02の結果がキャッシュ済みか**と**03の変更時にキャッシュが再生成されないか**を分けて確認してください。

## 手順3：Color Output Cacheは仕上げ後に検討する

Editページのタイムラインで対象クリップを右クリックし、**Render Cache Color Output**を有効にすると、Colorページの**ノードグラフ全体の出力**をキャッシュします。編集ページでの再生やトリミングを軽くしたい場合に有効な選択肢です。

ただし、Manualは、Color Outputをキャッシュしたクリップでは**グレードのどこを調整しても全体の再キャッシュが必要**と明記しています。またSmartモードでは、そのクリップに関連する**すべてのVersion**もキャッシュ対象になります。03のLookを頻繁に変える段階では、02だけのNode Cacheの方が手戻りを抑えられる場合があります。

ノード単位で重い処理を固定して仕上げを続けるのか、グレードを確定して編集ページの再生を優先するのかを、作業段階に合わせて決めます。[Versionsの使い分け](../reference/versions-and-grade-comparison)にも関連します。

## キャッシュ形式と保存場所を確認する

**Project Settings > Master Settings**の**Render Cache Format**が低い精度や狭い信号範囲の形式だと、キャッシュ後の明るい部分で情報が失われる場合があります。公式21.1 Manual Chapter 8（pp.201–203）は、HDRなど範囲外の値を保持する用途に**16-bit float、ProRes 4444／4444 XQ、DNxHR 444**を挙げています。利用可能なコーデックは環境によって異なるため、ここでは固定の推奨プリセットにしません。

キャッシュの保存先はPreferencesのMedia StorageにあるScratch Disksの先頭ドライブに依存します。保存先が遅い・容量不足なら、計算完了後の再生も期待どおりにならない可能性があります。まず書き込み先の空き容量と速度を確認してください。

Deliverページには**Use Render Cached Images**という書き出しオプションがあります。低品質のキャッシュ形式を選んだまま利用すれば、その制約が成果物にも影響し得ます。[納品前Color QC](../recipes/pre-delivery-color-qc)では、キャッシュ使用の有無と出力結果の確認を分けます。

## 改善しない場合の順序

1. **Playback > Render Cache > Off**になっていないか確認します。Offならどのレンダーキャッシュも使われません。
2. 対象ノードが**Node Cache > Off**でないか確認します。Smartの自動キャッシュ条件と手動Offは別です。
3. Editページのキャッシュ表示が赤なら、まだ完了していません。再生・Background Cachingの設定、ストレージ状態を確かめます。
4. 青なのに遅いなら、NR以外の重い後段ノード、素材のデコード、Editページの効果やディスクを別々に調べます。キャッシュ完了だけで再生速度を保証しません。
5. Color Outputの再キャッシュが頻繁なら、作業中は**02のNode Cache**へ戻すことを検討します。グレードの変更点とキャッシュ更新の関係を確認します。
6. キャッシュ使用時だけ高輝度が切れる場合は、キャッシュ形式を比較し、[白飛び・黒つぶれ](./highlight-shadow-clipping)と区別します。

原因が確認できない段階でキャッシュを全削除する必要はありません。キャッシュの削除は計算済みデータを失い、再生成を要求するため、対象と理由を確定してから行います。

## 完成判定と未検証範囲

この想定例の合格条件は、**02の計算結果が再利用され、03のLookを変更しても02までのキャッシュを作り直す必要がなく、同じ10秒間を比較できる**ことです。Color Outputを選んだ場合は、グレード変更後の再計算が設計どおりに起きることも確認対象です。キャッシュ前後で画質が変わった場合は速度改善だけを合格にしません。

**出典：** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（September 2026）、Chapter 8「Improving Performance, Proxies, and the Render Cache」pp.200–206。2026年10月28日にLibrary内の公式PDF本文を直接確認。Smart／User、Node Cache、Color Output、キャッシュ位置・信号値保持・再生成条件を参照。Motion EffectsのEdition範囲はChapter 153「The Motion Effects and Blur Palettes」の公式記載を参照。

**verification: partial。** 素材・3ノード構成は説明用の想定であり、Resolve 21.1 Studio実機でのキャッシュ完了時間、GPU／CPU負荷、再生fps、ストレージ性能、出力結果や各コーデックの現環境対応は測定していません。ここで示した予測はManualに記載された動作を当てはめたもので、実測値ではありません。
