# Dreamspree Travel & Tours — Website Revamp Prototype

A frontend-only design prototype that reimagines [dreamspreetravel.com](https://dreamspreetravel.com) as a modern travel discovery and service platform. Built for stakeholder review and design demonstration. **It is not a production website.**

Positioning: *“Dreamspree stands behind your whole trip.”* Premium assurance at fair prices, led by curated packages, transparent trip information, visa assistance throughout the journey and human travel consultants.

## Run it locally

No build step, no dependencies. Serve the folder with any static server and open `index.html`:

```bash
# Python
python3 -m http.server 8080
# or Node
npx serve .
```

Then visit `http://localhost:8080/`. Opening the files directly (`file://`) also works in most browsers, but a static server is recommended so that `?id=` package links and `localStorage` behave consistently.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Homepage: hero, tabbed search widget, destinations, featured packages, why Dreamspree, visa section, services, how it works, travel stories, consultant CTA |
| `explore.html` | Package catalogue with destination rail, filters (type, region, budget, duration, travel type), search, sort, result count and empty state |
| `package.html?id=…` | Single reusable package template populated from the ID in the URL: gallery with lightbox, tabs, itinerary accordion, inclusions, preparation, policy and FAQs, sticky booking panel with traveller counters and sample total |
| `visa.html` | Visa Readiness Checker: three-step guided flow producing an illustrative, personalised checklist with progress tracking |
| `trip-builder.html` | Trip Builder preview: saved packages, travellers and dates per package, trip summary and combined quotation request |
| `about.html` | About, services, the proposed Dreamspree Verified partner standard, the Dreamspree Promise concept and contact |

Navigation links are consistent across all pages. “Our Services” anchors to the services grid on the homepage; service categories without a dedicated demo flow (flights, hotels, transport, cruises, insurance, corporate) open a pre-filled enquiry panel instead of a dead end.

## Structure

```
dreamspree/
├── index.html · explore.html · package.html · visa.html · trip-builder.html · about.html
├── css/
│   ├── styles.css        design tokens, reset, typography, layout, header, hero, footer
│   ├── components.css    buttons, cards, forms, search widget, tabs, accordion, modal, toast, filters, booking panel, visa checker, trip builder
│   └── responsive.css    breakpoint rules (1440 / 1024 / 768 / 390 / 360), reduced motion, print
├── js/
│   ├── data.js           all demo data: destinations, packages, stories, visa checklists, company details, image IDs
│   ├── app.js            shared layer: nav + drawer, modal with focus management, toasts, validation, enquiry form, saved-trip store, search widget, card renderers, homepage rendering
│   ├── packages.js       explore filters/sort and the package detail template
│   ├── visa.js           visa readiness checker
│   ├── trip.js           trip builder
│   └── animations.js     GSAP 3 + ScrollTrigger motion layer with fallbacks
├── assets/img/dreamspree-logo.png
└── README.md
```

Stack: HTML5, CSS3, vanilla JavaScript (ES6+), GSAP 3 and ScrollTrigger from cdnjs, Google Fonts (Roboto Serif, a variable modern serif used for every piece of text). No frameworks, no build tools.

## Design system (v2)

- **Typography:** Roboto Serif throughout, from 800-weight display headings with tight tracking down to 13px UI labels. Body text is 17px at a 1.6 line height; sizes scale with `clamp()`.
- **Colour:** teal green primary (`--c-primary`), the logo's lime as accent (`--c-lime`), the logo's sky blue for informational notices, coral for price emphasis, and a near-black ink used for text, dark sections and the footer. Backgrounds are white with a cool light-green alternate. All tokens live at the top of `css/styles.css`.
- **Surfaces:** flat cards with 1px borders and 10–18px radii, shadows only on hover and overlays.
- **Headers:** the homepage keeps an immersive hero; every subpage uses a compact `page-head` band (breadcrumb, title, one-line description, actions) so filters, steps and packages sit near the top of the viewport.
- **Logo:** the PNG is a solid green block with white type and is placed without any box, padding or shadow.

## Editing the demo data

Everything product-like lives in `js/data.js`:

- `DS.packages` – 13 sample packages across the ten priority destinations. Each uses the same schema (`id`, `title`, `destinationId`, `type`, `category`, `duration`, `priceFrom`, `childRate`, `images`, `summary`, `highlights`, `inclusions`, `exclusions`, `itinerary`, `accommodation`, `preparation`, `cancellation`, `faqs`, `departures`, `visaNote`).
- `DS.destinations` – the ten destinations with visa status, region and best-season notes.
- `DS.stories` – editorial cards and their full demo copy.
- `DS.visa.destinations` – illustrative checklists for Japan, South Korea and Schengen; items carry optional `cond` functions that react to the traveller’s answers and a `review` flag for items a consultant should check.
- `DS.images` and the `images` arrays – Unsplash photo IDs, so photography can be swapped for licensed Dreamspree imagery by changing IDs in one place. Every image has a loading state and a branded fallback if it fails to load.

## What is simulated

- **Enquiry, booking request and quotation forms** validate client-side and show a success state. Nothing is transmitted or stored.
- **Prices, departures, seats, policies and processing times** are illustrative sample data and are labelled as such throughout.
- **Trip Builder and visa progress** persist only in the browser’s `localStorage` (package IDs, traveller counts, dates, ticked checklist items). No passport numbers, identity documents or other sensitive information are requested or stored.
- **Dreamspree Verified** and the **Dreamspree Promise** are presented as a proposed standard and a concept. No accreditation numbers, inspection records or binding guarantees are shown.
- Share uses the Web Share API where available and otherwise copies the link.

## Accessibility and motion

Semantic landmarks and headings, skip link, keyboard-operable tabs (arrow keys), accordions, counters and modals with focus trapping and focus return, visible focus states, labelled inputs with inline error messages, `aria-live` regions for results and totals. Animations use transform and opacity, respect `prefers-reduced-motion`, and content stays fully visible if GSAP fails to load.

## Security note

The current live site was reported to contain injected third-party links. This prototype was written from scratch and reuses only business content (services, contact details, destinations). No HTML, scripts, extensions or tracking code from the existing site were copied.
