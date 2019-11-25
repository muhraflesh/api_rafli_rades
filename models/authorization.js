'use strict'

const response = require('../config/res')
const connection = require('../config/database')
const crypto = require('crypto')
const Joi = require('joi');
const nodemailer = require("nodemailer");
const email_verification = require('../config/config.json').email
const password_email_verification = require('../config/config.json').password_email
const sercive_email_verification = require('../config/config.json').service_email
const link_verification = require('../config/config.json').link_verification

exports.generateToken = function(req, res) {
    
    let date = new Date();
    let day = date.getUTCDate(), month = date.getUTCMonth()+1;
    let hours = date.getHours()+1;
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()

    day < 10 ? day = 0 + "" + day : day;
    month < 10 ? month = 0 + "" + month : month;
    hours < 10 ? hours = 0 + "" + hours : hours;
    minutes < 10 ? minutes = 0 + "" + minutes : minutes;
    seconds < 10 ? seconds = 0 + "" + seconds : seconds;

    var token_expired = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    console.log(token_expired)

    var apikey = req.headers.apikey
    var apisecret = req.headers.apisecret
    var apitoken = crypto.createHash('sha1').update(apikey + apisecret).digest('hex');
    console.log(apitoken)

    connection.query(
    `SELECT user_id FROM "user" WHERE apisecret='${apisecret}' AND apikey='${apikey}'`,
    async function (error, result, fields){
        if(error){
            console.log(error)
        } else if(result.rowCount == 0) {
            response.bad_req('Your Apikey or Apisecret is False', res)
        } else {
            await connection.query(`UPDATE "user" SET "token"='${apitoken}', token_expired='${token_expired}' where apikey='${apikey}' and apisecret='${apisecret}';`, function (error, result, fields){
                if(error){
                    console.log(error)
                } else {
                    connection.query(
                    `SELECT "token", token_expired FROM "user" WHERE apisecret='${apisecret}' AND apikey='${apikey}'`,
                    async function (error, result, fields){
                        if(error){
                            console.log(error)
                        } else {
                            var dataToken = [{
                                "token": result.rows[0].token,
                                "tokenExpired": result.rows[0].token_expired
                            }]
                            response.success_generateToken(dataToken, res)
                        }
                    });
                }
            })
        }
    });
}

