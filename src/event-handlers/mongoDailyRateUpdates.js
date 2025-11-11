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
    timeLogMessage += `, ${primaryAPITime.toISOString()} [WorldTimeAPI]`;
  }
  if (fallbackAPITime) {
    timeLogMessage += `, ${fallbackAPITime.toISOString()} [TimeAPI.io]`;
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

  const updateResult = updateTopECBCurrencies(currentFrankfurterDate);

  if (updateResult.allPairsComplete) {
    scriptProperties.setProperty('LATEST-FRANKFURTER-RATE-DATE', currentFrankfurterDate);
    console.log(`Update completed successfully. All ${updateResult.totalPairs} pairs complete. Set latest rate date to ${currentFrankfurterDate}.`);
  } else if (updateResult.pairsAdded > 0) {
    console.log(`Partial update: Added ${updateResult.pairsAdded} pairs. ${updateResult.missingPairs} still missing. Will retry on next run.`);
  } else {
    console.error(`Update failed. No pairs added. Latest rate date not changed.`);
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
    return { allPairsComplete: false, pairsAdded: 0, totalPairs: 0, missingPairs: 0 };
  }

  const startTime = new Date().getTime();
  const MAX_EXECUTION_TIME = 300000; // 5 minutes - leave 1 minute buffer
  const BATCH_TIMEOUT = 120000; // 2 minutes per batch max

  console.log(`Starting incremental update at ${new Date().toISOString()}`);

  // Step 1: Check which pairs already exist in MongoDB
  const existingPairs = getExistingPairsForDate(mongoConfig, rateDate);
  console.log(`Found ${existingPairs.size} existing pairs in MongoDB for date ${rateDate}`);

  // Step 2: Determine which pairs need to be fetched
  const allRequiredPairs = [];
  for (const baseCurrency of TOP_CURRENCIES) {
    for (const targetCurrency of TOP_CURRENCIES) {
      if (baseCurrency === targetCurrency) continue;
      allRequiredPairs.push(`${baseCurrency}_${targetCurrency}`);
    }
  }

  const missingPairs = allRequiredPairs.filter(pair => !existingPairs.has(pair));
  console.log(`Total pairs needed: ${allRequiredPairs.length}, Missing: ${missingPairs.length}`);

  if (missingPairs.length === 0) {
    console.log(`All pairs already exist for ${rateDate}. Nothing to fetch.`);
    return { allPairsComplete: true, pairsAdded: 0, totalPairs: allRequiredPairs.length, missingPairs: 0 };
  }

  // Step 3: Group missing pairs by base currency
  const missingByBase = {};
  for (const pair of missingPairs) {
    const [base] = pair.split('_');
    if (!missingByBase[base]) {
      missingByBase[base] = [];
    }
    missingByBase[base].push(pair);
  }

  console.log(`Need to fetch from ${Object.keys(missingByBase).length} base currencies`);

  // Step 4: Fetch and update in batches (one per base currency)
  let totalPairsAdded = 0;
  let batchNumber = 0;

  for (const baseCurrency in missingByBase) {
    // Check if we're approaching time limit
    const elapsedTime = new Date().getTime() - startTime;
    if (elapsedTime > MAX_EXECUTION_TIME) {
      console.log(`Approaching execution time limit (${elapsedTime}ms elapsed). Stopping to avoid timeout.`);
      break;
    }

    batchNumber++;
    const batchStartTime = new Date().getTime();

    // Get target currencies for this base
    const targetCurrencies = TOP_CURRENCIES.filter(c => c !== baseCurrency);

    console.log(`[Batch ${batchNumber}] Fetching ${baseCurrency} -> [${targetCurrencies.join(', ')}]`);

    // Fetch batch with timeout awareness
    const batchResult = fetchBatchRates(baseCurrency, targetCurrencies, BATCH_TIMEOUT);
    const batchDuration = new Date().getTime() - batchStartTime;

    if (batchResult.error) {
      console.error(`[Batch ${batchNumber}] FAILED after ${batchDuration}ms: ${batchResult.error}`);
      continue;
    }

    console.log(`[Batch ${batchNumber}] SUCCESS in ${batchDuration}ms (${Object.keys(batchResult.rates).length} rates)`);

    // Verify date matches
    if (batchResult.date !== rateDate) {
      console.log(`[Batch ${batchNumber}] Date mismatch: got ${batchResult.date}, expected ${rateDate}. Skipping.`);
      continue;
    }

    // Build update operations for this batch
    const updateOperations = {};
    let pairsInBatch = 0;
    for (const targetCurrency in batchResult.rates) {
      const pairKey = `${baseCurrency}_${targetCurrency}`;

      // Only update if this pair was in our missing list
      if (missingPairs.includes(pairKey)) {
        updateOperations[`rates.${rateDate}.${pairKey}.rate`] = batchResult.rates[targetCurrency];
        updateOperations[`rates.${rateDate}.${pairKey}.lastUpdated`] = new Date().toISOString();
        updateOperations[`rates.${rateDate}.${pairKey}.source`] = 'ECB';
        pairsInBatch++;
      }
    }

    // Update MongoDB immediately with this batch
    if (pairsInBatch > 0) {
      console.log(`[Batch ${batchNumber}] Updating MongoDB with ${pairsInBatch} pairs...`);
      const mongoStartTime = new Date().getTime();
      const mongoResult = updateMongoDocument(mongoConfig, updateOperations);
      const mongoDuration = new Date().getTime() - mongoStartTime;

      if (mongoResult) {
        console.log(`[Batch ${batchNumber}] MongoDB update SUCCESS in ${mongoDuration}ms`);
        totalPairsAdded += pairsInBatch;
      } else {
        console.error(`[Batch ${batchNumber}] MongoDB update FAILED in ${mongoDuration}ms`);
      }
    }
  }

  const totalDuration = new Date().getTime() - startTime;
  console.log(`Incremental update complete in ${totalDuration}ms (${Math.round(totalDuration/1000)}s)`);
  console.log(`Pairs added this run: ${totalPairsAdded}`);

  // Step 5: Verify if all pairs are now complete
  const updatedExistingPairs = getExistingPairsForDate(mongoConfig, rateDate);
  const stillMissing = allRequiredPairs.length - updatedExistingPairs.size;

  console.log(`Current status: ${updatedExistingPairs.size}/${allRequiredPairs.length} pairs exist`);

  return {
    allPairsComplete: stillMissing === 0,
    pairsAdded: totalPairsAdded,
    totalPairs: allRequiredPairs.length,
    missingPairs: stillMissing
  };
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

function getExistingPairsForDate(config, date) {
  const findUrl = `${config.baseUrl}/action/findOne`;

  const findPayload = {
    dataSource: config.clusterName,
    database: config.dbName,
    collection: config.collectionName,
    filter: { "_id": { "$oid": config.ecbDocumentId } },
    projection: { [`rates.${date}`]: 1 }
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: { "api-key": config.apiKey },
    payload: JSON.stringify(findPayload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(findUrl, options);
    const result = JSON.parse(response.getContentText());

    const existingPairs = new Set();

    if (result.document && result.document.rates && result.document.rates[date]) {
      const pairsForDate = result.document.rates[date];
      for (const pairKey in pairsForDate) {
        existingPairs.add(pairKey);
      }
    }

    return existingPairs;
  } catch (error) {
    console.error(`Error fetching existing pairs from MongoDB: ${error}`);
    return new Set(); // Return empty set on error
  }
}

function fetchBatchRates(baseCurrency, targetCurrencies, timeoutMs) {
  const targetsParam = targetCurrencies.join(',');
  const url = `${FRANKFURTER_API}?from=${baseCurrency}&to=${targetsParam}`;

  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      return {
        error: `HTTP ${statusCode}: ${response.getContentText().substring(0, 200)}`
      };
    }

    const data = JSON.parse(response.getContentText());

    return {
      amount: data.amount,
      base: data.base,
      date: data.date,
      rates: data.rates
    };

  } catch (error) {
    return {
      error: `Exception: ${error.toString()}`
    };
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