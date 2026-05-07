const express = require('express');

const app = express();


app.use(express.json());//allows data reading from a request


// require all thr routes here
const authRouter = require('./routes/auth.routes');



// using all the routes here
app.use('/api/auth', authRouter);

module.exports = app;