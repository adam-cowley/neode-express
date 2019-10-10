const { HTTP_NO_CONTENT, HTTP_SERVER_ERROR, } = require('../constants')
const NotFoundError = require('../errors/NotFoundError')

/**
 *A PUT request to `/{id}` will attempt to load the model
 with the primary key `{id}`, then delete it via neode -
 including any cascade deletion defined in the model.
 */
module.exports = function destroy(neode, model, req, res) {
    model.find(req.params._id)
        .then(node => {
            if ( !node ) {
                throw new NotFoundError;
            }

            return node.delete()
        })
        .then(() => res.status(HTTP_NO_CONTENT).send())
        .catch(e => res.status(e.code || HTTP_SERVER_ERROR).send(e))
}