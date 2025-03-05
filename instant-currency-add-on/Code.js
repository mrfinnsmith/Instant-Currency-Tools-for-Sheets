function onOpen() {
  openCurrencySidebar();
}

function openCurrencySidebar() {
  loadLatestRatesToCache();

  const props = PropertiesService.getScriptProperties();
  const productId = props.getProperty('STRIPE-INSTANT-CURRENCY-SHEETS-PRODUCT-ID');
  const isPremium = isUserSubscribed(productId);

  var template = HtmlService.createTemplateFromFile('Sidebar');
  template.isPremium = isPremium;

  var html = template.evaluate()
    .setTitle('Instant Currency')
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