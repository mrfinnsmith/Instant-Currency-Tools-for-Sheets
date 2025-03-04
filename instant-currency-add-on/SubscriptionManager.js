var cache = CacheService.getScriptCache();

function checkSubscriptionCache(email, productId) {
    var cacheKey = email + "-" + productId;
    var cachedData = cache.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    }
    return null;
}

function checkMongoDBSubscriptionStatus(email, productId) {
    var props = getMongoDBProperties();
    var url = props.baseUrl + '/action/findOne';
    var query = {
        dataSource: props.clusterName,
        database: props.dbName,
        collection: props.subscriptionCollectionName,
        filter: {
            "email": email,
            ["products." + productId]: { "$exists": true }
        }
    };

    var options = {
        method: 'post',
        contentType: 'application/json',
        headers: {
            'api-key': props.apiKey
        },
        payload: JSON.stringify(query),
        muteHttpExceptions: true
    };

    try {
        var response = UrlFetchApp.fetch(url, options);
        var result = JSON.parse(response.getContentText());
        if (result.document) {
            return result.document.products[productId];
        }
        return { status: "none" };
    } catch (error) {
        console.error("Failed to fetch MongoDB document:", error.toString());
        return { status: "error", error: error.toString() };
    }
}

function checkSheetSubscriptionStatus(email, productId) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const subscriptionSpreadsheetId = scriptProperties.getProperty('LOG-SPREADSHEET-ID');
    const subscriptionSheetId = scriptProperties.getProperty('SUBSCRIPTION-SHEET-ID');
    
    const subscriptionSpreadsheet = SpreadsheetApp.openById(subscriptionSpreadsheetId);
    const subscriptionSheet = subscriptionSpreadsheet.getSheetById(subscriptionSheetId);
    
    const data = subscriptionSheet.getDataRange().getValues();
    const headers = data[0];
    
    const emailColIndex = headers.indexOf("email");
    const statusColIndex = headers.indexOf(`${productId}_status`);
    const lastUpdatedColIndex = headers.indexOf(`${productId}_lastUpdated`);
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailColIndex] === email) {
        const status = data[i][statusColIndex];
        const lastUpdated = lastUpdatedColIndex !== -1 ? data[i][lastUpdatedColIndex] : new Date().toISOString();
        
        return { 
          status: status || "none",
          lastUpdated: lastUpdated
        };
      }
    }
    
    // User not found in subscription sheet
    return { status: "none" };
    
  } catch (error) {
    console.error("Failed to check sheet subscription:", error.toString());
    return { status: "error", error: error.toString() };
  }
}

function isUserSubscribed(productId) {
    var email = Session.getActiveUser().getEmail();

    if (!email) {
        return false;
    }

    try {
        var cachedData = checkSubscriptionCache(email, productId);
        if (cachedData && cachedData.status === "active") {
            return true;
        }
        
        var sheetData = checkSheetSubscriptionStatus(email, productId);
        if (sheetData && sheetData.status === "active") {
            cache.put(email + "-" + productId, JSON.stringify(sheetData), 21600);
            return true;
        }
        
        return false;
    } catch (error) {
        return false;
    }
}