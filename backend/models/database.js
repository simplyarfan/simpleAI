const { Pool } = require('pg');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.tablesInitialized = false; // Reset to allow proper table creation
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
      
      // Connecting to PostgreSQL database
      
      this.pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false
        },
        max: 1, // Single connection for serverless
        min: 0,
        idleTimeoutMillis: 1000, // Very short for serverless
        connectionTimeoutMillis: 10000, // Shorter timeout
        acquireTimeoutMillis: 10000,
        createTimeoutMillis: 10000,
        destroyTimeoutMillis: 1000,
        allowExitOnIdle: true,
        statement_timeout: 5000, // 5 second query timeout
        query_timeout: 5000
      });
        
      // Test connection
      const testResult = await this.pool.query('SELECT NOW() as current_time');
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
    // Temporarily force re-initialization to create missing tables
    // if (this.tablesInitialized) {
    //   console.log('✅ Tables already initialized, skipping...');
    //   return;
    // }

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

      // Add missing columns if they don't exist
      try {
        await this.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0`);
        await this.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP`);
        console.log('✅ Added missing columns to users table');
      } catch (error) {
        console.log('ℹ️ Columns may already exist:', error.message);
      }

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

      // SIMPLIFIED CV INTELLIGENCE SCHEMA - NO FOREIGN KEY CONSTRAINTS
      // This will prevent the foreign key constraint errors
      
      console.log('🔧 Creating simplified CV Intelligence tables...');
      
      // Simple CV batches table
      await this.run(`
        CREATE TABLE IF NOT EXISTS cv_batches (
          id VARCHAR(255) PRIMARY KEY,
          user_id INTEGER NOT NULL,
          name VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'processing',
          total_resumes INTEGER DEFAULT 0,
          processed_resumes INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Simple candidates table
      await this.run(`
        CREATE TABLE IF NOT EXISTS candidates (
          id VARCHAR(255) PRIMARY KEY,
          batch_id VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          email VARCHAR(255),
          phone VARCHAR(50),
          location VARCHAR(255),
          profile_json TEXT,
          overall_score INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

      // Interview Coordinator tables (HR-02)
      console.log('🔧 Creating Interview Coordinator tables...');
      
      await this.run(`
        CREATE TABLE IF NOT EXISTS interviews (
          id VARCHAR(255) PRIMARY KEY,
          candidate_id VARCHAR(255) NOT NULL,
          candidate_name VARCHAR(255) NOT NULL,
          candidate_email VARCHAR(255) NOT NULL,
          job_title VARCHAR(255) NOT NULL,
          interview_type VARCHAR(50) DEFAULT 'technical',
          status VARCHAR(50) DEFAULT 'scheduled',
          scheduled_time TIMESTAMP,
          duration INTEGER DEFAULT 60,
          location VARCHAR(255) DEFAULT 'Video Call',
          meeting_link TEXT,
          calendly_link TEXT,
          google_form_link TEXT,
          panel_members TEXT,
          generated_questions TEXT,
          notes TEXT,
          scheduled_by INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.run(`CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_by ON interviews(scheduled_by)`);
      await this.run(`CREATE INDEX IF NOT EXISTS idx_interviews_candidate_email ON interviews(candidate_email)`);
      await this.run(`CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_time ON interviews(scheduled_time)`);
      await this.run(`CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status)`);

      await this.run(`
        CREATE TABLE IF NOT EXISTS interview_reminders (
          id VARCHAR(255) PRIMARY KEY,
          interview_id VARCHAR(255) NOT NULL,
          reminder_type VARCHAR(50) NOT NULL,
          recipient_email VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          send_at TIMESTAMP NOT NULL,
          sent BOOLEAN DEFAULT FALSE,
          sent_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
        )
      `);

      await this.run(`CREATE INDEX IF NOT EXISTS idx_interview_reminders_interview_id ON interview_reminders(interview_id)`);
      await this.run(`CREATE INDEX IF NOT EXISTS idx_interview_reminders_send_at ON interview_reminders(send_at)`);
      await this.run(`CREATE INDEX IF NOT EXISTS idx_interview_reminders_sent ON interview_reminders(sent)`);

      // Add Outlook OAuth columns to users table
      try {
        await this.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS outlook_access_token TEXT`);
        await this.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS outlook_refresh_token TEXT`);
        await this.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS outlook_token_expires_at TIMESTAMP`);
        console.log('✅ Added Outlook OAuth columns to users table');
      } catch (error) {
        console.log('ℹ️ Outlook columns may already exist:', error.message);
      }

      console.log('✅ Interview Coordinator tables initialized successfully');
      console.log('✅ All PostgreSQL tables initialized successfully');
      await this.createDefaultAdmin();
      this.tablesInitialized = true;
      
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
        const defaultPassword = 'admin123'; // Simple password for testing
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);
        
        await this.run(`
          INSERT INTO users (
            email, password_hash, first_name, last_name, role, 
            department, job_title, is_verified, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          adminEmail,
          hashedPassword,
          'System',
          'Administrator',
          'superadmin',
          'IT',
          'System Administrator',
          true,
          true
        ]);
        
        console.log(`✅ Default admin created: ${adminEmail}`);
        console.log('🔑 Default password: admin123');
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
