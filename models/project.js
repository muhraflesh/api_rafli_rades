'use strict'

const response = require('../config/res')
const connection = require('../config/database')
const crypto = require('crypto')

exports.get = function(req, res) {
    
    if(!req.query.offset) {
        var offset = 0
    } else {
        var offset = req.query.offset
    }

    if(!req.query.limit) {
        var limit = 'all'
    } else {
        var limit = req.query.limit
    }

    if(req.query.name || req.query.desc || req.query.addr || req.query.cdate || req.query.cby) {
        connection.query(
            `SELECT * FROM project WHERE LOWER(project_name) LIKE LOWER('%${req.query.name}%') or LOWER(project_description) LIKE LOWER('%${req.query.desc}%') or LOWER(project_address) LIKE LOWER('%${req.query.addr}%') or LOWER(create_by) LIKE LOWER('%${req.query.cby}%') or create_date LIKE '${req.query.cdate}' order by project_name offset ${offset} limit ${limit}`,
            function (error, result, fields){
            if(error){
                console.log(error)
            } else{
                var dataProject = []
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows[i];
                    var data_getProject = {
                        "id": row.project_id,
                        "name": row.project_name,
                        "description": row.project_description,
                        "address": row.project_address,
                        "longitude": row.longitude,
                        "latitude": row.latitude,
                        "createDate": row.create_date,
                        "updateDate": row.update_date,
                        "createBy": row.create_by,
                        "updateBy": row.update_by
                    }
                    dataProject.push(data_getProject)
                }

                response.success_get(dataProject, offset, limit, res)
            }
        });
    } else {
        connection.query(
            `SELECT * FROM project offset ${offset} limit ${limit}`,
            function (error, result, fields){
            if(error){
                console.log(error)
            } else{
                var dataProject = []
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows[i];
                    var data_getProject = {
                        "id": row.project_id,
                        "name": row.project_name,
                        "description": row.project_description,
                        "address": row.project_address,
                        "longitude": row.longitude,
                        "latitude": row.latitude,
                        "createDate": row.create_date,
                        "updateDate": row.update_date,
                        "createBy": row.create_by,
                        "updateBy": row.update_by
                    }
                    dataProject.push(data_getProject)
                }

                response.success_get(dataProject, offset, limit, res)
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
        if(day<10){
            day = 0 + "" + day ;
        };
        if(month<10){
            month = 0 + "" + month;
        };
        if(hours<10){
            hours = 0 + "" + hours;
        };
        if(minutes<10){
            minutes = 0 + "" + minutes;
        };
        if(seconds<10){
            seconds = 0 + "" + seconds;
        };
    var date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    console.log(date_now)
    var proj_id = crypto.createHash('sha1').update('Project' + date_now).digest('hex');
    // REQ DARI CLIENT
    var proj_name = req.body.name
    var proj_desc = req.body.description
    var proj_address = req.body.address
    var longitude = req.body.longitude
    var latitude = req.body.latitude

    if(!proj_name){
        response.bad_req('Name Is Required', res)
    } else if (!proj_desc){
        response.bad_req('Description Is Required', res)
    } else if(!proj_address){
        response.bad_req('Address Is Required', res)
    } else if(!longitude){
        response.bad_req('Longitude Is Required', res)
    } else if(!latitude){
        response.bad_req('Latitude Is Required', res)
    } else {
        await connection.query(`INSERT INTO project(project_id, project_name, project_description, project_address, longitude, latitude, create_date, update_date) VALUES ('${proj_id}', '${proj_name}', '${proj_desc}', '${proj_address}', '${longitude}', '${latitude}', '${date_now}', '${date_now}')`, async function (error, result, fields){
            if(!error){
                await connection.query(`SELECT * from project where project_id='${proj_id}'`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        var dataProject = []
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows[i];
                            var data_getProject = {
                                "id": row.project_id,
                                "name": row.project_name,
                                "description": row.project_description,
                                "address": row.project_address,
                                "longitude": row.longitude,
                                "latitude": row.latitude,
                                "createDate": row.create_date,
                                "updateDate": row.update_date,
                                "createBy": row.create_by,
                                "updateBy": row.update_by
                            }
                            dataProject.push(data_getProject)
                        }

                        response.success_post_put(dataProject, res)
                    }
                });
            }
        });
        
    }
    
}

exports.findByID = function(req, res) {
    var proj_id = req.params.id

    connection.query(`select * FROM project WHERE project_id='${proj_id}'`, function (error, result, fields){
        if(result.rows == ''){
            response.not_found('Project Not Found', res)
        } else{
            var dataProject = []
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows[i];
                    var data_getProject = {
                        "id": row.project_id,
                        "name": row.project_name,
                        "description": row.project_description,
                        "address": row.project_address,
                        "longitude": row.longitude,
                        "latitude": row.latitude,
                        "createDate": row.create_date,
                        "updateDate": row.update_date,
                        "createBy": row.create_by,
                        "updateBy": row.update_by
                    }
                    dataProject.push(data_getProject)
                }

                response.success_getID(dataProject, res)
        }
    });
}

