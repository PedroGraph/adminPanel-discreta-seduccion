import { Request } from 'express';
import { LogData } from '../interfaces/log.interfaces.js';

export const formattedLogInfo = (req: Request, data: LogData) => {
    const information = {
        userEmail: data.email,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        description: data.description,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    }
    return information;
}

