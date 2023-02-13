const personsRouter = require('express').Router();
const Person = require('../models/person');

// Get all
personsRouter.get('/', (_request, response) => {
  Person.find({}).then((persons) => response.json(persons));
});

// Get info
personsRouter.get('/info', (_request, response) => {
  Person.find({}).then((persons) => {
    const msg =
      `<p>Phonebook has info for ${persons.length}   people</p>` +
      `<p>${new Date()}  </p>`;

    response.send(msg);
  });
});

// Get person
personsRouter.get('/:id', (request, response, next) => {
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
personsRouter.delete('/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((err) => next(err));
});

// Create person
personsRouter.post('/', (request, response, next) => {
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

personsRouter.put('/:id', (request, response, next) => {
  const person = {
    name: request.body.name,
    number: request.body.number,
  };
  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedPerson) => {
      if (!updatedPerson) {
        return response.status(400).send();
      }
      response.json(updatedPerson);
    })
    .catch((err) => next(err));
});

module.exports = personsRouter;
