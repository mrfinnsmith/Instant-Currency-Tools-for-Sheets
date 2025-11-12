/**
 * Makes an authenticated request to Google Cloud Function
 * Uses IAM authentication via identity token
 *
 * @param {string} functionUrl - Full URL of the Cloud Function
 * @param {Object} payload - Request body to send
 * @returns {Object} - Parsed JSON response
 */
function callCloudFunction(functionUrl, payload) {
  try {
    // Get OpenID token for authentication
    const token = ScriptApp.getIdentityToken();

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(functionUrl, options);
    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      const errorText = response.getContentText();
      throw new Error(`Cloud Function returned ${statusCode}: ${errorText}`);
    }

    return JSON.parse(response.getContentText());

  } catch (error) {
    console.error('Error calling Cloud Function:', error);
    throw error;
  }
}

/**
 * Query MongoDB via Cloud Function (findOne operation)
 *
 * @param {Object} filter - MongoDB query filter
 * @param {Object} projection - Fields to return (optional)
 * @returns {Object} - Query result
 */
function mongoFindOne(filter, projection) {
  const functionUrl = PropertiesService.getScriptProperties()
    .getProperty('CLOUD_FUNCTION_URL');

  const payload = {
    action: 'findOne',
    payload: {
      filter: filter,
      projection: projection || {}
    }
  };

  const result = callCloudFunction(functionUrl, payload);
  return result.document;
}

/**
 * Update MongoDB via Cloud Function (updateOne operation)
 *
 * @param {Object} filter - MongoDB query filter
 * @param {Object} update - Update operations ($set, $unset, etc.)
 * @param {boolean} upsert - Create document if not exists (optional)
 * @returns {Object} - Update result
 */
function mongoUpdateOne(filter, update, upsert) {
  const functionUrl = PropertiesService.getScriptProperties()
    .getProperty('CLOUD_FUNCTION_URL');

  const payload = {
    action: 'updateOne',
    payload: {
      filter: filter,
      update: update,
      upsert: upsert || false
    }
  };

  return callCloudFunction(functionUrl, payload);
}
