const { Client } = require('pg');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'bd_pipeline',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin@123456', 12);
    const managerPassword = await bcrypt.hash('Manager@123456', 12);
    const salesPassword = await bcrypt.hash('Sales@123456', 12);

    // Create admin user
    const adminResult = await client.query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['admin@bdpipeline.com', 'admin', adminPassword, 'Admin', 'User', 'admin', true]
    );
    console.log('✅ Admin user created');

    // Create team
    const teamResult = await client.query(
      `INSERT INTO teams (name, description)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['Enterprise Sales', 'Enterprise sales team']
    );
    const teamId = teamResult.rows[0]?.id;

    // Create manager user
    const managerResult = await client.query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, role, is_active, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['manager@bdpipeline.com', 'manager', managerPassword, 'John', 'Manager', 'manager', true, teamId]
    );

    // Update team manager
    if (managerResult.rows[0]?.id && teamId) {
      await client.query(
        `UPDATE teams SET manager_id = $1 WHERE id = $2`,
        [managerResult.rows[0].id, teamId]
      );
    }
    console.log('✅ Manager user created');

    // Create sales user
    await client.query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, role, is_active, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING`,
      ['sales@bdpipeline.com', 'sales', salesPassword, 'Jane', 'Sales', 'sales', true, teamId]
    );
    console.log('✅ Sales user created');

    console.log('\n🎉 Seeding completed successfully!\n');
    console.log('📝 Demo Credentials:');
    console.log('   Admin:   admin@bdpipeline.com / Admin@123456');
    console.log('   Manager: manager@bdpipeline.com / Manager@123456');
    console.log('   Sales:   sales@bdpipeline.com / Sales@123456\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await client.end();
  }
};

seedDatabase();
