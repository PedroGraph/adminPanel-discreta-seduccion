import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.login(req);
      res.json(result);
    } catch (error: any) {
      const status = error.status || 500;
      const message = error.message || 'Error interno del servidor';
      res.status(status).json({ error: message });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.register(req);
      res.json(result);
    } catch (error: any) {
      const status = error.status || 500;
      const message = error.message || 'Error interno del servidor';
      res.status(status).json({ error: message });
    }
  };
}
