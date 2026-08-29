---
name: context:all-context
description: "Repository context router and stack architecture guide"
keywords: stack, architecture, conventions, imports, environment, routes
date: 20-08-26
---

# test-pony-tail-vibecoding-promax - All Context

Last updated: 2026-08-20

This file is the root context entrypoint for the repo.

Use it for two things:

1. quick routing to the right context pack or root file
2. broad architecture and repository understanding

Start here before loading deeper context files.

---

## How This File Works (the `all-*.md` Convention)

Every `process/context/` directory has one `all-*.md` entrypoint that acts as an attachable quick router for that domain. This root file (`all-context.md`) is the top-level router. Context groups each have their own `all-{group}.md` entrypoint.

**The pattern:**

```
process/context/
  all-context.md                      <-- THIS FILE: root router
  planning/
    all-planning.md                   <-- group router for planning
  tests/
    all-tests.md                      <-- group router for tests
```

**How agents use it:**

1. Agent reads `all-context.md` first (this file)
2. Finds the relevant context group from the routing tables below
3. Reads that group's `all-{group}.md` entrypoint
4. Only then loads the specific deep doc needed

This layered routing keeps context windows small. Never load the whole `process/context/` tree.

**What each `all-{group}.md` must contain:**

- Scope (what the group covers and does NOT cover)
- Read-when rules (when an agent should load this group)
- Quick procedures or decision rules
- Source paths (list of deeper docs in the group)
- Update triggers (when to refresh this group's content)
- Routing to deeper docs within the group

---

## Quick Start

For most substantial tasks:

1. read this file first
2. choose the smallest relevant root file or context group from the tables below
3. only then load deeper files

---

## Current Root Entry Points

| File | Read when |
|---|---|
| `process/context/all-context.md` | any substantial planning, research, review, or implementation task |

## Current Context Groups

| Group | Entry point | Scope |
|---|---|---|
| planning | `process/context/planning/all-planning.md` | plan-shape calibration, planning conventions, or implementation-plan examples |
| tests | `process/context/tests/all-tests.md` | testing surface, commands, and runner configurations |

## Task Routing Table

| If the task involves... | Start with |
|---|---|
| architecture or stack questions | this file |
| testing or verification | `process/context/tests/all-tests.md` |
| creating a new plan | `process/context/planning/all-planning.md` |

## Context Group Lifecycle

Context groups are durable knowledge domains, not feature folders.

Create a group when:

- a topic has 3+ durable docs
- a single doc exceeds roughly 800 lines with separable subtopics
- multiple agents repeatedly need only one slice of a large context file
- the topic maps to a stable operational domain (tests, infra, database, auth, UI, workflows, etc.)

Do not create a group when:

- the content is a temporary report
- the content is a plan or execution artifact
- the topic is feature-specific and belongs in `process/features/...`

Move or split one group at a time. Use `all-{group}.md` entrypoints. Run the `audit-context` skill after every context organization change.

## Naming Convention

There are no `README.md` files inside `process/context/`.

Canonical entrypoints use `all-*.md`:

- root: `process/context/all-context.md`
- group: `process/context/{group}/all-{group}.md`

Each `all-{group}.md` file should act as the attachable quick router for that domain:

- tell the agent what the group covers
- give quick procedures and decision rules
- route to smaller deeper files

## Context Update Protocol

When durable project knowledge changes:

1. update the smallest relevant context file
2. update this file if routing, ownership, naming, or groups changed
3. update the owning `all-{group}.md` entrypoint when a group exists
4. run `audit-context`

---

## Repository Structure

```
test-pony-tail-vibecoding-promax/
  package.json
  process/
    _GUIDE.md
    context/
      all-context.md
      all-context.md.seed
      _all-group-template.md.seed
      planning/
        all-planning.md
        all-planning.md.seed
      tests/
        all-tests.md
        all-tests.md.seed
    development-protocols/
      all-development-protocols.md
      orchestration.md
      implementation-standards.md
      plan-lifecycle.md
      phase-programs.md
      context-maintenance.md
    features/
      _GUIDE.md
      _feature-template/
        _GUIDE.md.seed
        active/
          _GUIDE.md
        completed/
          _GUIDE.md
        backlog/
          _GUIDE.md
    general-plans/
      active/
        _GUIDE.md
      completed/
        _GUIDE.md
      backlog/
        _GUIDE.md
```

## Technology Stack

- **Framework:** None (Vanilla Node.js / TypeScript template)
- **Language:** TypeScript ^5.0.0
- **Runtime:** Node.js (v22+)
- **Test runner:** Vitest ^2.0.0
- **Package manager:** npm (lockfile-free template)

## Key Patterns and Conventions

- **Node.js/TypeScript Development:** Basic modular code, compiled using TypeScript (`tsc`).
- **Testing:** Unit and integration testing with Vitest.

## Environment and Configuration

- **Configuration:** `package.json` in root folder.

## Scan Metadata

- Generated: 2026-08-20T23:33:40Z
- HEAD: 3bcb2f9891308fcaa305e2b64027bd0a7dc8251e
- Mode: fresh
- Package manager: npm
