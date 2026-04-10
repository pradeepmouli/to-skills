import type { ExtractedSkill } from './types.js';
import type {
  AuditContext,
  AuditIssue,
  AuditPass,
  AuditResult,
  AuditSeverity
} from './audit-types.js';

const GENERIC_KEYWORDS = new Set([
  'typescript',
  'javascript',
  'node',
  'nodejs',
  'npm',
  'library',
  'package',
  'utils',
  'utility',
  'helper',
  'tool',
  'framework'
]);

function issue(
  severity: AuditSeverity,
  code: string,
  file: string,
  line: number | null,
  symbol: string,
  message: string,
  suggestion: string
): AuditIssue {
  return { severity, code, file, line, symbol, message, suggestion };
}

function pass(code: string, message: string, detail?: string): AuditPass {
  return { code, message, detail };
}

// ---------------------------------------------------------------------------
// F1: package.json description must exist and be >10 chars
// ---------------------------------------------------------------------------
function checkF1(context: AuditContext, issues: AuditIssue[], passing: AuditPass[]): void {
  const desc = context.packageDescription?.trim() ?? '';
  if (!desc || desc.length <= 10) {
    issues.push(
      issue(
        'fatal',
        'F1',
        'package.json',
        null,
        'description',
        desc
          ? `package.json description is too short (${desc.length} chars, needs >10)`
          : 'package.json description is missing',
        'Add a meaningful description to your package.json (>10 characters)'
      )
    );
  } else {
    passing.push(pass('F1', 'package.json description exists and is meaningful', desc));
  }
}

// ---------------------------------------------------------------------------
// F2: keywords — 5+ entries, at least 3 non-generic
// ---------------------------------------------------------------------------
function checkF2(context: AuditContext, issues: AuditIssue[], passing: AuditPass[]): void {
  const keywords = context.keywords ?? [];
  const domainKeywords = keywords.filter((k) => !GENERIC_KEYWORDS.has(k.toLowerCase()));

  if (keywords.length < 5 || domainKeywords.length < 3) {
    issues.push(
      issue(
        'fatal',
        'F2',
        'package.json',
        null,
        'keywords',
        keywords.length < 5
          ? `Only ${keywords.length} keyword(s) found (need ≥5)`
          : `Only ${domainKeywords.length} domain-specific keyword(s) (need ≥3 non-generic)`,
        'Add at least 5 keywords with 3+ domain-specific terms (not generic like "library", "utils", etc.)'
      )
    );
  } else {
    passing.push(
      pass(
        'F2',
        'Keywords meet requirements',
        `${keywords.length} total, ${domainKeywords.length} domain-specific`
      )
    );
  }
}

// ---------------------------------------------------------------------------
// F3: README description — blockquote or firstParagraph must exist, >20 chars
// ---------------------------------------------------------------------------
function checkF3(context: AuditContext, issues: AuditIssue[], passing: AuditPass[]): void {
  const readme = context.readme;
  const text = (readme?.blockquote?.trim() ?? '') || (readme?.firstParagraph?.trim() ?? '');

  if (!text || text.length <= 20) {
    issues.push(
      issue(
        'fatal',
        'F3',
        'README.md',
        null,
        'description',
        text
          ? `README description is too short (${text.length} chars, needs >20)`
          : 'README is missing a description (blockquote or first paragraph)',
        'Add a blockquote or opening paragraph to README.md that describes the package (>20 characters)'
      )
    );
  } else {
    passing.push(pass('F3', 'README description exists and is meaningful', text.slice(0, 60)));
  }
}

