function updateECBRates() {
    const currentOffsetData = getCurrentUtcOffset("Europe/Berlin");
    if (currentOffsetData.error) {
      console.error('Error fetching UTC offset:', currentOffsetData.error);
      return;
    }
  
    const cetTime = new Date(new Date().getTime() + parseInt(currentOffsetData.utcOffset) * 3600 * 1000);
    const targetTime = new Date(cetTime.toISOString().split('T')[0] + 'T16:45:00Z');
  
    if (new Date() < targetTime) {
      console.log('It is not yet 16:45 CET/CEST. Exiting.');
      return;
    }
  
    const currencies = fetchAllCurrencies();
    currencies.forEach(baseCurrency => {
      currencies.forEach(targetCurrency => {
        if (baseCurrency !== targetCurrency) {
          const rateData = fetchRate(baseCurrency, targetCurrency);
          if (rateData && !rateData.error) {
            updateCacheAndFirestore(baseCurrency, targetCurrency, rateData);
          } else {
            console.error(`Failed to fetch rate from ${baseCurrency} to ${targetCurrency}: ${rateData.error}`);
          }
        }
      });
    });
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
    } catch (error) {
      return { error: error.toString() };
    }
  }
  
  function updateCacheAndFirestore(baseCurrency, targetCurrency, data) {
    const cacheKey = `${baseCurrency}_${targetCurrency}`;
    const cache = CacheService.getScriptCache();
    cache.put(cacheKey, JSON.stringify(data), 90000); // Cache for 25 hours
  
    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${PropertiesService.getScriptProperties().getProperty('firebaseProjectId')}/databases/(default)/documents/rates/${baseCurrency}_${targetCurrency}`;
    const firebaseOptions = {
      method: 'PATCH',
      contentType: 'application/json',
      payload: JSON.stringify({
        fields: {
          fromCurrency: { stringValue: data.fromCurrency },
          toCurrency: { stringValue: data.toCurrency },
          rate: { doubleValue: data.rate },
          rateDate: { stringValue: data.rateDate },
          lastChecked: { stringValue: data.lastChecked },
          source: { stringValue: data.source }
        }
      }),
      headers: {
        'Authorization': 'Bearer ' + PropertiesService.getScriptProperties().getProperty('firebaseToken')
      }
    };
  
    try {
      const firebaseResponse = UrlFetchApp.fetch(firebaseUrl, firebaseOptions);
      if (firebaseResponse.getResponseCode() !== 200) {
        console.error(`Failed to update Firestore for ${baseCurrency} to ${targetCurrency}: ${firebaseResponse.getContentText()}`);
      }
    } catch (error) {
      console.error(`Error updating Firestore for ${baseCurrency} to ${targetCurrency}:`, error.toString());
    }
  }
  