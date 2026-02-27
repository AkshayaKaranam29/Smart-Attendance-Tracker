import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({});
console.log('Successfully instantiated PrismaClient');
prisma.$disconnect();
