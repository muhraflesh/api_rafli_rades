const router = require('express-promise-router')()
var Authorization = require('../models/authorization')

router.route("/")
    .post(Authorization.signUp)

module.exports = router