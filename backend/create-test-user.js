const database = require('./models/database');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('🔗 Connecting to database...');
    await database.connect();
    console.log('✅ Database connected');
    
    // Check if superadmin exists
    const existingAdmin = await database.get(
      'SELECT id, email FROM users WHERE role = $1 LIMIT 1',
      ['superadmin']
    );
    
    if (existingAdmin) {
      console.log('✅ Superadmin already exists:', existingAdmin.email);
      return;
    }
    
    console.log('👤 Creating superadmin user...');
    
    // Hash password
    const password = 'Admin123!';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create superadmin user
    const result = await database.run(`
      INSERT INTO users (
        email, 
        password_hash, 
        first_name, 
        last_name, 
        role, 
        is_verified, 
        is_active,
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
      RETURNING id
    `, [
      'syedarfan@securemaxtech.com',
      hashedPassword,
      'Syed',
      'Arfan', 
      'superadmin',
      true,
      true
    ]);
    
    console.log('✅ Superadmin user created!');
    console.log('📧 Email: syedarfan@securemaxtech.com');
    console.log('🔑 Password: Admin123!');
    console.log('🎯 Role: superadmin');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

// Run the function
createTestUser().then(() => {
  console.log('🚀 Setup complete!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
