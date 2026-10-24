# Fusion 21.1 スクリーンショット計画

更新: 2026-10-24。計148ページ・519原画crop・836掲載は公開確認済み。S79/S80の3記事26画像はローカル表示PASS、累計local150ページ・539crop・858掲載。Fusion全体は未完了。

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

- Mission / Owner: Fusion全体の必要箇所を実機撮影→記事掲載→GitHub→公開確認まで継続。Sol、制作元task `01a1683b-3067-7a40-892a-47a3b30d50b2`が設計・GUI・実装・統合・検証のsingle writer。ユーザーは全体継続・必要なGitHub操作・silvelへの報告を明示許可。Resolve GUIの別writerなし。新規worker/自動Rolloverは不要。
- Canonical checkout: C:/Users/shiro/Documents/Codex/2026-10-23/task-19/collectanea-screenshot-integration、branch integration/fusion-wand-triangle-native-20261024、base064d87f9472185f8261fd2cd2a1cd65739553618。PR105候補a885/tree9f4ec8ddとmain tree一致、Quality40050240745全stepPASS、Sol expected-head squash後readback MERGED。Pages/public未確認。S79/S80のnative checkpointを未commitで保持。pushは明示branch。
- Public PASS: S01–S78 / R01–R125、148ページ・519 unique crop・836掲載。全587のcoverage_inventoryとremaining_viewsは未完、verification partial維持、未図示407・画像不要32。exact identityはpublication_batches、原画/設定/未確認範囲は各capture.json。
- Latest receipt: PR105 candidate a885f509d03674d97ead15dd96c06d6469f221de、main064d87f9472185f8261fd2cd2a1cd65739553618、tree9f4ec8dd7615194cebcc4106bdb879698b36130e一致。Quality40050240745全job/step、Pages40051032024成功。fresh main/reviews空/comments空→Sol expected-head squash。公開4記事30画像PC/390px/decode/Alt/原寸リンク/overflow PASS、1250素材HTTP/hash PASS。S77初回旧cacheはtargeted reloadで10画像を受理、prior failure保持。public-batch22-display-report.json、public-batch22-assets.json、8画面。Ranges Mask公開画面を実見・会話へ掲載。
- Batch16 PUBLIC PASS: S58–S61/R99–R102、28新crop+12再利用。PR91 initiala18bc59はincoming PR90 Banding/main5d53be9の通常mergeでf452e117へ更新。Reference2パスのincoming差分・祖先を確認しlocalff-only。旧Quality40035383198 cancelledはsuperseded。既存Integratorのmergeをfresh readback、二重mergeなし。
- Validation/publication contract: scoped prepare/finalize/verifyへcase/entry IDを渡し既存caseを上書きしない。無描画/無拡大crop、source/crop/Graph/readback hashes。Ready integration PRのexact-head Quality全job/step→fresh main/reviews/comments→expected-head merge→Pages→公開UI/全素材hash。incoming mainは通常merge→新head CI、Integratorが先に統合していればreadbackだけ。CI中は凍結candidateへ追加しない。
- Source/work stage: workspace C:/Users/shiro/Documents/Codex/2026-10-23/goal-46slv-portfolio-luminance-driven-glyph。Manual work/manual-21.1.txt。canonical/work helper S80。S79/S80 build/adopt/prepare/embed/finalize/local record完了、再実行しない。20新crop+2再利用、3distinct記事26画像PC/390px/decode/Alt/原寸リンク/hash/overflow、production build PASS。Wand専用fixtureは同色の離れた2矩形、Range1 probeは比較不採用。
- Native protection: 起動前processなし→Project Managerを実機確認してowned projectだけを開いた。production project/preferences、keyboard/settingsは変更しない。真の終了時はowned scratchを保存しProject Managerへ戻す。旧本番project名を復元先へ流用しない。Viewer screenshotを測色export・Free/別OS/全control/性能やportable Graph再importの証明にしない。
- **Current host / accepted boundary:** Studio21.1.0.14/Japanese/Windows、PID28008/HWND2104226、owned Collectanea_Captures_20261023_Sol/Fusion/S80_capture/frame0。Triangle1 Point1(.1,.1)/Point2(.9,.1)/Point3(.7,.75)、Solid1/Border0/Soft0/Invert0/Level1/ShowViewControls0、左TriangleMask右Gold40%保存、S80-restored/snapshot255実見。S79は左WandMask/右Gold、SelectionPoint(.25,.5)/RGB/Range.1/RangeSoft.1/Invert0保存済み。production/preferences変更なし。
- Accepted method repairs: GetInputはNumber/Text/Point/FuID/Clipだけ、Image/Mask/3D/任意ScriptVal payloadを評価しない。広い列挙でS49時にhost exitし、scalar-onlyへ狭めて以後安定。Maskやrenderの製品不具合とは断定しない。PointのJSON数値keyはPoint inputだけ整数化（S54 Center.65と出力変化で確認）。clean出力はMediaOut選択で操作guideを外す。S62/S63のdetailはnative Viewer100%で撮影しshot別倍率を記録、cropの拡大なし。
- Cua/session: collectanea-coverage。session失効はstart_session→fresh captureだけで復旧、build/setterを再実行しない。Qt UIA/no-opはfresh画面で判定。Comboはforeground click→単独Up/Down/Return、数値はfocus→hotkey Ctrl+A→type/Return。背景no-opを確認した操作だけforegroundへ。menuが主PNGに出なければfresh owned popupを別capture。旧PID8944/46696/10664へ入力しない。Start-Process Hidden復旧は非表示windowになったため再使用しない。
- S62 native/local display PASS: Sharpen REGID。Loader→BlurSource1(Size2)→Sharpen→MediaOut、左Blur/右Sharpen。Amount1と3をnative100%で比較、3で太い明暗halo、Amount1/Blend0は40%で入力へ戻る。最後Amount1/Blend1/40%で保存、restored実見。sources restored/detail1/detail3/blend0、8crop。soft_source初回はaction登録漏れのassertでAddTool前に停止、コードを直し既存Blur不在guard下で1回だけ作成。再buildなし。実写/Alpha/Mask/軸別/Clipping/性能未確認。
- S63 native/local display PASS: UnsharpMask REGID、同じBlurSource Size2→Unsharp Size5/Gain2/Threshold0。native100%で強いhaloを確認し、Threshold.2で弱い格子と縁取りの強調が減る。最後Threshold0/40%へ戻して保存、restored実見。sources restored/detail0/threshold02/detail02、7crop。実写ノイズ・画質/Alpha/Mask/軸別/Clipping/性能未確認。
- S64 native/local display PASS: ErodeDilate REGID、不透明chart、LockXY1/Filter0(Box)/Frame、Amount+.003で白点/枠が膨張、−.003で収縮、0で入力と同じ表示。最後+.003へ戻して保存、restored実見。sources restored/negative/built-zero、7crop。Alphaマット/Mask/X/Y分離/他Filter/Clipping/境界pixel測定/性能未確認。
- S65 native/local display PASS: RankFilter REGID、chart/Size7、Rank.5で細格子/小文字が減り、0で暗領域、1で明領域が広がる。最後Rank.5へ復元保存、restored実見。sources restored/rank0/rank1、7crop。実写salt-pepper/Mask/Alpha/境界/内部順位/性能未確認。
- Batch17/18 PUBLIC PASS: S62–S65/PR93の29新crop+12再利用、S66–S69/PR96の31新crop+4分類比較を公開。累計public133/437/726。batch19 S70–S73は26新crop+4分類比較、local137/463/756まで受理。各exact identityはpublication_batches参照。
- Dot delivered/readback PASS: fresh title/profile silvel/空入力を確認、event fusion-native-20261024-15でPR87–89公開121/349/610と929素材、PR91 head a18bc59f CI待ち、未図示430＋remaining_views、Sol単一writerを1段落paste→1回Send。送信文・空入力・受領文（121/349/610、PR91はCI待ち、未図示430継続）を確認。dot-batch15-report.jpgは報告本文の画面で会話へ掲載済み。返信画面を撮れたとは扱わず受領はUIテキストで確認。以後のPR91 head更新は別のGitHub readback。Dot返信から実行権限を追加しない。
- **Next action / KEEP:** S79/S80/R126–127 local3記事26画像PASS→inventory→fresh main/open PR→commit/explicit push/Ready PR→exact-head Quality/fresh main/expected-head merge→Pages/公開3記事26画像/max-case80全素材hash。public148/519/836、local150/539/858、全587とremaining_views未完、Sol単一担当でKEEP。

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

