function updateMongoDBSubscription(extractedData) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const baseUrl = scriptProperties.getProperty('mongoDbBaseUrl');
  const apiKey = scriptProperties.getProperty('mongoDbApiKey');
  const clusterName = scriptProperties.getProperty('mongoDbClusterName');
  const dbName = scriptProperties.getProperty('mongoDbDatabaseName');
  const collectionName = scriptProperties.getProperty('mongoDbSubcriptionCollectionName');
  const updateUrl = baseUrl + "/action/updateOne";

  var updatePayload = {
    dataSource: clusterName,
    database: dbName,
    collection: collectionName,
    filter: { "email": extractedData.email },
    update: {
      $set: {
        "email": extractedData.email,
        ["products." + extractedData.product + ".stripeCustomerId"]: extractedData.customerId,
        ["products." + extractedData.product + ".status"]: "active",
        ["products." + extractedData.product + ".lastUpdated"]: new Date().toISOString()
      },
      $setOnInsert: {
        ["products." + extractedData.product + ".comments"]: "Initial setup."
      }
    },
    upsert: true
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'api-key': apiKey
    },
    payload: JSON.stringify(updatePayload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(updateUrl, options);
    var responseData = JSON.parse(response.getContentText());
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
  console.log('Request payload:', JSON.stringify(updatePayload));
  console.log('MongoDB Response:', response.getContentText());
}


function testUpdateMongoDBSubscription() {
  // Create dummy data for testing based on the structure of extractedData
  const dummyExtractedData = {
    eventType: 'charge.succeeded',
    email: 'joe@example.com',
    customerId: 'cus_HK1234567890',
    product: 'Test Product',
    amount: 49.99, // Assuming the amount is already converted from cents to dollars
    currency: 'USD',
    transactionDate: new Date(),
    paymentMethod: 'visa',
    data: JSON.stringify({
      id: 'evt_1NG8Du2eZvKYlo2CUI79vXWy',
      object: 'event',
      api_version: '2019-02-19',
      created: 1609459200,
      data: {
        object: {
          id: 'ch_3Jk21D2eZvKYlo2C0AAdx4xv',
          object: 'charge',
          billing_details: {
            email: 'miami@example.com',
            name: 'Test User'
          },
          description: 'Test Product',
          amount: 4999,
          currency: 'usd',
          customer: 'cus_HK1234567890',
          payment_method_details: {
            card: {
              brand: 'visa'
            }
          },
          created: 1609459200
        }
      }
    })
  };

  // Call the function that updates MongoDB with this dummy data
  updateMongoDBSubscription(dummyExtractedData);
}