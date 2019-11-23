'use strict'

const router = require('express-promise-router')()
var Document = require('../models/document')

router.route("/")
    .get(Document.get)

router.route('/')
    .post(Document.post)

router.route('/:id')
    .get(Document.findByID)

router.route('/:id')
    .delete(Document.delete)

module.exports = router