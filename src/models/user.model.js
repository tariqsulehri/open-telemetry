const { connection } = require("../config/db.mysql");

const createUsersTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      user_id  VARCHAR(50),
      user_source VARCHAR(50) DEFAULT 'local',
      password VARCHAR(255) NOT NULL,
      role INT,
      email VARCHAR(255) NOT NULL,
      is_active TINYINT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;

  /**
   *  alter table users drop constraint fk_users_role;
   */ 

  try {
    await connection.query(sql);
  } catch (err) {
  }
};

module.exports = {
  createUsersTable
};
