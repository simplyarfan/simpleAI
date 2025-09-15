  // Get all users (superadmin only)
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, role, search } = req.query;
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        role: role || null,
        search: search || null
      };

      const result = await User.getAll(options);

      res.json({
        success: true,
        data: {
          users: result.users.map(user => user.toJSON()),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
          }
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get user statistics (superadmin only)
  static async getUserStats(req, res) {
    try {
      const stats = await User.getStatistics();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get specific user (admin/superadmin only)
  static async getUser(req, res) {
    try {
      const { user_id } = req.params;

      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Create new user (superadmin only)
  static async createUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email, first_name, last_name, role = 'user', department, job_title, send_invitation = false } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Generate a temporary password
      const tempPassword = crypto.randomBytes(12).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Create user
      const userId = await User.create({
        email,
        password_hash: hashedPassword,
        first_name,
        last_name,
        role,
        department,
        job_title,
        is_verified: true
      });

      const user = await User.findById(userId);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: user.toJSON(),
          temporaryPassword: tempPassword // In production, send via email
        }
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update user (admin/superadmin only)
  static async updateUser(req, res) {
    try {
      const { user_id } = req.params;
      const { first_name, last_name, email, role, department, job_title, is_active } = req.body;

      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if requesting user can modify this user
      if (req.user.role !== 'superadmin' && user.role === 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot modify superadmin users'
        });
      }

      // Prepare update data
      const updateData = {};
      if (first_name !== undefined) updateData.first_name = first_name;
      if (last_name !== undefined) updateData.last_name = last_name;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined && req.user.role === 'superadmin') updateData.role = role;
      if (department !== undefined) updateData.department = department;
      if (job_title !== undefined) updateData.job_title = job_title;
      if (is_active !== undefined && req.user.role === 'superadmin') updateData.is_active = is_active;

      await user.update(updateData);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete user (superadmin only)
  static async deleteUser(req, res) {
    try {
      const { user_id } = req.params;

      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent deleting superadmin users unless current user is superadmin
      if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete superadmin users'
        });
      }

      // Prevent self-deletion
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      // Soft delete
      await user.delete();

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Change password for authenticated user
  static async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { current_password, new_password } = req.body;
      const userId = req.user.id;

      // Get current user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.verifyPassword(current_password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      await user.updatePassword(new_password);

      // Invalidate all other sessions (keep current session)
      const authHeader = req.headers['authorization'];
      const currentToken = authHeader && authHeader.split(' ')[1];
      
      await database.run(
        'DELETE FROM user_sessions WHERE user_id = $1 AND session_token != $2',
        [userId, currentToken]
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
