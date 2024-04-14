function updateECBRates() {
    const timezone = 'Europe/Berlin';
    const currentOffset = getCurrentUtcOffset(timezone);
    if (currentOffset.error) {
      console.error('Error fetching UTC offset:', currentOffset.error);
      return; // Exit if there's an error getting the UTC offset
    }
  
    const cetTime = new Date(new Date().getTime() + parseInt(currentOffset.utcOffset) * 3600 * 1000);
    const targetTime = new Date(cetTime.toISOString().split('T')[0] + 'T16:00:00Z');
  
    if (new Date() < targetTime) {
      console.log('It is not yet 16:00 CET/CEST. Exiting.');
      return; // Exit if it's not yet 16:00 CET/CEST
    }
  
    const ratesData = fetchRatesFromAPI();
    if (!ratesData || ratesData.error) {
      console.error('Failed to fetch rates or received an error from the API:', ratesData.error);
      setRetryTrigger();
      return;
    }
  
    const cache = CacheService.getScriptCache();
    const cachedRates = JSON.parse(cache.get('ecbRates') || '{}');
  
    if (ratesData.date === cachedRates.date && areRatesUnchanged(ratesData.rates, cachedRates.rates)) {
      console.log('Rates have not been updated since last check or no changes detected.');
      setRetryTrigger();
      return;
    }
  
    console.log('New rates detected, updating cache and Firebase.');
    cache.put('ecbRates', JSON.stringify(ratesData), 21600); // Cache for 6 hours
    console.log('Cache updated successfully.');
    updateFirebase(ratesData);
  }
  
  function fetchRatesFromAPI() {
    const url = 'https://api.frankfurter.app/latest?from=EUR';
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());
    if (response.getResponseCode() !== 200) {
      return { error: 'Failed to fetch rates' };
    }
    return data;
  }
  
  function areRatesUnchanged(newRates, cachedRates) {
    return Object.keys(newRates).every(key => newRates[key] === cachedRates[key]);
  }
  
  function updateFirebase(data) {
    const firebaseUrl = `https://your-firebase-project.firebaseio.com/rates.json`;
    const firebaseApiKey = PropertiesService.getScriptProperties().getProperty('FirebaseApiKey');
    const options = {
      method: 'PUT',
      contentType: 'application/json',
      payload: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${firebaseApiKey}`
      }
    };
  
    const response = UrlFetchApp.fetch(firebaseUrl, options);
    if (response.getResponseCode() !== 200) {
      console.error('Failed to update Firebase:', response.getContentText());
    } else {
      console.log('Firebase updated successfully');
    }
  }
  
  function setRetryTrigger() {
    ScriptApp.newTrigger('updateECBRates')
      .timeBased()
      .after(3600000) // Retry in one hour
      .create();
    console.log('Retry trigger set for one hour later.');
  }
  