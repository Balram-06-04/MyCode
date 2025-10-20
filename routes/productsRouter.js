const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const productModel = require("../models/productModel");

// ---------- Multer setup ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads/images"));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ---------- Routes ----------

// ✅ Test route
router.get("/", (req, res) => {
  res.send("Product route working ✅");
});

// ✅ Add new product
router.post("/addproduct", upload.single("image"), async (req, res) => {
  try {
    const { name, price, discount, bgColor, panelColor, textColor } = req.body;

    // Store public-facing path (not full local path)
    const image = req.file ? "/uploads/images/" + req.file.filename : null;

    const newProduct = await productModel.create({
      image,
      name,
      price,
      discount,
      bgColor,
      panelColor,
      textColor,
    });

    res.status(201).send({
      success: true,
      message: "Product added successfully!",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).send({ success: false, error: "Failed to create product" });
  }
});

// ✅ Get all products and render EJS page
router.get("/getproducts", async (req, res) => {
  try {
    const products = await productModel.find();
    res.render("products", { products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({ success: false, error: "Failed to fetch products" });
  }
});

module.exports = router;
