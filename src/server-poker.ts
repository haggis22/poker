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
import { Serializer } from "./communication/serializer";
import { Seat } from "./casino/tables/seat";
import { Card } from "./cards/card";
import { CardValue } from "./cards/card-value";
import { CardSuit } from "./cards/card-suit";


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

     // testSerializer();
     // return;

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


function testTableSerializer() {

    let serializer: Serializer = new Serializer();

    let table: Table = createTable();

    console.log(JSON.stringify(table));

    let mushed: string = serializer.serialize(table);

    console.log(`Serialized: ${mushed}`);

    let rabbit: any = serializer.deserialize(mushed);

    console.log(JSON.stringify(rabbit));

    if (rabbit instanceof Table) {
        console.log('It IS a Table');
    }
    else {
        console.log('It is NOT a Table');
    }
    

}

function testSerializer() {

    let serializer: Serializer = new Serializer();

    // let one: any = new Deck();
    // let one: any = new Card(CardValue.VALUES[0], CardSuit.VALUES[0]);
    // let one: any = CardValue.VALUES[0];

    let one: any =
    {
        danny: new Card(CardValue.VALUES[0], CardSuit.VALUES[0])
    };

    // console.log(JSON.stringify(one));

    let mushed: string = serializer.serialize(one);

    console.log(`Serialized: ${mushed}`);

    // let rabbit: any = serializer.deserialize(mushed);

    // console.log(JSON.stringify(rabbit));

    /*
    let rules = 

    // blinds, ante, minRaise
    let stakes = 

    let table: Table = new Table(tableID, new PokerGameFiveCardStud(), stakes, rules, );
*/

}

function testSerializerPlayer() {

    let serializer: Serializer = new Serializer();
    let array: Seat[] = new Array<Seat>();

    let danny: Player = new Player();
    danny.userID = 1;
    danny.name = "Danny";
    danny.chips = 500;

    let s1: Seat = new Seat(0);
    s1.player = danny;
    s1.hand = null;
    array.push(s1);

    let paul1: Player = new Player();
    paul1.userID = 2;
    paul1.name = "Paul";
    paul1.chips = 200;

    let s2: Seat = new Seat(1);
    s2.player = danny;
    s2.hand = null;
    array.push(s2);

    array.push(s2);


    console.log(JSON.stringify(array));

    let mushed: string = serializer.serialize(array);

    console.log(`Serialized: ${mushed}`);

    let rabbit: any = serializer.deserialize(mushed);

    console.log(JSON.stringify(rabbit));

    if (Array.isArray(rabbit)) {
        console.log('It IS an array');
        for (let x of rabbit) {

            console.log(`Object is ${x.constructor.name}, instanceof Player? ${(x instanceof Player)}`);

        }
    }

    return;


}
