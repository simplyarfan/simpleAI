const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  connect() {
    return new Promise(async (resolve, reject) => {
      if (this.isConnected && this.pool) {
        return resolve(this.pool);
      }

      try {
        // Use PostgreSQL for production (Vercel Postgres)
        this.pool = new Pool({
          connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        // Test connection
        await this.pool.query('SELECT NOW()');
        console.log('✅ Connected to PostgreSQL database');
        this.isConnected = true;
        
        // Initialize tables
        await this.initializeTables();
        resolve(this.pool);
        
      } catch (error) {
        console.error('Error connecting to database:', error.message);
        reject(error);
      }
    });
  }

  async disconnect() {
    if (!this.pool) {
      return;
    }

    try {
      await this.pool.end();
      console.log('Database connection closed');
      this.pool = null;
      this.isConnected = false;
    } catch (error) {
      console.error('Error closing database:', error.message);
      throw error;
    }
  }

  // Utility method to run a query
  async run(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return { 
        id: result.rows[0]?.id || null, 
        changes: result.rowCount || 0,
        rows: result.rows 
      };
    } catch (error) {
      console.error('Database run error:', error.message, '\nSQL:', sql);
      throw error;
    }
  }

  // Utility method to get a single row
  async get(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Database get error:', error.message, '\nSQL:', sql);
      throw error;
    }
  }

  // Utility method to get all rows
  async all(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Database all error:', error.message, '\nSQL:', sql);
      throw error;
    }
  }

  // Transaction helper
  async transaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(this);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Initialize tables - this method is called from server.js
  async initializeTables() {
    try {
      // Users table
      await this.run(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          department VARCHAR(100),
          job_title VARCHAR(100),
          is_active BOOLEAN DEFAULT true,
          is_verified BOOLEAN DEFAULT false,
          verification_token VARCHAR(255),
          verification_expiry TIMESTAMP,
          reset_token VARCHAR(255),
          reset_token_expiry TIMESTAMP,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // User sessions table
      await this.run(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          refresh_token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // User preferences table
      await this.run(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          id SERIAL PRIMARY KEY,
          user_id INTEGER UNIQUE NOT NULL,
          theme VARCHAR(20) DEFAULT 'light',
          notifications_email BOOLEAN DEFAULT true,
          notifications_browser BOOLEAN DEFAULT true,
          language VARCHAR(10) DEFAULT 'en',
          timezone VARCHAR(50) DEFAULT 'UTC',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // User analytics table
      await this.run(`
        CREATE TABLE IF NOT EXISTS user_analytics (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          action VARCHAR(100) NOT NULL,
          agent_id VARCHAR(100),
          metadata JSONB,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
        )
      `);

      // Agent usage stats table
      await this.run(`
        CREATE TABLE IF NOT EXISTS agent_usage_stats (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          agent_id VARCHAR(100) NOT NULL,
          usage_count INTEGER DEFAULT 0,
          total_time_spent INTEGER DEFAULT 0,
          date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          UNIQUE(user_id, agent_id, date)
        )
      `);

      // CV batches table
      await this.run(`
        CREATE TABLE IF NOT EXISTS cv_batches (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          user_id INTEGER NOT NULL,
          status VARCHAR(50) DEFAULT 'processing',
          cv_count INTEGER DEFAULT 0,
          jd_count INTEGER DEFAULT 0,
          candidate_count INTEGER DEFAULT 0,
          processing_time INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // CV candidates table
      await this.run(`
        CREATE TABLE IF NOT EXISTS cv_candidates (
          id VARCHAR(255) PRIMARY KEY,
          batch_id VARCHAR(255) NOT NULL,
          filename VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          email VARCHAR(255),
          phone VARCHAR(50),
          location VARCHAR(255),
          score INTEGER DEFAULT 0,
          analysis_data JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (batch_id) REFERENCES cv_batches (id) ON DELETE CASCADE
        )
      `);

      // Support tickets table
      await this.run(`
        CREATE TABLE IF NOT EXISTS support_tickets (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          subject VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'open',
          priority VARCHAR(20) DEFAULT 'medium',
          category VARCHAR(50) DEFAULT 'general',
          assigned_to INTEGER,
          resolution TEXT,
          resolved_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL
        )
      `);

      // Ticket comments table
      await this.run(`
        CREATE TABLE IF NOT EXISTS ticket_comments (
          id SERIAL PRIMARY KEY,
          ticket_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          comment TEXT NOT NULL,
          is_internal BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ticket_id) REFERENCES support_tickets (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // System settings table
      await this.run(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(100) UNIQUE NOT NULL,
          value TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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