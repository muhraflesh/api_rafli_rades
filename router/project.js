'use strict'

const router = require('express-promise-router')()
var Project = require('../models/project')

router.route("/")
    .get(Project.get)

router.route('/')
    .post(Project.post)

router.route('/:id')
    .get(Project.findByID)

router.route('/:id')
    .put(Project.put)

router.route('/:id')
    .delete(Project.delete)

router.route('/:id/member')
    .get(Project.getMember)

router.route('/:id/member')
    .post(Project.postMember)

module.exports = router