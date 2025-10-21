const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

module.exports = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;
    if (!token) return res.status(401).send("Please login first");

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_KEY); // use same secret as login

    // Find user
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) return res.status(404).send("User not found");

    // Attach to req
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).send("Unauthorized");
  }
};
