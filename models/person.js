const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
    unique: true,
  },
  number: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\d{8,}|^\d{2}-\d{6,}|^\d{3}-\d{5,}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    minLength: 8,
    required: [true, 'Phone number required'],
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});
personSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Person', personSchema);