// ---------------------------------------------------------------------------
// F4: JSDoc on exports — every function/class/type/enum/variable must have non-empty description
// ---------------------------------------------------------------------------
function checkF4(skill: ExtractedSkill, issues: AuditIssue[], passing: AuditPass[]): void {
  let allGood = true;

  for (const fn of skill.functions) {
    if (!fn.description?.trim()) {
      allGood = false;
      issues.push(
        issue(
          'fatal',
          'F4',
          `${fn.sourceModule ?? skill.name}.ts`,
          null,
          fn.name,
          `Function '${fn.name}' is missing a JSDoc description`,
          `Add a /** ... */ JSDoc comment above the '${fn.name}' function`
        )
      );
    }
  }

  for (const cls of skill.classes) {
    if (!cls.description?.trim()) {
      allGood = false;
      issues.push(
        issue(
          'fatal',
          'F4',
          `${cls.sourceModule ?? skill.name}.ts`,
          null,
          cls.name,
          `Class '${cls.name}' is missing a JSDoc description`,
          `Add a /** ... */ JSDoc comment above the '${cls.name}' class`
        )
      );
    }
  }

  for (const typ of skill.types) {
    if (!typ.description?.trim()) {
      allGood = false;
      issues.push(
        issue(
          'fatal',
          'F4',
          `${typ.sourceModule ?? skill.name}.ts`,
          null,
          typ.name,
          `Type '${typ.name}' is missing a JSDoc description`,
          `Add a /** ... */ JSDoc comment above the '${typ.name}' type`
        )
      );
    }
  }

  for (const enm of skill.enums) {
    if (!enm.description?.trim()) {
      allGood = false;
      issues.push(
        issue(
          'fatal',
          'F4',
          `${enm.sourceModule ?? skill.name}.ts`,
          null,
          enm.name,
          `Enum '${enm.name}' is missing a JSDoc description`,
          `Add a /** ... */ JSDoc comment above the '${enm.name}' enum`
        )
      );
    }
  }

  for (const variable of skill.variables) {
    if (!variable.description?.trim()) {
      allGood = false;
      issues.push(
        issue(
          'fatal',
          'F4',
          `${variable.sourceModule ?? skill.name}.ts`,
          null,
          variable.name,
          `Variable '${variable.name}' is missing a JSDoc description`,
          `Add a /** ... */ JSDoc comment above the '${variable.name}' variable`
        )
      );
    }
  }

  if (allGood) {
    passing.push(pass('F4', 'All exported symbols have JSDoc descriptions'));
  }
}

// ---------------------------------------------------------------------------
// E1: @param prose — every parameter must have non-empty description
//     that doesn't trivially restate the name or type
// ---------------------------------------------------------------------------
function isTrivialParamDesc(desc: string, paramName: string): boolean {
  // "The options" for param named "options" — but only check if description IS non-empty
  const normalized = desc
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, '');
  return normalized === paramName.toLowerCase();
}

function checkE1(skill: ExtractedSkill, issues: AuditIssue[], passing: AuditPass[]): void {
  let allGood = true;

  const checkParams = (
    fnName: string,
    sourceModule: string | undefined,
    params: (typeof skill.functions)[0]['parameters']
  ) => {
    for (const param of params) {
      if (!param.description?.trim()) {
        allGood = false;
        issues.push(
          issue(
            'error',
            'E1',
            `${sourceModule ?? skill.name}.ts`,
            null,
            `${fnName}#${param.name}`,
            `Parameter '${param.name}' in '${fnName}' is missing a description`,
            `Add @param ${param.name} <description> to the JSDoc for '${fnName}'`
          )
        );
      }
    }
  };

  for (const fn of skill.functions) {
    checkParams(fn.name, fn.sourceModule, fn.parameters);
  }

  for (const cls of skill.classes) {
    for (const method of cls.methods) {
      checkParams(`${cls.name}.${method.name}`, cls.sourceModule, method.parameters);
    }
  }

  if (allGood) {
    passing.push(pass('E1', 'All parameters have prose descriptions'));
  }
}

// ---------------------------------------------------------------------------
// E2: @returns — every function where returnType !== 'void' must have returnsDescription
// ---------------------------------------------------------------------------
function checkE2(skill: ExtractedSkill, issues: AuditIssue[], passing: AuditPass[]): void {
  let allGood = true;

  const checkFn = (fn: (typeof skill.functions)[0], context: string, sourceModule?: string) => {
    if (fn.returnType && fn.returnType !== 'void' && !fn.returnsDescription?.trim()) {
      allGood = false;
      issues.push(
        issue(
          'error',
          'E2',
          `${sourceModule ?? skill.name}.ts`,
          null,
          context,
          `'${context}' returns '${fn.returnType}' but has no @returns description`,
          `Add @returns <description> to the JSDoc for '${context}'`
        )
      );
    }
  };

  for (const fn of skill.functions) {
    checkFn(fn, fn.name, fn.sourceModule);
  }

  for (const cls of skill.classes) {
    for (const method of cls.methods) {
      checkFn(method, `${cls.name}.${method.name}`, cls.sourceModule);
    }
  }

  if (allGood) {
    passing.push(pass('E2', 'All non-void functions have @returns descriptions'));
  }
}

