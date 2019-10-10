const { HTTP_SERVER_ERROR } = require('../constants')
const NotFoundError = require('../errors/NotFoundError')

/**
 * The list controller will optionally apply a set of filters
 * and then return a paginated list of results
 */
module.exports = function show(neode, model, req, res) {
    model.find(req.params._id)
        .then(result => {
            if ( !result ) {
                throw new NotFoundError()
            }

            return result.toJson()
        })
        .then(json => res.send(json))
        .catch(e => res.status(e.code || HTTP_SERVER_ERROR).send(e))
}