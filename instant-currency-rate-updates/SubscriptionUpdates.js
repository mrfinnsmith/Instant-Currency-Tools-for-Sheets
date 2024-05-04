const scriptProperties = PropertiesService.getScriptProperties();

function doPost(e) {
  let jsonString = e.postData.getDataAsString();
  let event = JSON.parse(jsonString);
  
  // Extract necessary data from the event
  let extractedData = extractEventData(event);

  // Log the data to a spreadsheet
  logEventDataToSheet(extractedData);
  // Update information in MongoDB
  updateMongoDBSubscription(extractedData);

  return HtmlService.createHtmlOutput("Event processed successfully.").setMimeType(HtmlService.MimeType.HTML);
}

function extractEventData(event) {
  const eventData = event.data.object;
  return {
    eventType: event.type,
    email: eventData.billing_details?.email || null,
    customerId: eventData.customer || null,
    product: eventData.description || null,
    amount: eventData.amount / 100 || null,
    currency: eventData.currency?.toUpperCase() || null,
    transactionDate: eventData.created ? new Date(eventData.created * 1000) : null,
    paymentMethod: eventData.payment_method_details?.card?.brand || null,
    data: JSON.stringify(event)
  };
}

function logEventDataToSheet(extractedData) {
  const logSsId = scriptProperties.getProperty('logSpreadsheetId');
  const logSpreadsheet = SpreadsheetApp.openById(logSsId);
  
  const logSheetId = scriptProperties.getProperty('logSheetId');

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

  let lastRow = logSheet.getLastRow() + 1;
  let time = Utilities.formatDate(new Date(), "GMT+08:00", "MM/dd/yy, h:mm a");

  logSheet.appendRow([
    time,
    extractedData.eventType,
    extractedData.product,
    extractedData.email,
    extractedData.customerId,
    extractedData.amount,
    extractedData.currency,
    extractedData.transactionDate,
    extractedData.paymentMethod,
    extractedData.data
  ]);
}