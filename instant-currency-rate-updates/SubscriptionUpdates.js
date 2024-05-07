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
      extractedData = extractEventData(event, expandedSession.line_items.data);
      // Log details about the extracted data for verification
      console.log('Extracted line items data:', JSON.stringify(extractedData));
    } else {
      console.error('Failed to retrieve or expand checkout session details for session ID:', sessionId);
    }

    // Continue with existing logic only if data was successfully extracted
    if (extractedData) {
      logEventDataToSheet(extractedData);
      updateMongoDBSubscription(extractedData);
    } else {
      console.log('No data extracted for logging or database update due to previous errors.');
    }
  } else {
    console.log('Event type not handled:', event.type);
  }
}

function extractEventData(event, lineItemsData) {
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

function logEventDataToSheet(productsData) {
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
    console.log("Log sheet not found.");
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

function testApi(){
  const sessionId = 'cs_test_a1StAHzmr1qpHtYiFFNRk3TD8Eo7omg67RiCUYnyIzD9iXDKyODCeNVaAh';
  let expandedSession = fetchExpandedCheckoutSession(sessionId);

  if (expandedSession && expandedSession.line_items) {
    console.log('expandedSession.line_items: ' + JSON.stringify(expandedSession.line_items))
  }
}