<!-- batch18-native-checkpoint -->
S66 Filter: native menu Relief/Emboss Over/Defocus/Sobel/Laplacian/Noise/Grainの7種、Medianなし。Sobel Alpha1でcheckerboard、Alpha0で不透明輪郭。Laplacian比較、最後Sobel/Alpha0/Power1/40%保存。popupはowned HWND333061310で別原画271×164。S67 SoftGlow: 初期FilterはFast Gaussian、Threshold0.6/Gain1/Size20と0.9、Blend0を比較。最後0.6/Blend1/40%保存。S68 CreateBumpMap:初期3/Luminance/Clamp/Height1、5で境界強調、0指定は実機0.0001へclamp。最後1/40%保存。初期Fit原画は採用しない。S69 CustomFilter: UIA SetValueは表示だけ変えFilterTable未反映、Ctrl+A経路も15になったため不採用。fresh UIAでセルを特定しdouble-click→type→Return→Graph確認、未反映1セルだけ再操作、中央1/周囲0の3×3を保存。100%の同表示、Floor.25とNormalize.5の独立比較を撮影、最後両0/40%保存。負の係数入力は成立せず未確認、初期/途中/emboss名原画を掲載へ流用しない。GetInputはscalar-onlyを維持、Matrix payloadを取得していない。

