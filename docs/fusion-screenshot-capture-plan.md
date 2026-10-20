# Fusion 21.1 スクリーンショット計画

更新: 2026-10-20。状態: **候補整理済み／実機撮影は未実施**。

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

Fusionノードに加え、EditはTimelineとInspector、ColorはNode・Palette・Scopes、FairlightはMixer・Bus・Meter、Deliverは出力設定と結果の例へ広げる。

**Codex向け短縮依頼:** この計画と候補JSON、現行Manual、対象記事を参照し、Pilot S01〜S03の実機キャプチャ・capture.json・記事掲載を完成させる。プロジェクト既存状態は維持し、実機未確認事項を区別する。
