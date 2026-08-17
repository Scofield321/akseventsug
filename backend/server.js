const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./router/authRoutes");
const eventRoutes = require("./router/eventRoutes");
const eventMediaRoutes = require("./router/eventMediaRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Sound Events API is running!",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/event-media", eventMediaRoutes);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await pool.query("SELECT NOW()");

    console.log("🟢 Database connection successful");

    app.listen(PORT, () => {
      console.log(`🚀 Sound Events API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("🔴 Database connection failed:");
    console.error(error.message);

    process.exit(1);
  }
};

startServer();
