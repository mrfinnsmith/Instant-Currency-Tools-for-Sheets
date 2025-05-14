function onInstall(e) {
  onOpen(e);
}

/**
 * This function creates the add-on menu with appropriate handling for different authorization modes.
 *
 * Fixed in commit 86b402b8c452 to address Google Workspace Marketplace rejection.
 * The previous implementation incorrectly used the same function references for both authorized
 * and unauthorized states, which violated Google's requirements.
 *
 * When in AuthMode.NONE (before user authorization), we now use stub functions
 * that only display authorization prompts instead of attempting to use restricted services.
 *
 * Reference: https://developers.google.com/workspace/add-ons/concepts/editor-auth-lifecycle
 */
function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createAddonMenu();
  const MENU_CONVERT = "💲 Convert currency";
  const MENU_MEMBERSHIP = "✓ Check membership";
  const MENU_ABOUT = "ℹ️ About Instant Currency";

  if (e && e.authMode === ScriptApp.AuthMode.NONE) {
    // In AuthMode.NONE, only add menu items linked to stub functions that do NOT use restricted services
    menu
      .addItem(MENU_CONVERT, "showAuthPrompt")
      .addItem(MENU_ABOUT, "showAboutPrompt")
      .addToUi();
  } else {
    // In other modes, add the full menu with real functionality
    menu
      .addItem(MENU_CONVERT, "openCurrencySidebar")
      .addItem(MENU_MEMBERSHIP, "checkMembershipStatus")
      .addItem(MENU_ABOUT, "showAboutDialog")
      .addToUi();
  }
}

function showAuthPrompt() {
  try {
    // Intentionally trigger Google's authorization dialog by attempting
    // to use a restricted service
    PropertiesService.getScriptProperties().getProperty('AUTH_CHECK');

    // Refresh the menu with all options
    onOpen();

    // If authorization is successful, open the sidebar
    openCurrencySidebar();
  } catch (error) {
    // Only show alert if error isn't related to authorization
    // (Authorization errors will already show Google's dialog)
    if (!error.message.includes('Authorization required')) {
      SpreadsheetApp.getUi().alert(
        "An error occurred: " + error.message
      );
    }
  }
}

function showAboutPrompt() {
  try {
    // Trigger authorization
    PropertiesService.getScriptProperties().getProperty('AUTH_CHECK');

    // If authorization is successful, show regular about dialog
    showAboutDialog();
  } catch (error) {
    // Only show alert if error isn't related to authorization
    if (!error.message.includes('Authorization required')) {
      SpreadsheetApp.getUi().alert(
        "An error occurred: " + error.message
      );
    }
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
