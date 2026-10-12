# Product Requirements Document: exocad PartialCAD Guide

**Date:** 13 October 2026  
**Repository:** [YugalDoddamani/EXOCAD-GUIDE](https://github.com/YugalDoddamani/EXOCAD-GUIDE)  
**Working branch:** `fix/partialcad-fixlist-v2`  
**Pull request:** [#9](https://github.com/YugalDoddamani/EXOCAD-GUIDE/pull/9)  
**Status:** Open PR; not merged. GitHub reported the PR as not mergeable at the time of writing.

## 1. Product goal

Make the exocad PartialCAD reference easier for beginners to search, navigate, and learn from, while keeping the existing wiki-first homepage and visual identity. The guide should feel practical, friendly, and written by someone who understands the workflow, not like generic AI-generated documentation.

## 2. Users and needs

- **Primary user:** A beginner learning exocad PartialCAD who needs to find a specific operation quickly and understand what to do next.
- **Secondary user:** A dental technician or experienced operator using the guide as a quick reference.
- **Content reviewer:** A person familiar with actual PartialCAD workflows who can validate instructions against the software.

Users need to:
- Search with the words they naturally use, including task descriptions and synonyms.
- See useful search results close to the search box, without hunting through the page.
- Find glossary definitions and jump to their full references.
- Navigate by category without the sidebar changing unpredictably during search.
- Understand when a tool is useful and how to recover from common mistakes.
- Follow an ordered learning path without losing access to the full reference.

## 3. Product principles and constraints

- Keep the homepage wiki-first: hero search, folder shelf, tool finder, then reference content.
- Preserve the cream background, Source Serif 4 / IBM Plex typography, outlined hero and folder cards, and colour tabs.
- Preserve the sidebar structure and the 30 existing tool cards.
- Use static HTML, CSS, and JavaScript. Do not introduce a framework.
- Use direct, natural, consistent language. Avoid filler and unnecessary em dashes.
- Mark workflow advice as draft until it has been checked in an actual exocad session.

## 4. Scope implemented in PR #9

### Search and glossary
- Added the missing glossary search results container.
- Updated the stale instruction that referred to two search boxes.
- Removed sidebar filtering tied to search; navigation remains visible.
- Added guide-page search results for Workflow Overview, Keyboard Shortcuts, Mouse Controls, Case Setup, Hardware Requirements, and Glossary.
- Improved natural-language aliases for beginner questions such as going back and getting started.
- Limited body-text match weight so incidental phrases do not dominate stronger matches.
- Changed match explanations to avoid repeating the card summary.
- Consolidated wax-removal query phrases and preferred tool order into a rescue data structure.
- Added variants such as “delete wax” and “get rid of wax”.
- Moved numbered wax-removal guidance into the instant search results panel.
- Clarified the Clone modifier wording for Shift and Ctrl.

### Navigation and content consistency
- Removed stacked section scroll offsets and adjusted active-section detection.
- Standardized the five category names across folder labels, filter chips, and navigation groups; renamed the sidebar group to “Basics”.
- Changed the desktop workflow grid order so steps read down the first column, then the second.
- Adjusted category heading typography and intro-text contrast.
- Corrected punctuation in the named prose and definition patterns without restoring em dashes.
- Clarified glossary wording for Riser, Relief wax, and Tissue stop.
- Added “Use this when” and “Common mistakes / if it goes wrong” notes to Trim Scan, Survey, Edit Blockout, Clone, Select Wax, Smooth, and Apply Clasps.

### Beginner learning path and sharing
- Added a sixth folder entry: “New to PartialCAD?”.
- Added a separate `partial-cad/learn/` page with a 12-step sequence, branch choice (Upper / Lower / Flexible), Previous/Next controls, and links to the full reference.
- Added an explicit draft warning because the steps have not been verified in an installed exocad session.
- Added Open Graph preview artwork and a canonical URL.
- Updated README search documentation.

## 5. Acceptance criteria

### Search
- Searching “undercut”, “rest seat”, or “blockout” displays glossary matches and links to the relevant glossary anchor.
- Searching “remove wax” and “delete wax” presents the same intended rescue order, with numbered steps in the instant results area.
- Searching “bumpy” returns relevant smoothing/blockout tools without hiding sidebar navigation.
- Searching “go back” or “how do I go back” returns Keyboard Shortcuts or Workflow Overview near the top.
- Searching “where do I start” returns beginner-relevant guide content and the learning path.
- Search results do not repeat the same sentence as the card summary.

### Navigation and layout
- Jumping to a reference section highlights the corresponding sidebar item.
- Workflow steps read 1–6 down the left column and 7–12 down the right on desktop; mobile stays single-column.
- Existing homepage hierarchy, 30 tool cards, typography, and overall palette remain intact.
- The beginner learning path can be opened from the homepage in one click.

### Learning path
- The first three steps cover Trim Scan, Survey / Blockout, and Edit Blockout.
- Each step uses the same structure: purpose, what the software does, a pre-next check, recovery advice, and a full-reference link.
- All unverified steps display a clear draft warning.
- The path supports Upper, Lower, and Flexible branch selection.

## 6. Deferred / requires human validation

- Add practical “Use this when” and recovery notes to the remaining 23 tool sections.
- Expand Clone, Smudge, Tug, Post, and Retention Bead content where needed.
- Capture original screenshots from a licensed exocad session, without patient information.
- Test what actually happens when going back a step in exocad.
- Confirm the recommended first wax-removal method with an experienced user.
- Validate the Riser and Tissue stop glossary entries against the intended lab workflow.
- Run the desktop and 390px mobile acceptance checklist in a browser.
- Confirm the live root redirect and cache behaviour after deployment.
- Consider PNG Open Graph artwork if social preview platforms reject SVG.

## 7. Validation recorded so far

- Main JavaScript syntax check passed.
- Learning-path JavaScript syntax check passed.
- No duplicate IDs were found in the main HTML.
- No broken in-page hash links were found in the main HTML.
- Confirmed glossary results markup exists, sidebar search-filtering references are removed, and stacked section scroll-margin declarations are removed.
- Full browser interaction testing and exocad workflow validation have not been performed.

## 8. Release condition

Do not treat the learning-path copy or the workflow-specific recommendations as verified instructions until reviewed in a real exocad session. Resolve the GitHub mergeability warning and complete the browser acceptance checks before merging or deploying.
