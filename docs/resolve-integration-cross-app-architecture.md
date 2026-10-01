# Resolve Integration & Cross-App Bridge Architecture

Status: Proposed canonical structure
Updated: 2026-10-02
Scope: DaVinci Resolve / Fusion documentation architecture

## Goal

DaVinci Resolveは統合型ツールなので、Fusionだけを独立アプリのように説明すると、次の2つが分かりにくくなる。

1. その仕事を本当にFusionでやるべきか
2. 他アプリで慣れた操作や概念を、Resolve / Fusionでどう読み替えるか

この問題をFusionのConcept / Node Referenceへ混ぜ込まず、**Suite Boundary** と **Cross-App Bridge** の2レイヤーで扱う。

```
Familiar application / familiar task
        ↓
Cross-App Bridge
        ↓
Resolve Suite Boundary
        ↓
Choose working surface
        ↓
Fusion Learn / Pattern / Node / Recipe
```

## 1. Resolve Suite Boundary

Fusion Manualの外側に、Resolve全体の役割分担を説明するlayerを置く。

This layer answers:

- これはEdit / Fusion / Color / Fairlightのどこで扱う問題か
- どの時点でFusionへ入るか
- Fusionで処理した結果はどこへ戻るか
- 同じ見た目を複数のPageで作れる場合、どの責任範囲として考えるか

Do not turn this into full manuals for every Resolve page.

### Planned suite map

```
DaVinci Resolve
│
├─ Suite Map
│  ├─ Resolve全体の考え方
│  ├─ Page / Workspaceの役割
│  ├─ どこで何をするか
│  └─ PageをまたぐWorkflow
│
├─ Edit / Timeline boundary
├─ Fusion / Compositing boundary
├─ Color boundary
├─ Fairlight boundary
├─ Media / Asset boundary
└─ Deliver / Output boundary
```

The exact page list and behavior are version-sensitive and must be verified against current Blackmagic documentation before publication.

## 2. Cross-App Bridges

Cross-App Bridgeは、既存アプリ経験者のための**翻訳ページ**。

It is not:
- a feature parity table;
- a claim that two tools are equivalent;
- a second Node Reference;
- a second Tutorial.

It answers:

```
「いつもの考え方ではこう」
        ↓
「Resolveではまずこの領域」
        ↓
「Fusionではこのmental modelへ置換」
        ↓
「このConcept / Patternを読む」
```

### Planned bridge hierarchy

```
Bridges / 他アプリから来た人へ
│
├─ After Effectsから来た人へ
│  ├─ Composition / Timeline / Layer
│  ├─ Effects / Properties
│  ├─ Masks / Mattes
│  ├─ Precomp / Nesting
│  ├─ Keyframes / Graph / Expressions
│  ├─ 2D / 3D compositing
│  └─ 「AEでこうする」Task Map
│
├─ Photoshopから来た人へ
│  ├─ Layers / stacking
│  ├─ Layer Masks
│  ├─ Adjustment-style thinking
│  ├─ Smart Object / non-destructive reuse
│  ├─ Transform / retouch / paint
│  └─ 「Psでこうする」Task Map
│
├─ Premiere Proから来た人へ
│  ├─ Sequence / Timeline
│  ├─ Clip-level effects
│  ├─ Nesting
│  ├─ Motion / compositing boundary
│  └─ 「Premiereでこうする」Task Map
│
├─ Nukeから来た人へ
│  ├─ Node graph
│  ├─ Merge / channels / masks
│  ├─ Viewer / branch debugging
│  ├─ Group / Gizmo-like reuse
│  └─ 「Nukeでこうする」Task Map
│
└─ App-neutral comparison
   ├─ Layer Stack vs Node Graph
   ├─ Timeline vs Flow
   ├─ Masking models
   ├─ Reuse / nesting models
   ├─ Animation models
   └─ Non-destructive workflow models
```

Only publish bridges for applications with enough verified mappings. Do not create empty comparison forests.

## 3. Comparison Unit = Task / Intent

The canonical comparison unit is **user intent**, not feature name.

Bad:

```
AE Precomp = Fusion Group
Photoshop Smart Object = Fusion ???
```

This invites false equivalence.

Good:

```
Intent:
「複数要素をひとまとまりとして扱い、親側から再利用したい」

AE:
- familiar workflow / terminology

Photoshop:
- familiar workflow / terminology

Resolve:
- which working surface owns the task

Fusion:
- mental model
- candidate Patterns
- candidate Nodes / structures

Differences:
- what is not equivalent
```

Each comparison explicitly separates:

- Same goal
- Similar mental model
- Different data model
- Different evaluation/order model
- Different scope
- Important non-equivalence

## 4. Cross-App Task Matrix

A shared Task Matrix should drive all bridge pages.

Initial task families:

