const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

class Database {
  constructor() {
    this.db = null;
    this.isConnected = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.db) {
        return resolve(this.db);
      }

      const dbPath = process.env.DB_PATH || './database/ai_platform.db';
      
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error connecting to database:', err.message);
          return reject(err);
        }
        
        console.log('Connected to SQLite database');
        this.isConnected = true;
        
        // Enable foreign key constraints
        this.db.run('PRAGMA foreign_keys = ON');
        
        resolve(this.db);
      });
    });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return resolve();
      }

      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
          return reject(err);
        }
        
        console.log('Database connection closed');
        this.db = null;
        this.isConnected = false;
        resolve();
      });
    });
  }

  // Utility method to run a query
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Database run error:', err.message, '\nSQL:', sql);
          return reject(err);
        }
        resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  // Utility method to get a single row
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Database get error:', err.message, '\nSQL:', sql);
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  // Utility method to get all rows
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Database all error:', err.message, '\nSQL:', sql);
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  // Transaction helper
  async transaction(callback) {
    try {
      await this.run('BEGIN TRANSACTION');
      const result = await callback(this);
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  // Prepared statement helper
  prepare(sql) {
    return this.db.prepare(sql);
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;