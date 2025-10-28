const { PrismaClient } = require('@prisma/client');

let prisma;

const connectDatabase = async () => {
  try {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });

    // Test the connection
    await prisma.$connect();
    console.log('Database connection established');
    
    return prisma;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

const getPrisma = () => {
  if (!prisma) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return prisma;
};

const disconnectDatabase = async () => {
  if (prisma) {
    await prisma.$disconnect();
    console.log('Database disconnected');
  }
};

module.exports = {
  connectDatabase,
  getPrisma,
  disconnectDatabase
};