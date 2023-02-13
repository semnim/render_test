const logger = require('./logger');
const morgan = require('morgan');

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method);
  logger.info('Path:  ', request.path);
  logger.info('Body:  ', request.body);
  logger.info('---');
  next();
};

// create unknown endpoint middleware
const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

// use Error handler middleware
const errorHandler = (error, _request, response, _next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message });
  }
};

// initialize morgan token for body
morgan.token('body', (req, res) => {
  return JSON.stringify(req.body);
});

// initialize logger in custom format (tiny + tokens.body)
const customMorganLogger = morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
    tokens.body(req, res),
  ].join(' ');
});

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  customMorganLogger,
};
