---
name: context:all-tests
description: "Testing quick start, commands, runners, and debugging reference"
keywords: tests, testing, vitest, commands, runners, verification
date: 20-08-26
---

# test-pony-tail-vibecoding-promax - All Tests

Last updated: 2026-08-20

Attach this file first when the task involves testing, verification, or test debugging.

This is the fast operator guide for the testing surface:

- which runner to use
- what command to start with
- how to quickly debug common failures
- which deeper file to read next

Do not load the whole `process/context/tests/` folder by default. Start here, then drill down.

---

## How This File Works

This is the `all-tests.md` entrypoint for the `tests/` context group. It follows the `all-*.md` routing convention:

1. Agents read `all-context.md` first and get routed here for testing tasks
2. This file gives quick decision rules and commands
3. For deeper details, agents follow the routing table below to specific docs

As the project grows, add deeper docs to this group (e.g., `e2e-tests.md`, `debugging-and-pitfalls.md`) and add routing entries below. This file stays the fast-start entrypoint.

---

## What This Covers

- test runner selection
- quick commands by package
- fast debugging procedures
- current testing gaps worth remembering

## Read This When

Use this file when you need to:

- run tests after implementation
- decide between test runners
- debug failing tests

## Quick Routing

(No deeper test docs yet. Add routing entries here as they are created.)

## Quick Decision Guide

### Use `vitest` for everything

- all tests run through vitest
- `npm run test` for CI, `npx vitest` (watch mode) for development

## Default Verification Order

Unless the task clearly needs a different path:

1. run the narrowest existing automated test
2. use unit/integration tests before browser tests
3. use end-to-end tests only when the real UI is the thing being verified

## Commands

| Package | Runner | Command |
|---|---|---|
| root | vitest | `npm run test` |

## Debugging Quick Reference

- **No custom environment needed:** Tests run in node environment by default. No additional `.env` or external database is required.

## Known Gaps

- No tests have been implemented yet.
