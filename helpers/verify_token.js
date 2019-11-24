const connection = require('../config/database')
const response = require('../config/res')
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
    
const date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

const verifytoken = () => {
    return async (req, res, next) => {
        if (!req.headers.token) {
            response.unauthor('Token Is Required', res) 
            return (null)
        }
        connection.query(
        `SELECT token_expired FROM "user" WHERE "token"='${req.headers.token}'`,
        async function (error, result, fields){
            if(error){
                console.log(error)
                return (null)
            } else if (result.rowCount == 0){
                response.unauthor('Your Token Is Not Match', res)
                return (null)
            } else if (date_now > result.rows[0].token_expired) {
                response.unauthor('Your Token Is Expired', res)
            } else {
                return next()
            }
        })
    }
}

module.exports = verifytoken