<!-- batch19-native-checkpoint -->
S70 AutoGain:chart3nodes、DoZ0。初期Low0/High1、Low0/High.5で暗く、Low.2/High1で暗部上昇。最後0/.5/40%保存、S70-restored実見。採用予定screen=restored、base=built（40%確認済み）、low02。7crop。S70build後Cua失効はsession start→captureだけで復旧、build再実行なし。数値export/DoZ/Mask/時間/一定入力/float未確認。
S71 CustomColorMatrix:初期identityをshowで両40%にしS71-identity採用。R/Bswapの4係数とRed Add.2をGUIで設定。action単位foregroundの復帰でセルfocusが外れ、入力がViewer frame1へ届いた試行は不採用。fresh readbackで停止、bring_to_frontでowned Resolveだけを一時前面に保持してdouble-click/Ctrl+A/type/Return、各cell数値→Graph FilterTable→実機出力を確認。最後R/Bswap/Add0/Invert0/frame0/40%へ保存、restored実見。Graphの7×7保存tableの中央5×5を[[0,0,1,0,0],[0,1,0,0,0],[1,0,0,0,0],[0,0,0,1,0],[0,0,0,0,1]]と検証。採用restored/identity/add02、7crop。Matrix GetInput payload未使用。初期built左Fit、不成立current/focused/front-cellは掲載しない。Invert/負係数/Mask/Alpha/数値export未確認。
S72 ColorSpace:ToColor1/ColorType1の実機表示YUVを確認。owned one-shot roundtripでRGBBack1(ToRGB2/YUV1)追加、4node graph。roundtrip_resultで左ColorSpace1/YUV中間・右RGBBack1/RGB復帰、InspectorRGBBack1。showでは左入力RGB・右YUV中間、InspectorColorSpace1、MediaOutはRGBBack1のまま。最後roundtrip_result/frame0/40%保存、restored実見。採用restored/converted（両4node）、5crop。旧built/yuvの3node原画は不採用。完全数値一致/Alpha/他ColorType/精度未確認。
S73 WhiteBalance:初期Custom/Adobe RGB(1998)/UseGammaON。Temperature Method1/LockON、Reference3200→Result6500で青寄り、6500→3200で黄橙、6500→6500で元の見た目。最後3200→6500/40%保存、restored実見。採用restored/inverse=temp6500/neutral、7crop。実写の撮影温度を測定した補正とは扱わない。Custom picker/範囲分離/Ranges/他Space/GammaOFF/Mask/実写精度未確認。
Resume:PR96は新head CI/merge/Pages/public5記事55画像/1097素材hashすべてPASS。S70–S73 adopt/prepare/embed/finalize/local表示もPASS、実集計137/463/756、inventory418 capture-needed。現在の次手は上のNext actionを正本とし、この段落は撮影時の条件を残す。

Batch19 local acceptance:26新cropと4分類比較、5 distinct記事41画像PASS、実集計137ページ463crop756掲載。採用/prepare/embed/finalizeは実行済み、work/adopt_color_channels_batch.pyとembed_color_channels_batch.pyを再実行しない。Source helperはcanonical/workともS73まで。新しいnative操作を始める前にfresh Cua/process/readback。

S74 native acceptance: EllipseMask(.4/.65/SoftEdge.08)→Background RGB(.2/.55/.9),Alpha1を共通前景に、直接Color CorrectorとAlphaDivide→ColorCorrector→AlphaMultiplyを同じBase(.025)へMerge。両Color処理はLevels/Master/RGB、OutputLow.2/High1、Gamma/Mid1、ProcessAlpha0、内部PreDivide0。左だけ背景が持ち上がり右は暗背景を保持。OutputLow0では両方が暗背景へ戻る。左の内部PreDivide1では右と同じ見た目になり、OptionsのチェックON/OFFを別原画で確認。最後は両OFF/Low.2に復元。固有Inspectorなし/共通Settings、Multiply位置、ソース/Divide中間も撮影。初期Gamma2/Mid2/Fitと旧ラベルの診断原画は不採用。work/S74-restored/divide/correct-final/direct/multiply-final/source-final/baseline/builtin/builtin-options/direct-options.pngだけを採用対象とする。実写/Keyer/外部OFX/Mask/ゼロAlpha数値/HDR/性能/portable再importは未確認。

