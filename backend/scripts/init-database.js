const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './database/ai_platform.db';

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
});

// Create tables
const createTables = () => {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'user')) DEFAULT 'user',
      is_verified BOOLEAN DEFAULT 0,
      verification_token TEXT,
      verification_expires DATETIME,
      password_reset_token TEXT,
      password_reset_expires DATETIME,
      last_login DATETIME,
      is_active BOOLEAN DEFAULT 1,
      profile_image TEXT,
      department TEXT,
      job_title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // User sessions table
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      refresh_token TEXT UNIQUE NOT NULL,
      device_info TEXT,
      ip_address TEXT,
      user_agent TEXT,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`,

    // CV Intelligence batches table
    `CREATE TABLE IF NOT EXISTS cv_batches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
      cv_count INTEGER DEFAULT 0,
      jd_count INTEGER DEFAULT 0,
      candidate_count INTEGER DEFAULT 0,
      processing_time INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`,

    // CV batch candidates table
    `CREATE TABLE IF NOT EXISTS cv_candidates (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      name TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      score INTEGER DEFAULT 0,
      analysis_data TEXT, -- JSON data
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (batch_id) REFERENCES cv_batches (id) ON DELETE CASCADE
    )`,

    // User analytics table
    `CREATE TABLE IF NOT EXISTS user_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      agent_id TEXT,
      metadata TEXT, -- JSON data
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`,

    // Support tickets table
    `CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
      category TEXT DEFAULT 'general' CHECK (category IN ('general', 'bug', 'feature_request', 'technical_support')),
      assigned_to INTEGER,
      resolution TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL
    )`,

    // Ticket comments table
    `CREATE TABLE IF NOT EXISTS ticket_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      is_internal BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES support_tickets (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`,

    // System settings table
    `CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // User preferences table
    `CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
      notifications_email BOOLEAN DEFAULT 1,
      notifications_browser BOOLEAN DEFAULT 1,
      language TEXT DEFAULT 'en',
      timezone TEXT DEFAULT 'UTC',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`,

    // Agent usage statistics table
    `CREATE TABLE IF NOT EXISTS agent_usage_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      agent_id TEXT NOT NULL,
      usage_count INTEGER DEFAULT 1,
      total_time_spent INTEGER DEFAULT 0, -- in seconds
      last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
      date TEXT NOT NULL, -- YYYY-MM-DD format for daily aggregation
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(user_id, agent_id, date)
    )`
  ];

  // Execute table creation
  tables.forEach((tableSQL, index) => {
    db.run(tableSQL, (err) => {
      if (err) {
        console.error(`Error creating table ${index + 1}:`, err.message);
      } else {
        console.log(`Table ${index + 1} created successfully.`);
      }
    });
  });
};

// Create indexes for better performance
const createIndexes = () => {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
    'CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at)',
    'CREATE INDEX IF NOT EXISTS idx_cv_batches_user_id ON cv_batches(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_cv_candidates_batch_id ON cv_candidates(batch_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status)',
    'CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id)',
    'CREATE INDEX IF NOT EXISTS idx_agent_usage_stats_user_agent ON agent_usage_stats(user_id, agent_id)',
    'CREATE INDEX IF NOT EXISTS idx_agent_usage_stats_date ON agent_usage_stats(date)'
  ];

  indexes.forEach((indexSQL, index) => {
    db.run(indexSQL, (err) => {
      if (err) {
        console.error(`Error creating index ${index + 1}:`, err.message);
      } else {
        console.log(`Index ${index + 1} created successfully.`);
      }
    });
  });
};

// Initialize database
const initializeDatabase = () => {
  console.log('Initializing database...');
  
  db.serialize(() => {
    // Enable foreign key constraints
    db.run('PRAGMA foreign_keys = ON');
    
    // Create tables
    createTables();
    
    // Create indexes
    createIndexes();
    
    // Insert default system settings
    const defaultSettings = [
      ['app_name', 'Enterprise AI Hub', 'Application name'],
      ['app_version', '1.0.0', 'Application version'],
      ['company_name', 'SecureMaxTech', 'Company name'],
      ['company_domain', 'securemaxtech.com', 'Allowed company domain'],
      ['registration_enabled', 'true', 'Whether new user registration is enabled'],
      ['email_verification_required', 'true', 'Whether email verification is required for new users'],
      ['maintenance_mode', 'false', 'Whether the application is in maintenance mode']
    ];

    const insertSettings = db.prepare(`
      INSERT OR IGNORE INTO system_settings (key, value, description) 
      VALUES (?, ?, ?)
    `);

    defaultSettings.forEach(([key, value, description]) => {
      insertSettings.run(key, value, description);
    });

    insertSettings.finalize();
  });

  console.log('Database initialization completed!');
  
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
};

// Run initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };