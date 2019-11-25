const router = require('express-promise-router')()
var Authorization = require('../models/authorization')

router.route("/")
    .get(Authorization.verification)

module.exports = router