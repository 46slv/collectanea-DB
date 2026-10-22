# 記事ワーカーの継続運用

更新: 2026-10-23。適用範囲: collectanea-DBの定期記事執筆・教材実装・統合。ユーザー承認により、必要なGitHub作業、定期タスクの整理、検証済み成果のmainマージと既存Pages配信までを対象とする。課金・credential・公開設定・保護設定の変更、force-push、履歴改変、branch削除は含まない。

## 役割と所有範囲

- Fusion A: `manuals/fusion/nodes/**` のノード解説。
- Fusion B: `manuals/fusion/learn/**`, `concepts/**`, `recipes/**`, `troubleshooting/**` の学習・制作例・問題解決。ただしこれらは全て `manuals/fusion/` 配下。
- Color A: `manuals/resolve/color/reference/**` の機能解説。
- Color B: `manuals/resolve/color/learn/**`, `recipes/**`, `troubleshooting/**` の学習・制作例・問題解決。ただしこれらは全て `manuals/resolve/color/` 配下。
- Reference A: `reference/visual-processing/` の階調・色の記事とDithering教材、対応する専用テスト。
- Reference B: 同ディレクトリの `filters/**`, `optics/**` と対応するBlur/Bloom/Sharpen/Sobel/DoG等の教材・専用テスト。
- **Collectanea Integrator**: 全laneのfan-in、共有索引・設定・検証スクリプト、CI、mainへのマージ、配信確認。定期運用でmainを更新する担当はこれ1つ。

共有index、package、sidebar、共通UI、CIはWriterが変更せず、PRに必要な接続を短く残す。新規記事とリンクは同じ統合候補に含めて検証できる。別laneの進行中branchを直接編集しない。既存記事の移管が必要ならIntegratorが担当を明記する。通常の人間による保守はCONTRIBUTINGに従う。

## Writerの完了条件

1. 最新main、担当範囲、open PRと必要なauthoring文書を読む。古い会話のSHAや固定PR番号から再開しない。
2. **1 Writer = 未統合の作業PRは最大1本**。既存の自分のPRがあれば修正・完成を優先する。新しい作業はfresh mainから独立branchを作り、他Writerの未統合branchをbaseにしたstackを増やさない。
3. PR本文に `Lane / Base SHA / Changed paths / Sources / Checks / Handoff / State` を残す。パスが他の作業中PRと重なる場合は、そのファイルには書かない。
4. 実質的な1記事または小単位を仕上げる。役割、入出力、具体例、注意点、出典、版、未検証範囲を書く。公式Manualを確認できない詳細値やedition差を推測で補わない。
5. 変更に応じた構文・リンク・focused testを確認してcommitし、remoteのSHAと本文を再取得する。ローカルだけの成果を保存済み・公開済みと言わない。
6. 完成したPRには `State: READY` とexact head SHAを記載する。Integratorが取り込んだ後は同じ候補を変更せず、追加案はHandoffへ残す。CI中に追加記事を積み続けない。

既存の巨大stackは移行用の保全資料。mainに未反映の差分をIntegratorが回収するまで削除しない。統合後はfresh mainで再開し、旧stackへ追記しない。

## Integratorの手順

- 全open PRをページ終端まで取得し、remote branch-only成果も引継ぎから回収する。最新candidateの変更パスとsource SHAを固定し、既存integration PRがあればそれを先に完了する。
- meaningfulな完成単位なら1記事でも統合できる。2 batch待ちを必須にしない。未完成・競合する変更は分離し、無関係な公開済み変更を巻き戻さない。
- `integration/*` の候補をcurrent mainに追随させる。behindは永続待ちではなくmerge/reconcileで解決し、重要な競合だけWriterへ具体的に返す。force-pushしない。
- source候補を凍結した後、main向けintegration PRをReadyにする。`Collectanea PR Quality` が自動起動する。通常のWriter PRとpushではheavy jobを起動しない。必要なmanual dispatchもこの運用の承認範囲。
- CIはexact headのcheckoutを検証し、script syntax、全catalog/playground単体テスト、production build、既存ブラウザ検証、Markdown統合を実行する。UI変更では変更した教材の操作確認も含める。
- 同じSHAで実行中または成功済みなら再実行しない。コード修正でheadが変わった場合だけ新候補として再検証する。古いSHAのPASS、skipped job、単なるPR mergeableを現在候補のPASSにしない。
- successful runのcandidate identityと必要job、未解決review、最新main/head、競合を確認し、expected head SHA付きでマージする。既存のsquash運用を基本とし、履歴保全が必要な移行fan-inはmerge commitを使用できる。
- mainのSHA・実内容とPagesのbuild/deployを再取得する。失敗なら公開完了と言わず、原因と再開条件を残す。mainに意味的に包含された旧PRだけ根拠を添えてcloseできる。branchは削除しない。

## 停滞と通知

GitHub権限、tool拒否、CI未起動を混同しない。利用可能な正規toolを確認し、安全拒否の迂回はしない。曖昧なwrite結果はreadbackで確認する。同じ候補・同じblockerで重い監査や同じwriteを反復しない。必要なpatchとsource SHAを保存し、追加の未配送成果を無制限に増やさない。

通常のblockerでWriterが自分や他taskを無効化しない。継続不能なら `BLOCKED` と具体的再開条件を通知する。失敗が変わらないrunは短い状態確認に留める。既にmergedのPRを毎回再レビューせず、新しい差分だけを見る。

通常報告は `DELIVERED / READY / MERGED / WAIT_CI / CHANGES_REQUIRED / BLOCKED / NO_CHANGE`、記事、exact SHA、PR/CI、次の一手を短く示す。実行時刻だけを正常稼働や成果の証拠にしない。
