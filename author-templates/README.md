# Author page templates (proof of concept)

One HTML page for an author (content from the George Guttenberg concept site),
nine interchangeable styles, and a switcher in the top-right corner.

Open `index.html` in a browser. No build step.

## Files

- `index.html` – the page. It contains **one** `.book`; that is the template every other book is cloned from.
- `js/switcher.js` – the switcher: template, number of books (1–12), background colour.
- `css/base.css` – switcher UI and a few shared guards. Loaded after the theme.
- `css/themes/*.css` – one file per style, each loads its own Google Fonts:
  - `orchard.css` – warm and rustic: Fraunces + Lora, arched portrait, fanned series stack.
  - `broadsheet.css` – newspaper front page: blackletter masthead, Playfair Display, column rules, numbered books.
  - `cellar.css` – dark and cinematic: Cormorant Garamond + Manrope, faded full-bleed portrait, 3D covers.
  - `poppress.css` – neo-brutalist zine: Archivo Black + Space Grotesk, hard shadows, ticker, coloured tilted cards.
  - `gallery.css` – museum minimal: Instrument Serif + DM Mono, framed covers with wall labels, large type.
  - `daylight.css` – Cellar's bright, neutral sibling: warm white and stone, soft daylight 3D covers.
  - `keynote.css` – product-launch tech: Inter Tight, glassy bar, gradient headline, rounded product tiles.
  - `thriller.css` – bold and dark: Anton, red-toned portrait, crime-scene tape, case files and a classified dossier.
  - `orbit.css` – neon sci-fi HUD: Orbitron + JetBrains Mono, starfield, corner brackets, covers in orbit.

## What the JavaScript gives each theme

On `.books`:

- `data-layout` = `single` (1 book), `pair` (2), `grid` (3+)
- `data-density` = `dense` from 6 books
- `--n` = number of books, `--cols` = balanced columns per row (5 → 3+2, 7 → 4+3)

On `<html>`:

- `data-theme` = active template
- `data-tone` = `light` or `dark`, worked out from the background colour, so text stays readable on any colour the user picks
- `--bg` = the chosen background colour (removed for "Template default")

Every theme has a sticky menu. `base.css` makes `.site-header` sticky and
draws a full-width backdrop behind it; the script keeps `--header-h` and
`--nav-offset` up to date and sets `data-scrolled` on `<html>` after scrolling.
A theme can tune it with `--header-top`, `--header-bg`, `--header-bg-scrolled`,
`--header-blur` and `--header-shadow` (Broadsheet uses a negative
`--header-top` so only the nav strip stays visible under the masthead).
On phones the menu stays on one line and scrolls sideways.

The series stack (`.series-stack`) gets one cover per book, up to 5, with `--i` and `--n` set.

## URL parameters

`index.html?theme=cellar&books=5&bg=%23f4ecdc` – handy for sharing a specific look.
Settings are also kept in `localStorage`.

## Adding a sixth style

Copy a theme file, change it, and add an entry to `THEMES` in `js/switcher.js`.
Style `.books[data-layout="single|pair|grid"]` and both `data-tone` values.
