Google Sheets add-on that transforms currency handling by eliminating manual conversions and formatting. Converts values directly in the sheet with proper currency formatting.

# Project Structure

This repository contains three Google Apps Script projects synced via clasp, a Google Cloud Function, and a Next.js marketing site:

- `src/add-on/`: Main add-on code that runs in Google Sheets
- `src/event-handlers/`: Background processes for subscription tracking and rate updates
- `src/marketplace-analytics/`: Marketplace analytics tracking for install and review metrics
- `src/site/`: Marketing site (Next.js + Tailwind, deployed to Vercel)
- `cloud-function/`: Google Cloud Function proxy for MongoDB access

```
├── README.md
├── cloud-function/           # Google Cloud Function (MongoDB proxy)
│   ├── index.js
│   └── package.json
└── src/
    ├── add-on/
    │   ├── appsscript.json
    │   └── [.js files]
    ├── event-handlers/
    │   ├── appsscript.json
    │   └── [.js files]
    ├── marketplace-analytics/
    │   ├── appsscript.json
    │   └── [.js files]
    └── site/                 # Next.js marketing site
        ├── app/
        │   ├── [locale]/     # i18n: en, es, it, fr, de, ja
        │   └── api/          # checkout, contact
        ├── i18n/             # Locale config, hreflang helpers, translations
        ├── content/blog/     # MDX blog posts (per locale)
        └── public/           # Static assets, llms.txt
```

**Note**: Google Apps Script files (.gs) are stored as .js files when synced locally with clasp. Each project has its own clasp ID and separate Google Apps Script project.

# Features & Implementation

- **One-click currency conversion**: Converts selected cells and applies proper formatting
- **Premium feature**: Historical exchange rates ($5/month subscription)
- **MongoDB integration**: Stores currency exchange rates accessed via Google Cloud Function proxy
- **Stripe integration**: Checkout handled by Vercel API route (`/api/checkout`), subscription status checked directly against Stripe API from the add-on
- **Marketplace analytics tracking**: Daily scraping of install count, reviews, and ratings from Google Workspace Marketplace
- **Multilingual site**: 6 locales (en, es, it, fr, de, ja) with full SEO infrastructure (hreflang, JSON-LD, sitemap)

# Subscription Flow

