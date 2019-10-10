const express = require('express')

const list = require('./routes/list')
const create = require('./routes/create')
const show = require('./routes/show')
const update = require('./routes/update')
const destroy = require('./routes/destroy')

function neodeExpress(neode, name) {
    const router = express.Router()

    const model = neode.model(name)

    if ( !model ) {
        throw new Error(`Couldn't find a definition for ${name}.  Did you use module.exports?`);
    }

    router.get('/', (req, res) => list(neode, model, req, res))
    router.post('/', (req, res) => create(neode, model, req, res))
    router.get('/:_id', (req, res) => show(neode, model, req, res))
    router.put('/:_id', (req, res) => update(neode, model, req, res))
    router.delete('/:_id', (req, res) => destroy(neode, model, req, res))

    return router
}

neodeExpress.list = list
neodeExpress.create = create
neodeExpress.show = show
neodeExpress.update = update
neodeExpress.destroy = destroy

module.exports = neodeExpress
