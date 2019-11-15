'use strict'

module.exports = function(app) {
    var Project = require('../models/project')
    var Sign = require('../models/sign')
    
    app.route('/project')
        .get(Project.get)

    app.route('/project')
        .post(Project.post)

    app.route('/project/:id')
        .get(Project.findByID)

    app.route('/project/:id')
        .put(Project.put)

    app.route('/project/:id')
        .delete(Project.delete)

    app.route('/project/:id/member')
        .get(Project.getMember)

    app.route('/project/:id/member')
        .post(Project.postMember)

}