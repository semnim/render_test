const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const uniqueValidator = require('mongoose-unique-validator');

const url = process.env.MONGODB_URI;

console.log('Connecting to', url);

mongoose
  .connect(url)
  .then(() => {
    console.log('Connected!');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB: ', err.message);
  });

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
