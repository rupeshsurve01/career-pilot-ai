const express = require('express');

const authRouter = express.Router();

const { registerUserController,loginUserController, logoutUserController } = require('../controller/auth.controller');

authRouter.post('/register', registerUserController);

authRouter.post('/login', loginUserController);

authRouter.get('/logout', logoutUserController )

module.exports = authRouter;