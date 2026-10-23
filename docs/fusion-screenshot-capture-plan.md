# Fusion 21.1 スクリーンショット計画

更新: 2026-10-23。状態: **S01〜S14実機撮影・記事組み込み・ローカル表示確認済み**。

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

## Active Checkpoint — 2026-10-23

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
