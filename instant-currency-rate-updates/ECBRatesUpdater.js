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
  let lastDailyUpdate = scriptProperties.getProperty('firebaseLastDailyUpdate');
  const todayDate = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd");

  if (lastDailyUpdate === todayDate) {
    console.log('Daily update already completed for today.');
    return;
  }

  let updatedSuccessfully = true;

  const currencies = ['CAD','MXN','USD', 'EUR', 'GBP', 'JPY', 'AUD'];
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

  if (Object.keys(allRateData).length > 0) {
    updateFirebaseDatabase(allRateData);
    if (updatedSuccessfully) scriptProperties.setProperty('firebaseLastDailyUpdate', todayDate);
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

function updateFirebaseDatabase(allRateData) {

  var service = getOAuthService();

  if (service.hasAccess()) {

    const scriptProperties = PropertiesService.getScriptProperties();

    const firebaseDatabaseUrl = scriptProperties.getProperty('firebaseDatabaseUrl') + '/rates/ECB.json';

    const options = {
      method: 'PATCH',  // Use PUT to overwrite the specific date node or PATCH to update parts of it
      contentType: 'application/json',
      payload: JSON.stringify(allRateData),
      headers: {
        Authorization: 'Bearer ' + service.getAccessToken(),
      },
      muteHttpExceptions: true  // To capture detailed response for troubleshooting
    };

    try {
      let response = UrlFetchApp.fetch(firebaseDatabaseUrl, options);
      console.log('Updated Firebase DB. Response Content:', response.getContentText());    
    } catch (error) {
      console.log('Failed to update Firebase:', error.toString());
    }
  } 
  else {
    Logger.log('No access token available. Please re-authorize.');
  }
}