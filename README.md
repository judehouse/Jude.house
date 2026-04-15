# Jude House Portfolio

This is a static, single-page portfolio build with:

- `index.html` for structure
- `styles.css` for the visual system and animations
- `main.js` for video data, modal playback, and reveal behavior

## What To Edit

- Update the featured video list in `main.js` if you add more work.
- Replace `hello@judehouse.studio` in `index.html` with your real contact email.
- Swap any wording in the hero, services, or contact sections to match your voice.
- The private invoice tool lives at `invoice-gen/` and is intentionally noindexed and unlinked from the homepage.

## Local Preview

Serve the folder with any static server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes

- Videos are displayed with custom cards and open in a branded modal, so they do not read like standard YouTube embeds.
- The layout is intentionally full-width, dark, and minimal with motion-driven reveals.
