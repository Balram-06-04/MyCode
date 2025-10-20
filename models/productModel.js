const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema({
  image: String,
  name: {
    type: String,
    trim: true,
  },
  price: Number,
  discount: {
    type: Number,
    default: 0,
  },
  bgColor: String,
  panelColor: String,
  textColor: String,
});

module.exports = new mongoose.model("Product", ProductSchema);
