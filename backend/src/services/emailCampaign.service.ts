import { Template, EmailCampaign } from "@/interfaces/emailTemplate.interface.js";
import { setActivityToLog } from "../middleware/log.js";
import { Request } from "express";
import { emailCampaignSelector } from "@/models/emailTemplate.model.js";
import prisma from "../lib/prisma.js";
import { handlePrismaError } from '../utils/handleErrors.js';

export class EmailCampaignService {

    async createNewEmailCampaign(data: EmailCampaign, req: Request) {
        
        let information: { status: number; message: string; emailData?: any } = {
            status: 0,
            message: ``,
        };

        try{
            const emailData = await prisma.emailCampaign.create({ data });
            if(!emailData) throw { status: 400, message: "No se pudo crear la campaña" };

            information = { message: `Se ha creado una campaña con éxito | ${emailData.id} - ${emailData.name}`, status: 202 };
            return { message: "Campaña creada", status: 202, emailData };
            
        } catch (error) {
            const handledError = handlePrismaError(error);
            information = { message: handledError.message, status: handledError.status };
            throw information;

        }finally{
            setActivityToLog(req, {
                action: "create",
                entityType: "emailCampaign",
                description: (information as { message: string }).message
            });
        }
        
    }

    async getAllEmailCampaigns() {
        let information: { status: number; message: string; emailData?: any } = {
            status: 0,
            message: ``,
        };

        try {   
            const campaigns = await prisma.emailCampaign.findMany({ select: emailCampaignSelector});
            
            if(!campaigns) throw { status: 400, message: "No se encontraron campañas" };

              const emailData = campaigns.map((campaign) => {
                const total = campaign.recipients.length;
                const opened = campaign.recipients.filter((r) => r.opened).length;
                const clicked = campaign.recipients.filter((r) => r.clicked).length;
              
                const openRate = total ? ((opened / total) * 100).toFixed(2) : 0;
                const clickRate = total ? ((clicked / total) * 100).toFixed(2) : 0;
              
                const { recipients, ...campaignWithoutRecipients } = campaign;

                return {
                  ...campaignWithoutRecipients,
                  recipientsCount: total,
                  openRate,
                  clickRate,
                };
              });
              
            return { message: "Campañas obtenidas con exito", status: 202, emailData };

        } catch (error) {
            information = { message: "No se pudo crear la campaña", status: 400 };
            throw information;
        }
    }



    async updateEmailCampaign(id: number, data: Partial<EmailCampaign>, req: Request) {
        let information: { status: number; message: string; emailData?: any } = {
            status: 0,
            message: ``,
        };

        try {
            const emailData = await prisma.emailCampaign.update({ where: { id }, data });
            if(!emailData) throw { status: 400, message: `No se ha podido actualizar los datos de la campaña | Campaña con ID ${id} no encontrada` };

            information = { message: `Campaña actualizada con éxito | ${emailData.id} - ${emailData.name}`, status: 202 };
            return { message: "Campaña actualizada", status: 202 };

        } catch (error) {
            const handledError = handlePrismaError(error);
            information = { message: handledError.message, status: handledError.status };
            throw information;

        }finally{
            setActivityToLog(req, {
                action: "update",
                entityType: "emailCampaign", 
                description: (information as { message: string }).message
            });
        }
    }

    async deleteEmailCampaign(id: number, req: Request) {
        let information: { status: number; message: string; emailData?: any } = {
            status: 0,
            message: ``,
        };

        try {
            const emailData = await prisma.emailCampaign.delete({ where: { id } });
            information = { message: `Campaña eliminada con éxito | ${emailData.id}`, status: 202 };            
            return { message: "Campaña eliminada", status: 202 };

        } catch (error) {
            const handledError = handlePrismaError(error);
            information = { message: handledError.message, status: handledError.status };
            throw information;
        }finally{
            setActivityToLog(req, {
                action: "delete",
                entityType: "emailCampaign",
                description: (information as { message: string }).message
            });
        }
    }

}