const database = require('../models/database');
const User = require('../models/User');
const emailService = require('../utils/emailService');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await database.connect();

    // Check if admin user already exists
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('❌ ADMIN_EMAIL not configured in environment variables');
      process.exit(1);
    }

    const existingAdmin = await User.findByEmail(adminEmail);
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', adminEmail);
      
      // Update to superadmin if not already
      if (existingAdmin.role !== 'superadmin') {
        await database.run('UPDATE users SET role = ? WHERE id = ?', ['superadmin', existingAdmin.id]);
        console.log('✅ Updated admin user role to superadmin');
      }
    } else {
      console.log('👤 Creating superadmin user...');

      // Create superadmin user
      const adminUser = await User.create({
        email: adminEmail,
        password: 'TempPassword123!', // This should be changed immediately
        first_name: 'System',
        last_name: 'Administrator',
        role: 'superadmin',
        department: 'IT',
        job_title: 'System Administrator'
      });

      // Auto-verify the admin user
      await adminUser.verifyEmail();
      
      console.log('✅ Superadmin user created:', adminEmail);
      console.log('🔑 Temporary password: TempPassword123! (CHANGE IMMEDIATELY!)');
    }

    // Seed some sample system settings
    const systemSettings = [
      ['maintenance_mode', 'false', 'Whether the system is in maintenance mode'],
      ['max_file_upload_size', '10485760', 'Maximum file upload size in bytes (10MB)'],
      ['session_timeout_hours', '168', 'Session timeout in hours (7 days)'],
      ['email_notifications_enabled', 'true', 'Whether email notifications are enabled'],
      ['cv_batch_retention_days', '90', 'How long to keep CV batch data in days'],
      ['support_ticket_auto_close_days', '30', 'Auto-close resolved tickets after X days']
    ];

    console.log('⚙️  Seeding system settings...');
    const insertSetting = database.prepare(`
      INSERT OR REPLACE INTO system_settings (key, value, description) 
      VALUES (?, ?, ?)
    `);

    for (const [key, value, description] of systemSettings) {
      insertSetting.run(key, value, description);
    }

    insertSetting.finalize();
    console.log('✅ System settings seeded');

    // Create sample user preferences for admin
    const adminId = (await User.findByEmail(adminEmail)).id;
    await database.run(`
      INSERT OR REPLACE INTO user_preferences (user_id, theme, notifications_email, notifications_browser, language, timezone)
      VALUES (?, 'dark', 1, 1, 'en', 'UTC')
    `, [adminId]);
    
    console.log('✅ Admin user preferences set');

    // Create some sample support ticket categories and priorities in documentation
    console.log('📋 Database seeding completed successfully!');
    
    console.log(`
🎉 Database Setup Complete!

👤 Superadmin Account Created:
   Email: ${adminEmail}
   Password: TempPassword123!
   
⚠️  IMPORTANT: 
   1. Login immediately and change the default password
   2. The admin account has been auto-verified
   3. Configure email settings in .env for proper email functionality

🚀 You can now start the server with: npm run dev

📚 API Documentation will be available at: http://localhost:5000/api
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await database.disconnect();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };