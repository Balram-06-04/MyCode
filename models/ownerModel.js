const mongoose = require("mongoose");
const OwnerSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: String,
  products: [],
  picture: String,
  gstin: String,
});

module.exports =new mongoose.model("Owner", OwnerSchema);
