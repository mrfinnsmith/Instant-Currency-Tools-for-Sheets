function convertCurrency(fromCurrency, toCurrency, amount) {
    var url = 'https://api.frankfurter.app/latest?from=' + fromCurrency + '&to=' + toCurrency;
  
    try {
        var response = UrlFetchApp.fetch(url);
        var json = response.getContentText();
        var data = JSON.parse(json);

        if (data && data.rates && data.rates[toCurrency]) {
            return amount * data.rates[toCurrency];
        } else {
            throw new Error('Exchange rate data not found');
        }
    } catch (error) {
        Logger.log('Error fetching exchange rate: ' + error.toString());
        throw error;
    }
}