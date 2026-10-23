# Fusion 21.1 スクリーンショット計画

更新: 2026-10-24。S01〜S30と再利用例を含む計92ページ・112原画crop・262掲載は公開確認済み。S31〜S35のAlpha・合成方式・Mask・Pivot・時間の例を掲載中。Fusion全体は未完了。

撮影候補は [fusion-screenshot-candidates.json](./fusion-screenshot-candidates.json) に記録する。記事の説明基準は [Fusion Authoring Contract](./fusion-authoring-contract.md)、技術出典はDaVinci Resolve 21.1 Reference Manual（2026年9月）。公式画像の転載ではなく、実機から独自に撮影する。

## 写真の種類

- **Node tile / ports**: Node名、入出力端子、色と向き。
- **Minimal graph**: 接続全体。Shape、Particle、3D、USDは2D画像への変換境界も見せる。
- **Inspector**: 本文で解説するTabとControl。必要ならTabごとに別カット。
- **Output / Comparison**: 実機出力と効果の前後。同じ素材・フレーム・解像度・色管理で比較する。出力画質が重要ならViewerのスクリーンショットに加えてロスレスPNGを出力する。

全Nodeに同じカット数を要求しない。初回は **S01 sGrid / S02 Merge / S03 Glow（計12カット候補）** で、形状複製・合成・発光を試す。次点は候補JSONのP1/P2を参照する。

## Codex実行条件

1. 対象repo、記事、候補JSONと21.1 Manualを確認する。
2. 検証専用Projectを用意し、既存の制作用Project・Timeline・キーボード設定は変更しない。
3. 再利用可能な小さなGraphを作る。Node選択、Inspector表示、Viewer出力はResolveの実GUIで確認する。ScriptingだけでUI画像が取得できるとは仮定しない。
4. 実機の端子・Control・結果が記事と異なれば差を記録し、確かめられない例を完成扱いにしない。
5. 画像は `static/img/fusion/captures/CASE_ID/SHOT.png` に配置する。同じディレクトリの `capture.json` へResolveの実測build、Edition、OS、UI言語、撮影時刻、Graph、重要設定値、再生フレーム、色管理、画像名、未確認事項を残す。
6. 実画像が揃ってから記事本文の近くへ画像・Alt文・短い解説を加え、対象ページをbuildする。空の画像リンクや架空UIで先行表示しない。

撮影品質は枚数でなく、端子・パラメータが読め、結果の違いが理解できるかで判断する。失敗した候補は理由を記録して保留する。

## 次段階

## Active Checkpoint — 2026-10-24

