# CramClock

**Live:** https://cramclock.vercel.app

This app is a read-only assignment countdown. The “database” is a Google Sheet: a **Combined** tab that merges your Manual entries with Canvas deadlines (synced via Apps Script). The sheet is **published as CSV**, which the Next.js API reads and parses; the page then renders timers with plain vanilla JS. Updating the sheet updates the site, no redeploys and no auth.
