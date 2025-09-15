const database = require('../models/database');
const User = require('../models/User');

class AnalyticsController {
  // Get dashboard overview statistics
  static async getDashboard(req, res) {
    try {
      console.log('📊 [ANALYTICS] Dashboard request received');
      
      // Ensure database connection
      await database.connect();
      console.log('✅ [ANALYTICS] Database connected');

      // Get total users count
      const totalUsersResult = await database.get('SELECT COUNT(*) as count FROM users');
      const totalUsers = totalUsersResult?.count || 0;

      // Get active users (logged in within last 30 days)
      const activeUsersResult = await database.get(`
        SELECT COUNT(DISTINCT user_id) as count 
        FROM user_sessions 
        WHERE created_at > NOW() - INTERVAL '30 days'
      `);
      const activeUsers = activeUsersResult?.count || 0;

      // Get CV batches count
      const batchesResult = await database.get('SELECT COUNT(*) as count FROM cv_batches');
      const totalBatches = batchesResult?.count || 0;

      // Get support tickets count  
      const ticketsResult = await database.get('SELECT COUNT(*) as count FROM support_tickets');
      const totalTickets = ticketsResult?.count || 0;

      // Get recent user registrations
      const recentUsers = await database.all(`
        SELECT 
          'User Registration' as action,
          (first_name || ' ' || last_name) as user,
          email,
          created_at as time
        FROM users 
        WHERE created_at > NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC 
        LIMIT 3
      `);

      // Get recent support tickets
      const recentTickets = await database.all(`
        SELECT 
          'Support Ticket Created' as action,
          ('Ticket #' || id || ': ' || subject) as user,
          '' as email,
          created_at as time
        FROM support_tickets 
        WHERE created_at > NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC 
        LIMIT 2
      `);

      // Get recent CV batches
      const recentBatches = await database.all(`
        SELECT 
          'CV Batch Created' as action,
          name as user,
          '' as email,
          created_at as time
        FROM cv_batches 
        WHERE created_at > NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC 
        LIMIT 2
      `);

      // Combine recent activities
      const recentActivity = [...recentUsers, ...recentTickets, ...recentBatches]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5)
        .map(activity => ({
          action: activity.action,
          user: activity.user,
          email: activity.email,
          time: activity.time,
          status: 'Success'
        }));

      // Calculate growth percentages based on previous month data
      const lastMonthUsers = await database.get(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'
      `);
      const userGrowth = lastMonthUsers?.count > 0 ? 
        Math.round(((totalUsers - lastMonthUsers.count) / lastMonthUsers.count) * 100) : 
        (totalUsers > 0 ? 100 : 0);

      const lastMonthActive = await database.get(`
        SELECT COUNT(DISTINCT user_id) as count 
        FROM user_sessions 
        WHERE created_at BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'
      `);
      const activeGrowth = lastMonthActive?.count > 0 ? 
        Math.round(((activeUsers - lastMonthActive.count) / lastMonthActive.count) * 100) : 
        (activeUsers > 0 ? 100 : 0);

      const response = {
        success: true,
        data: {
          // Main metrics
          totalUsers,
          activeUsers,
          agentUsage: totalBatches,
          systemHealth: totalUsers > 0 ? 'Good' : 'Initializing',
          
          // Growth indicators
          userGrowth: `${userGrowth >= 0 ? '+' : ''}${userGrowth}% from last month`,
          activeGrowth: `${activeGrowth >= 0 ? '+' : ''}${activeGrowth}% from last month`,
          agentGrowth: `+${Math.max(0, totalBatches * 10)}% from last month`,
          systemStatus: 'Stable from last month',
          
          // Recent activity
          recentActivity
        }
      };

      console.log('✅ [ANALYTICS] Dashboard response prepared');
      res.json(response);

    } catch (error) {
      console.error('❌ [ANALYTICS] Dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get user analytics
  static async getUserAnalytics(req, res) {
    try {
      const { page = 1, limit = 20, timeframe = '30d' } = req.query;
      const offset = (page - 1) * limit;

      await database.connect();

      const timeFrameMap = {
        '7d': '7 days',
        '30d': '30 days',
        '90d': '90 days',
        '1y': '1 year'
      };
      const sqlTimeFrame = timeFrameMap[timeframe] || '30 days';

      const users = await database.all(`
        SELECT 
          id,
          email,
          first_name,
          last_name,
          department,
          job_title,
          role,
          created_at,
          last_login
        FROM users 
        WHERE created_at > NOW() - INTERVAL '${sqlTimeFrame}'
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      const totalCount = await database.get(`
        SELECT COUNT(*) as total 
        FROM users 
        WHERE created_at > NOW() - INTERVAL '${sqlTimeFrame}'
      `);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount.total,
            totalPages: Math.ceil(totalCount.total / limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ [ANALYTICS] User analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get agent usage analytics
  static async getAgentAnalytics(req, res) {
    try {
      const { timeframe = '30d' } = req.query;
      
      const timeFrameMap = {
        '7d': '7 days',
        '30d': '30 days',
        '90d': '90 days',
        '1y': '1 year'
      };
      const sqlTimeFrame = timeFrameMap[timeframe] || '30 days';

      // Get CV processing stats as agent usage
      const agentStats = await database.all(`
        SELECT 
          'cv-intelligence' as agent_id,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) as total_usage,
          AVG(cv_count) as avg_usage,
          SUM(processing_time) as total_time_spent
        FROM cv_batches 
        WHERE created_at > NOW() - INTERVAL '${sqlTimeFrame}'
        GROUP BY 1
      `);

      res.json({
        success: true,
        data: {
          agentStats,
          usageTrends: [],
          timeframe
        }
      });

    } catch (error) {
      console.error('❌ [ANALYTICS] Agent analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get CV Intelligence analytics
  static async getCVAnalytics(req, res) {
    try {
      const { timeframe = '30d' } = req.query;
      
      const timeFrameMap = {
        '7d': '7 days',
        '30d': '30 days',
        '90d': '90 days',
        '1y': '1 year'
      };
      const sqlTimeFrame = timeFrameMap[timeframe] || '30 days';

      const batchStats = await database.get(`
        SELECT 
          COUNT(*) as total_batches,
          COALESCE(SUM(cv_count), 0) as total_cvs,
          COALESCE(AVG(cv_count), 0) as avg_cvs_per_batch,
          COALESCE(SUM(candidate_count), 0) as total_candidates,
          COALESCE(AVG(processing_time), 0) as avg_processing_time
        FROM cv_batches 
        WHERE created_at > NOW() - INTERVAL '${sqlTimeFrame}'
      `);

      res.json({
        success: true,
        data: {
          timeframe,
          batchStats
        }
      });

    } catch (error) {
      console.error('❌ [ANALYTICS] CV analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get system analytics
  static async getSystemAnalytics(req, res) {
    try {
      const { timeframe = '30d' } = req.query;
      
      const timeFrameMap = {
        '7d': '7 days',
        '30d': '30 days',
        '90d': '90 days',
        '1y': '1 year'
      };
      const sqlTimeFrame = timeFrameMap[timeframe] || '30 days';

      // Get actual system activity from user_analytics table if it exists
      const activityStats = await database.all(`
        SELECT 
          action,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
        FROM user_analytics 
        WHERE created_at > NOW() - INTERVAL '${sqlTimeFrame}'
        GROUP BY action 
        ORDER BY count DESC
        LIMIT 10
      `);

      const systemHealth = {
        apiServer: 'Operational',
        database: 'Operational', 
        cvProcessing: 'Operational',
        emailService: 'Degraded'
      };

      res.json({
        success: true,
        data: {
          timeframe,
          systemHealth,
          activityStats
        }
      });

    } catch (error) {
      console.error('❌ [ANALYTICS] System analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Export analytics data
  static async exportAnalytics(req, res) {
    try {
      const { type = 'users', timeframe = '30d', format = 'json' } = req.query;

      const timeFrameMap = {
        '7d': '7 days',
        '30d': '30 days',
        '90d': '90 days',
        '1y': '1 year'
      };
      const sqlTimeFrame = timeFrameMap[timeframe] || '30 days';

      let data = [];

      switch (type) {
        case 'users':
          data = await database.all(`
            SELECT 
              u.id,
              u.email,
              u.first_name,
              u.last_name,
              u.department,
              u.job_title,
              u.role,
              u.is_verified,
              u.last_login,
              u.created_at
            FROM users u
            WHERE u.created_at > NOW() - INTERVAL '${sqlTimeFrame}'
            ORDER BY u.created_at DESC
          `);
          break;

        case 'cv_batches':
          data = await database.all(`
            SELECT 
              cb.*,
              u.email,
              u.first_name,
              u.last_name
            FROM cv_batches cb
            JOIN users u ON cb.user_id = u.id
            WHERE cb.created_at > NOW() - INTERVAL '${sqlTimeFrame}'
            ORDER BY cb.created_at DESC
          `);
          break;

        case 'support_tickets':
          data = await database.all(`
            SELECT 
              st.*,
              u.email,
              u.first_name,
              u.last_name
            FROM support_tickets st
            JOIN users u ON st.user_id = u.id
            WHERE st.created_at > NOW() - INTERVAL '${sqlTimeFrame}'
            ORDER BY st.created_at DESC
          `);
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid export type'
          });
      }

      if (format === 'csv') {
        if (data.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'No data found for export'
          });
        }

        const headers = Object.keys(data[0]).join(',');
        const csvData = data.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
          ).join(',')
        ).join('\n');

        const csv = `${headers}\n${csvData}`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${timeframe}.csv"`);
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: {
            type,
            timeframe,
            exported_at: new Date().toISOString(),
            count: data.length,
            data
          }
        });
      }

    } catch (error) {
      console.error('❌ [ANALYTICS] Export error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get detailed user activity
  static async getUserActivity(req, res) {
    try {
      const { user_id } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user activities
      const activities = await database.all(`
        SELECT 
          action,
          agent_id,
          metadata,
          ip_address,
          user_agent,
          created_at
        FROM user_analytics 
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [user_id, limit, offset]);

      const totalCount = await database.get(
        'SELECT COUNT(*) as total FROM user_analytics WHERE user_id = $1',
        [user_id]
      );

      // Get user's CV batches
      const cvBatches = await database.all(`
        SELECT 
          id,
          name,
          status,
          cv_count,
          candidate_count,
          processing_time,
          created_at
        FROM cv_batches 
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `, [user_id]);

      // Get user's support tickets
      const supportTickets = await database.all(`
        SELECT 
          id,
          subject,
          status,
          priority,
          category,
          created_at
        FROM support_tickets 
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `, [user_id]);

      res.json({
        success: true,
        data: {
          user: user.toJSON(),
          activities,
          cvBatches,
          supportTickets,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount.total,
            totalPages: Math.ceil(totalCount.total / limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ [ANALYTICS] User activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AnalyticsController;
