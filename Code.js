function onOpen() {
  openCurrencySidebar();
}

function openCurrencySidebar() {
    var html = HtmlService.createTemplateFromFile('Sidebar')
      .evaluate()
      .setTitle('Currency Convertor')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showSidebar(html);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Function to fetch available currencies from Frankfurter API and return as JSON string
function getCurrencies() {
  var url = 'https://api.frankfurter.app/currencies';
  var response = UrlFetchApp.fetch(url);
  var currencies = JSON.parse(response.getContentText());
  return currencies;
}