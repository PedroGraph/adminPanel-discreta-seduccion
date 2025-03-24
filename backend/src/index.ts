import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/main.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
}); 

export { server };
export default app;