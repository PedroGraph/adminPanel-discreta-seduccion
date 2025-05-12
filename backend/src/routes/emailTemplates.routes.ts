import { Router } from 'express';
import { EmailTemplateController } from '../controllers/emailTemplate.controller.js';
import { EmailCampaignController } from '@/controllers/emailCampaign.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
const emailTemplateController = new EmailTemplateController();
const emailCampaignController = new EmailCampaignController();

//Email Templates
router.post('/', auth, emailTemplateController.createNewEmailTemplate);
router.get('/all', auth, emailTemplateController.getAllEmailTemplates);
router.get('/:id', auth, emailTemplateController.getEmailTemplateById);
router.put('/:id', auth, emailTemplateController.updateEmailTemplate);
router.delete('/:id', auth, emailTemplateController.deleteEmailTemplate);

//Email Campaigns
router.post('/campaign/', auth, emailCampaignController.createNewEmailCampaign);
router.get('/campaign/all', auth, emailCampaignController.getAllEmailCampaigns);
router.put('/campaign/:id', auth, emailCampaignController.updateEmailCampaign);
router.delete('/campaign/:id', auth, emailCampaignController.deleteEmailCampaign);



export default router; 