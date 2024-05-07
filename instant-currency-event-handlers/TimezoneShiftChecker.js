// TimezoneShiftChecker.js
// This file includes functions to retrieve and log the current UTC offset for specified timezones.

/**
 * Retrieves and logs the current UTC offset for a specified timezone.
 * @param {string} timezone - The timezone to check.
 * @return {Object} - An object containing the UTC offset or an error message if the API call fails.
 */
function getTimeZoneInfo(timezone) {
    const apiUrl = `https://worldtimeapi.org/api/timezone/${timezone}`;
    try {
      const response = UrlFetchApp.fetch(apiUrl, { method: 'GET' });
      const responseJSON = JSON.parse(response.getContentText());
      console.log("Successful API Response:", JSON.stringify(responseJSON)); // Log the entire successful API response
      return {
        responseJSON
      };
    } catch (error) {
      console.error("API Response Error:", error.toString()); // Log the error if the API call fails
      return {
        responseJSON: null,  // Return null to indicate the failure more explicitly
        error: `Failed to fetch data: ${error}`
      };
    }
  }
  