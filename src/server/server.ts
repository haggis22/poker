﻿import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

import { AddressInfo } from 'net';

import { User } from '../players/user';
import { MoneyFormatter } from '../casino/tables/chips/money-formatter';
import { TableWatcher } from '../casino/tables/table-watcher';
import { ServerClient } from '../communication/server-side/server-client';
import { LocalGameClient } from '../communication/client-side/local-game-client';
import { LocalServerClient } from '../communication/server-side/local-server-client';
import { RoboTableUI } from '../ai/robo-table-ui';
import { UserManager } from '../players/user-manager';
import { TableManager } from '../casino/lobby/table-manager';
import { LobbyManager } from '../casino/lobby/lobby-manager';

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const PORT: number = 3000;

// start our server
server.listen(PORT, () => {
    console.log(`Server started on port ${(server.address() as AddressInfo).port} :)`);
});

app.get('/', (req, res) => res.send('Le sigh...'));

let clientPath = __dirname + '/../client';
console.log(`Serving files from client path ${clientPath}`);

app.use(express.static(clientPath));

let tableManager: TableManager = new TableManager();
let lobbyManager: LobbyManager = new LobbyManager(tableManager);
let userManager: UserManager = new UserManager();

lobbyManager.setup();


let tableID = 1;

// RoboClients will automatically connect themselves to the passed-in lobbyManager
// createRoboClient(tableID, lobbyManager, userManager.getUserByID(1));
createRoboClient(tableID, lobbyManager, userManager.getUserByID(2));
createRoboClient(tableID, lobbyManager, userManager.getUserByID(3));


wss.on('connection', (socket: WebSocket) => {

    let user: User = userManager.getUserByID(1);
    let serverClient: ServerClient = new ServerClient(socket, lobbyManager, user.id);

    // Finally, connect the constructed server client to the lobby manager
    lobbyManager.addClient(serverClient);

});





function createRoboClient(tableID: number, lobbyManager: LobbyManager, user: User): LocalServerClient {

    // Client Side
    let ui: RoboTableUI = new RoboTableUI(user, new MoneyFormatter());
    let tableWatcher: TableWatcher = new TableWatcher(tableID);
    let gameClient: LocalGameClient = new LocalGameClient();

    // Server Side
    let roboClient: LocalServerClient = new LocalServerClient(tableID, lobbyManager, user.id);

    // Now join all the links in the chain
    ui.registerCommandHandler(tableWatcher);

    tableWatcher.registerMessageHandler(ui);
    tableWatcher.registerCommandHandler(gameClient);

    gameClient.registerMessageHandler(tableWatcher);
    gameClient.connect(roboClient);

    roboClient.connect(gameClient);

    // Finally, connect the constructed server client to the lobby manager
    lobbyManager.addClient(roboClient);
    lobbyManager.addTableClient(tableID, roboClient);

    return roboClient;

}  // createRoboClient
