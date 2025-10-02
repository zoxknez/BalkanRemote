# Deploy ops note (2025-10-01)

This file exists to trigger a redeploy on Vercel via Git push.

- Purpose: force production to pick up latest /api/scraper/run GET + secret logic and ensure-table helper.
- After deploy, verify:
  - GET https://www.balkan-remote.com/api/scraper/run?secret=***
  - Then check https://www.balkan-remote.com/api/scraper/jobs?limit=3
  - And the Oglasi page shows new listings.

