const { HTTP_NOT_FOUND } = require('../constants');

module.exports = class NotFoundError extends Error {
    constructor(code) {
        super()

        this.code = HTTP_NOT_FOUND
        this.message = 'Resource Not Found'
    }
}
