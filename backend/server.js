import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import { createServer } from 'http'
import connectionbd from './models/mongoose.js'
import socketLogic from './logic/socket.js'
import history from './routes/history.js'

const app = express()
const server = createServer(app)
const port = process.env.PORT || 3000
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
})

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

connectionbd()
socketLogic(io)

app.use('/api/history', history)


server.listen(port, () => {
    console.log(`surver run on http://localhost:${port}`)
})