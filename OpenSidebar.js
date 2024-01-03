function openCurrencySidebar() {
  var html = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('Currency Converter')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

// Function to fetch available currencies from Frankfurter API and return as JSON string
function getCurrencies() {
  var url = 'https://api.frankfurter.app/currencies';
  var response = UrlFetchApp.fetch(url);
  var currencies = JSON.parse(response.getContentText());
  return currencies;
}