1. User clicks upgrade button on [pricing page](https://instantcurrency.tools/en/pricing)
2. Vercel API route (`/api/checkout`) creates a Stripe checkout session (subscription mode)
3. Stripe webhook sends events to `src/event-handlers/SubscriptionEventProcessing.js`
4. Event handler logs to a tracking spreadsheet and MongoDB for record-keeping
5. Add-on verifies subscription status at runtime by querying Stripe directly:
   - `isUserSubscribed()` in `src/add-on/SubscriptionManager.js` first checks script cache
   - On cache miss, searches Stripe for the customer by email, then checks for active subscriptions
   - Only caches positive results (never caches `false`)
   - `getUserEmail()` falls back to `ScriptApp.getIdentityToken()` JWT decode for consumer Gmail accounts

# Marketing Site

Next.js app deployed to Vercel. Root directory for Vercel: `src/site`.

**Pages**: Homepage, Pricing, Contact, Blog, Privacy, Terms, 404
**API routes**: `/api/checkout` (Stripe), `/api/contact` (Resend)
**i18n**: 6 locales with translated UI via `i18n/locales/{locale}.json`. Privacy and Terms are English-only content (nav/footer still translate).

# Data Storage & Rate Checking Flow

- **Currency rates**: Stored in MongoDB Atlas
  - Apps Script projects cannot directly access MongoDB (no native driver support)
  - **Architecture**: Apps Script → Google Cloud Function (proxy) → MongoDB Atlas
  - Cloud Function provides HTTP interface with IAM authentication
  - Updated daily via `src/event-handlers/mongoDailyRateUpdates.js` (runs every 15 minutes, updates when new data available)
  - On-demand rate fetching process:
    1. When user selects currency pair and date, first checks script cache
    2. If not in cache, calls Cloud Function to query MongoDB for the rate
    3. If not in MongoDB, calls Frankfurter API
    4. Each successful lookup updates both cache and MongoDB via Cloud Function
    5. All lookups tracked in `src/add-on/CurrencyConvertor.js` via `CurrencyRateService` class
- **Analytics**: Two types of analytics are collected:
  - **Marketplace analytics**: Daily marketplace metrics stored in spreadsheet with duplicate prevention
    - Install count, review count, and average rating tracked via `src/marketplace-analytics/`
  - **User interaction analytics**: Event tracking via Mixpanel using user-based identities
    - `distinct_id` is MD5 hash of user email (format: `user_[hash]`)
    - `spreadsheet_id` property tracks which spreadsheet (format: `sheet_[hash]`)
    - Events tracked include sidebar opens, conversions, and feature usage
    - Only users with available email addresses are tracked (no fallback/fake data)

# Key Script Properties

Each Apps Script project relies on these script properties:

- `add-on` project:
  - `STRIPE_SECRET_KEY`: Live Stripe secret key for direct subscription verification
  - `CLOUD_FUNCTION_URL`: URL of Google Cloud Function for MongoDB access
  - `MONGO-CLUSTER-NAME`, `MONGO-DB-NAME`: MongoDB connection details
  - `MONGO-RATES-COLLECTION-NAME`: Collection storing currency rates
  - `ECB-RATES-DOCUMENT-ID`: MongoDB document ID for rates
  - `MIXPANEL_PROJECT_TOKEN`: Token for Mixpanel analytics tracking
  - `TEST_SPREADSHEET_IDS`: Comma-separated list of test spreadsheet IDs to exclude from analytics

- `event-handlers` project:
  - `LOG_SPREADSHEET_ID`: ID of the spreadsheet tracking subscriptions
  - `LOG_SHEET_ID`: ID of the log sheet within the spreadsheet
  - `SUBSCRIPTION-SHEET-ID`: ID of the sheet tracking active subscriptions
  - `STRIPE_API_KEY`: For Stripe API calls
  - `mongoDbBaseUrl`, `mongoDbApiKey`, `mongoDbClusterName`, `mongoDbDatabaseName`, `mongoDbSubcriptionCollectionName`: MongoDB Data API config

- `marketplace-analytics` project:
  - `MARKETPLACE_ID`: Google Workspace Marketplace listing identifier
  - `ANALYTICS_SPREADSHEET_ID`: Spreadsheet for storing marketplace metrics
  - `INSTALLS_REVIEWS_SHEET_ID`: Sheet ID within analytics spreadsheet

# Development Notes

- Each Apps Script project has its own `.clasp.json` for syncing with Google Apps Script IDE
- **GCP Projects**:
  - Add-on and marketplace-analytics: `instant-currency-tools-sheets` (Project #93228277435)
  - Event-handlers: `teak-perigee-458918-t2` (Project #552432511640)
  - Cloud Function deployed to event-handlers GCP project for IAM simplicity
- **MongoDB Access**:
  - Apps Script → Cloud Function (Node.js with MongoDB native driver) → MongoDB Atlas
  - Cloud Function secured with IAM authentication using `ScriptApp.getIdentityToken()`
  - Connection pooling prevents connection exhaustion in serverless environment
- MongoDB rates are updated in two ways:
  - Every 15 minutes via time trigger (only updates when new data available from Frankfurter)
  - On-demand when users convert currencies with dates not in the database
- Marketplace analytics scraped daily via time-triggered execution
- Currency conversion offers two methods:
  - "Hardcoded": Permanently changes cell values using current rates
  - "Formula": Inserts GOOGLEFINANCE formulas that update automatically
- Update marketplace listing through Google Workspace Marketplace SDK

## Testing Updates

To test changes before deployment:

1. In Google Apps Script IDE, go to **Deploy** → **Test deployments**
2. If no test deployment exists, create one:
   - Click **New test**
   - Select **Editor Add-on** as type
   - Choose a test spreadsheet
3. Select the test deployment radio button
4. Click **Execute** to test in the selected spreadsheet

## Deploying Updates

To deploy a new version to production:

1. In Google Apps Script IDE, go to **Deploy** → **New deployment**
2. Set type to **Add-on**
3. Enter a descriptive version description
4. Click **Deploy** and note the version number

### Update Marketplace Listing

After deploying a new version, update the marketplace listing:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Enabled APIs & Services** → **Google Workspace Marketplace SDK**
3. In the submenu, click **App configuration**
4. Update **"Sheets add-on script version"** to the new deployment version
5. Go to **Store Listing** in the same submenu
6. Click the **Publish** button at the bottom (should be enabled)

# Related Resources

- [Product website](https://instantcurrency.tools)
- [Google Workspace Marketplace listing](https://workspace.google.com/marketplace/app/instant_currency/93228277435)
