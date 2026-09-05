import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  const customerPassword = await bcrypt.hash('Customer@123456', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopsphere.com' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'admin@shopsphere.com',
      name: 'ShopSphere Admin',
      password: hashedPassword,
      phone: '+91 9876543210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role: 'ADMIN',
    },
  });

  // 2. Create Customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@shopsphere.com' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'customer@shopsphere.com',
      name: 'Alex Johnson',
      password: customerPassword,
      phone: '+91 9876543211',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'CUSTOMER',
    },
  });

  // 3. Create Address
  await prisma.address.create({
    data: {
      id: '33333333-3333-3333-3333-333333333333',
      userId: customer.id,
      fullName: 'Alex Johnson',
      phone: '+91 9876543211',
      street: '42 Tech Park Avenue, Cyber City',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560100',
      country: 'India',
      isDefault: true,
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
