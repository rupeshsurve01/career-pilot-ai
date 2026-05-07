const express = require('express');

const authRouter = express.Router();

const { registerUserController } = require('../controller/auth.controller');

authRouter.post('/register', registerUserController);


module.exports = authRouter;