/**
 * Daily tracker for Google Workspace Marketplace installs and reviews
 * 
 * Runs automatically via daily trigger to scrape marketplace data for Instant Currency add-on.
 * Extracts install count, review count, and average rating from the marketplace page HTML.
 * Writes daily snapshots to analytics spreadsheet (stored in same Drive folder as other Instant Currency files).
 * 
 * Requires script properties: MARKETPLACE_ID, ANALYTICS_SPREADSHEET_ID, INSTALLS_REVIEWS_SHEET_ID
 * Skips execution if data for current date already exists to prevent duplicates.
 */

function trackDailyData() {
  const marketplaceId = PropertiesService.getScriptProperties().getProperty('MARKETPLACE_ID');
  const analyticsSpreadsheetId = PropertiesService.getScriptProperties().getProperty('ANALYTICS_SPREADSHEET_ID');

  if (!marketplaceId) {
    console.error('Marketplace analytics. Missing required script propertY: MARKETPLACE_ID.');
    return;
  }

  if (!analyticsSpreadsheetId) {
    console.error('Marketplace analytics. Missing required script properties: ANALYTICS_SPREADSHEET_ID.');
    return;
  }

  try {
    const installData = getInstallData(marketplaceId);
    const reviewData = getReviewData(marketplaceId);

    writeToSpreadsheet(analyticsSpreadsheetId, {
      date: new Date(),
      installs: installData.totalInstalls,
      reviews: reviewData.totalReviews,
      avgRating: reviewData.averageRating
    });

  } catch (error) {
    console.error('Marketplace analytics. Error tracking marketplace data:', error);
  }
}

function getInstallData(marketplaceId) {
  const url = `https://workspace.google.com/marketplace/app/${marketplaceId}`;

  try {
    const response = UrlFetchApp.fetch(url);
    const html = response.getContentText();

    const installMatch = html.match(/aria-label="\d+ users have installed this app\.">(\d+(?:,\d+)*)<\/div>/);
    const totalInstalls = installMatch ? parseInt(installMatch[1].replace(/,/g, '')) : 0;

    return {
      totalInstalls: totalInstalls
    };
  } catch (error) {
    console.error('Marketplace analytics. Error fetching install data:', error);
    return { totalInstalls: 0 };
  }
}

function getReviewData(marketplaceId) {
  const url = `https://workspace.google.com/marketplace/app/${marketplaceId}`;

  try {
    const response = UrlFetchApp.fetch(url);
    const html = response.getContentText();

    const ratingMatch = html.match(/<meta itemprop="ratingValue" content="(\d+(?:\.\d+)?)"/);
    const reviewCountMatch = html.match(/<span itemprop="ratingCount"[^>]*>(\d+(?:,\d+)*)<\/span>/);

    const averageRating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
    const totalReviews = reviewCountMatch ? parseInt(reviewCountMatch[1].replace(/,/g, '')) : 0;

    return {
      totalReviews: totalReviews,
      averageRating: averageRating
    };
  } catch (error) {
    console.error('Marketplace analytics. Error fetching review data:', error);
    return { totalReviews: 0, averageRating: 0 };
  }
}

function writeToSpreadsheet(analyticsSpreadsheetId, data) {
  const installsReviewsSheetId = PropertiesService.getScriptProperties().getProperty('INSTALLS_REVIEWS_SHEET_ID');

  if (!installsReviewsSheetId) {
    console.error('Marketplace analytics. Missing required script property: INSTALLS_REVIEWS_SHEET_ID.');
    return;
  }

  const spreadsheet = SpreadsheetApp.openById(analyticsSpreadsheetId);
  const sheet = spreadsheet.getSheets().find(s => s.getSheetId() == installsReviewsSheetId);

  if (!sheet) {
    console.error('Marketplace analytics. Sheet not found with ID matching INSTALLS_REVIEWS_SHEET_ID.');
    return;
  }

  const lastRow = sheet.getLastRow();
  const today = new Date().toDateString();

  // Check if today's data already exists
  if (lastRow > 0) {
    const dates = sheet.getRange(1, 1, lastRow, 1).getValues();
    for (let i = 0; i < dates.length; i++) {
      if (dates[i][0] && dates[i][0] instanceof Date && dates[i][0].toDateString() === today) {
        console.log('Marketplace analytics. Data for today already exists, skipping.');
        return;
      }
    }
  }

  sheet.getRange(lastRow + 1, 1, 1, 4).setValues([[
    data.date,
    data.installs,
    data.reviews,
    data.avgRating
  ]]);
}