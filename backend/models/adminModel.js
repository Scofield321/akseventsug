const pool = require("../config/db");

const findAdminByUsername = async (username) => {
  const result = await pool.query(
    "SELECT id, username, password_hash FROM admins WHERE username = $1",
    [username]
  );

  return result.rows[0];
};

module.exports = {
  findAdminByUsername,
};
