'use strict'

const router = require('express-promise-router')()
var Authorization = require('../models/authorization')

router.route("/")
    .get(Authorization.generateToken)

module.exports = router