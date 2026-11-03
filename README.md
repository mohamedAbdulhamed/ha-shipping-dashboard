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
- Optional J&T Express shipment integration
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

The application API base URL is currently set in `src/services/api/axios.ts` and points to the H&A Shipping API. Change that value there when targeting another API environment.

J&T Express settings are read from Vite environment variables. Add them to a local `.env` file when enabling that integration:

```dotenv
VITE_JT_API_URL=
VITE_JT_API_ACCOUNT=
VITE_JT_PRIVATE_KEY=
VITE_JT_CUSTOMER_CODE=
```

Vite embeds `VITE_*` values in the browser bundle. Do not put private credentials in a client-side variable for a public deployment; use a server-side integration that keeps the credentials private.

## Available scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Type-check and create the production bundle in dist/
npm run preview  # Preview the production bundle locally
npm run lint     # Run ESLint
```

## Deployment

Build the application with `npm run build` and publish the generated `dist/` directory to a static host. The `public/_redirects` file provides a single-page-app fallback for hosts that support Netlify-style redirects; configure an equivalent fallback on other hosts so direct navigation to app routes serves `index.html`.

The frontend requires access to the configured API at runtime. Deploying the static bundle does not deploy the API.
