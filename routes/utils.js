const   csrf = require('csurf'),
        csrfProtection = csrf({ cookie: true }),
        asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);

module.exports = {
    csrfProtection,
    asyncHandler
}
