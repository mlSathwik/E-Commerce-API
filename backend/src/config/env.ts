import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/shopsphere?schema=public',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'shopsphere_super_secret_access_jwt_key_2025_secure',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'shopsphere_super_secret_refresh_jwt_key_2025_secure',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_shopsphere_mock_id',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'shopsphere_mock_secret_key_12345',
};
