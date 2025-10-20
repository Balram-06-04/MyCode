const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: String,
  cart: [],
  orders: [],
  contact: Number,
  picture: String,
});

module.exports = new mongoose.model("User", UserSchema);
