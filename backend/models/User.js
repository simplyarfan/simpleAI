const database = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(userData) {
    this.id = userData?.id;
    this.email = userData?.email;
    this.password_hash = userData?.password_hash;
    this.first_name = userData?.first_name;
    this.last_name = userData?.last_name;
    this.role = userData?.role || 'user';
    this.is_verified = userData?.is_verified || false;
    this.verification_token = userData?.verification_token;
    this.verification_expires = userData?.verification_expires;
    this.password_reset_token = userData?.password_reset_token;
    this.password_reset_expires = userData?.password_reset_expires;
    this.last_login = userData?.last_login;
    this.is_active = userData?.is_active !== undefined ? userData.is_active : true;
    this.profile_image = userData?.profile_image;
    this.department = userData?.department;
    this.job_title = userData?.job_title;
    this.created_at = userData?.created_at;
    this.updated_at = userData?.updated_at;
  }

  // Create a new user
  static async create(userData) {
    try {
      // Hash password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(userData.password, saltRounds);

      // Generate verification token
      const verification_token = uuidv4();
      const verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const sql = `
        INSERT INTO users (
          email, password_hash, first_name, last_name, role, 
          verification_token, verification_expires, department, job_title
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        userData.email.toLowerCase(),
        password_hash,
        userData.first_name,
        userData.last_name,
        userData.role || 'user',
        verification_token,
        verification_expires.toISOString(),
        userData.department || null,
        userData.job_title || null
      ];

      const result = await database.run(sql, params);
      
      // Get the created user
      const user = await User.findById(result.id);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM users WHERE id = ? AND is_active = 1';
      const row = await database.get(sql, [id]);
      return row ? new User(row) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const sql = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
      const row = await database.get(sql, [email.toLowerCase()]);
      return row ? new User(row) : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Find user by verification token
  static async findByVerificationToken(token) {
    try {
      const sql = `
        SELECT * FROM users 
        WHERE verification_token = ? AND verification_expires > datetime('now') 
        AND is_active = 1
      `;
      const row = await database.get(sql, [token]);
      return row ? new User(row) : null;
    } catch (error) {
      console.error('Error finding user by verification token:', error);
      throw error;
    }
  }

  // Find user by password reset token
  static async findByResetToken(token) {
    try {
      const sql = `
        SELECT * FROM users 
        WHERE password_reset_token = ? AND password_reset_expires > datetime('now')
        AND is_active = 1
      `;
      const row = await database.get(sql, [token]);
      return row ? new User(row) : null;
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      throw error;
    }
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Update user
  async update(updateData) {
    try {
      const allowedFields = [
        'first_name', 'last_name', 'department', 'job_title', 
        'profile_image', 'last_login', 'is_verified'
      ];
      
      const updates = [];
      const params = [];
      
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          params.push(updateData[key]);
        }
      });

      if (updates.length === 0) {
        return this;
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(this.id);

      const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      await database.run(sql, params);

      // Refresh user data
      const updatedUser = await User.findById(this.id);
      Object.assign(this, updatedUser);
      
      return this;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);
      
      const sql = `
        UPDATE users 
        SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await database.run(sql, [password_hash, this.id]);
      this.password_hash = password_hash;
      
      return this;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Verify email
  async verifyEmail() {
    try {
      const sql = `
        UPDATE users 
        SET is_verified = 1, verification_token = NULL, verification_expires = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await database.run(sql, [this.id]);
      this.is_verified = true;
      this.verification_token = null;
      this.verification_expires = null;
      
      return this;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  // Set password reset token
  async setPasswordResetToken() {
    try {
      const reset_token = uuidv4();
      const reset_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      const sql = `
        UPDATE users 
        SET password_reset_token = ?, password_reset_expires = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await database.run(sql, [reset_token, reset_expires.toISOString(), this.id]);
      this.password_reset_token = reset_token;
      this.password_reset_expires = reset_expires;
      
      return reset_token;
    } catch (error) {
      console.error('Error setting password reset token:', error);
      throw error;
    }
  }

  // Get all users (admin only)
  static async getAll(options = {}) {
    try {
      const { page = 1, limit = 20, role = null, search = null } = options;
      const offset = (page - 1) * limit;
      
      let sql = 'SELECT id, email, first_name, last_name, role, is_verified, last_login, department, job_title, created_at FROM users WHERE is_active = 1';
      const params = [];
      
      if (role) {
        sql += ' AND role = ?';
        params.push(role);
      }
      
      if (search) {
        sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const rows = await database.all(sql, params);
      
      // Get total count
      let countSql = 'SELECT COUNT(*) as total FROM users WHERE is_active = 1';
      const countParams = [];
      
      if (role) {
        countSql += ' AND role = ?';
        countParams.push(role);
      }
      
      if (search) {
        countSql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      const countResult = await database.get(countSql, countParams);
      
      return {
        users: rows.map(row => new User(row)),
        total: countResult.total,
        page,
        limit,
        totalPages: Math.ceil(countResult.total / limit)
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Get user statistics
  static async getStatistics() {
    try {
      const stats = {};
      
      // Total users
      const totalResult = await database.get('SELECT COUNT(*) as total FROM users WHERE is_active = 1');
      stats.total = totalResult.total;
      
      // Verified users
      const verifiedResult = await database.get('SELECT COUNT(*) as verified FROM users WHERE is_active = 1 AND is_verified = 1');
      stats.verified = verifiedResult.verified;
      
      // Users by role
      const roleStats = await database.all('SELECT role, COUNT(*) as count FROM users WHERE is_active = 1 GROUP BY role');
      stats.byRole = {};
      roleStats.forEach(row => {
        stats.byRole[row.role] = row.count;
      });
      
      // Recent registrations (last 30 days)
      const recentResult = await database.get(`
        SELECT COUNT(*) as recent 
        FROM users 
        WHERE is_active = 1 AND created_at > datetime('now', '-30 days')
      `);
      stats.recentRegistrations = recentResult.recent;
      
      return stats;
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }

  // Delete user (soft delete)
  async delete() {
    try {
      const sql = 'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await database.run(sql, [this.id]);
      this.is_active = false;
      return this;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Convert to JSON (excluding sensitive data)
  toJSON() {
    const { password_hash, verification_token, password_reset_token, ...safeUser } = this;
    return safeUser;
  }

  // Get full name
  get fullName() {
    return `${this.first_name} ${this.last_name}`;
  }

  // Check if user is admin or superadmin
  get isAdmin() {
    return ['admin', 'superadmin'].includes(this.role);
  }

  // Check if user is superadmin
  get isSuperAdmin() {
    return this.role === 'superadmin';
  }
}

module.exports = User;