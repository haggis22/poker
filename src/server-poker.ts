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


(async function () {

    const TABLE_ID = 1;

    // 6 seats
    // 3 seconds to act
    let rules = new TableRules(6, 3);

    let table = new Table(TABLE_ID, rules, new Deck());

    let tableManager = new TableManager(table, new PokerGameFiveCardDraw());

    let danny = new User(1, 'Daniel', 10000);
    let mark = new User(2, 'Mark', 10000);
    let paul = new User(3, 'Paul', 10000);
    let joe = new User(4, 'Joe', 10000);

    let client = new TableWatcher(table, danny.id, new MoneyFormatter());
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
        tableManager.handleCommand(new AddChipsCommand(TABLE_ID, 1, 2000));
    }

    {
        tableManager.handleCommand(new AddChipsCommand(TABLE_ID, 2, 2000));
    }

    {
        tableManager.handleCommand(new AddChipsCommand(TABLE_ID, 3, 2000));
    }

    {
        tableManager.handleCommand(new AddChipsCommand(TABLE_ID, 4, 2000));
    }

    {
        let result = await tableManager.handleCommand(new StartGameCommand(TABLE_ID));
    }


    // table.playHand();

})();

