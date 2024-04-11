// Assumes addition of Google Apps Script CacheService for efficient subscription status management

// Globals
var cache = CacheService.getScriptCache();

// Updates the subscription status of a user and caches it
function updateSubscriptionStatus(email, status) {
    var statusKey = email + "_status";
    cache.put(statusKey, status, 21600); // Cache for 6 hours
    PropertiesService.getScriptProperties().setProperty(statusKey, status);
}

// Checks and returns the current subscription status of a user from cache or properties
function checkSubscriptionStatus(email) {
    var statusKey = email + "_status";
    var cachedStatus = cache.get(statusKey);

    if (cachedStatus) {
        return cachedStatus;
    } else {
        var storedStatus = PropertiesService.getScriptProperties().getProperty(statusKey);
        if (storedStatus) {
            cache.put(statusKey, storedStatus, 21600); // Refresh cache for 6 hours
        }
        return storedStatus || "none"; // Default to "none" if no status is found
    }
}

// Processes a new subscription event, updates status, and caches it
function handleNewSubscription(email, customerId, isTrial) {
    var newStatus = isTrial ? "trial" : "active";
    updateSubscriptionStatus(email, newStatus);
}

// Processes a subscription cancellation event, updates status, and caches it
function handleSubscriptionCancellation(email, customerId) {
    updateSubscriptionStatus(email, "cancelled");
}