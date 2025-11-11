const scriptProperties = PropertiesService.getScriptProperties();

function doPost(e) {
  let jsonString = e.postData.getDataAsString();
  let event = JSON.parse(jsonString);

  // Log the type of event received for easier troubleshooting
  console.log('Received event type:', event.type);

  if (event.type == 'checkout.session.completed') {
    // Log the session ID and the full event for debugging purposes
    console.log('Processing checkout.session.completed for session ID:', event.data.object.id);
    console.log('Full event data:', JSON.stringify(event));

    // Retrieve expanded session details from Stripe
    let sessionId = event.data.object.id;
    let expandedSession = fetchExpandedCheckoutSession(sessionId);

    let extractedData;

    if (expandedSession && expandedSession.line_items) {
      extractedData = parseCheckoutEventData(event, expandedSession.line_items.data);
      // Log details about the extracted data for verification
      console.log('Extracted line items data:', JSON.stringify(extractedData));
    } else {
      console.error('Failed to retrieve or expand checkout session details for session ID:', sessionId);
    }

    // Continue with existing logic only if data was successfully extracted
    if (extractedData) {
      logCheckoutEventToSheet(extractedData);
      updateSubscriptionSheet(extractedData);
      updateMongoDBSubscription(extractedData);
    } else {
      console.log('No data extracted for logging or database update due to previous errors.');
    }
  } else {
    console.log('Event type not handled:', event.type);
  }
}

function updateMongoDBSubscription(extractedData) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const baseUrl = scriptProperties.getProperty('mongoDbBaseUrl');
  const apiKey = scriptProperties.getProperty('mongoDbApiKey');
  const clusterName = scriptProperties.getProperty('mongoDbClusterName');
  const dbName = scriptProperties.getProperty('mongoDbDatabaseName');
  const collectionName = scriptProperties.getProperty('mongoDbSubcriptionCollectionName');
  const updateUrl = baseUrl + "/action/updateOne";

  // extractedData is already an array of products, don't look for .products property
  extractedData.forEach(product => {
    let updatePayload = {
      dataSource: clusterName,
      database: dbName,
      collection: collectionName,
      filter: { "email": product.email },
      update: {
        $set: {
          ["products." + product.productId + ".productName"]: product.productName,
          ["products." + product.productId + ".stripeCustomerId"]: product.customerId,
          ["products." + product.productId + ".status"]: "active",
          ["products." + product.productId + ".lastUpdated"]: new Date().toISOString()
        },
        $setOnInsert: {
          "email": product.email
        }
      },
      upsert: true
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

function parseCheckoutEventData(event, lineItemsData) {
  const eventData = event.data.object;

  // Extract an array of objects, each containing data about a product
  const productsData = lineItemsData.map(item => ({
    productId: item.price.product,
    productName: item.description,
    eventType: event.type,
    email: eventData.customer_details?.email || null,
    customerId: eventData.customer || null,
    amount: item.amount_total / 100 || null,
    currency: eventData.currency?.toUpperCase() || null,
    transactionDate: eventData.created ? new Date(eventData.created * 1000) : null,
    paymentMethod: eventData.payment_method_details?.card?.brand || null,
    data: JSON.stringify(event)
  }));

  return productsData;
}

function logCheckoutEventToSheet(productsData) {
  const logSsId = scriptProperties.getProperty('LOG_SPREADSHEET_ID');
  const logSpreadsheet = SpreadsheetApp.openById(logSsId);
  const logSheetId = scriptProperties.getProperty('LOG_SHEET_ID');
  let logSheet;

  const sheets = logSpreadsheet.getSheets();
  sheets.forEach(sheet => {
    if (sheet.getSheetId() == logSheetId) {
      logSheet = sheet;
    }
  });

  if (!logSheet) {
    console.error("Log sheet not found.");
    return;
  }

  // Append a row for each product in the productsData array
  productsData.forEach(product => {
    let time = Utilities.formatDate(new Date(), "GMT+08:00", "MM/dd/yy, h:mm a");
    logSheet.appendRow([
      time,
      product.eventType,
      product.productId,
      product.productName,
      product.email,
      product.customerId,
      product.amount,
      product.currency,
      product.transactionDate,
      product.paymentMethod,
      product.data
    ]);
  });
}

function fetchExpandedCheckoutSession(sessionId) {
  const stripeApiKey = scriptProperties.getProperty('STRIPE_API_KEY');
  const url = `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=line_items`;

  const options = {
    method: 'get',
    headers: {
      'Authorization': `Bearer ${stripeApiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      const responseData = JSON.parse(response.getContentText());
      return responseData;
    } else {
      console.error('Failed to fetch session data:', response.getContentText());
      return null;
    }
  } catch (error) {
    console.error('Error fetching session data:', error.toString());
    return null;
  }
}

function updateSubscriptionSheet(extractedData) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const logSsId = scriptProperties.getProperty('LOG_SPREADSHEET_ID');
  const subSheetId = scriptProperties.getProperty('SUBSCRIPTION-SHEET-ID');
  
  const spreadsheet = SpreadsheetApp.openById(logSsId);
  let subSheet;
  
  const sheets = spreadsheet.getSheets();
  sheets.forEach(sheet => {
    if (sheet.getSheetId() == subSheetId) {
      subSheet = sheet;
    }
  });
  
  if (!subSheet) {
    console.error("Subscription sheet not found.");
    return;
  }
  
  // Check if sheet is empty and set up headers if needed
  if (subSheet.getLastRow() === 0) {
    subSheet.appendRow(["email"]);
  }
  
  // Process each product
  extractedData.forEach(product => {
    const email = product.email;
    const productId = product.productId;
    
    // Add product columns if they don't exist
    const productColumn = getProductColumnIndex(subSheet, productId);
    if (productColumn === -1) {
      addProductColumns(subSheet, productId);
    }
    
    // Now check if email exists
    let data = subSheet.getDataRange().getValues();
    let rowFound = false;
    
    for (let i = 1; i < data.length; i++) { // Skip header row
      if (data[i][0] === email) {
        rowFound = true;
        const productColumn = getProductColumnIndex(subSheet, productId);
        subSheet.getRange(i + 1, productColumn + 1).setValue("active");
        subSheet.getRange(i + 1, productColumn + 2).setValue(new Date().toISOString());
        break;
      }
    }
    
    if (!rowFound) {
      // Get current headers to build new row
      const headers = subSheet.getRange(1, 1, 1, subSheet.getLastColumn()).getValues()[0];
      const newRow = Array(headers.length).fill("");
      newRow[0] = email;
      
      // Set status and date
      const productColumn = getProductColumnIndex(subSheet, productId);
      if (productColumn !== -1) {
        newRow[productColumn] = "active";
        newRow[productColumn + 1] = new Date().toISOString();
      }
      
      subSheet.appendRow(newRow);
    }
  });
}

function getProductColumnIndex(sheet, productId) {
  if (sheet.getLastColumn() === 0) return -1;
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  for (let i = 1; i < headers.length; i++) {
    if (headers[i] && headers[i].toString() === productId + "_status") {
      return i;
    }
  }
  
  return -1;
}

function addProductColumns(sheet, productId) {
  const lastCol = Math.max(1, sheet.getLastColumn());
  
  // Add two new columns - one for status and one for date
  sheet.insertColumnsAfter(lastCol, 2);
  
  // Set headers
  sheet.getRange(1, lastCol + 1).setValue(productId + "_status");
  sheet.getRange(1, lastCol + 2).setValue(productId + "_lastUpdated");
}