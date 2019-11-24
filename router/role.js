'use strict'

const router = require('express-promise-router')()
var Role = require('../models/role')

router.route("/")
    .get(Role.get)

router.route('/')
    .post(Role.post)

router.route('/:id')
    .get(Role.findByID)

router.route('/:id')
    .put(Role.put)

router.route('/:id')
    .delete(Role.delete)

router.route('/:id/privileges')
    .get(Role.getPrivileges)

router.route('/:id/privileges')
    .post(Role.postPrivileges)

router.route('/:id/privileges/:pid')
    .get(Role.getPrivilegesID)

router.route('/:id/privileges/:pid')
    .put(Role.putPrivilegesID)

router.route('/:id/privileges/:pid')
    .delete(Role.deletePrivilegesID)

module.exports = router