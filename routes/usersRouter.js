const express = require("express");
const router = express.Router();
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const productModel = require("../models/productModel");
// ✅ Test route
router.get("/", (req, res) => {
  res.send("User route working");
});

// ✅ Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send("All fields are required");
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send("User already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create user
    const createdUser = await userModel.create({
      name,
      email,
      password: hash,
    });

    // Create token
    const token = jwt.sign(
      { email: createdUser.email, id: createdUser._id },
      process.env.JWT_KEY
    );

    // Send cookie + response
    res.cookie("token", token, { httpOnly: true });
    // res.status(201).json({ message: "User registered", user: createdUser });
    const products = await productModel.find();
    res.status(201).render("products", { products });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Server error");
  }
});

// ✅ Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).send("Email and password are required");

    const user = await userModel.findOne({ email });
    if (!user) return res.status(403).send("Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Invalid email or password");

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_KEY
    );

    res.cookie("token", token);
    // res.status(200).send("Login successful");
    const products = await productModel.find();
    res.status(200).render("products", { products });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Something went wrong");
  }
});

module.exports = router;
