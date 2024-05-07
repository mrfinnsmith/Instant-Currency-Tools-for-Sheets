const todaysDate = new Date().toISOString().split('T')[0];

function main() {
  /* 
  Script timezone should be set to UTC+0.This means that lastUpdated in MongoDB will also be UTC+0,
  */

  const scriptProperties = PropertiesService.getScriptProperties();
  const mongoDbLastDailyUpdate = scriptProperties.getProperty('MONGO-LAST-DAILY-UPDATE');

  // If we've already udpated everything today, stop.
  if (mongoDbLastDailyUpdate === todaysDate) {
    console.log('MONGO-LAST-DAILY-UPDATE is ' + mongoDbLastDailyUpdate + '. Today (todaysDate) is ' + todaysDate + '. Top exchange rates have already been updated today.');
    return;
  }

  // Call API to get info about current time in CET.
  let CETCurrentTimeInfo = getTimeZoneInfo('Europe/Berlin');
  if (CETCurrentTimeInfo.error) {
    console.error('Error fetching CET current time info:', CETCurrentTimeInfo.error);
    return;
  }

  // Parse the UTC datetime string from API and adjust for the UTC offset
  let CETCurrentTime = new Date(CETCurrentTimeInfo.responseJSON.datetime);
  let offset = CETCurrentTimeInfo.responseJSON.utc_offset;
  let offsetHours = parseInt(offset.substring(1, 3));
  let offsetMinutes = parseInt(offset.substring(4, 6));
  if (offset[0] === '-') {
    offsetHours = -offsetHours;
    offsetMinutes = -offsetMinutes;
  }
  
  // Apply the offset to the current UTC time
  CETCurrentTime.setHours(CETCurrentTime.getUTCHours() + offsetHours);
  CETCurrentTime.setMinutes(CETCurrentTime.getUTCMinutes() + offsetMinutes);

  console.log('Current Time in CET: ' + CETCurrentTime.toISOString());

  // Define target time as today at 16:45 CET
  let targetTime = new Date(CETCurrentTime);  // Use CETCurrentTime to ensure the date matches
  targetTime.setHours(16, 45, 0, 0);  // Set time to 16:45 CET

  // Calculate the difference in milliseconds and convert to minutes
  let timeDifference = CETCurrentTime - targetTime;  // Compare directly
  let timeDifferenceMinutes = Math.floor(timeDifference / 60000);

  // Check if the current time is at or after 16:45 CET
  let isAtOrAfter = timeDifference >= 0;

  if (isAtOrAfter) {
    console.log('It is ' + timeDifferenceMinutes + ' minutes after 4:45 PM in CET. Updating rates.');

    // Should return true or false
    let updatedSuccessfully = updateTopECBCurrencies();

    if (updatedSuccessfully) {
      scriptProperties.setProperty('MONGO-LAST-DAILY-UPDATE', todaysDate);
    }
  } else {
    console.log('It is not yet 4:45 PM in CET');
  }
}

function updateTopECBCurrencies() {
  // Script Properties should be manually updated in the Google Apps Script IDE
  const scriptProperties = PropertiesService.getScriptProperties();
  const baseUrl = scriptProperties.getProperty('mongoDbBaseUrl');
  const apiKey = scriptProperties.getProperty('mongoDbApiKey');
  const clusterName = scriptProperties.getProperty('mongoDbClusterName');
  const dbName = scriptProperties.getProperty('mongoDbDatabaseName');
  const collectionName = scriptProperties.getProperty('mongoDbCollectionName');
  const ecbDocumentId = scriptProperties.getProperty('ecbDocumentId');

  // Default noIssuesUpdating to true, the flip to false if any fail.
  let noIssuesUpdating = true;

  // Most traded currencies plus Canada and Mexico
  const topCurrencies = ['CAD', 'MXN', 'USD', 'EUR', 'GBP', 'JPY', 'AUD'];

  // Specific MongoDB endpoint for updating a record.
  const updateUrl = baseUrl + "/action/updateOne";
  
  // Loop through top currencies and get rates and latest date (may be yesterday) for all pairs.
  const updateOperations = {};
  topCurrencies.forEach(baseCurrency => {
    topCurrencies.forEach(targetCurrency => {
      if (baseCurrency !== targetCurrency) {
        
        let fetchedRateData = fetchRate(baseCurrency, targetCurrency);
        let newDate = fetchedRateData.rateDate;
        let newRate = fetchedRateData.rate;
        let lastUpdated = fetchedRateData.lastChecked;
        
        if (newDate < todaysDate) {
          console.log('newDate for ' + baseCurrency + ' and ' + targetCurrency + ' is ' + newDate + '. todaysDate is ' + todaysDate + ', so the "new" currency information is old. Moving to the next currency pair.');
          noIssuesUpdating = false;
        } else {
          const currencyPairKey = `${baseCurrency}_${targetCurrency}`;
          updateOperations[`rates.${currencyPairKey}.${newDate}`] = { rate: newRate, lastUpdated: lastUpdated };
        }
      }
    });
  });

  const updatePayload = {
    dataSource: clusterName,
    database: dbName,
    collection: collectionName,
    filter: { "_id": { "$oid": ecbDocumentId } },
    update: {
      $set: updateOperations
    },
    upsert: false
  };
  
  const updateOptions = {
    method: "post",
    contentType: "application/json",
    headers: {
      "api-key": apiKey
    },
    payload: JSON.stringify(updatePayload),
    muteHttpExceptions: true
  };

  try {
    const updateResponse = UrlFetchApp.fetch(updateUrl, updateOptions);
    const updateResponseData = JSON.parse(updateResponse.getContentText());
    console.log('Update Response:', updateResponseData);
  } catch (error) {
    console.error('Error updating document:', error.toString());
    noIssuesUpdating = false;
  }
  return noIssuesUpdating;
}

function fetchRate(baseCurrency, targetCurrency) {
  const url = `https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targetCurrency}`;

  try {
    const response = UrlFetchApp.fetch(url);

    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      return {
        // Currently this function returns an object with redundant information. (e.g. It is only used to by a function that updates ECB rates, but it specifies that its source is ECB.) Later, if we add more sources, we may want to return similar data from them, so we need to specify this redundant info.
        fromCurrency: baseCurrency,
        toCurrency: targetCurrency,
        rate: data.rates[targetCurrency],
        rateDate: data.date,
        lastChecked: new Date().toISOString(),
        source: "ECB"
      };
    }
  } catch (error) {
    return { error: error.toString() };
  }
}