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
import { TableUI } from "./clients/table-ui";
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

    // Create the components, working from the UI all the way to the TableManager on the server

    // Client Side
    let dannyUI: TableUI = new TableUI(danny, new MoneyFormatter());
    let tableWatcher: TableManager = new TableManager(false, table.id, null);
    let gameClient: GameClient = new GameClient();

    // Server Side
    let dannyServerClient: ServerClient = new ServerClient(danny.id);
    let clientManager: ClientManager = new ClientManager();
    let serverTableManager: TableManager = new TableManager(true, table.id, table);

    // Now join all the links in the chain
    dannyUI.registerCommandHandler(tableWatcher);

    tableWatcher.registerMessageHandler(dannyUI);
    tableWatcher.registerCommandHandler(gameClient);

    gameClient.registerMessageHandler(tableWatcher);
    gameClient.connect(dannyServerClient);

    dannyServerClient.connect(gameClient);
    dannyServerClient.registerCommandHandler(clientManager);

    clientManager.registerMessageHandler(dannyServerClient);
    clientManager.registerCommandHandler(serverTableManager);

    serverTableManager.registerMessageHandler(clientManager);

    let mark = new User(2, 'Mark', 10000);
    let paul = new User(3, 'Paul', 10000);
    let joe = new User(4, 'Joe', 10000);
    let sekhar = new User(5, 'Sekhar', 0);


    serverTableManager.handleCommand(new TableSnapshotCommand(table.id, danny.id));

    {
        let requestSeatCommand = new RequestSeatCommand(table.id, danny, null);
        serverTableManager.handleCommand(requestSeatCommand);
    }

/*

    {
        let requestSeatCommand = new RequestSeatCommand(table.id, mark, null);
        serverTableManager.handleCommand(requestSeatCommand);
    }

    {
        let requestSeatCommand = new RequestSeatCommand(table.id, paul, null);
        serverTableManager.handleCommand(requestSeatCommand);
    }

    {
        let requestSeatCommand = new RequestSeatCommand(table.id, joe, null);
        serverTableManager.handleCommand(requestSeatCommand);
    }

    {
        let requestSeatCommand = new RequestSeatCommand(table.id, sekhar, null);
        serverTableManager.handleCommand(requestSeatCommand);
    }


    {
        serverTableManager.handleCommand(new AddChipsCommand(table.id, 1, 700));
    }

    {
        serverTableManager.handleCommand(new AddChipsCommand(table.id, 2, 500));
    }

    {
        serverTableManager.handleCommand(new AddChipsCommand(table.id, 3, 600));
    }

    {
        serverTableManager.handleCommand(new AddChipsCommand(table.id, 4, 400));
    }

    {
        serverTableManager.handleCommand(new StartGameCommand(table.id));
    }

*/


})();

