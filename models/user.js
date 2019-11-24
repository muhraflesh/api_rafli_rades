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
                if(req.query.name || req.query.mail || req.query.phone || req.query.cnum || req.query.gender) {
                    connection.query(
                        `SELECT user_id, firstname, lastname, username, email, telephone, card_member, card_number, gender, birth_date, is_active, is_login, create_date, update_date, role_id FROM "user" WHERE LOWER(firstname) LIKE LOWER('%${req.query.name}%') or LOWER(lastname) LIKE LOWER('%${req.query.name}%') or LOWER(username) LIKE LOWER('%${req.query.name}%') or telephone LIKE '%${req.query.phone}%' or LOWER(email) LIKE LOWER('%${req.query.mail}%') or LOWER(card_number) LIKE LOWER('%${req.query.cnum}%') or LOWER(gender) LIKE LOWER('%${req.query.gender}%') order by firstname offset ${offset} limit ${limit}`,
                        function (error, result, fields){
                        if(error){
                            console.log(error)
                        } else{
                            var dataMember = []
                            for (var i = 0; i < result.rows.length; i++) {
                                var row = result.rows[i];
                                var data_getMember = {
                                    "id": row.user_id,
                                    "firstName": row.firstname,
                                    "lastName": row.lastname,
                                    "userName": row.username,
                                    "mail": row.email,
                                    "phone": row.telephone,
                                    "cardMember": row.card_member,
                                    "cardNumber": row.card_number,
                                    "gender": row.gender,
                                    "birthDate": row.birth_date,
                                    "isActive": row.is_active,
                                    "isLogin": row.is_login,
                                    "createDate": row.create_date,
                                    "updateDate": row.update_date,
                                    "roleId": row.role_id
                                }
                                dataMember.push(data_getMember)
                            }
        
                            response.success_get(dataMember, offset, limit, i, res)
                        }
                    });
            } else {
                connection.query(`SELECT user_id, firstname, lastname, username, email, telephone, card_member, card_number, gender, birth_date, is_active, is_login, create_date, update_date, role_id FROM "user" offset ${offset} limit ${limit};`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        var dataMember = []
                        for (var i = 0; i < result.rows.length; i++) {
                                var row = result.rows[i];
                                var data_getMember = {
                                    "id": row.user_id,
                                    "firstName": row.firstname,
                                    "lastName": row.lastname,
                                    "userName": row.username,
                                    "mail": row.email,
                                    "phone": row.telephone,
                                    "cardMember": row.card_member,
                                    "cardNumber": row.card_number,
                                    "gender": row.gender,
                                    "birthDate": row.birth_date,
                                    "isActive": row.is_active,
                                    "isLogin": row.is_login,
                                    "createDate": row.create_date,
                                    "updateDate": row.update_date,
                                    "roleId": row.role_id
                                }
                                dataMember.push(data_getMember)
                        }
        
                        response.success_get(dataMember, offset, limit, i, res)
                    }
                });
            }
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

    // REQ DARI CLIENT
    var firstname = req.body.firstName
    var lastname = req.body.lastName
    var username = req.body.userName
    var password = req.body.password
    var mail = req.body.mail
    var phone = req.body.phone
    var card_member = req.body.cardMember
    var card_number = req.body.cardNumber
    var gender = req.body.gender
    var birthdate = req.body.birthDate
    var role_id = req.body.roleId

    var user_id = crypto.createHash('sha1').update('User/Member' + date_now + '' + mail).digest('hex');

    const schema = Joi.object().keys({
        firstName: Joi.string().alphanum().min(2).max(50).required(),
        lastName: Joi.string().alphanum().min(2).max(50).required(),
        userName: Joi.string().token().strip().min(3).max(30).required(),
        password: Joi.string().regex(/^[a-zA-Z0-9!*#$%_&]{3,30}$/).required(),
        mail: Joi.string().email({ minDomainAtoms: 2 }).required(),
        phone: Joi.number().integer().required(),
        cardMember: Joi.string().valid('y', 'n').max(1).required(),
        cardNumber: Joi.number().integer().required(),
        gender: Joi.string().max(10).required(),
        birthDate: Joi.required(),
        roleId: Joi.required(),
    })

    // Joi.validate(req.body, schema, async function (err, value) { 
    //     if (err) {
    //         console.log(err.details[0].message)
    //     } else {
    //         console.log('SUKSES')
    //     }
    // });

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
                await connection.query(`SELECT user_id from "user" where email='${mail}';`, async function (error, result, fields){
                    if(result.rowCount !== 0){
                        response.conflict('Email have been used', res)
                    } else {
                        await connection.query(`SELECT user_id from "user" where username='${username}';`, async function (error, result, fields){
                            if(result.rowCount !== 0){
                                response.conflict('Username have been used', res)
                            } else {
                                await connection.query(`SELECT user_id from "user" where telephone='${phone}';`, async function (error, result, fields){
                                    if(result.rowCount !== 0){
                                        response.conflict('Telephone have been used', res)
                                    } else {
                                        Joi.validate(req.body, schema, async function (err, value) { 
                                            if (err) {
                                                response.bad_req(err.details[0].message, res)
                                            } else {
                                                await connection.query(`INSERT INTO "user" (user_id, firstname, lastname, username, password, email, telephone, card_member, card_number, gender, birth_date, role_id, create_date, update_date) VALUES ('${user_id}', '${firstname}', '${lastname}', '${username}', '${password}', '${mail}', '${phone}', '${card_member}', '${card_number}', '${gender}', '${birthdate}', '${role_id}', '${date_now}', '${date_now}');`, function (error, result, fields){
                                                    if(error){
                                                        console.log(error)
                                                    } else {
                                                        connection.query(`SELECT user_id, firstname, lastname, username, email, telephone, card_member, card_number, gender, birth_date, is_active, is_login, create_date, update_date, role_id FROM "user" where user_id='${user_id}';`, function (error, result, fields){
                                                            if(error){
                                                                console.log(error)
                                                            } else{
                                                                var dataMember = []
                                                                for (var i = 0; i < result.rows.length; i++) {
                                                                    var row = result.rows[i];
                                                                    var data_getMember = {
                                                                        "id": row.user_id,
                                                                        "firstName": row.firstname,
                                                                        "lastName": row.lastname,
                                                                        "userName": row.username,
                                                                        "mail": row.email,
                                                                        "phone": row.telephone,
                                                                        "cardMember": row.card_member,
                                                                        "cardNumber": row.card_number,
                                                                        "gender": row.gender,
                                                                        "birthDate": row.birth_date,
                                                                        "isActive": row.is_active,
                                                                        "isLogin": row.is_login,
                                                                        "createDate": row.create_date,
                                                                        "updateDate": row.update_date,
                                                                        "roleId": row.role_id
                                                                    }
                                                                    dataMember.push(data_getMember)
                                                                }
                                                                response.success_post_put("User have been create", dataMember, res)
                                                            }
                                                        });
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
        });
    }   
}
    
exports.findByID = function(req, res) {
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
    var user_id = req.params.id

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
                connection.query(`SELECT user_id, firstname, lastname, username, email, telephone, card_member, card_number, gender, birth_date, is_active, is_login, create_date, update_date, role_id FROM "user" where user_id='${user_id}'`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else if(result.rowCount == 0) {
                        response.not_found('User Not Found', res)
                    } else{
                        var dataMember = []
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows[i];
                            var data_getMember = {
                                "id": row.user_id,
                                "firstName": row.firstname,
                                "lastName": row.lastname,
                                "userName": row.username,
                                "mail": row.email,
                                "phone": row.telephone,
                                "cardMember": row.card_member,
                                "cardNumber": row.card_number,
                                "gender": row.gender,
                                "birthDate": row.birth_date,
                                "isActive": row.is_active,
                                "isLogin": row.is_login,
                                "createDate": row.create_date,
                                "updateDate": row.update_date,
                                "roleId": row.role_id
                            }
                            dataMember.push(data_getMember)
                        }
                        response.success_getID(dataMember, res)
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
    var user_id = req.params.id
    
    var firstname = req.body.firstName
    var lastname = req.body.lastName
    var username = req.body.userName
    var password = req.body.password
    var email = req.body.mail
    var phone = req.body.phone
    var card_member = req.body.cardMember
    var card_number = req.body.cardNumber
    var gender = req.body.gender
    var birth_date = req.body.birthDate
    var role_id = req.body.roleId
    
    const schema = Joi.object().keys({
        firstName: Joi.string().alphanum().min(2).max(50),
        lastName: Joi.string().alphanum().min(2).max(50),
        userName: Joi.string().token().strip().min(3).max(30),
        password: Joi.string().regex(/^[a-zA-Z0-9!*#$%_&]{3,30}$/),
        mail: Joi.string().email({ minDomainAtoms: 2 }),
        phone: Joi.number().integer(),
        cardMember: Joi.string().valid('y', 'n').max(1),
        cardNumber: Joi.number().integer(),
        gender: Joi.string().max(10),
        birthDate: Joi,
        roleId: Joi,
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
                await connection.query(`select user_id from "user" where user_id='${user_id}'`, async function (error, result, fields){
                    if(result.rowCount == 0){
                        response.not_found('User Not Found', res)
                    } else {
                        await connection.query(`SELECT user_id from "user" where email='${email}';`, async function (error, result, fields){
                            if(result.rowCount !== 0){
                                response.conflict('Email have been used', res)
                            } else {
                                await connection.query(`SELECT user_id from "user" where username='${username}';`, async function (error, result, fields){
                                    if(result.rowCount !== 0){
                                        response.conflict('Username have been used', res)
                                    } else {
                                        await connection.query(`SELECT user_id from "user" where telephone='${phone}';`, async function (error, result, fields){
                                            if(result.rowCount !== 0){
                                                response.conflict('Telephone have been used', res)
                                            } else {
                                                Joi.validate(req.body, schema, async function (err, value) { 
                                                    if (err) {
                                                        response.bad_req(err.details[0].message, res)
                                                    } else {
                                                        let query = `UPDATE "user" SET `
                                                        let flag = false
                                                        if(firstname){
                                                            query = query + `firstname = '${firstname}'`
                                                            flag = true
                                                        }
                                                        if(lastname){
                                                            flag == true ? query = query + `, lastname = '${lastname}'` : query = query + `lastname = '${lastname}'`
                                                            flag = true
                                                        }
                                                        if(username){
                                                            flag == true ? query = query + `, username = '${username}'` : query = query + `username = '${username}'`
                                                            flag = true
                                                        }
                                                        if(password){
                                                            flag == true ? query = query + `, password = '${password}'` : query = query + `password = '${password}'`
                                                            flag = true
                                                        }
                                                        if(email){
                                                            flag == true ? query = query + `, email = '${email}'` : query = query + `email = '${email}'`
                                                            flag = true
                                                        }
                                                        if(phone){
                                                            flag == true ? query = query + `, telephone = '${phone}'` : query = query + `telephone = '${phone}'`
                                                            flag = true
                                                        }
                                                        if(card_member){
                                                            flag == true ? query = query + `, card_member = '${card_member}'` : query = query + `card_member = '${card_member}'`
                                                            flag = true
                                                        }
                                                        if(card_number){
                                                            flag == true ? query = query + `, card_number = '${card_number}'` : query = query + `card_number = '${card_number}'`
                                                            flag = true
                                                        }
                                                        if(gender){
                                                            flag == true ? query = query + `, gender = '${gender}'` : query = query + `gender = '${gender}'`
                                                            flag = true
                                                        }
                                                        if(birth_date){
                                                            flag == true ? query = query + `, birth_date = '${birth_date}'` : query = query + `birth_date = '${birth_date}'`
                                                            flag = true
                                                        }
                                                        if(role_id){
                                                            flag == true ? query = query + `, role_id = '${role_id}'` : query = query + `role_id = '${role_id}'`
                                                            flag = true
                                                        }
                                                        query = query + `, update_date = '${date_now}' where user_id='${user_id}';`
                                                        console.log(query)
                                            
                                                        await connection.query(query, async function (error, result, fields){
                                                            if(!error){
                                                                connection.query(`SELECT user_id, firstname, lastname, username, email, telephone, card_member, card_number, gender, birth_date, is_active, is_login, create_date, update_date, role_id FROM "user" where user_id='${user_id}'`, function (error, result, fields){
                                                                    if(error){
                                                                        console.log(error)
                                                                    } else if(result.rowCount == 0) {
                                                                        response.not_found('User Not Found', res)
                                                                    } else{
                                                                        var dataMember = []
                                                                        for (var i = 0; i < result.rows.length; i++) {
                                                                            var row = result.rows[i];
                                                                            var data_getMember = {
                                                                                "id": row.user_id,
                                                                                "firstName": row.firstname,
                                                                                "lastName": row.lastname,
                                                                                "userName": row.username,
                                                                                "mail": row.email,
                                                                                "phone": row.telephone,
                                                                                "cardMember": row.card_member,
                                                                                "cardNumber": row.card_number,
                                                                                "gender": row.gender,
                                                                                "birthDate": row.birth_date,
                                                                                "isActive": row.is_active,
                                                                                "isLogin": row.is_login,
                                                                                "createDate": row.create_date,
                                                                                "updateDate": row.update_date,
                                                                                "roleId": row.role_id
                                                                            }
                                                                            dataMember.push(data_getMember)
                                                                        }
                                                                        response.success_post_put('User have been update', data_getMember, res)
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
                        })
                    }
                });
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
    var user_id = req.params.id
    
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
                connection.query(`DELETE FROM "user" WHERE user_id='${user_id}'`, function (error, result, fields){
                    if(result.rowCount == 0){
                        response.not_found('User Not Found', res)
                    } else{
                        response.success_delete('User Has Been Deleted', res)
                    }
                });
            }
        });
    }
}