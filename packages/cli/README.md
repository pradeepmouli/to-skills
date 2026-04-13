# @to-skills/cli

> Extract CLI command structure from commander/yargs for AI agent skill generation.

Part of the [to-skills](https://github.com/pradeepmouli/to-skills) ecosystem.

## Features

- **Commander introspection** — enumerate commands, options, arguments from a Program object
- **`--help` fallback** — parse standard help text for any CLI framework
- **Flag-to-property correlation** — merge JSDoc tags from typed options interfaces into CLI metadata
- **Token-budgeted output** — generated skills fit LLM context windows

## Install

```bash
pnpm add -D @to-skills/cli
```

## Usage

```typescript
import { extractCliSkill } from '@to-skills/cli';
import { renderSkill } from '@to-skills/core';

const skill = await extractCliSkill({
  program, // commander Program object
  metadata: { name: 'my-tool', keywords: ['build', 'deploy'] }
});

const rendered = renderSkill(skill);
```

## License

MIT
