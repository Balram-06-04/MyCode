const express = require("express");
const router = express.Router();
const ownerModel = require("../models/ownerModel");

router.post("/create", async (req, res) => {
  try {
    // Only allow creation in development mode
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).send("You don't have permission in production");
    }

    const owners = await ownerModel.find();
    if (owners.length >= 1) {
      return res.status(403).send("Owner already exists");
    }

    const { name, email, password, gstin } = req.body;
    const createdOwner = await ownerModel.create({
      name,
      email,
      password,
      gstin,
    });
    res.status(201).render("admin");
  } catch (error) {
    console.error("Error creating owner:", error);
    res.status(500).send("Something went wrong");
  }
});

// Default route
router.get("/", (req, res) => {
  res.send("Owner route working!");
});

module.exports = router;
