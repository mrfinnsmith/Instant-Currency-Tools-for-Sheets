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
