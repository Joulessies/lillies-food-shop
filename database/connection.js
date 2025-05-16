const sqlite3 = require("sqlite3").verbose();

// Update this path to your actual database location
const dbPath = "./data/lillies-food-shop.db";

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

module.exports = db;
