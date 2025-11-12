const functions = require('@google-cloud/functions-framework');
const { MongoClient, ObjectId } = require('mongodb');

// CRITICAL: Initialize MongoDB client ONCE in global scope
// This connection is reused across function invocations to prevent connection exhaustion
let mongoClient = null;
let dbConnection = null;

// MongoDB configuration from environment variables
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB_NAME;
const COLLECTION_NAME = process.env.MONGO_COLLECTION_NAME;
const DOCUMENT_ID = process.env.MONGO_DOCUMENT_ID;

/**
 * Initialize MongoDB connection with proper connection pooling
 * Called once and reused across invocations
 */
async function getDatabase() {
  if (dbConnection) {
    return dbConnection;
  }

  if (!mongoClient) {
    mongoClient = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await mongoClient.connect();
    console.log('MongoDB connection established');
  }

  dbConnection = mongoClient.db(DB_NAME);
  return dbConnection;
}

/**
 * Main HTTP function handler
 * Routes requests to appropriate MongoDB operations
 */
functions.http('mongoProxy', async (req, res) => {
  // CORS headers for Apps Script requests
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { action, payload } = req.body;

    // Route to appropriate handler
    switch (action) {
      case 'findOne':
        await handleFindOne(req, res, payload);
        break;
      case 'updateOne':
        await handleUpdateOne(req, res, payload);
        break;
      default:
        res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Handle findOne operation
 * Mimics MongoDB Data API findOne endpoint
 */
async function handleFindOne(req, res, payload) {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);

  const { filter, projection } = payload;

  // Convert string ObjectIds to actual ObjectId objects
  const processedFilter = processFilter(filter);

  const result = await collection.findOne(
    processedFilter,
    { projection: projection || {} }
  );

  // Return in Data API format
  res.json({ document: result });
}

/**
 * Handle updateOne operation
 * Mimics MongoDB Data API updateOne endpoint
 */
async function handleUpdateOne(req, res, payload) {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);

  const { filter, update, upsert } = payload;

  // Convert string ObjectIds to actual ObjectId objects
  const processedFilter = processFilter(filter);

  const result = await collection.updateOne(
    processedFilter,
    update,
    { upsert: upsert || false }
  );

  // Return in Data API format
  res.json({
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    upsertedId: result.upsertedId
  });
}

/**
 * Convert Data API filter format to native MongoDB driver format
 * Handles $oid conversion for ObjectIds
 */
function processFilter(filter) {
  if (!filter) return {};

  const processed = { ...filter };

  // Convert {"_id": {"$oid": "..."}} to {"_id": ObjectId("...")}
  if (processed._id && processed._id.$oid) {
    processed._id = new ObjectId(processed._id.$oid);
  }

  return processed;
}

/**
 * Graceful shutdown handler
 * Ensures MongoDB connections are closed properly
 */
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing MongoDB connection...');
  if (mongoClient) {
    await mongoClient.close();
  }
  process.exit(0);
});
