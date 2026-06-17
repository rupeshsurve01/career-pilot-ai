require('dotenv').config();// used to access environment variables from a .env file into process.env
const app = require('./src/app');
const connectDB = require('./src/config/database');

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});


module.exports = app;
