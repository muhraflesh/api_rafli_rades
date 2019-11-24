const router = require("express-promise-router")()
const ctl = require("../models/screen")
let temproute

router.route("/:id/screening")
.get(ctl.get_scr)
router.route("/:id/screening")
.post(ctl.post_scr)

router.route("/:id/screening/:sid")
.get(ctl.get_scr_sid)
router.route("/:id/screening/:sid")
.put(ctl.put_scr_sid)
router.route("/:id/screening/:sid")
.delete(ctl.del_scr_sid)

router.route("/:id/screening/:sid/laboratory")
.get(ctl.get_lab)
router.route("/:id/screening/:sid/laboratory")
.post(ctl.post_lab)

router.route("/:id/screening/:sid/laboratory/:lid")
.get(ctl.get_lab_lid)
router.route("/:id/screening/:sid/laboratory/:lid")
.put(ctl.put_lab_lid)
router.route("/:id/screening/:sid/laboratory/:lid")
.delete(ctl.del_lab_lid)

module.exports = router