// ---------------------------------------------------------------------------
// E3: Interface property JSDoc — every property in types[].properties must have description
// ---------------------------------------------------------------------------
function checkE3(skill: ExtractedSkill, issues: AuditIssue[], passing: AuditPass[]): void {
  let allGood = true;

  for (const typ of skill.types) {
    if (!typ.properties) continue;
    for (const prop of typ.properties) {
      if (!prop.description?.trim()) {
        allGood = false;
        issues.push(
          issue(
            'error',
            'E3',
            `${typ.sourceModule ?? skill.name}.ts`,
            null,
            `${typ.name}.${prop.name}`,
            `Property '${prop.name}' in type '${typ.name}' is missing a JSDoc description`,
            `Add a /** ... */ comment above the '${prop.name}' property in '${typ.name}'`
          )
        );
      }
    }
  }

  if (allGood) {
    passing.push(pass('E3', 'All interface/type properties have JSDoc descriptions'));
  }
}

// ---------------------------------------------------------------------------
// E4: @example exists — skill.examples.length > 0 OR any function has examples
// ---------------------------------------------------------------------------
function checkE4(skill: ExtractedSkill, issues: AuditIssue[], passing: AuditPass[]): void {
  const hasSkillExamples = skill.examples.length > 0;
  const hasFunctionExamples = skill.functions.some((fn) => fn.examples.length > 0);

  if (!hasSkillExamples && !hasFunctionExamples) {
    issues.push(
      issue(
        'error',
        'E4',
        `${skill.name}.ts`,
        null,
        skill.name,
        'No @example tags found anywhere in the package',
        'Add @example code blocks to at least one exported function'
      )
    );
  } else {
    passing.push(pass('E4', 'At least one @example exists in the package'));
  }
}

// ---------------------------------------------------------------------------
// E5: Repository — context.repository must be non-empty
// ---------------------------------------------------------------------------
function checkE5(context: AuditContext, issues: AuditIssue[], passing: AuditPass[]): void {
  if (!context.repository?.trim()) {
    issues.push(
      issue(
        'error',
        'E5',
        'package.json',
        null,
        'repository',
        'package.json is missing a repository URL',
        'Add a "repository" field to your package.json'
      )
    );
  } else {
    passing.push(pass('E5', 'Repository URL is present', context.repository));
  }
}

// ---------------------------------------------------------------------------
// W1: @packageDocumentation — skill.description must be >50 chars
// ---------------------------------------------------------------------------
function checkW1(skill: ExtractedSkill, issues: AuditIssue[], passing: AuditPass[]): void {
  const desc = skill.description?.trim() ?? '';
  if (desc.length <= 50) {
    issues.push(
      issue(
        'warning',
        'W1',
        `${skill.name}.ts`,
        null,
        skill.name,
        desc
          ? `Module-level description is too short (${desc.length} chars, needs >50)`
          : 'Module-level @packageDocumentation JSDoc is missing',
        'Add a /** @packageDocumentation */ comment with a detailed description (>50 chars)'
      )
    );
  } else {
    passing.push(
      pass('W1', 'Module-level description is sufficiently detailed', `${desc.length} chars`)
    );
  }
}

// ---------------------------------------------------------------------------
// W2: Per-function @example — every function should have examples
// ---------------------------------------------------------------------------
function checkW2(skill: ExtractedSkill, issues: AuditIssue[], passing: AuditPass[]): void {
  let allGood = true;

  for (const fn of skill.functions) {
    if (fn.examples.length === 0) {
      allGood = false;
      issues.push(
        issue(
          'warning',
          'W2',
          `${fn.sourceModule ?? skill.name}.ts`,
          null,
          fn.name,
          `Function '${fn.name}' has no @example`,
          `Add an @example code block to the JSDoc for '${fn.name}'`
        )
      );
    }
  }

  if (allGood) {
    passing.push(pass('W2', 'Every function has at least one @example'));
  }
}

// ---------------------------------------------------------------------------
// W3: Tag usage — at least one function should have a non-empty value in tags
// ---------------------------------------------------------------------------
const NOTABLE_TAGS = new Set(['deprecated', 'since', 'throws', 'see']);

function checkW3(skill: ExtractedSkill, issues: AuditIssue[], passing: AuditPass[]): void {
  const hasTaggedFn = skill.functions.some((fn) =>
    Object.entries(fn.tags).some(([key, val]) => NOTABLE_TAGS.has(key) && val.trim())
  );

  if (!hasTaggedFn) {
    issues.push(
      issue(
        'warning',
        'W3',
        `${skill.name}.ts`,
        null,
        skill.name,
        'No functions use @deprecated, @since, @throws, or @see tags',
        'Add relevant JSDoc tags to document version info, deprecations, errors thrown, or related links'
      )
    );
  } else {
    passing.push(pass('W3', 'At least one function uses notable JSDoc tags'));
  }
}

