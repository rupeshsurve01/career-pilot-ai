const mongoose = require('mongoose');

// Railway/webpacked runtimes sometimes don’t expose Node's global `crypto`.
// MongoDB's SCRAM auth uses `crypto.randomBytes`, so ensure it exists.
if (!globalThis.crypto) {
  // eslint-disable-next-line global-require
  globalThis.crypto = require('crypto');
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

module.exports = connectDB;

