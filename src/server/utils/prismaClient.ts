import { PrismaClient } from '@prisma/client';

class PrismaClientSingleton {
  private static instance: PrismaClient | null = null;

  private constructor() {
    // Private constructor prevents direct instantiation
  }

  public static getInstance(): PrismaClient {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=10'
          }
        }
      });

      // Handle graceful shutdown
      process.on('beforeExit', async () => {
        await PrismaClientSingleton.instance?.$disconnect();
      });

      process.on('SIGINT', async () => {
        await PrismaClientSingleton.instance?.$disconnect();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await PrismaClientSingleton.instance?.$disconnect();
        process.exit(0);
      });
    }

    return PrismaClientSingleton.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaClientSingleton.instance) {
      await PrismaClientSingleton.instance.$disconnect();
      PrismaClientSingleton.instance = null;
    }
  }
}

// Export the singleton instance
export const prisma = PrismaClientSingleton.getInstance();
export default prisma;