function updateMongoDBSubscription(extractedData) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const baseUrl = scriptProperties.getProperty('mongoDbBaseUrl');
  const apiKey = scriptProperties.getProperty('mongoDbApiKey');
  const clusterName = scriptProperties.getProperty('mongoDbClusterName');
  const dbName = scriptProperties.getProperty('mongoDbDatabaseName');
  const collectionName = scriptProperties.getProperty('mongoDbSubcriptionCollectionName');
  const updateUrl = baseUrl + "/action/updateOne";
console.log("Extracted Data for MongoDB:", JSON.stringify(extractedData));

  // Iterate over each product in the extracted data
  extractedData.products.forEach(product => {
    let updatePayload = {
      dataSource: clusterName,
      database: dbName,
      collection: collectionName,
      filter: { "email": extractedData.email },
      update: {
        $set: {
          ["products." + product.productId + ".productName"]: product.productName,
          ["products." + product.productId + ".stripeCustomerId"]: extractedData.customerId,
          ["products." + product.productId + ".status"]: "active",
          ["products." + product.productId + ".lastUpdated"]: new Date().toISOString()
        },
        $setOnInsert: {
          "email": extractedData.email  // Set email only on document creation
        }
      },
      upsert: true  // Ensure that if the document doesn't exist, it's created
    };

    let options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'api-key': apiKey
      },
      payload: JSON.stringify(updatePayload),
      muteHttpExceptions: true
    };

    try {
      let response = UrlFetchApp.fetch(updateUrl, options);
      let responseData = JSON.parse(response.getContentText());
      if (responseData.ok && responseData.upsertedId) {
        console.log('New document created with ID:', responseData.upsertedId);
      } else if (responseData.ok) {
        console.log('Document updated successfully');
      } else {
        console.log('No documents were modified, check filter and data correctness.');
      }
    } catch (error) {
      console.error('Failed to add/update subscription:', error.toString());
    }
  });
}
