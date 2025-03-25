import { Request } from 'express';
import { formattedLogInfo } from '../utils/formatters.js';
import { LogData } from '../interfaces/log.interfaces.js';
import prisma from '@/lib/prisma.js';

export class LogService {
    async createLog(req: Request, userInfo: LogData) {
        try {
            const log = await prisma.activityLog.create({
                data: formattedLogInfo(req, userInfo)
            });
            return "Registro de actividad creado exitosamente";
        } catch (error) {
            console.error('Error al crear el registro de actividad:', error);
            throw error;
        }
    }   
}