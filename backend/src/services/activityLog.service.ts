import prisma from "../lib/prisma.js";
import { handlePrismaError } from "../utils/handleErrors.js";

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
    const user = await prisma.user.findUnique({ where: { email: data.userEmail }});
    const userEmail = user ? data.userEmail : "system";

    try {
      const log = await prisma.activityLog.create({data: { ...data, userEmail }});
      return log;
    } catch (error) {
      throw (handlePrismaError(error));
    }
  } catch (error: any) {
    if (error.status) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};
