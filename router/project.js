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

router.route('/:id/member/:mid')
    .get(Project.getMemberID)

router.route('/:id/member/:mid')
    .put(Project.putMemberID)

router.route('/:id/member/:mid')
    .delete(Project.deleteMemberID)

router.route('/:id/member/:mid/document')
    .get(Project.getMemberDoc)

router.route('/:id/member/:mid/document')
    .post(Project.postMemberDoc)

router.route('/:id/member/:mid/document/:did')
    .get(Project.getMemberDocID)

router.route('/:id/member/:mid/document/:did')
    .delete(Project.deleteMemberDocID)

module.exports = router