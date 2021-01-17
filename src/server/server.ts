import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

import { AddressInfo } from 'net';

import { UserSummary } from '../players/user-summary';
import { MoneyFormatter } from '../casino/tables/chips/money-formatter';
import { TableWatcher } from '../casino/tables/table-watcher';
import { ServerClient } from '../communication/server-side/server-client';
import { LocalGameClient } from '../communication/client-side/local-game-client';
import { LocalServerClient } from '../communication/server-side/local-server-client';
import { RoboTableUI } from '../ai/robo-table-ui';
import { UserManager } from '../players/user-manager';
import { LobbyManager } from '../casino/lobby/lobby-manager';
import { IServerClient } from '../communication/server-side/i-server-client';

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

let clients: Set<IServerClient> = new Set<IServerClient>();


// RoboClients will automatically connect themselves to the passed-in lobbyManager

createRoboClient(2, 'moglesby');
createRoboClient(2, 'ptunney');

createRoboClient(1, 'pgrudowski');
createRoboClient(1, 'jhoepken');
createRoboClient(1, 'mgillmore');
createRoboClient(1, 'benney');


wss.on('connection', (socket: WebSocket) => {

    clients.add(new ServerClient(socket, userManager, lobbyManager));

});





function createRoboClient(tableID: number, authToken: string): LocalServerClient {

    let user: UserSummary = userManager.authenticate(authToken);

    // Server Side
    let roboServerClient: LocalServerClient = new LocalServerClient(lobbyManager, user);

    // Client Side
    let ui: RoboTableUI = new RoboTableUI(user, new MoneyFormatter());
    let tableWatcher: TableWatcher = new TableWatcher(tableID);
    let gameClient: LocalGameClient = new LocalGameClient(roboServerClient, authToken);

    // Now join all the links in the chain
    ui.registerCommandHandler(tableWatcher);

    tableWatcher.registerMessageHandler(ui);
    tableWatcher.registerCommandHandler(gameClient);

    gameClient.registerMessageHandler(tableWatcher);

    roboServerClient.connect(gameClient);

    // Finally, connect the constructed server client to the lobby manager
    lobbyManager.addTableClient(tableID, roboServerClient);

    return roboServerClient;

}  // createRoboClient
