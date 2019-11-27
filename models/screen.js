const response = require('../config/res')
const connection = require('../config/database')
const crypto = require("crypto")

// General Function
const get_date = () => {
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
    return date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
}
const get_id = (date, type) => {
    return x = crypto.createHash('sha1').update(`${type}` + date).digest('hex')
}
const offset_func = (req) => {
    let offset
    switch (!req.query.offset) {
        case true : offset = 0
        break;
        case false : offset = req.query.offset
        break;
    }
    return offset
}
const limit_func = (req) => {
    let limit
    
    switch (!req.query.limit) {
        case true : limit = "all"
        break;
        case false : limit = req.query.limit
        break;
    }
    return limit
}

// Screening Function
const res_func = (result) => {
    var docs = []
    for (var i = 0; i < result.rows.length; i++) {
        var row = result.rows[i];
        var tmp_docs = {
            "id": row.user_screening_id,
            "firstName": row.firstname,
            "lastName": row.lastname,
            "userName": row.username,
            "mail": row.email,
            "phone": row.phone_number,
            "cardMember": row.card_member,
            "cardNumber": row.card_number,
            "gender": row.gender,
            "birthDate": row.birth_date,
            "kk": row.kk_number,
            "nik": row.nik,
            "bloodType": row.blood_type,
            "fatherName": row.father_name,
            "motherName": row.mother_name,
            "popti": row.popti_city,
            "state": row.address_state,
            "city": row.address_city,
            "address": row.address,
            "detectionYear": row.detection_year,
            "level1HealthFacilities": row.level_1_health_facilities,
            "levelOfEducation": row.level_of_education,
            "maritalStatus": row.marital_status,
            "occupation": row.occupation,
            "providerStatus": row.provider_status,
            "createDate": row.create_date
        }
        docs.push(tmp_docs)
    }
    return [docs, i]
}
const post_docs = async (req) => {
    const date = get_date()
    let providerStatus
    switch (req.body.providerStatus){
        case true : providerStatus = "1"
        case false : providerStatus = "0"
    } 
    return {
    date : date,
    id : get_id(get_date(), "screening"),
    user_id : req.body.userId,
    kk_number : req.body.kk,
    nik : req.body.nik,
    blood_type : req.body.bloodType,
    father_name : req.body.fatherName, 
    mother_name : req.body.motherName,
    popti_city : req.body.popti,
    address_state : req.body.state, 
    address_city : req.body.city,
    address : req.body.address,
    detection_year : req.body.detectionYear,
    level_1_health_facilities : req.body.level1HealthFacilities,
    level_of_education : req.body.levelOfEducation,
    marital_status : req.body.maritalStatus,
    occupation : req.body.occupation,
    provider_status : providerStatus
    }
}
const put_query = (req) => {
    switch (req.body.providerStatus){
        case true : providerStatus = "1"
        case false : providerStatus = "0"
    }
    
    let x = [""]
    
    if (req.body.kk) x.push(`kk_number = '${req.body.kk}'`)
    if (req.body.nik) x.push(`nik = '${req.body.nik}'`)
    if (req.body.bloodType) x.push(`blood_type = '${req.body.bloodType}'`)
    if (req.body.fatherName) x.push(`father_name = '${req.body.fatherName}'`) 
    if (req.body.motherName) x.push(`mother_name = '${req.body.motherName}'`)
    if (req.body.popti) x.push(`popti_city = '${req.body.popti}'`)
    if (req.body.state) x.push(`address_state = '${req.body.state}'`) 
    if (req.body.city) x.push(`address_city  = '${req.body.city}'`)
    if (req.body.address) x.push(`address  = '${req.body.address}'`)
    if (req.body.detectionYear) x.push(`detection_year  = '${req.body.detectionYear}'`)
    if (req.body.level1HealthFacilities) x.push(`level_1_health_facilities  = '${req.body.level1HealthFacilities}'`)
    if (req.body.levelOfEducation)  x.push(`level_of_education  = '${req.body.levelOfEducation}'`)
    if (req.body.maritalStatus)  x.push(`marital_status  = '${req.body.maritalStatus}'`)
    if (req.body.occupation) x.push(`occupation  = '${req.body.occupation}'`)
    if (req.body.providerStatus) x.push(`provider_status  = '${providerStatus}'`)
    
    x = x.toString()
    return x
}

