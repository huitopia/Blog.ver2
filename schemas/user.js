const mongoose = require("mongoose");

const { Schema } = mongoose;
const userSchema = new Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("User", userSchema);