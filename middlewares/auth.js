const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect("/"); // redirect to login page

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) return res.redirect("/");

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.clearCookie("token");
    return res.render("products");
  }
};
