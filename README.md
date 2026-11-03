# H&A Shipping

H&A Shipping is an Arabic, right-to-left operations dashboard for managing shipping orders and related business workflows. The frontend is built with React, TypeScript, and Vite, and connects to the H&A Shipping API.

## Features

- Sign in and role-based access to dashboard sections
- Create, view, edit, and search shipping orders
- Scan order and finance barcodes
- Print order documents
- Manage users and branches (for authorized roles)
- Review financial summaries and profit reports
- Select order locations on a map
- Barcode scanning for order workflows
- Arabic RTL layout with light and dark themes

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Getting started

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal (usually `http://localhost:5173`). Sign in with an account provisioned by the API administrator; this repository does not include demo credentials or a local API server.

## Configuration

The API base URL defaults to the H&A Shipping API and can be overridden with `VITE_API_BASE_URL`. Copy `.env.example` to `.env` for a local override. This value is public configuration; never put credentials in `VITE_*` variables.

J&T Express shipment creation is currently unavailable in the web app. Its credentials must not be configured in frontend environment variables; a future integration needs a server-side endpoint.

## Available scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Type-check and create the production bundle in dist/
npm run preview  # Preview the production bundle locally
npm run lint     # Run ESLint
npm test         # Run Playwright browser regression tests
```

For a fresh test machine, install Playwright's Chromium browser with `npx playwright install chromium`.

## Deployment

Build the application with `npm run build` and publish the generated `dist/` directory to a static host. `vercel.json` and `public/_redirects` provide single-page-app fallbacks for Vercel and Netlify-style hosts, so direct navigation to app routes serves `index.html`.

The frontend requires access to the configured API at runtime. Deploying the static bundle does not deploy the API.
