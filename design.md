# Design Notes: exocad PartialCAD Guide

**Date:** 13 October 2026  
**Related PR:** [#9](https://github.com/YugalDoddamani/EXOCAD-GUIDE/pull/9)

## 1. Design direction

The guide should look like a friendly, carefully made workshop reference, not a corporate dashboard or a generic AI knowledge base. It should feel a little playful while keeping technical instructions easy to scan.

## 2. Preserve the existing visual identity

- **Page background:** warm cream.
- **Typography:** Source Serif 4 for display/headings and IBM Plex for interface/body text, following the existing CSS variables.
- **Hero:** bold, thick outline with a clear search-first hierarchy.
- **Folder cards:** outlined, colourful folder tabs and distinct category colours.
- **Navigation:** persistent sidebar structure, collapsible groups, active-link highlighting.
- **Page order:** hero search → category folder shelf → tool finder → full reference.
- **Framework:** plain HTML, CSS, and JavaScript only.

Avoid a redesign that changes the first impression or makes the homepage switch modes.

## 3. Category vocabulary

Use one visible name for each category across the folder shelf, filter chips, and sidebar groups:

| Key | Display name |
| --- | --- |
| `prepare` | Preparation |
| `analyse` | Survey & blockout |
| `construct` | Build framework |
| `refine` | Edit wax |
| `finish` | Assemble & export |

The sidebar group previously called “Getting Started” is now “Basics” to avoid confusion with the Preparation folder. Keep existing `data-stage` and `data-filter` keys unchanged.

## 4. Search experience

- Keep results close to the search field and visible without requiring a long scroll.
- Treat the search field as a task finder, not only a literal title filter.
- Return relevant tool cards, guide pages, and glossary matches.
- Keep sidebar navigation stable while the query changes.
- Display a concise reason or matched phrase, not the same summary text twice.
- When a known rescue workflow matches, show numbered instructions in the instant result panel.
- Keep the full tool grid below as the browseable reference.
- Prioritize explicit aliases and known task intent over incidental body-text matches.

## 5. Folder shelf and learning path

The sixth folder is “New to PartialCAD?” with the subtitle “Learn the whole process in order” and link text “Start learning”. It should use the same outlined folder-card language, with a distinct teal tab.

The learning page is separate from the wiki homepage so it does not require switching the homepage into a new mode. It reuses the main stylesheet and includes:
- A branch selector for Upper, Lower, or Flexible.
- A single-column learning card.
- Step count and progress indicator.
- Previous and Next controls.
- Five consistent content blocks per step.
- A clear unverified-draft label.
- A link to the corresponding section in the full reference.

## 6. Content style

- Write in direct, calm, practical language.
- Use adult-to-adult explanations, not an “explain like I’m five” tone.
- Avoid generic encouragement, filler, robotic phrasing, and unnecessary editorial commentary.
- Use consistent heading styles and punctuation.
- Use colons for definitions and periods or commas to separate prose.
- Avoid em dashes in the reference copy.
- Explain the action in the current section instead of sending readers elsewhere for the basic instruction.
- Where helpful, use the labels “Use this when” and “Common mistakes / if it goes wrong”.

## 7. Interaction and responsive behaviour

- Search results should appear directly below the search bar.
- A result should navigate to the relevant guide section or glossary anchor.
- Sidebar links should not disappear while searching.
- The desktop workflow uses two columns, filled down the first column before the second.
- The mobile workflow collapses to one column.
- Check 390px viewport behaviour, keyboard navigation, focus visibility, and long result labels before release.

## 8. Accessibility and share metadata

- Maintain readable contrast for intro text.
- Keep interactive controls as real buttons or links.
- Use meaningful accessible labels for branch selection and navigation controls.
- Include a canonical URL and Open Graph metadata.
- The current preview artwork is SVG. Validate social-platform support; provide a 1200 × 630 PNG if required.

## 9. Visual QA checklist

- [ ] Search results are visible near the search field on desktop and mobile.
- [ ] Folder cards retain consistent dimensions, typography, and tab treatment.
- [ ] All five category names match across folders, chips, and sidebar.
- [ ] Sidebar active state follows section jumps correctly.
- [ ] No text is clipped at 390px.
- [ ] Workflow numbering reads in order.
- [ ] Focus indicators are visible and controls work by keyboard.
- [ ] The learning page looks like part of the same guide, not a separate product.
