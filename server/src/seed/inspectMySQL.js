import mysqlConnection from "../config/mysql.js";

const inspectDatabase = async () => {
  try {
    console.log("🔍 Connecting to MySQL...");

    const tables = ["users", "foods", "orders", "order_items"];

    for (const table of tables) {
      const [rows] = await mysqlConnection.query(
        `SELECT * FROM ${table} LIMIT 5`
      );

      console.log("\n==============================");
      console.log(`TABLE: ${table}`);
      console.log("==============================");
      console.table(rows);

      const [count] = await mysqlConnection.query(
        `SELECT COUNT(*) AS total FROM ${table}`
      );

      console.log(`Total Records: ${count[0].total}`);
    }

    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

inspectDatabase();