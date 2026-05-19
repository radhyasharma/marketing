# LS Dry Cleaners — Redesign

A redesign of [lsdrycleaners.in](https://lsdrycleaners.in) with a 3D-animated frontend and a PHP-backed admin panel for editing **pricing** and **journal/blog** content without touching code.

> **Note on scraping:** the original site blocked our network egress during the build, so the structure, services, and copy here are a high-quality template based on premium Indian dry-cleaning chain conventions. **All content is editable from the admin panel** — you can paste in the exact copy from the original once deployed.

---

## Live preview

Static HTML pages render via `raw.githack.com` without needing a PHP server (they read content from the JSON files in `/data`):

| Page    | URL pattern (replace branch after push) |
|---------|-----------------------------------------|
| Home    | `https://raw.githack.com/radhyasharma/marketing/redesign-lsdrycleaners/index.html` |
| Services| `…/services.html` |
| Pricing | `…/pricing.html` |
| Journal | `…/blog.html` |
| About   | `…/about.html` |
| Contact | `…/contact.html` |

The PHP admin panel (`/admin/`) requires a real PHP host (any shared hosting, XAMPP, Docker, etc.) — it isn't reachable through GitHub raw.

---

## Architecture

```
marketing/
├── index.html            # public pages — pure static HTML
├── services.html
├── pricing.html          # loads data/pricing.json via fetch()
├── blog.html             # loads data/blogs.json via fetch()
├── post.html             # single article (?slug=…)
├── about.html
├── contact.html
│
├── admin/                # PHP admin panel
│   ├── index.php         # login
│   ├── dashboard.php     # KPIs + recent posts
│   ├── pricing.php       # full pricing CRUD
│   ├── blogs.php         # post list + editor
│   ├── logout.php
│   └── admin.css
│
├── includes/             # shared PHP
│   ├── config.php        # session, CSRF, escape, paths
│   ├── auth.php          # login / logout / require_admin
│   ├── data.php          # JSON load/save (atomic) + helpers
│   ├── admin-header.php  # admin layout shell
│   └── admin-footer.php
│
├── data/                 # JSON content store (writable in production)
│   ├── pricing.json      # categories, items, currency
│   ├── blogs.json        # journal posts
│   └── admin.json        # admin credentials (bcrypt hash)
│
└── assets/
    ├── css/style.css     # full design system
    └── js/
        ├── main.js       # nav, reveal animations, tilt
        ├── scene3d.js    # Three.js hero scene
        └── data-loader.js # client-side rendering of JSON content
```

### Why static HTML + JSON?

- The frontend has **zero server requirements** for browsing. Drop it on any CDN, GitHub Pages, S3, or shared host.
- Content lives in `data/*.json` — version-controlled, diffable, tiny.
- The PHP admin **edits those same JSON files**. Frontend re-reads them on next page load.
- For a full database, swap `includes/data.php` to use MySQL/PostgreSQL — none of the public pages need to change.

---

## Hero 3D scene

The home page features a full-screen Three.js canvas with:

- A field of physically-based iridescent **soap-bubble spheres** (`MeshPhysicalMaterial` with `transmission`, `iridescence`, `clearcoat`)
- A central rotating **garment-hanger ring** (gold torus + cyan inner ring + outer accent ring)
- Drifting **gold particle dust** with additive blending
- Mouse-driven parallax on camera + scene rotation
- Subtle fog and dual point lights (gold + cyan) for the brand palette
- Auto-paused for `prefers-reduced-motion` users

Three.js is loaded from CDN (no build step). See `assets/js/scene3d.js`.

---

## Admin panel

### Default credentials

```
URL:      /admin/
Username: admin
Password: lsadmin2026
```

**Change immediately on deploy.** Generate a new hash:

```bash
php -r "echo password_hash('your-new-password', PASSWORD_BCRYPT);"
```

…then paste it into `data/admin.json` → `password_hash`.

### Features

**Pricing editor** (`admin/pricing.php`)
- Edit currency code & symbol
- Add / remove categories (Men, Women, Kids, Household, Premium, …)
- Add / remove / edit items per category, with three price columns (Dry Clean, Wash & Iron, Iron Only)
- Leave any cell blank for "—" (not available)
- One-click "Save All Changes" — atomic write to `data/pricing.json`

**Journal editor** (`admin/blogs.php`)
- List, create, edit, delete posts
- Auto-slug from title; fully overrideable
- Cover image URL, author, date, tags
- HTML content area (`<p>`, `<h2>`, `<ul>`, `<ol>`, `<li>`, `<strong>`, `<a>` allowed)
- Excerpt for the listing page

**Security**
- bcrypt password hashing (`password_hash` / `password_verify`)
- CSRF tokens on every form
- HTTP-only, SameSite=Lax session cookies
- Session regeneration on login
- Atomic JSON writes (temp file + rename)
- HTML escaping on every `e()` echo

---

## Running locally

### Just the frontend (no PHP)

Any static server works:

```bash
python3 -m http.server 8000
# Visit http://localhost:8000/
```

### With the admin panel

```bash
php -S 127.0.0.1:8000
# Visit http://127.0.0.1:8000/
# Admin at http://127.0.0.1:8000/admin/
```

Or use XAMPP / MAMP / Laragon and drop the folder into the document root.

### Docker (optional)

```dockerfile
FROM php:8.2-apache
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html/data
```

---

## Deploying

Any PHP-capable host works. Make sure `data/` is **writable by PHP** (typically `chmod 775` and owner = web user).

```bash
chmod 775 data
chmod 664 data/*.json
```

Recommended hosts: Hostinger, SiteGround, DigitalOcean App Platform, any cPanel host.

For static-only deployment (without admin), push to GitHub Pages, Netlify, or Cloudflare Pages — pricing and blogs will still render correctly from the committed JSON files. To update content without PHP, edit JSON files directly and redeploy.

---

## Customising the design

| Token            | Meaning                          | Default      |
|------------------|----------------------------------|--------------|
| `--bg`           | Page background                  | `#0a0e1a`    |
| `--gold`         | Primary accent                   | `#d4a574`    |
| `--cyan`         | Secondary accent                 | `#5fc9d4`    |
| `--text`         | Body text                        | `#f4f1ea`    |
| Heading font     | `Cormorant Garamond` (Google)    | Editorial    |
| Body font        | `Inter` (Google)                 | Modern       |

All in `assets/css/style.css` — change the `:root` block to re-skin instantly.

---

## License

Built for the LS Dry Cleaners brand. All rights reserved.
