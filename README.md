# Wenjie HUANG — Personal Academic Homepage

Static personal website for GitHub Pages, rebuilt from the original Google Site
(<https://sites.google.com/view/huangwenjie/home>). No build step, no dependencies:
plain HTML + CSS + ~90 lines of vanilla JS.

Live at: **https://wenjiehuangwayne.github.io**

## Structure

```
index.html        Home — bio, research interests, selected works, contact
research.html     Publications (3 categories) + research grants + service
teaching.html     Courses (DATA8007, DASE7001) + guest lectures
group.html        Ph.D. students, RAs, MSc/UG researchers
talks.html        Invited talks and seminars (grouped by talk title)
miscellaneous.html  Chinese calligraphy, illustration design and graffiti
assets/style.css  All styling (light/dark theme)
assets/main.js    Theme toggle + publication filter/search
assets/favicon.svg
assets/img/       Put your photo here (see below)
```

## Local preview

```bash
cd WenjieHuangWayne.github.io
python3 -m http.server 8000
# open http://localhost:8000
```

You can also just double-click `index.html` — everything works offline except the
masthead photo fallback, which is fine.

## Add your photo (no code change needed)

Save a square-ish photo as **`assets/img/profile.jpg`** and refresh. The site detects it
automatically and swaps the "WH" monogram for the picture. If the file is missing, the
monogram stays — no broken image icon.

### Artwork images (Miscellaneous page)

Drop images into `assets/img/works/` using these filenames; each appears automatically,
and until then the card shows a title placeholder:

```
genesis.jpg  cross.jpg  sjtu-graffiti.jpg  pour-out.jpg
as-a-deer.jpg  john-15-5.jpg  first-exhibition.jpg
```

To use a different filename/extension, edit the `src` in the `avatar-slot` block of each
HTML file (5 occurrences):

```html
<img class="avatar" id="avatar-img" src="assets/img/profile.jpg" alt="Wenjie Huang" hidden>
```

## How to edit content

Each page is one self-contained HTML file. The masthead (name, affiliation, contact) and
the top navigation are repeated in all five files, so a change to contact info should be
made in all five:

```bash
# example: change the email everywhere
grep -rl "huangwj@hku.hk" *.html | xargs sed -i '' 's|old@hku.hk|new@hku.hk|g'
```

### Add a publication

Copy any `<li data-cat="...">` block in `research.html` and edit it. `data-cat` drives the
filter buttons and must be one of:

| `data-cat` | Section |
|-----------|---------|
| `risk`    | Risk Analytics and Robust Optimization |
| `seq`     | Sequential Decision-Making |
| `om`      | Data Science/AI for Operations Management and Social Good |

Optional tags: `<span class="tag">Preprint</span>`,
`<span class="tag award">Best Paper Finalist</span>`,
`<span class="tag status">Under Review</span>`.

Links use `<span class="pub-links"><a href="...">DOI</a><a href="...">Preprint</a></span>`.

### Placeholder links to fill in

Some entries on `talks.html` (slides / video / poster) are `href="#"` placeholders —
replace them with real URLs when you have them.

## Deploy on GitHub Pages

1. Create an empty repo named `WenjieHuangWayne.github.io` (no README, no .gitignore).
2. Push this folder:
   ```bash
   git init && git add . && git commit -m "Initial site"
   git remote add origin git@github.com:WenjieHuangWayne/WenjieHuangWayne.github.io.git
   git branch -M main && git push -u origin main
   ```
3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**;
   branch `main`, folder `/ (root)`. Wait 1–2 minutes, then open
   <https://wenjiehuangwayne.github.io>.

### Custom domain (optional)

Put the domain in a file named `CNAME` (e.g. `wenjiehuang.hku.hk`), then point a CNAME
record at `wenjiehuangwayne.github.io` and enable HTTPS in Settings → Pages.