exports.signUp = async function(req, res) {
    let date = new Date();
    let day = date.getUTCDate(), month = date.getUTCMonth()+1;
    let hours = date.getHours();
    let hours_expired = date.getHours()+1;
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
    
    day < 10 ? day = 0 + "" + day : day;
    month < 10 ? month = 0 + "" + month : month;
    hours < 10 ? hours = 0 + "" + hours : hours;
    hours_expired < 10 ? hours_expired = 0 + "" + hours_expired : hours_expired;
    minutes < 10 ? minutes = 0 + "" + minutes : minutes;
    seconds < 10 ? seconds = 0 + "" + seconds : seconds;

    var date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

    var username = req.body.username
    var email = req.body.email
    var telephone
    req.body.phone ? telephone = req.body.phone : telephone = null
    var user_id = crypto.createHash('sha1').update('User/Member' + date_now + '' + username).digest('hex');
    var verification_id = crypto.createHash('sha1').update('Verification' + date_now).digest('hex');
    var verification_hash = crypto.createHash('sha1').update('Verification-Hash' + date_now).digest('hex');
    var verification_expired = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours_expired + ":" + minutes + ":" + seconds;
    var verification_status = '0'

    const schema = Joi.object().keys({
        username: Joi.string().token().strip().min(3).max(30).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        phone: Joi.number().integer()
    })
    
    var smtpTransport = nodemailer.createTransport({
        service: sercive_email_verification,
        auth: {
            user: email_verification,
            pass: password_email_verification
        }
    });
    var link= link_verification + verification_hash;
    var mailOptions = {
        to : email,
        subject : "Please confirm your Email account",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
    }

    await connection.query(`SELECT user_id from "user" where email='${email}';`, async function (error, result, fields){
        if(result.rowCount !== 0){
            response.conflict('Email have been used', res)
        } else {
            await connection.query(`SELECT user_id from "user" where username='${username}';`, async function (error, result, fields){
                if(result.rowCount !== 0){
                    response.conflict('Username have been used', res)
                } else {
                    await connection.query(`SELECT user_id from "user" where telephone='${telephone}';`, async function (error, result, fields){
                        if(result.rowCount !== 0){
                            response.conflict('Phone have been used', res)
                        } else {
                            Joi.validate(req.body, schema, async function (err, value) { 
                                if (err) {
                                    response.bad_req(err.details[0].message, res)
                                } else {
                                    await connection.query(`INSERT INTO "user" (user_id, username, email, telephone, create_date, update_date, verification_id) VALUES ('${user_id}', '${username}', '${email}', '${telephone}', '${date_now}', '${date_now}', '${verification_id}');`, async function (error, result, fields){
                                        if(error){
                                            console.log(error)
                                        } else {
                                            await connection.query(`INSERT INTO verification (verification_id, verification_hash, verification_expired, verification_status, create_date, update_date) VALUES ('${verification_id}', '${verification_hash}', '${verification_expired}', '${verification_status}', '${date_now}', '${date_now}');`, function (error, result, fields){
                                                if(error){
                                                    console.log(error)
                                                } else {
                                                    smtpTransport.sendMail(mailOptions, function(error){
                                                        if(error){
                                                            console.log(error);
                                                            res.end("error");
                                                        } else { 
                                                            response.success_getID('Registration have been success, please check your email to verification', res)
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
    })
}

exports.verification = async function(req, res) {
    let date = new Date();
    let day = date.getUTCDate(), month = date.getUTCMonth()+1;
    let hours = date.getHours();
    let hours_expired = date.getHours()+1;
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
    
    day < 10 ? day = 0 + "" + day : day;
    month < 10 ? month = 0 + "" + month : month;
    hours < 10 ? hours = 0 + "" + hours : hours;
    hours_expired < 10 ? hours_expired = 0 + "" + hours_expired : hours_expired;
    minutes < 10 ? minutes = 0 + "" + minutes : minutes;
    seconds < 10 ? seconds = 0 + "" + seconds : seconds;

    var date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    var verification_hash = req.query.hash
    var apikey = crypto.createHash('sha1').update('APIKEY' + date_now).digest('hex')
    var apisecret = crypto.createHash('sha1').update('APISECRET' + date_now).digest('hex')
    var apitoken = crypto.createHash('sha1').update(apikey + apisecret).digest('hex');
    var token_expired = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours_expired + ":" + minutes + ":" + seconds;

    await connection.query(`SELECT verification_expired, verification_id FROM verification WHERE verification_hash = '${verification_hash}';`, async function (error, result, fields){
        if(error){
            console.log(error)
        } else if (result.rowCount == 0) {
            response.unauthor('Your verification is expired', res)
        } else if (date_now > result.rows[0].verification_expired) {
            response.unauthor('Your verification is expired', res)
        } else {
            var verification_id = result.rows[0].verification_id
            
            await connection.query(`UPDATE verification SET verification_status='1', update_date='${date_now}'`, async function (error, result, fields){
                if(error) {
                    console.log(error)
                } else {
                    await connection.query(`SELECT a.user_id FROM "user" a LEFT JOIN verification b on a.verification_id = b.verification_id WHERE a.verification_id = '${verification_id}';`, async function (error, result, fields){
                        if(error){
                            console.log(error)
                        } else {
                            var user_id = result.rows[0].user_id
                            await connection.query(`UPDATE "user" SET apikey = '${apikey}', apisecret = '${apisecret}', token = '${apitoken}', token_expired = '${token_expired}' WHERE user_id='${user_id}'`, async function (error, result, fields){
                                if(error) {
                                    console.log(error)
                                } else {
                                    await connection.query(`SELECT a.user_id, a.firstname, a.lastname, a.username, a.email, a.telephone, a.card_member, a.card_number, a.gender, a.birth_date, a.apikey, a.apisecret, a.token, a.token_expired, a.is_active, a.is_login, a.create_date, a.update_date, a.role_id FROM "user" a LEFT JOIN verification b ON a.verification_id = b.verification_id WHERE a.verification_id='${verification_id}';`, function (error, result, fields){
                                        if(error){
                                            console.log(error)
                                        } else{
                                            var dataUser = []
                                            for (var i = 0; i < result.rows.length; i++) {
                                                var row = result.rows[i];
                                                    var data_getUser = {
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
                                                        "apiKey": row.apikey,
                                                        "apiSecret": row.apisecret,
                                                        "token": row.token,
                                                        "tokenExpired": row.token_expired,
                                                        "isActive": row.is_active,
                                                        "isLogin": row.is_login,
                                                        "createDate": row.create_date,
                                                        "updateDate": row.update_date,
                                                        "roleId": row.role_id
                                                    }
                                                    dataUser.push(data_getUser)
                                            }
                                            response.success_post_put("This account is verified, please set password", dataUser, res)
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

exports.signIn = async function(req, res) {
    let date = new Date();
    let day = date.getUTCDate(), month = date.getUTCMonth()+1;
    let hours = date.getHours();
    let hours_expired = date.getHours()+1;
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
    
    day < 10 ? day = 0 + "" + day : day;
    month < 10 ? month = 0 + "" + month : month;
    hours < 10 ? hours = 0 + "" + hours : hours;
    hours_expired < 10 ? hours_expired = 0 + "" + hours_expired : hours_expired;
    minutes < 10 ? minutes = 0 + "" + minutes : minutes;
    seconds < 10 ? seconds = 0 + "" + seconds : seconds;

    var date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

    var username = req.body.username
    var password = req.body.password

    const schema = Joi.object().keys({
        username: Joi.string().token().strip().min(3).max(30).required(),
        password: Joi.string().regex(/^[a-zA-Z0-9!*#$%_&]{3,30}$/).required()
    })

    await connection.query(`SELECT username FROM "user" WHERE username = '${username}';`, async function (error, result, fields){
        if(error){
            console.log(error)
        } else if (result.rowCount == 0 ) {
            response.not_found('Username Not Found', res)
        } else {
            await connection.query(`SELECT username FROM "user" WHERE username = '${username}' and password = '${password}';`, async function (error, result, fields){
                if(error){
                    console.log(error)
                } else if (result.rowCount == 0 ) {
                    response.unauthor('Wrong Password', res)
                } else {
                    Joi.validate(req.body, schema, async function (err, value) { 
                        if (err) {
                            response.bad_req(err.details[0].message, res)
                        } else {
                            await connection.query(`SELECT apikey, apisecret, user_id FROM "user" WHERE username = '${username}' and password = '${password}';`, async function (error, result, fields){
                                if(error){
                                    console.log(error)
                                } else {
                                    var apikey = result.rows[0].apikey
                                    var apisecret = result.rows[0].apisecret
                                    var apitoken = crypto.createHash('sha1').update(apikey + apisecret).digest('hex');
                                    var token_expired = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours_expired + ":" + minutes + ":" + seconds;
                                    var user_id = result.rows[0].user_id
        
                                    await connection.query(`UPDATE "user" SET token = '${apitoken}', token_expired = '${token_expired}', is_active = '1', is_login = '1' WHERE user_id='${user_id}'`, async function (error, result, fields){
                                        if(error) {
                                            console.log(error)
                                        } else {
                                            await connection.query(`SELECT user_id, firstname, lastname, username, email, telephone, gender, apikey, apisecret, token, token_expired, is_active, is_login  FROM "user" WHERE user_id='${user_id}';`, function (error, result, fields){
                                                if(error){
                                                    console.log(error)
                                                } else{
                                                    var dataUser = []
                                                    for (var i = 0; i < result.rows.length; i++) {
                                                        var row = result.rows[i];
                                                            var data_getUser = {
                                                                "id": row.user_id,
                                                                "firstName": row.firstname,
                                                                "lastName": row.lastname,
                                                                "userName": row.username,
                                                                "mail": row.email,
                                                                "phone": row.telephone,
                                                                "isActive": row.is_active,
                                                                "isLogin": row.is_login,
                                                                "apiKey": row.apikey,
                                                                "apiSecret": row.apisecret,
                                                                "token": row.token,
                                                                "tokenExpired": row.token_expired
                                                            }
                                                            dataUser.push(data_getUser)
                                                    }
                                                    response.success_post_put("Log on have been success", dataUser, res)
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