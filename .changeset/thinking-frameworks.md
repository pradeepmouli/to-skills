---
'@to-skills/core': minor
'@to-skills/typedoc': minor
'typedoc-plugin-to-skills': minor
---

Surface @remarks as thinking framework, fix decision table Why column, broaden Quick Start aliases

- Extract @remarks from @packageDocumentation and render in SKILL.md body (architectural context, trade-offs)
- Decision table uses 2-column format (Task | Use) when no explicit reasons exist via " — " delimiter
- When explicit " — " reasons exist, 3-column format (Task | Use | Why) with the author's reasoning
- Add "cli usage", "basic usage", "installation" as Quick Start heading aliases
