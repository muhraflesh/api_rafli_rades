'use strict'

exports.success_get = function(rows, offset, limit, total, res) {
    var data = {
        'status': 200,
        'offset': offset,
        'limit': limit,
        'total': total,
        'data': rows
    }
    res.json(data)
    res.end()
}

exports.success_getID = function(rows, res) {
    var data = {
        'status': 200,
        'data': rows
    }
    res.json(data)
    res.end()
}

exports.success_post_put = function(message, values, res) {
    var data = {
        'status': 200,
        'message': message,
        'data': values
    }
    res.json(data)
    res.end()
}

exports.success_delete = function(values, res) {
    var data = {
        'status': 200,
        'message': values
    }
    res.json(data)
    res.end()
}

exports.success_generateToken = function(values, res) {
    var data = {
        'status': 200,
        'data': values
    }
    res.json(data)
    res.end()
}

exports.bad_req = function(values, res) {
    var data = {
        'code': 400,
        'status': 'Bad Request',
        'message': values
    }
    res.json(data)
    res.end()
}

exports.unauthor = function(values, res) {
    var data = {
        'code': 401,
        'message': values
    }
    res.json(data)
    res.end()
}

exports.not_found = function(values, res) {
    var data = {
        'code': 404,
        'message': values
    }
    res.json(data)
    res.end()
}

exports.conflict = function(values, res) {
    var data = {
        'code': 409,
        'message': values
    }
    res.json(data)
    res.end()
}

exports.server_error = function(values, res) {
    var data = {
        'code': 500,
        'message': values
    }
    res.json(data)
    res.end()
}