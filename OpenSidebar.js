function openCurrencySidebar() {
  var html = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('Currency Converter')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}