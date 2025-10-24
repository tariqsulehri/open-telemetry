const { connection } = require("../config/db.mysql");

const createRoleTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rolename VARCHAR(50) NOT NULL UNIQUE,
      description VARCHAR(255) NOT NULL,
      is_active TINYINT DEFAULT 1,
      created_by INT,
      updated_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT fk_roles_user_id FOREIGN KEY (created_by) REFERENCES users(id),
      CONSTRAINT fk_roles_user_id1 FOREIGN KEY (updated_by) REFERENCES users(id));
      `;

  /**
   *  ALTER TABLE roles drop constraint fk_roles_user_id;
   *  ALTER TABLE roles drop constraint fk_roles_user_id1;
   * -- ALTER table users add constraint fk_users_role  FOREIGN KEY (role) REFERENCES roles(id); 
   * -- INSERT INTO roles (rolename, description, is_active) VALUES('admin', 'User role  with limited access on objects.', 1);
   *   
   */

  try {
    await connection.query(sql);
  } catch (err) {}
};

module.exports = {
  createRoleTable,
};