// ---------------------------------------------------------------------------
// W4: 10+ keywords — domain-specific keyword count >= 10
// ---------------------------------------------------------------------------
function checkW4(context: AuditContext, issues: AuditIssue[], passing: AuditPass[]): void {
  const keywords = context.keywords ?? [];
  const domainKeywords = keywords.filter((k) => !GENERIC_KEYWORDS.has(k.toLowerCase()));

  if (domainKeywords.length < 10) {
    issues.push(
      issue(
        'warning',
        'W4',
        'package.json',
        null,
        'keywords',
        `Only ${domainKeywords.length} domain-specific keyword(s) (recommended ≥10 for discoverability)`,
        'Add more domain-specific keywords to improve discoverability'
      )
    );
  } else {
    passing.push(
      pass('W4', 'Excellent keyword coverage', `${domainKeywords.length} domain-specific keywords`)
    );
  }
}

// ---------------------------------------------------------------------------
// W5: README Features — context.readme?.features must exist
// ---------------------------------------------------------------------------
function checkW5(context: AuditContext, issues: AuditIssue[], passing: AuditPass[]): void {
  if (!context.readme?.features?.trim()) {
    issues.push(
      issue(
        'warning',
        'W5',
        'README.md',
        null,
        'features',
        'README is missing a Features section',
        'Add a "## Features" or "## Highlights" section to README.md'
      )
    );
  } else {
    passing.push(pass('W5', 'README has a Features section'));
  }
}

// ---------------------------------------------------------------------------
// W6: README Pitfalls — context.readme?.pitfalls must exist
// ---------------------------------------------------------------------------
function checkW6(context: AuditContext, issues: AuditIssue[], passing: AuditPass[]): void {
  if (!context.readme?.pitfalls?.trim()) {
    issues.push(
      issue(
        'warning',
        'W6',
        'README.md',
        null,
        'pitfalls',
        'README is missing a Pitfalls/Caveats section',
        'Add a "## Pitfalls", "## Caveats", or "## Anti-patterns" section to README.md'
      )
    );
  } else {
    passing.push(pass('W6', 'README has a Pitfalls/Caveats section'));
  }
}

// ---------------------------------------------------------------------------
// A1: Generic keywords — for each generic keyword present, emit alert
// ---------------------------------------------------------------------------
function checkA1(context: AuditContext, issues: AuditIssue[], passing: AuditPass[]): void {
  const keywords = context.keywords ?? [];
  const genericFound = keywords.filter((k) => GENERIC_KEYWORDS.has(k.toLowerCase()));

  for (const kw of genericFound) {
    issues.push(
      issue(
        'alert',
        'A1',
        'package.json',
        null,
        `keywords[${kw}]`,
        `Keyword '${kw}' is too generic and adds little discoverability value`,
        `Replace '${kw}' with a more specific, domain-relevant keyword`
      )
    );
  }

  if (genericFound.length === 0) {
    passing.push(pass('A1', 'No generic keywords found'));
  }
}

// ---------------------------------------------------------------------------
// A2: @param restates type — description that is just "The {type}" or "The {name}"
//     (only when description IS non-empty — E1 catches empty ones)
// ---------------------------------------------------------------------------
function checkA2(skill: ExtractedSkill, issues: AuditIssue[], passing: AuditPass[]): void {
  let anyRestating = false;

  const checkParams = (
    fnName: string,
    sourceModule: string | undefined,
    params: (typeof skill.functions)[0]['parameters']
  ) => {
    for (const param of params) {
      const desc = param.description?.trim();
      if (!desc) continue; // E1 handles empty — skip here

      if (isTrivialParamDesc(desc, param.name)) {
        anyRestating = true;
        issues.push(
          issue(
            'alert',
            'A2',
            `${sourceModule ?? skill.name}.ts`,
            null,
            `${fnName}#${param.name}`,
            `Parameter '${param.name}' description trivially restates the name: "${desc}"`,
            `Replace the description with meaningful prose explaining the purpose of '${param.name}'`
          )
        );
      }
    }
  };

  for (const fn of skill.functions) {
    checkParams(fn.name, fn.sourceModule, fn.parameters);
  }

  for (const cls of skill.classes) {
    for (const method of cls.methods) {
      checkParams(`${cls.name}.${method.name}`, cls.sourceModule, method.parameters);
    }
  }

  if (!anyRestating) {
    passing.push(pass('A2', 'No parameters trivially restate their name'));
  }
}

