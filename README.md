# Nordic Giant Digital

Static site for **Nordic Giant Digital, LLC** — hand-coded HTML with the same build approach as the Per portfolio site.

## Build

```bash
npm install   # optional; only needed if refreshing Inter font files from @fontsource
npm run build
```

Output goes to `_site/`. Deploy that folder to any static host (GitHub Pages, Netlify, S3, etc.).

## Contact form

The home page includes a contact form that posts to [Formspree](https://formspree.io), which forwards submissions to your inbox.

1. Create a form at [formspree.io](https://formspree.io).
2. Add one or more recipient addresses in the Formspree dashboard.
3. For local builds, copy `.env.example` to `.env` and set your form ID:

   ```
   FORMSPREE_FORM_ID=abc123xy
   ```

4. Rebuild: `npm run build`

For GitHub Pages deploys, add the same value as a repository secret named `FORMSPREE_FORM_ID` (Settings → Secrets and variables → Actions).

The form uses AJAX (see `Assets/contact-form.js`) so visitors stay on the page after submitting.

## GitHub Pages

If you host on GitHub Pages:

1. Push this repo to GitHub.
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Add the `FORMSPREE_FORM_ID` secret (see above).
4. Push to `main` — the deploy workflow builds `_site/` and publishes it.

No other GitHub configuration is required for the contact form itself.

## Local preview

```bash
npm run build
python3 -m http.server --directory _site 8080
```

Then open http://localhost:8080

## Structure

```
index.html          Home page (includes contact form)
_includes/          Header, footer, head, contact-form partials
CSS/                Styles (critical CSS inlined at build time)
Assets/             Fonts, contact-form.js
scripts/build-site.py   Assembles _site from sources
```

No password encryption — unlike the portfolio site, pages are served as plain static HTML.
