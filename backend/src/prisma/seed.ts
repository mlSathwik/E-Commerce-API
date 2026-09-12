import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  seedCategories,
  seedBrands,
  seedDeliveryOptions,
  seedEmiPlans,
  seedProducts,
  seedProductVariants,
  seedProductImages,
} from '../services/catalog.data.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with 180+ products and 1100+ variants...');

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
  await prisma.address.upsert({
    where: { id: '33333333-3333-3333-3333-333333333333' },
    update: {},
    create: {
      id: '33333333-3333-3333-3333-333333333333',
      userId: customer.id,
      fullName: 'Alex Johnson',
      phone: '+91 9876543211',
      street: '42 Tech Park Avenue, Cyber City',
      addressLine2: 'Tower B, Suite 402',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560100',
      country: 'India',
      addressType: 'HOME',
      isDefault: true,
    },
  });

  // 4. Delivery Options
  for (const del of seedDeliveryOptions) {
    await prisma.deliveryOption.upsert({
      where: { code: del.code },
      update: {},
      create: del,
    });
  }

  // 5. EMI Plans
  for (const emi of seedEmiPlans) {
    await prisma.eMIPlan.upsert({
      where: { months: emi.months },
      update: {},
      create: emi,
    });
  }

  // 6. Categories (11 Active Categories)
  for (const cat of seedCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon, image: cat.image },
      create: cat,
    });
  }

  // 7. Brands
  for (const br of seedBrands) {
    await prisma.brand.upsert({
      where: { slug: br.slug },
      update: { name: br.name, description: br.description, logo: br.logo },
      create: br,
    });
  }

  // 8. Products
  for (const p of seedProducts) {
    const { variants, images, ...prodData } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        sku: p.sku,
        stock: p.stock,
        rating: p.rating,
        numReviews: p.numReviews,
        isFeatured: p.isFeatured,
        isTrending: p.isTrending,
        isFlashSale: p.isFlashSale,
      },
      create: prodData,
    });
  }

  // 9. Product Variants
  for (const v of seedProductVariants) {
    await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: {
        price: v.price,
        discountPrice: v.discountPrice,
        stock: v.stock,
      },
      create: v,
    });
  }

  // 10. Product Images
  for (const img of seedProductImages) {
    await prisma.productImage.upsert({
      where: { id: img.id },
      update: {},
      create: img,
    });
  }

  console.log('✅ Seed completed successfully with full active catalog!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
