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

const path = require("path");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
})
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
