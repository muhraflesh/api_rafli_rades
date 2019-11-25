'use strict'

const response = require('../config/res')
const connection = require('../config/database')
const crypto = require('crypto')
require('dotenv').config()
const sendGrid = require('sendgrid').mail;
const sg = require('sendgrid')(process.env.SendGridApiKey);
const Joi = require('joi');
const nodemailer = require("nodemailer");

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
    var apitoken = crypto.createHash('sha1').update('API TOKEN' + apikey + apisecret + token_expired).digest('hex');
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
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
    
    day < 10 ? day = 0 + "" + day : day;
    month < 10 ? month = 0 + "" + month : month;
    hours < 10 ? hours = 0 + "" + hours : hours;
    minutes < 10 ? minutes = 0 + "" + minutes : minutes;
    seconds < 10 ? seconds = 0 + "" + seconds : seconds;

    var date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

    var username = req.body.username
    var email = req.body.email
    var telephone = req.body.phone
    var user_id = crypto.createHash('sha1').update('User/Member' + date_now + '' + email).digest('hex');

    const schema = Joi.object().keys({
        username: Joi.string().token().strip().min(3).max(30).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        phone: Joi.number().integer().required()
    })
    
    var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "appthalassaemia@gmail.com",
            pass: "thalassaemia123"
        }
    });
    
    var rand=Math.floor((Math.random() * 100) + 54);
    var link="http://127.0.0.1:3000"+"/verify?id="+rand;
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
                                    smtpTransport.sendMail(mailOptions, function(error, response){
                                        if(error){
                                               console.log(error);
                                           res.end("error");
                                        }else{
                                               console.log("Message sent: " + response.message);
                                               response.success_getID('SUCCESS', res)
                                            }
                                    });
                                    
                                    // await connection.query(`INSERT INTO "user" (user_id, username, email, telephone, create_date, update_date) VALUES ('${user_id}', '${username}', '${email}', '${telephone}', '${date_now}', '${date_now}');`, function (error, result, fields){
                                    //     if(error){
                                    //         console.log(error)
                                    //     } else {
                                            
                                    //     }
                                    // })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}