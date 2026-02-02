// Importing sqlite3.
const sqlite3 = require('sqlite3')

// Path.
const path = require('path');

// Import the database. We will instantiate it calling it "db".
const dbPath = path.resolve(__dirname, '../data/database.db');
const db = new sqlite3.Database(dbPath);

// Exports only the connection object
// This allows any other file in the project to use the SAME database
module.exports = db;
