# Happy Birthday, Diyanshii ♡

A personal, handcrafted birthday website — a digital gift for Diyanshii.

---

## Quick Start

1. **Add your photographs** to `assets/images/`
2. **Add background music** (optional) to `assets/audio/birthday-music.mp3`
3. **Edit `data.js`** — replace image paths, captions, alt text, and dates
4. **Open `index.html`** in your browser

That's it. No build tools, no frameworks, no dependencies.

---

## Project Structure

```
├── index.html        ← Main page
├── styles.css        ← All styles
├── script.js         ← Interactivity (galleries, lightbox, animations)
├── data.js           ← ★ Configuration — edit this file ★
├── assets/
│   ├── images/       ← Your photographs go here
│   └── audio/        ← Background music goes here
└── README.md         ← You are here
```

---

## Configuring Photos & Music

Open **`data.js`** and you'll find clearly labelled sections:

| Section | Config Key | What to Edit |
|---------|-----------|--------------|
| Hero (Section 1) | `CONFIG.hero` | One hero photograph |
| Gallery 1 (Section 2) | `CONFIG.gallery` | 6–20 photographs with captions |
| Gallery 2 (Section 4) | `CONFIG.gallery2` | 1 large + 2 small photographs |
| Timeline (Section 4) | `CONFIG.timeline` | Optional dated memories |
| Closing (Section 7) | `CONFIG.closing` | Final photograph |
| Letter Signature | `CONFIG.letterSignature` | "Your sibling ♡" |
| Music | `CONFIG.music` | Path to an MP3 file |

### Example photo entry

```js
{
  src: "assets/images/memory-01.jpg",
  caption: "a moment worth keeping",
  alt: "Diyanshii smiling at a park",
  date: "March 2024"  // optional
}
```

---

## Hosting for Free

### Option A: GitHub Pages
1. Push the project to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **main** branch, root folder
4. Your site will be live at `https://username.github.io/repo-name`

### Option B: Netlify
1. Drag and drop the project folder at [app.netlify.com/drop](https://app.netlify.com/drop)
2. Done — you'll get a live URL instantly

### Option C: Vercel
1. Push to GitHub and import at [vercel.com/import](https://vercel.com/import)
2. No build step needed — it serves static files directly

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge).
Supports `prefers-reduced-motion` for users who prefer minimal animation.

---

## Notes

- No external dependencies or build tools required
- All fonts load from Google Fonts CDN
- Missing images show a graceful fallback placeholder
- The music player handles autoplay restrictions automatically
- Keyboard navigation works in the lightbox (←, →, Escape)

---

Made with love ♡
