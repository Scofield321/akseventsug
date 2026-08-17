const bcrypt = require("bcrypt");
const pool = require("./config/db");
require("dotenv").config();

const createAdmin = async () => {
  try {
    const username = "admin";
    const password = "ChangeMe123!";

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO admins (username, password_hash)
       VALUES ($1, $2)`,
      [username, passwordHash]
    );

    console.log("🟢 Admin created successfully");
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);

    await pool.end();
  } catch (error) {
    console.error("🔴 Failed to create admin:", error.message);
    await pool.end();
  }
};

createAdmin();