// Global cache instance
var scriptCache = CacheService.getScriptCache();
const SOURCE = "ECB";

function convertCurrencyInSelectedRange(fromCurrency, toCurrency, convertEntireSheet, conversionType, date, latestAvailableDate) {

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const range = convertEntireSheet ? spreadsheet.getActiveSheet().getDataRange() : spreadsheet.getActiveRange();

  // Validate date and get actual date to use
  const actualDateUsed = validateAndGetActualDate(date, latestAvailableDate);
  console.log("Returning actualDateUsed:", actualDateUsed);

  // Apply conversion based on selected strategy
  if (conversionType === 'hardcode') {
    applyHardcodedConversion(range, fromCurrency, toCurrency, actualDateUsed);
  } else if (conversionType === 'formula') {
    applyFormulaConversion(range, fromCurrency, toCurrency, actualDateUsed);
  }

  // Apply formatting
  applyCurrencyFormatting(range, toCurrency);

  return actualDateUsed;
}

function validateAndGetActualDate(selectedDate, latestAvailableDate) {
  const dateObj = new Date(selectedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dateObj > today) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Future date selected. Using latest available rates from " + latestAvailableDate);
    return latestAvailableDate;
  }

  return selectedDate;
}

function applyHardcodedConversion(range, fromCurrency, toCurrency, date) {
  try {
    const conversionRate = getConversionRate(fromCurrency, toCurrency, date);
    const values = range.getValues();
    const updatedValues = values.map(row =>
      row.map(cell => typeof cell === 'number' ? cell * conversionRate : cell)
    );
    range.setValues(updatedValues);
  } catch (error) {
    // Error already shown to user by getConversionRate
  }
}

function applyFormulaConversion(range, fromCurrency, toCurrency, date) {
  const values = range.getValues();
  const processedValues = values.map(row =>
    row.map(cellValue => {
      const valueToCheck = typeof cellValue === 'string' ? cellValue.trim() : cellValue;

      if ((typeof valueToCheck === 'number' || (!isNaN(valueToCheck) && valueToCheck !== '')) && valueToCheck !== 0) {
        const numValue = typeof valueToCheck === 'number' ? valueToCheck : parseFloat(valueToCheck);
        return `=IFERROR(${numValue}*INDEX(GOOGLEFINANCE("CURRENCY:${fromCurrency}${toCurrency}", "price", "${date}"),2,2), "Rate unavailable. Use undo to revert.")`;
      }

      return cellValue;
    })
  );

  range.setValues(processedValues);
}

function applyCurrencyFormatting(range, currencyCode) {
  const currencyFormat = getCurrencyFormat(currencyCode);
  range.setNumberFormat(currencyFormat);
}

function getConversionRate(fromCurrencyCode, toCurrencyCode, date) {
  const rate = CurrencyRateService.getRate(fromCurrencyCode, toCurrencyCode, date);
  
  if (!rate) {
    console.log(`Rate not available for ${date}`);
    SpreadsheetApp.getActiveSpreadsheet().toast(`Rate not available for ${date}. Try a different date.`, "Currency Conversion Error");
    throw new Error(`Rate not available for ${date}`);
  }
  
  return rate;
}

function buildApiUrl(fromCurrency, toCurrency, date) {
  return `https://api.frankfurter.app/${date}?from=${fromCurrency}&to=${toCurrency}`;
}

function getRateFromMongoDB(fromCurrency, toCurrency, date) {
  var props = getMongoDBProperties();
  var findUrl = props.baseUrl + "/action/findOne";

  var findPayload = {
    dataSource: props.clusterName,
    database: props.dbName,
    collection: props.ratesCollectionName,
    filter: {
      "_id": "exchange_rates",
      [`rates.${date}.${fromCurrency}_${toCurrency}`]: { $exists: true }
    },
    projection: { [`rates.${date}.${fromCurrency}_${toCurrency}.rate`]: 1 }
  };

  var options = {
    method: "post",
    contentType: "application/json",
    headers: { "api-key": props.apiKey },
    payload: JSON.stringify(findPayload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(findUrl, options);
    var result = JSON.parse(response.getContentText());

    if (result.document && result.document.rates &&
      result.document.rates[date] &&
      result.document.rates[date][`${fromCurrency}_${toCurrency}`]) {
      return result.document.rates[date][`${fromCurrency}_${toCurrency}`].rate;
    }
    return null; // Not found in MongoDB
  } catch (error) {
    console.error("Failed to query MongoDB:", error.toString());
    return null;
  }
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

function loadLatestRatesToCache() {
  // Get the latest date from MongoDB
  var latestDate = getLatestDateInRates();
  if (!latestDate) {
    return null; // No dates available
  }

  SpreadsheetApp.getUi().alert("Latest rates available are from: " + latestDate);

  var props = getMongoDBProperties();
  var findUrl = props.baseUrl + "/action/findOne";

  var findPayload = {
    dataSource: props.clusterName,
    database: props.dbName,
    collection: props.ratesCollectionName,
    filter: { "_id": props.ecbRatesDocumentId },
    projection: { [`rates.${latestDate}`]: 1 }
  };

  var options = {
    method: "post",
    contentType: "application/json",
    headers: { "api-key": props.apiKey },
    payload: JSON.stringify(findPayload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(findUrl, options);
    var result = JSON.parse(response.getContentText());

    if (result.document && result.document.rates && result.document.rates[latestDate]) {
      var ratePairs = result.document.rates[latestDate];

      // Load each rate into cache with 21600 seconds (6 hours) expiration for consistency
      for (var pairKey in ratePairs) {
        var rate = ratePairs[pairKey].rate;
        var currencies = pairKey.split('_');
        var fromCurrency = currencies[0];
        var toCurrency = currencies[1];
        var cacheKey = `${SOURCE}_${fromCurrency}_${toCurrency}_${latestDate}`;
        scriptCache.put(cacheKey, rate.toString(), 21600);
      }
    }
    console.log("loadLatestRatesToCache - returning latestDate: ", latestDate);
    return latestDate;
  } catch (error) {
    console.error("Failed to load rates to cache:", error.toString());
    return null;
  }
}
