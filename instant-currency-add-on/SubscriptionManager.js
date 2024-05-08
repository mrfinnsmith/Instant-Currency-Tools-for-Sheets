var cache = CacheService.getScriptCache();

// Function to retrieve the Firebase Project ID from script properties
function getFirebaseProjectId() {
    var scriptProperties = PropertiesService.getScriptProperties();
    return scriptProperties.getProperty('FIREBASE_PROJECT_ID');
}

    };

    var response = UrlFetchApp.fetch(url, options);
    console.log(response.getContentText());

    // Update cache with the new status
    cache.put(email, status, 21600); // Cache for 6 hours
}

// Function to check the subscription status from Firebase using email, with cache check
function checkSubscriptionStatus(email) {
    // First try to get the status from cache
    var cachedStatus = cache.get(email);
    if (cachedStatus) {
        return { email: email, status: cachedStatus };
    }

    // If not in cache, fetch from Firebase
    var firebaseProjectId = getFirebaseProjectId();
    var url = 'https://firestore.googleapis.com/v1/projects/' + firebaseProjectId + '/databases/(default)/documents/subscriptions/' + encodeURIComponent(email);

    var options = {
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
        },
        muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var doc = JSON.parse(response.getContentText());
    if (doc.fields && doc.fields.status && doc.fields.status.stringValue) {
        var status = doc.fields.status.stringValue;
        cache.put(email, status, 21600); // Cache for 6 hours
        return { email: email, status: status };
    } else {
        return { email: email, status: "none" }; // Default if not found
    }
}