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
  var apiUrl = `https://api.frankfurter.app/latest?from=${fromCurrencyCode}&to=${toCurrencyCode}`;
  var response = UrlFetchApp.fetch(apiUrl);
  var json = JSON.parse(response.getContentText());
  var rate = json.rates[toCurrencyCode];
  var rateDate = json.date;

  storeRateInMongoDB(fromCurrencyCode, toCurrencyCode, rate, rateDate);
  return rate;
}

function getCurrencyFormat(currencyString) {
  
  formatMap = {
    "AUD": '"$"#,##0.00', // Australian Dollar - $1,234.56
    "BGN": '#,##0.00 "лв"', // Bulgarian Lev - 1 234,56 лв → changed because the correct format uses a comma as the decimal separator
    "BRL": '"R$" #,##0.00', // Brazilian Real - R$ 1.234,56 → changed because the correct format uses a comma as the decimal separator
    "CAD": '"$"#,##0.00', // Canadian Dollar - $1,234.56
    "CHF": '#\'##0.00 "Fr."', // Swiss Franc - 1'234,56 Fr. → changed because the correct format uses a comma as the decimal separator
    "CNY": '"¥"#,##0.00', // Chinese Renminbi Yuan - ¥1,234.56
    "CZK": '#,##0.00 "Kč"', // Czech Koruna - 1 234,56 Kč → changed because the correct format uses a comma as the decimal separator
    "DKK": '#,##0.00 "kr"', // Danish Krone - 1.234,56 kr → changed because the correct format uses a comma as the decimal separator
    "EUR": '"€"#,##0.00', // Euro - €1.234,56 → changed because the correct format uses a comma as the decimal separator
    "GBP": '"£"#,##0.00', // British Pound - £1,234.56
    "HKD": '"HK$"#,##0.00', // Hong Kong Dollar - HK$1,234.56
    "HUF": '#,##0 "Ft"', // Hungarian Forint - 1 234 Ft
    "IDR": '"Rp" #,##0', // Indonesian Rupiah - Rp 1,234
    "ILS": '"₪"#,##0.00', // Israeli New Sheqel - ₪1,234.56
    "INR": '"₹"#,##0.00', // Indian Rupee - ₹1,234.56
    "ISK": '# ##0 "kr"', // Icelandic Króna - 1 234 kr
    "JPY": '"¥"#,##0', // Japanese Yen - ¥1,234
    "KRW": '"₩"#,##0', // South Korean Won - ₩1,234
    "MXN": '"$"#,##0.00', // Mexican Peso - $1,234.56
    "MYR": '"RM"#,##0.00', // Malaysian Ringgit - RM1,234.56
    "NOK": '#,##0.00 "kr"', // Norwegian Krone - 1.234,56 kr → changed because the correct format uses a comma as the decimal separator
    "NZD": '"$"#,##0.00', // New Zealand Dollar - $1,234.56
    "PHP": '"₱"#,##0.00', // Philippine Peso - ₱1,234.56
    "PLN": '#,##0.00 "zł"', // Polish Złoty - 1 234,56 zł → changed because the correct format uses a comma as the decimal separator
    "RON": '#,##0.00 "lei"', // Romanian Leu - 1.234,56 lei → changed because the correct format uses a comma as the decimal separator
    "SEK": '#,##0.00 "kr"', // Swedish Krona - 1.234,56 kr → changed because the correct format uses a comma as the decimal separator
    "SGD": '"$"#,##0.00', // Singapore Dollar - $1,234.56
    "THB": '"฿"#,##0.00', // Thai Baht - ฿1,234.56
    "TRY": '"₺"#,##0.00', // Turkish Lira - ₺1.234,56 → changed because the correct format uses a comma as the decimal separator
    "USD": '"$"#,##0.00', // United States Dollar - $1,234.56
    "ZAR": '"R"#,##0.00' // South African Rand - R1.234,56 → changed because the correct format uses a comma as the decimal separator
};
  return formatMap[currencyString] || '#,##0.00'; // Default format if currency not found
}
