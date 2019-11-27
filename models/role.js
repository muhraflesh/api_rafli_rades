'use strict'

const response = require('../config/res')
const connection = require('../config/database')
const crypto = require('crypto')
const Joi = require('joi');

exports.get = function(req, res) {
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
    
exports.post = async function(req, res) {
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
    var role_id = crypto.createHash('sha1').update('Role' + date_now).digest('hex');
    // REQ DARI CLIENT
    var role_name = req.body.name
    var role_description = req.body.description

    const schema = Joi.object().keys({
        name: Joi.string().min(3).max(50).required(),
        description: Joi.string().min(2).max(100).required(),
    })

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
                await connection.query(`SELECT role_id from "user" where token='${token}'`, async function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        var role_id_checking = result.rows[0].role_id
                        await connection.query(`SELECT lower(a.role_name) from role a LEFT JOIN "user" b on a.role_id=b.role_id where a.role_id='${role_id_checking}'`, async function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else {
                                var role_name_checking = result.rows[0].lower
                                console.log(role_name_checking)
                                if(role_name_checking !== 'super_admin') {
                                    response.unauthor('You are not allowed to create role', res)
                                } else {
                                    await connection.query(`SELECT role_id from role where role_name='${role_name}';`, async function (error, result, fields){
                                        if(result.rowCount !== 0){
                                            response.conflict('Name have been used', res)
                                        } else {
                                            Joi.validate(req.body, schema, async function (err, value) { 
                                                if (err) {
                                                    response.bad_req(err.details[0].message, res)
                                                } else {
                                                    await connection.query(`INSERT INTO role(role_id, role_name, role_description) VALUES ('${role_id}', '${role_name}', '${role_description}')`, async function (error, result, fields){
                                                        if(!error){
                                                            await connection.query(`SELECT * from role where role_id='${role_id}'`, function (error, result, fields){
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
                                                                    response.success_post_put("Role have been create", dataRole, res)
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
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
 
exports.put = async function(req, res) {
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
    var name = req.body.name
    var description = req.body.description

    const schema = Joi.object().keys({
        name: Joi.string().min(3).max(50),
        description: Joi.string().min(2).max(100),
    })

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
                await connection.query(`SELECT role_id from "user" where token='${token}'`, async function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        var role_id_checking = result.rows[0].role_id
                        await connection.query(`SELECT lower(a.role_name) from role a LEFT JOIN "user" b on a.role_id=b.role_id where a.role_id='${role_id_checking}'`, async function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else {
                                var role_name_checking = result.rows[0].lower
                                if(role_name_checking !== 'super_admin') {
                                    response.unauthor('You are not allowed to update role', res)
                                } else {
                                    await connection.query(`SELECT role_id from role where role_name='${name}';`, async function (error, result, fields){
                                        if(result.rowCount !== 0){
                                            response.conflict('Name have been used', res)
                                        } else {
                                            Joi.validate(req.body, schema, async function (err, value) { 
                                                if (err) {
                                                    response.bad_req(err.details[0].message, res)
                                                } else {
                                                    await connection.query(`select role_id from role where role_id='${role_id}'`, async function (error, result, fields){
                                                        if(result.rowCount == 0){
                                                            response.not_found('Role Not Found', res)
                                                        } else {
                                                            let query = "UPDATE role SET "
                                                            let flag = false
                                                            if(name){
                                                                query = query + `role_name = '${name}'`
                                                                flag = true
                                                            }
                                                            if(description){
                                                                flag == true ? query = query + `, role_description = '${description}'` : query = query + `role_description = '${description}'`
                                                                flag = true
                                                            }
                                                            query = query + ` where role_id='${role_id}';`
                                                            console.log(query)
                                                
                                                            await connection.query(query, async function (error, result, fields){
                                                                if(!error){
                                                                    await connection.query(`SELECT * FROM role where role_id='${role_id}'`, function (error, result, fields){
                                                                        if(error){
                                                                            console.log(error)
                                                                        } else {
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
                                                                            response.success_post_put('Role have been update', dataRole, res)
                                                                        }
                                                                    });
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            }
        });
    }
}
    
exports.delete = function(req, res) {
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
                await connection.query(`SELECT role_id from "user" where token='${token}'`, async function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        var role_id_checking = result.rows[0].role_id
                        await connection.query(`SELECT lower(a.role_name) from role a LEFT JOIN "user" b on a.role_id=b.role_id where a.role_id='${role_id_checking}'`, async function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else {
                                var role_name_checking = result.rows[0].lower
                                if(role_name_checking !== 'super_admin') {
                                    response.unauthor('You are not allowed to delete role', res)
                                } else {
                                    connection.query(`DELETE FROM role WHERE role_id='${role_id}'`, function (error, result, fields){
                                        if(result.rowCount == 0){
                                            response.not_found('Role Not Found', res)
                                        } else{
                                            response.success_delete('Role Has Been Deleted', res)
                                        }
                                    });
                                }
                            }
                        })
                    }
                })
            }
        });
    }
}

exports.getPrivileges = async function(req, res) {
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

exports.postPrivileges = async function(req, res) {
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
    var privileges_id = crypto.createHash('sha1').update('Privileges' + date_now).digest('hex');
    
    // REQ DARI CLIENT
    var role_id = req.params.id
    var is_view = req.body.isView
    var is_insert = req.body.isInsert
    var is_update = req.body.isUpdate
    var is_delete = req.body.isDelete
    var is_approval = req.body.isApproval

    const schema = Joi.object().keys({
        isView: Joi.string().valid('1', '0').max(1).required(),
        isInsert: Joi.string().valid('1', '0').max(1).required(),
        isUpdate: Joi.string().valid('1', '0').max(1).required(),
        isDelete: Joi.string().valid('1', '0').max(1).required(),
        isApproval: Joi.string().valid('1', '0').max(1).required(),
    })

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
                await connection.query(`SELECT role_id from "user" where token='${token}'`, async function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        var role_id_checking = result.rows[0].role_id
                        await connection.query(`SELECT lower(a.role_name) from role a LEFT JOIN "user" b on a.role_id=b.role_id where a.role_id='${role_id_checking}'`, async function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else {
                                var role_name_checking = result.rows[0].lower
                                if(role_name_checking !== 'super_admin') {
                                    response.unauthor('You are not allowed to create role privileges', res)
                                } else {
                                    await connection.query(`select role_id from role where role_id='${role_id}'`, async function (error, result, fields){
                                        if(result.rowCount == 0){
                                            response.not_found('Role Not Found', res)
                                        } else {
                                            await connection.query(`select a.role_privileges_id from role_privileges a left join role b on a.role_id=b.role_id where a.role_id='${role_id}'`, async function (error, result, fields){
                                                if(result.rowCount !== 0){
                                                    response.bad_req('Role Have Privileges', res)
                                                } else {
                                                    Joi.validate(req.body, schema, async function (err, value) { 
                                                        if (err) {
                                                            response.bad_req(err.details[0].message, res)
                                                        } else {
                                                            await connection.query(`INSERT INTO role_privileges(role_privileges_id, is_view, is_insert, is_update, is_delete, is_approval, role_id) VALUES('${privileges_id}', '${is_view}', '${is_insert}', '${is_update}', '${is_delete}', '${is_approval}', '${role_id}');`, async function (error, result, fields){
                                                                if(error){
                                                                    console.log(error)
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
                                                                            response.success_post_put("Privilege have been create", dataPrivileges, res)
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    }); 
                                                }
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            }
        });
    }
}

exports.getPrivilegesID = async function(req, res) {
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
    var privileges_id = req.params.pid

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
                        await connection.query(
                            `select a.role_privileges_id, a.is_view, a.is_insert, a.is_update, a.is_delete, a.is_approval from role_privileges a left join role b on a.role_id=b.role_id where a.role_id='${role_id}' and a.role_privileges_id='${privileges_id}';`,
                            function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else if(result.rowCount == 0){
                                response.not_found('Privileges Not Found', res)
                            } else{
                                var dataPrivilegesID = []
                                for (var i = 0; i < result.rows.length; i++) {
                                    var row = result.rows[i];
                                    var data_getPrivilegesID = {
                                        "id": row.role_privileges_id,
                                        "isView": row.is_view,
                                        "isInsert": row.is_insert,
                                        "isUpdate": row.is_update,
                                        "isDelete": row.is_delete,
                                        "isApproval": row.is_approval
                                    }
                                    dataPrivilegesID.push(data_getPrivilegesID)
                                }
                                response.success_getID(dataPrivilegesID, res)
                            }
                        });    
                    }
                })
            }
        });
    }
}

exports.putPrivilegesID = async function(req, res) {
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
    var privileges_id = req.params.pid
    var is_view = req.body.isView
    var is_insert = req.body.isInsert
    var is_update = req.body.isUpdate
    var is_delete = req.body.isDelete
    var is_approval = req.body.isApproval

    const schema = Joi.object().keys({
        isView: Joi.string().valid('1', '0').max(1),
        isInsert: Joi.string().valid('1', '0').max(1),
        isUpdate: Joi.string().valid('1', '0').max(1),
        isDelete: Joi.string().valid('1', '0').max(1),
        isApproval: Joi.string().valid('1', '0').max(1),
    })

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
                await connection.query(`SELECT role_id from "user" where token='${token}'`, async function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        var role_id_checking = result.rows[0].role_id
                        await connection.query(`SELECT lower(a.role_name) from role a LEFT JOIN "user" b on a.role_id=b.role_id where a.role_id='${role_id_checking}'`, async function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else {
                                var role_name_checking = result.rows[0].lower
                                if(role_name_checking !== 'super_admin') {
                                    response.unauthor('You are not allowed to update role privileges', res)
                                } else {
                                    await connection.query(`select role_id from role where role_id='${role_id}'`, async function (error, result, fields){
                                        if(result.rowCount == 0){
                                            response.not_found('Role Not Found', res)
                                        } else {
                                            await connection.query(
                                                `select a.role_privileges_id from role_privileges a left join role b on a.role_id=b.role_id where a.role_id='${role_id}' and a.role_privileges_id='${privileges_id}';`,
                                                async function (error, result, fields){
                                                if(error){
                                                    console.log(error)
                                                } else if(result.rowCount == 0){
                                                    response.not_found('Privileges Not Found', res)
                                                } else {
                                                    Joi.validate(req.body, schema, async function (err, value) { 
                                                        if (err) {
                                                            response.bad_req(err.details[0].message, res)
                                                        } else {
                                                            let query = "UPDATE role_privileges SET "
                                                            let flag = false
                                                            if(is_view){
                                                                query = query + `is_view = '${is_view}'`
                                                                flag = true
                                                            }
                                                            if(is_insert){
                                                                flag == true ? query = query + `, is_insert = '${is_insert}'` : query = query + `is_insert = '${is_insert}'`
                                                                flag = true
                                                            }
                                                            if(is_update){
                                                                flag == true ? query = query + `, is_update = '${is_update}'` : query = query + `is_update = '${is_update}'`
                                                                flag = true
                                                            }
                                                            if(is_delete){
                                                                flag == true ? query = query + `, is_delete = '${is_delete}'` : query = query + `is_delete = '${is_delete}'`
                                                                flag = true
                                                            }
                                                            if(is_approval){
                                                                flag == true ? query = query + `, is_approval = '${is_approval}'` : query = query + `is_approval = '${is_approval}'`
                                                                flag = true
                                                            }
                                                            query = query + ` where role_privileges_id='${privileges_id}';`
                                                            console.log(query)
                                        
                                                            await connection.query(query, async function (error, result, fields){
                                                                if(!error){
                                                                    await connection.query(
                                                                        `select a.role_privileges_id, a.is_view, a.is_insert, a.is_update, a.is_delete, a.is_approval from role_privileges a left join role b on a.role_id=b.role_id where a.role_id='${role_id}' and a.role_privileges_id='${privileges_id}';`,
                                                                        function (error, result, fields){
                                                                        if(error){
                                                                            console.log(error)
                                                                        } else if(result.rowCount == 0){
                                                                            response.not_found('Privileges Not Found', res)
                                                                        } else{
                                                                            var dataPrivileges = []
                                                                            for (var i = 0; i < result.rows.length; i++) {
                                                                                var row = result.rows[i];
                                                                                var data_getPrivilegesID = {
                                                                                    "id": row.role_privileges_id,
                                                                                    "isView": row.is_view,
                                                                                    "isInsert": row.is_insert,
                                                                                    "isUpdate": row.is_update,
                                                                                    "isDelete": row.is_delete,
                                                                                    "isApproval": row.is_approval
                                                                                }
                                                                                dataPrivileges.push(data_getPrivilegesID)
                                                                            }
                                                                            response.success_post_put('Privilege have been update', dataPrivileges, res)
                                                                        }
                                                                    });
                                                                }
                                                            })
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            }
        });
    }
}

exports.deletePrivilegesID = async function(req, res) {
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
    var privileges_id = req.params.pid

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
                await connection.query(`SELECT role_id from "user" where token='${token}'`, async function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        var role_id_checking = result.rows[0].role_id
                        await connection.query(`SELECT lower(a.role_name) from role a LEFT JOIN "user" b on a.role_id=b.role_id where a.role_id='${role_id_checking}'`, async function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else {
                                var role_name_checking = result.rows[0].lower
                                if(role_name_checking !== 'super_admin') {
                                    response.unauthor('You are not allowed to delete role privileges', res)
                                } else {
                                    await connection.query(`select role_id from role where role_id='${role_id}'`, async function (error, result, fields){
                                        if(result.rowCount == 0){
                                            response.not_found('Role Not Found', res)
                                        } else {
                                            await connection.query(`SELECT a.role_privileges_id FROM role_privileges a left join role b on a.role_id=b.role_id where a.role_id='${role_id}' and a.role_privileges_id='${privileges_id}';`, async function (error, result, fields){
                                                if(result.rowCount == 0){
                                                    response.not_found('Privileges in this Role Not Found', res)
                                                } else {
                                                    await connection.query(`DELETE FROM role_privileges WHERE role_id='${role_id}' and role_privileges_id='${privileges_id}';`, function (error, result, fields){
                                                        if(error){
                                                            console.log(error)
                                                        } else if(result.rowCount == 0){
                                                            response.not_found('Privileges Not Found', res)
                                                        } else {
                                                            response.success_delete('Privileges have been delete', res)
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            }
        });
    }
}