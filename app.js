const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const { graphqlHTTP } = require("express-graphql");
const graphSchema = require("./graphql/schema");
const graphResolve = require("./graphql/resolvers");
const mongooseURL =
  "mongodb+srv://bodyhassan0550:body312002%40@cluster0.i6vca26.mongodb.net/Post";
const multer = require("multer");

const bodyparser = require("body-parser");
const feedroutes = require("./routes/feed");
const userroutes = require("./routes/auth");
const Auth = require("./middelware/isAuth")
app.use(bodyparser.json());
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const massage = error.massage;
  const data = error.data;
  res.status(status).json({ massage: massage, data: data });
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(Auth)
app.use(feedroutes);
app.use("/user", userroutes);
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphSchema,
    rootValue: graphResolve,
    graphiql: true, // Set to true to enable GraphiQL, a web interface for testing queries
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An error occurred.";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    },
  })
);
mongoose
  .connect(mongooseURL)
  .then((result) => {
    console.log("connect");
    const server = app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
