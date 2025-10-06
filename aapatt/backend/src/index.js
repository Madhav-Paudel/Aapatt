import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { createRouter as createAuthRouter } from './routes/auth.js';
import { createRouter as createRequestRouter } from './routes/requests.js';
import { createRouter as createProviderRouter } from './routes/providers.js';
import { createRouter as createAiRouter } from './routes/ai.js';
import { initSocket } from './services/socketService.js';

const app = express();
const server = http.createServer(app);

const corsOrigin = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || '*';
const io = new Server(server, { cors: { origin: corsOrigin } });

app.use(cors({ origin: corsOrigin }));
app.use(helmet());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', createAuthRouter());
app.use('/requests', createRequestRouter(io));
app.use('/providers', createProviderRouter(io));
app.use('/ai', createAiRouter());

initSocket(io);

const port = Number(process.env.PORT || 3001);
server.listen(port, () => {
  console.log(`Backend listening on :${port}`);
});
