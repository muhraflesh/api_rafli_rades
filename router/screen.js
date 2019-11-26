const router = require("express-promise-router")()
const ctl = require("../models/screen")
const verifytoken = require("../helpers/verify_token")
const {validateBody, schemas} = require("../helpers/screen_joi")

router.route("/")
.get(verifytoken(), ctl.get_scr)
router.route("/")
.post(validateBody(schemas.scrSchema), verifytoken(), ctl.post_scr)

router.route("/:sid")
.get(verifytoken(), ctl.get_scr_sid)
router.route("/:sid")
.put(validateBody(schemas.scrWithSidSchema), verifytoken(), ctl.put_scr_sid)
router.route("/:sid")
.delete(verifytoken(), ctl.del_scr_sid)

router.route("/:sid/laboratory")
.get(verifytoken(), ctl.get_lab)
router.route("/:sid/laboratory")
.post(validateBody(schemas.labSchema), verifytoken(), ctl.post_lab)

router.route("/:sid/laboratory/:lid")
.get(verifytoken(), ctl.get_lab_lid)
router.route("/:sid/laboratory/:lid")
.put(validateBody(schemas.labSchema), verifytoken(), ctl.put_lab_lid)
router.route("/:sid/laboratory/:lid")
.delete(verifytoken(), ctl.del_lab_lid)

module.exports = router