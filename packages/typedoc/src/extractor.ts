import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  type ProjectReflection,
  DeclarationReflection,
  ReflectionKind,
  type SignatureReflection,
  type ParameterReflection,
  type Comment
} from 'typedoc';
import type {
  ExtractedSkill,
  ExtractedFunction,
  ExtractedClass,
  ExtractedType,
  ExtractedEnum,
  ExtractedParameter,
  ExtractedProperty,
  ExtractedDocument
} from '@to-skills/core';

/** Package metadata to enrich extracted skills */
export interface PackageMetadata {
  /** Package name from package.json (preferred over TypeDoc project name) */
  name?: string;
  keywords?: string[];
  repository?: string;
  author?: string;
}

/** Extract structured API info from the TypeDoc reflection tree */
export function extractSkills(
  project: ProjectReflection,
  perPackage: boolean,
  metadata?: PackageMetadata
): ExtractedSkill[] {
  const children = project.children ?? [];
  const documents = extractDocuments(project);

  const modules = children.filter(
    (c) => c.kind === ReflectionKind.Module || c.kind === ReflectionKind.Namespace
  );

  if (modules.length > 0 && perPackage) {
    // Group modules by their resolved package name, then merge into one skill per package
    const grouped = groupModulesByPackage(modules);
    return Array.from(grouped.entries()).map(([pkgName, mods]) => {
      const perPkgMeta = metadata
        ? { ...metadata, name: pkgName || undefined }
        : { name: pkgName || undefined };
      return mergeModules(mods, perPkgMeta, documents);
    });
  }

  // Single package: root package.json name takes priority
  return [extractModule(project as unknown as DeclarationReflection, metadata, documents)];
}

/** Group modules by their resolved npm package name */
function groupModulesByPackage(
  modules: DeclarationReflection[]
): Map<string, DeclarationReflection[]> {
  const groups = new Map<string, DeclarationReflection[]>();
  for (const mod of modules) {
    const pkgName = resolvePackageName(mod) || mod.name || '(root)';
    const existing = groups.get(pkgName);
    if (existing) {
      existing.push(mod);
    } else {
      groups.set(pkgName, [mod]);
    }
  }
  return groups;
}

/** Merge multiple modules (submodules of one package) into a single skill */
function mergeModules(
  mods: DeclarationReflection[],
  metadata?: PackageMetadata,
  documents?: ExtractedDocument[]
): ExtractedSkill {
  const allFunctions: ExtractedFunction[] = [];
  const allClasses: ExtractedClass[] = [];
  const allTypes: ExtractedType[] = [];
  const allEnums: ExtractedEnum[] = [];
  const allExamples: string[] = [];
  let description = '';

  for (const mod of mods) {
    const children = mod.children ?? [];
    allFunctions.push(
      ...children.filter((c) => c.kind === ReflectionKind.Function).map(extractFunction)
    );
    allClasses.push(...children.filter((c) => c.kind === ReflectionKind.Class).map(extractClass));
    allTypes.push(
      ...children
        .filter((c) => c.kind === ReflectionKind.Interface || c.kind === ReflectionKind.TypeAlias)
        .map(extractType)
    );
    allEnums.push(...children.filter((c) => c.kind === ReflectionKind.Enum).map(extractEnum));
    allExamples.push(...getExamples(mod.comment));

    // Use the first non-empty description
    if (!description) {
      description = getCommentText(mod.comment);
    }
  }

  const resolvedName = metadata?.name || mods[0]?.name || '';

  return {
    name: resolvedName,
    description,
    keywords: metadata?.keywords,
    repository: metadata?.repository,
    author: metadata?.author,
    documents,
    functions: allFunctions,
    classes: allClasses,
    types: allTypes,
    enums: allEnums,
    examples: allExamples
  };
}

function extractModule(
  mod: DeclarationReflection | ProjectReflection,
  metadata?: PackageMetadata,
  documents?: ExtractedDocument[]
): ExtractedSkill {
  const children = (mod as DeclarationReflection).children ?? [];

  // Resolve the best name: metadata > source package.json > reflection name
  const resolvedName = metadata?.name || resolvePackageName(mod) || mod.name;

  return {
    name: resolvedName,
    description: getCommentText(mod.comment),
    keywords: metadata?.keywords,
    repository: metadata?.repository,
    author: metadata?.author,
    documents,
    functions: children.filter((c) => c.kind === ReflectionKind.Function).map(extractFunction),
    classes: children.filter((c) => c.kind === ReflectionKind.Class).map(extractClass),
    types: children
      .filter((c) => c.kind === ReflectionKind.Interface || c.kind === ReflectionKind.TypeAlias)
      .map(extractType),
    enums: children.filter((c) => c.kind === ReflectionKind.Enum).map(extractEnum),
    examples: getExamples(mod.comment)
  };
}

function extractFunction(decl: DeclarationReflection): ExtractedFunction {
  const sig = decl.signatures?.[0];
  return {
    name: decl.name,
    description: getCommentText(sig?.comment ?? decl.comment),
    signature: formatSignature(decl.name, sig),
    parameters: (sig?.parameters ?? []).map(extractParameter),
    returnType: sig?.type?.toString() ?? 'void',
    examples: getExamples(sig?.comment ?? decl.comment),
    tags: getTagMap(sig?.comment ?? decl.comment)
  };
}

