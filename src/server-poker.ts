import { Deck } from "./cards/deck";
import { Player } from "./players/player";
import { Table } from "./casino/tables/table";
import { PokerGameFiveCardDraw } from "./games/poker/five-card-draw/poker-game-five-card-draw";
import { PokerGameFiveCardStud } from "./games/poker/five-card-stud/poker-game-five-card-stud";
import { MoneyFormatter } from "./clients/chips/money-formatter";
import { TableManager } from "./casino/tables/table-manager";
import { RequestSeatCommand } from "./commands/table/request-seat-command";
import { User } from "./players/user";
import { AddChipsCommand } from "./commands/table/add-chips-command";
import { StartGameCommand } from "./commands/table/start-game-command";
import { TableWatcher } from "./clients/table-watcher";
import { TableRules } from "./casino/tables/table-rules";
import { Stakes } from "./casino/tables/betting/stakes";
import { TableSnapshotCommand } from "./commands/table/table-snapshot-command";
import { ClientManager } from "./communication/server-side/client-manager";
import { GameClient } from "./communication/client-side/game-client";
import { ClientUI } from "./clients/client-ui";
import { ServerClient } from "./communication/server-side/server-client";


function createTable(): Table {

    let tableID = 1;

    // # seats, # secods to act
    let rules = new TableRules(6, 0.1);

    // blinds, ante, minRaise
    let stakes = new Stakes(new Array<number>(), 50, 200);

    let table: Table = new Table(tableID, new PokerGameFiveCardStud(), stakes, rules, new Deck());

    return table;

}


(async function () {

    let danny = new User(1, 'Danny', 10000);

    let table: Table = createTable();
    let tableManager: TableManager = new TableManager(table);

    let clientManager: ClientManager = new ClientManager();

    tableManager.registerMessageHandler(clientManager);
    clientManager.registerCommandHandler(tableManager);

    let gameClient: GameClient = new GameClient();
    let tableWatcher: TableWatcher = new TableWatcher(tableManager, table.id, new MoneyFormatter());
    let clientUI: ClientUI = new ClientUI(danny);

    gameClient.registerMessageHandler(tableWatcher);
    gameClient.registerMessageHandler(clientUI);
    clientUI.registerCommandHandler(gameClient);


    let dannyServerClient: ServerClient = new ServerClient(danny.id, clientManager);
    // set up this server object to listen to the gameClient so that it will receive commands
    dannyServerClient.registerCommandHandler(gameClient);

    // set up the client manager to receive commands from the ServerClient
    clientManager.registerCommandHandler(dannyServerClient);

    let mark = new User(2, 'Mark', 10000);
    let paul = new User(3, 'Paul', 10000);
    let joe = new User(4, 'Joe', 10000);
    let sekhar = new User(5, 'Sekhar', 0);


    tableManager.handleCommand(new TableSnapshotCommand(table.id, danny.id));

    {
        let requestSeatCommand = new RequestSeatCommand(table.id, danny, null);
        let result = await tableManager.handleCommand(requestSeatCommand);
    }

    {
        let requestSeatCommand = new RequestSeatCommand(table.id, mark, null);
        let result = await tableManager.handleCommand(requestSeatCommand);
    }

    {
        let requestSeatCommand = new RequestSeatCommand(table.id, paul, null);
        let result = await tableManager.handleCommand(requestSeatCommand);
    }

    {
        let requestSeatCommand = new RequestSeatCommand(table.id, joe, null);
        let result = await tableManager.handleCommand(requestSeatCommand);
    }

    {
        let requestSeatCommand = new RequestSeatCommand(table.id, sekhar, null);
        let result = await tableManager.handleCommand(requestSeatCommand);
    }


    {
        tableManager.handleCommand(new AddChipsCommand(table.id, 1, 700));
    }

    {
        tableManager.handleCommand(new AddChipsCommand(table.id, 2, 500));
    }

    {
        tableManager.handleCommand(new AddChipsCommand(table.id, 3, 600));
    }

    {
        tableManager.handleCommand(new AddChipsCommand(table.id, 4, 400));
    }

    {
        let result = await tableManager.handleCommand(new StartGameCommand(table.id));
    }


    // table.playHand();

})();

