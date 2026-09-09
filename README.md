# Jude House Wedding Films

This is a static wedding-film site for Jude House, focused on Orlando and Central Florida.

- The homepage keeps the original stacked, cinematic presentation while introducing the wedding offer.
- `/wedding-videography/`, `/films/`, and `/planning/` are permanent, indexable pages.
- The two planning tools live at `/wedding-light-planner/` and `/wedding-video-coverage-planner/`.
- `sitemap.xml` and `robots.txt` support search discovery. Submit the sitemap in Google Search Console after publishing.

## What To Edit

- Add each new wedding as its own page under `films/`, then add it to `films/index.html` and `sitemap.xml`.
- Add verified venue, planner, and vendor details to film pages when you have permission. They make each page more useful and locally specific.
- Keep the public details accurate. Do not add pricing, reviews, venue claims, or locations that are not true.
- The private invoice tool lives at `invoice-gen/` and is blocked from crawling and unlinked from the homepage.

## Local Preview

Serve the folder with any static server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes

- Videos are displayed with custom cards and open in a branded modal, so they do not read like standard YouTube embeds.
- The layout is intentionally full-width, dark, and minimal with motion-driven reveals.