function extractClass(decl: DeclarationReflection): ExtractedClass {
  const children = decl.children ?? [];
  const ctor = children.find((c) => c.kind === ReflectionKind.Constructor);
  const methods = children
    .filter((c) => c.kind === ReflectionKind.Method && !c.flags.isPrivate)
    .map(extractFunction);
  const properties = children
    .filter((c) => c.kind === ReflectionKind.Property && !c.flags.isPrivate)
    .map(extractProperty);

  return {
    name: decl.name,
    description: getCommentText(decl.comment),
    constructorSignature: ctor?.signatures?.[0]
      ? formatSignature('constructor', ctor.signatures[0])
      : '',
    methods,
    properties,
    examples: getExamples(decl.comment)
  };
}

function extractType(decl: DeclarationReflection): ExtractedType {
  // For interfaces, extract properties from children
  const properties: ExtractedProperty[] = [];
  if (decl.kind === ReflectionKind.Interface && decl.children) {
    for (const child of decl.children) {
      if (child.kind === ReflectionKind.Property || child.kind === ReflectionKind.Accessor) {
        properties.push(extractProperty(child));
      }
    }
  }

  return {
    name: decl.name,
    description: getCommentText(decl.comment),
    definition: decl.type?.toString() ?? '',
    properties: properties.length > 0 ? properties : undefined
  };
}

function extractEnum(decl: DeclarationReflection): ExtractedEnum {
  return {
    name: decl.name,
    description: getCommentText(decl.comment),
    members: (decl.children ?? []).map((m) => ({
      name: m.name,
      value: m.type?.toString() ?? '',
      description: getCommentText(m.comment)
    }))
  };
}

function extractParameter(param: ParameterReflection): ExtractedParameter {
  return {
    name: param.name,
    type: param.type?.toString() ?? 'unknown',
    description: getCommentText(param.comment),
    optional: param.flags.isOptional,
    defaultValue: param.defaultValue
  };
}

function extractProperty(decl: DeclarationReflection): ExtractedProperty {
  return {
    name: decl.name,
    type: decl.type?.toString() ?? 'unknown',
    description: getCommentText(decl.comment),
    optional: decl.flags.isOptional
  };
}

function formatSignature(name: string, sig: SignatureReflection | undefined): string {
  if (!sig) return `${name}()`;
  const params = (sig.parameters ?? [])
    .map((p) => {
      const opt = p.flags.isOptional ? '?' : '';
      return `${p.name}${opt}: ${p.type?.toString() ?? 'unknown'}`;
    })
    .join(', ');
  const typeParams = sig.typeParameters?.length
    ? `<${sig.typeParameters.map((t) => t.name).join(', ')}>`
    : '';
  const ret = sig.type?.toString() ?? 'void';
  return `${name}${typeParams}(${params}): ${ret}`;
}

function getCommentText(comment: Comment | undefined): string {
  if (!comment) return '';
  return comment.summary
    .map((part) => part.text)
    .join('')
    .trim();
}

function getExamples(comment: Comment | undefined): string[] {
  if (!comment) return [];
  return comment
    .getTags('@example')
    .map((tag) =>
      tag.content
        .map((part) => part.text)
        .join('')
        .trim()
    )
    .filter(Boolean);
}

/** Extract projectDocuments from the TypeDoc reflection tree */
function extractDocuments(project: ProjectReflection): ExtractedDocument[] {
  const docs: ExtractedDocument[] = [];

  // TypeDoc 0.28+ stores documents on reflections
  const projectDocs = (
    project as unknown as { documents?: Array<{ name: string; content?: Array<{ text: string }> }> }
  ).documents;
  if (projectDocs) {
    for (const doc of projectDocs) {
      const content = doc.content
        ?.map((part) => part.text)
        .join('')
        .trim();
      if (content) {
        docs.push({ title: doc.name, content });
      }
    }
  }

  return docs;
}

/**
 * Resolve the npm package name from a module's source files.
 * Walks up from the first source file to find the nearest package.json.
 * This handles entryPointStrategy: "packages" where TypeDoc uses internal
 * module names instead of npm package names.
 */
function resolvePackageName(mod: DeclarationReflection | ProjectReflection): string | undefined {
  // Get source file path from the module or its first child
  const sources = (mod as DeclarationReflection).sources;
  const firstSource = sources?.[0]?.fullFileName ?? sources?.[0]?.fileName;

  if (!firstSource) {
    // Try children's sources
    const children = (mod as DeclarationReflection).children ?? [];
    for (const child of children) {
      const childSource = child.sources?.[0]?.fullFileName ?? child.sources?.[0]?.fileName;
      if (childSource) {
        return findPackageName(childSource);
      }
    }
    return undefined;
  }

  return findPackageName(firstSource);
}

/** Walk up from a file path to find the nearest package.json name */
function findPackageName(filePath: string): string | undefined {
  let dir = dirname(filePath);
  const root = dirname(dir); // safety: don't go above project

  for (let i = 0; i < 10; i++) {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
          name?: string;
          private?: boolean;
        };
        // Skip private workspace roots — keep looking for the actual package
        if (pkg.name && !pkg.private) {
          return pkg.name;
        }
        // If it's private but has a name and we're not at the workspace root, use it
        if (pkg.name && dir.includes('packages')) {
          return pkg.name;
        }
      } catch {
        // ignore parse errors
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break; // filesystem root
    dir = parent;
  }
  return undefined;
}

function getTagMap(comment: Comment | undefined): Record<string, string> {
  if (!comment) return {};
  const tags: Record<string, string> = {};
  for (const tag of comment.blockTags) {
    const key = tag.tag.replace(/^@/, '');
    if (key !== 'example' && key !== 'param' && key !== 'returns') {
      tags[key] = tag.content
        .map((part) => part.text)
        .join('')
        .trim();
    }
  }
  return tags;
}
