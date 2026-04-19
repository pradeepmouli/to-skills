# Classes

## rendering

### `InstructionSet`

A set of instructions that can be executed by the renderer.
Basically wraps an array, but with some extra properties that help the renderer
to keep things nice and optimised.

Note:
InstructionSet.instructions contains all the instructions, but does not resize (for performance).
So for the true length of the instructions you need to use InstructionSet.instructionSize

```ts
constructor(): InstructionSet
```

**Properties:**

- `uid: number` — a unique id for this instruction set used through the renderer
- `instructions: Instruction[]` — the array of instructions
- `instructionSize: number` — the actual size of the array (any instructions passed this should be ignored)
- `renderPipes: any` — allows for access to the render pipes of the renderer
- `renderables: Renderable[]`
- `gcTick: number` — used by the garbage collector to track when the instruction set was last used
  **Methods:**
- `reset(): void` — reset the instruction set so it can be reused set size back to 0
- `add(instruction: Instruction): void` — Add an instruction to the set
