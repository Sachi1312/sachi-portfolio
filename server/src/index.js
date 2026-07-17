import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chatRouter from './routes/chat.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(__dirname, '../../client');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRouter);

// Serve the static portfolio site
app.use(express.static(clientDir));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
});
