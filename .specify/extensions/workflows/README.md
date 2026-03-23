# spec-kit-extensions

**11 production-tested workflows that extend [spec-kit](https://github.com/github/spec-kit) to cover the complete software development lifecycle.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## What Is This?

**spec-kit** provides structured workflows for feature development (`/speckit.specify → /speckit.plan → /speckit.tasks → /speckit.implement`). These extensions add 11 additional workflows for the remaining ~75% of software development work:

### Workflow Extensions (full spec-kit workflow with branch, specs, and templates)

- **`/speckit.workflows.bugfix`** - Fix bugs with regression-test-first approach
- **`/speckit.workflows.hotfix`** - Handle production emergencies with expedited process
- **`/speckit.workflows.enhance`** - Make minor enhancements with streamlined single-doc workflow
- **`/speckit.workflows.refactor`** - Improve code quality with metrics tracking
- **`/speckit.workflows.deprecate`** - Sunset features with phased 3-step rollout
- **`/speckit.workflows.modify`** - Modify existing features with automatic impact analysis
- **`/speckit.workflows.baseline`** - Establish project baseline and track all changes
- **`/speckit.workflows.cleanup`** - Validate and reorganize spec-kit artifacts

### Command Extensions (provide commands without workflow structure)

- **`/speckit.workflows.review`** - Review completed work with structured feedback
- **`/speckit.workflows.phasestoissues`** - Create individual GitHub issues for each development phase
- **`/speckit.workflows.incorporate`** - Incorporate documents into workflows

> **Note:** All commands also have short aliases (e.g., `/speckit.bugfix` instead of `/speckit.workflows.bugfix`).

## Why Use These Extensions?

### The Problem

With vanilla spec-kit, you get structure for ~25% of your work (new features), but the remaining 75% happens ad-hoc:

- **Bugs**: No systematic approach → regressions happen
- **Feature changes**: No impact analysis → breaking changes
- **Code quality**: No metrics → unclear if refactor helped
- **Emergencies**: No process → panic-driven development
- **Feature removal**: No plan → angry users

### The Solution

These extensions bring spec-kit's structured approach to all development activities:

| Activity | Without Extensions | With Extensions |
|----------|-------------------|-----------------|
| **New Feature** | `/speckit.specify` workflow | Same |
| **Project Baseline** | Ad-hoc | `/speckit.workflows.baseline` with comprehensive docs |
| **Bug Fix** | Ad-hoc | `/speckit.workflows.bugfix` with regression tests |
| **Minor Enhancement** | Ad-hoc | `/speckit.workflows.enhance` with streamlined planning |
| **Modify Feature** | Ad-hoc | `/speckit.workflows.modify` with impact analysis |
| **Refactor Code** | Ad-hoc | `/speckit.workflows.refactor` with metrics |
| **Production Fire** | Panic | `/speckit.workflows.hotfix` with post-mortem |
| **Remove Feature** | Hope | `/speckit.workflows.deprecate` with 3-phase sunset |
| **Codebase Cleanup** | Manual | `/speckit.workflows.cleanup` with automation |
| **Work Review** | Inconsistent | `/speckit.workflows.review` with structured feedback |
| **GitHub Issues** | Manual | `/speckit.workflows.phasestoissues` with phase-level tracking |

## Quick Start

### Prerequisites

- **spec-kit** installed from source ([github.com/github/spec-kit](https://github.com/github/spec-kit)) — requires version with extension support (v0.2.0+)
- **AI coding agent** (Claude Code, GitHub Copilot, Gemini CLI, Cursor, etc.)
- **Git** repository

### Installation

**Step 1: Initialize spec-kit** (if not already done):
```bash
specify init --here --ai claude
```

**Step 2: Install extensions** (recommended):
```bash
# Install the CLI tool
pip install specify-extend
# or: uvx specify-extend --all

# Install all extensions
specify-extend --all
```

`specify-extend --all` is the **recommended installation method** until spec-kit natively supports alternate feature branch patterns (bugfix/, hotfix/, etc.). It:
1. Downloads and installs the extension via `specify extension add`
2. Patches spec-kit's `common.sh` to recognize extension branch patterns

**Alternative: Native spec-kit install** (advanced — does not patch branch patterns):
```bash
# Install extension only (no branch pattern support)
specify extension add workflows --from https://github.com/pradeepmouli/spec-kit-extensions/archive/refs/heads/main.zip

# Then manually patch branch patterns
specify-extend --patch
```

### Verify Installation

```bash
# Check extension is installed
specify extension list

# Should show:
#   Spec Kit Workflow Extensions (v3.2.0)
#   Commands: 19 | Status: Enabled

# Try a command:
/speckit.workflows.bugfix "test bug"
# Or use the alias:
/speckit.bugfix "test bug"
```

### Post-Installation Structure

After installation, your project will have:

```
your-project/
├── .specify/
│   ├── extensions/
│   │   └── workflows/           # Extension install directory
│   │       ├── extension.yml    # Extension manifest
│   │       ├── commands/        # 19 command files (11 user + hook helpers)
│   │       │   ├── bugfix.md
│   │       │   ├── hotfix.md
│   │       │   ├── issue-sync-before-specify.md
│   │       │   └── ...
│   │       ├── scripts/
│   │       │   ├── bash/        # Bash create scripts + utils
│   │       │   └── powershell/  # PowerShell create scripts
│   │       └── templates/       # Workflow templates
│   │           ├── bugfix/
│   │           ├── hotfix/
│   │           └── ...
│   ├── scripts/bash/
│   │   └── common.sh            # Patched with extension branch support
│   └── memory/
│       └── constitution.md
└── .claude/commands/             # Agent-specific command files (auto-generated)
```

## Usage

### Quick Decision Tree

```
Starting with spec-kit?
└─ Use /speckit.workflows.baseline to establish project context

Building something new?
├─ Major feature → /speckit.specify "description"
└─ Minor enhancement → /speckit.workflows.enhance "description"

Fixing broken behavior?
├─ Production emergency → /speckit.workflows.hotfix "incident"
└─ Non-urgent bug → /speckit.workflows.bugfix "bug description"

Changing existing feature?
├─ Adding/modifying behavior → /speckit.workflows.modify 014 "change"
└─ Improving code quality → /speckit.workflows.refactor "improvement"

Removing a feature?
└─ /speckit.workflows.deprecate 014 "reason"

Reviewing completed work?
└─ /speckit.workflows.review [task-id]

Creating GitHub issues?
└─ /speckit.workflows.phasestoissues
```

### Example: Fix a Bug

```bash
# Step 1: Create bug report
/speckit.workflows.bugfix "profile form crashes when submitting without image"
# Creates: bug-report.md with initial analysis

# Step 2: Investigate and update bug-report.md with root cause

# Step 3: Create fix plan
/speckit.plan

# Step 4: Break down into tasks
/speckit.tasks

# Step 5: Execute fix
/speckit.implement
```

### Example: Modify Existing Feature

```bash
# Step 1: Create modification spec with impact analysis
/speckit.workflows.modify 014 "make profile fields optional"
# Creates: modification-spec.md + impact-analysis.md

# Step 2: Review impact analysis

# Step 3-5: Plan, tasks, implement (same as above)
```

### Native Hook Issue Sync

The extension now supports native lifecycle hook syncing for linked GitHub issues at:

- `before_specify`, `after_specify`
- `before_plan`, `after_plan`
- `before_tasks`, `after_tasks`
- `before_implement`, `after_implement`

Hook commands call `scripts/bash/update-linked-issue.sh`, which:

- Resolves the linked issue (PR closing references, feature docs, or explicit env var)
- Applies event-specific labels
- Optionally posts event status comments
- Optionally bootstraps missing labels in the target repository

Configuration files installed with the extension:

- `.specify/extensions/workflows/workflows-config.yml`
- `.specify/extensions/workflows/issue-sync.env`

Use `issue-sync.env` to customize per-event mappings (`SPECKIT_ISSUE_SYNC_LABEL_*` and `SPECKIT_ISSUE_SYNC_STATUS_*`).

## Workflow Cheat Sheet

| Workflow | Command | Alias | Key Feature |
|----------|---------|-------|-------------|
| **Feature** | `/speckit.specify "..."` | — | Full spec + design |
| **Baseline** | `/speckit.workflows.baseline` | `/speckit.baseline` | Context tracking |
| **Bugfix** | `/speckit.workflows.bugfix "..."` | `/speckit.bugfix` | Regression test |
| **Enhance** | `/speckit.workflows.enhance "..."` | `/speckit.enhance` | Single-doc workflow |
| **Modify** | `/speckit.workflows.modify 014 "..."` | `/speckit.modify` | Impact analysis |
| **Refactor** | `/speckit.workflows.refactor "..."` | `/speckit.refactor` | Baseline metrics |
| **Hotfix** | `/speckit.workflows.hotfix "..."` | `/speckit.hotfix` | Post-mortem |
| **Deprecate** | `/speckit.workflows.deprecate 014 "..."` | `/speckit.deprecate` | 3-phase sunset |
| **Cleanup** | `/speckit.workflows.cleanup` | `/speckit.cleanup` | Automated validation |
| **Review** | `/speckit.workflows.review` | `/speckit.review` | Structured feedback |
| **Phases→Issues** | `/speckit.workflows.phasestoissues` | `/speckit.phasestoissues` | GitHub integration |
| **Incorporate** | `/speckit.workflows.incorporate` | `/speckit.incorporate` | Doc integration |

## Compatibility

### spec-kit Versions

- **Required**: spec-kit v0.3.1+ (with extension system support)
- Install from source: `uv tool install specify-cli --from "git+https://github.com/github/spec-kit.git"`

### AI Agents

Commands are registered by spec-kit's extension system and work with any supported agent:

| Agent | Status |
|-------|--------|
| Claude Code | Supported |
| GitHub Copilot | Supported |
| Cursor | Supported |
| Windsurf | Supported |
| Gemini CLI | Supported |
| Codex CLI | Supported |
| Amazon Q Developer CLI | Supported |

### Component Versions

- **Extension** (v3.2.0) — Workflows, commands, templates, and scripts
- **CLI Tool** (v2.2.1) — `specify-extend` installation and patching tool

## FAQ

### Do I need to use all 11 workflows?

No! Use only what you need. Common combinations:
- **Minimal**: Just `bugfix` (most teams need this)
- **Standard**: `bugfix` + `enhance` + `modify` (covers most scenarios)
- **Complete**: All 11 workflows (full lifecycle coverage)

### Why use `specify-extend --all` instead of `specify extension add`?

`specify-extend --all` additionally patches spec-kit's `common.sh` to support extension branch patterns (`bugfix/`, `hotfix/`, `refactor/`, etc.). Without this patch, spec-kit's branch validation will reject these branch names. Once spec-kit natively supports alternate branch patterns, `specify extension add` alone will be sufficient.

### Can I customize the workflows?

Yes! After installation, all files are in `.specify/extensions/workflows/`. Edit templates, commands, or scripts to suit your needs.

### Do these work without Claude Code?

Yes! The workflows are **agent-agnostic**. They work with any AI agent that supports spec-kit.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT License — Same as spec-kit. See [LICENSE](LICENSE).

## Credits

Built for the spec-kit community by developers who wanted structured workflows for more than just new features.

- [GitHub spec-kit team](https://github.com/github/spec-kit) for the foundation
- Early adopters who tested these workflows in production

## Support

- **Issues**: [GitHub Issues](https://github.com/pradeepmouli/spec-kit-extensions/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pradeepmouli/spec-kit-extensions/discussions)
- **spec-kit**: [Original spec-kit repo](https://github.com/github/spec-kit)
