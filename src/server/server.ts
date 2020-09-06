import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { AddressInfo } from 'net';
import Timer = NodeJS.Timer;

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

let timer: Timer;

wss.on('connection', (ws: WebSocket) => {

    let counter = 0;

    timer = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const value = Math.sin(counter++ * 0.1);
            const data = {
                timestamp: Date.now(),
                value
            };
            ws.send(JSON.stringify(data))
        } else {
            clearInterval(timer);
        }
    }, 1000); // ~ 256 Hz

});

const PORT: number = 3000;

// start our server
server.listen(PORT, () => {
    console.log(`Server started on port ${(server.address() as AddressInfo).port} :)`);
});

app.get('/', (req, res) => res.send('Le sigh...'));

let clientPath = __dirname + '/../client';
console.log(`Serving files from client path ${clientPath}`);

app.use(express.static(clientPath));

