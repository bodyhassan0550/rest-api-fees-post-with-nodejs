const express = require("express");
const router = express.Router();
const feedcontroller = require("../controller/feed");
const { check } = require("express-validator");
const isAuth = require("../middelware/isAuth");
router.get("/posts", isAuth, feedcontroller.getposts);
router.get("/posts/:postid", isAuth, feedcontroller.getOneposts);
router.post(
  "/posts",
  [
    check("title").trim().isLength({ min: 5 }),
    check("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  feedcontroller.postposts
);
router.put(
  "/posts/:postid",
  [
    check("title").optional().trim().isLength({ min: 5 }),
    check("content").optional().trim().isLength({ min: 5 }),
  ],
  isAuth,
  feedcontroller.updatePost
);
router.delete("/posts/:postid", isAuth, feedcontroller.deletePost);

module.exports = router;
