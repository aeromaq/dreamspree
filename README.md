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
| `index.html` | Homepage: campaign hero carousel, tabbed search panel (each service asks only what it needs; see below), destinations, featured packages, why Dreamspree, visa section, "Build a custom trip" section, services, how it works, travel stories, consultant CTA |
| `explore.html` | Package catalogue with destination rail, filters (type, region, budget, duration, travel type), search, sort, result count and empty state |
| `package.html?id=…` | Single reusable package template populated from the ID in the URL: gallery with lightbox, tabs, itinerary accordion, inclusions, preparation, policy and FAQs, sticky booking panel with departures shown as date ranges, package validity, an "Another date" option that turns the booking into a custom trip, traveler counters, sample total (or "Price on request") and Add to Travel Cart |
| `visa.html` | Visa Readiness Checker: three-step guided flow producing an illustrative, personalised checklist with progress tracking |
| `cart.html` | Travel Cart: packages, visa assistance, flights, hotels, transport, cruises and insurance in one list; edit or remove items, see priced and on-request items, then send one quotation request in a three-step checkout (cart → your details → request sent) |
| `trip-builder.html` | Redirect to `cart.html` for old links |
| `about.html` | About, services, the proposed Dreamspree Verified partner standard, the Dreamspree Promise concept and contact |

Navigation links are consistent across all pages. “Our Services” anchors to the services grid on the homepage; the header's Travel Cart button opens a slide-in mini cart on every page. Flights, hotels, transport, cruises and insurance are added to the cart as requests; corporate travel opens a proposal enquiry.

## Structure

```
dreamspree/
├── index.html · explore.html · package.html · visa.html · cart.html · about.html · trip-builder.html (redirect)
├── css/
│   ├── styles.css        design tokens, reset, typography, layout, header, hero, footer
│   ├── components.css    buttons, cards, forms, search widget, tabs, accordion, modal, toast, filters, booking panel, visa checker, traveler picker, Travel Cart
│   └── responsive.css    breakpoint rules (1440 / 1024 / 768 / 390 / 360), reduced motion, print
├── js/
│   ├── data.js           all demo data: destinations, packages, stories, visa checklists, company details, image IDs
│   ├── app.js            shared layer: nav + drawer, modal with focus management, toasts, validation, enquiry form, traveler picker, search panel, card renderers, homepage rendering
│   ├── packages.js       explore filters/sort and the package detail template
│   ├── visa.js           visa readiness checker
│   ├── cart.js           Travel Cart store, header badge, mini cart, add/edit forms (every page)
│   ├── cart-page.js      Travel Cart page and quotation checkout
│   ├── hero-carousel.js  homepage campaign carousel
│   └── animations.js     GSAP 3 + ScrollTrigger motion layer with fallbacks
├── assets/img/dreamspree-logo.png
├── assets/icons/            favicon.svg, apple-touch-icon.png, icon-192.png, icon-512.png
├── favicon.ico · site.webmanifest
└── README.md
```

Stack: HTML5, CSS3, vanilla JavaScript (ES6+), GSAP 3 and ScrollTrigger from cdnjs, Google Fonts (Manrope, a variable sans-serif used for every piece of text). No frameworks, no build tools.

## Design system (v3)

