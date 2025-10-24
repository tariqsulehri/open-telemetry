const { connection } = require("../../config/db.mysql");

const executeQuery = async (sql, params) => {
  try {
    const [result] = await connection.query(sql, params);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  executeQuery,
};
