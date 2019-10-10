const { HTTP_CREATED, HTTP_UNPROCESSABLE, HTTP_SERVER_ERROR, } = require('../constants')
/**
 * Posting to the root will attempt to create a node based on
 * the neode model definition. If any validation fails, the
 * server wll return a 422 status code and an object including
 * details - a list of the Joi validation errors.
 */
module.exports = function create(neode, model, req, res) {
    const data = Object.assign({}, req.params, req.body)

    model.create(data)
        .then(result => result.toJson())
        .then(json => res.status(HTTP_CREATED).json(json))
        .catch(e => res.status(e.details ? HTTP_UNPROCESSABLE : e.code || HTTP_SERVER_ERROR).send(e))
}