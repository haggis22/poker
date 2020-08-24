import { Deck } from "./cards/deck";
import { Player } from "./players/player";
import { Table } from "./casino/tables/table";
import { PokerGameFiveCardDraw } from "./games/poker/five-card-draw/poker-game-five-card-draw";
import { PokerGameFiveCardStud } from "./games/poker/five-card-stud/poker-game-five-card-stud";
import { MoneyFormatter } from "./clients/chips/money-formatter";
import { TableManager } from "./casino/tables/table-manager";
import { User } from "./players/user";
import { TableRules } from "./casino/tables/table-rules";
import { Stakes } from "./casino/tables/betting/stakes";
import { ClientManager } from "./communication/server-side/client-manager";
import { GameClient } from "./communication/client-side/game-client";
import { TableUI } from "./clients/table-ui";
import { ServerClient } from "./communication/server-side/server-client";
import { Serializer } from "./communication/serializer";
import { Seat } from "./casino/tables/seat";
import { Card } from "./cards/card";
import { CardValue } from "./cards/card-value";
import { CardSuit } from "./cards/card-suit";
import { TableWatcher } from "./clients/table-watcher";
import { DealtCard } from "./hands/dealt-card";
import { GameFactory } from "./games/game-factory";
import { Game } from "./games/game";
import { BetTracker, Bet, Hand } from "./communication/serializable";


function createTable(): Table {

    let tableID = 1;

    // # seats, # seconds to act
    let rules = new TableRules(6, 15);

    // blinds, ante, minRaise
    let stakes = new Stakes(new Array<number>(), 25, 100);

    let table: Table = new Table(tableID, stakes, rules);

    return table;

}


function createClient(tableID: number, user: User, clientManager: ClientManager): ServerClient {

    // Client Side
    let ui: TableUI = new TableUI(user, new MoneyFormatter());
    let tableWatcher: TableWatcher = new TableWatcher(tableID);
    let gameClient: GameClient = new GameClient();

    // Server Side
    let serverClient: ServerClient = new ServerClient(user.id);

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
    // return testSerializer();

    let table: Table = createTable();

    // Create the components, working from the UI all the way to the TableManager on the server

    let clientManager: ClientManager = new ClientManager();
    let tableManager: TableManager = new TableManager(table.id, table, new Deck());
    tableManager.setGame((new GameFactory()).create(PokerGameFiveCardStud.ID));

    let danny = new User(1, 'Danny', 10000);
    let mark = new User(2, 'Mark', 10000);
    let paul = new User(3, 'Paul', 10000);
    let joe = new User(4, 'Joe', 10000);
    let sekhar = new User(5, 'Sekhar', 0);

    clientManager.setTableManager(tableManager);

    clientManager.addClient(createClient(table.id, danny, clientManager));
    clientManager.addClient(createClient(table.id, mark, clientManager));
    clientManager.addClient(createClient(table.id, paul, clientManager));
    clientManager.addClient(createClient(table.id, joe, clientManager));
    clientManager.addClient(createClient(table.id, sekhar, clientManager));

})();


function setupSeat(seatIndex: number, userID: number, name: string, chips: number): Seat {

    let seat: Seat = new Seat(seatIndex);
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
    let bet: Bet = tracker.addBet(dannySeat, 10, minBet);
    console.log(bet);
    console.log(tracker.toString());

    tracker.seatIndex = 2;
    bet = tracker.addBet(markSeat, 0, minBet);
    console.log(bet);
    console.log(tracker.toString());


}

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
        danny: new DealtCard(new Card(CardValue.VALUES[0], CardSuit.VALUES[0]), true)
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

    let danny: Player = new Player(1, 'Danny');
    danny.chips = 500;

    let s1: Seat = new Seat(0);
    s1.player = danny;
    s1.hand = null;
    array.push(s1);

    let paul1: Player = new Player(2, 'Paul');
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