- **Typography:** Manrope, a variable sans-serif (400–800), is used for everything: body copy, navigation, buttons, forms, cards and labels in regular to bold weights, and headings in ExtraBold (800) with tight tracking. There are no serif or decorative faces. Sizes scale with `clamp()`.
- **Colour:** taken from the logo. Logo green `#8CC63E` is the primary brand colour, used for indicators, highlights and accents on dark backgrounds. Buttons and CTAs use a deeper green from the same family, `#47801E` (hover `#3E701A`), with white labels at 4.8:1 or better; the bright logo green cannot carry white text (2.05:1). A darker `#4A6A1F` carries green text, links and icons on light backgrounds. Deep green `#14301C` covers dark sections, the footer and selected states. Logo sky blue `#00ADEF` / `#006F99` is reserved for information and visa signals. Sun yellow `#F5EE2C` is used sparingly: the cart count and campaign prices on dark. Surfaces are white and a soft green-tinted `#F4F7F1`, and text is `#16241A`. All tokens are `--color-*` variables at the top of `css/styles.css`.
- **Icons:** one inline SVG set with a size scale (`--icon-xs` 14px in badges, `--icon-sm` 16px inline, `--icon-md` 20px in buttons and fields, `--icon-lg` 24px in feature tiles, `--icon-xl` 28px in step markers). SVGs never shrink inside flex rows.
- **Logo and favicon:** the logo is shown as supplied, with square corners and no padding, border, shadow or background. The favicon is a simplified version of the logo emblem (green frame, sun, palm and sea) drawn in the logo's exact colours, with bolder shapes so it stays legible at 16px. It ships as SVG, ICO (16/32/48) and PNG touch and app icons.
- **Navigation:** the header's Travel Cart button (shopping-bag icon with an item count) opens the mini cart. Package cards carry the same bag icon as their add-to-cart button.
- **Search panel:** each tab asks only what that service needs. All fields share one height, labels sit on one line, and travelers are chosen in a small adults/children picker instead of a long dropdown.
  - *Tours & Packages:* trip type (International or Domestic) first, then a destination, then travel dates. The date picker follows the destination: it lists that destination's scheduled departures as date ranges and only the months that have departures. "Build a custom trip" sits under the form.
  - *Custom Trip:* its own tab, second after packages (also linked from the mobile menu as "Build a Custom Trip", `index.html#custom`). Travelers tick what to include, then where, when and how many; "Plan my trip" opens the full form for pace, hotel class, budget and notes.
  - *Visa:* visa country, travel dates (exact dates or a month; "Return date not decided yet" hides the return; leaving it empty reads "Not decided yet") and applicants.
  - *Flights:* round trip or one way, then From and To. Both search any of 150+ airports worldwide by 3-letter code, city or country; anything not on the list is kept as typed for the consultant. No trip type, because it is an airfare-only quotation.
  - *Hotels:* city or area (worldwide search), check-in and check-out, guests and rooms. "Add another city" opens a multi-city form with one row per city; each row becomes its own hotel item and starts on the previous check-out.
  - *Transport:* no trip type. Choose a service (airport transfer, intercity transfer, day tour, car with driver, self-drive rental, private van, coach or bus), a pick-up city or airport worldwide, and dates: one date for transfers and day tours, a start and end for hires and rentals.
  - *Insurance and Corporate:* worldwide destination search, departure and return dates. Corporate sends a proposal request.
- **Several lines at once:** Visa ("Add another country"), Flights ("Add another flight", multi-city), Hotels ("Add another city") and Transport ("Add another transfer or car") open one shared form with a row per line and shared traveler counts. Visa, hotel and transport rows each become their own cart item; a multi-city flight is one item with all its legs. Tours, cruises, insurance and corporate travel do not have it: a package or cruise is already a whole trip, one policy covers every country, and corporate trips are planned in a proposal.
- **Travelers and groups:** counters go up to 12 people. "More than 12? Book as a group" switches to one number from 13 to 100; groups get group rates on request (packages hide the sample total) and show as "Group of 25 travelers" everywhere. In modals the counters are shown inline, so nothing pops over other fields.
  - *Cruises:* region, then a month, exact dates or a flexible length.
