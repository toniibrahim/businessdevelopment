import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import { User, Team, ProbabilityCoefficient, FactorType, UserRole } from '../src/entities';
import { hashPassword } from '../src/utils/password.util';

const seed = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const userRepository = AppDataSource.getRepository(User);
    const teamRepository = AppDataSource.getRepository(Team);
    const coefficientRepository = AppDataSource.getRepository(ProbabilityCoefficient);

    // Clear existing data (optional - comment out if you want to preserve existing data)
    await coefficientRepository.delete({});
    console.log('🧹 Cleared existing probability coefficients');

    // ==================== PROBABILITY COEFFICIENTS ====================
    console.log('\n📊 Seeding Probability Coefficients...');

    const coefficients = [
      // Project Type
      { factor_type: FactorType.PROJECT_TYPE, factor_value: 'Integrated services to Business', coefficient: 0.9 },
      { factor_type: FactorType.PROJECT_TYPE, factor_value: 'One-time service', coefficient: 1.0 },

      // Project Maturity
      { factor_type: FactorType.PROJECT_MATURITY, factor_value: 'Prospection', coefficient: 0.15 },
      { factor_type: FactorType.PROJECT_MATURITY, factor_value: 'RFI', coefficient: 0.25 },
      { factor_type: FactorType.PROJECT_MATURITY, factor_value: 'RFQ', coefficient: 0.45 },
      { factor_type: FactorType.PROJECT_MATURITY, factor_value: 'Negotiation', coefficient: 0.75 },
      { factor_type: FactorType.PROJECT_MATURITY, factor_value: 'Contract Signed', coefficient: 1.0 },

      // Client Type
      { factor_type: FactorType.CLIENT_TYPE, factor_value: 'New', coefficient: 0.9 },
      { factor_type: FactorType.CLIENT_TYPE, factor_value: 'Existing', coefficient: 1.05 },

      // Client Relationship
      { factor_type: FactorType.CLIENT_RELATIONSHIP, factor_value: '1 - Low', coefficient: 0.85 },
      { factor_type: FactorType.CLIENT_RELATIONSHIP, factor_value: '2 - Medium', coefficient: 0.9 },
      { factor_type: FactorType.CLIENT_RELATIONSHIP, factor_value: '3 - Good', coefficient: 1.0 },
      { factor_type: FactorType.CLIENT_RELATIONSHIP, factor_value: '4 - High', coefficient: 1.05 },
      { factor_type: FactorType.CLIENT_RELATIONSHIP, factor_value: '5 - Excellent', coefficient: 1.10 },

      // Conservative Approach
      { factor_type: FactorType.CONSERVATIVE_APPROACH, factor_value: 'Yes', coefficient: 0.9 },
      { factor_type: FactorType.CONSERVATIVE_APPROACH, factor_value: 'No', coefficient: 1.0 },
    ];

    for (const coef of coefficients) {
      await coefficientRepository.save(coefficientRepository.create(coef));
    }

    console.log(`✅ Seeded ${coefficients.length} probability coefficients`);

    // ==================== ADMIN USER ====================
    console.log('\n👤 Creating Admin User...');

    const adminExists = await userRepository.findOne({ where: { email: 'admin@bdpipeline.com' } });

    if (!adminExists) {
      const adminPassword = await hashPassword('Admin@123456');

      const adminUser = userRepository.create({
        email: 'admin@bdpipeline.com',
        username: 'admin',
        password_hash: adminPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: UserRole.ADMIN,
        is_active: true,
      });

      await userRepository.save(adminUser);

      console.log('✅ Admin user created:');
      console.log('   Email: admin@bdpipeline.com');
      console.log('   Password: Admin@123456');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // ==================== SAMPLE TEAM ====================
    console.log('\n👥 Creating Sample Team...');

    const managerExists = await userRepository.findOne({ where: { email: 'manager@bdpipeline.com' } });

    if (!managerExists) {
      const managerPassword = await hashPassword('Manager@123456');

      const manager = userRepository.create({
        email: 'manager@bdpipeline.com',
        username: 'manager',
        password_hash: managerPassword,
        first_name: 'John',
        last_name: 'Manager',
        role: UserRole.MANAGER,
        is_active: true,
      });

      await userRepository.save(manager);

      // Create team
      const team = teamRepository.create({
        name: 'Enterprise Sales',
        manager_id: manager.id,
        description: 'Enterprise sales team',
      });

      await teamRepository.save(team);

      // Update manager with team
      manager.team_id = team.id;
      await userRepository.save(manager);

      console.log('✅ Manager user created:');
      console.log('   Email: manager@bdpipeline.com');
      console.log('   Password: Manager@123456');
      console.log('✅ Team "Enterprise Sales" created');
    } else {
      console.log('ℹ️  Manager user already exists');
    }

    // ==================== SAMPLE SALES USER ====================
    console.log('\n👤 Creating Sample Sales User...');

    const salesExists = await userRepository.findOne({ where: { email: 'sales@bdpipeline.com' } });

    if (!salesExists) {
      const salesPassword = await hashPassword('Sales@123456');

      // Get the team
      const team = await teamRepository.findOne({ where: { name: 'Enterprise Sales' } });

      const salesUser = userRepository.create({
        email: 'sales@bdpipeline.com',
        username: 'sales',
        password_hash: salesPassword,
        first_name: 'Jane',
        last_name: 'Sales',
        role: UserRole.SALES,
        team_id: team?.id,
        is_active: true,
      });

      await userRepository.save(salesUser);

      console.log('✅ Sales user created:');
      console.log('   Email: sales@bdpipeline.com');
      console.log('   Password: Sales@123456');
    } else {
      console.log('ℹ️  Sales user already exists');
    }

    console.log('\n🎉 Seeding completed successfully!\n');

    console.log('📝 Summary:');
    console.log('   - Probability coefficients: Seeded');
    console.log('   - Admin user: admin@bdpipeline.com / Admin@123456');
    console.log('   - Manager user: manager@bdpipeline.com / Manager@123456');
    console.log('   - Sales user: sales@bdpipeline.com / Sales@123456');
    console.log('   - Team: Enterprise Sales\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
};

seed();
