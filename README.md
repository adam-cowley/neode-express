# @neode/express

The idea behind this repository is remove the CRUD boilerplate around [Express](https://expressjs.com/) applications interacting with [Neo4j](https://www.neo4j.com/) by providing a simple API to build [Resource Controller](https://laravel.com/docs/5.7/controllers#resource-controllers) around your [neode](https://github.com/adam-cowley/neode) models.


## Usage

With one extra dependency and one line of code, you can quickly add a set of REST endpoints.

Say for example, you have a graph of `(:User)`s and their `(:Skill)`s - you would have a models directory with two files:
- [User.js](https://github.com/adam-cowley/neode-express/blob/master/test/models/User.js)
- [Skill.js](https://github.com/adam-cowley/neode-express/blob/master/test/models/User.js)

Then index.js would look a little like this:

```js
const express = require('express')
const bodyParser = require('body-parser')

const neode = require('neode')
    .fromEnv()
    .withDirectory(__dirname +'/models')

const app = express()

app.use(bodyParser.json())
// ...
```

By adding two lines, you can create a set of REST endpoints that use the information defined in the Neo4j models to validate and process the requests.

```js
const resource = require('@neode/express')

app.use('/api/users', resource(neode, 'User'))
```

### The `resource` function

This takes two arguments, first your `neode` instance, and secondly the name of the model.  That's it.  You'll be able to `GET /api/users` to retrieve a list of User nodes, `POST /api/users` to create a new user, `GET /api/users/{primary key}` to view an individual resource `PUT /api/users/{primary key}` to update the node, and `DELETE /api/users/{primary key}` to delete the node.


## Endpoints

### `GET /` - List

The list endpoint will return a paginated list of nodes.  The list can be filtered based on any property that is listed in the model definition as an index, unique or a primary key.  All you need to do is pass it as part of the query string.


Key | Action | Notes
-- | -- | --
order | Property name to order by
sort | Order to return the records | `asc` or `desc`
limit | Number of records to return | Default is `10`
page | Page number to return | Offset is calculated as `page-1 * limit`

### `POST /` - Create

Posting to the root will attempt to create a node based on the neode model definition.  If any validation fails, the server wll return a 422 status code and an object including `details` - a list of the Joi validation errors.

This takes a combination of the post body and request params - so for example, you could define the primary key of the parent object into the URL.

```js
// Post.js
module.exports = {
    body: 'string',
    user: {
        type: 'node',
        target: 'User',
        relationship: 'POSTED',
        direction: 'in',
    },
}

// Resource
api.use('/api/users/:user/posts', resource(neode, 'Post'))

// Application call
axios.post('http://localhost:3000/api/users/user', { data: { content: 'Lorem ipsum' } })
```
This would take the `:user` value from the URL, combine it with `data` in the request and pass the info through to `neode.create()`.

### `GET /:id` Show

A GET request to `/{id}` will attempt to load the model with the primary key `{id}`.  The primary key is defined as the `primary: true` in the model definition.  The properties and relationships defined with `eager: true` will be returned as a JSON object.

### `PUT /:id` - Update

A PUT request to `/{id}` will attempt to load the model with the primary key `{id}`, then use a combination of the request params and post body to update the node.

### `DELETE /:id` - Destroy

A PUT request to `/{id}` will attempt to load the model with the primary key `{id}`, then delete it via neode - including any cascade deletion defined in the model.