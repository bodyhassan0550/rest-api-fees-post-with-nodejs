const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid input data");
    error.status = 422;
    error.data = errors.array(); // Correctly attach validation errors
    return next(error); // Pass the error to the error handler
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  if (!password) {
    const error = new Error("Password is required");
    error.status = 400; // Bad Request
    return next(error);
  }

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        const error = new Error("This email already exists");
        error.status = 422;
        return next(error); // Pass the error to the error handler
      }

      // If no user exists with the given email, proceed to hash the password
      return bcrypt.hash(password, 12);
    })
    .then((hashpass) => {
      const user = new User({
        name: name,
        email: email,
        password: hashpass,
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Welcome new user, " + result.name, // Fixed typo: "massage" to "message"
        userid: result._id,
      });
    })
    .catch((err) => {
      if (!err.status) {
        err.status = 500;
      }
      next(err); // Pass the error to the error handler
    });
};
exports.login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid input data");
    error.status = 422;
    error.data = errors.array(); // Attach validation errors
    return next(error); // Pass the error to the error handler
  }
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("This email not found");
        error.status = 401;
        return next(error); // Pass the error to the error handler
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password");
        error.status = 401;
        return next(error); // Pass the error to the error handler
      }
     const token = jwt.sign(
       { email: loadedUser.email, userid: loadedUser._id.toString() },
       "somesupersecretsecret", // Secret key for JWT
       { expiresIn: "1h" }
     );
      res.status(200).json({
        message: "Welcome back, " + loadedUser.name,
        token: token,
        userid: loadedUser._id,
      });
    })
    .catch((err) => {
      if (!err.status) {
        err.status = 500;
      }
      next(err); // Pass the error to the error handler
    });
};
