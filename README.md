# TTB by the Numbers

A single-page data project built entirely from public data published by the
Alcohol and Tobacco Tax and Trade Bureau (TTB). It covers federal excise tax
collections on alcohol, tobacco, firearms, and ammunition (FY 2015 to FY 2025)
and the regulated industries that pay them.

Every figure traces to a named TTB release, definitions are reconciled where
TTB reports differ, and redacted values are shown as gaps rather than estimates.

## Files

- `index.html` — the page
- `styles.css` — styles
- `app.js` — chart and interaction logic
- `data.js` — all figures, verbatim from TTB published files
- `chart.umd.min.js` — Chart.js
- `.nojekyll` — tells GitHub Pages to serve the files as-is

## Publishing to GitHub Pages

1. Create a repository and upload the contents of this folder.
2. In the repository settings, under Pages, set the source to the branch
   root (usually `main`).
3. The `.nojekyll` file must stay in the repository so Pages serves the site
   directly instead of running it through Jekyll.

## Sources

All data is from TTB's published statistical releases and open data files at
[ttb.gov/data](https://www.ttb.gov/data), current as of late June 2026.
This is an independent presentation of public data and is not affiliated with
or endorsed by TTB or the Department of the Treasury.
