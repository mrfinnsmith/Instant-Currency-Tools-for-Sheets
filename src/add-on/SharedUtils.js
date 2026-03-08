let latestAvailableDate = null;

function getMongoDBProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return {
    apiKey: scriptProperties.getProperty('MONGO-API-KEY'),
    baseUrl: scriptProperties.getProperty('MONGO-BASE-URL'),
    dbName: scriptProperties.getProperty('MONGO-DB-NAME'),
    subscriptionCollectionName: scriptProperties.getProperty('MONGO-SUBSCRIPTION-COLLECTION-NAME'),
    ratesCollectionName: scriptProperties.getProperty('MONGO-RATES-COLLECTION-NAME'),
    clusterName: scriptProperties.getProperty('MONGO-CLUSTER-NAME'),
    ecbRatesDocumentId: scriptProperties.getProperty('ECB-RATES-DOCUMENT-ID')
  };
}

function storeRateInMongoDB(from, to, rate, date) {
  const standardDate = date.split('T')[0];
  const props = getMongoDBProperties();

  try {
    const filter = { "_id": { "$oid": props.ecbRatesDocumentId } };
    const update = {
      $set: {
        [`rates.${standardDate}.${from}_${to}`]: {
          rate: rate,
          lastUpdated: new Date().toISOString(),
          source: SOURCE
        }
      }
    };

    mongoUpdateOne(filter, update, true); // eslint-disable-line no-undef

  } catch (error) {
    console.error("Failed to update MongoDB:", error.toString());
  }
}

function getLatestDateInRates() {
  const props = getMongoDBProperties();

  try {
    const filter = { "_id": { "$oid": props.ecbRatesDocumentId } };
    const projection = { "rates": 1 };

    const document = mongoFindOne(filter, projection); // eslint-disable-line no-undef

    if (document && document.rates) {
      const dates = Object.keys(document.rates);

      if (dates.length === 0) {
        console.log("No dates found in rates");
        return null;
      }

      dates.sort((a, b) => new Date(b) - new Date(a));

      const latestDate = dates[0];
      console.log("Latest date in rates:", latestDate);
      return latestDate;
    } else {
      console.log("No rates found in MongoDB");
      return null;
    }
  } catch (error) {
    console.error("Failed to query MongoDB:", error.toString());
    return null;
  }
}
