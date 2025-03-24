import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { LogService } from '../services/log.service.js';
export class AuthController {

private authService: AuthService;
private logService: LogService;

  constructor() {
    this.authService = new AuthService();
    this.logService = new LogService();
  }

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.login(req.body);
      await this.logService.createLog(req, {email: req.body.email, action: 'login', entityType: 'user', description: 'Usuario inició sesión'});
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.register(req.body);
      await this.logService.createLog(req, {email: req.body.email, action: 'register', entityType: 'user', description: 'Usuario registró una cuenta'});
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
} 