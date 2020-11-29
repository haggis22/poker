import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

import { AddressInfo } from 'net';

import { ClientManager } from '../communication/server-side/client-manager';
import { TableController } from '../casino/tables/table-controller';
import { Deck } from '../cards/deck';
import { GameFactory } from '../games/game-factory';
import { PokerGameFiveCardStud } from '../games/poker/games/poker-game-five-card-stud';
import { User } from '../players/user';
import { Table } from '../casino/tables/table';
import { TableRules } from '../casino/tables/table-rules';
import { Stakes } from '../communication/serializable';
import { MoneyFormatter } from '../casino/tables/chips/money-formatter';
import { TableWatcher } from '../casino/tables/table-watcher';
import { ServerClient } from '../communication/server-side/server-client';
import { LocalGameClient } from '../communication/client-side/local-game-client';
import { LocalServerClient } from '../communication/server-side/local-server-client';
import { RoboTableUI } from '../ai/robo-table-ui';
import { PokerGameSevenCardStud } from '../games/poker/games/poker-game-seven-card-stud';
import { PokerGameTexasHoldEm } from '../games/poker/games/poker-game-texas-hold-em';
import { PokerGameOmaha } from '../games/poker/games/poker-game-omaha';
import { UserManager } from '../players/user-manager';

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

// Create the components, working from the UI all the way to the TableController on the server

let clientManager: ClientManager = new ClientManager();
let tableController: TableController = new TableController(table.id, table, new Deck());
// tableController.setGame((new GameFactory()).create(PokerGameFiveCardStud.ID));
// tableController.setGame((new GameFactory()).create(PokerGameSevenCardStud.ID));
// tableController.setGame((new GameFactory()).create(PokerGameTexasHoldEm.ID));
tableController.setGame((new GameFactory()).create(PokerGameOmaha.ID));


clientManager.setTableController(tableController);

let userManager: UserManager = new UserManager();


clientManager.addClient(createRoboClient(table.id, userManager.getUserByID(1)));
clientManager.addClient(createRoboClient(table.id, userManager.getUserByID(2)));
clientManager.addClient(createRoboClient(table.id, userManager.getUserByID(3)));


wss.on('connection', (socket: WebSocket) => {

    let user: User = userManager.getUserByID(4);

    let serverClient: ServerClient = new ServerClient(socket, user.id);

    clientManager.addClient(serverClient);


});



function createTable(): Table {

    let tableID = 1;

    // # seats, # seconds to act
    let rules = new TableRules(6, 5, 15);

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

}  // createRoboClient
