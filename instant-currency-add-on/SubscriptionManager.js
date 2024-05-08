var cache = CacheService.getScriptCache();

// Function to retrieve MongoDB API properties from script properties
function getMongoDBProperties() {
    var scriptProperties = PropertiesService.getScriptProperties();
    return {
        apiKey: scriptProperties.getProperty('mongoDbApiKey'),
        baseUrl: scriptProperties.getProperty('mongoDbBaseUrl'),
        dbName: scriptProperties.getProperty('mongoDbDatabaseName'),
        collectionName: 'subscriptions', // Collection name for subscriptions
        clusterName: scriptProperties.getProperty('mongoDbClusterName') // Assuming similar property is set
    };
}

// Function to check the subscription status from MongoDB using email, with cache check
function checkMongoDBSubscriptionStatus(email) {
    var props = getMongoDBProperties();
    var cachedData = cache.get(email);
    if (cachedData) {
        return { email: email, data: JSON.parse(cachedData) };
    }

    var url = props.baseUrl + '/find';
    var query = {
        dataSource: props.clusterName,
        database: props.dbName,
        collection: props.collectionName,
        filter: { "email": email }
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

        if (result.documents.length > 0) {
            var data = result.documents[0];
            cache.put(email, JSON.stringify(data), 21600); // Cache for 6 hours
            return { email: email, data: data };
        } else {
            return { email: email, data: "none" }; // Default if not found
        }
    } catch (error) {
        console.error("Failed to fetch MongoDB document:", error.toString());
    }
}