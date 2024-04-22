function addDataToMongoDB(dataToInsert) {
  const scriptProperties = PropertiesService.getScriptProperties();
  var apiKey = scriptProperties.getProperty('mongoDbApiKey');
  var baseUrl = scriptProperties.getProperty('mongoDbBaseUrl');
  var dbName = scriptProperties.getProperty('mongoDbDatabaseName'); // Replace with your actual database name
  var collectionName = scriptProperties.getProperty('mongoDbCollectionName'); // Replace with your actual collection name

  var url = baseUrl + '/action/insertOne';
  /*var dataToInsert = {
    'AUD_EUR': {
      '2019-03-12': {
        'rate': 1.2,
        'lastUpdated': new Date().toISOString()
      }
    }
  };*/
  var payload = JSON.stringify({
    dataSource: scriptProperties.getProperty('mongoDbClusterName'), // Replace with your actual cluster name
    database: dbName,
    collection: collectionName,
    document: dataToInsert
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
    Logger.log(response.getContentText()); // Logs the response from the server
  } catch (error) {
    Logger.log('Failed to add data: ' + error.toString());
  }
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

   const currencies = ['CAD', 'MXN', 'USD', 'EUR', 'GBP', 'JPY', 'AUD'];
   let allRateData = {};

   const cache = CacheService.getScriptCache();

   currencies.forEach(baseCurrency => {
      currencies.forEach(targetCurrency => {
         if (baseCurrency !== targetCurrency) {
            const rateData = fetchRate(baseCurrency, targetCurrency);
            if (rateData && !rateData.error) {
               let currencyPairKey = `${baseCurrency}_${targetCurrency}`;
               allRateData[currencyPairKey] = {
                  [rateData.rateDate]: {
                     rate: rateData.rate,
                     lastUpdated: rateData.lastChecked
                  }
               };

               let cacheKey = `${baseCurrency}_${targetCurrency}`;
               cache.put(cacheKey, JSON.stringify(allRateData[currencyPairKey][rateData.rateDate]), 90000); // Cache for 25 hours

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
      return {
         error: error.toString()
      };
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