# Terawww — official game developer website

Terawww is an independent game developer and the creator of WriteNor, a first-person psychological horror about Johnny, a frozen present and an unfolding past. The current description follows the official Steam page, checked on 23 October 2026. The full release date is to be announced; a demo is available.

- Website: https://terawww337.github.io/
- Russian version: https://terawww337.github.io/ru/
- WriteNor: https://writenor.github.io/
- Steam: https://store.steampowered.com/app/4312600/WriteNor/

## Hosting and editing

Static GitHub Pages site with no build step. `index.html` and `ru/index.html` contain readable content and structured data without needing JavaScript. Shared refinements and optional animations live in `assets/refinements.css` and `assets/site.js`. Every language version has its own canonical URL and reciprocal `hreflang` links. The existing Google verification file remains in place.

The pixel mask icon is derived from the creator's supplied avatar using built-in ImageGen, then exported with nearest-neighbor resizing. `favicon.ico` contains 16 and 32 pixel images; `favicon-96x96.png`, `apple-touch-icon.png` and the manifest icons support search, tabs and device shortcuts. No letters are included in the small icon. The full pixel avatar is a separate PNG deliverable and is not displayed in the page content. Social previews use the text wordmark in `assets/social-cover.png`, generated from the editable SVG source.

## Search identity

**Terawww** is the preferred name. **Teraw**, **Терав** and **Тераввв** are alternate spellings of this handle, stated visibly on the site and in the creator's structured data. They identify this developer in the context of their games; they do not claim ownership of every unrelated use of the word “Teraw”.

Static JSON-LD connects the WebSite, ProfilePage, Person and WriteNor VideoGame using stable entity identifiers and official profile URLs. It includes no invented awards, ratings, prices or release date. The site describes the current game rather than the obsolete adaptive-AI coding-simulator concept.

`robots.txt` and `sitemap.xml` use the actual `terawww337.github.io` hostname. To request reprocessing after publication, submit the sitemap in Google Search Console and inspect `/` and `/ru/`. Google chooses snippets, site names, favicon appearances and AI summaries automatically; markup and alternate names do not guarantee rankings or exact output.

## Accessibility and motion

Content remains visible without JavaScript. The narrow-screen navigation can be opened with a button, closed with Escape, and used by keyboard. Form fields have explicit labels. Browser zoom is enabled. Reduced-motion settings are respected, and a local effects preference can disable optional animation. Canvas animation pauses in hidden tabs and uses a bounded backing buffer with fewer columns on narrow screens. Form submissions continue to use the existing Formspree endpoint; testing must not send real messages.
