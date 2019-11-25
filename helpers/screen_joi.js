const joi = require ("joi")

module.exports = {
    validateBody: (schema) => {
        return (req, res, next) => {
            //console.log(req)
            const result = joi.validate(req.body, schema)
            if (result.error) {
                return res.status(400).json(result.error)
            }
            next ()
        }
    },

    schemas: {
        scrSchema: joi.object().keys({
            kk: joi.string().max(25),
            nik: joi.string().max(25),
            bloodType: joi.string().max(2),
            fatherName: joi.string().max(50),
            motherName: joi.string().max(50),
            popti: joi.string().max(50),
            state: joi.string().max(50),
            city: joi.string().max(50),
            address: joi.string(),
            detectionYear: joi.date(),
            level1HealthFacilities: joi.string().max(100),
            levelOfEducation: joi.string().max(100),
            maritalStatus: joi.string().max(100),
            occupation: joi.string().max(100),
            providerStatus: joi.boolean()
        }),
        labSchema: joi.object().keys({
            labName: joi.string().max(100),
            labNumber: joi.string().max(100),
            visitDate: joi.date(),
            hemoglobin: joi.string().max(11),
            hematokrit: joi.string().max(11),
            eritrosit: joi.string().max(11),
            mcv: joi.string().max(11),
            mch: joi.string().max(11),
            mchc: joi.string().max(11),
            rdw_cv: joi.string().max(11),
            trombosit: joi.string().max(11),
            leukosit: joi.string().max(11),
            basofil: joi.string().max(11),
            eosinofil: joi.string().max(11),
            neutrofil: joi.string().max(11),
            limfosit: joi.string().max(11),
            monosit: joi.string().max(11),
            neutrofilSegmen: joi.string().max(11),
            neutrofilBatang: joi.string().max(11),
            led: joi.string().max(11),
            hba2: joi.string().max(11),
            hbf: joi.string().max(11),
            hbStatus: joi.string().max(11),
            anemiaStatus: joi.boolean(),
            shineAndLal: joi.string().max(11),
            suspHemoglobinopathy: joi.string().max(50),
            type: joi.string().max(50)
        })
    }
}