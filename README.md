Google Sheets add-on that transforms currency handling by eliminating manual conversions and formatting. Converts values directly in the sheet with proper currency formatting.

# Project Structure

This repository contains three separate Google Apps Script projects synced via clasp:

- `src/add-on/`: Main add-on code that runs in Google Sheets
- `src/event-handlers/`: Background processes for subscription tracking and rate updates
- `src/marketplace-analytics/`: Marketplace analytics tracking for install and review metrics
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
    ├── marketplace-analytics/
    │   ├── appsscript.json
    │   └── [.js files]
    └── event-handlers/
        ├── appsscript.json
        └── [.js files]
```

**Note**: Google Apps Script files (.gs) are stored as .js files when synced locally with clasp. Each project has its own clasp ID and separate Google Apps Script project.

# Features & Implementation

- **One-click currency conversion**: Converts selected cells and applies proper formatting
- **Premium feature**: Historical exchange rates ($5 one-time payment)
- **MongoDB integration**: Stores currency exchange rates accessed via Google Cloud Function proxy
- **Stripe integration**: Processes payments via Heroku app
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
- **Subscriptions**: Tracked in spreadsheet with plans to move to MongoDB
  - Premium user emails stored with product ID and status
- **Analytics**: Two types of analytics are collected:
  - **Marketplace analytics**: Daily marketplace metrics stored in spreadsheet with duplicate prevention
    - Install count, review count, and average rating tracked via `src/analytics/MarketplaceTracker.js`
  - **User interaction analytics**: Event tracking via Mixpanel using user-based identities
    - `distinct_id` is MD5 hash of user email (format: `user_[hash]`)
    - `spreadsheet_id` property tracks which spreadsheet (format: `sheet_[hash]`)
    - Events tracked include sidebar opens, conversions, and feature usage
    - Only users with available email addresses are tracked (no fallback/fake data)
    - Sessions represent individual users, not spreadsheets

# Key Script Properties

Each Apps Script project relies on these script properties:

- `add-on` project:
  - `STRIPE-INSTANT-CURRENCY-SHEETS-PRODUCT-ID`: Identifier for the product in Stripe
  - `CLOUD_FUNCTION_URL`: URL of Google Cloud Function for MongoDB access
  - `MONGO-CLUSTER-NAME`, `MONGO-DB-NAME`: MongoDB connection details
  - `MONGO-RATES-COLLECTION-NAME`: Collection storing currency rates
  - `MONGO-SUBSCRIPTION-COLLECTION-NAME`: Collection for subscription data
  - `ECB-RATES-DOCUMENT-ID`: MongoDB document ID for rates
  - `MIXPANEL_PROJECT_TOKEN`: Token for Mixpanel analytics tracking
  - `TEST_SPREADSHEET_IDS`: Comma-separated list of test spreadsheet IDs to exclude from analytics

- `event-handlers` project:
  - `CLOUD_FUNCTION_URL`: URL of Google Cloud Function for MongoDB access
  - `LOG_SPREADSHEET_ID`: ID of the spreadsheet tracking subscriptions
  - `LOG_SHEET_ID`: ID of the log sheet within the spreadsheet
  - `SUBSCRIPTION-SHEET-ID`: ID of the sheet tracking active subscriptions
  - `STRIPE_API_KEY`: For Stripe API calls
  - `HEROKU_APP_URL`: URL of the Heroku app to keep awake
  - `mongoDbClusterName`, `mongoDbDatabaseName`, `mongoDbCollectionName`, `ecbDocumentId`: MongoDB configuration

- `marketplace-analytics` project:
  - `MARKETPLACE_ID`: Google Workspace Marketplace listing identifier
  - `ANALYTICS_SPREADSHEET_ID`: Spreadsheet for storing marketplace metrics
  - `INSTALLS_REVIEWS_SHEET_ID`: Sheet ID within analytics spreadsheet

# Development Notes

- Each Apps Script project has its own `.clasp.json` file for syncing with Google Apps Script IDE
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
- Marketplace analytics scraped daily via time-triggered execution, logging with "Marketplace Tracker" prefix
- Analytics track install count, review count, and average rating since no public API exists
- Heroku app (`https://instant-currency-bc58e484e25e.herokuapp.com`):
  - Pinged every 30 minutes by `src/event-handlers/keepHerokuAwake.js` to prevent cold starts
  - Needs to stay awake to handle Stripe checkout sessions quickly
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

# Future Plans

- Switch to $5/month subscription model after reaching 20 paid users
- Move subscription tracking fully to MongoDB
- Additional premium features in backlog but won't be developed until product-market fit is validated

# Related Resources

- [Instant Currency Heroku repo](https://github.com/mrfinnsmith/instant-currency-heroku) - Stripe checkout handler
- [Product website](https://instantcurrency.tools)