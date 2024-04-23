function addDataToMongoDB(dataToInsert) {
  const scriptProperties = PropertiesService.getScriptProperties();
  var apiKey = scriptProperties.getProperty('mongoDbApiKey');
  var baseUrl = scriptProperties.getProperty('mongoDbBaseUrl');
  var dbName = scriptProperties.getProperty('mongoDbDatabaseName');
  var collectionName = scriptProperties.getProperty('mongoDbCollectionName');

  // Assuming an API endpoint that supports MongoDB's updateOne with upsert
  var url = baseUrl + '/action/updateOne';

  Object.keys(dataToInsert).forEach(source => {
    Object.keys(dataToInsert[source]).forEach(currencyPairKey => {
      Object.keys(dataToInsert[source][currencyPairKey]).forEach(date => {
        var rateInfo = dataToInsert[source][currencyPairKey][date];

        var payload = JSON.stringify({
          dataSource: scriptProperties.getProperty('mongoDbClusterName'),
          database: dbName,
          collection: collectionName,
          filter: { 
            "source": source, 
            ["currencyPairs." + currencyPairKey + "." + date]: { $exists: true }
          },
          update: {
            $set: {
              ["currencyPairs." + currencyPairKey + "." + date]: rateInfo
            }
          },
          upsert: true
        });

        var options = {
          method: 'post',
          contentType: 'application/json',
          headers: {
            'api-key': apiKey
          },
          payload: payload,
          muteHttpExceptions: true
        };

        try {
          var response = UrlFetchApp.fetch(url, options);
          Logger.log(response.getContentText());
        } catch (error) {
          Logger.log('Failed to add/update data: ' + error.toString());
        }
      });
    });
  });
}

function updateECBRates() {
  const currentOffsetData = getCurrentUtcOffset("Europe/Berlin");
  if (currentOffsetData.error) {
    console.error('Error fetching UTC offset:', currentOffsetData.error);
    return;
  }

  const cetTime = new Date(new Date().getTime() + parseInt(currentOffsetData.utcOffset) * 3600 * 1000);
  const targetTime = new Date(cetTime.toISOString().split('T')[0] + 'T16:45:00Z');

  if (cetTime < targetTime) {
    console.log('It is not yet 16:45 CET/CEST. Exiting.');
    return;
  }

  const scriptProperties = PropertiesService.getScriptProperties();
  let lastDailyUpdate = scriptProperties.getProperty('mongoDbLastDailyUpdate');
  const todayDate = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd");

  if (lastDailyUpdate === todayDate) {
    console.log('Daily update already completed for today.');
    return;
  }

  let updatedSuccessfully = true;
  const source = "ECB"; // Hardcoded source as "ECB"
  const currencies = ['CAD', 'MXN', 'USD', 'EUR', 'GBP', 'JPY', 'AUD'];
  let allRateData = {};

  const cache = CacheService.getScriptCache();

  currencies.forEach(baseCurrency => {
    currencies.forEach(targetCurrency => {
      if (baseCurrency !== targetCurrency) {
        const rateData = fetchRate(baseCurrency, targetCurrency);
        if (rateData && !rateData.error) {
          let currencyPairKey = `${baseCurrency}_${targetCurrency}`;
          if (!allRateData[source]) {
            allRateData[source] = {};
          }
          if (!allRateData[source][currencyPairKey]) {
            allRateData[source][currencyPairKey] = {};
          }
          allRateData[source][currencyPairKey][rateData.rateDate] = {
            rate: rateData.rate,
            lastUpdated: rateData.lastChecked
          };

          let cacheKey = `${baseCurrency}_${targetCurrency}`;
          cache.put(cacheKey, JSON.stringify(allRateData[source][currencyPairKey][rateData.rateDate]), 90000); // Cache for 25 hours

        } else {
          console.error(`Failed to fetch rate from ${baseCurrency} to ${targetCurrency}: ${rateData.error}`);
          updatedSuccessfully = false;
        }
      }
    });
  });

  if (Object.keys(allRateData).length > 0 && updatedSuccessfully) {
    addDataToMongoDB(allRateData);
    scriptProperties.setProperty('mongoDbLastDailyUpdate', todayDate);
  }
}

function fetchRate(baseCurrency, targetCurrency) {
  const url = `https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targetCurrency}`;

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
    }
  } catch (error) {
    return { error: error.toString() };
  }
}

function updateFirebaseDatabase(allRateData) {
  var token = getOAuthService(); // Retrieve the access token directly

  const scriptProperties = PropertiesService.getScriptProperties();
  const firebaseDatabaseUrl = scriptProperties.getProperty('firebaseDatabaseUrl') + '/rates/ECB.json';

  const options = {
    method: 'PATCH',
    contentType: 'application/json',
    payload: JSON.stringify(allRateData),
    headers: {
      'Authorization': 'Bearer ' + token,
    },
    muteHttpExceptions: true // To capture detailed response for troubleshooting
  };

  try {
    let response = UrlFetchApp.fetch(firebaseDatabaseUrl, options);
    console.log('Updated Firebase DB. Response Content:', response.getContentText());
  } catch (error) {
    console.log('Failed to update Firebase:', error.toString());
  }
}
