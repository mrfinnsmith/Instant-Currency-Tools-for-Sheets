function doPost(e) {
  var eventJson = JSON.parse(e.postData.contents);
  var eventType = eventJson.type;
  var eventData = eventJson.data.object;

  switch (eventType) {
      case 'customer.subscription.created':
          handleSubscriptionCreated(eventData);
          break;
      case 'customer.subscription.updated':
          handleSubscriptionUpdated(eventData);
          break;
      case 'customer.subscription.deleted':
          handleSubscriptionDeleted(eventData);
          break;
      default:
          console.log('Unhandled Stripe event:', eventType);
          break;
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
                       .setMimeType(ContentService.MimeType.JSON);
}

function handleSubscriptionCreated(subscriptionData) {
  var customerId = subscriptionData.customer; // Extract the customer ID from the subscription data
  var status = 'active'; // Default status for new subscriptions
  SubscriptionManager.updateSubscriptionStatus(customerId, status);
}

function handleSubscriptionUpdated(subscriptionData) {
  var customerId = subscriptionData.customer; // Extract the customer ID
  var status = subscriptionData.status; // Status directly from the subscription update data
  SubscriptionManager.updateSubscriptionStatus(customerId, status);
}

function handleSubscriptionDeleted(subscriptionData) {
  var customerId = subscriptionData.customer; // Extract the customer ID
  var status = 'cancelled'; // Set status for cancelled subscriptions
  SubscriptionManager.updateSubscriptionStatus(customerId, status);
}
