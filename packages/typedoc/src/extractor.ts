import {
  type ProjectReflection,
  DeclarationReflection,
  ReflectionKind,
  type SignatureReflection,
  type ParameterReflection,
  type Comment,
} from "typedoc";
import type {
  ExtractedSkill,
  ExtractedFunction,
  ExtractedClass,
  ExtractedType,
  ExtractedEnum,
  ExtractedParameter,
  ExtractedProperty,
  ExtractedDocument,
} from "@to-skills/core";

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
  metadata?: PackageMetadata,
): ExtractedSkill[] {
  const children = project.children ?? [];
  const documents = extractDocuments(project);

  const modules = children.filter(
    (c) => c.kind === ReflectionKind.Module || c.kind === ReflectionKind.Namespace,
  );

  if (modules.length > 0 && perPackage) {
    // Per-package: use each module's own name, not the root package name
    const perModuleMeta = metadata ? { ...metadata, name: undefined } : undefined;
    return modules.map((mod) => extractModule(mod, perModuleMeta, documents));
  }

  // Single package: root package.json name takes priority
  return [extractModule(project as unknown as DeclarationReflection, metadata, documents)];
}

function extractModule(
  mod: DeclarationReflection | ProjectReflection,
  metadata?: PackageMetadata,
  documents?: ExtractedDocument[],
): ExtractedSkill {
  const children = (mod as DeclarationReflection).children ?? [];

  return {
    name: metadata?.name || mod.name,
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
    examples: getExamples(mod.comment),
  };
}

function extractFunction(decl: DeclarationReflection): ExtractedFunction {
  const sig = decl.signatures?.[0];
  return {
    name: decl.name,
    description: getCommentText(sig?.comment ?? decl.comment),
    signature: formatSignature(decl.name, sig),
    parameters: (sig?.parameters ?? []).map(extractParameter),
    returnType: sig?.type?.toString() ?? "void",
    examples: getExamples(sig?.comment ?? decl.comment),
    tags: getTagMap(sig?.comment ?? decl.comment),
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
      ? formatSignature("constructor", ctor.signatures[0])
      : "",
    methods,
    properties,
    examples: getExamples(decl.comment),
  };
}

function extractType(decl: DeclarationReflection): ExtractedType {
  return {
    name: decl.name,
    description: getCommentText(decl.comment),
    definition: decl.type?.toString() ?? "",
  };
}

function extractEnum(decl: DeclarationReflection): ExtractedEnum {
  return {
    name: decl.name,
    description: getCommentText(decl.comment),
    members: (decl.children ?? []).map((m) => ({
      name: m.name,
      value: m.type?.toString() ?? "",
      description: getCommentText(m.comment),
    })),
  };
}

function extractParameter(param: ParameterReflection): ExtractedParameter {
  return {
    name: param.name,
    type: param.type?.toString() ?? "unknown",
    description: getCommentText(param.comment),
    optional: param.flags.isOptional,
    defaultValue: param.defaultValue,
  };
}

function extractProperty(decl: DeclarationReflection): ExtractedProperty {
  return {
    name: decl.name,
    type: decl.type?.toString() ?? "unknown",
    description: getCommentText(decl.comment),
    optional: decl.flags.isOptional,
  };
}

function formatSignature(name: string, sig: SignatureReflection | undefined): string {
  if (!sig) return `${name}()`;
  const params = (sig.parameters ?? [])
    .map((p) => {
      const opt = p.flags.isOptional ? "?" : "";
      return `${p.name}${opt}: ${p.type?.toString() ?? "unknown"}`;
    })
    .join(", ");
  const typeParams = sig.typeParameters?.length
    ? `<${sig.typeParameters.map((t) => t.name).join(", ")}>`
    : "";
  const ret = sig.type?.toString() ?? "void";
  return `${name}${typeParams}(${params}): ${ret}`;
}

function getCommentText(comment: Comment | undefined): string {
  if (!comment) return "";
  return comment.summary
    .map((part) => part.text)
    .join("")
    .trim();
}

function getExamples(comment: Comment | undefined): string[] {
  if (!comment) return [];
  return comment
    .getTags("@example")
    .map((tag) =>
      tag.content
        .map((part) => part.text)
        .join("")
        .trim(),
    )
    .filter(Boolean);
}

/** Extract projectDocuments from the TypeDoc reflection tree */
function extractDocuments(project: ProjectReflection): ExtractedDocument[] {
  const docs: ExtractedDocument[] = [];

  // TypeDoc 0.28+ stores documents on reflections
  const projectDocs = (project as unknown as { documents?: Array<{ name: string; content?: Array<{ text: string }> }> }).documents;
  if (projectDocs) {
    for (const doc of projectDocs) {
      const content = doc.content?.map((part) => part.text).join("").trim();
      if (content) {
        docs.push({ title: doc.name, content });
      }
    }
  }

  return docs;
}

function getTagMap(comment: Comment | undefined): Record<string, string> {
  if (!comment) return {};
  const tags: Record<string, string> = {};
  for (const tag of comment.blockTags) {
    const key = tag.tag.replace(/^@/, "");
    if (key !== "example" && key !== "param" && key !== "returns") {
      tags[key] = tag.content
        .map((part) => part.text)
        .join("")
        .trim();
    }
  }
  return tags;
}
