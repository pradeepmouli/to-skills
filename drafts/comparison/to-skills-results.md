# to-skills Eval Loop Results

## Run 1 (Previous)

| Round    | Score  | Grade | What Changed                                                                                                                                                           |
| -------- | ------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline | 70/120 | F     | npm install + typedoc config + first build                                                                                                                             |
| Round 1  | 91/120 | C     | Added @useWhen, @avoidWhen, @pitfalls to AccessibilitySystem, ColorBlend, ColorBurnBlend, ColorDodgeBlend, DarkenBlend, crossOrigin                                    |
| Round 2  | 98/120 | B     | Added package.json description, @packageDocumentation text to index.docs.ts, @remarks to crossOrigin, floatEqual, lineIntersection, segmentIntersection, createTexture |
| Round 3  | 98/120 | B     | Added @remarks to compileShader, extractAttributesFromGlProgram, logProgramError, ensurePrecision, fastCopy — score stable (those are @private/@ignore functions)      |

---

## Run 2 (Current — virgin worktree pixijs-agent-a)

| Round    | Passing Checks | Warnings | What Changed                                                                                                                                                                   |
| -------- | -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Baseline | 8              | 65       | npm install + typedoc-plugin-to-skills + config + tsdoc.json copy                                                                                                              |
| Round 1  | 11             | 62       | Added @useWhen, @avoidWhen, @pitfalls to Application, Sprite, Container, Assets, Graphics, Texture, Ticker                                                                     |
| Round 2  | 12             | 54       | Added @packageDocumentation description to index.docs.ts; @example to nextPow2, isPow2, log2, floatEqual, sayHello, graphicsContextToSvg                                       |
| Round 3  | 12             | 46       | Added @example + @remarks to lineIntersection, segmentIntersection; @example to loadEnvironmentExtensions, autoDetectEnvironment, setBasisTranscoderPath, setKTXTranscoderPath |

### Total effort (Run 2)

- Lines of JSDoc added: ~120
- Files modified: 15 source files
  - src/app/Application.ts (@useWhen, @avoidWhen, @pitfalls)
  - src/scene/sprite/Sprite.ts (@useWhen, @avoidWhen, @pitfalls)
  - src/scene/container/Container.ts (@useWhen, @avoidWhen, @pitfalls)
  - src/assets/Assets.ts (@useWhen, @avoidWhen, @pitfalls)
  - src/scene/graphics/shared/Graphics.ts (@useWhen, @avoidWhen, @pitfalls)
  - src/rendering/renderers/shared/texture/Texture.ts (@useWhen, @avoidWhen, @pitfalls)
  - src/ticker/Ticker.ts (@useWhen, @avoidWhen, @pitfalls)
  - src/index.docs.ts (@packageDocumentation description)
  - src/maths/misc/pow2.ts (@example for nextPow2, isPow2, log2)
  - src/math-extras/util.ts (@example + @remarks for floatEqual, lineIntersection, segmentIntersection)
  - src/environment/autoDetectEnvironment.ts (@example)
  - src/compressed-textures/basis/utils/setBasisTranscoderPath.ts (@example)
  - src/compressed-textures/ktx2/utils/setKTXTranscoderPath.ts (@example)
  - src/scene/graphics/shared/svg/SVGExporter.ts (@example)
  - src/utils/sayHello.ts (@example)
- Number of iterations: 3

### Final estimate output (Run 2, Round 3)

```
📊 Skill Documentation Audit: pixi.js
   26 fatal · 937 error · 46 warning · 3 alert

FATAL (26): package.json description missing, 0 keywords found, missing JSDoc on
  internal functions: compileShader, defaultValue, mapSize, getDefaultUniformValue
  and types: PrepareUpload, IGLUniformData, LoadParserName, CacheAsTextureMixinConstructor,
  EffectsMixinConstructor, FindMixinConstructor, MeasureMixinConstructor, SortMixinConstructor,
  FillStyleInputs, CharData, DXGI_FORMAT, DRAW_MODES, shader template variables

ERROR (937): Missing @param descriptions on legacy DOM event compatibility methods
  (FederatedEvent.initEvent/initUIEvent, FederatedMouseEvent.initMouseEvent, etc.)
  and other internal API parameters

WARNING (46): Missing @example on internal GL/GPU utility functions
  (compileShader, mapSize, getDefaultUniformValue, ensurePrecision, etc.)
  Missing @remarks on multi-param functions; README missing Features/Troubleshooting
  sections; 0 domain-specific keywords in package.json

ALERT (3): Trivially-named params: 'loader' described as "loader", 'renderer' as "the renderer"

PASSING (12 checks):
  ✓ README description exists and is meaningful
  ✓ At least one @example exists in the package
  ✓ Repository URL is present
  ✓ Module-level description is sufficiently detailed — 258 chars
  ✓ At least one function uses notable JSDoc tags
  ✓ At least one export has a @useWhen tag
  ✓ At least one export has an @avoidWhen tag
  ✓ At least one export has a @pitfalls tag
  ✓ At least one export has a @category tag
  ✓ No generic keywords found
  ✓ All examples are non-trivial
  ✓ No Quick Start section to check
```

### Run 2 Observations

- The biggest wins came from @useWhen/@avoidWhen/@pitfalls on the 7 core classes (Application, Sprite, Container, Assets, Graphics, Texture, Ticker) — this moved 3 checks to passing in one round
- Adding a package-level description to index.docs.ts unlocked the "Module-level description" check
- Remaining FATAL/ERROR issues are dominated by: (a) missing package.json description/keywords, (b) undocumented parameters on legacy DOM event shim methods that are not user-facing
- Warnings decreased 65 → 46 (29% reduction) across 3 rounds
- The audit correctly prioritized @useWhen/@avoidWhen/@pitfalls as the highest-value first step

---

## Run 1 Final estimate output

```
📊 Skill-Judge Estimate: 98/120 (81.7%) — Grade B
  D1 Knowledge Delta       : 12/20  ← add @remarks to complex functions
  D2 Procedures            : 15/15
  D3 Anti-Patterns         : 13/15
  D4 Description           : 13/15
  D5 Progressive Disclosure: 13/15
  D6 Freedom               : 15/15
  D7 Pattern               : 10/10
  D8 Usability             :  7/15  ← add @param/@returns
```

## Run 1 Observations

- The plugin correctly identified the highest-value targets (AccessibilitySystem, blend mode classes) for @pitfalls
- D2 (Procedures) and D6 (Freedom) maxed out immediately after adding @useWhen/@avoidWhen to 6 exports
- D7 (Pattern) maxed out because PixiJS already has strong example coverage
- D8 (Usability) is the hardest to improve — it requires @param/@returns on hundreds of functions
- The score plateaued at B because remaining @remarks suggestions were on @private functions not counted by the scorer
- D1 (Knowledge Delta) still has room to grow via @remarks on exported complex functions