- **Date picker:** one control with up to three modes, switched on per form: *Exact dates* (departure and return), *Month*, and *Flexible* (number of nights, optionally around a month). On the homepage it opens as a popover; inside forms it is shown inline. Searches carry the dates to Explore, where packages that depart on those dates come first and are marked "fits your dates", and on to the package page.
- **Package departures:** every departure is shown as a range (departure + the package's nights), with weekdays and its seasonal note. "Another date" opens departure and return fields; the return defaults to the package length, departures past `validUntil` are refused, and the booking becomes a *custom trip* priced on request.
- **Custom trips:** travelers say where (optional), when, and tick what to include (flights, flight reservation for a visa, hotel, airport transfers, city tour, activities, theme parks, island hopping, private car, visa, insurance, meals), plus pace, hotel class, budget and notes. It opens from the Tours tab, the homepage section (ticks carry over), Explore and the Travel Cart, and lands in the cart as its own item. A custom trip needs at least 2 things ticked; with only one, the form offers that service directly instead (for example "Request a hotel").
- **Cards:** package cards reserve the image's top-left for the duration and category badges and a fixed 44px top-right slot for the add-to-cart button, so they cannot overlap at any width. Destination cards show their tagline, price and package count at all times (no hover-only text), grow with their copy instead of clipping it, and place a scrim directly behind the copy. White text over photography was measured in the rendered pages at 4.5:1 or better.
- **Grids:** every `fr` column is `minmax(0, …fr)` so long content cannot push a column wider than its share.
- **Headers:** the homepage keeps an immersive hero; subpages use a compact `page-head` band. Explore shows a destination intro (description, best season, visa status, next step) when a destination is selected.
- **Motion:** scroll reveals only move content slightly; they never fade it out or hide it. Text stays readable and focusable even before its animation plays, and it appears in full-page screenshots.

## Editing the demo data

Everything product-like lives in `js/data.js`:

- `DS.packages` – 13 sample packages across the ten priority destinations. Each uses the same schema (`id`, `title`, `destinationId`, `type`, `category`, `duration`, `priceFrom`, `childRate`, `images`, `summary`, `highlights`, `inclusions`, `exclusions`, `itinerary`, `accommodation`, `preparation`, `cancellation`, `faqs`, `departures`, `visaNote`, `validUntil`, `airport`).
- `validUntil` is the last date a package can depart. Departures after it are hidden and custom dates cannot go past it. Each departure ends after `duration.nights`, so it is displayed as a date range. `airport` pre-fills flight requests.
- Prices are optional: set `priceFrom: null` and the package shows "Price on request" on cards, the package page and in the Travel Cart. Price-on-request packages sort last by price and are hidden while a budget limit is set. Three sample packages use this.
- `DS.cartCatalog` – what can be added to the Travel Cart besides packages: visa countries with optional sample service fees, flight origins, cabin classes, hotel classes, transport services, cruise regions, insurance plans, transport services (`transportServices`: one date or a date range, and the labels for each), and the custom-trip options (`customIncludes`, `travelStyles`). Leave a `fee` as `null` to make it "Price on request".
- `DS.airports` – the worldwide airport list behind the Flights search (code, city, country, airport name), one line per airport. `DS.places` (hotel and corporate cities) and `DS.countries` (insurance) are built from it, plus a few resort areas without their own airport.
- `DS.destinations` – the ten destinations with visa status, region and best-season notes.
- `DS.stories` – editorial cards and their full demo copy.
- `DS.visa.destinations` – illustrative checklists for Japan, South Korea and Schengen; items carry optional `cond` functions that react to the traveler’s answers and a `review` flag for items a consultant should check.
- `DS.images` and the `images` arrays – Unsplash photo IDs, so photography can be swapped for licensed Dreamspree imagery by changing IDs in one place. Every image has a loading state and a branded fallback if it fails to load.

## Running a hero campaign

The homepage hero is a carousel. Slide 1 is the brand slide, written directly in `index.html` so the page still works without JavaScript. Every other slide comes from `DS.campaigns` in `js/data.js`, in order.

To add a campaign, add an object with:

- `id` and `label`: the label appears on the slide tab, for example "Sakura 2027".
- `eyebrow`, `title`, `accent` and `lede`: the copy. The accent words render in lime.
- `image` and `alt`: an Unsplash photo ID and its description.
- `priceFrom` (optional): shown as "From ₱… per person · sample price".
- `primary`: the main button, as `{ label, href }`.
- `secondary`: either a link `{ label, href }` or an enquiry button `{ label, enquiry: { service, destination, title, message } }`.

Slides change every `DS.heroIntervalMs` (7 seconds). Autoplay pauses on hover, on keyboard focus, when the browser tab is hidden, and with the pause button. It is switched off entirely for visitors who prefer reduced motion. Inactive slides are inert, so their links cannot be focused. Campaign buttons carry `data-campaign-cta="<id>"` so analytics can attribute clicks later.

## Content sources

- The About page story, Mission and Vision come from dreamspreetravel.com/about-us. The Mission and Vision statements are reproduced word for word. The story paragraphs are lightly copy-edited for grammar.
- "More destinations, arranged on request" on Explore and "We also assist with visas for" on the Visa page list the destinations and visa countries named on the live site that have no sample package. On Explore each one starts a custom trip for that place; on the Visa page each opens a pre-filled enquiry.
- The copy does not name or compare against other companies.

## What is simulated

- **Enquiry, booking request and quotation forms** validate client-side and show a success state. Nothing is transmitted or stored.
- **Prices, departures, seats, policies and processing times** are illustrative sample data and are labelled as such throughout.
- **Travel Cart and visa progress** persist only in the browser’s `localStorage` (item types, destinations, traveler counts, dates, ticked checklist items). Packages saved in the old Trip Builder move into the cart automatically. The quotation "checkout" validates and shows a confirmation with a demo reference; nothing is sent, reserved or charged. No passport numbers, identity documents or other sensitive information are requested or stored.
- **Dreamspree Verified** and the **Dreamspree Promise** are presented as a proposed standard and a concept. No accreditation numbers, inspection records or binding guarantees are shown.
- Share uses the Web Share API where available and otherwise copies the link.

## Accessibility and motion

Semantic landmarks and headings, skip link, keyboard-operable tabs (arrow keys), accordions, counters and modals with focus trapping and focus return, visible focus states, labelled inputs with inline error messages, place search built as an ARIA combobox (arrow keys, Enter, Escape), date and traveler pickers that close with Escape without closing the surrounding dialog, `aria-live` regions for results and totals. Animations use transform and opacity, respect `prefers-reduced-motion`, and content stays fully visible if GSAP fails to load.

## Security note

The current live site was reported to contain injected third-party links. This prototype was written from scratch and reuses only business content (services, contact details, destinations). No HTML, scripts, extensions or tracking code from the existing site were copied.
