import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'lenana',
  password: process.env.DB_PASS || 'admin',
  waitForConnections: true,
  connectionLimit: 10,
});

// 🚀 Connection Test and Logging
(async () => {
    try {
        // Attempt to get a connection from the pool and immediately release it
        const connection = await db.getConnection();
        console.log("✅ Database connected successfully!");
        connection.release();
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        // It's often helpful to exit the process if the DB connection is critical
        // process.exit(1); 
    }
})();