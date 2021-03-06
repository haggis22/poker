import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

import { AddressInfo } from 'net';

import { UserManager } from '../players/user-manager';

import { LobbyManager } from '../casino/lobby/lobby-manager';
import { CashierManager } from '../casino/cashier/cashier-manager';

import { MoneyFormatter } from '../casino/tables/chips/money-formatter';
import { TableWatcher } from '../casino/tables/table-watcher';
import { ServerClient } from '../communication/server-side/server-client';
import { RoboTableUI } from '../ai/robo-table-ui';


import { IServerClient } from '../communication/server-side/i-server-client';
import { GameClient } from '../communication/client-side/game-client';

import { FakeSocket } from '../communication/fake/fake-socket';
import { FakeSocketWrapper } from '../communication/fake/fake-socket-wrapper';
import { ServerWebSocketWrapper } from '../communication/server-side/server-web-socket-wrapper';

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

let userManager: UserManager = new UserManager();
let lobbyManager: LobbyManager = new LobbyManager();
let cashierManager: CashierManager = new CashierManager(userManager, lobbyManager);

let clients: Set<IServerClient> = new Set<IServerClient>();


// RoboClients will automatically connect themselves to the passed-in lobbyManager

createRoboClient(2, 'moglesby');
createRoboClient(2, 'ptunney');

/*
createRoboClient(1, 'pgrudowski');
createRoboClient(1, 'jhoepken');
createRoboClient(1, 'mgillmore');
createRoboClient(1, 'benney');
*/

/*
createRoboClient(3, 'pgrudowski');
createRoboClient(3, 'jhoepken');
createRoboClient(3, 'mgillmore');
createRoboClient(3, 'benney');
*/

wss.on('connection', (socket: WebSocket) => {

    clients.add(new ServerClient(new ServerWebSocketWrapper(socket), userManager, lobbyManager, cashierManager));

});





function createRoboClient(tableID: number, authToken: string): void {

    let clientSocketSide: FakeSocket = new FakeSocket();
    let serverSocketSide: FakeSocket = new FakeSocket();

    clientSocketSide.connect(serverSocketSide);
    serverSocketSide.connect(clientSocketSide);

    // Client Side
    let ui: RoboTableUI = new RoboTableUI(tableID, new MoneyFormatter());
    let tableWatcher: TableWatcher = new TableWatcher(tableID);
    let gameClient: GameClient = new GameClient(new FakeSocketWrapper(clientSocketSide), authToken);

    // Now join all the links in the chain
    ui.registerCommandHandler(tableWatcher);

    tableWatcher.registerMessageHandler(ui);
    tableWatcher.registerCommandHandler(gameClient);

    gameClient.registerMessageHandler(tableWatcher);

    // Server Side
    clients.add(new ServerClient(new FakeSocketWrapper(serverSocketSide), userManager, lobbyManager, cashierManager));

    // this will kick off the process of the robot client getting itself authorized, joining the table, etc
    ui.authenticate();


}  // createRoboClient
