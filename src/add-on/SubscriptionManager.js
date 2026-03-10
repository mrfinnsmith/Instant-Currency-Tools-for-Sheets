function getCache() {
  return CacheService.getScriptCache();
}

function checkSubscriptionCache(email) {
  const cacheKey = "sub-" + email;
  const cached = getCache().get(cacheKey);
  if (cached === "true") {
    return true;
  }
  return null;
}

function cacheSubscriptionStatus(email) {
  const cacheKey = "sub-" + email;
  getCache().put(cacheKey, "true", 21600);
}

function checkStripeSubscriptionStatus(email) {
  const stripeApiKey = PropertiesService.getScriptProperties().getProperty('STRIPE_SECRET_KEY');
  if (!stripeApiKey) {
    console.error("STRIPE_API_KEY not set in script properties");
    return false;
  }

  try {
    const url = "https://api.stripe.com/v1/customers/search?query=email%3A%27" + encodeURIComponent(email) + "%27";
    const response = UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        "Authorization": "Bearer " + stripeApiKey
      },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      console.error("Stripe customer search failed:", response.getContentText());
      return false;
    }

    const customers = JSON.parse(response.getContentText()).data;
    if (!customers || customers.length === 0) {
      return false;
    }

    var customerId = customers[0].id;
    var subsUrl = "https://api.stripe.com/v1/subscriptions?customer=" + customerId + "&status=active";
    var subsResponse = UrlFetchApp.fetch(subsUrl, {
      method: "get",
      headers: {
        "Authorization": "Bearer " + stripeApiKey
      },
      muteHttpExceptions: true
    });

    if (subsResponse.getResponseCode() !== 200) {
      console.error("Stripe subscriptions fetch failed:", subsResponse.getContentText());
      return false;
    }

    var subscriptions = JSON.parse(subsResponse.getContentText()).data;
    return subscriptions && subscriptions.length > 0;

  } catch (error) {
    console.error("Stripe subscription check failed:", error.toString());
    return false;
  }
}

function getUserEmail() {
  var email = Session.getActiveUser().getEmail();
  if (email) return email;

  try {
    var token = ScriptApp.getIdentityToken();
    if (token) {
      var parts = token.split('.');
      var payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[1])).getDataAsString());
      return payload.email || '';
    }
  } catch (e) {
    console.error("Failed to get email from identity token:", e.toString());
  }
  return '';
}

function isUserSubscribed() {
  const email = getUserEmail();
  if (!email) {
    return false;
  }

  try {
    var cached = checkSubscriptionCache(email);
    if (cached !== null) {
      return cached;
    }

    var isActive = checkStripeSubscriptionStatus(email);
    if (isActive) {
      cacheSubscriptionStatus(email);
    }
    return isActive;
  } catch (error) {
    console.error("Subscription check error:", error.toString());
    return false;
  }
}
