import { Router } from 'express';
import { EmailTemplateController } from '../controllers/emailTemplate.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
const emailTemplateController = new EmailTemplateController();

router.post('/', auth, emailTemplateController.createNewEmailTemplate);
router.get('/', auth, emailTemplateController.getAllEmailTemplates);
router.get('/:id', auth, emailTemplateController.getEmailTemplateById);
router.put('/:id', auth, emailTemplateController.updateEmailTemplate);
router.delete('/:id', auth, emailTemplateController.deleteEmailTemplate);

export default router; 