// Constants
const TARGET_TIME_HOURS = 16;
const TARGET_TIME_MINUTES = 45;
const PRIMARY_TIMEZONE_API = 'https://worldtimeapi.org/api/timezone/';
const FALLBACK_TIMEZONE_API = 'https://timeapi.io/api/Time/current/zone?timeZone=';
const FRANKFURTER_API = 'https://api.frankfurter.app/latest';
const TIMEZONE = 'Europe/Berlin';
const TOP_CURRENCIES = ['CAD', 'MXN', 'USD', 'EUR', 'GBP', 'JPY', 'AUD'];

function main() {
  const scriptProperties = PropertiesService.getScriptProperties();

  // Get Berlin time using JS (reliable method)
  const berlinTimeJS = getBerlinTimeJS();

  // Get Berlin time from APIs for logging purposes
  let primaryAPITime = null;
  let fallbackAPITime = null;
  let apiSource = "none";

  // Try primary time API
  const primaryTimeInfo = getTimeZoneInfo(TIMEZONE);
  if (!primaryTimeInfo.error) {
    primaryAPITime = new Date(primaryTimeInfo.responseJSON.datetime);
    apiSource = "primary";
  } else {
    // Try fallback time API
    const fallbackTimeInfo = getTimeZoneInfoFallback(TIMEZONE);
    if (!fallbackTimeInfo.error) {
      fallbackAPITime = new Date(fallbackTimeInfo.responseJSON.dateTime);
      apiSource = "fallback";
    }
  }

  // Create log message with all available time info
  let timeLogMessage = `Current time (Berlin): ${berlinTimeJS.toISOString()} [JS]`;
  if (primaryAPITime) {
    timeLogMessage += `, ${primaryAPITime.toISOString()} [Primary API]`;
  }
  if (fallbackAPITime) {
    timeLogMessage += `, ${fallbackAPITime.toISOString()} [Fallback API]`;
  }
  console.log(timeLogMessage);

  // Check if Frankfurter has new data by fetching a sample rate
  const sampleRate = fetchRate(TOP_CURRENCIES[0], TOP_CURRENCIES[1]);

  // Exit if error fetching rate
  if (sampleRate.error) {
    console.error(`Error checking Frankfurter API: ${sampleRate.error}`);
    return;
  }

  // Get the latest rate date we've processed
  const latestProcessedRateDate = scriptProperties.getProperty('LATEST-FRANKFURTER-RATE-DATE');
  const currentFrankfurterDate = sampleRate.rateDate;

  console.log(`Latest processed rate date: ${latestProcessedRateDate || 'None'}`);
  console.log(`Current Frankfurter rate date: ${currentFrankfurterDate}`);

  // Skip if no new data from Frankfurter
  if (latestProcessedRateDate === currentFrankfurterDate) {
    console.log(`No new rates available from Frankfurter. Latest rate date is still ${currentFrankfurterDate}. Exiting.`);
    return;
  }

  // We have new data, so update rates
  console.log(`New rate data available: ${currentFrankfurterDate}. Updating MongoDB...`);

  const updatedSuccessfully = updateTopECBCurrencies(currentFrankfurterDate);

  if (updatedSuccessfully) {
    scriptProperties.setProperty('LATEST-FRANKFURTER-RATE-DATE', currentFrankfurterDate);
    console.log(`Update completed successfully. Set latest rate date to ${currentFrankfurterDate}.`);
  } else {
    console.error(`Update failed. Latest rate date not changed.`);
  }
}

function getBerlinTimeJS() {
  // Get current time in Berlin using JS built-in capabilities
  const options = { timeZone: TIMEZONE };
  const berlinTimeStr = new Date().toLocaleString('en-US', options);
  return new Date(berlinTimeStr);
}

function getTimeZoneInfo(timezone) {
  const apiUrl = `${PRIMARY_TIMEZONE_API}${timezone}`;
  try {
    const response = UrlFetchApp.fetch(apiUrl, { method: 'GET' });
    const responseJSON = JSON.parse(response.getContentText());
    return { responseJSON, source: 'primary' };
  } catch (error) {
    return {
      responseJSON: null,
      error: `Primary API error: ${error}`,
      source: 'primary'
    };
  }
}

