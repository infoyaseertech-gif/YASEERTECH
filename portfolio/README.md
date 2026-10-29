# YaseerTech Portfolio

Self-contained static site. No build step, no dependencies.

## Add / edit a project
Edit **js/projects.js** only. Fill in real details; anything left blank is hidden.
Put screenshots in `images/projects/` (WebP, ~1200px wide) and reference them in the data.
Set `visibility: "public"` to publish, `"hidden"` to keep as a draft.

## Links
- Inside your site:   https://yaseertech.vercel.app/portfolio/
- Separate link (optional): in Vercel, "Add New > Project", pick the same GitHub repo,
  set **Root Directory = portfolio**, Framework = Other, Deploy.
  You get e.g. https://yaseertech-portfolio.vercel.app (rename under Project Settings > Domains),
  or attach a subdomain such as portfolio.yourdomain.com.
  Project deep links work on both: `/#project=ajigs-connect`.
