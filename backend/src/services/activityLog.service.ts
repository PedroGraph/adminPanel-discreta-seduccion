import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createActivityLog = async (data: {
  userEmail: string;
  action: string;
  entityType?: string;
  entityId?: number;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
}) => {
  try {
    return await prisma.activityLog.create({
      data: {
        ...data,
        userEmail: data.userEmail || 'system',
      },
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
    return null;
  }
}; 