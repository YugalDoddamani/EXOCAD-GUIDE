# EXOCAD-GUIDE

A practical, searchable learning guide for people learning exocad PartialCAD, especially dental technology students and technicians who need a quick answer while designing a removable partial denture framework.

## Live guide

- PartialCAD guide: https://exocad-guide.pages.dev/partial-cad/
- Repository: https://github.com/YugalDoddamani/EXOCAD-GUIDE

The guide is unofficial and is based on the exocad Wiki. It is not affiliated with or endorsed by exocad. Always confirm tool behaviour in your installed version and follow your lab's prescription and design protocol.

## Run locally

No build step or framework is required. Clone the repository and open `partial-cad/index.html` in a browser, or serve the repository root with a static HTTP server:

```sh
git clone https://github.com/YugalDoddamani/EXOCAD-GUIDE.git
cd EXOCAD-GUIDE
python -m http.server 8000
```

Then open http://localhost:8000/partial-cad/.

## How the guide is organised

- `partial-cad/index.html` contains the navigation, tool cards, glossary, workflow branches, and detailed reference sections.
- `partial-cad/styles.css` contains the responsive layout, typography, cards, navigation, and print styles.
- `partial-cad/script.js` powers shared search, relevance ranking, synonyms, URL query sharing, category filters, navigation highlighting, and glossary matches.

## Add or edit a tool card

Each tool card is an anchor inside `.tool-card-grid`. Keep its `href` pointed at the matching reference section ID, and include:

- `data-stage`: one of `prepare`, `analyse`, `construct`, `refine`, or `finish`.
- `data-search`: the tool name plus common task phrases, synonyms, settings, and words a beginner might use.
- A clear title and a one-sentence explanation of what the tool is for.
- A link label that tells the learner they can open the detailed instructions.

The reference section should use the same ID as the card's `href`. Put practical instructions, parameter tables, shortcuts, and cautions in that section. Search ranks tool titles, search aliases, summaries, and reference content; keep the alias phrases specific so unrelated sections do not become noisy matches. Add new plain-language definitions to the glossary in the same HTML file.

## Attribution and images

Text and technical notes are adapted from the [exocad Wiki](https://wiki.exocad.com/). Check the source site's terms before reusing its screenshots or images. Prefer screenshots captured from your own licensed software session, with patient-identifying information removed.
