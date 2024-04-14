function convertCurrencyInSelectedRange(fromCurrency, toCurrency, convertEntireSheet, conversionType) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var range = convertEntireSheet ? spreadsheet.getActiveSheet().getDataRange() : spreadsheet.getActiveRange();
  var values = range.getValues();

  if (conversionType === 'hardcode') {
      var conversionRate = getConversionRate(fromCurrency, toCurrency);
      var updatedValues = values.map(row => row.map(cell => typeof cell === 'number' ? cell * conversionRate : cell));

      range.setValues(updatedValues);
      var currencyFormat = getCurrencyFormat(toCurrency);
      range.setNumberFormat(currencyFormat);
  } else if (conversionType === 'formula') {
      var updatedFormulas = values.map(row => row.map(cell => {
          if (typeof cell === 'number') {
              return `=${cell}*GOOGLEFINANCE("CURRENCY:${fromCurrency}${toCurrency}")`;
          } else {
              return cell;
          }
      }));

      range.setFormulas(updatedFormulas);
  }
}

function getConversionRate(fromCurrencyCode, toCurrencyCode) {
  // Construct the API URL
  var apiUrl = `https://api.frankfurter.app/latest?from=${fromCurrencyCode}&to=${toCurrencyCode}`;

  // Fetch and parse the API response
  var response = UrlFetchApp.fetch(apiUrl);

  var json = JSON.parse(response.getContentText());

  // Return the conversion rate
  return json.rates[toCurrencyCode];
}

function getCurrencyFormat(currencyString) {

  var formatMap = {
      "AUD": '"AUD" #,##0.00', // Australian Dollar
      "BGN": '"BGN" #,##0.00', // Bulgarian Lev
      "BRL": '"BRL" #,##0.00', // Brazilian Real
      "CAD": '"CAD" #,##0.00', // Canadian Dollar
      "CHF": '"CHF" #,##0.00', // Swiss Franc
      "CNY": '"CNY" #,##0.00', // Chinese Renminbi Yuan
      "CZK": '"CZK" #,##0.00', // Czech Koruna
      "DKK": '"DKK" #,##0.00', // Danish Krone
      "EUR": '"€" #,##0.00',   // Euro
      "GBP": '"£" #,##0.00',   // British Pound
      "HKD": '"HKD" #,##0.00', // Hong Kong Dollar
      "HUF": '"HUF" #,##0.00', // Hungarian Forint
      "IDR": '"IDR" #,##0.00', // Indonesian Rupiah
      "ILS": '"ILS" #,##0.00', // Israeli New Sheqel
      "INR": '"₹" #,##0.00',   // Indian Rupee
      "ISK": '"ISK" #,##0.00', // Icelandic Króna
      "JPY": '"¥" #,##0',      // Japanese Yen, no decimal
      "KRW": '"₩" #,##0.00',   // South Korean Won
      "MXN": '"MXN" #,##0.00', // Mexican Peso
      "MYR": '"MYR" #,##0.00', // Malaysian Ringgit
      "NOK": '"NOK" #,##0.00', // Norwegian Krone
      "NZD": '"NZD" #,##0.00', // New Zealand Dollar
      "PHP": '"PHP" #,##0.00', // Philippine Peso
      "PLN": '"PLN" #,##0.00', // Polish Złoty
      "RON": '"RON" #,##0.00', // Romanian Leu
      "SEK": '"SEK" #,##0.00', // Swedish Krona
      "SGD": '"SGD" #,##0.00', // Singapore Dollar
      "THB": '"THB" #,##0.00', // Thai Baht
      "TRY": '"TRY" #,##0.00', // Turkish Lira
      "USD": '"$"#,##0.00',    // United States Dollar
      "ZAR": '"ZAR" #,##0.00', // South African Rand
      // Add any additional formats as needed
  };
  return formatMap[currencyString] || '#,##0.00'; // Default format if currency not found
}

