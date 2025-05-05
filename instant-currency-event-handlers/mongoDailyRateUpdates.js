// Constants
const TARGET_TIME_HOURS = 16;
const TARGET_TIME_MINUTES = 45;
const PRIMARY_TIMEZONE_API = 'https://worldtimeapi.org/api/timezone/';
const FALLBACK_TIMEZONE_API = 'https://timeapi.io/api/Time/current/zone?timeZone=';
const FRANKFURTER_API = 'https://api.frankfurter.app/latest';
const TIMEZONE = 'Europe/Berlin';
const TOP_CURRENCIES = ['CAD', 'MXN', 'USD', 'EUR', 'GBP', 'JPY', 'AUD'];

// Get today's date in ISO format (YYYY-MM-DD)
const todaysDate = new Date().toISOString().split('T')[0];

function main() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const mongoDbLastDailyUpdate = scriptProperties.getProperty('MONGO-LAST-DAILY-UPDATE');

  // Skip if already updated today
  if (mongoDbLastDailyUpdate === todaysDate) {
    console.log(`Already updated top currency pairs in MongoDB today (${todaysDate}). Exiting.`);
    return;
  }

  // Get current CET time (try primary API, fall back if needed)
  let CETCurrentTimeInfo = getTimeZoneInfo(TIMEZONE);

  if (CETCurrentTimeInfo.error) {
    console.log(`WorldTimeAPI.org (primary) failed. Trying TimeAPI.io fallback.`);
    CETCurrentTimeInfo = getTimeZoneInfoFallback(TIMEZONE);

    if (CETCurrentTimeInfo.error) {
      console.error(`Both timezone APIs (WorldTimeAPI.org and TimeAPI.io) failed. Exiting.`);
      return;
    }
  }

  // Process time based on which API we used
  let CETCurrentTime;

  if (CETCurrentTimeInfo.source === 'primary') {
    // Parse from primary API format
    CETCurrentTime = parseTimeFromPrimaryAPI(CETCurrentTimeInfo.responseJSON);
  } else {
    // Parse from fallback API format
    CETCurrentTime = new Date(CETCurrentTimeInfo.responseJSON.dateTime);
  }

  console.log(`Current Time (CET): ${CETCurrentTime.toISOString()}`);

  // Set target time to 16:45 CET today
  let targetTime = new Date(CETCurrentTime);
  targetTime.setHours(TARGET_TIME_HOURS, TARGET_TIME_MINUTES, 0, 0);

  // Check if current time is at or after target time
  const isAfterTargetTime = CETCurrentTime >= targetTime;
  console.log(`Target time: ${targetTime.toISOString()}, Is after target: ${isAfterTargetTime}`);

  if (isAfterTargetTime) {
    const timeDifferenceMinutes = Math.floor((CETCurrentTime - targetTime) / 60000);
    console.log(`${timeDifferenceMinutes} minutes after target time. Updating rates.`);

    const updatedSuccessfully = updateTopECBCurrencies();

    if (updatedSuccessfully) {
      scriptProperties.setProperty('MONGO-LAST-DAILY-UPDATE', todaysDate);
      console.log(`Update completed successfully. Set last update date to ${todaysDate}.`);
    } else {
      console.error(`Update failed. Last update date not changed.`);
    }
  } else {
    console.log(`Not yet ${TARGET_TIME_HOURS}:${TARGET_TIME_MINUTES} CET. Skipping update.`);
  }
}

function parseTimeFromPrimaryAPI(responseJSON) {
  const dateTime = new Date(responseJSON.datetime);
  const offset = responseJSON.utc_offset;
  const offsetHours = parseInt(offset.substring(1, 3));
  const offsetMinutes = parseInt(offset.substring(4, 6));
  const sign = offset[0] === '-' ? -1 : 1;

  // Apply offset to get local time
  const localTime = new Date(dateTime);
  localTime.setHours(localTime.getUTCHours() + (sign * offsetHours));
  localTime.setMinutes(localTime.getUTCMinutes() + (sign * offsetMinutes));

  return localTime;
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

function updateTopECBCurrencies() {
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
  let rateDate = null;

  // Loop through currency pairs
  for (const baseCurrency of TOP_CURRENCIES) {
    for (const targetCurrency of TOP_CURRENCIES) {
      if (baseCurrency === targetCurrency) continue;

      const fetchedRateData = fetchRate(baseCurrency, targetCurrency);

      // Skip if we got an error or old date
      if (fetchedRateData.error) {
        console.error(`Error fetching rate from Frankfurter API for ${baseCurrency}_${targetCurrency}: ${fetchedRateData.error}`);
        continue;
      }

      if (fetchedRateData.rateDate < todaysDate) {
        console.log(`${baseCurrency}_${targetCurrency}: Rate date ${fetchedRateData.rateDate} is older than today. Skipping.`);
        continue;
      }

      // Store the rate date for later use - all rates should have the same date
      rateDate = fetchedRateData.rateDate;

      const currencyPairKey = `${baseCurrency}_${targetCurrency}`;
      updateOperations[`rates.${rateDate}.${currencyPairKey}.rate`] = fetchedRateData.rate;
      updateOperations[`rates.${rateDate}.${currencyPairKey}.lastUpdated`] = fetchedRateData.lastChecked;
    }
  }

  // If we have rates, update the MongoDB document
  if (rateDate && Object.keys(updateOperations).length > 0) {
    console.log(`Updating MongoDB with ${Object.keys(updateOperations).length} currency pairs for date ${rateDate}`);
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