const assert = require('assert')
const bodyParser = require('body-parser')
const express = require('express')
const faker = require('faker')
const request = require('supertest')
const uuid = require('uuid')

const resource = require('../src/index')

const neode = require('neode')
    .fromEnv()
    .withDirectory(__dirname +'/models')

const app = express()

app.use(bodyParser.json({ type: 'application/json', limit: '100MB' }))

const User = 'User';
const endpoint = '/api/users'
const order = 'name'
const indexed = 'email'

app.use(endpoint, resource(neode, User))

describe('@neode/express', () => {
    const batch = [
        { id: uuid.v4(), email: faker.internet.email(), name: faker.name.findName(), skills: [ { name: faker.name.jobArea() }, { name: faker.name.jobArea() } ], },
        { id: uuid.v4(), email: faker.internet.email(), name: faker.name.findName(), skills: [ { name: faker.name.jobArea() }, { name: faker.name.jobArea() } ], },
        { id: uuid.v4(), email: faker.internet.email(), name: faker.name.findName(), skills: [ { name: faker.name.jobArea() }, { name: faker.name.jobArea() } ], },
    ].sort((a, b) => a[ order ] < b[ order ] ? -1 : 1)

    before(() => {
        return Promise.all(batch.map(row => neode.create(User, row)))
    })

    after(() => {
        return neode.writeCypher('MATCH (n) DETACH DELETE n')
            .then(() => neode.close())
    })

    describe('GET /', () => {
        it('should list results', () => {
            return request(app)
                .get(endpoint)
                .then(response => {
                    assert.equal(response.status, 200)

                    assert.equal(response.body.length, batch.length)
                })
        })

        it('should apply a limit', () => {
            const limit = 1;

            return request(app)
                .get(`${endpoint}?order=${order}&limit=${limit}`)
                .then(response => {
                    assert.equal(response.status, 200)

                    assert.equal(response.body.length, limit)
                    assert.equal(response.body[0].id, batch[0].id)
                })
        })

        it('should apply a limit and a page', () => {
            const limit = 1;

            return request(app)
                .get(`${endpoint}?order=${order}&limit=${limit}`)
                .then(response => {
                    assert.equal(response.status, 200)

                    assert.equal(response.body.length, limit)
                    assert.equal(response.body[0].id, batch[0].id)
                })
        })

        it('should apply sorting', () => {
            const limit = 1;

            return request(app)
                .get(`${endpoint}?order=${order}&sort=desc&limit=${limit}`)
                .then(response => {
                    assert.equal(response.status, 200)

                    assert.equal(response.body.length, limit)
                    assert.equal(response.body[0].id, batch[2].id)
                })
        })

        it('should filter on an indexed property', () => {
            return request(app)
                .get(`${endpoint}?${indexed}=${ batch[0][ indexed ] }`)
                    .then(response => {
                        assert.equal(response.status, 200)

                        assert.equal(response.body.length, 1)
                        assert.equal(response.body[0].id, batch[0].id)
                    })
        })
    })

    describe('GET /:id', () => {
        it('should return not found if id doesn\'t exist', () => {
            return request(app)
                .get(`${endpoint}/not-found`)
                .then(response => {
                    assert.equal(response.status, 404)
                })
        })

        it('should return result', () => {
            return request(app)
            .get(`${endpoint}/${batch[0].id}`)
            .then(response => {
                assert.equal(response.status, 200)

                assert.equal(response.body.id, batch[0].id)
                assert.equal(response.body.email, batch[0].email)
                assert.equal(response.body.name, batch[0].name)

                const batchSkills = batch[0].skills.map(r => r.name).sort()
                const skills = response.body.skills.map(r => r.name).sort()

                assert.deepEqual(batchSkills, skills)

            })
            .catch(e => console.log(e))
        })
    });

    describe('POST /', () => {
        it('should return unprocessible entity on missing fields', () => {
            return request(app)
                .post(`${endpoint}`)
                .send({})
                .then(response => {
                    assert.equal(response.status, 422)
                })
        })

        it('should return created on success', () => {
            const data = {
                email: faker.internet.email(),
                name: faker.name.findName(),
                skills: [
                    { name: faker.name.jobArea() },
                    { name: faker.name.jobArea() }
                ],
                ignoreMe: true,
            };

            return request(app)
                .post(`${endpoint}`)
                .send(data)
                .then(response => {
                    assert.equal(response.status, 201)
                    assert.equal(response.body.email, data.email)
                    assert.equal(response.body.name, data.name)
                    assert.equal(response.body.ignoreMe, undefined)

                    const sent = data.skills.map(r => r.name).sort()
                    const received = response.body.skills.map(r => r.name).sort()

                    assert.deepEqual(received, sent)
                })
        })
    })

    describe('PUT /:id', () => {
        it('should return not found if id doesn\'t exist', () => {
            return request(app)
                .put(`${endpoint}/not-found`)
                .send({})
                .then(response => {
                    assert.equal(response.status, 404)
                })
        })

        it('should return unprocessible entity on missing fields', () => {
            const [ node ] = batch;

            return request(app)
                .put(`${endpoint}/${node.id}`)
                .send({
                    name: null,
                })
                .then(response => {
                    assert.equal(response.status, 422)
                })
        })
        it('should return accepted on success', () => {
            const [ node ] = batch;
            const data = {
                name: faker.name.findName(),
                ignoreMe: true,
            };

            return request(app)
                .put(`${endpoint}/${node.id}`)
                .send(data)
                .then(response => {
                    assert.equal(response.status, 202)

                    assert.equal(response.body.email, node.email)
                    assert.equal(response.body.name, data.name)
                    assert.equal(response.body.ignoreMe, undefined)
                })
        })
    })

    // describe('PATCH /:id', () => {
    //     it('TODO: should return not found if id doesn\'t exist', () => {})
    //     it('TODO: should return unprocessible entity on missing fields', () => {})
    //     it('TODO: should return accepted on success', () => {})
    // })

    describe('DELETE /:id', () => {
        it('should return not found if id doesn\'t exist', () => {
            return request(app)
                .delete(`${endpoint}/not-found`)
                .then(response => {
                    assert.equal(response.status, 404)
                })
        })
        it('should return accepted on success', () => {
            const [ node ] = batch;

            return request(app)
                .delete(`${endpoint}/${node.id}`)
                .then(response => {
                    assert.equal(response.status, 204)
                })
        })
    })
})