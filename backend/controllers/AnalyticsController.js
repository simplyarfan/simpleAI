const database = require('../models/database');
const User = require('../models/User');

class AnalyticsController {
  // Get dashboard overview statistics
  static async getDashboardStats(req, res) {
    try {
      const stats = {};

      // User statistics
      const userStats = await User.getStatistics();
      stats.users = userStats;

      // Agent usage statistics (last 30 days)
      const agentUsage = await database.all(`
        SELECT 
          agent_id,
          COUNT(DISTINCT user_id) as unique_users,
          SUM(usage_count) as total_usage,
          AVG(usage_count) as avg_usage_per_user,
          SUM(total_time_spent) as total_time_spent
        FROM agent_usage_stats 
        WHERE date > CURRENT_DATE - INTERVAL '30 days'
        GROUP BY agent_id 
        ORDER BY total_usage DESC
      `);
      stats.agentUsage = agentUsage;

      // CV Intelligence statistics
      const cvStats = await database.get(`
        SELECT 
          COUNT(*) as total_batches,
          SUM(candidate_count) as total_candidates,
          AVG(candidate_count) as avg_candidates_per_batch,
          AVG(processing_time) as avg_processing_time
        FROM cv_batches 
        WHERE status = 'completed'
      `);
      stats.cvIntelligence = cvStats || {
        total_batches: 0,
        total_candidates: 0,
        avg_candidates_per_batch: 0,
        avg_processing_time: 0
      };

      // Support ticket statistics
      const supportStats = await database.all(`
        SELECT 
          status,
          COUNT(*) as count
        FROM support_tickets 
        GROUP BY status
      `);
      stats.supportTickets = {
        total: supportStats.reduce((sum, stat) => sum + stat.count, 0),
        byStatus: supportStats.reduce((obj, stat) => {
          obj[stat.status] = stat.count;
          return obj;
        }, {})
      };

      // Daily active users (last 30 days)
      const dailyActiveUsers = await database.all(`
        SELECT 
          DATE(created_at) as date,
          COUNT(DISTINCT user_id) as active_users
        FROM user_analytics 
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);
      stats.dailyActiveUsers = dailyActiveUsers;

      // Popular actions (last 30 days)
      const popularActions = await database.all(`
        SELECT 
          action,
          COUNT(*) as count
        FROM user_analytics 
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY action 
        ORDER BY count DESC
        LIMIT 10
      `);
      stats.popularActions = popularActions;

      // System performance metrics
      const systemMetrics = {
        totalUsers: userStats.total,
        verificationRate: userStats.total > 0 ? (userStats.verified / userStats.total * 100).toFixed(1) : 0,
        totalBatches: cvStats?.total_batches || 0,
        totalCandidatesProcessed: cvStats?.total_candidates || 0,
        avgProcessingTime: cvStats?.avg_processing_time || 0,
        activeTickets: (stats.supportTickets.byStatus.open || 0) + (stats.supportTickets.byStatus.in_progress || 0)
      };
      stats.systemMetrics = systemMetrics;

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Dashboard stats error:', error);
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

      // Convert timeframe to SQL interval
      const timeFrameMap = {
        '7d': '7 days',
        '30d': '30 days', 
        '90d': '90 days',
        '1y': '1 year'
      };

      const sqlTimeFrame = timeFrameMap[timeframe] || '30 days';

      // Get user activity summary
      const userActivity = await database.all(`
        SELECT 
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.department,
          u.role,
          u.last_login,
          COUNT(ua.id) as total_actions,
          COUNT(DISTINCT ua.agent_id) as agents_used,
          MAX(ua.created_at) as last_activity
        FROM users u
        LEFT JOIN user_analytics ua ON u.id = ua.user_id 
          AND ua.created_at > NOW() - INTERVAL '${sqlTimeFrame}'
        WHERE u.is_active = true
        GROUP BY u.id, u.email, u.first_name, u.last_name, u.department, u.role, u.last_login
        ORDER BY total_actions DESC, last_activity DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      // Get total count for pagination
      const totalCount = await database.get(`
        SELECT COUNT(*) as total FROM users WHERE is_active = true
      `);

      res.json({
        success: true,
        data: {
          users: userActivity,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount.total,
            totalPages: Math.ceil(totalCount.total / limit)
          }
        }
      });

    } catch (error) {
      console.error('User analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get agent usage analytics
  static async getAgentAnalytics(req, res) {
    try {
      const { timeframe = '30d', agent_id } = req.query;

      const timeFrameMap = {
        '7d': '7 days',
        '30d': '30 days',
        '90d': '90 days', 
        '1y': '1 year'
      };

      const sqlTimeFrame = timeFrameMap[timeframe] || '30 days';

      let query = `
        SELECT 
          agent_id,
          COUNT(DISTINCT user_id) as unique_users,
          SUM(usage_count) as total_usage,
          AVG(usage_count) as avg_usage,
          SUM(total_time_spent) as total_time_spent,
          MAX(updated_at) as last_used
        FROM agent_usage_stats 
        WHERE date > CURRENT_DATE - INTERVAL '${sqlTimeFrame}'
      `;

      const params = [];

      if (agent_id) {
        query += ' AND agent_id = $1';
        params.push(agent_id);
      }

      query += ' GROUP BY agent_id ORDER BY total_usage DESC';

      const agentStats = await database.all(query, params);

      // Get daily usage trends for the timeframe
      let trendQuery = `
        SELECT 
          date,
          agent_id,
          SUM(usage_count) as daily_usage,
          COUNT(DISTINCT user_id) as daily_users
        FROM agent_usage_stats 
        WHERE date > CURRENT_DATE - INTERVAL '${sqlTimeFrame}'
      `;

      if (agent_id) {
        trendQuery += ' AND agent_id = $1';
      }

      trendQuery += ' GROUP BY date, agent_id ORDER BY date ASC';

      const usageTrends = await database.all(trendQuery, agent_id ? [agent_id] : []);

      res.json({
        success: true,
        data: {
          agentStats,
          usageTrends,
          timeframe
        }
      });

    } catch (error) {
      console.error('Agent analytics error:', error);
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

      // Get user details
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get detailed activity log
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

      // Get total count for pagination
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
          jd_count,
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
      console.error('User activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Export analytics data
  static async exportAnalytics(req, res) {
    try {
      const { type, timeframe = '30d', format = 'json' } = req.query;

      const timeFrameMap = {
        '7d': '7 days',
        '30d': '30 days',
        '90d': '90 days',
        '1y': '1 year'
      };

      const sqlTimeFrame = timeFrameMap[timeframe] || '30 days';

      let data = {};

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
              u.created_at,
              COUNT(ua.id) as total_actions,
              COUNT(DISTINCT ua.agent_id) as agents_used
            FROM users u
            LEFT JOIN user_analytics ua ON u.id = ua.user_id 
              AND ua.created_at > NOW() - INTERVAL '${sqlTimeFrame}'
            WHERE u.is_active = true
            GROUP BY u.id, u.email, u.first_name, u.last_name, u.department, u.job_title, u.role, u.is_verified, u.last_login, u.created_at
            ORDER BY u.created_at DESC
          `);
          break;

        case 'activities':
          data = await database.all(`
            SELECT 
              ua.action,
              ua.agent_id,
              ua.created_at,
              u.email,
              u.first_name,
              u.last_name,
              u.department
            FROM user_analytics ua
            JOIN users u ON ua.user_id = u.id
            WHERE ua.created_at > NOW() - INTERVAL '${sqlTimeFrame}'
            ORDER BY ua.created_at DESC
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
        // Convert to CSV format
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
        // JSON format
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
      console.error('Export analytics error:', error);
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
      
      // Calculate date range
      let dateFilter = '';
      switch (timeframe) {
        case '7d':
          dateFilter = "WHERE created_at > CURRENT_DATE - INTERVAL '7 days'";
          break;
        case '30d':
          dateFilter = "WHERE created_at > CURRENT_DATE - INTERVAL '30 days'";
          break;
        case '90d':
          dateFilter = "WHERE created_at > CURRENT_DATE - INTERVAL '90 days'";
          break;
        default:
          dateFilter = "WHERE created_at > CURRENT_DATE - INTERVAL '30 days'";
      }

      // CV batch statistics
      const batchStats = await database.get(`
        SELECT 
          COUNT(*) as total_batches,
          SUM(cv_count) as total_cvs,
          AVG(cv_count) as avg_cvs_per_batch,
          SUM(candidate_count) as total_candidates,
          AVG(processing_time) as avg_processing_time
        FROM cv_batches 
        ${dateFilter}
      `);

      res.json({
        success: true,
        data: {
          timeframe,
          batchStats: batchStats || {}
        }
      });

    } catch (error) {
      console.error('CV analytics error:', error);
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
      
      // Calculate date range
      let dateFilter = '';
      switch (timeframe) {
        case '7d':
          dateFilter = "WHERE created_at > CURRENT_DATE - INTERVAL '7 days'";
          break;
        case '30d':
          dateFilter = "WHERE created_at > CURRENT_DATE - INTERVAL '30 days'";
          break;
        case '90d':
          dateFilter = "WHERE created_at > CURRENT_DATE - INTERVAL '90 days'";
          break;
        default:
          dateFilter = "WHERE created_at > CURRENT_DATE - INTERVAL '30 days'";
      }

      // System activity statistics
      const activityStats = await database.all(`
        SELECT 
          action,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
        FROM user_analytics 
        ${dateFilter}
        GROUP BY action 
        ORDER BY count DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        data: {
          timeframe,
          activityStats: activityStats || []
        }
      });

    } catch (error) {
      console.error('System analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AnalyticsController;
