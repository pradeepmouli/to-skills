import type {
  InvocationAdapter as CoreInvocationAdapter,
  AdapterRenderContext,
  AdapterFingerprint
} from '@to-skills/core';

/**
 * Narrower target identifier for mcp-package adapters.
 * Core uses `string` (for forward-declaration / cycle avoidance);
 * mcp tightens to this string-literal union so adapter authors get type help.
 */
export type InvocationTarget = 'mcp-protocol' | `cli:${string}`;

/**
 * Re-export the structural contract from core, narrowing `target`.
 * Adapter packages (`@to-skills/target-*`) implement this interface.
 */
export interface InvocationAdapter extends Omit<CoreInvocationAdapter, 'target'> {
  readonly target: InvocationTarget;
}

export type { AdapterRenderContext, AdapterFingerprint };

export type { ParameterPlan } from './classify.js';
