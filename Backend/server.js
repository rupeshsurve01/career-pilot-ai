require('dotenv').config();// used to access environment variables from a .env file into process.env
const app = require('./src/app');
const connectDB = require('./src/config/database');
const invokeGeminiAi = require('./src/services/ai.service')

connectDB();

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

module.exports = app;
