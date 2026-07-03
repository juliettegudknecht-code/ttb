# TTB by the Numbers

A prohibition-era picture show, with data. One page, dressed as a 1920s silent film, telling the story of the Alcohol and Tobacco Tax and Trade Bureau through its own published numbers. Inside you will find a century of tax rates, a decade of collections, and the slow fade of beer, wine, and tobacco volumes. A typewriter narrates, a NO BEER stamp slams, and a beer-mug jukebox in the corner spins the house record.

## The door

The place is a speakeasy, so the door is locked and the doorman wants a password. Sorry, friend. It is not written down here, and it will not be. If you are supposed to get in, Juliette will see that you know the word. Everyone else is welcome to admire the door.

## The tab

Every figure on the page names its source, and the tab at the end itemizes the lot. The short version:

- Tax collections: TTB Statistical Release TTB S 5630, final annual summaries, FY 2015 to FY 2025
- Beer, wine, and spirits: TTB National Statistical Reports (TTB S 5130, 5120, 5110), calendar years 2012 to 2025
- Tobacco: TTB yearly statistics, taxable removals, 2012 to 2025
- Permits: TTB National Revenue Center counts and the Distilled Spirits Permit Counts report
- Agency figures: TTB Annual Reports for FY 2019 to FY 2023 and the FY 2025 Annual Financial Report
- Tax rates: TTB Historical Tax Rates page through 2017, current Tax Rates page from 2018 on

All figures as published in files current at the end of June 2026. This site is an independent presentation of public data. It is not affiliated with or endorsed by TTB or the Department of the Treasury.

## Deploying to GitHub Pages

This repo must contain a file named `.nojekyll` at the root, or the deploy will fail. Without it, GitHub runs the site through its Jekyll builder, and that build now takes longer than the 10 minute limit GitHub allows, so it times out and the site never publishes (or keeps serving an old version).

The catch: `.nojekyll` is a hidden file, so the Mac Finder does not show it and it never comes along when files are drag-and-dropped into GitHub. Add it once directly on GitHub:

1. In the repo on github.com, click Add file, then Create new file
2. Type `.nojekyll` as the file name and leave the contents empty
3. Click Commit changes

After that, uploads deploy in seconds. Future drag-and-drop uploads will not remove it, so this only needs doing once per repo.

To see hidden files in Finder instead, press Cmd+Shift+Period.
