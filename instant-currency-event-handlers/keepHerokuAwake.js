/**
 * Heroku Dyno Keep-Awake Script
 * 
 * This script addresses an issue with our Stripe checkout process where users need to click
 * the "Pro Upgrade Now" button multiple times before the checkout loads. One possible cause is
 * that our Heroku dyno goes to sleep after 1 hour of inactivity on the basic plan. When
 * a user clicks the button for the first time after the dyno has been sleeping, there's a
 * significant delay as the dyno "cold starts," making it appear as if the button isn't working.
 * 
 * This script pings our Heroku endpoint every 55 minutes to prevent the dyno from sleeping,
 * ensuring that when a user clicks the checkout button, the request is processed immediately
 * without requiring multiple clicks or experiencing delayed response times.
 * 
 * This depends on a trigger to run the keepAwake() function every 30 minutes.
 */

// Heroku app URL to ping
//const scriptProperties = PropertiesService.getScriptProperties();
const HEROKU_APP_URL = scriptProperties.getProperty('HEROKU_APP_URL');

/**
 * Main function to ping the Heroku app to keep it awake.
 * This should be scheduled to run every 55 minutes via a Google Apps Script trigger.
 */
function keepAwake() {
  try {
    const options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify({})
    };
    const response = UrlFetchApp.fetch('https://instant-currency-bc58e484e25e.herokuapp.com/create-checkout-session', options);
    const statusCode = response.getResponseCode();
    Logger.log(`Ping successful: ${statusCode}`);
    return `Success: ${statusCode}`;
  } catch (error) {
    Logger.log(`Error keeping Heroku app awake: ${error.message}`);
    return `Error: ${error.message}`;
  }
}