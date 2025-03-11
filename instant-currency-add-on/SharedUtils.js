var latestAvailableDate = null;

function getMongoDBProperties() {
  var scriptProperties = PropertiesService.getScriptProperties();
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
  var props = getMongoDBProperties();
  var updateUrl = props.baseUrl + "/action/updateOne";

  var updatePayload = {
    dataSource: props.clusterName,
    database: props.dbName,
    collection: props.ratesCollectionName,
    filter: { "_id": { "$oid": props.ecbRatesDocumentId } },
    update: {
      $set: {
        [`rates.${date}.${from}_${to}`]: {
          rate: rate,
          lastUpdated: new Date().toISOString(),
          source: SOURCE
        }
      }
    },
    upsert: true
  };

  var options = {
    method: "post",
    contentType: "application/json",
    headers: { "api-key": props.apiKey },
    payload: JSON.stringify(updatePayload),
    muteHttpExceptions: true
  };

  try {
    UrlFetchApp.fetch(updateUrl, options);
  } catch (error) {
    console.error("Failed to update MongoDB:", error.toString());
  }
}

function getLatestDateInRates() {
  var props = getMongoDBProperties();
  var findUrl = props.baseUrl + "/action/find";

  var findPayload = {
    dataSource: props.clusterName,
    database: props.dbName,
    collection: props.ratesCollectionName
  };

  var options = {
    method: "post",
    contentType: "application/json",
    headers: { "api-key": props.apiKey },
    payload: JSON.stringify(findPayload)
  };

  try {
    var response = UrlFetchApp.fetch(findUrl, options);
    var result = JSON.parse(response.getContentText());
    var document = result.documents[0];

    if (document && document.rates) {
      var dates = Object.keys(document.rates);

      if (dates.length === 0) {
        console.log("No dates found in rates");
        return null;
      }

      dates.sort(function (a, b) {
        return new Date(b) - new Date(a);
      });

      var latestDate = dates[0];
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
