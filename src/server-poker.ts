// ****************************************************************
// This file is used for testing, not for actually running a server
// ****************************************************************

import { Deck } from "./cards/deck";
import { Player } from "./players/player";
import { Table } from "./casino/tables/table";
import { TableController } from "./casino/tables/table-controller";
import { User } from "./players/user";
import { TableRules } from "./casino/tables/table-rules";
import { Stakes } from "./casino/tables/betting/stakes";
import { ClientManager } from "./communication/server-side/client-manager";
import { Seat } from "./casino/tables/seat";
import { GameFactory } from "./games/game-factory";
import { BetTracker, Bet, Hand } from "./communication/serializable";
import { TableWatcher } from "./casino/tables/table-watcher";
import { TableUI } from "./client/table-ui";
import { MoneyFormatter } from "./casino/tables/chips/money-formatter";
import { LocalGameClient } from "./communication/client-side/local-game-client";
import { LocalServerClient } from "./communication/server-side/local-server-client";
import { PokerGameFiveCardStud } from "./games/poker/games/poker-game-five-card-stud";
import { TableManager } from './casino/lobby/table-manager';
import { LobbyManager } from './casino/lobby/lobby-manager';
import { UserManager } from "./players/user-manager";


function createTable(): Table {

    let tableID = 1;

    // # seats, # seconds to act
    let rules = new TableRules(6, 5, 15);

    // blinds, ante, minRaise
    let stakes = new Stakes(new Array<number>(), 25, 100);

    let table: Table = new Table(tableID, stakes, rules);

    return table;

}


function createClient(tableID: number, lobbyManager: LobbyManager, user: User, clientManager: ClientManager): LocalServerClient {

    // Client Side
    let ui: TableUI = new TableUI(new MoneyFormatter());
    let tableWatcher: TableWatcher = new TableWatcher(tableID);
    let gameClient: LocalGameClient = new LocalGameClient();

    // Server Side
    let serverClient: LocalServerClient = new LocalServerClient(tableID, lobbyManager, user.id);

    // Now join all the links in the chain
    ui.registerCommandHandler(tableWatcher);

    tableWatcher.registerMessageHandler(ui);
    tableWatcher.registerCommandHandler(gameClient);

    gameClient.registerMessageHandler(tableWatcher);
    gameClient.connect(serverClient);

    serverClient.connect(gameClient);

    return serverClient;

}  // createClient


(async function () {

    // return testBetTracker();

    let table: Table = createTable();

    // Create the components, working from the UI all the way to the TableController on the server

    let clientManager: ClientManager = new ClientManager(table.id);
    let tableController: TableController = new TableController(table, new Deck());
    tableController.setGame((new GameFactory()).create(PokerGameFiveCardStud.ID));

    let userManager: UserManager = new UserManager();
    let tableManager: TableManager = new TableManager();
    let lobbyManager: LobbyManager = new LobbyManager(userManager, tableManager);

    clientManager.setTableController(tableController);



    createClient(table.id, lobbyManager, userManager.login('dshell', null), clientManager);
    createClient(table.id, lobbyManager, userManager.login('mgillmore', null), clientManager);
    createClient(table.id, lobbyManager, userManager.login('pgrudowski', null), clientManager);
    createClient(table.id, lobbyManager, userManager.login('jhoepken', null), clientManager);
    createClient(table.id, lobbyManager, userManager.login('srao', null), clientManager);

})();


function setupSeat(seatIndex: number, userID: number, name: string, chips: number): Seat {

    let seat: Seat = new Seat(seatIndex);
    seat.isInHand = true;
    seat.hand = new Hand();
    seat.player = new Player(userID, name);
    seat.player.chips = chips;

    return seat;

}


function testBetTracker() {

    const minBet: number = 20;

    let tracker: BetTracker = new BetTracker();

    tracker.reset();

    let dannySeat: Seat = setupSeat(1, 1, 'Danny', 10);
    let markSeat: Seat = setupSeat(2, 2, 'Mark', 100);

    tracker.seatIndex = 1;
    let bet: Bet = tracker.addBet(dannySeat, Bet.TYPE.REGULAR, 10, minBet);
    console.log(bet);
    console.log(tracker.toString());

    tracker.seatIndex = 2;
    bet = tracker.addBet(markSeat, Bet.TYPE.REGULAR, 0, minBet);
    console.log(bet);
    console.log(tracker.toString());


}


