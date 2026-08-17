const bcrypt = require("bcrypt");
const { findAdminByUsername } = require("../models/adminModel");
const generateToken = require("../utils/generateToken");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const admin = await findAdminByUsername(username);

    if (!admin) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = generateToken(admin);

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error("🔴 Login error:", error);

    res.status(500).json({
      message: "Server error during login",
    });
  }
};

module.exports = {
  login,
};
