const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "C00l_2009$",
    database: "EmpMgmtDB"  // Updated to the refactored database name
});

module.exports = connection;
