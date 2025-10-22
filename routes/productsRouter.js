const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const auth = require("../middlewares/auth");

// ---------- Multer setup ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads/images"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

router.get("/", (req, res) => {
  res.send("Product route working ✅");
});

// Add new product
router.post("/addproduct", upload.single("image"), async (req, res) => {
  try {
    const { name, price, discount, bgColor, panelColor, textColor } = req.body;

    // Store public-facing path (not full local path)
    const image = req.file ? "/uploads/images/" + req.file.filename : null;

    // Save the product in DB
    await productModel.create({
      image,
      name,
      price,
      discount,
      bgColor,
      panelColor,
      textColor,
    });

    // After adding, redirect to the products page
    res.redirect("/products/getproducts");
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).send("Failed to create product");
  }
});

// Get all products and render EJS page
router.get("/getproducts", auth, async (req, res) => {
  try {
    const products = await productModel.find();
    const sortType = ""; // default value
    res.render("products", { products, sortType });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({ success: false, error: "Failed to fetch products" });
  }
});

router.get("/addtocart/:productid", auth, async (req, res) => {
  try {
    // Find the logged-in user (attached by auth middleware)
    const user = await userModel.findOne({ email: req.user.email });

    if (!user) return res.status(404).send("User not found");

    // Add product to their cart
    user.cart.push(req.params.productid);
    await user.save();

    res.redirect("/products/getproducts");
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).send("Error adding to cart");
  }
});

router.get("/cart", auth, async (req, res) => {
  try {
    const user = await userModel
      .findOne({ email: req.user.email })
      .populate("cart");

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("cart", { cart: user.cart, user });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).send("Something went wrong");
  }
});

// Show products with sorting
router.get("/sortproducts", async (req, res) => {
  try {
    const sortType = req.query.sort || ""; // get query parameter

    let sortOption = {};

    switch (sortType) {
      case "lowtohigh":
        sortOption = { price: -1 };
        break;
      case "hightolow":
        sortOption = { price: 1 };
        break;
      case "nameAZ":
        sortOption = { name: -1 };
        break;
      case "nameZA":
        sortOption = { name: 1 };
        break;
      default:
        sortOption = {};
    }

    const products = await productModel.find().sort(sortOption);

    res.render("products", { products, sortType });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
router.get("/searchproducts", async (req, res) => {
  try {
    // Use req.query for GET requests
    const searchTerm = req.query.productSearch;

    // Case-insensitive search using regex
    const products = await productModel.find({
      name: { $regex: searchTerm, $options: "i" },
    });

    if (products.length === 0) {
      return res.status(404).send("Product not found");
    }

    res.render("products", { products });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Product Not Found");
  }
});

router.get("/removefromcart/:productid", auth, async (req, res) => {
  try {
    await userModel.updateOne(
      { _id: req.user._id },
      { $pull: { cart: req.params.productid } }
    );

    res.redirect("/products/cart");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error removing from cart");
  }
});



module.exports = router;
