const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

module.exports = {
  creatUser: async function ({ userInput }, req) {
    const errors = []; // Use `errors` as an array to collect multiple error messages

    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "Invalid E-mail" });
    }

    const existUser = await User.findOne({ email: userInput.email });
    if (existUser) {
      errors.push({ message: "User E-mail already exists" });
    }

    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({
        message:
          "Password is too short. It should be at least 5 characters long.",
      });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors; // Store the error messages in `error.data`
      error.statusCode = 422; // Set a status code for validation errors
      throw error; // Throw the error with the messages
    }

    const passhash = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: passhash,
    });

    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
  login: async function ({ email, password }) {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("E-mail is not found");
      throw error;
    }
    const passcompare = await bcrypt.compare(password, user.password);
    if (!passcompare) {
      const error = new Error("worng password");
      throw error;
    }
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      "somesupersecretsecret",
      {
        expiresIn: "1h",
      }
    );
    return { token: token, userId: user._id.toString() };
  },
  creatPost: async function ({ postInput }, req) {
    const errors = []; // Use `errors` as an array to collect multiple error messages
    if (!req.isAuth) {
      errors.push({
        message: "No Authzition",
      });
    }
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({
        message: "title is too short. It should be at least 5 characters long.",
      });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({
        message:
          "content is too short. It should be at least 5 characters long.",
      });
    }
    const user = await User.findById(req.userId);
    if (!user)
      errors.push({
        message: "Not found user",
      });
    if (errors.length > 0) {
      const error = new Error("Invalid input.");
      error.data = errors; // Store the error messages in `error.data`
      error.statusCode = 422; // Set a status code for validation errors
      throw error; // Throw the error with the messages
    }

    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imgurl: postInput.imgurl,
      creator: user,
    });
    const creatpost = await post.save();
    user.posts.push(creatpost);

    return {
      ...creatpost.doc,
      _id: creatpost._id.toString(),
      createdAt: creatpost.createdAt.toString(),
      updatedAt: creatpost.updatedAt.toString(),
    };
  },
  posts: async function (args, req) {
    const errors = [];

    // Check for authentication
    if (!req.isAuth) {
      errors.push({ message: "Not authenticated!" });
    }

    // If there are errors, throw them
    if (errors.length > 0) {
      const error = new Error("Authorization error.");
      error.data = errors;
      error.statusCode = 401;
      throw error;
    }

    try {
      // Get the total number of posts
      const totalPosts = await Post.find().countDocuments();

      // Get the posts, sorted by creation date, and populate the creator field
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate("creator");

      // Map over the posts and format them for the response
      return {
        posts: posts.map((p) => {
          return {
            ...p._doc,
            _id: p._id.toString(),
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          };
        }),
        totlePost: totalPosts, // Return the total number of posts
      };
    } catch (err) {
      const error = new Error("Fetching posts failed.");
      error.statusCode = 500;
      throw error;
    }
  },
  post: async function ({ id }, req) {
    const errors = [];

    // Check for authentication
    if (!req.isAuth) {
      errors.push({ message: "Not authenticated!" });
    }

    // If there are errors, throw them

    const post = await Post.findById(id).populate("creator");
    if (!post) {
      errors.push({ message: "Not found the post" });
    }
    if (errors.length > 0) {
      const error = new Error("Authorization error.");
      error.data = errors;
      error.statusCode = 401;
      throw error;
    }
    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },
  deletepost: async function ({ id }, req) {
    const errors = [];

    // Check for authentication
    if (!req.isAuth) {
      errors.push({ message: "Not authenticated!" });
    }

    // If there are errors, throw them

    const post = await Post.findByIdAndDelete(id).populate("creator");
    if (!post) {
      errors.push({ message: "Not found the post" });
    }
       if (postInput.creator !== req._id) {
         const error = new Error("Authorization error.");
         error.data = errors;
         error.statusCode = 401;
         throw error;
       }
    if (errors.length > 0) {
      const error = new Error("Authorization error.");
      error.data = errors;
      error.statusCode = 401;
      throw error;
    }
    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },
  updatepost: async function ({ id, postInput }, req) {
    const errors = [];

    // Check for authentication
    if (!req.isAuth) {
      errors.push({ message: "Not authenticated!" });
    }

    // If there are authentication errors, throw them
    if (errors.length > 0) {
      const error = new Error("Not authenticated.");
      error.data = errors;
      error.statusCode = 401; // 401 for authentication errors
      throw error;
    }

    const post = await Post.findById(id).populate("creator");
    if (!post) {
      errors.push({ message: "Post not found" });
    }
    if (postInput.creator !== req._id) {
      const error = new Error("Authorization error.");
      error.data = errors;
      error.statusCode = 401;
      throw error;
    }
    if (errors.length > 0) {
      const error = new Error("Post not found.");
      error.data = errors;
      error.statusCode = 404; // 404 for not found errors
      throw error;
    }

    // Validate postInput
    if (postInput.title && !validator.isLength(postInput.title, { min: 5 })) {
      errors.push({
        message: "Title is too short. It should be at least 5 characters long.",
      });
    }

    if (
      postInput.content &&
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({
        message:
          "Content is too short. It should be at least 5 characters long.",
      });
    }

    if (errors.length > 0) {
      const error = new Error("Validation failed.");
      error.data = errors;
      error.statusCode = 422; // 422 for validation errors
      throw error;
    }

    // Update only fields provided in postInput
    if (postInput.title) {
      post.title = postInput.title;
    }

    if (postInput.content) {
      post.content = postInput.content;
    }
    if (postInput.imgurl) {
      post.imgurl = postInput.imgurl;
    }

    const updatedPost = await post.save();

    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },
};
