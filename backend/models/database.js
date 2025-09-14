const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
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

      // For Vercel, use in-memory database
      const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
      const dbPath = isVercel ? ':memory:' : (process.env.DB_PATH || './database/ai_platform.db');
      
      // Ensure directory exists for local development
      if (!isVercel && dbPath !== ':memory:') {
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }
      }
      
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error connecting to database:', err.message);
          return reject(err);
        }
        
        console.log(`✅ Connected to SQLite database: ${isVercel ? 'in-memory' : dbPath}`);
        this.isConnected = true;
        
        // Enable foreign key constraints
        this.db.run('PRAGMA foreign_keys = ON');
        
        // Initialize tables for in-memory database
        if (isVercel) {
          this.initializeTables().then(() => resolve(this.db)).catch(reject);
        } else {
          resolve(this.db);
        }
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

  // Initialize tables - this method is called from server.js
  async initializeTables() {
    try {
      // Users table
      await this.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          department TEXT,
          job_title TEXT,
          is_active BOOLEAN DEFAULT 1,
          is_verified BOOLEAN DEFAULT 0,
          verification_token TEXT,
          verification_expiry TEXT,
          reset_token TEXT,
          reset_token_expiry TEXT,
          last_login TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // User sessions table
      await this.run(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          session_token TEXT UNIQUE NOT NULL,
          refresh_token TEXT UNIQUE NOT NULL,
          expires_at TEXT NOT NULL,
          ip_address TEXT,
          user_agent TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // User preferences table
      await this.run(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER UNIQUE NOT NULL,
          theme TEXT DEFAULT 'light',
          notifications_email BOOLEAN DEFAULT 1,
          notifications_browser BOOLEAN DEFAULT 1,
          language TEXT DEFAULT 'en',
          timezone TEXT DEFAULT 'UTC',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // User analytics table
      await this.run(`
        CREATE TABLE IF NOT EXISTS user_analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          action TEXT NOT NULL,
          agent_id TEXT,
          metadata TEXT,
          ip_address TEXT,
          user_agent TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
        )
      `);

      // Agent usage stats table
      await this.run(`
        CREATE TABLE IF NOT EXISTS agent_usage_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          agent_id TEXT NOT NULL,
          usage_count INTEGER DEFAULT 0,
          total_time_spent INTEGER DEFAULT 0,
          date TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          UNIQUE(user_id, agent_id, date)
        )
      `);

      // CV batches table
      await this.run(`
        CREATE TABLE IF NOT EXISTS cv_batches (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          user_id INTEGER NOT NULL,
          status TEXT DEFAULT 'processing',
          cv_count INTEGER DEFAULT 0,
          jd_count INTEGER DEFAULT 0,
          candidate_count INTEGER DEFAULT 0,
          processing_time INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // CV candidates table
      await this.run(`
        CREATE TABLE IF NOT EXISTS cv_candidates (
          id TEXT PRIMARY KEY,
          batch_id TEXT NOT NULL,
          filename TEXT NOT NULL,
          name TEXT,
          email TEXT,
          phone TEXT,
          location TEXT,
          score INTEGER DEFAULT 0,
          analysis_data TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (batch_id) REFERENCES cv_batches (id) ON DELETE CASCADE
        )
      `);

      // Support tickets table
      await this.run(`
        CREATE TABLE IF NOT EXISTS support_tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          subject TEXT NOT NULL,
          description TEXT NOT NULL,
          status TEXT DEFAULT 'open',
          priority TEXT DEFAULT 'medium',
          category TEXT DEFAULT 'general',
          assigned_to INTEGER,
          resolution TEXT,
          resolved_at TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL
        )
      `);

      // Ticket comments table
      await this.run(`
        CREATE TABLE IF NOT EXISTS ticket_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ticket_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          comment TEXT NOT NULL,
          is_internal BOOLEAN DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ticket_id) REFERENCES support_tickets (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // System settings table
      await this.run(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT NOT NULL,
          description TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Database tables initialized successfully');
      
      // Create admin user if it doesn't exist
      await this.createAdminUser();
      
    } catch (error) {
      console.error('❌ Error initializing database tables:', error);
      throw error;
    }
  }

  // Create admin user for in-memory database
  async createAdminUser() {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'syedarfan@securemaxtech.com';
      
      // Check if admin user exists
      const existingAdmin = await this.get('SELECT id FROM users WHERE email = ?', [adminEmail]);
      
      if (!existingAdmin) {
        const bcrypt = require('bcrypt');
        const { v4: uuidv4 } = require('uuid');
        
        const hashedPassword = await bcrypt.hash('TempPassword123!', 10);
        
        await this.run(`
          INSERT INTO users (
            email, password_hash, first_name, last_name, role, 
            department, job_title, is_verified
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          adminEmail,
          hashedPassword,
          'System',
          'Administrator',
          'superadmin',
          'IT',
          'System Administrator',
          1 // Pre-verified
        ]);
        
        console.log(`✅ Admin user created: ${adminEmail}`);
        console.log('🔑 Default password: TempPassword123! (CHANGE IMMEDIATELY!)');
      }
    } catch (error) {
      console.error('❌ Error creating admin user:', error);
    }
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;