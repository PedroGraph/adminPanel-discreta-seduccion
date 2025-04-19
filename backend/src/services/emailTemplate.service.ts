import { Template, CreateEmailTemplate } from "@/interfaces/emailTemplate.interface.js";
import { setActivityToLog } from "../middleware/log.js";
import { Request } from "express";
import { emailTemplateFieldSelector } from "@/models/emailTemplate.model.js";
import prisma from "../lib/prisma.js";

export class EmailTemplateService {

    async createNewEmailTemplate(data: CreateEmailTemplate, req: Request) {
        
        let information: { status: number; message: string; emailData?: any } = {
            status: 0,
            message: ``,
        };

        try{
            const { template, campaign } = data;
            if(!campaign) throw { status: 400, message: "El campo campaign es obligatorio" };

            const emailData = await prisma.emailTemplate.create({ data: template });
            if(campaign) await prisma.emailCampaign.create({ data: { ...campaign, templateId: emailData.id } });

            information = { message: `Plantilla de correo creada con éxito | ${emailData.id} - ${emailData.name}`, status: 202 };
            return { message: "Plantilla de correo creada" };
            
        } catch (error) {
            information = { message: "No se pudo crear la plantilla de correo", status: 400 };
            throw information;

        }finally{
            setActivityToLog(req, {
                action: "create",
                entityType: "emailTemplate",
                description: (information as { message: string }).message
            });
        }
        
    }

    async getAllEmailTemplates() {
        let information: { status: number; message: string; emailData?: any } = {
            status: 0,
            message: ``,
        };

        try {   
            const emailData = await prisma.emailTemplate.findMany({
                select: emailTemplateFieldSelector,
            });
            information = { message: `Plantillas de correo obtenidas con éxito`, status: 202 };
            return { message: "Plantillas de correo obtenidas", status: 202, emailData };

        } catch (error) {
            information = { message: "No se pudo obtener las plantillas de correo", status: 400 };
            throw information;
            
        }
    }

    async getOneEmailTemplate(id: number) {
        let information: { status: number; message: string; emailData?: any } = {
            status: 0,
            message: ``,
        };

        try {
            const emailData = await prisma.emailTemplate.findUnique({
                where: { id },
                select: emailTemplateFieldSelector,
            });
            information = { message: `Plantilla de correo obtenida con éxito`, status: 202 };            
            return { message: "Plantilla de correo obtenida", status: 202, emailData };

        } catch (error) {            
            information = { message: "No se pudo obtener la plantilla de correo", status: 400 };
            throw information;
            
        }   
    }

    async updateEmailTemplate(id: number, data: Partial<Template>, req: Request) {
        let information: { status: number; message: string; emailData?: any } = {
            status: 0,
            message: ``,
        };

        try {
            const emailData = await prisma.emailTemplate.update({ where: { id }, data });
            information = { message: `Plantilla de correo actualizada con éxito | ${emailData.id} - ${emailData.name}`, status: 202 };
            return { message: "Plantilla de correo actualizada", status: 202 };

        } catch (error) {
            information = { message: "No se pudo actualizar la plantilla de correo", status: 400 };
            throw information;
        }finally{
            setActivityToLog(req, {
                action: "update",
                entityType: "emailTemplate",
                description: (information as { message: string }).message
            });
        }
    }

    async deleteEmailTemplate(id: number, req: Request) {
        let information: { status: number; message: string; emailData?: any } = {
            status: 0,
            message: ``,
        };

        try {
            const emailData = await prisma.emailTemplate.delete({ where: { id } });
            information = { message: `Plantilla de correo eliminada con éxito | ${emailData.id} - ${emailData.name}`, status: 202 };            
            return { message: "Plantilla de correo eliminada", status: 202 };

        } catch (error) {
            console.log(error)
            information = { message: "No se pudo eliminar la plantilla de correo", status: 400 };
            throw information;
        }finally{
            setActivityToLog(req, {
                action: "delete",
                entityType: "emailTemplate",
                description: (information as { message: string }).message
            });
        }
    }

}