exports.put = async function(req, res) {
    let date = new Date();
    let day = date.getUTCDate(), month = date.getUTCMonth()+1;
    let hours = date.getHours();
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
        if(day<10){
            day = 0 + "" + day ;
        };
        if(month<10){
            month = 0 + "" + month;
        };
        if(hours<10){
            hours = 0 + "" + hours;
        };
        if(minutes<10){
            minutes = 0 + "" + minutes;
        };
        if(seconds<10){
            seconds = 0 + "" + seconds;
        };
    var date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

    var proj_id = req.params.id

    var proj_name = req.body.name
    var proj_desc = req.body.description
    var proj_address = req.body.address
    var longitude = req.body.longitude
    var latitude = req.body.latitude

    await connection.query(`select project_id from project where project_id='${proj_id}'`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Project Not Found', res)
        } else {
            if(proj_name){
                connection.query(`UPDATE project SET project_name = '${proj_name}' where project_id='${proj_id}';`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        console.log('Project Name Berhasil Diubah')
                    }
                });
            }
            if(proj_desc){
                connection.query(`UPDATE project SET project_description = '${proj_desc}' where project_id='${proj_id}';`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        console.log('Project Description Berhasil Diubah')
                    }
                });
            }
            if(proj_address){
                connection.query(`UPDATE project SET project_address = '${proj_address}' where project_id='${proj_id}';`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        console.log('Project Address Berhasil Diubah')
                    }
                });
            }
            if(longitude){
                connection.query(`UPDATE project SET longitude = '${longitude}' where project_id='${proj_id}';`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        console.log('Longitude Berhasil Diubah')
                    }
                });
            }
            if(latitude){
                connection.query(`UPDATE project SET latitude = '${latitude}' where project_id='${proj_id}';`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        console.log('Latitude Berhasil Diubah')
                    }
                });
            }
            await connection.query(`UPDATE project SET update_date = '${date_now}' where project_id='${proj_id}';`, async function (error, result, fields){
                if(!error){
                    await connection.query(`SELECT * FROM project WHERE project_id='${proj_id}'`, function (error, result, fields){
                        if(error){
                            console.log(error)
                        } else{
                            var dataProject = []
                            for (var i = 0; i < result.rows.length; i++) {
                                var row = result.rows[i];
                                var data_getProject = {
                                    "id": row.project_id,
                                    "name": row.project_name,
                                    "description": row.project_description,
                                    "address": row.project_address,
                                    "longitude": row.longitude,
                                    "latitude": row.latitude,
                                    "createDate": row.create_date,
                                    "updateDate": row.update_date,
                                    "createBy": row.create_by,
                                    "updateBy": row.update_by
                                }
                                dataProject.push(data_getProject)
                            }

                            response.success_post_put('Update Project Successfully', dataProject, res)
                        }
                    });
                }
            });
        }
    });

}

exports.delete = function(req, res) {
    var proj_id = req.params.id

    connection.query(`DELETE FROM project WHERE project_id='${proj_id}'`, function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Project Not Found', res)
        } else{
            response.success_delete('Project Has Been Deleted', res)
        }
    });
}

exports.getMember = async function(req, res) {
    var proj_id = req.params.id

    if(!req.query.offset) {
        var offset = 0
    } else {
        var offset = req.query.offset
    }

    if(!req.query.limit) {
        var limit = 'all'
    } else {
        var limit = req.query.limit
    }

    await connection.query(`select project_id from project where project_id='${proj_id}'`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Project Not Found', res)
        } else {
            // SEARCH BELUM !!
            if(req.query.name || req.query.mail || req.query.phone || req.query.cnum || req.query.gender) {
                await connection.query(
                    `SELECT * FROM user WHERE LOWER(firstname) LIKE LOWER('%${req.query.name}%') or LOWER(email) LIKE LOWER('%${req.query.mail}%') or LOWER(telephone) LIKE LOWER('%${req.query.phone}%') or LOWER(card_number) LIKE LOWER('%${req.query.cnum}%') or LOWER(gender) LIKE LOWER('%${req.query.gender}%') and project_id='${proj_id}' order by project_name offset ${offset} limit ${limit}`,
                    function (error, result, fields){
                    done();
                    if(error){
                        console.log(error)
                    } else{
                        response.success_get(result.rows, offset, limit, res)
                    }
                    });
            } else {
                await connection.query(
                    `SELECT a.user_id, a.firstname, a.lastname, a.username, a.email, a.telephone, a.card_member, a.card_number, a.gender, a.birth_date, a.is_active, a.is_login, a.create_date, a.update_date FROM "user" a left join project b on a.project_id=b.project_id where a.project_id='${proj_id}' offset ${offset} limit ${limit};`,
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
                                "updateDate": row.update_date
                            }
                            dataMember.push(data_getMember)
                        }

                        response.success_get(dataMember, offset, limit, res)
                    }
                });
            }
        }
    })
}

