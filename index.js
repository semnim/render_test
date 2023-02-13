// Import dotenv - for environment variables
require("dotenv").config();
// Import express
const express = require("express");
// Import morgan logger
const morgan = require("morgan");
// initialize app object
const app = express();
// Import cors
const cors = require("cors");
const Person = require("./models/person");

// Allow cross origin resource sharing, so localhost:3000 (frontend) and
// localhost:3001 (backend) can communicate
app.use(cors());
// initialize json parser for requests. request body => request.body
app.use(express.json());
app.use(express.static("build"));

// initialize morgan token for body
morgan.token("body", (req, res) => {
  return JSON.stringify(req.body);
});

// initialize logger in custom format (tiny + tokens.body)
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req, res),
    ].join(" ");
  })
);

// create unknown endpoint middleware
const unknownEndpoint = (request, response) => {
  response.status(404).send({error: "unknown endpoint"});
};

const baseUrl = "/api/persons";

// Get all
app.get(baseUrl, (request, response) => {
  Person.find({}).then((persons) => response.json(persons));
});

// Get info
app.get("/info", (request, response) => {
  Person.find({}).then((persons) => {
    const msg =
      `<p>Phonebook has info for ${persons.length} people</p>` +
      `<p>${new Date()}</p>`;

    response.send(msg);
  });
});

// Get person
app.get(`${baseUrl}/:id`, (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end();
      }
      response.json(person);
    })
    .catch((err) => next(err));
});

// Delete person
app.delete(`${baseUrl}/:id`, (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((err) => next(err));
});

// Create person
app.post(baseUrl, (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((result) => {
      response.json(result);
    })
    .catch((err) => next(err));
});

app.put(`${baseUrl}/:id`, (request, response, next) => {
  const person = {
    name: request.body.name,
    number: request.body.number,
  };
  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      if (!updatedPerson) {
        return response.status(400).send();
      }
      response.json(updatedPerson);
    })
    .catch((err) => next(err));
});
// use endpoint middleware only AFTER all other endpoints
app.use(unknownEndpoint);

// use Error handler middleware
const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name == "CastError") {
    return response.status(400).send({error: "Malformatted id"});
  } else if ((error.name = "ValidationError")) {
    return response.status(400).send({error: error.message});
  }
};

app.use(errorHandler);
// Init port + listen
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
