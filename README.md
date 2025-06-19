Google Sheets add-on that transforms currency handling by eliminating manual conversions and formatting. Converts values directly in the sheet with proper currency formatting.

# Project Structure

This repository contains three separate Google Apps Script projects synced via clasp:

- `src/add-on/`: Main add-on code that runs in Google Sheets
- `src/event-handlers/`: Background processes for subscription tracking and rate updates
- `src/analytics/`: Marketplace analytics tracking for install and review metrics

```
├── README.md
├── docs
│   └── PHASE_1_MARKETING_PLAN.md
└── src
    ├── add-on
    │   ├── appsscript.json
    │   └── [.js files]
    ├── analytics
    │   ├── appsscript.json
    │   └── [.js files]
    └── event-handlers
        ├── appsscript.json
        └── [.js files]
```

**Note**: Google Apps Script files (.gs) are stored as .js files when synced locally with clasp. Each project has its own clasp ID and separate Google Apps Script project.

# Features & Implementation

- **One-click currency conversion**: Converts selected cells and applies proper formatting
- **Premium feature**: Historical exchange rates ($5 one-time payment)
- **MongoDB integration**: Stores currency exchange rates
- **Stripe integration**: Processes payments
- **Marketplace analytics tracking**: Daily scraping of install count, reviews, and ratings from Google Workspace Marketplace

# Subscription Flow

1. User clicks upgrade button on [pricing page](https://instantcurrency.tools/pricing)
2. Request goes to [Heroku app](https://github.com/mrfinnsmith/instant-currency-heroku) for Stripe checkout
3. Stripe webhook sends event to `src/event-handlers/SubscriptionEventProcessing.js`
4. User's email and subscription status stored in tracking spreadsheet (spreadsheet ID and sheet ID stored in script properties)
5. Add-on verifies subscription status when user opens sidebar via:
   - First checks script cache for cached status
   - If not cached, checks subscription spreadsheet for user's email
   - Sets "active" status in cache if found
   - Function `isUserSubscribed()` in `src/add-on/SubscriptionManager.js` returns boolean result

# Data Storage & Rate Checking Flow

- **Currency rates**: Stored in MongoDB
  - Updated daily via `src/event-handlers/mongoDailyRateUpdates.js`
  - On-demand rate fetching process:
    1. When user selects currency pair and date, first checks script cache
    2. If not in cache, checks MongoDB for the rate
    3. If not in MongoDB, calls Frankfurter API
    4. Each successful lookup updates both cache and MongoDB
    5. All lookups tracked in `src/add-on/CurrencyConvertor.js` via `CurrencyRateService` class
- **Subscriptions**: Tracked in spreadsheet with plans to move to MongoDB
  - Premium user emails stored with product ID and status
- **Analytics**: Daily marketplace metrics stored in spreadsheet with duplicate prevention
  - Install count, review count, and average rating tracked via `src/analytics/MarketplaceTracker.js`

# Key Script Properties

Each Apps Script project relies on these script properties:

- `add-on` project:
  - `STRIPE-INSTANT-CURRENCY-SHEETS-PRODUCT-ID`: Identifier for the product in Stripe
  - `MONGO-API-KEY`, `MONGO-BASE-URL`, `MONGO-DB-NAME`: MongoDB connection details
  - `MONGO-RATES-COLLECTION-NAME`: Collection storing currency rates
  - `MONGO-SUBSCRIPTION-COLLECTION-NAME`: Collection for subscription data
  - `ECB-RATES-DOCUMENT-ID`: MongoDB document ID for rates

- `event-handlers` project:
  - `LOG_SPREADSHEET_ID`: ID of the spreadsheet tracking subscriptions
  - `LOG_SHEET_ID`: ID of the log sheet within the spreadsheet
  - `SUBSCRIPTION-SHEET-ID`: ID of the sheet tracking active subscriptions
  - `STRIPE_API_KEY`: For Stripe API calls
  - `HEROKU_APP_URL`: URL of the Heroku app to keep awake
  - Various MongoDB connection properties

- `analytics` project:
  - `MARKETPLACE_ID`: Google Workspace Marketplace listing identifier
  - `ANALYTICS_SPREADSHEET_ID`: Spreadsheet for storing marketplace metrics
  - `INSTALLS_REVIEWS_SHEET_ID`: Sheet ID within analytics spreadsheet

# Development Notes

- Each project has its own `.clasp.json` file for syncing with Google Apps Script
- GCP project name: "Instant Currency Sheets"
  - Project ID is stored in the Google Apps Script IDE settings
- MongoDB rates are updated in two ways:
  - Daily at ~16:45 CET via time-triggered execution of `src/event-handlers/mongoDailyRateUpdates.js`
  - On-demand when users convert currencies with dates not in the database
- Marketplace analytics scraped daily via time-triggered execution, logging with "Marketplace Tracker" prefix
- Analytics track install count, review count, and average rating since no public API exists
- Heroku app (`https://instant-currency-bc58e484e25e.herokuapp.com`):
  - Pinged every 30 minutes by `src/event-handlers/keepHerokuAwake.js` to prevent cold starts
  - Needs to stay awake to handle Stripe checkout sessions quickly
- Currency conversion offers two methods:
  - "Hardcoded": Permanently changes cell values using current rates
  - "Formula": Inserts GOOGLEFINANCE formulas that update automatically
- Update marketplace listing through Google Workspace Marketplace SDK

# Future Plans

- Switch to $5/month subscription model after reaching 20 paid users
- Move subscription tracking fully to MongoDB
- Additional premium features in backlog but won't be developed until product-market fit is validated

# Related Resources

- [Instant Currency Heroku repo](https://github.com/mrfinnsmith/instant-currency-heroku) - Stripe checkout handler
- [Product website](https://instantcurrency.tools)