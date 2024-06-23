require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('postData', (request, response) => {
    return request.method === 'POST' ? JSON.stringify(request.body) : null
})

app.use(
    morgan((tokens, request, response) => {
        const tokensArray = [
            tokens.method(request, response),
            tokens.url(request, response),
            tokens.status(request, response),
            tokens.res(request, response, 'content-length'), '-',
            tokens['response-time'](request, response), 'ms'
        ]
        if (request.method === 'POST') {
            tokensArray.push(tokens.postData(request, response))
        }
        return tokensArray.join(' ')
    })
)

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end()
    })
})

app.post('/api/persons', (request, response) => {
    const { name, number } = request.body
    const validatePerson = (name, number) => {
        if (!name && !number) return 'It is required to send a name and a number.'
        if (!name) return 'It is required to send a name.'
        if (!number) return 'It is required to send a number.'
        return null
    }
    const errorMessage = validatePerson(name, number)
    if (errorMessage) {
        return response.status(422).json({ error: errorMessage })
    }

    // const existingPerson = persons.find(person => person.name === name)
    // if (existingPerson) {
    //     return response.status(409).json({
    //         error: 'This person already exists',
    //         person: existingPerson
    //     })
    // 

    const person = new Person({
        name: name,
        number: number,
    })
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

// app.get('/info', (request, response) => {
//     const datetime = new Date()
//     const entries = persons.length
//     const html =
//         `<p>Phonebook has info for ${entries} people</p>
//         <p>${datetime}</p>`
//     response.send(html)
// })

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})