const { PrismaClient } = require('@prisma/client');

let prisma;

const connect = async () => {
  try {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test the connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database test query successful');

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

const disconnect = async () => {
  try {
    if (prisma) {
      await prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
};

const getPrismaClient = () => {
  if (!prisma) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return prisma;
};

const healthCheck = async () => {
  try {
    if (!prisma) {
      return { status: 'disconnected', timestamp: new Date().toISOString() };
    }

    await prisma.$queryRaw`SELECT 1`;
    return { status: 'connected', timestamp: new Date().toISOString() };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

const cleanup = async () => {
  try {
    if (prisma) {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

// Handle graceful shutdown
process.on('beforeExit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

module.exports = {
  connect,
  disconnect,
  getPrismaClient,
  healthCheck,
  cleanup
};