const router = require('express-promise-router')()
var Authorization = require('../models/authorization')

router.route("/")
    .post(Authorization.signIn)

module.exports = router