### Structure
- put elements together
- reorder compositing responsibility
- nest / group
- reuse a construction
- replace a source
- share one control across multiple elements

### Image / graphics
- create a solid / background
- create a shape
- combine images
- mask part of an image
- crop / limit an area
- transform position / scale / rotation
- retouch / remove something
- blur / sharpen / filter
- adjust color / tone
- change transparency

### Motion
- animate a property
- edit animation curves
- link properties
- drive values procedurally
- loop / repeat motion
- offset timing
- parent / follow / track

### Compositing / VFX
- key a subject
- track motion
- attach graphics to footage
- stabilize
- replace a screen/sign/object
- combine CG / 3D
- control alpha / matte
- debug a composite

### Timeline / editorial
- trim / cut / reorder clips
- change timing
- apply a transition
- work across shots
- create shot-level vs timeline-level effects

### Delivery / integration
- move from timeline into detailed VFX
- return to editorial
- use a Fusion result elsewhere
- create reusable title/effect templates
- decide whether a task belongs in Fusion at all

This same matrix powers:
- After Effects bridge;
- Photoshop bridge;
- Premiere bridge;
- By Task index;
- Resolve Suite Map.

## 5. Bridge Page Template

Path proposal:

`manuals/resolve/bridges/<app>/<topic>.md`

or, until a Resolve-wide manual exists:

`manuals/fusion/bridges/<app>/<topic>.md`

Preferred long-term owner is Resolve-level because the first decision may be "do not use Fusion".

Required structure:

```
# Familiar task / concept

## If you know <App>
Describe the familiar model only enough to establish the starting point.

## First decision in Resolve
Which Resolve surface owns the task?

## Fusion mental model
Only if Fusion is relevant.

## What maps cleanly
Goals / concepts that transfer.

## What does not map 1:1
Important differences.

## Learn this next
Canonical Concept pages.

## Reusable Patterns
Cross-node patterns.

## Relevant Nodes
Node Reference links.

## Example tasks
Links to Recipes.

## Related index entries
Task / Concept / Controls / Glossary.
```

## 6. App Landing Page Template

Example: `After Effectsから来た人へ`.

This should not be a long article.

It is a map:

```
After Effects mental model
│
├─ Composition / Layer
│  └─ Layer Stack vs Node Graph
│
├─ Effects / Properties
│  └─ Node + Inspector / processing chain
│
├─ Masks / Mattes
│  └─ Image / Mask / Data
│
├─ Precomp / Nesting
│  └─ Reuse & Structure
│
├─ Keyframes / Expressions
│  └─ Time & Automation
│
└─ Common tasks
   └─ Cross-App Task Matrix
```

Each row links into canonical Learn / Pattern / Reference pages.

## 7. Photoshop-specific lens

Photoshop experience often starts from a persistent layer stack, layer masks and non-destructive object/filter workflows.

The bridge should therefore prioritize:

```
Photoshop
│
├─ Layers
│  └─ Layer Stack vs Flow
├─ Layer Mask
│  └─ Mask as data / effect mask
├─ Smart Object / linked content
│  └─ source / reuse / instance / structure concepts
├─ Adjustment / filters
│  └─ processing nodes and branch structure
├─ Transform
│  └─ Coordinates & Space
└─ Retouch / paint
   └─ task routing: Fusion or another Resolve surface?
```

The page must explicitly say where Photoshop's persistent document model and Fusion's evaluated graph are different rather than forcing terminology matches.

## 8. After Effects-specific lens

After Effects experience commonly starts from compositions containing time-based layers, properties, masks, effects, keyframes and expressions.

The bridge should prioritize:

```
After Effects
│
├─ Comp / Timeline / Layers
│  └─ Timeline composition vs node evaluation
├─ Effects
│  └─ processing chain / Node graph
├─ Layer transforms
│  └─ Coordinates & Space
├─ Masks / Mattes
│  └─ Image / Mask / Alpha
├─ Precomp / Nesting
│  └─ Reuse & Structure
├─ Keyframes / Graph Editor
│  └─ Time & Automation
├─ Expressions
│  └─ parameter evaluation / linking
└─ Mograph task map
   └─ Patterns / Recipes
```

Do not claim that Group, Macro, Compound Clip, Fusion Clip or other Resolve constructs are interchangeable with AE precomps until each mapping is specifically verified.

## 9. Resolve Integration Pages inside Fusion

Fusion documentation still needs a small boundary section even if a Resolve-wide manual is later created.

```
Fusion
└─ Resolve Integration
   ├─ FusionはResolveのどこにいるか
   ├─ When to use Fusion
   ├─ When not to use Fusion
   ├─ Timeline / Clip / Fusion boundary
   ├─ Media entering and leaving the Flow
   ├─ Edit ↔ Fusion workflow
   ├─ Color ↔ Fusion workflow
   └─ Reusable Fusion assets in Resolve
```

