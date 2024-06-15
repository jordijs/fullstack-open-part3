const express = require('express')
var morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(morgan('tiny'))

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {

    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }

})

app.delete('/api/persons/:id', (request, response) => {

    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()

})

const generateId = () => {
    const max = 1000000000000000
    return Math.floor(Math.random() * max)
}

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

    const existingPerson = persons.find(person => person.name === name)
    if (existingPerson) {
        return response.status(409).json({
            error: 'This person already exists',
            person: existingPerson
        })
    }

    const person = {
        name: name,
        number: number,
        id: generateId()
    }

    persons = persons.concat(person)

    response.status(201).json(person)

})

app.get('/info', (request, response) => {

    const datetime = new Date()
    const entries = persons.length

    const html =
        `<p>Phonebook has info for ${entries} people</p>
        <p>${datetime}</p>`

    response.send(html)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})