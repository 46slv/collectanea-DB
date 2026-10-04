# Fusion 21.1 Manual coverage

Updated: 2026-10-05
Scope: 21.1一次資料に基づくFusion Node documentation coverage。runtime inventoryの証明ではない。

## Current integration candidate

- main baseline: `fa98d792fcb4653abf308861761dbfe9a3a76ab1`（PR #12まで統合済み、385 Node / related-element pages）
- selected cumulative source tip: `648ff92b3920459656adf30cf5df5b834ce2a1f3`（PR #27）
- selected line: #13 → #14 → #15 → #16 → #17 → #18 → #19 → #20 → #21 → #22 → #24 → #25 → #26 → #27
- PR #23は#22から分岐したDeep siblingなので、この統合lineには含めない。
- candidate inventory: 401 Node / related-element pages

## Added pages since main

- Classic 3D / Light: Extrude 3D, DomeLight
- Particle: pFollow
- USD: uExport, uMaterialX, uReplaceMaterial, uSwitch, uVariant, uVisibility
- Color: ACES Transform, Chromatic Adaptation, Color Space Transform, Gamut Limiter, Gamut Mapping, Chromatic Aberration Removal, OCIO Display

同じstackでCompositing、Transform / Format、Mask、Blur / Filter、Color、Tracking、Generator、Particle、Classic 3D / Materials、USD、Deep / Auxiliary Channelのreader-first改稿を進めている。

## Integration audit

September 2026版 DaVinci Resolve 21.1 Reference Manualと代表ページを照合し、Merge、Wand Mask、Vector Motion Blur、Depth Blur、pFollow、Swizzler、uMaterialX、uRenderer、および今回追加した主要Color / USD項目について、Node名・役割・主要input/controlの根拠を確認した。

これは代表サンプル監査であり、401ページの全文をruntimeで再検証したという意味ではない。

## Evidence boundary

- Manual一致だけでREGID、runtime端子数、全default/range、性能、edition差まで確定しない。
- Deep Image、Auxiliary Channel付き2D Image、Shape、Particle、Classic 3D、USDは別data domainとして扱う。
- `verification: partial` でもManualで確認できた具体的なinput/controlは書き、未確認のruntime detailだけを未確認として残す。
- Resolve FX / OpenFX / Fuse / Macro / Templateを固定Node inventoryと混同しない。

## Remaining work

別passで確認する候補:
- Object Removal / Rays
- Layer Muxer / Layer Regex / Layer Remover
- Relight
- Frame Average / Keyframe Stretcher / Switch / Wireless Link
- External Matte Saver
- Surface Tracker
- specialized Krokodove / legacy-core identity

runtime verificationでは、現行build / edition、REGID、visible/hidden、input/output、default/range、代表render結果を別途確認する。

## Integration branch

`integration/resolve-db-20261005-01`

live GitHub stateがこの文書より新しい場合は、GitHubを優先する。
