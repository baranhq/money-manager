<p align="center">
  <img src="src/logo/Baran%27s%20_Money_Manager.svg" alt="Baran’s Money Manager" width="360">
</p>

<h1 align="center">Baran’s Money Manager</h1>

<p align="center">Track income, expenses, budgets and savings in your browser, without an account or bank connection.</p>

## Features

- Record income and expenses, organised by categories and accounts.
- Review monthly cash flow, activity, budgets and reports.
- Set money aside in savings pots with optional targets. Deposits reduce “Available to spend”; withdrawals add the money back.
- Keep separate local profiles and choose currency, date and number formats.
- Import and export CSV files, create JSON backups, and optionally password-protect exports.
- Set a local app password and optionally encrypt records stored by the browser.

## Privacy and data

Financial records are stored in IndexedDB in the current browser profile. Money Manager has no online account or bank connection. It does not sync data between devices, and it does not send financial records, imported files or the app password to an app server. Clearing the browser’s site data can remove local records, so make a backup before changing browsers or devices or clearing storage.

The website’s hosting and delivery providers may process technical request information. The shared privacy policy is maintained on the landing website in [English](https://moneymanager.baranhq.com/privacy), [Bulgarian](https://moneymanager.baranhq.com/bg/privacy) and [Turkish](https://moneymanager.baranhq.com/tr/privacy). Use HTTPS for network deployments before relying on the app password. Encrypted browser records cannot be recovered without that password; keep downloaded backups and exports private.

## Run locally

Requires Node.js 24 or later and npm.

```sh
git clone https://github.com/baranhq/money-manager.git
cd money-manager
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To run a production build locally:

```sh
npm run build
npm start
```

## Technology

Next.js, React, TypeScript, Tailwind CSS and the browser’s IndexedDB API.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Every contributor must accept the [Contributor Licence Agreement](CLA.md) before their pull request is merged.

## Development checks

```sh
npm run typecheck
npm test
npm run build
```

For browser end-to-end checks, build the app first, install Chromium once, then run the Playwright suite:

```sh
npx playwright install chromium
npm run test:e2e
```

## Licence

Money Manager’s project code is licensed under the GNU Affero General Public License v3.0 only (AGPL-3.0-only); see [`LICENSE`](LICENSE). The maintainer may separately license project material for which they have the necessary rights. Third-party packages and assets retain their own licences; see [`LICENSES.md`](LICENSES.md) and `/licenses`. When adding a bundled app asset, record its verified source in [`notices/vendor/assets.json`](notices/vendor/assets.json) and run `npm run licenses:update`; the build checks the generated notices.
