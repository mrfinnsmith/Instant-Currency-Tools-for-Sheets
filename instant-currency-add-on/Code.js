function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createAddonMenu();
  
  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    // Only add basic menu items in NONE mode
    menu.addItem("Convert currency", "openCurrencySidebar")
        .addItem("About the add-on", "showAboutDialog")
        .addToUi();
  } else {
    menu.addItem("Convert currency", "openCurrencySidebar")
        .addItem("Check membership", "checkMembershipStatus")
        .addItem("About the add-on", "showAboutDialog")
        .addToUi();
  }
}

function openCurrencySidebar() {
  const latestDate = loadLatestRatesToCache();

  const props = PropertiesService.getScriptProperties();
  const productId = props.getProperty('STRIPE-INSTANT-CURRENCY-SHEETS-PRODUCT-ID');
  const isPremium = isUserSubscribed(productId);

  const template = HtmlService.createTemplateFromFile('Sidebar');
  template.isPremium = isPremium;
  template.latestAvailableDate = latestDate;

  const html = template.evaluate()
    .setTitle('Instant Currency')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showSidebar(html);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Function to fetch available currencies from Frankfurter API and return as JSON string
function getCurrencies() {
  const url = 'https://api.frankfurter.app/currencies';
  const response = UrlFetchApp.fetch(url);
  const currencies = JSON.parse(response.getContentText());
  return currencies;
}

function showRateInfoModal() {
  SpreadsheetApp.getUi().alert("Currency exchange rates aren't perfectly symmetrical - converting from one currency to another and back introduces small rounding differences.");
}

function checkMembershipStatus() {
  const isPremium = isUserSubscribed(PropertiesService.getScriptProperties().getProperty('STRIPE-INSTANT-CURRENCY-SHEETS-PRODUCT-ID'));
  const ui = SpreadsheetApp.getUi();

  if (isPremium) {
    ui.alert("Premium Membership", "You have an active premium membership.", ui.ButtonSet.OK);
  } else {
    ui.alert("Free Version", "You're using the free version. Upgrade for historical exchange rates and more features.", ui.ButtonSet.OK);
  }
}

function showAboutDialog() {
  const htmlOutput = HtmlService.createHtmlOutput(
    '<div style="text-align:center; padding:15px;">' +
    '<h2>INSTANT CURRENCY</h2>' +
    '<p>Instant Currency is an add-on for converting currency values in Google Sheets.</p>' +
    '<p>It uses the Frankfurter API and supports multiple currencies.</p>' +
    '<p><a href="https://instantcurrency.tools" target="_blank">Learn more</a></p>' +
    '<p style="margin-top:20px; font-size:12px;">v1.0 - March 2025</p>' +
    '</div>'
  )
  .setWidth(400)
  .setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'About');
}
