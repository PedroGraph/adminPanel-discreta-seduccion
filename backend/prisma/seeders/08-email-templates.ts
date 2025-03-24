// import { PrismaClient } from '@prisma/client';
// import { EmailTemplateData } from 'prisma/interfaces/schema.js';

// const prisma = new PrismaClient();

// export async function seedEmailTemplates(): Promise<void> {
//   const templates: EmailTemplateData[] = [
//     {
//       name: 'Bienvenida',
//       subject: '¡Bienvenido a Discreta Seducción!',
//       content: `
//         <h1>¡Bienvenido a Discreta Seducción!</h1>
//         <p>Hola {{name}},</p>
//         <p>Gracias por registrarte en nuestra tienda. Estamos emocionados de tenerte con nosotros.</p>
//         <p>Para comenzar a comprar, visita nuestra tienda y descubre nuestra colección.</p>
//         <p>¡Que tengas un excelente día!</p>
//       `,
//       type: 'transactional',
//       variables: ['name'],
//     },
//     {
//       name: 'Orden Confirmada',
//       subject: 'Tu orden ha sido confirmada',
//       content: `
//         <h1>¡Tu orden ha sido confirmada!</h1>
//         <p>Hola {{name}},</p>
//         <p>Tu orden #{{orderNumber}} ha sido confirmada y está siendo procesada.</p>
//         <p>Detalles de la orden:</p>
//         <ul>
//           <li>Total: {{total}}</li>
//           <li>Método de pago: {{paymentMethod}}</li>
//           <li>Dirección de envío: {{shippingAddress}}</li>
//         </ul>
//         <p>Gracias por tu compra.</p>
//       `,
//       type: 'transactional',
//       variables: ['name', 'orderNumber', 'total', 'paymentMethod', 'shippingAddress'],
//     },
//     {
//       name: 'Newsletter',
//       subject: '¡Nuevas tendencias en Discreta Seducción!',
//       content: `
//         <h1>¡Nuevas tendencias!</h1>
//         <p>Hola {{name}},</p>
//         <p>Descubre nuestra nueva colección y las últimas tendencias en moda.</p>
//         <p>No te pierdas nuestras ofertas especiales.</p>
//         <p>¡Visita nuestra tienda ahora!</p>
//       `,
//       type: 'marketing',
//       variables: ['name'],
//     },
//   ];
//   for (const template of templates) {
//     await prisma.emailTemplates.upsert({
//       where: { name: template.name },
//       update: template,
//       create: template,
//     });
//   }

//   console.log('✅ Plantillas de email sembradas exitosamente');
// } 