Dot event fusion-native-20261024-18: fresh title/profile silvel確認後、PR91/93/96公開133/437/726と1097assets、PR98c670local5/41、未図示418/remaining_views、正本Checkpoint URLを1段落paste→1回Send。送信文と空入力をUIで確認、dot-batch18-report.jpg実見・会話へ掲載。後続fresh UIにこのeventの受領文はなく、ACKは未確認。別案件のsilvel返信を受領証にしない。再送なし。PR98公開の新事実はこのCheckpointに保存、次の意味のある節目で必要なら報告。

S75 native PASS: MatteControl REGID。Loader opaque chart→Background、Ellipse(.5/.65/SoftEdge.025)付き白Background→Foreground、Garbage RectangleとSolid Rectangleを各Mask端子へ接続、MediaOutへ出力。Combine Alpha4/Copy0/PostMultiply1で楕円のAlphaをチャートへCopy。Invert1で内外反転、PostMultiply0ではRGBが透明部分にも残るColor表示、最後0/1に復元。Garbage Center(.55,.5)/Width.14/Height.4で中央に透明穴、Solid Center(.15,.3)/Width.15/Height.2で左赤パッチを残す。Level0/1で各maskを個別比較。両Level1に戻して保存。SDK入力attributeはBackground/ForegroundのImage2、EffectMask/Solid.Matte/Garbage.MatteのMask3、計5。nativeGraphで4接続+任意EffectMask端子を確認。初期Filter FastGaussian/PostMultiply0はManual Gaussian/既定ONと区別。右Fitのbuilt、Solidの旧位置(.2,.65)画像は不採用、S75-masks初回も旧位置。採用候補restored/default/alpha-copy/inverse/post-off/matte-source/garbage-only/solid-color/garbage-inspector/solid-inspector。矩形InspectorのViewerガイド付き原画からはInspectorだけcropし、出力はガイドなし原画を使う。matte_masks初回はaction登録漏れでtarget assert停止、AddTool前と既存5nodesを確認しallowlistを直してguard下で1回だけ追加済み、再実行しない。全Combine/色channel/Gamma/Threshold/Blur/Spill/EffectMask/実写/数値/性能は未確認。

S76 native PASS: REGID LumaKeyer、chart→LumaKeyer→MediaOut、Image Input+EffectMask/Solid/Garbageの計4属性とnative端子。初期Luminance4/Low0/High1/FilterFastGaussian/PostMultiply1、両Color40%で撮影。Low.25/High.75で暗背景透明/白パネル保持、Invert1で内外の明暗選択が反転。Channel0のGUI実値はBlue（作業原画名S76-red.pngは誤名、内容は青/紫を保持）、Luminanceへ復元。右Viewerを実機menuのAlphaへ切替え、白パネル/枠が白、暗背景黒、色patch/階調が灰のS76-alpha-accepted.png実見。最後Colorへ復帰しhelper showで保存、S76-final-color.pngを主原画。A/B wipeの誤クリックは同座標で即解除、Viewer channel buttonはnative2695,81付近。menu popupは同PIDの別HWND34347622/74520362となり、GetProcess.MainWindowHandleが一時popupへ切替わるので通常capture wrapperを盲目的に再実行しない。popupをfresh list/stateで特定しcapture/選択、背景UIA no-op→foreground選択。Color選択はtool foreground_unavailableだったがfresh main画像Color/ popup消失/HWND2104226を確認、再送なし。元ChatGPT133458へ復帰確認。採用sources final-color/default/inverse/red(Blue)/alpha-acceptedだけ。popup/zoom/wipe/check用原画は不採用。scalar allowlist維持。実写/全Channel/Blur/Contract/Gamma/補助Mask/EffectMask出力利用/数値/性能は未確認。

