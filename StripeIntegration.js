function doPost(e) {

  var jsonString = e.postData.getDataAsString();
  var event = JSON.parse(jsonString)
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("XXX");
  var timeStamp = new Date();
  var time = Utilities.formatDate(timeStamp, "GMT+08:00", "MM/dd/yy, h:mm a");
  var lastRow = sheet.getLastRow();
  var getHookType = event["type"];
  
switch (getHookType)  {
// Call functions in other files that manage user's subscription state through Google Apps Script's Script Properties.
  }

return HtmlService.createHtmlOutput(200);
}