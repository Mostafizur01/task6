import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import connectionbd from './models/mongoose.js';
import socketLogic from './logic/socket.js';
import history from './routes/history.js';

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;
const allowedOrigins = [process.env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json());

connectionbd();
socketLogic(io);

app.use('/api/history', history);

server.listen(port, () => {
    console.log(`surver run on http://localhost:${port}`);
});