const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
    type: String,
    required: true,
    unique: [true, 'Username already exists']
  },

  email: {
    type: String,
    required: true,
    unique: [true, 'Account already exists with this email']
  },

  password: {
    type: String,
    required: true
  },

})

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;