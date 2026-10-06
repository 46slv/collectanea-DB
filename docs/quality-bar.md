# COLLECTANEA — Quality Bar

Status: Active
Updated: 2026-09-30

## Purpose

COLLECTANEAは、単に動作するDocumentation siteではなく、Awwwards、The Webby Awards、FWAで評価対象になり得る水準のcraftと独自性を目標にする。

ただし、受賞サイトに多い過剰な演出を模倣することは目的にしない。

品質目標は次の両立とする。

- Award-grade visual craft
- Documentation-grade readability
- Product-grade usability
- Engineering-grade maintainability
- Long-term change resilience

受賞そのものは保証しない。賞の審査観点を、内部品質基準として利用する。

## External Benchmark Basis

### Webby-derived dimensions

Websites and Mobile Sitesの公式審査観点を内部評価軸へ取り込む。

- Content
- Structure and Navigation
- Visual Design
- Functionality
- Interactivity
- Innovation
- Overall Experience

Source: https://www.webbyawards.com/judging-criteria/
Checked: 2026-09-30

### Awwwards-derived dimensions

Awwwards掲載ページで使われる主要評価軸を参照する。

- Design
- Usability
- Creativity
- Content

Development品質では次も確認する。

- Semantics / SEO
- Animations / Transitions
- Accessibility
- Web Performance Optimization
- Responsive Design
- Markup / Metadata

Source example: https://www.awwwards.com/sites/computerized-forms
Checked: 2026-09-30

### FWA-derived emphasis

FWAが重視するcreative originality、interactive experience、technical excellenceを参考にする。

Source: https://thefwa.com/FWA25/25.html
Checked: 2026-09-30

## COLLECTANEA Internal Review Dimensions

各visual / prototype / implementation iterationを次の8軸で評価する。

1. **Content clarity** — 情報が簡潔で、専門資料として不足も重複も少ない
2. **Structure and navigation** — 全体構造と現在位置が分かり、目的地へ短距離で到達できる
3. **Visual hierarchy and craft** — タイポグラフィ、整列、余白、線、輝度、細部の精度が高い
4. **Interaction quality** — Search、Hierarchy、Heading Rail、hover、focus、motionが自然で予測可能
5. **Functionality and performance** — 高速、安定、responsiveで、技術が操作を邪魔しない
6. **Accessibility** — keyboard、focus、contrast、target size、reduced motion、mobileで成立する
7. **Maintainability and change resilience** — 後から構造・見た目・資料数を変更しやすい
8. **Distinctiveness and innovation** — Documentationとして実用的な範囲で、COLLECTANEA固有の体験がある

## Quality Gate

「良さそう」で完了にしない。候補は以下を満たすまで反復する。

- P0: 0件
- P1: 0件
- 各軸: 8.0 / 10以上
- Content / Navigation / Visual / Functionality / Maintainability: 9.0 / 10を目標
- 総合: 8.75 / 10以上をAward-ready candidateの内部目安とする
- Desktop / Mobile / keyboard / reduced-motionで主要flowが破綻しない
- 実寸表示で本文、metadata、thin-line、Heading Railが読める
- Build、links、search、responsive、performanceの検証を通る

数値は賞の受賞確率を表さない。レビューを曖昧に終わらせないための内部比較尺度とする。

## Iterative Self-review Loop

各iterationで次を繰り返す。

1. Current requirementsとbriefをfresh-read
2. 対象screen / flowと比較軸を固定
3. 実画面またはvisual targetを作る
4. Desktop / Mobile / open / closed / hover / focusなど必要状態をcapture
5. 8軸で採点し、観察事実と問題を分ける
6. P0 / P1 / P2へ分類
7. 最も影響の大きい1–3点だけ修正
8. 修正版を同じ条件で再capture
9. 前候補との差分を比較
10. Quality Gateを満たすまで継続

同じ画面を無目的に磨き続けない。構造上の問題が見つかった場合はmicro polishではなくrequirements / briefへ戻す。

## Maintainability Gate

見た目が良くても、以下を満たさない実装は受け入れない。

- Design tokenで色、文字、spacing、radius、line、motionを集中管理
- Component APIがvisual variationを吸収し、pageごとのcopy-pasteを避ける
- Search、Panel、List、Hierarchyが同じmetadataを利用する
- Content treeからnavigationとHeading Railを生成する
- UI専用の重複indexを手作業で維持しない
- Magic numberを局所へ散らさない
- Layout stateとcontent stateを分離する
- Sidebar / view / theme等の保存contractを明示する
- Docusaurus upgradeやcontent追加で壊れにくいtheme extensionを使う
- Custom componentは標準Markdown / MDXの可搬性を不必要に損なわない
- Desktop / tablet / mobileのbreakpoint ruleを一元化する
- Animationはstateとtokenから生成し、各componentで個別調整しない

## Change-resilience Gate

次の変更が局所修正で済むこと。

- Materialが5件から100件へ増える
- Manualの階層が深くなる
- Tag体系が増える
- Font pairingを変更する
- Monochromeからaccent colorを追加する
- Heading Railの線長や輝度を変更する
- Panel / List以外のviewを追加する
- Docusaurus versionを更新する
- Custom domainへ移行する

## Review Independence

実装者自身の確認だけでPASSにしない。

少なくとも次を分離する。

- Requirement compliance review
- Visual / UX review
- Accessibility / responsive review
- Code / maintainability review
- Production build / deployment verification

レビューでは「既に作ったから残す」を根拠にしない。目的を満たさないcomponentやinteractionは置換・削除してよい。

## Non-goals

- Award site風のanimationを増やすこと自体
- WebGLや3Dを使うこと自体
- 読みやすさを犠牲にしたnovel navigation
- Loading時間を増やすvisual effect
- 過度なscroll-jacking
- Documentationに不要なsound / cinematic sequence
- Reference siteの表面的なcopy

## Completion Definition

Visual direction完了:
- 主要screenと主要stateが揃う
- Quality Gateを満たす
- Design tokensとcomponent方向が説明可能
- Requirementsに未配置の重要判断がない

Implementation完了:
- Acceptanceを実動作で確認
- Quality Gateを再評価
- Maintainability Gateをcode reviewで確認
- Production deploymentを確認
- 未解決事項を明示し、完了扱いへ混ぜない
