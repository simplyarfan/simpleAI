const { Pool } = require('pg');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected && this.pool) {
      return this.pool;
    }

    try {
      // Use Vercel's database environment variables
      const connectionString = process.env.DATABASE_URL || 
                              process.env.POSTGRES_URL || 
                              process.env.DATABASE_URL_UNPOOLED;
      
      if (!connectionString) {
        throw new Error('No database connection string found. Please set DATABASE_URL or POSTGRES_URL environment variable.');
      }
      
      console.log('🔗 Connecting to Neon PostgreSQL database...');
      console.log('🔗 Connection string format:', connectionString.substring(0, 20) + '...');
      
      this.pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false // Required for Neon and most cloud PostgreSQL services
        },
        max: 20,
        min: 2,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        acquireTimeoutMillis: 60000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
      });
        
      // Test connection
      const testResult = await this.pool.query('SELECT NOW() as current_time, version() as pg_version');
      console.log('✅ Connected to PostgreSQL at:', testResult.rows[0].current_time);
      console.log('✅ PostgreSQL version:', testResult.rows[0].pg_version);
      this.isConnected = true;
      
      // Initialize tables
      await this.initializeTables();
      return this.pool;
        
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('❌ Full error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.pool) {
      try {
        await this.pool.end();
        console.log('🔌 Database connection closed');
        this.pool = null;
        this.isConnected = false;
      } catch (error) {
        console.error('Error closing database:', error.message);
        throw error;
      }
    }
  }

  // Query methods
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

  async get(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Database get error:', error.message, '\nSQL:', sql);
      throw error;
    }
  }

  async all(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Database all error:', error.message, '\nSQL:', sql);
      throw error;
    }
  }

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

  async initializeTables() {
    try {
      console.log('🔧 Initializing PostgreSQL tables...');

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

      // Notifications table
      await this.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          metadata JSON,
          is_read BOOLEAN DEFAULT false,
          read_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

      console.log('✅ All PostgreSQL tables initialized successfully');
      await this.createDefaultAdmin();
      
    } catch (error) {
      console.error('❌ Error initializing database tables:', error);
      throw error;
    }
  }

  async createDefaultAdmin() {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'syedarfan@securemaxtech.com';
      
      const existingAdmin = await this.get('SELECT id FROM users WHERE email = $1', [adminEmail]);
      
      if (!existingAdmin) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('AdminPassword123!', 12);
        
        await this.run(`
          INSERT INTO users (
            email, password_hash, first_name, last_name, role, 
            department, job_title, is_verified
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          adminEmail,
          hashedPassword,
          'System',
          'Administrator',
          'superadmin',
          'IT',
          'System Administrator',
          true
        ]);
        
        console.log(`✅ Default admin created: ${adminEmail}`);
        console.log('🔑 Default password: AdminPassword123! (CHANGE IMMEDIATELY!)');
      } else {
        console.log('✅ Admin user already exists');
      }
    } catch (error) {
      console.error('❌ Error creating default admin:', error);
    }
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;
