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

      // CLEAN UP OLD CONFLICTING TABLES FIRST
      try {
        await this.run('DROP TABLE IF EXISTS cv_candidates CASCADE');
        await this.run('DROP TABLE IF EXISTS cv_batches CASCADE');
        console.log('🧹 Cleaned up old CV tables');
      } catch (error) {
        console.log('⚠️ Old tables cleanup:', error.message);
      }

      // HR-01 BLUEPRINT SCHEMA - CORRECT ORDER (no foreign keys first)
      
      // 1. Jobs table (no foreign key dependencies except users)
      await this.run(`
        CREATE TABLE IF NOT EXISTS jobs (
          id VARCHAR(255) PRIMARY KEY,
          user_id INTEGER NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          requirements_json TEXT NOT NULL,
          embedding TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // 2. Raw resumes storage (no foreign key dependencies except users)
      await this.run(`
        CREATE TABLE IF NOT EXISTS resumes_raw (
          id VARCHAR(255) PRIMARY KEY,
          user_id INTEGER NOT NULL,
          filename VARCHAR(255) NOT NULL,
          file_url TEXT NOT NULL,
          file_size INTEGER,
          file_type VARCHAR(50),
          upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          raw_text TEXT,
          processing_status VARCHAR(50) DEFAULT 'pending',
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // 3. CV batches (depends on jobs table)
      await this.run(`
        CREATE TABLE IF NOT EXISTS cv_batches (
          id VARCHAR(255) PRIMARY KEY,
          user_id INTEGER NOT NULL,
          job_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'processing',
          total_resumes INTEGER DEFAULT 0,
          processed_resumes INTEGER DEFAULT 0,
          processing_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          processing_completed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
        )
      `);

      // 4. Resume entities (depends on resumes_raw)
      await this.run(`
        CREATE TABLE IF NOT EXISTS resume_entities (
          id VARCHAR(255) PRIMARY KEY,
          resume_id VARCHAR(255) NOT NULL,
          entity_type VARCHAR(50) NOT NULL,
          entity_value TEXT NOT NULL,
          confidence_score FLOAT DEFAULT 0.0,
          start_offset INTEGER,
          end_offset INTEGER,
          spacy_label VARCHAR(50),
          context_window TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (resume_id) REFERENCES resumes_raw(id) ON DELETE CASCADE
        )
      `);

      // 5. Candidates (depends on cv_batches and resumes_raw)
      await this.run(`
        CREATE TABLE IF NOT EXISTS candidates (
          id VARCHAR(255) PRIMARY KEY,
          batch_id VARCHAR(255) NOT NULL,
          resume_id VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          email VARCHAR(255),
          phone VARCHAR(50),
          location VARCHAR(255),
          linkedin_url TEXT,
          profile_json TEXT NOT NULL,
          must_have_score INTEGER DEFAULT 0,
          semantic_score INTEGER DEFAULT 0,
          recency_score INTEGER DEFAULT 0,
          impact_score INTEGER DEFAULT 0,
          overall_score INTEGER DEFAULT 0,
          evidence_offsets TEXT,
          verification_data TEXT,
          processing_time_ms INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (batch_id) REFERENCES cv_batches(id) ON DELETE CASCADE,
          FOREIGN KEY (resume_id) REFERENCES resumes_raw(id) ON DELETE CASCADE
        )
      `);

      // 6. Metrics events (depends on cv_batches and resumes_raw)
      await this.run(`
        CREATE TABLE IF NOT EXISTS metrics_events (
          id VARCHAR(255) PRIMARY KEY,
          batch_id VARCHAR(255) NOT NULL,
          resume_id VARCHAR(255) NOT NULL,
          event_type VARCHAR(50) NOT NULL,
          event_data TEXT NOT NULL,
          field_validity_rate FLOAT,
          evidence_coverage FLOAT,
          disagreement_rate FLOAT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (batch_id) REFERENCES cv_batches(id) ON DELETE CASCADE,
          FOREIGN KEY (resume_id) REFERENCES resumes_raw(id) ON DELETE CASCADE
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
