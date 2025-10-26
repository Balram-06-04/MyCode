require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const ownersRouter=require("./routes/ownersRouter")
const usersRouter=require("./routes/usersRouter")
const productsRouter = require("./routes/productsRouter")
const connectDB = require("./config/mongoDB");
// Connect to MongoDB
connectDB();

const jwt = require("jsonwebtoken");
const userModel = require("./models/userModel");
const path = require("path");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.set("view engine", "ejs");


app.get("/", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      // No token → show login/register
      return res.render("index", { user: null });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      // Invalid user → clear token + show login/register
      res.clearCookie("token");
      return res.render("index", { user: null });
    }

    // ✅ If token valid → redirect to products page
    res.redirect("/products/getproducts");
  } catch (error) {
    console.error("Error verifying token:", error);
    res.clearCookie("token");
    res.render("index", { user: null });
  }
});

app.get("/adminCheck", (req, res) => {
  res.render("adminCheck");
})

// app.use("/register")
app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);

app.listen(PORT, () => {
  console.log("Server Running");
});