These pages own integration-specific behavior.

They do not own:
- general Edit instructions;
- full Color workflows;
- full delivery/audio manuals.

## 10. Four-axis classification

Every substantial page should be locatable on four independent axes.

```
A. Product scope
   Resolve / Fusion / Edit / Color / ...

B. Knowledge type
   Learn / Pattern / Reference / Recipe / Troubleshooting / Index

C. Task domain
   compositing / masking / transform / animation / ...

D. Familiar-app lens
   AE / Photoshop / Premiere / Nuke / none
```

Do not encode all four axes in the filesystem.

Filesystem owns primarily A + B.

Metadata owns C + D.

This prevents path explosion such as:

```
after-effects/compositing/masks/nodes/...
photoshop/compositing/masks/nodes/...
```

The same canonical content is reused across bridge/index views.

## 11. Metadata additions

Add optional fields:

```yaml
product_scope: fusion | resolve | edit | color | fairlight | media | deliver
tasks: []
concepts: []
node_family:
familiar_apps: []
familiar_terms: []
compare_topics: []
suite_surfaces: []
```

Example:

```yaml
title: Normalized Coordinates
doc_type: concept
product_scope: fusion
tasks: [position, align, transform]
familiar_apps: [after-effects, photoshop]
familiar_terms:
  - Position
  - Transform
compare_topics:
  - layer-transform
  - canvas-position
```

App-specific terms are aliases/routing metadata, not the canonical technical vocabulary.

## 12. Index additions

Extend Fusion/Resolve indexes with:

```
Index
├─ Node A–Z
├─ Concept A–Z
├─ Controls / Parameters
├─ By Task
├─ By Symptom
├─ Connection / Data Types
├─ Glossary
├─ By Resolve Surface
└─ By Familiar App
   ├─ After Effects
   ├─ Photoshop
   ├─ Premiere Pro
   └─ Nuke
```

"By Familiar App" is generated from the same canonical metadata.

## 13. Proposed overall hierarchy

Long-term architecture:

```
DaVinci Resolve
│
├─ Start Here
│  ├─ Suite Map
│  ├─ Which Page?
│  └─ Bridges / 他アプリから来た人へ
│
├─ Workflows Across Resolve
│
├─ Fusion
│  ├─ Start Here
│  ├─ Resolve Integration
│  ├─ Learn
│  ├─ Patterns
│  ├─ Node Reference
│  ├─ Recipes
│  ├─ Troubleshooting
│  └─ Index
│
├─ Edit          [future]
├─ Color         [future]
├─ Fairlight     [future]
└─ Global Index
```

Do not move the existing public `/fusion` route merely to match this target hierarchy. URL migration is a separate implementation decision.

## 14. Source-grounded rationale

Checked 2026-10-02.

Blackmagic describes Fusion as a node-based VFX/motion-graphics page integrated inside DaVinci Resolve, and explicitly describes switching among Edit, Fusion and Color as part of the same system. It also notes similar Inspector behavior across multiple Resolve pages. This supports a separate suite-boundary layer instead of presenting Fusion as a completely isolated application.

Adobe documentation describes After Effects compositions as timeline-based collections of layers, and Adobe itself notes similarities between After Effects layers and Photoshop layers. Photoshop documentation emphasizes layers, layer masks and Smart Objects/non-destructive editing. These are useful *starting mental models*, but they do not establish one-to-one feature equivalence with Fusion.

Primary sources:
- https://www.blackmagicdesign.com/jp/products/davinciresolve/fusion
- https://www.blackmagicdesign.com/products/davinciresolve
- https://helpx.adobe.com/jp/after-effects/desktop/get-started/understand-after-effects-workflow/workflows.html
- https://helpx.adobe.com/jp/after-effects/desktop/work-with-compositions/composition-settings/composition-basics.html
- https://helpx.adobe.com/jp/after-effects/desktop/work-with-layers/create-layers/creating-layers.html
- https://helpx.adobe.com/jp/after-effects/desktop/work-with-compositions/precomposing-and-nesting/precomposing-nesting-pre-rendering.html
- https://helpx.adobe.com/photoshop/desktop/create-masks/layer-masks/add-layer-masks.html
- https://helpx.adobe.com/photoshop/desktop/create-manage-layers/smart-objects/smart-objects-overview-and-benefits.html

## 15. Guardrails

- Comparison pages translate intent and mental models; they do not assert false parity.
- A comparison must explicitly include a "not 1:1" section when equivalence is imperfect.
- Cross-app prose never becomes the canonical explanation of a Fusion concept.
- Resolve page boundaries are version-sensitive; verify before publication.
- One canonical Concept / Pattern / Node page may appear in many bridge/index views via metadata.
- Do not duplicate technical prose per source application.
