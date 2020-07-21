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


const TABLE_ID = 1;
let table = new Table(TABLE_ID, 6, new Deck());

let tableManager = new TableManager(table, new PokerGameFiveCardDraw(), new MoneyFormatter());

let danny = new User(1, 'Daniel', 10000);
let mark = new User(2, 'Mark', 10000);
let paul = new User(3, 'Paul', 10000);
let joe = new User(4, 'Joe', 10000);

{
    let requestSeatCommand = new RequestSeatCommand(TABLE_ID, danny, null);
    let result = tableManager.handleCommand(requestSeatCommand);
    console.log(result.message);
}

{
    let requestSeatCommand = new RequestSeatCommand(TABLE_ID, mark, null);
    let result = tableManager.handleCommand(requestSeatCommand);
    console.log(result.message);
}

{
    let requestSeatCommand = new RequestSeatCommand(TABLE_ID, paul, null);
    let result = tableManager.handleCommand(requestSeatCommand);
    console.log(result.message);
}

{
    let requestSeatCommand = new RequestSeatCommand(TABLE_ID, joe, null);
    let result = tableManager.handleCommand(requestSeatCommand);
    console.log(result.message);
}

console.log(tableManager.handleCommand(new AddChipsCommand(TABLE_ID, 1, 2000)).message);
console.log(tableManager.handleCommand(new AddChipsCommand(TABLE_ID, 2, 2000)).message);
console.log(tableManager.handleCommand(new AddChipsCommand(TABLE_ID, 3, 2000)).message);
console.log(tableManager.handleCommand(new AddChipsCommand(TABLE_ID, 4, 2000)).message);

console.log(tableManager.handleCommand(new StartGameCommand(TABLE_ID)).message);




// table.playHand();