function getTimeZoneInfoFallback(timezone) {
  const apiUrl = `${FALLBACK_TIMEZONE_API}${timezone}`;
  try {
    const response = UrlFetchApp.fetch(apiUrl, {
      method: 'GET',
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      throw new Error(`HTTP status ${response.getResponseCode()}`);
    }

    const responseJSON = JSON.parse(response.getContentText());
    return { responseJSON, source: 'fallback' };
  } catch (error) {
    return {
      responseJSON: null,
      error: `Fallback API error: ${error}`,
      source: 'fallback'
    };
  }
}

function updateTopECBCurrencies(rateDate) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const mongoConfig = {
    baseUrl: scriptProperties.getProperty('mongoDbBaseUrl'),
    apiKey: scriptProperties.getProperty('mongoDbApiKey'),
    clusterName: scriptProperties.getProperty('mongoDbClusterName'),
    dbName: scriptProperties.getProperty('mongoDbDatabaseName'),
    collectionName: scriptProperties.getProperty('mongoDbCollectionName'),
    ecbDocumentId: scriptProperties.getProperty('ecbDocumentId')
  };

  // Validate required MongoDB configuration
  if (!validateMongoConfig(mongoConfig)) {
    return false;
  }

  // New structure: rates > date > currency_pair > { rate, lastUpdated }
  const updateOperations = {};
  let updatedPairsCount = 0;

  // Loop through currency pairs
  for (const baseCurrency of TOP_CURRENCIES) {
    for (const targetCurrency of TOP_CURRENCIES) {
      if (baseCurrency === targetCurrency) continue;

      const fetchedRateData = fetchRate(baseCurrency, targetCurrency);

      // Skip if we got an error or date doesn't match
      if (fetchedRateData.error) {
        console.error(`Error fetching rate from Frankfurter API for ${baseCurrency}_${targetCurrency}: ${fetchedRateData.error}`);
        continue;
      }

      if (fetchedRateData.rateDate !== rateDate) {
        console.log(`${baseCurrency}_${targetCurrency}: Rate date ${fetchedRateData.rateDate} doesn't match expected ${rateDate}. Skipping.`);
        continue;
      }

      const currencyPairKey = `${baseCurrency}_${targetCurrency}`;
      updateOperations[`rates.${rateDate}.${currencyPairKey}.rate`] = fetchedRateData.rate;
      updateOperations[`rates.${rateDate}.${currencyPairKey}.lastUpdated`] = fetchedRateData.lastChecked;
      updatedPairsCount++;
    }
  }

  // If we have rates, update the MongoDB document
  if (updatedPairsCount > 0) {
    console.log(`Updating MongoDB with ${updatedPairsCount} currency pairs for date ${rateDate}`);
    return updateMongoDocument(mongoConfig, updateOperations);
  } else {
    console.log(`No valid rates found to update.`);
    return false;
  }
}

function validateMongoConfig(config) {
  const requiredProps = ['baseUrl', 'apiKey', 'clusterName', 'dbName', 'collectionName', 'ecbDocumentId'];
  const missingProps = requiredProps.filter(prop => !config[prop]);

  if (missingProps.length > 0) {
    console.error(`Missing required MongoDB configuration: ${missingProps.join(', ')}`);
    return false;
  }

  return true;
}

function updateMongoDocument(config, updateOperations) {
  const updateUrl = `${config.baseUrl}/action/updateOne`;

  const updatePayload = {
    dataSource: config.clusterName,
    database: config.dbName,
    collection: config.collectionName,
    filter: { "_id": { "$oid": config.ecbDocumentId } },
    update: {
      $set: updateOperations
    },
    upsert: false
  };

  const options = {
    method: "post",
    payload: JSON.stringify(updatePayload),
    contentType: "application/json",
    muteHttpExceptions: true,
    headers: {}
  };

  if (config.apiKey && config.apiKey.trim() !== "") {
    options.headers["api-key"] = config.apiKey.trim();
  }

  try {
    const updateResponse = UrlFetchApp.fetch(updateUrl, options);
    const statusCode = updateResponse.getResponseCode();

    if (statusCode >= 200 && statusCode < 300) {
      console.log(`MongoDB update successful with status code: ${statusCode}`);
      return true;
    } else {
      console.error(`MongoDB update failed with status code: ${statusCode}`);
      console.error(`Response content: ${updateResponse.getContentText()}`);
      return false;
    }
  } catch (error) {
    console.error(`MongoDB update error: ${error}`);
    return false;
  }
}

function fetchRate(baseCurrency, targetCurrency) {
  const url = `${FRANKFURTER_API}?from=${baseCurrency}&to=${targetCurrency}`;

  try {
    const response = UrlFetchApp.fetch(url);

    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      return {
        fromCurrency: baseCurrency,
        toCurrency: targetCurrency,
        rate: data.rates[targetCurrency],
        rateDate: data.date,
        lastChecked: new Date().toISOString(),
        source: "ECB"
      };
    } else {
      return {
        error: `HTTP status ${response.getResponseCode()}`
      };
    }
  } catch (error) {
    return {
      error: `Error fetching rate: ${error}`
    };
  }
}