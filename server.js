const express = require("express");
require("dotenv").config();
const path = require("path");

// Importing DB Connection Method from DB Config
const connectDB = require("./config/db");

const app = express();

// Body Parser
app.use(express.json());

app.use("/", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, x-auth-token, Content-Type, Accept"
  );
  next();
});

// Defining Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/contacts", require("./routes/contacts"));

// Connecting MongoDB
connectDB();

// Serve static assets in Production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  );
}

// Setting up server port
const PORT = process.env.PORT || 5000;

// Starting Server
app.listen(PORT, (err, res) => {
  if (err) {
    console.error(`Error Occured while starting server! ${err}`);
  } else {
    console.log(`Server Started at Port ${PORT}...`);
  }
});