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

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const { name, number } = request.body

    //Validate JSON fields
    const validatePerson = (name, number) => {
        if (!name && !number) return 'It is required to send a name and a number.'
        if (!name) return 'It is required to send a name.'
        if (!number) return 'It is required to send a number.'
        return null
    }
    const errorMessage = validatePerson(name, number)
    if (errorMessage) {
        return response.status(400).json({ error: errorMessage })
    }

    //Check if person exists
    Person.findOne({ name: name }).exec()
        .then(existingPerson => {
            if (existingPerson) {
                return response.status(409).json({
                    error: 'This person already exists',
                    person: existingPerson
                })
            } else {
                const person = new Person({
                    name: name,
                    number: number,
                })
                person.save()
                    .then(savedPerson => {
                        response.json(savedPerson)
                    })
                    .catch(error => next(error))
            }
        })

})

app.put('/api/persons/:id', (request, response, next) => {

    const id = request.params.id
    const { name, number } = request.body

    Person.findByIdAndUpdate(
        id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedPerson => {
            if (!updatedPerson) {
                const error = new Error(`Person with id ${id} not found`);
                error.name = 'PersonNotFoundError';
                throw error;
            }
            response.json(updatedPerson)
        })
        .catch(error => next(error))

})

app.get('/info', (request, response) => {
    const datetime = new Date()
    Person.find({}).then(persons => {
        const entries = persons.length
        const html =
            `<p>Phonebook has info for ${entries} people</p>
            <p>${datetime}</p>`
        response.send(html)
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {

    console.error(error.message)

    if (error.name === 'SyntaxError') {
        return response.status(400).send({ error: 'incorrect JSON format' })
    } else if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    } else if (error.name === 'PersonNotFoundError') {
        return response.status(404).send({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})