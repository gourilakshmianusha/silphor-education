import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Centralized Environment & Service Configuration
export const config = {
  PORT: Number(process.env.PORT) || 3000,
  
  // Project & Brand Defaults (Automatically generated if not supplied)
  PROJECT: 'SILPHOR TECHNOLOGIES',
  WEBSITE_NAME: process.env.WEBSITE_NAME || 'SILPHOR TECHNOLOGIES',
  WEBSITE_TAGLINE: process.env.WEBSITE_TAGLINE || 'DESIGN • INNOVATE • VERIFY • DELIVER',
  WEBSITE_CURRENCY: process.env.WEBSITE_CURRENCY || 'INR',
  PAYMENT_CURRENCY: 'INR / ₹',
  
  // Official Campus Coordinates & Contact
  CONTACT: {
    phone: '+91 7829455663',
    email: 'silphortechnologies@gmail.com',
    address: '#45 East Road, Malleswaram, Bangalore, Karnataka - 560003, India',
    landmark: 'Near 8th Cross Cultural Hub & Malleswaram Ground',
    operationalHours: {
      weekdays: 'Mon - Fri: 9:00 AM - 7:00 PM IST',
      saturday: 'Sat: 9:30 AM - 5:30 PM IST',
      sunday: 'Closed for Lab Maintenance'
    }
  },

  // Authentication: Automatic cryptographically secure 256-bit JWT_SECRET
  JWT_SECRET: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),

  // Database Connection Strategy:
  // If DATABASE_URL is set, connect directly to production PostgreSQL / Supabase
  // Otherwise, use SQLite locally at DATABASE_DIR=./data/silphor.db
  DATABASE_URL: process.env.DATABASE_URL || null,
  DATABASE_DIR: process.env.DATABASE_DIR || './data',

  // Razorpay Gateway:
  // Mode defaults to 'test'
  // If RAZORPAY_KEY_ID is missing, never generate fake keys. Keep null and operate in test checkout mode.
  RAZORPAY_MODE: (process.env.RAZORPAY_MODE as 'test' | 'live') || 'test',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || null,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || null,

  // Helper flags
  isDatabasePostgres: Boolean(process.env.DATABASE_URL),
  isRazorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
};
