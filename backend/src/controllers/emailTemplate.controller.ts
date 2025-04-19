import { Request, Response } from "express";
import { EmailTemplateService } from "../services/emailTemplate.service.js";
export class EmailTemplateController {
 
    private emailTemplateService: EmailTemplateService;
    constructor() {
      this.emailTemplateService = new EmailTemplateService();
    }

    createNewEmailTemplate = async (req: Request, res: Response) => {
      try {
        const template = await this.emailTemplateService.createNewEmailTemplate(req.body, req);
        res.status(200).json(template);
      } catch (error: any) {
        res.status(error.status || 400).json({ error: `${error.message}` });
      }
    }

    getAllEmailTemplates = async (req: Request, res: Response) => {
      try {
        const templates = await this.emailTemplateService.getAllEmailTemplates();
        res.status(200).json(templates);
      } catch (error: any) {
        res.status(error.status || 400).json({ error: `${error.message}` });
      }
    }

    getEmailTemplateById = async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const template = await this.emailTemplateService.getOneEmailTemplate(Number(id));
        res.status(200).json(template);
      } catch (error: any) {
        res.status(error.status || 400).json({ error: `${error.message}` });
      }
    }

    updateEmailTemplate = async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const template = await this.emailTemplateService.updateEmailTemplate(Number(id), req.body, req);
        res.status(200).json(template);
      } catch (error: any) {
        res.status(error.status || 400).json({ error: `${error.message}` });
      }
    }

    deleteEmailTemplate = async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const template = await this.emailTemplateService.deleteEmailTemplate(Number(id), req);
        res.status(200).json(template);
      } catch (error: any) {
        res.status(error.status || 400).json({ error: `${error.message}` });
      }
    }

}