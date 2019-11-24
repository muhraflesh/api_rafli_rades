'use strict'

const response = require('../config/res')
const connection = require('../config/database')
const crypto = require('crypto')
const host = require('../config/server.json').host
const port = require('../config/server.json').port
const ssl = require('../config/server.json').ssl
const uploadfile = require('express-fileupload')
var fs = require ('fs');
const Joi = require('joi');

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
                if(req.query.name || req.query.type ) {
                    await connection.query(`SELECT document_id, name, path, type, upload_date FROM document WHERE LOWER(name) LIKE LOWER('%${req.query.name}%') or LOWER(type) LIKE LOWER('%${req.query.type}%') offset ${offset} limit ${limit};`, function (error, result, fields){
                        if(error){
                            console.log(error)
                        } else {
                            var dataDocument = []
                            for (var i = 0; i < result.rows.length; i++) {
                                var row = result.rows[i];
                                var data_getDocument = {
                                    "id": row.document_id,
                                    "name": row.name,
                                    "path": row.path,
                                    "type": row.type,
                                    "createDate": row.upload_date
                                }
                                dataDocument.push(data_getDocument)
                            }
                            response.success_get(dataDocument, offset, limit, i, res)
                        }
                    })
                } else {
                    await connection.query(`SELECT document_id, name, path, type, upload_date FROM document offset ${offset} limit ${limit};`, function (error, result, fields){
                        if(error){
                            console.log(error)
                        } else {
                            var dataDocument = []
                            for (var i = 0; i < result.rows.length; i++) {
                                var row = result.rows[i];
                                var data_getDocument = {
                                    "id": row.document_id,
                                    "name": row.name,
                                    "path": row.path,
                                    "type": row.type,
                                    "createDate": row.upload_date
                                }
                                dataDocument.push(data_getDocument)
                            }
                            console.log(i)
                            response.success_get(dataDocument, offset, limit, i, res)
                        }
                    })
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
    const schema = Joi.object().keys({
        type: Joi.string().valid('ktp', 'kk', 'lab', 'statement', 'other').max(11).required(),
        userId: Joi.required(),
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
                if(!req.files.file) {
                    response.bad_req('Missing Property File', res)
                } else {
                    Joi.validate(req.body, schema, async function (err, value) { 
                        if (err) {
                            response.bad_req(err.details[0].message, res)
                        } else {
                            var document_id = crypto.createHash('sha1').update('Document' + date_now + type).digest('hex');
                    
                            var file = req.files.file
                            var type = req.body.type
                            var user_id = req.body.userId
                    
                            var ext = file.name.substring(file.name.lastIndexOf("."));
                            var result           = '';
                            var characters       = 'ABCDEFGH23456IJKLMNOPQRShijklmnTUVWXYZabcdefgopqrstuvwxyz01789';
                            for ( var i = 0; i < 25; i++ ) {
                                result += characters.charAt(Math.floor(Math.random() * 15));
                            }
                            var uploadedFileName = result + ext;
                            var path = ssl + host + ":" + port + "/uploadfile/" + user_id + '/' + type + '/' + uploadedFileName
                    
                            await connection.query(`select user_id from "user" where user_id='${user_id}'`, async function (error, result, fields){
                                if(result.rowCount == 0){
                                    response.not_found('User Not Found', res)
                                } else {
                                    var dirPath_id = `./storage/uploadfile/${user_id}/`
                                    var dirPath_type = `./storage/uploadfile/${user_id}/${type}/`
                                    if (!fs.existsSync(dirPath_id)) {
                                        var dir = fs.mkdirSync(dirPath_id);
                                    }
                                    if (!fs.existsSync(dirPath_type)) {
                                        var dir = fs.mkdirSync(dirPath_type);
                                    }
                                    file.name = uploadedFileName
                                    file.mv(dirPath_type + file.name, function(error, result) {
                                        if (error){
                                            console.log(error)
                                        } else {
                                            console.log('Image Berhasil Disimpan Dilocal')
                                        }
                                    })
                                    await connection.query(`INSERT INTO document(document_id, name, path, type, upload_date, user_id) VALUES ('${document_id}', '${uploadedFileName}', '${path}', '${type}', '${date_now}', '${user_id}');`, async function (error, result, fields){
                                        if(error){
                                            console.log(error)
                                        } else {
                                            await connection.query(`SELECT a.document_id, a.name, a.path, a.type, a.upload_date FROM document a LEFT JOIN "user" b on a.user_id=b.user_id WHERE a.user_id='${user_id}' and a.document_id='${document_id}';`, function (error, result, fields){
                                                if(error){
                                                    console.log(error)
                                                } else {
                                                    var dataDocument = []
                                                        for (var i = 0; i < result.rows.length; i++) {
                                                            var row = result.rows[i];
                                                            var data_getDocument = {
                                                                "id": row.document_id,
                                                                "name": row.name,
                                                                "path": row.path,
                                                                "type": row.type,
                                                                "createDate": row.upload_date
                                                            }
                                                            dataDocument.push(data_getDocument)
                                                        }
                                                        response.success_post_put("Document have been upload", dataDocument, res)
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
        });
    }
}

exports.findByID = async function(req, res) {
    var document_id = req.params.id
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
                await connection.query(`SELECT document_id, name, path, "type", upload_date FROM document WHERE document_id='${document_id}';`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else if(result.rowCount == 0){
                        response.not_found('Document Not Found', res)
                    } else {
                        var dataDocument = []
                            for (var i = 0; i < result.rows.length; i++) {
                                var row = result.rows[i];
                                var data_getDocument = {
                                    "id": row.document_id,
                                    "name": row.name,
                                    "path": row.path,
                                    "type": row.type,
                                    "createDate": row.upload_date
                                }
                                dataDocument.push(data_getDocument)
                            }
                        response.success_getID(dataDocument, res)
                    }
                })
            }
        });
    }
}

exports.delete = async function(req, res) {
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
    var document_id = req.params.id

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
                await connection.query(`DELETE FROM document WHERE document_id='${document_id}';`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else if(result.rowCount == 0){
                        response.not_found('Document Not Found', res)
                    } else {
                        response.success_delete('Document have been delete', res)
                    }
                })
            }
        });
    }
}