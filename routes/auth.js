const express = require("express")
const router = express.Router()
const usercontroller = require("../controller/auth")
const {check} = require ("express-validator")

router.post(
  "/sighup",
  [
    check("email").isEmail().withMessage("inValid E-mail").normalizeEmail(),
    check("name").trim().not().isEmpty().withMessage("Name is required"),
    check("password")
      .trim()
      .isLength({ min: 3 })
      .withMessage("inValid Password is too short"),
  ],
  usercontroller.signup
);
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("inValid E-mail").normalizeEmail(),
    check("password")
      .trim()
      .isLength({ min: 3 })
      .withMessage("inValid Password is too short"),
  ],
  usercontroller.login
);

module.exports = router;