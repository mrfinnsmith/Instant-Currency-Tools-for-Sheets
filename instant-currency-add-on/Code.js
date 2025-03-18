function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createAddonMenu();

  const MENU_CONVERT = "💲 Convert currency";
  const MENU_MEMBERSHIP = "✓ Check membership";
  const MENU_ABOUT = "ℹ️ About Instant Currency";

  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    // Only add basic menu items in NONE mode
    menu.addItem(MENU_CONVERT, "openCurrencySidebar")
      .addItem(MENU_ABOUT, "showAboutDialog")
      .addToUi();
  } else {
    menu.addItem(MENU_CONVERT, "openCurrencySidebar")
      .addItem(MENU_MEMBERSHIP, "checkMembershipStatus")
      .addItem(MENU_ABOUT, "showAboutDialog")
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
    ui.alert("Premium Membership", "You have an active premium membership. Reloading Instant Currency.", ui.ButtonSet.OK);
    openCurrencySidebar();
  } else {
    ui.alert("Free Version", "You're using the free version. Upgrade for historical exchange rates and more features.", ui.ButtonSet.OK);
  }
}

function showAboutDialog() {
  const htmlOutput = HtmlService.createHtmlOutput(
    '<div>' +
    '<div style="padding:15px; background-color:#EDF6EE; font-family:Arial, Helvetica, sans-serif;">' +
    '<div class="header" style="display:flex; align-items:center; font-size:18px; color:#1B9C85; margin-bottom:10px; border-bottom:1px solid #D4F3D7; padding-bottom:5px;">' +
    '<span style="font-weight:bold;">INSTANT CURRENCY</span>' +
    '</div>' +
    '<p style="margin:5px 0;">Convert currency values directly in Google Sheets.</p>' +
    '</div>' +
    '<div style="padding:0 15px 15px; color:#454F5E; font-family:Arial, Helvetica, sans-serif;">' +
    '<ul style="padding-left:20px; margin:5px 0;">' +
    '<li>Click "Convert currency" to open the converter</li>' +
    '<li>Select currencies and convert selected cells</li>' +
    '<li>Upgrade for historical rates</li>' +
    '</ul>' +
    '<p style="margin:5px 0;">Data sourced from the ECB.</p>' +
    '<button onclick="google.script.run.openCurrencySidebar()" style="background-color:#1B9C85; color:white; padding:8px 12px; border:none; border-radius:4px; cursor:pointer; margin-top:10px;">Open</button>' +
    '<p style="margin:5px 0;"><a href="https://instantcurrency.tools/currency-tools/" target="_blank" style="color:#1B9C85; text-decoration:underline;">Learn more</a></p>' +
    '</div>' +
    '</div>'
  )
    .setWidth(400)
    .setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'About Instant Currency');
}