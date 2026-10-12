# Project Memory: exocad PartialCAD Guide

**Last updated:** 13 October 2026  
**Repository:** [YugalDoddamani/EXOCAD-GUIDE](https://github.com/YugalDoddamani/EXOCAD-GUIDE)  
**Current work branch:** `fix/partialcad-fixlist-v2)  
**Current PR:** [#9](https://github.com/YugalDoddamani/EXOCAD-GUIDE/pull/9)

## Current status

- PR #9 is open and not merged.
- At the time it was created, GitHub reported `mergeable: false`. Recheck the PR before merging.
- The branch was reported as 11 commits ahead and 0 behind `main`.
- The base commit reported for the PR was `600d89721602642a32520e2f8f77bf4629eb09c0`.
- Main and learning-path JavaScript syntax checks passed.
- Duplicate HTML IDs and broken in-page hash links were not found in the main HTML.
- Full browser testing has not been performed.
- No live exocad session was used to verify workflow advice.

## Files changed in the work

- `README.md`: search documentation updated.
- `partial-cad/index.html`: glossary results markup, search copy, category labels, glossary wording, practical notes on seven tools, and a link to the learning path.
- `partial-cad/script.js`: guide-page search results, natural-language search, sidebar filtering removal, match explanation changes, and data-driven wax-removal rescue.
- `partial-cad/styles.css`: scroll-offset cleanup, workflow layout order, category heading typography, intro contrast, and styles for practical notes.
- `partial-cad/learn/index.html`: separate learning page.
- `partial-cad/learn/learn.js`: 12-step learning content and navigation.
- `partial-cad/og-preview.svg`: share preview artwork.

## Decisions to preserve

1. Keep the homepage wiki-first. Do not replace it with a mode switch.
2. Preserve the cream background, Source Serif 4 / IBM Plex fonts, outlined hero and folder cards, colour tabs, sidebar structure, and all 30 tool cards.
3. Keep the implementation static HTML/CSS/JS. Do not add a framework.
4. Use these category names consistently: Preparation; Survey & blockout; Build framework; Edit wax; Assemble & export.
5. Use “Basics” for the sidebar group that contains Learning home, Hardware, Mouse, Keyboard, Workflow, and Glossary.
6. Keep beginner learning content visibly marked as draft until checked against the actual software.
7. Prefer plain, natural, slightly playful copy. Avoid robotic filler and unnecessary em dashes.
8. Keep search results close to the search bar and leave sidebar navigation stable during search.

## Search behaviour and wax-removal rescue

- Guide pages are included as search candidates.
- Beginner queries include phrases around “go back” and “where do I start”.
- Wax-removal aliases are intended to share a single rescue configuration.
- Current rescue order is Select Wax → Clone → Smooth.
- The suggested Clone modifier copy is: hold Shift to remove a fixed thickness of wax; hold Ctrl to add on top of existing wax.
- The first-tool recommendation still needs confirmation with an experienced PartialCAD user.

## Learning path

- Separate page: `partial-cad/learn/index.html`.
- Script: `partial-cad/learn/learn.js`.
- Twelve steps are present, with Upper / Lower / Flexible selection, progress, Previous/Next, and reference links.
- Steps 1–3 are Trim Scan, Survey / Blockout, and Edit Blockout.
- All steps are marked unverified draft content. Some later steps are provisional placeholders and must be reviewed, corrected, or removed before presenting the path as complete.
- The branch choice currently updates its note and stores the selection where browser storage is available. The steps are not yet branched into separate sequences.

## Remaining work

### Priority 1: Resolve and validate PR
- Reopen PR #9 and inspect why GitHub reports it as not mergeable.
- Run the page locally using `python -m http.server 8000`.
- Test at desktop and 390px mobile width.
- Test search: `remove wax`, `delete wax`, `bumpy`, `undercut`, `rest seat`, `go back`, `how do i go back`, `where do i start`, and `?q=remove%20wax`.
- Check sidebar active state after jumping to `#select-wax`, `#workflow`, `#glossary`, `#clone`, `#survey`, and `#save-build`.

### Priority 2: Improve content
- Add “Use this when” and “Common mistakes / if it goes wrong” to the remaining 23 tool sections.
- Expand Clone, Smudge, Tug, Post, and Retention Bead sections as appropriate.
- Restore punctuation carefully across all named reference copy, without reintroducing em dashes.
- Verify Riser, Tissue stop, and Relief wax definitions against trusted technical practice.
- Test “go back a step” behaviour in exocad.
- Confirm the best first wax-removal operation with a knowledgeable user.

### Priority 3: Assets and release
- Capture original undercut colour-scale, blockout wax versus partial wax, clasp, rest, and connector screenshots from a licensed session. Do not include patient information.
- Validate Open Graph previews on the platforms used for sharing. Export a 1200 × 630 PNG if SVG is not accepted.
- Confirm the root redirect and deployed cache behaviour in a private window after deployment.
- Read relevant terms before reusing any third-party documentation for future guides.

## Important caution

This file is a handoff record, not proof that the PR has been merged or that the instructions have been tested in exocad. Re-check GitHub status and validate the workflow before treating the learning path as authoritative.
