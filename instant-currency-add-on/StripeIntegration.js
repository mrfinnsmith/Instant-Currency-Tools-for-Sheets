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

  return ContentService.createTextOutput(JSON.stringify({success: true}))
                       .setMimeType(ContentService.MimeType.JSON);
}

function handleSubscriptionCreated(subscriptionData) {
  var email = subscriptionData.metadata.email; // Retrieve email from subscription metadata
  var customerId = subscriptionData.customer;
  var status = 'active'; // Default status for new subscriptions
  SubscriptionManager.updateSubscriptionStatus(email, customerId, status);
}

function handleSubscriptionUpdated(subscriptionData) {
  var email = subscriptionData.metadata.email; // Retrieve email from subscription metadata
  var customerId = subscriptionData.customer;
  var status = subscriptionData.status; // Status from the subscription update data
  SubscriptionManager.updateSubscriptionStatus(email, customerId, status);
}

function handleSubscriptionDeleted(subscriptionData) {
  var email = subscriptionData.metadata.email; // Retrieve email from subscription metadata
  var customerId = subscriptionData.customer;
  var status = 'cancelled'; // Set status for cancelled subscriptions
  SubscriptionManager.updateSubscriptionStatus(email, customerId, status);
}