- Mission: Fusion全体の、画像が必要な箇所を実機撮影・記事掲載・GitHub反映・公開確認まで完了する。ユーザーはこの制作元taskで全586ページへの継続と必要なGitHub操作を明示許可した。14記事でMissionを完了扱いにしない。
- Owner: Sol、制作元Codex task `01a1683b-3067-7a40-892a-47a3b30d50b2`。設計・GUI・実装・統合・検証を継続担当。Dot intake writer `01a1689f-419e-7742-8058-b0d6a0aa302d` は安全な境界で停止し、親も再投入なしを確認済み。
- Canonical edit checkout: `C:/Users/shiro/Documents/Codex/2026-10-23/task-19/collectanea-screenshot-integration`。現在branch `integration/fusion-alpha-space-native-20261024`、base `78e7b7c9818448e56f7de0e76ae6abe70da0d0e6`。旧producer checkoutと元の43MB配布ZIPは保全。branch作成時にorigin/mainがupstreamになるため、pushは必ず明示branchを指定する。
- Published batch 1: S01–S14、14記事・50画像。[PR #63](https://github.com/46slv/collectanea-DB/pull/63)、main `b5862defc25d342381849d6afcc499597efc4745`。候補 `2176ab3572689cba26d83c8b4d494055f192c216` とmainのtree `a9aa538d22790ad862d1ba92158bce047d33f44c` は一致。
- PASS: [exact-head Quality 39966534167](https://github.com/46slv/collectanea-DB/actions/runs/39966534167)、[Pages 39967626278](https://github.com/46slv/collectanea-DB/actions/runs/39967626278)、公開14ページ・50画像の1440px/390px表示・decode・Alt・原寸リンク・横overflow、公開232素材のHTTP200/SHA-256一致。公開証拠は `artifacts/fusion-captures/public-display-report.json`、`public-assets.json` と28画面。これらは既存ignore内に保存。
- Public-check note: 長いS08–S10の末尾画像は遅延読込。撮影節の末尾までscrollして全画像を確認した。最初の未読込観測は公開レポートに保持。CIの初回URL形状assertion失敗は、Docusaurusの `assets/files/` 配布を実バイトhashで照合する修正後の新headで解消。
- Coverage: `fusion-screenshot-candidates.json` の `coverage_inventory` が全586ページを列挙。索引40件を個別監査し、単独画像不要14・再利用11・新規撮影15と判断。続いて基礎22件を監査し、再利用13・新規撮影9と判断。画像の有無を全controlの実機検証と混同せず、記事内の未撮影箇所はremaining_viewsへ残す。
- Batch 2 published PASS: [PR #67](https://github.com/46slv/collectanea-DB/pull/67)、candidate `68d79b64e374f7585038e25ea1c0fd3c5f1bed8e`、main `004012af9640926cd00be646f78d5bfc51b6a0d5`。candidate/main treeは `3c39843e24950ccd50e988e5051b5884b62371ce` で一致。S15–S18の4記事・12原画cropと、12記事・23箇所の再利用を公開。累計30ページ・62原画crop・85掲載。再利用は固定例の図示であり、別記事の全手順を追試した主張にはしない。
- Batch 2 validation: local build/regressions19/30ページ85掲載、[exact-head Quality 39974309205](https://github.com/46slv/collectanea-DB/actions/runs/39974309205)、[Pages 39975568150](https://github.com/46slv/collectanea-DB/actions/runs/39975568150) PASS。公開変更16ページ35掲載の1440px/390px、decode/Alt/原寸リンク/overflowをCuaで確認し、公開260素材はHTTP200/SHA256一致。証拠は `artifacts/fusion-captures/public-batch2-display-report.json`、`public-batch2-assets.json`、32画面。silvelへの完了報告も宛先をfresh確認して送信済み。
- Batch 2 native receipt: 同じowned projectのS15_capture〜S18_capture、frame 0。原画は新しい実測3352×1910。無拡大crop/hash/Graph/readbackは各Sxxに保存。S15 Type=Horizontal、S16 Detail 2/Contrast 1対6/2、S17 Corner Radius 0.15/Soft Edge 0.015、S18 Solid on対off/Length 0.7を実画面で確認。S15 ComboBoxのUIA Invokeは値が変わらず、読み戻して失敗を確定後、semantic setterで変更しfresh画面とreadbackを確認した。
- Capture method: prepare/finalizeは対象caseを必須引数にして、既存14ケースを一括上書きしない。prepareは既存manifestを明示的な--replaceなしで上書きしない。原画サイズとcrop範囲をassertし、公開用textのLF正規化後にhashを採る。
- Host: fresh installed/runtime version 21.1.0.14。新しい撮影用Cua session `collectanea-coverage`、Resolve PID 8944を起動。起動前Resolve processなし、起動後はProject Manager（HWND 8326730）を実画面で確認。本番projectは開いていない。既存の `Collectanea_Captures_20261023_Sol` だけを開き、次のcase用timelineを追加する。ユーザー設定を変えず、終了時は保存してProject Managerへ戻す。
- First batch host closeout: 元Project・Timeline・Colorページの復元PASS。本番内容は編集・保存していない。次batchの開始baselineは上記のProject Managerなので、古いproject名を復元目標へ流用しない。
- NOT_RUN retained: S03 optional masks、S12 non-Color AOV、Free/別OS/全control、測色PNG、portable Graph再import。記事の `verification: partial` を維持する。
- Batch 3 local PASS: S19 sRectangle（角丸0対0.65）、S20 sNGon（Sides 6対8）、S21 sStar（Points/Depth 5/0.5対8/0.25）、S22 sTransform（Offset 0.2/0.05、Size 1.3/0.8、Rotation25）を実機撮影し、原画/crop/Graph/readbackと記事へ追加。撮影直後のstagingは制作元workspaceのwork/fusion-next-stageに保全。実機3352×1910、FHD/frame0/Viewer40%。新しい13基礎記事＋11Family記事へ既存例50箇所を追加。production buildと全58ページ147掲載のPC/mobile、原寸リンク/hash/decode/Alt/overflowはPASS。sNGonはCuaで実表示も確認。この段階のGitHub・公開結果は次項のBatch 3 published receiptへ更新済み。
- Coverage after batch 3 local check: native22・reuse36の58ページ、単独画像不要14、新規撮影24、要判断490。parameter-dataの供給元追跡とusdのScene Tree等は画像追加後もremaining_viewsへ保持する。記事に一枚あるだけで必要箇所が全て揃ったとは判定しない。
- Batch 3 published PASS: [PR #68](https://github.com/46slv/collectanea-DB/pull/68)、candidate `4145b18b03ccf99c8b78e0bd3e55169b463fe2a8`、main `22d20b5f304eb41531ab8eef342db470eff23ede`、tree `0beb75d7e4bf99d42912c5658eb417fa33371f27`一致。[Quality 39978096117](https://github.com/46slv/collectanea-DB/actions/runs/39978096117)、[Pages 39979195776](https://github.com/46slv/collectanea-DB/actions/runs/39979195776)成功。変更28ページ62掲載の1440px/390px表示・decode・Alt・原寸リンク・overflow PASS、公開288素材HTTP200/SHA256一致。Integratorによるmergeを確認し、重複mergeしなかった。公開確認の集約先closure誤りを修正し、28件の詳細記録を再取得済み。証拠は `public-batch3-display-report.json`、`public-batch3-assets.json`、56画面。silvelへbatch3の結果と継続中の範囲を送信し、会話への表示と入力欄のクリアを確認した。
- Batch 4 native observed: S23 first-flow（SourceB→TransformとSourceA→Mergeの二段階）、S24 Transform Size 0.5対Resize960×540、Scale0.5対Resize、S25 BlurのEffect Mask対Loader直接MaskのColor/Alpha、S26 Text+のDoDとRoIを実機撮影。FHD/frame0/Viewer40%、原画3352×1910。AlphaはColorへ、RoI/DoDは非表示・無効へ戻したfresh画面も保存。S26のText+選択中は編集controlが優先されるため、MediaOut選択後に実際の画像Viewerへ範囲表示を適用した。
- Method improvement: AddTool初期化をComp.Lock/Unlockで囲み、Loader作成時の不要なOpen File dialogを抑える。S24で現れたowned dialogはfresh UIAで識別してCancel、既存5Nodeを読み戻して継続し、再buildしていない。S25の2Loaderではdialogなし。Native A/C入力とRoI dragはtransportがunverifiableを返したが、fresh画面の実変化で受理した。物理入力や性能改善の検証とは扱わない。
- Viewer API reference: [official Fusion Scripting Guide pp.127–130](https://documents.blackmagicdesign.com/UserManuals/Fusion8_Scripting_Guide.pdf#page=127)のGLImageViewer.ShowDoD/ShowRoI/EnableRoI/DragRoIと、21.1 Manual ch68 pp.1479–1481を参照。21.1.0.14で見える結果を別途確認。RoI外のcached pixelsが残るため、ROIスクリーンショットを出力切り抜き・再計算時間の証拠にしない。
- Batch 4 local PASS: S23–S26へ17cropを掲載し、Bridge・Recipe・Troubleshooting・Scale/Resizeの19記事へ47箇所を再利用。変更23記事64掲載、累計81ページ・91原画crop・211掲載。production build、regressions19、全81ページの1440px/390px・decode/Alt/原寸リンク/hash/overflow PASS。確認をbuild完了前に起動した一度の404は破棄し、build成功後の全件レポートを採用した。証拠 `artifacts/fusion-captures/display-report.json` と162画面。
- Audit: 未判断のBridge/Recipe/Troubleshooting50記事を個別に確認。再利用17、独立撮影不要6、新規撮影27。現時点の再利用19件にはScale/Resizeの2Node記事を含む。Planarの実写Perspective、USDのEXR保存/非Color AOVなどは掲載後もremaining_viewsへ残す。全体未完了。
- Batch 4 published PASS: [PR #71](https://github.com/46slv/collectanea-DB/pull/71)、candidate `79e82c7cb2d8930578aeafc865f020c637043552`、main `c252a312148add3a64b72c279689f3e3fbcc447c`、tree `f3914ee207f16b9629b1833a14bd0643208b43b4`一致。[Quality 39984705688](https://github.com/46slv/collectanea-DB/actions/runs/39984705688)と[Pages 39986353596](https://github.com/46slv/collectanea-DB/actions/runs/39986353596)の全必要job成功。変更23ページ64掲載の1440px/390px・decode/Alt/原寸リンク/overflow PASS。公開328素材HTTP200/SHA256一致。詳細記録は `public-batch4-display-report.json`、`public-batch4-assets.json` と46画面。累計81ページ・91原画crop・211掲載。
- Batch 5 native stage: same owned ProjectでS27 MultiMerge（Gold/Red Layerの有効・無効と順序変更）、S28 Merge Effect Maskなし/ありと出力Alpha、S29 Dissolve Mix0/0.5/1、S30 FastNoise→Displaceの前後とmapを撮影しfresh GUIで確認。原画とGraph/readbackは制作元workspace `work/fusion-compositing-stage`、`work/S27-*`〜`S30-*` に保全。canonicalへの採用・掲載・公開は完了。撮影時はS30_capture、両Viewer Color/40%、RoI無効。Production Projectや設定は変更していない。
- Batch 5 method: MultiMerge Layer Orderのbackground dragはfresh UIAでno-opと確認、ScriptValへの直接SetInputもreadback不成立で不採用。その後同じCLI connectionのforeground dragで実際の順序と重なり変化を確認し、Graphを書き出した。CLIとMCPのsnapshot contextは共有されない。S30のFastNoise Scaleは実行ID XScale/YScaleなので、残ったLoader/Noise/MediaOutを読み戻し、Displaceだけを追加して修復し、既存caseを再buildしなかった。S28の初回Fit表示は不採用にし、選択後にもSetScaleを適用して両方40%のColor/Alphaを撮影し直した。
- Full necessity audit complete: 全586ページへ画像要否を付与。先のIndex/基礎/Bridge監査に加え、未判断Node398件を200/198に分けて重複0で監査、Learn/Pattern25件と既存2記事の不足、残る索引・Resolve境界15件も確認。32ページは独立撮影不要。必要なGraph/Inspector/結果、最小fixture、搭載・素材条件、既存画像で代用できない理由をcoverage_inventoryへ保持。監査はread-onlyで、実機受入とは別。Krokodove85件等の搭載条件を未確認のまま成功にはしない。
- Batch 5 local PASS: S27–S30の4記事へ21crop、8記事へ9source entries/30掲載を追加。12変更ページ・新規51掲載、全92ページ262掲載のproduction build/1440px/390px/decode/Alt/原寸リンク/hash/overflow PASS。先のregressions19 PASSを維持。1記事で複数source caseを説明できるようcheckerをarticle単位へ改善し、Text+のS08と配置のS23を同一記事で確認した。compositing indexも既存Mergeと新MultiMergeの両方を検査。新規cropは112原画cropまで増加したが、公開はまだ91crop/81ページの範囲。
- Batch 4 report delivered: silvel宛先をfresh確認し、PR71・公開81ページ・全体監査と継続中範囲を送信。会話への表示と入力欄のクリア、画面保存を確認。GUI single writerはSolを継続。
- Batch 5 published PASS: [PR #73](https://github.com/46slv/collectanea-DB/pull/73)、candidate `33bb8fa3809ce976db31d818452ad9c1cc34fc5f`、main `78e7b7c9818448e56f7de0e76ae6abe70da0d0e6`、tree `8af36277de9c0da855ac6e1a6989f11f60a484a7`一致。[Quality 39989581911](https://github.com/46slv/collectanea-DB/actions/runs/39989581911)と[Pages 39990995348](https://github.com/46slv/collectanea-DB/actions/runs/39990995348)全必要job成功。変更12記事の既存分を含む53掲載・1440px/390px・decode/Alt/原寸リンク/overflow PASS。371公開素材HTTP200/SHA256一致。詳細はpublic-batch5-display-report.json、public-batch5-assets.json、24画面。累計92ページ・112原画crop・262掲載。
- Batch 6 native observed: S31楕円前景単体/不透明背景へのOverのColor/Alpha、S32同じ入力からBlend0.5/Multiply/Inを個別変更、S33RectangleからEllipseをSubtract、S34Angle30固定でPivot X0.5/0.2のみ変更、S35Centerフレーム0→48でX0.25→0.75、SplineのPath Displacement0→1。原画とGraph/readbackは制作元work/fusion-alpha-space-stageとS31〜S35 PNGに保全。S35の最初のSize0.13は端で切れるため不採用、Size0.09へ調整した最終フレーム0/48を採用。readbackは表示フレームの値と0/24/48サンプルを記録するよう改善。
- Current host: same owned project、PID8944/HWND1251932、S35_capture、frame48、両Viewer Color/40%、Spline閉、ModifiersタブでPath1表示、DoD/RoI無効。SplineのUIA TreeItem Invokeはチェックが変わらず不採用、fresh state後のforeground clickでチェックと曲線を確認した。Transport成功だけを実機受入にしていない。終了時はowned projectを保存しProject Managerへ戻す。
- Batch 6 local PASS: S31–S35の5記事へ26crop、RecipeとPathの2記事へ11再利用掲載。変更7記事・新規37掲載、全96ページ299掲載のproduction build/1440px/390px/decode/Alt/原寸リンク/hash/overflow PASS。原画cropは138。既存Alpha/Mask/Pivot記事は先の画像と新画像をまとめて確認。記事はpartialを維持し、Pivot-onlyとOver後Alphaの不足を埋め、Reference Size、Premultiplication、Sizeの3キーと補間方式等はremaining_viewsに残した。S35のPath1はModifiersタブも実機で撮影、曲線の0/1とCenter X0.25/0.75を区別。公開はまだ92ページの範囲。
- Dot batch5 report delivered: 宛先silvelのプロフィールをfresh確認し、PR73/Quality/Pagesと公開92ページの結果を送信。会話表示と入力欄クリアを読み戻し、dot-batch5-report.jpg保存。正本single writerを継続し、新規worker投入は依頼していない。
- Next action: current mainとopen PR重複を再確認してbatch6候補を凍結し、Ready PR/exact-head Quality→main/Pages→変更7ページ（既存分を含む44掲載）の公開確認へ進める。残る458未図示ページと既存記事のremaining_viewsを継続し、単一batchでMissionを止めない。
- KEEP: 同じSolが継続。Checkpoint保存や単一batch完了だけでは停止・Rolloverしない。文脈圧迫が必要になったときだけCOMPACT/ROLLOVERを判断する。

## 第1batchの撮影・統合メモ（履歴）

- Integration owner: producer Sol, Codex task `01a1683b-3067-7a40-892a-47a3b30d50b2`. Dot's intake writer released the integration worktree with no running operation; parent confirmed no reinsertion. The user explicitly authorized necessary GitHub operations in the producer task. No Resolve GUI writer is active.
- Adopted integration checkout: `C:/Users/shiro/Documents/Codex/2026-10-23/task-19/collectanea-screenshot-integration`, branch `integration/fusion-live-captures-20261023`. Intake reconciled the screenshot additions with main `bc744549d5d04dd46f32cbda001b4821f6c8b94e`, retaining newer text in the 12 overlapping articles. Original producer checkout and archive remain preserved.
- Intake validation on that integration tree: regressions 19 PASS, production build PASS, Markdown integration 51 fixtures PASS, 14 pages / 50 images at desktop and mobile PASS. Source images remain unchanged; exported evidence text uses LF with original-artifact and current hashes recorded in the manifests.
- Publication in progress: reconcile latest main (last observed `9118ccd956b1535a97ddbaa91519b2447da1cba3`), freeze a commit, open one Ready integration PR, verify exact-head Quality, ordinary merge, Pages and public display. No publication success is claimed by this checkpoint. Prior access denial was resolved through a new reviewed operation; no permission or host-setting change was made by producer Sol.
- CI now checks the capture pages and linked crop/source hashes on the integration candidate. `CAPTURE_ORIGIN` selects the server; Linux uses bundled Chromium and Windows defaults to Edge. `CAPTURE_EVIDENCE_DIR` selects the ignored report directory.
- Scoped `.gitattributes` keeps capture JSON and exported Graph text at LF so their recorded bytes stay stable across Windows/Linux checkouts. This does not change user Git settings or image pixels.
- Continuation scope: after publishing this first 14-case batch, inventory all Fusion articles for missing explanatory images, reuse existing accepted images where appropriate, and expand in small native-verified batches. Track remaining targets here and in the existing candidates JSON. Keep all broader unverified controls and edition differences partial/NOT_RUN.
- Owner / GUI writer: Sol, this capture session only. No delegated Resolve writer.
- Checkout: task workspace `work/collectanea-DB`, branch `docs/fusion-live-captures`, base `459069d07e2afae7543639b358e1567781d9351e`.
- Runtime: Windows, DaVinci Resolve Studio 21.1.0.14, Japanese UI. Installed 21.1 PDF title and sGrid pp.2743–2744 read; Glow pp.2116–2119 and Merge pp.2211–2219 are the pilot sources.
- Owned project: `Collectanea_Captures_20261023_Sol`. Original project identity and page are recorded outside the repo in `../resolve-original.json`; do not edit or save that project.
- S01–S03: GUI reviewed, 11 crops linked into the 3 existing articles. Production build PASS; desktop 1440px / mobile 390px image decode, native-image links, graph/manifest downloads and horizontal overflow PASS. Evidence: `artifacts/fusion-captures/display-report.json` plus desktop/mobile screenshots. These are local publication-ready edits; public deployment has not occurred.
- Runtime input ID for sGrid is `Input` (Manual UI name Input1). `FuFrame.ViewOn` toggles when repeated; use `GetPreviewList().RightView.ViewOn()` and verify the shown source. Both comparison viewers are fixed at 40%.
- S03: Glow Size 30 / Glow 0.3 / Merge Under / Blend 1. Optional masks comparison remains deferred. Saver PNG did not match accepted Viewer appearance; rejected export is outside the repo. Use native Viewer captures until export fidelity is resolved. Render completion is modal; close the observed dialog before using Resolve page/timeline APIs. `GetCurrentPage() == None` blocks helper mutations.
- S04–S14: native graph / Inspector / output observed and screenshots saved. All 14 articles contain 50 unresampled crops from actual Resolve windows. Production build PASS; all 14 pages at 1440px / 390px, image decode, Alt, native-resolution links, asset hashes and horizontal overflow PASS. Browser page errors: 0. Evidence: `artifacts/fusion-captures/display-report.json` and 28 browser screenshots. Regression tests: 19/19 PASS. Content integration: PASS (51 fixtures).
- S09: initial subpixel-small Style Size made output unreadable. Accepted fixture uses Blob / Size 3, Number 3, Lifespan 80, Velocity 0.002, Seed 7, Sphere size 0.55, pRender 2D. Frame 0 shows 3 particles; frame 48 shows the accumulated field. Fresh owned probes were removed after reconciliation.
- S10: expression-driven upstream motion did not produce a correct track and was rejected. Replaced with a 120-frame PNG sequence translating right by 3px/frame. GUI polygon + Point/Translation/Luma forward analysis, then Create Planar Transform and Text+ composite. Native track has 120 samples; maximum X error versus the known sequence is 0.004993px; frame 60 is 180.00215px versus 180px expected. Actual composite inspected at frames 0 and 60. Unused expression source was removed.
- Loader length changes can open a child modal absent from `list_windows` and from the main backing-store PNG. Inspect `get_window_state`'s UIA tree when page APIs return None; acknowledge only the exact owned clip's trim reset. Do not retry the setter blindly.
- Accepted assets: `static/img/fusion/captures/S01` through `S14`, plus synthetic `_fixtures`. Source screenshots retain native 3360×1914 pixels; crops are unresampled and traceable by rectangle and SHA-256. Source Manual: installed 21.1 PDF, September 2026; candidate chapter/page ranges retained.
- Reproduction and QA: see the next section. Individual article verification remains `partial` because full control matrices, Free edition, other OSes, export fidelity and performance were not tested.
- No push/deploy has occurred. Exported `.comp` files have unrelated inherited cache/LastFile paths removed; host preferences are unchanged.
- KEEP: same owner continues. Do not roll over merely because a checkpoint was written.
- Capture scope complete. S03's optional mask comparison, S12 non-Color AOV output fidelity, Free edition / other OS / all-control matrices, colorimetric PNG export and portable-comp reimport remain explicitly unverified. These are not promoted to verified claims.
- Publication boundary: branch remains local and uncommitted; no remote write, PR, main integration or public deployment has occurred. Resume publication from this checkpoint only after concrete authorization for the chosen remote action.
- Host closeout PASS: owned scratch project saved; original project, original Timeline and original Color page restored by exact baseline readback, then visually confirmed. No GUI writer remains active. Original project content was not edited or saved by this work. A slow restore was allowed to finish; Resolve was not terminated or restarted.

## 再現と掲載確認

- `fixture.comp` は撮影に使ったGraphの書き出し。Loaderのパスは配布用に `Comp:/../_fixtures/` へ正規化した。正規化後の再importは未実施。撮影時の実機動作と再import試験を混同しない。
- 同梱チャートは `python scripts/create-fusion-chart.py`、S10連番は `python scripts/create-fusion-chart.py --sequence` で再生成できる。これは入力fixtureであり、Resolve UIの模造画像ではない。
- `scripts/fusion-capture.py CASE show` はexact scratch projectを検査して、対象Graph・Viewer・Inspectorを表示する。起動中の本番projectへ自動接続して書き込まない。撮影済みprojectがない環境ではGraphを専用projectへ手動importする。
- `scripts/configure-fusion-cases.py` は未撮影の準備probe専用。既にcapture.jsonがあるcaseの上書きを拒否する。
- GUIで実際の値と出力を確認してから `cua-driver get_window_state` のネイティブ解像度PNGを保存する。`prepare-fusion-captures.py` は固定layoutのcrop用。layoutが異なる場合は座標を再観測する。
- `finalize-fusion-captures.py` はprivateなキャッシュ・LastFile情報をexportだけから除き、portable pathとhashを記録する。Resolve設定ファイルは編集しない。
- `npm run build` 後、`npm run serve -- --host 127.0.0.1 --port 3017`、`node scripts/verify-fusion-captures.mjs` で全14ページの画像decode、Alt、原寸リンク、fixture/manifest/source hash、1440px・390px表示と横overflowを検査する。
- 証拠は `artifacts/fusion-captures/`。リポジトリの既存ignoreに従い、配布時は別添の検証記録へ含める。

Fusionノードに加え、EditはTimelineとInspector、ColorはNode・Palette・Scopes、FairlightはMixer・Bus・Meter、Deliverは出力設定と結果の例へ広げる。

**Codex向け短縮依頼:** この計画と候補JSON、現行Manual、対象記事を参照し、Pilot S01〜S03の実機キャプチャ・capture.json・記事掲載を完成させる。プロジェクト既存状態は維持し、実機未確認事項を区別する。
