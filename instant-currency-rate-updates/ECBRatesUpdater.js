function updateECBRates() {
  const currentOffsetData = getCurrentUtcOffset("Europe/Berlin");
  
  if (currentOffsetData.error) {
    console.error('Error fetching UTC offset:', currentOffsetData.error);
    return;
  }

  const cetTime = new Date(new Date().getTime() + parseInt(currentOffsetData.utcOffset) * 3600 * 1000);
  const targetTime = new Date(cetTime.toISOString().split('T')[0] + 'T4:45:00Z');

  if (cetTime < targetTime) {
    console.log('It is not yet 16:45 CET/CEST. Exiting.');
    return;
  }

// Script property to keep track of whether we've already updated done our daily update of currencies. If we have, exit.

  const scriptProperties = PropertiesService.getScriptProperties();
  let lastDailyUpdate = scriptProperties.getProperty('firebaseLastDailyUpdate');

  const todayDate = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd");

  if (lastDailyUpdate == todayDate) {
    console.log('Checking at ' + new Date() + ', but according to firebaseLastDailyUpdate, we have already completed our daily currency rate update.');
    return;
  }

// Originally got all currencies from Frankfurter app, now getting top 5 currencies.
// const currencies = fetchAllCurrencies();
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD'];

  let updatedSuccessfully = true;

  currencies.forEach(baseCurrency => {
    currencies.forEach(targetCurrency => {
      if (baseCurrency !== targetCurrency) {
        const rateData = fetchRate(baseCurrency, targetCurrency);
        if (rateData && !rateData.error) {
          updateCacheAndFirestore(baseCurrency, targetCurrency, rateData);
        } else {
          updatedSuccessfully = false;
          console.error(`Failed to fetch rate from ${baseCurrency} to ${targetCurrency}: ${rateData.error}`);
        }
      }
    });
  });

  if (updatedSuccessfully) {
    scriptProperties.setProperty('lastDailyUpdate', todayDate);
  }
}

function fetchAllCurrencies() {
  const url = 'https://api.frankfurter.app/currencies';
  
  try {
    const response = UrlFetchApp.fetch(url);
    if (response.getResponseCode() === 200) {
      return Object.keys(JSON.parse(response.getContentText()));
    } else {
      console.error('Error fetching currencies:', response.getContentText());
    }
  } catch (error) {
    console.error('Error fetching currency list:', error.toString());
  }
  return [];
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
  } 
  catch (error) {
    return { error: error.toString() };
  }
}

function updateCacheAndFirestore(baseCurrency, targetCurrency, data) {

  var service = getOAuthService();

  if (service.hasAccess()) {

    const cacheKey = `${baseCurrency}_${targetCurrency}`;
    const cache = CacheService.getScriptCache();
    cache.put(cacheKey, JSON.stringify(data), 90000); // Cache for 25 hours

    const scriptProperties = PropertiesService.getScriptProperties();

    const firebaseDatabaseUrl = scriptProperties.getProperty('firebaseDatabaseUrl') + '/rates/ECB.json';

    let payloadData = {};
    let currencyPairKey = data.fromCurrency + '_' + data.toCurrency;
    
    payloadData[currencyPairKey] = {
      [data.rateDate]: {
        rate: data.rate,
        lastUpdated: data.lastChecked
      }
    };

    const options = {
      method: 'PATCH',  // Use PUT to overwrite the specific date node or PATCH to update parts of it
      contentType: 'application/json',
      payload: JSON.stringify(payloadData),  // Ensuring the payload is correctly formatted as JSON
      headers: {
        Authorization: 'Bearer ' + service.getAccessToken(),
      },
      muteHttpExceptions: true  // To capture detailed response for troubleshooting
    };

    try {
      let response = UrlFetchApp.fetch('https://instant-currency-tools-sheets-default-rtdb.firebaseio.com/rates/ECB.json', options);
      console.log('Updated Firebase DB. Response Content:', response.getContentText());    
    } catch (error) {
      console.log('Failed to update Firebase:', error.toString());
    }
  } 
  else {
    Logger.log('No access token available. Please re-authorize.');
  }
}