// ---------------------------------------------------------------------------
// A3: Trivial @example — example is a single line with no import, no assignment, no comment
// ---------------------------------------------------------------------------
function isTrivialExample(example: string): boolean {
  const lines = example
    .trim()
    .split('\n')
    .filter((l) => l.trim());
  if (lines.length !== 1) return false;
  const line = (lines[0] ?? '').trim();
  if (line.startsWith('import ') || line.startsWith('//') || line.includes('=')) return false;
  return true;
}

function checkA3(skill: ExtractedSkill, issues: AuditIssue[], passing: AuditPass[]): void {
  let anyTrivial = false;

  const checkExamples = (symbol: string, sourceModule: string | undefined, examples: string[]) => {
    for (const ex of examples) {
      if (isTrivialExample(ex)) {
        anyTrivial = true;
        issues.push(
          issue(
            'alert',
            'A3',
            `${sourceModule ?? skill.name}.ts`,
            null,
            symbol,
            `'${symbol}' has a trivial @example (single line, no import/assignment/comment)`,
            `Expand the example to show a realistic usage pattern with imports and context`
          )
        );
      }
    }
  };

  for (const fn of skill.functions) {
    checkExamples(fn.name, fn.sourceModule, fn.examples);
  }

  for (const ex of skill.examples) {
    if (isTrivialExample(ex)) {
      anyTrivial = true;
      issues.push(
        issue(
          'alert',
          'A3',
          `${skill.name}.ts`,
          null,
          skill.name,
          `Package-level example is trivial (single line, no import/assignment/comment)`,
          `Expand the example to show a realistic usage pattern with imports and context`
        )
      );
    }
  }

  if (!anyTrivial) {
    passing.push(pass('A3', 'All examples are non-trivial'));
  }
}

// ---------------------------------------------------------------------------
// A4: Verbose Quick Start — context.readme?.quickStart has a code block >15 lines
// ---------------------------------------------------------------------------
function checkA4(context: AuditContext, issues: AuditIssue[], passing: AuditPass[]): void {
  const quickStart = context.readme?.quickStart;
  if (!quickStart) {
    passing.push(pass('A4', 'No Quick Start section to check'));
    return;
  }

  // Find code blocks and check their line counts
  const codeBlockRegex = /```[\s\S]*?```/g;
  const blocks = quickStart.match(codeBlockRegex) ?? [];
  let anyVerbose = false;

  for (const block of blocks) {
    const lines = block.split('\n').length;
    if (lines > 15) {
      anyVerbose = true;
      issues.push(
        issue(
          'alert',
          'A4',
          'README.md',
          null,
          'quickStart',
          `Quick Start code block is ${lines} lines (recommended ≤15)`,
          'Trim the Quick Start example to the essential steps; move detailed examples to a dedicated section'
        )
      );
    }
  }

  if (!anyVerbose) {
    passing.push(pass('A4', 'Quick Start code blocks are concise'));
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------
export function auditSkill(skill: ExtractedSkill, context: AuditContext): AuditResult {
  const issues: AuditIssue[] = [];
  const passing: AuditPass[] = [];

  // Fatal checks
  checkF1(context, issues, passing);
  checkF2(context, issues, passing);
  checkF3(context, issues, passing);
  checkF4(skill, issues, passing);

  // Error checks
  checkE1(skill, issues, passing);
  checkE2(skill, issues, passing);
  checkE3(skill, issues, passing);
  checkE4(skill, issues, passing);
  checkE5(context, issues, passing);

  // Warning checks
  checkW1(skill, issues, passing);
  checkW2(skill, issues, passing);
  checkW3(skill, issues, passing);
  checkW4(context, issues, passing);
  checkW5(context, issues, passing);
  checkW6(context, issues, passing);

  // Alert checks
  checkA1(context, issues, passing);
  checkA2(skill, issues, passing);
  checkA3(skill, issues, passing);
  checkA4(context, issues, passing);

  const summary: Record<AuditSeverity, number> = { fatal: 0, error: 0, warning: 0, alert: 0 };
  for (const iss of issues) summary[iss.severity]++;

  return { package: skill.name, summary, issues, passing };
}
