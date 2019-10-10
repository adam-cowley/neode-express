const { HTTP_ACCEPTED, HTTP_UNPROCESSABLE, HTTP_SERVER_ERROR, } = require('../constants')
const NotFoundError = require('../errors/NotFoundError')

/**
 * A PUT request to `/{id}` will attempt to load the model with
 * the primary key `{id}`, then use a combination of the request
 * params and post body to update the node.
 */
module.exports = function destroy(neode, model, req, res) {
    const data = Object.assign({}, req.params, req.body)

    model.find(req.params._id)
        .then(node => {
            if ( !node ) {
                throw new NotFoundError;
            }

            return node.update(data)
        })
        .then(node => node.toJson())
        .then(json => res.status(HTTP_ACCEPTED).send(json))
        .catch(e => res.status(e.details ? HTTP_UNPROCESSABLE : e.code || HTTP_SERVER_ERROR).send(e))
}
