# Money Manager

Money Manager is a local-first web app for tracking income, expenses, monthly budgets and savings goals. It starts with an empty ledger and stores financial records in IndexedDB in the current browser. There are no accounts or cloud services.

## Run locally

Use Node.js 24 or later.

```sh
npm ci
npm run dev
```

Open [the local app](http://localhost:3000). For the production build, run these commands.

```sh
npm run build
npm start
```

The Next.js App Router serves the interface and its assets. Financial calculations, record changes and file processing run in the browser. Use HTTPS if hosting it beyond localhost.

## Data and files

The ledger uses a single currency and stores amounts as integer minor units. On first launch you can choose a currency and add accounts with optional opening balances, or skip to Overview. Manage accounts later in Settings → Accounts. Download a backup before clearing the ledger or switching browser profiles, devices or site addresses.

Settings → Data & backup supports versioned JSON backups and transaction CSV files. Account details and opening balances are included in JSON backups. A backup with accounts uses version 3 and needs a version of the app that supports accounts. JSON merge skips identical records and blocks conflicts. Replacement requires typing `RESTORE`, and clearing requires typing `CLEAR`. Both leave appearance preferences in place. CSV files should use the headings from a Money Manager export, with an optional `id` column. Create the relevant categories first and use the ledger currency.

Backups and exports contain readable financial information. Keep them private. Clearing browser site data can remove the ledger, and clearing through Money Manager leaves downloaded files in place.

## Checks and third-party notices

```sh
npm run typecheck
npm test
npx playwright install chromium
npm run build
npm run test:e2e
```

[LICENSES.md](LICENSES.md) and the app’s `/licenses` reader use the same inventory. Package installation and production builds refresh the records. When changing an asset, record its verified provenance and notice in [the asset manifest](notices/vendor/assets.json). Run `npm run licenses:update` to refresh directly or `npm run licenses:check` to check for stale records. Review the generated changes before committing.

## Before public release

Confirm the operator, contact, hosting and CDN providers, request logs, retention, transfers and user-rights information before publishing the privacy notice. This version uses browser storage for the requested ledger and appearance settings. Reassess storage and consent if any optional processing or external service is introduced. [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/), [ePrivacy amendment](https://eur-lex.europa.eu/eli/dir/2009/136/oj/eng), [Bulgarian Electronic Commerce Act](https://www.mi.government.bg/file/2015/09/zet_bg.pdf)

Check whether Terms, consumer disclosures or a statutory accessibility statement apply to the actual release. The current scope is a personal ledger without payments, banking services or commerce. Review any change to those facts or the audience before publishing. [EU digital content rules](https://eur-lex.europa.eu/eli/dir/2019/770/oj/eng), [Bulgarian accessibility law](https://dv.parliament.bg/DVWeb/showMaterialDV.jsp?idMat=233836)
