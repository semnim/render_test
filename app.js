const config = require('./utils/config');
// Import express
const express = require('express');
// initialize app object
const app = express();
// Import cors
const cors = require('cors');
// Person router for request handlers
const personsRouter = require('./controllers/persons');

const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
logger.info('Connecting to', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log('Connected!');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB: ', err.message);
  });

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.customMorganLogger);
app.use('/api/persons', personsRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