exports.postMember = async function(req, res) {
    let date = new Date();
    let day = date.getUTCDate(), month = date.getUTCMonth()+1;
    let hours = date.getHours();
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
        if(day<10){
            day = 0 + "" + day ;
        };
        if(month<10){
            month = 0 + "" + month;
        };
        if(hours<10){
            hours = 0 + "" + hours;
        };
        if(minutes<10){
            minutes = 0 + "" + minutes;
        };
        if(seconds<10){
            seconds = 0 + "" + seconds;
        };
    var date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    console.log(date_now)
    var user_id = crypto.createHash('sha1').update('User/Member' + date_now).digest('hex');
    console.log(user_id)
    // REQ DARI CLIENT
    var proj_id = req.params.id
    var firstname = req.body.firstName
    var lastname = req.body.lastName
    var username = req.body.userName
    var mail = req.body.mail
    var phone = req.body.phone
    var card_member = req.body.cardMember
    var card_number = req.body.cardNumber
    var gender = req.body.gender
    var birthdate = req.body.birthDate

    await connection.query(`SELECT project_id from project where project_id='${proj_id}';`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found("Project Not Found", res)
        } else {
            await connection.query(`SELECT user_id from "user" where email='${mail}';`, async function (error, result, fields){
                if(result.rowCount !== 0){
                    response.bad_req('Email telah digunakan', res)
                } else {
                    await connection.query(`SELECT user_id from "user" where username='${username}';`, async function (error, result, fields){
                        if(result.rowCount !== 0){
                            response.bad_req('Username telah digunakan', res)
                        } else {
                            await connection.query(`SELECT user_id from "user" where telephone='${phone}';`, async function (error, result, fields){
                                if(result.rowCount !== 0){
                                    response.bad_req('No. Telephone telah digunakan', res)
                                } else {
                                    
                                }
                            })
                        }
                    })
                }
            })
            // if(!firstname){
            //     response.bad_req('firstName Is Required', res)
            // } else if (!lastname){
            //     response.bad_req('lastName Is Required', res)
            // } else if(!username){
            //     response.bad_req('userName Is Required', res)
            // } else if(!mail){
            //     response.bad_req('mail Is Required', res)
            // } else if(!phone){
            //     response.bad_req('phone Is Required', res)
            // } else if(!card_member){
            //     response.bad_req('cardMember Is Required', res)
            // } else if(!card_number){
            //     response.bad_req('cardNumber Is Required', res)
            // } else if(!gender){
            //     response.bad_req('gender Is Required', res)
            // } else if(!birthdate){
            //     response.bad_req('birthDate Is Required', res)
            // } else {
            //     await connection.query(`INSERT INTO "user" (user_id, firstname, lastname, username, email, telephone, card_member, card_number, gender, birth_date, create_date, update_date, project_id) VALUES ('${user_id}', '${firstname}', '${lastname}', '${username}', '${mail}', '${phone}', '${card_member}', '${card_number}', '${gender}', '${birthdate}', '${date_now}', '${date_now}', '${proj_id}');`, function (error, result, fields){
            //         if(error){
            //             console.log(error)
            //         } else {
            //             connection.query(`SELECT a.user_id, a.firstname, a.lastname, a.username, a.email, a.telephone, a.card_member, a.card_number, a.birth_date, a.is_active, a.is_login, a.create_date, a.update_date FROM "user" a left join project b on a.project_id=b.project_id where a.project_id='${proj_id}' and a.user_id='${user_id}';`, function (error, result, fields){
            //                 if(error){
            //                     console.log(error)
            //                 } else{
            //                     var dataMember = []
            //                     for (var i = 0; i < result.rows.length; i++) {
            //                         var row = result.rows[i];
            //                         var data_getMember = {
            //                             "id": row.user_id,
            //                             "firstName": row.firstname,
            //                             "lastName": row.lastname,
            //                             "userName": row.username,
            //                             "mail": row.email,
            //                             "phone": row.telephone,
            //                             "cardMember": row.card_member,
            //                             "cardNumber": row.card_number,
            //                             "gender": row.gender,
            //                             "birthDate": row.birth_date,
            //                             "isActive": row.is_active,
            //                             "isLogin": row.is_login,
            //                             "createDate": row.create_date,
            //                             "updateDate": row.update_date
            //                         }
            //                         dataMember.push(data_getMember)
            //                     }
        
            //                     response.success_post_put("Member have been create", dataMember, res)
            //                 }
            //             });
            //         }
            //     });
                
            // }
        }
    })
    
}