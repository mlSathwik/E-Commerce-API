import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'shopsphere_super_secret_access_jwt_key_2025_secure',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'shopsphere_super_secret_refresh_jwt_key_2025_secure',
  REDIS_URL: process.env.REDIS_URL || '',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_shopsphere_mock_id',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'shopsphere_mock_secret_key_12345',
};
