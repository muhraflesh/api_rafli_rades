'use strict'

const response = require('../config/res')
const connection = require('../config/database')
const crypto = require('crypto')

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