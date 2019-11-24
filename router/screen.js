const router = require("express-promise-router")()
const ctl = require("../models/screen")
const verifytoken = require("../helpers/verify_token")

router.route("/:id/screening")
.get(verifytoken(), ctl.get_scr)
router.route("/:id/screening")
.post(verifytoken(), ctl.post_scr)

router.route("/:id/screening/:sid")
.get(verifytoken(), ctl.get_scr_sid)
router.route("/:id/screening/:sid")
.put(verifytoken(), ctl.put_scr_sid)
router.route("/:id/screening/:sid")
.delete(verifytoken(), ctl.del_scr_sid)

router.route("/:id/screening/:sid/laboratory")
.get(verifytoken(), ctl.get_lab)
router.route("/:id/screening/:sid/laboratory")
.post(verifytoken(), ctl.post_lab)

router.route("/:id/screening/:sid/laboratory/:lid")
.get(verifytoken(), ctl.get_lab_lid)
router.route("/:id/screening/:sid/laboratory/:lid")
.put(verifytoken(), ctl.put_lab_lid)
router.route("/:id/screening/:sid/laboratory/:lid")
.delete(verifytoken(), ctl.del_lab_lid)

module.exports = router