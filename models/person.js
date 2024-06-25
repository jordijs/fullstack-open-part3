const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{2,3}-\d+$/.test(v);
      }, 
      message: props => `${props.value} is not a valid phone number`
    },
    minLength: 8,
    required: true
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})



// if (process.argv.length === 3) {
//   Person.find({}).then(result => {
//     result.forEach(person => {
//       console.log(person)
//     })
//     mongoose.connection.close()
//   })
// }

// if (process.argv.length === 5) {
//   const person = new Person({
//     name: process.argv[3],
//     number: process.argv[4]
//   })

//   person.save().then(result => {
//     console.log('Person saved succesfully with this data:')
//     console.log(result)
//     mongoose.connection.close()
//   })
// }

module.exports = mongoose.model('Person', personSchema)