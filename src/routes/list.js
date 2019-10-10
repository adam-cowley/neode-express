const { HTTP_SERVER_ERROR } = require('../constants')

/**
 * The list endpoint will return a paginated list of nodes.
 * The list can be filtered based on any property that is
 * listed in the model definition as an index, unique or
 * a primary key.  All you need to do is pass it as part
 * of the query string.
 */
module.exports = function list(neode, model, req, res) {
    // Build a list of filters
    const filters = [];

    model.properties().forEach(property => {
        if ( property.primary() || property.unique() || property.indexed() ) {
            filters.push( property.name() );
        }
    });

    const order_by = req.query.order || 'name';
    const sort = req.query.sort || 'ASC';
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const skip = (page-1) * limit;

    const params = {};
    const order = {[order_by]: sort};

    filters.map(key => {
        if ( req.query.hasOwnProperty(key) ) {
            params[ key ] = req.query[ key ];
        }
    });

    model.all(params, order, limit, skip)
        .then(res => {
            return res.toJson();
        })
        .then(json => {
            res.send(json);
        })
        .catch(e => {
            res.status(HTTP_SERVER_ERROR).send(e.stack);
        });
}