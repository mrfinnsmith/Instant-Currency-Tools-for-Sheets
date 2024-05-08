var cache = CacheService.getScriptCache();

function getMongoDBProperties() {
    var scriptProperties = PropertiesService.getScriptProperties();
    return {
        apiKey: scriptProperties.getProperty('MONGO-API-KEY'),
        baseUrl: scriptProperties.getProperty('MONGO-BASE-URL'),
        dbName: scriptProperties.getProperty('MONGO-DB-NAME'),
        collectionName: scriptProperties.getProperty('MONGO-SUBSCRIPTION-COLLECTION-NAME'),
        clusterName: scriptProperties.getProperty('MONGO-CLUSTER-NAME')
    };
}

function checkMongoDBSubscriptionStatus(email, productId) {
    var props = getMongoDBProperties();
    var cacheKey = email + "-" + productId;
    var cachedData = cache.get(cacheKey);
    if (cachedData) {
        return { email: email, productId: productId, status: JSON.parse(cachedData).status };
    }

    var url = props.baseUrl + '/action/findOne';
    var query = {
        dataSource: props.clusterName,
        database: props.dbName,
        collection: props.collectionName,
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
            var productData = result.document.products[productId];
            cache.put(cacheKey, JSON.stringify(productData), 21600); // Cache for 6 hours
            return { email: email, productId: productId, status: productData.status };
        } else {
            return { email: email, productId: productId, status: "none" };
        }
    } catch (error) {
        console.error("Failed to fetch MongoDB document:", error.toString());
        return { email: email, productId: productId, status: "error", error: error.toString() };
    }
}
}