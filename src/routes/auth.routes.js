const express = require('express');

const authRouter = express.Router();

const { registerUserController,loginUserController } = require('../controller/auth.controller');

authRouter.post('/register', registerUserController);

authRouter.post('/login', loginUserController);

module.exports = authRouter;