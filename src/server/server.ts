import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

import { AddressInfo } from 'net';

import { ClientManager } from '../communication/server-side/client-manager';
import { TableManager } from '../casino/tables/table-manager';
import { Deck } from '../cards/deck';
import { GameFactory } from '../games/game-factory';
import { PokerGameFiveCardStud } from '../games/poker/five-card-stud/poker-game-five-card-stud';
import { User } from '../players/user';
import { Table } from '../casino/tables/table';
import { TableRules } from '../casino/tables/table-rules';
import { Stakes } from '../communication/serializable';
import { TableUI } from '../client/table-ui';
import { MoneyFormatter } from '../client/chips/money-formatter';
import { TableWatcher } from '../client/table-watcher';
import { ServerClient } from '../communication/server-side/server-client';
import { LocalGameClient } from '../communication/client-side/local-game-client';
import { LocalServerClient } from '../communication/server-side/local-server-client';
import { RoboTableUI } from './robo-table-ui';

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


let table: Table = createTable();

// Create the components, working from the UI all the way to the TableManager on the server

let clientManager: ClientManager = new ClientManager();
let tableManager: TableManager = new TableManager(table.id, table, new Deck());
tableManager.setGame((new GameFactory()).create(PokerGameFiveCardStud.ID));

let danny = new User(1, 'Danny', 1000);
let mark = new User(2, 'Matt', 1000);
let paul = new User(3, 'Paul', 1000);
// let joe = new User(4, 'Joe', 1000);
// let sekhar = new User(5, 'Sekhar', 0);

clientManager.setTableManager(tableManager);

clientManager.addClient(createRoboClient(table.id, danny));
clientManager.addClient(createRoboClient(table.id, mark));
clientManager.addClient(createRoboClient(table.id, paul));
// clientManager.addClient(createRoboClient(table.id, joe));


wss.on('connection', (socket: WebSocket) => {

    let user: User = new User(5, 'Sehkar', 0);

    let serverClient: ServerClient = new ServerClient(socket, user.id);

    clientManager.addClient(serverClient);


});



function createTable(): Table {

    let tableID = 1;

    // # seats, # seconds to act
    let rules = new TableRules(6, 15);

    // blinds, ante, minRaise
    let stakes = new Stakes(new Array<number>(), 25, 100);

    let table: Table = new Table(tableID, stakes, rules);

    return table;

}


function createRoboClient(tableID: number, user: User): LocalServerClient {

    // Client Side
    let ui: RoboTableUI = new RoboTableUI(user, new MoneyFormatter());
    let tableWatcher: TableWatcher = new TableWatcher(tableID);
    let gameClient: LocalGameClient = new LocalGameClient();

    // Server Side
    let serverClient: LocalServerClient = new LocalServerClient(user.id);

    // Now join all the links in the chain
    ui.registerCommandHandler(tableWatcher);

    tableWatcher.registerMessageHandler(ui);
    tableWatcher.registerCommandHandler(gameClient);

    gameClient.registerMessageHandler(tableWatcher);
    gameClient.connect(serverClient);

    serverClient.connect(gameClient);

    return serverClient;

}  // createLocalClient
