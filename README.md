# Les Petits Prödiges — Shopify theme

Online Store 2.0 theme converted from `html-prototype/`, matching Figma mobile + desktop.

## Structure

```
theme/
  assets/          # CSS, JS, fonts, UI icons only (no content photos)
  config/          # Theme settings schema + data
  layout/          # theme.liquid, password.liquid
  locales/         # en.default.json, fr.json
  sections/        # Header/footer groups + homepage + template sections
  snippets/        # product-card, css-variables, icons, spacing
  templates/       # JSON templates (index, collection, product, …)
  HARDCODED.md     # Justified non-editable elements
```

Prototype / Figma reference images stay in `../html-prototype/` — upload the ones you need via the theme editor.
## Homepage sections (drag-and-drop in customizer)

1. Hero (separate mobile/desktop media)
2. Featured collection
3. Banner CTA (diagnostic)
4. Testimonials before/after
5. Image gallery (“Écouter votre peau”)
6. Founders
7. Press logos
8. Video / lifestyle feature (mobile)
9. Journal (blog posts)
10. Rich text (SEO)
11. USP bar

Each section exposes text, images/videos, links, colors where relevant, and **mobile + desktop padding**.

## Global chrome

- **Header group:** announcement bar + header (menus, mega promos, logos)
- **Footer group:** newsletter, socials, menus, **Shopify Markets** country/language selectors, legal

- **Cart drawer** + **search modal** (theme layout)

## Setup

1. Connect the store with Shopify CLI:
   ```bash
   cd theme
   shopify theme dev --store your-store.myshopify.com
   ```
2. In **Online Store → Navigation**, create menus and assign them in the Header / Footer section settings.
3. Assign a collection to **Featured collection** and a blog to **Journal**.
4. Upload logos and section images in the theme editor (images are **not** bundled in `assets/` — use each section’s image pickers).
5. Re-check installed apps (reviews, loyalty, etc.) and re-add any theme app embeds / snippets listed by each app.

### Theme size

Shopify themes must stay under **50MB**. `assets/` only ships CSS, JS, fonts, and UI icons. Content photos live in the Files / theme editor CDN. `.shopifyignore` excludes `.git` and markdown from uploads.

## Breakpoints (Figma)

| Range | Target |
|-------|--------|
| &lt; 750px | Mobile |
| 750–989px | Tablet |
| ≥ 990px | Desktop layout |
| ≥ 1512px | Figma desktop scale |

## Apps

Keep all existing store apps. After theme switch:

- Enable **App embeds** in Theme settings → App embeds
- Re-paste any app Liquid snippets into the relevant sections if the app docs require it
- Document each manual integration in `HARDCODED.md` as you discover them on the live store

## Translations

- `locales/en.default.json` — English (default)
- `locales/fr.json` — French

Includes:

- All theme UI strings (`cart`, `products`, `accessibility`, …)
- Section schema names / labels / defaults (`t:sections.*`)
- Full **customer account** strings (login, register, orders, addresses, …)

Section defaults follow the active storefront language. Merchant edits in the theme editor still override defaults per locale when using Translate & Adapt / Shopify Markets.

To add another language: copy `fr.json` → e.g. `de.json`, translate values, enable the language in **Settings → Languages**.


## Prototype reference

Static HTML remains in `../html-prototype/` for visual QA against the theme.
