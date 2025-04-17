import prisma from '../lib/prisma.js';

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

    const user = await prisma.user.findUnique({
      where: { email: data.userEmail }
    });
    const userEmail = user ? data.userEmail : 'system';
    
    console.log(data)

    return await prisma.activityLog.create({
      data: {
        ...data,
        userEmail,
      },
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
    return null;
  }
}; 