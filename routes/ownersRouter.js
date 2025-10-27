const express = require("express");
const router = express.Router();
const ownerModel = require("../models/ownerModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
// Default route
router.get("/", (req, res) => {
  res.send("Owner route working!");
});

router.post("/register", async (req, res) => {
  try {
    // Only allow creation in development mode
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).send("You don't have permission in production");
    }

    const owners = await ownerModel.find();
    if (owners.length >= 1) {
      return res.status(403).send("Owner already exists");
    }

    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const createdOwner = await ownerModel.create({
      name,
      email,
      password: hash,
    });
    res.status(201).render("admin");
  } catch (error) {
    console.error("Error creating owner:", error);
    res.status(500).send("Something went wrong");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).send("Email and password are required");

    const owner = await ownerModel.findOne({ email });
    if (!owner) return res.status(403).send("Invalid email or password");

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) return res.status(401).send("Invalid email or password");

    const token = jwt.sign(
      { email: owner.email, id: owner._id },
      process.env.JWT_KEY
    );

    res.cookie("token", token);
    // res.status(200).send("Login successful");
    res.status(200).render("admin");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Something went wrong");
  }
});

router.get("/adminCheck", (req, res) => {
  res.render("adminCheck");
});

module.exports = router;
