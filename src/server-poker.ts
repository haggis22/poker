import { Deck } from "./cards/deck";
import { Player } from "./players/player";
import { Table } from "./casino/tables/table";
import { PokerGameFiveCardDraw } from "./games/poker/five-card-draw/poker-game-five-card-draw";
import { PokerGameFiveCardStud } from "./games/poker/five-card-stud/poker-game-five-card-stud";
import { MoneyFormatter } from "./casino/chips/money-formatter";
import { TableManager } from "./casino/tables/table-manager";
import { RequestSeatCommand } from "./commands/table/request-seat-command";
import { User } from "./players/user";
import { AddChipsCommand } from "./commands/table/add-chips-command";
import { StartGameCommand } from "./commands/table/start-game-command";
import { TableWatcher } from "./casino/clients/table-watcher";
import { TableRules } from "./casino/tables/table-rules";
import { Stakes } from "./casino/tables/stakes";


(async function () {

    const TABLE_ID = 1;

    let blinds = new Array<number>();

    let stakes = new Stakes(blinds, 50, 100);

    // 6 seats
    // 1 second to act
    let rules = new TableRules(6, 0.5);

    let table = new Table(TABLE_ID, stakes, rules, new Deck());

    let tableManager = new TableManager(table, new PokerGameFiveCardStud());

    let danny = new User(1, 'Danny', 10000);
    let mark = new User(2, 'Mark', 10000);
    let paul = new User(3, 'Paul', 10000);
    let joe = new User(4, 'Joe', 10000);
    let sekhar = new User(5, 'Sekhar', 0);

    let client = new TableWatcher(table.id, danny.id, new MoneyFormatter());
    tableManager.register(client);

    {
        let requestSeatCommand = new RequestSeatCommand(TABLE_ID, danny, null);
        let result = await tableManager.handleCommand(requestSeatCommand);
    }

    {
        let requestSeatCommand = new RequestSeatCommand(TABLE_ID, mark, null);
        let result = await tableManager.handleCommand(requestSeatCommand);
    }

    {
        let requestSeatCommand = new RequestSeatCommand(TABLE_ID, paul, null);
        let result = await tableManager.handleCommand(requestSeatCommand);
    }

    {
        let requestSeatCommand = new RequestSeatCommand(TABLE_ID, joe, null);
        let result = await tableManager.handleCommand(requestSeatCommand);
    }

    {
        tableManager.handleCommand(new AddChipsCommand(TABLE_ID, 1, 700));
    }

    {
        tableManager.handleCommand(new AddChipsCommand(TABLE_ID, 2, 500));
    }

    {
        tableManager.handleCommand(new AddChipsCommand(TABLE_ID, 3, 600));
    }

    {
        tableManager.handleCommand(new AddChipsCommand(TABLE_ID, 4, 400));
    }

    {
        let result = await tableManager.handleCommand(new StartGameCommand(TABLE_ID));
    }


    // table.playHand();

})();