// Lab Function
const labres_func = (result) => {
    var docs = []
    for (var i = 0; i < result.rows.length; i++) {
        var row = result.rows[i];
        var tmp_docs = {
            id: row.laboratory_result_id,
            labName: row.laboratory_name,
            labNumber: row.laboratory_number,
            visitDate: `${row.visit_date.getFullYear()}-${row.visit_date.getMonth()+1}-${row.visit_date.getDate()}`,
            hemoglobin: row.hemoglobin,
            hematokrit: row.hematokrit,
            eritrosit: row.eritrosit,
            mcv: row.mcv,
            mch: row.mch,
            mchc: row.mchc,
            rdw_cv: row.rdw_cv,
            trombosit: row.trombosit,
            leukosit: row.leukosit,
            basofil: row.basofil,
            eosinofil: row.eosinofil,
            neutrofil: row.neutrofil,
            limfosit: row.limfosit,
            monosit: row.monosit,
            neutrofilSegmen: row.neutrofil_segmen,
            neutrofilBatang: row.neutrofil_batang,
            led: row.led,
            hba2: row.hba2,
            hbf: row.hbf,
            hbStatus: row.hb_status,
            anemiaStatus: row.anemia_status,
            shineAndLal: row.shine_and_lal,
            suspHemoglobinopathy: row.susp_hemoglobinopathy,
            type: row.type
        }
        docs.push(tmp_docs)
    }
    return docs
}
const labpost_docs = (req) => {
    date = get_date()
    let anemiaStatus
    switch (req.body.anemiaStatus){
        case true : anemiaStatus = "1"
        case false : anemiaStatus = "0"
    }
    return x = {
        user_screening_id: req.params.sid,
        laboratory_result_id: get_id(date, 'laboratory'),
        laboratory_name: req.body.labName,
        laboratory_number: req.body.labNumber,
        visit_date: req.body.visitDate,
        hemoglobin: req.body.hemoglobin,
        hematokrit: req.body.hematokrit,
        eritrosit: req.body.eritrosit,
        mcv: req.body.mcv,
        mch: req.body.mch,
        mchc: req.body.mchc,
        rdw_cv: req.body.rdw_cv,
        trombosit: req.body.trombosit,
        leukosit: req.body.leukosit,
        basofil: req.body.basofil,
        eosinofil: req.body.eosinofil,
        neutrofil: req.body.neutrofil,
        limfosit: req.body.limfosit,
        monosit: req.body.monosit,
        neutrofil_segmen: req.body.neutrofilSegmen,
        neutrofil_batang: req.body.neutrofilBatang,
        led: req.body.led,
        hba2: req.body.hba2,
        hbf: req.body.hbf,
        hb_status: req.body.hbStatus,
        anemia_status: anemiaStatus,
        shine_and_lal: req.body.shineAndLal,
        susp_hemoglobinopathy: req.body.suspHemoglobinopathy,
        type: req.body.type
    }
}
const labput_query = (req) => {
    let x = []
    
    if (req.body.labName) x.push(`laboratory_name = '${req.body.labName}'`)
    if (req.body.labNumber) x.push(`laboratory_number = '${req.body.labNumber}'`)
    if (req.body.visitDate) x.push(`visit_date = '${req.body.visitDate}'`) 
    if (req.body.hemoglobin) x.push(`hemoglobin = '${req.body.hemoglobin}'`)
    if (req.body.hematokrit) x.push(`hematokrit = '${req.body.hematokrit}'`)
    if (req.body.eritrosit) x.push(`eritrosit = '${req.body.eritrosit}'`) 
    if (req.body.neutrofil) x.push(`neutrofil  = '${req.body.neutrofil}'`)
    if (req.body.mcv) x.push(`mcv  = '${req.body.mcv}'`)
    if (req.body.mch) x.push(`mch  = '${req.body.mch}'`)
    if (req.body.mchc) x.push(`mchc  = '${req.body.mchc}'`)
    if (req.body.rdw_cv) x.push(`rdw_cv  = '${req.body.rdw_cv}'`)
    if (req.body.trombosit)  x.push(`trombosit  = '${req.body.trombosit}'`)
    if (req.body.leukosit)  x.push(`leukosit  = '${req.body.leukosit}'`)
    if (req.body.basofil) x.push(`basofil  = '${req.body.basofil}'`)
    if (req.body.eosinofil) x.push(`eosinofil  = '${req.body.eosinofil}'`)
    if (req.body.limfosit) x.push(`limfosit  = '${req.body.limfosit}'`)
    if (req.body.monosit) x.push(`monosit  = '${req.body.monosit}'`)
    if (req.body.neutrofilSegmen) x.push(`neutrofil_segmen  = '${req.body.neutrofilSegmen}'`)
    if (req.body.neutrofilBatang) x.push(`neutrofil_batang  = '${req.body.neutrofilBatang}'`)
    if (req.body.led) x.push(`led  = '${req.body.led}'`)
    if (req.body.hba2) x.push(`hba2  = '${req.body.hba2}'`)
    if (req.body.hbf) x.push(`hbf  = '${req.body.hbf}'`)
    if (req.body.hbStatus) x.push(`hb_status  = '${req.body.hbStatus}'`)
    if (req.body.anemiaStatus) x.push(`anemia_status  = '${req.body.anemiaStatus}'`)
    if (req.body.shineAndLal) x.push(`shine_and_lal  = '${req.body.shineAndLal}'`)
    if (req.body.suspHemoglobinopathy) x.push(`susp_hemoglobinopathy  = '${req.body.suspHemoglobinopathy}'`)
    if (req.body.type) x.push(`type  = '${req.body.type}'`)

    x = x.toString()
    return x
}

