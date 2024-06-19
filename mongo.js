const mongoose = require('mongoose')

if (process.argv.length <= 2) {
  console.log('Please enter a password.')
  process.exit(1)
}

if (process.argv.length === 4) {
  console.log('Please enter a name and a number.')
  process.exit(1)
}

if (process.argv.length > 5) {
  console.log('Too many arguments. Please follow this structure: <password> <name> <number>. If the name contains whitespace characters, it must be enclosed in quotes')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.u71xgdb.mongodb.net/phonebook?retryWrites=true&w=majority`
mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
}

if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then(result => {
    console.log('Person saved succesfully with this data:')
    console.log(result)
    mongoose.connection.close()
  })
}