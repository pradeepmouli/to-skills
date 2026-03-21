---
name: Template Initialization
description: Automate project initialization from template-ts by driving the interactive script non-interactively. The script features intelligent defaults auto-detection from git config and environment, skills discovery based on project context, and automatic installation of specify tools for GitHub Copilot.
argument-hint: Project description and optional parameters for initializing a new project from template-ts.
---

# Template Initialization

Automate project initialization from template-ts by driving the interactive script non-interactively. The script features intelligent defaults auto-detection from git config and environment, skills discovery based on project context, and automatic installation of specify tools for GitHub Copilot.

## When to Use

Use this prompt when the user wants to:
- Initialize a new project from the template-ts repository
- Set up a fresh repository with customized project metadata
- Configure package scope and remove example packages/tests
- Automate the entire `scripts/init-template.mjs` workflow without manual prompts

## Workflow & Execution

The initialization script uses **zx** (Google's bash replacement) for cross-platform compatibility. Run it interactively:

```bash
npx zx scripts/init-template.mjs
```

### Intelligent Defaults

The script auto-detects most values from your environment:
- **Project name** - From `basename $(pwd)`
- **Author name** - From `git config user.name`
- **Author email** - From `git config user.email`
- **Repository URL** - From `git config remote.origin.url`
- **Package scope** - Extracted from project name (e.g., "acme-app" → "acme")

Most prompts can be accepted by pressing Enter. Only the project description typically requires manual input.

### Required Inputs

**Must provide:**
- `description` - Project description (no default)

**Optional (intelligent defaults provided):**
- `project_name` (default: current directory name)
- `author_name` (default: from git config)
- `author_email` (default: from git config)
- `repository_url` (default: from git remote)
- `package_scope` (default: extracted from project name, fallback: "company")
- `remove_example_packages` (default: "y")
- `remove_example_tests` (default: "y")
- `remove_example_e2e` (default: "y")
- `replace_template_initialization` (default: "y" - deletes TEMPLATE_INITIALIZATION.md)
- `delete_template_files` (default: "y" - deletes TEMPLATE_PLACEHOLDERS.md and this prompt file)

### Initialization Steps

The script performs these operations in sequence:

1. **Validate environment** - Check Node.js >= 20, pnpm >= 10
2. **Gather inputs** - Prompt for configuration with intelligent defaults pre-filled
3. **Discover skills** - Analyze project context and recommend relevant skills from https://skills.sh/
4. **Update template placeholders** - Replace all `<!-- TEMPLATE: -->` markers and placeholders throughout repository
5. **Install Copilot tools** - Auto-install `specify init . --ai copilot` (non-interactive: add `--force --ignore-agent-tools`) and `uvx specify-extend --all --agent copilot`
6. **Clean up template files** - Remove template-specific documentation and example code (based on user choices)
7. **Verify setup** - Run lint and tests, report results

## Post-Initialization

Run validation commands:

```bash
pnpm run lint
pnpm test
```

## What Gets Updated

The initialization script updates template placeholders throughout the repository:

### Core Files
- `package.json` - Project metadata, author, description, repository URLs
  - Replaces: `YOUR_NAME`, `YOUR_EMAIL`, `YOUR_GITHUB_USERNAME`, `YOUR_REPO_NAME`
- `README.md` - Project title, description, badges
  - Updates all `<!-- TEMPLATE: -->` markers with actual values
- `AGENTS.md` - Project name and agent guidance
  - Replaces `@company/ts-template` with actual project name
- `CONTRIBUTING.md` - Repository URLs and project name
  - Updates clone instructions and repository references
- `SECURITY.md` - Security contact information
  - Replaces `YOUR_DOMAIN.com` and repository URLs

### Documentation Files
- `docs/DEVELOPMENT.md` - Repository URLs and workflow instructions
- `docs/WORKSPACE.md` - Package scope examples
- `docs/TESTING.md` - Testing guidelines
- `docs/EXAMPLES.md` - Code examples with package scope

### Template Artifacts
- All files with `<!-- TEMPLATE: -->` HTML comments are updated
- `TEMPLATE_PLACEHOLDERS.md` - Template documentation (deleted after init)
- `scripts/TEMPLATE_INITIALIZATION.md` - Template guide (optionally deleted)
- `.github/prompts/template-initialization.prompt.md` - This prompt file (optionally deleted)
- Example packages/tests - Optionally removed based on user choices

### Git & CI/CD
- `.github/workflows/` - GitHub Actions workflows with updated repository context
- Git repository - Initialized with initial commit if not already present

### Agent Tools
- **Specify tools** - Installed automatically for GitHub Copilot integration
- Skills directories - Created with symlinks to recommended skills (.copilot/, .claude/, .codex/, .gemini/)

## Deliverables

Report to user:

- Configuration summary (inputs used, including auto-detected defaults)
- Discovered skills recommendations
- Commands executed
- **Template placeholders replaced:**
  - List of files updated with actual values
  - Confirmation that `<!-- TEMPLATE: -->` markers were processed
- **Template files cleaned up:**
  - `TEMPLATE_PLACEHOLDERS.md` - Deleted
  - `scripts/TEMPLATE_INITIALIZATION.md` - Deleted (if user chose to)
  - `.github/prompts/template-initialization.prompt.md` - Deleted (if user chose to)
- Specify tools installation status
- Lint results
- Test results
- Location of updated files
- Skills available in .copilot/, .claude/, .codex/, .gemini/ directories

## Template Markers

The repository uses standardized template markers:

**HTML comments in Markdown:**
```markdown
<!-- TEMPLATE: Description of what to update -->
```

**Standard placeholders:**
- `YOUR_GITHUB_USERNAME` - GitHub username/org
- `YOUR_REPO_NAME` - Repository name
- `YOUR_NAME` - Author name
- `YOUR_EMAIL` - Author email
- `YOUR_DOMAIN.com` - Domain for contacts
- `@company` - npm package scope

**Verification:** After initialization, search for any remaining placeholders:
```bash
grep -r "YOUR_" . --exclude-dir=node_modules
grep -r "@company" . --exclude-dir=node_modules
grep -r "<!-- TEMPLATE:" . --exclude-dir=node_modules
```
