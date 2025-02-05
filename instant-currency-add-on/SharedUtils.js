function getMongoDBProperties() {
  var scriptProperties = PropertiesService.getScriptProperties();
  return {
      apiKey: scriptProperties.getProperty('MONGO-API-KEY'),
      baseUrl: scriptProperties.getProperty('MONGO-BASE-URL'),
      dbName: scriptProperties.getProperty('MONGO-DB-NAME'),
      collectionName: scriptProperties.getProperty('MONGO-SUBSCRIPTION-COLLECTION-NAME'),
      clusterName: scriptProperties.getProperty('MONGO-CLUSTER-NAME')
  };
}

function storeRateInMongoDB(from, to, rate, date) {
  var props = getMongoDBProperties();
  var updateUrl = props.baseUrl + "/action/updateOne";

  var updatePayload = {
      dataSource: props.clusterName,
      database: props.dbName,
      collection: props.collectionName,
      filter: { "_id": "exchange_rates" },
      update: { $set: { [`rates.${from}_${to}.${date}`]: { rate: rate, lastUpdated: new Date().toISOString() } } },
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
