import { Request, Response } from "express";
import { EmailCampaignService } from "@/services/emailCampaign.service.js";

export class EmailCampaignController {
 
    private emailCampaignService: EmailCampaignService;
    constructor() {
      this.emailCampaignService = new EmailCampaignService();
    }

    createNewEmailCampaign = async (req: Request, res: Response) => {
      try {
        const template = await this.emailCampaignService.createNewEmailCampaign(req.body, req);
        res.status(200).json(template);
      } catch (error: any) {
        res.status(error.status || 400).json({ error: `${error.message}` });
      }
    }

    getAllEmailCampaigns = async (req: Request, res: Response) => {
      try {
        const templates = await this.emailCampaignService.getAllEmailCampaigns();
        res.status(200).json(templates);
      } catch (error: any) {
        res.status(error.status || 400).json({ error: `${error.message}` });
      }
    }

    updateEmailCampaign = async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const template = await this.emailCampaignService.updateEmailCampaign(Number(id), req.body, req);
        res.status(200).json(template);
      } catch (error: any) {
        res.status(error.status || 400).json({ error: `${error.message}` });
      }
    }

    deleteEmailCampaign = async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const template = await this.emailCampaignService.deleteEmailCampaign(Number(id), req);
        res.status(200).json(template);
      } catch (error: any) {
        res.status(error.status || 400).json({ error: `${error.message}` });
      }
    } 
   
}