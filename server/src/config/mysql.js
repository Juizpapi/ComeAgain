import mysql from "mysql2/promise";

const mysqlConnection = mysql.createPool({
  host: "localhost",
  port: 8889,
  user: "root",
  password: "root",
  database: "comeagain",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default mysqlConnection;