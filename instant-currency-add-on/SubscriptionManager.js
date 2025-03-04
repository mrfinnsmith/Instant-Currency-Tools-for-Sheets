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

function isUserSubscribed(productId) {
    var email = Session.getActiveUser().getEmail();

    if (!email) {
        return false;
    }

    try {
        var cachedData = checkSubscriptionCache(email, productId);
        if (cachedData) {
            console.log('found in cache');
            return cachedData.status === "active";
        }
        console.log('not found in cache');
        var mongoData = checkMongoDBSubscriptionStatus(email, productId);
        if (mongoData) {
            console.log('found in mongo');
            cache.put(email + "-" + productId, JSON.stringify(mongoData), 21600); // Cache for 6 hours
            return mongoData.status === "active";
        }
        console.log('not found in mongo')
        return false;
    } catch (error) {
        return false;
    }
}