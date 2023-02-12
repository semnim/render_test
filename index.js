// Import express
const express = require("express");
// Import morgan logger
const morgan = require("morgan");

// initialize app object
const app = express();
app.use(express.static("build"));

// initialize json parser for requests. request body => request.body
app.use(express.json());

// Allow cross origin resource sharing, so localhost:3000 (frontend) and
// localhost:3001 (backend) can communicate
const cors = require("cors");
app.use(cors());

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

// Mock-DB
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const baseUrl = "/api/persons";

// Get all
app.get(baseUrl, (request, response) => {
  response.json(persons);
});

// Get info
app.get("/info", (request, response) => {
  const msg =
    `<p>Phonebook has info for ${persons.length} people</p>` +
    `<p>${new Date()}</p>`;

  response.send(msg);
});

// Get person
app.get(`${baseUrl}/:id`, (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);

  if (!person) {
    return response.status(404).end();
  }
  response.json(person);
});

// Delete person
app.delete(`${baseUrl}/:id`, (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);
  persons = persons.filter((p) => p.id !== id);

  if (!person) {
    response.statusMessage = "Could not find person.";
  }
  response.status(204).end();
});

const generateId = () => {
  const MAX = 12345678;
  return Math.floor(Math.random() * MAX);
};
// Create person
app.post(baseUrl, (request, response) => {
  const body = request.body;

  if (!body) {
    return response.status(400).json({error: "Content missing"});
  }
  if (!(body.name && body.number)) {
    return response.status(400).json({error: "Missing fields"});
  }
  if (persons.find((p) => p.name.toLowerCase() === body.name.toLowerCase())) {
    return response.status(400).json({error: "Name must be unique"});
  }
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };
  persons = persons.concat(person);
  response.json(person);
});

// use endpoint middleware only AFTER all other endpoints
app.use(unknownEndpoint);

// Init port + listen
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
