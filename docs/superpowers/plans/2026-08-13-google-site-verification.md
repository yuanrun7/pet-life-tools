# Google Search Console Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the exact Google Search Console verification meta tag to the static homepage and produce a verified GitHub source package.

**Architecture:** Keep verification in the root static HTML head so it is visible before React executes. Protect it with a Vitest file-content regression test and verify both source and Vite output.

**Tech Stack:** HTML, Vitest, TypeScript, Vite, Git archive

## Global Constraints

- The exact token is `CHp4N8cueOffoFgbFiZWSE31oYrsizdOyYG0VIsZiRA`.
- Do not change UI, application behavior, dependencies, storage, or medical content.
- The verification tag must remain in `dist/index.html` after production build.

---

### Task 1: Add and verify the Google ownership meta tag

**Files:**
- Create: `tests/google-site-verification.test.ts`
- Modify: `index.html`
- Create: `outputs/output_06_GitHub源码包_Google验证版_20260813.zip`

**Interfaces:**
- Consumes: Google Search Console URL-prefix HTML meta verification.
- Produces: One static `<meta name="google-site-verification" ...>` tag in source and production HTML.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Google site verification', () => {
  it('keeps the exact verification meta tag in the homepage head', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html).toContain(
      '<meta name="google-site-verification" content="CHp4N8cueOffoFgbFiZWSE31oYrsizdOyYG0VIsZiRA" />',
    );
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `vitest run tests/google-site-verification.test.ts --configLoader runner`

Expected: FAIL because `index.html` does not yet contain the verification tag.

- [ ] **Step 3: Add the minimal static tag**

Add below the viewport meta in `index.html`:

```html
<meta name="google-site-verification" content="CHp4N8cueOffoFgbFiZWSE31oYrsizdOyYG0VIsZiRA" />
```

- [ ] **Step 4: Verify GREEN and production output**

Run:

```powershell
vitest run --configLoader runner
tsc --noEmit
vite build --configLoader runner
Select-String -Path dist/index.html -SimpleMatch 'CHp4N8cueOffoFgbFiZWSE31oYrsizdOyYG0VIsZiRA'
```

Expected: all tests pass, type check exits 0, build exits 0, and `dist/index.html` contains the exact token.

- [ ] **Step 5: Archive and commit**

```powershell
git add index.html tests/google-site-verification.test.ts docs/superpowers
git commit -m "chore: add Google site verification"
git archive --format=zip --output=outputs/output_06_GitHub源码包_Google验证版_20260813.zip HEAD
```

Expected: clean tracked worktree and a source archive that excludes dependencies and local data.

