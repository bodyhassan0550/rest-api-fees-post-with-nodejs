const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
exports.getposts = (req, res, next) => {
  Post.find()
    .then((post) => {
      if (!post) {
        const error = new Error("No post found");
        error.status = 404;
        throw error;
      }
      res.status(200).json({
        post: post,
      });
    })
    .catch((err) => {
      if (!err.status) {
        err.status = 500;
      }
      next(err);
    });
};

exports.postposts = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid input data");
    error.status = 422;
    error.data = errors.array(); // Attach validation errors
    return next(error); // Pass the error to the error handler
  }

  const title = req.body.title;
  const content = req.body.content;

  if (!req.userId) {
    const error = new Error("User not authenticated.");
    error.status = 401; // Unauthorized
    return next(error);
  }

  const post = new Post({
    title: title,
    content: content,
    imgurl: "images/my.jpg",
    creator: req.userId, // Correctly set the creator
  });

  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        return next(error);
      }
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Success! Post added.",
        post: post,
        creator: { _id: result._id, email: result.email },
      });
    })
    .catch((err) => {
      if (!err.status) {
        err.status = 500;
      }
      next(err); // Pass the error to the error handler
    });
};
exports.getOneposts = (req, res, next) => {
  const postId = req.params.postid;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("No post found");
        error.status = 404;
        throw error;
      }
      res.status(200).json({
        post: post,
      });
    })
    .catch((err) => {
      if (!err.status) {
        err.status = 500;
      }
      next(err);
    });
};
exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid input data");
    error.status = 422;
    throw error;
  }

  const postId = req.params.postid;
  const newTitle = req.body.title;
  const newContent = req.body.content;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("No post found");
        error.status = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not Authiztion");
        error.status = 404;
        throw error;
      }
      if (newTitle) {
        post.title = newTitle;
      }
      if (newContent) {
        post.content = newContent;
      }
      console.log(post);
      return post.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "Successfully updated post",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.status) {
        err.status = 500;
      }
      next(err);
    });
};
exports.deletePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid input data");
    error.status = 422;
    throw error;
  }
  const postId = req.params.postid;

  Post.findByIdAndDelete(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("No post found");
        error.status = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized");
        error.status = 403; // Forbidden
        throw error;
      }

      return User.findById(req.userId);
    })
    .then((user) => {
      if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
      }

      // Remove the deleted post from the user's posts array
      user.posts.pull(postId);
      return user.save();
    })
    .then(() => {
      res.status(200).json({
        message: "Post deleted successfully",
      });
    })
    .catch((err) => {
      if (!err.status) {
        err.status = 500;
      }
      next(err);
    });
};