module.exports = {
    get_scr : async (req, res, next) => {
        const offset = offset_func(req)
        let limit = limit_func(req)
        let q = []
        if (req.query.name) q.push(`(LOWER(firstname) LIKE LOWER('${req.query.name}') OR LOWER(lastname) LIKE LOWER ('${req.query.name}') OR LOWER(username) LIKE LOWER('${req.query.name}'))`)
        if (req.query.mail) q.push(`LOWER(email) LIKE LOWER('${req.query.email}')`)
        if (req.query.phone) q.push(`LOWER(telephone) LIKE LOWER('${req.query.phone}')`)
        if (req.query.cnum) q.push(`LOWER(card_number) LIKE LOWER('${req.query.cnum}')`)
        if (req.query.gender) q.push(`LOWER(gender) LIKE LOWER('${req.query.gender}')`)
        if (req.query.kk) q.push(`LOWER(kk_number) LIKE LOWER('${req.query.kk}')`)
        if (req.query.nik) q.push(`LOWER(nik) LIKE LOWER('${req.query.nik}')`)
        if (req.query.date) q.push(`LOWER(create_date) LIKE LOWER('${req.query.date}')`)
        if (req.query.parent) q.push(`(LOWER(father_name) LIKE LOWER('${req.query.parent}') OR LOWER(mother_name) LIKE LOWER('${req.query.parent}'))`)
        if (req.query.address) q.push(`(LOWER(address_state) LIKE LOWER('${req.query.address}') OR LOWER(address_city) LIKE LOWER'(${req.query.address}') OR LOWER(address) LIKE LOWER('${req.query.address}') )`)
        if (req.query.popti) q.push(`LOWER(popti_city) LIKE LOWER('${req.query.popti}')`)
        
        {
            let q2 = ""
            if (q[0]) {
                q2 = "WHERE "+ q.toString()
                for(x in q){
                    q2 = q2.replace(","," AND ")
                }
            }else {
                q = ""
            }
            q = q2
        }
        const query = `SELECT user_screening_id, u.firstname, u.lastname, u.username, email, telephone, card_member, card_number, gender, birth_date, kk_number, nik, blood_type, father_name, mother_name, popti_city, address_state, address_city, address, detection_year,level_1_health_facilities, level_of_education, marital_status, occupation, provider_status, us.create_date, count(*) OVER() AS full_count FROM public."user" u RIGHT OUTER JOIN public."user_screening" us ON u.user_id = us.user_id ${q} offset ${offset} limit ${limit};`
        connection.query(query, (error, result, fields) => {
            if (error) {
                console.log(error)
                response.server_error(error, res)
            }
            else{
                if(result.rowCount == 0){
                    response.not_found('Screening not found.', res)
                } else{    
                    const docs = res_func(result)
                    let full_count = "0"
                    if(result.rows[0].full_count) full_count = result.rows[0].full_count
                    if(limit == "all") limit = docs[1]
                    response.success_get(docs[0], offset, limit, full_count, res)
                }
            }
        })
    },

    post_scr : async (req, res, next) => {
        const x = await post_docs(req)
        const query = `INSERT INTO public."user_screening"(user_screening_id, user_id, create_date, kk_number, nik, blood_type, father_name, mother_name, popti_city, address_state, address_city, address, detection_year, level_1_health_facilities, level_of_education, marital_status, occupation, provider_status) VALUES ('${x.id}', '${x.user_id}', '${x.date}', '${x.kk_number}', '${x.nik}', '${x.blood_type}', '${x.father_name}', '${x.mother_name}', '${x.popti_city}', '${x.address_state}', '${x.address_city}', '${x.address}', '${x.detection_year}', '${x.level_1_health_facilities}', '${x.level_of_education}', '${x.marital_status}', '${x.occupation}', '${x.provider_status}');`
        await connection.query(query, async (error, result, fields) => {
            if (error) {
                console.log(error)
                response.server_error(error, res)
            }
            else {
                connection.query(`SELECT * FROM public."user_screening" WHERE user_screening_id = '${x.id}'`, (error, result, fields) => {
                    if (error) {
                        console.log(error)
                        response.server_error(error, res)
                    }
                    else {
                        const docs = res_func(result)
                        response.success_post_put("Screening has been created.", docs, res)}
                })
            }
        })
    },

    get_scr_sid : async (req, res, next) => {
        const query = `SELECT user_screening_id, firstname, lastname, username, email, telephone, card_member, card_number, gender, birth_date, kk_number, nik, blood_type, father_name, mother_name, popti_city, address_state, address_city, address, detection_year,level_1_health_facilities, level_of_education, marital_status, occupation, provider_status, us.create_date FROM public."user" u RIGHT OUTER JOIN public."user_screening" us ON u.user_id = us.user_id where us.user_screening_id = '${req.params.sid}' ;`
        connection.query(query, (error, result, fields) => {
            if (error) {
                console.log(error)
                response.server_error(error, res)
            }
            else{
                if(result.rowCount == 0){
                    response.not_found('Screening not found.', res)
                } else{
                    const docs = res_func(result)
                    response.success_getID(docs, res)
                }
            }
        })
    },

    put_scr_sid : async (req, res, next) => {
        const date = get_date()
        const req_query = put_query(req)
        const query = `UPDATE public."user_screening" SET create_date = '${date}' ${req_query} WHERE user_screening_id = '${req.params.sid}';`
        console.log(query)
        connection.query(query, async (error, result, fields) => {
            if (error) {
                console.log(error)
                response.server_error(error, res)
            }
            else {
                await connection.query(`SELECT * FROM public."user_screening" WHERE user_screening_id = '${req.params.sid}';`, (error, result, fields) => {
                    if (error) {
                        console.log(error)
                        response.server_error(error, res)
                    }
                    else {
                        const docs = res_func(result)
                        response.success_post_put('Screening has been updated.', docs, res)
                    }
                })
            }
        })
    },

    del_scr_sid : async (req, res, next) => {
        const query = `DELETE FROM public."user_screening" WHERE user_screening_id = '${req.params.sid}';`
        await connection.query(query, (error, result, fields) => {
            if (error) {
                console.log(error)
                response.server_error(error, res)
            }
            else {
                if(result.rowCount == 0){
                    response.not_found('Screening not found.', res)
                } else{
                    response.success_delete('Screening has been deleted.', res)
                }
            }
        })
    },

    get_lab : async (req, res, next) => {
        const offset = offset_func(req)
        const limit = limit_func(req)
        let q = ""
        if (req.query.name) q = q + ` AND LOWER(laboratory_name) LIKE LOWER('${req.query.name})`
        if (req.query.number) q = q + ` AND LOWER(laboratory_number) = LIKE LOWER('${req.query.number}')`
        q = q + " "
        const query = `SELECT * FROM public."laboratory_result" WHERE user_screening_id = '${req.params.sid}'${q}offset ${offset} limit ${limit};`
        await connection.query(query, (error, result, fields) => {
            if (error) {
                console.log(error)
                response.server_error(error, res)
            }
            else{
                if(result.rowCount == 0){
                    response.not_found('Lab result not found.', res)
                }else{
                    const docs = labres_func(result)
                    response.labsuccess_get(docs, res)
                }
            }
        })
    },

    post_lab : async (req, res, next) => {
        const x = await labpost_docs(req)
        const query = `INSERT INTO public."laboratory_result"(user_screening_id, laboratory_result_id, laboratory_name, laboratory_number, visit_date, hemoglobin, hematokrit, eritrosit, mcv, mch, mchc, rdw_cv, trombosit, leukosit, basofil, eosinofil, neutrofil, limfosit, monosit, neutrofil_segmen, neutrofil_batang, led, hba2, hbf, hb_status, anemia_status, shine_and_lal, susp_hemoglobinopathy, type) VALUES('${x.user_screening_id}', '${x.laboratory_result_id}', '${x.laboratory_name}', '${x.laboratory_number}', '${x.visit_date}', '${x.hemoglobin}', '${x.hematokrit}', '${x.eritrosit}', '${x.mcv}', '${x.mch}', '${x.mchc}', '${x.rdw_cv}', '${x.trombosit}', '${x.leukosit}', '${x.basofil}', '${x.eosinofil}', '${x.neutrofil}', '${x.limfosit}', '${x.monosit}', '${x.neutrofil_segmen}', '${x.neutrofil_batang}', '${x.led}', '${x.hba2}', '${x.hbf}', '${x.hb_status}', '${x.anemia_status}', '${x.shine_and_lal}', '${x.susp_hemoglobinopathy}', '${x.type}');`
        await connection.query(query, async (error, result, fields) => {
            if (error) {
                console.log(error)
                response.server_error(error, res)
            }
            else {
                connection.query(`SELECT * FROM public."laboratory_result" WHERE laboratory_result_id = '${x.laboratory_result_id}'`, (error, result, fields) => {
                    if (error) {
                        console.log(error)
                        response.server_error(error, res)
                    }
                    else {
                        const docs = labres_func(result)
                        response.success_post_put("Laboratory result has been added", docs, res)
                    }
                })
            }
        })
    },

    get_lab_lid : async (req, res, next) => {
        const query = `SELECT * FROM public."laboratory_result" WHERE laboratory_result_id = '${req.params.lid}';`
        await connection.query(query, (error, result, fields) => {
            if (error) {
                console.log(error)
                response.server_error(error, res)
            }
            else{
                if(result.rowCount == 0){
                    response.not_found('Lab result not found.', res)
                }else{
                    const docs = labres_func(result)
                    response.labsuccess_get(docs, res)
                }
            }
        })
    },

    put_lab_lid : async (req, res, next) => {
        const req_query = labput_query(req)
        const query = `UPDATE public."laboratory_result" SET ${req_query} WHERE laboratory_result_id = '${req.params.lid}' AND user_screening_id = '${req.params.sid}';`
        console.log(query)
        connection.query(query, async (error, result, fields) => {
            if (error) {
                console.log(error)
                response.server_error(error, res)
            }
            else {
                await connection.query(`SELECT * FROM public."laboratory_result" WHERE laboratory_result_id = '${req.params.lid}';`, (error, result, fields) => {
                    if (error) {
                        console.log(error)
                        response.server_error(error, res)
                    }
                    else {
                        const docs = labres_func(result)
                        response.success_post_put('Laboratory result has been updated.', docs, res)
                    }
                })
            }
        })
    },

    del_lab_lid : async (req, res, next) => {
        const query = `DELETE FROM public."laboratory_result" WHERE user_screening_id = '${req.params.sid}' AND laboratory_result_id = '${req.params.lid}';`
        await connection.query(query, (error, result, fields) => {
            if (error) {
                console.log(error)
                response.server_error(error, res)
            }
            else {
                if(result.rowCount == 0){
                    response.not_found('Laboratory result Not Found', res)
                } else{
                    response.success_delete('Laboratory result has been deleted', res)
                }
            }
        })
    }
}