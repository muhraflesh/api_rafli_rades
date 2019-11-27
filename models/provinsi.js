'use strict'

const response = require('../config/res')
const connection = require('../config/database')

exports.get = async function(req, res) {
    let date = new Date();
    let day = date.getUTCDate(), month = date.getUTCMonth()+1;
    let hours = date.getHours();
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()

    day < 10 ? day = 0 + "" + day : day;
    month < 10 ? month = 0 + "" + month : month;
    hours < 10 ? hours = 0 + "" + hours : hours;
    minutes < 10 ? minutes = 0 + "" + minutes : minutes;
    seconds < 10 ? seconds = 0 + "" + seconds : seconds;

    var date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

    var offset = !req.query.offset ? 0 : req.query.offset;
    var limit = !req.query.limit ? 'All' : req.query.limit;
    let q = []
    if (req.query.name) q.push(`LOWER(name) = LOWER('${req.query.name}')`)
    if (req.query.desc) q.push(`LOWER(type) LIKE LOWER('%${req.query.desc}%')`)
    if (q[0]) {
        q = "WHERE "+ q.toString()
        q = q.replace(","," AND ")
    } else {
        q = ""
    }
    const query = `SELECT * FROM role ${q} order by role_name offset ${offset} limit ${limit};`

    var token = req.headers.token
    if(!req.headers.token) {
        response.unauthor('Token Is Required', res)
    } else {
        connection.query(
            `SELECT token_expired FROM "user" WHERE "token"='${token}'`,
            async function (error, result, fields){
            if(error){
                console.log(error)
            } else if (result.rowCount == 0){
                response.unauthor('Your Token Is Not Match', res)
            } else if (date_now > result.rows[0].token_expired) {
                response.unauthor('Your Token Is Expired', res)
            } else {
                connection.query(query,
                    function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        var dataRole = []
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows[i];
                            var data_getRole = {
                                "id": row.role_id,
                                "name": row.role_name,
                                "description": row.role_description
                            }
                            dataRole.push(data_getRole)
                        }
                        limit = 'All' ? i : req.query.limit;
                        response.success_get(dataRole, offset, limit, i, res)
                    }
                });
            }
        });
    }
} 
    
exports.findByID = async function(req, res) {
    let date = new Date();
    let day = date.getUTCDate(), month = date.getUTCMonth()+1;
    let hours = date.getHours();
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()

    day < 10 ? day = 0 + "" + day : day;
    month < 10 ? month = 0 + "" + month : month;
    hours < 10 ? hours = 0 + "" + hours : hours;
    minutes < 10 ? minutes = 0 + "" + minutes : minutes;
    seconds < 10 ? seconds = 0 + "" + seconds : seconds;

    var date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    var role_id = req.params.id

    var token = req.headers.token
    if(!req.headers.token) {
        response.unauthor('Token Is Required', res)
    } else {
        connection.query(
            `SELECT token_expired FROM "user" WHERE "token"='${token}'`,
            async function (error, result, fields){
            if(error){
                console.log(error)
            } else if (result.rowCount == 0){
                response.unauthor('Your Token Is Not Match', res)
            } else if (date_now > result.rows[0].token_expired) {
                response.unauthor('Your Token Is Expired', res)
            } else {
                connection.query(`SELECT * FROM role where role_id='${role_id}'`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else if(result.rowCount == 0) {
                        response.not_found('Role Not Found', res)
                    } else{
                        var dataRole = []
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows[i];
                            var data_getRole = {
                                "id": row.role_id,
                                "name": row.role_name,
                                "description": row.role_description
                            }
                            dataRole.push(data_getRole)
                        }
                        response.success_getID(dataRole, res)
                    }
                });
            }
        });
    }
}

exports.getKabupaten = async function(req, res) {
    let date = new Date();
    let day = date.getUTCDate(), month = date.getUTCMonth()+1;
    let hours = date.getHours();
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()

    day < 10 ? day = 0 + "" + day : day;
    month < 10 ? month = 0 + "" + month : month;
    hours < 10 ? hours = 0 + "" + hours : hours;
    minutes < 10 ? minutes = 0 + "" + minutes : minutes;
    seconds < 10 ? seconds = 0 + "" + seconds : seconds;

    var date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    var role_id = req.params.id

    var token = req.headers.token
    if(!req.headers.token) {
        response.unauthor('Token Is Required', res)
    } else {
        connection.query(
            `SELECT token_expired FROM "user" WHERE "token"='${token}'`,
            async function (error, result, fields){
            if(error){
                console.log(error)
            } else if (result.rowCount == 0){
                response.unauthor('Your Token Is Not Match', res)
            } else if (date_now > result.rows[0].token_expired) {
                response.unauthor('Your Token Is Expired', res)
            } else {
                await connection.query(`select role_id from role where role_id='${role_id}'`, async function (error, result, fields){
                    if(result.rowCount == 0){
                        response.not_found('Role Not Found', res)
                    } else {
                        await connection.query(`select a.role_privileges_id, a.is_view, a.is_insert, a.is_update, a.is_delete, a.is_approval from role_privileges a left join role b on a.role_id=b.role_id where a.role_id='${role_id}'`, async function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else {
                                var dataPrivileges = []
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var row = result.rows[i];
                                        var data_getPrivileges = {
                                            "id": row.role_privileges_id,
                                            "isView": row.is_view,
                                            "isInsert": row.is_insert,
                                            "isUpdate": row.is_update,
                                            "isDelete": row.is_delete,
                                            "isApproval": row.is_approval
                                        }
                                        dataPrivileges.push(data_getPrivileges)
                                    }
                                response.success_getID(dataPrivileges, res)
                            }
                        })
                    }
                })
            }
        });
    }
}