S77 native PASS: REGID BitmapMask。chart Loader→BitmapMaskのImage入力→Gold BackgroundのEffectMask→MediaOut。Image1/Mask1の入力attributesをpayloadなしで確認。初期Alpha/Low0/High1は不透明chartから全面Maskとなり右Goldが全面表示。ChannelだけLuminanceへ変えると明るさの形がGoldのAlphaに現れ、Low.25/High.75で暗背景が消え白パネル保持。Invert1で明暗選択が反転。右BitmapMask単体の白灰黒表示も撮影。最後左BitmapMask/右Goldの結果比較、Luminance/.25/.75/Invert0/Level1/SoftEdge0へ復元して保存。GuideはShowViewControls0を明示。採用候補work/S77-restored/default/luminance/inverse/mask.pngと、必要ならthreshold（左入力Color/右Gold）だけ。Main初期以外にFit画像なし、初期showで40%を確認。Manual Chapter108 pp.2463以降のImage→Mask接続、Channel/Threshold/Invertを参照。SoftEdge/Filter/Level変更、PaintMode/別Mask合成、FitInput/Center/異寸法、ID/Coverage、motionblur/実写/数値/性能は未確認。

Dot event fusion-native-20261024-20 delivered/ACK PASS: fresh title/profile silvelと空入力、event未送信を確認し、PR98/101公開143/475/786、1169assets、PR102c77 local146/500/813・CI待ち、未図示409/remaining_views、Sol単一担当、Checkpoint c77 URLを1段落paste→1回Send。送信文/空入力をUIで確認。返信はevent20受領、公開143ページ786掲載とPR102 local/CI待ちを区別して保持、重複投入しないとのテキスト。dot-batch20-report.jpgに報告と受領が写り、実見・会話へ掲載済み。Viewport capability unavailableは撮影方法の制約として通常getScreenshotへ戻しただけで、再送なし。Dot返信から新しい実行権限は得ていない。
S77 next packet:work/adopt_bitmap_batch.pyとembed_bitmap_batch.pyは作成済み・未実行。次branchで10crop+R123 Mask index1比較/R124 Mask概念2比較を採用し、scoped prepare/finalize→build/local全画像→inventory→GitHub/public。既存Mask概念のS07/S33原画・掲載は保持する。

S78 native/local PASS:REGID RangesMask、chart Loader→RangesMask.Image→Gold Background.EffectMask→MediaOut。Channel Luminance0、RangesRange0/Shadows、1/Midtones、2/Highlightsで選択が変わることを実見。GuideはShowViewControls0、Level1/SoftEdge0/FitInputCrop/Center.5/.5。初期Filter FastGaussian。中間Mask単体と、最後左Mask/右Goldの結果比較を40%/frame0で保存。5原画restored/default/midtones/highlights/maskから9crop。Smoothは背景clickとreconciled foreground click後もカーブ/output/export差分がなく未確認、診断画像不採用。ColorCurvesはexport textのみ、payload GetInputなし。Spline編集/他Channel/Invert/SoftEdge/Level/別Mask/異寸法/実写/数値/性能は未確認。

PR105 frozen: candidate a885f509d03674d97ead15dd96c06d6469f221de/tree9f4ec8dd7615194cebcc4106bdb879698b36130e、Quality40050240745待ち。local148/519/836、public146/500/813。S79 work helper/native PASS:RegWandMask、owned S79_capture。専用1920x1080 wand-patches.pngは暗背景に同じ赤2矩形。SelectionPoint初期.5/.5→背景、.25/.5→左矩形だけ、.75/.5→右だけ。ColorSpace0/RGB、Channel0/RGB、Range.1/RangeSoftEdge.1。Invert1で左以外が選ばれる。Range1/Soft0 probeは右Goldが変わらず未確認・不採用。Mask単体も確認し、最後.25/.5/Invert0/Level1/SoftEdge0/ShowViewControls0、左WandMask/右Gold40%/frame0へ保存。S79-restored/snapshot250実見。採用候補restored/default/right/inverse/maskの5原画、leftは入力/結果の補助候補。Range1原画は診断のみ。canonical helper S78/work S79、buildは1回完了し再実行禁止。全ColorSpace/Channel/Range変更/SoftEdge/Level/別Mask/Tracker/実写/性能未確認。

S80 native PASS:RegTriangleMask、owned S80_capture、Triangle→Gold.EffectMask→MediaOut。Point1(.1,.1)/Point2(.9,.1)は初期固定、Point3(.5,.9)→(.7,.75)だけ動かし頂点移動と形状変化を実見。Solid0/BorderWidth.02で輪郭だけ、Solid1/Border0/SoftEdge.025で柔らかい境界を確認。最後Point3(.7,.75)/Solid1/Border0/Soft0/Invert0/Level1/ShowViewControls0/frame0/左Mask右Gold40%へ復元保存、S80-restored/snapshot255実見。採用default/restored/outline/softの4原画、point3はrestoredと同条件。work helper S80、canonical S78。Point/Mask payloadはscalar-onlyを維持。Point1/2変更・Tracker/Path・PaintMode/別Mask・BorderStyle/Length/他Filter/実写/性能は未確認。build1回完了、再実行禁止。
