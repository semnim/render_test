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
app.get(`${baseUrl}/:id`, (request, response) => {
  Person.findById(request.params.id).then((person) => {
    if (!person) {
      return response.status(404).end();
    }
    response.json(person);
  });
});

// Delete person
app.delete(`${baseUrl}/:id`, (request, response) => {
  Person.findById(request.params.id).then((person) => {
    if (person) {
      person.delete();
    } else {
      response.statusMessage = "Person not found";
    }
    response.status(204).end();
  });
});

// Create person
app.post(baseUrl, (request, response) => {
  const body = request.body;

  if (!body) {
    return response.status(400).json({error: "Content missing"});
  }
  if (!(body.name && body.number)) {
    return response.status(400).json({error: "Missing fields"});
  }
  Person.find({name: body.name}).then((result) => {
    if (result.length > 0) {
      return response.status(400).json({error: "Name must be unique"});
    }
    const person = new Person({
      name: body.name,
      number: body.number,
    });
    person.save().then((result) => {
      response.json(result);
    });
  });
});

// use endpoint middleware only AFTER all other endpoints
app.use(unknownEndpoint);

// Init port + listen
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
