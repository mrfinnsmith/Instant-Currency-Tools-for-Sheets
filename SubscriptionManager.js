var cache = CacheService.getScriptCache();

// Function to retrieve the Firebase Project ID from script properties
function getFirebaseProjectId() {
    var scriptProperties = PropertiesService.getScriptProperties();
    return scriptProperties.getProperty('FIREBASE_PROJECT_ID');
}

// Example function to update the subscription status in Firebase
function updateSubscriptionStatus(email, status) {
    var firebaseProjectId = getFirebaseProjectId();
    var url = 'https://firestore.googleapis.com/v1/projects/' + firebaseProjectId + '/databases/(default)/documents/subscriptions/' + encodeURIComponent(email);
    
    var data = {
        fields: {
            status: { stringValue: status },
            lastUpdated: { timestampValue: new Date().toISOString() }
        }
    };

    var options = {
        method: 'PATCH',
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
        },
        payload: JSON.stringify({fields: data.fields}),
        muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    console.log(response.getContentText());
}

// Function to check the subscription status from Firebase
function checkSubscriptionStatus(email) {
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
        return doc.fields.status.stringValue;
    } else {
        return "none"; // Default status if not found
    }
}
