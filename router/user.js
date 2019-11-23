'use strict'

const router = require('express-promise-router')()
var User = require('../models/user')

router.route("/")
    .get(User.get)

router.route('/')
    .post(User.post)

router.route('/:id')
    .get(User.findByID)

router.route('/:id')
    .put(User.put)

router.route('/:id')
    .delete(User.delete)

module.exports = router