import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { setActivityToLog } from '../middleware/log.js';
export class AuthController {

private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.login(req.body);
      await setActivityToLog(req, {action: 'login', entityType: 'user', description: `El usuario ${result.email} inició sesión`});
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.register(req.body);
      await setActivityToLog(req, {action: 'register', entityType: 'user', description: `El usuario ${result.email} registró una cuenta`});
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
} 