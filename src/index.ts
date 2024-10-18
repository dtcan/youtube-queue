import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server, Socket } from 'socket.io';
import QUEUE from './queue';
import API from './API';

const PORT = +(process.env.PORT || 4000);
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'static')));

const api = new API();
const screens = new Map<string, Socket>();

app.get('/api/video/:id', async (req, res) => {
    try {
        let video = await api.getVideo(req.params.id);
        res.header('Content-Type', 'application/json');
        res.end(JSON.stringify(video));
    }catch(error) {
        console.error(error);
        res.statusCode = 500;
        res.end(error.toString());
    }
});

app.get('/api/queue', (req, res) => {
    res.header('Content-Type', 'application/json');
    res.end(JSON.stringify(QUEUE.list));
});

app.post('/api/queue/add/:id', async (req, res) => {
    try {
        await api.getVideo(req.params.id);
        QUEUE.addVideo((req.query.who || "Someone") as string, req.params.id);
        res.header('Content-Type', 'application/json');
        res.end(JSON.stringify(QUEUE.list));
    }catch(error) {
        console.error(error);
        res.statusCode = 500;
        res.end(error.toString());
    }
});

app.delete('/api/queue/remove/:index', (req, res) => {
    QUEUE.removeVideo((req.query.who || "Someone") as string, +req.params.index);
    res.header('Content-Type', 'application/json');
    res.end(JSON.stringify(QUEUE.list));
});

io.on('connection', socket => {
    console.log("connect", socket.handshake.auth, socket.id);
    if (socket.handshake.auth.token == "screen") {
        screens.set(socket.id, socket);
    } else if (socket.handshake.auth.token == "remote") {
        socket.on('play', async () => {
            for (let screen of screens.values()) {
                screen.emit('play');
            }
        });
        socket.on('pause', async () => {
            for (let screen of screens.values()) {
                screen.emit('pause');
            }
        });
    }
    QUEUE.addSubscriber(socket.id, {
        onAdd: (who, id, index) => {
            socket.emit("add", who, id, index, QUEUE.list);
        },
        onRemove: (who, id, index) => {
            socket.emit("remove", who, id, index, QUEUE.list);
        }
    });
});

io.on('disconnect', socket => {
    console.log("disconnect", socket.id);
    screens.delete(socket.id);
    QUEUE.removeSubscriber(socket.id);
});

server.listen(PORT, '0.0.0.0', () => console.log(`Listening on port ${PORT}`));
