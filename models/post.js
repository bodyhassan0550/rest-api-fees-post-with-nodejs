const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imgurl: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId, // Reference to the User model
      ref: "User",
      required: true, // Ensure this field is required
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", PostSchema);
