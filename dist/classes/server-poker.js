"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deck_1 = require("./cards/deck");
const player_1 = require("./players/player");
const table_1 = require("./casino/tables/table");
const poker_game_five_card_stud_1 = require("./games/poker/five-card-stud/poker-game-five-card-stud");
const money_formatter_1 = require("./clients/chips/money-formatter");
const table_manager_1 = require("./casino/tables/table-manager");
const user_1 = require("./players/user");
const table_rules_1 = require("./casino/tables/table-rules");
const stakes_1 = require("./casino/tables/betting/stakes");
const client_manager_1 = require("./communication/server-side/client-manager");
const game_client_1 = require("./communication/client-side/game-client");
const table_ui_1 = require("./clients/table-ui");
const server_client_1 = require("./communication/server-side/server-client");
const seat_1 = require("./casino/tables/seat");
const table_watcher_1 = require("./clients/table-watcher");
const game_factory_1 = require("./games/game-factory");
const serializable_1 = require("./communication/serializable");
function createTable() {
    let tableID = 1;
    // # seats, # seconds to act
    let rules = new table_rules_1.TableRules(6, 15);
    // blinds, ante, minRaise
    let stakes = new stakes_1.Stakes(new Array(), 25, 100);
    let table = new table_1.Table(tableID, stakes, rules);
    return table;
}
function createClient(tableID, user, clientManager) {
    // Client Side
    let ui = new table_ui_1.TableUI(user, new money_formatter_1.MoneyFormatter());
    let tableWatcher = new table_watcher_1.TableWatcher(tableID);
    let gameClient = new game_client_1.GameClient();
    // Server Side
    let serverClient = new server_client_1.ServerClient(user.id);
    // Now join all the links in the chain
    ui.registerCommandHandler(tableWatcher);
    tableWatcher.registerMessageHandler(ui);
    tableWatcher.registerCommandHandler(gameClient);
    gameClient.registerMessageHandler(tableWatcher);
    gameClient.connect(serverClient);
    serverClient.connect(gameClient);
    return serverClient;
} // createClient
(async function () {
    // return testBetTracker();
    let table = createTable();
    // Create the components, working from the UI all the way to the TableManager on the server
    let clientManager = new client_manager_1.ClientManager();
    let tableManager = new table_manager_1.TableManager(table.id, table, new deck_1.Deck());
    tableManager.setGame((new game_factory_1.GameFactory()).create(poker_game_five_card_stud_1.PokerGameFiveCardStud.ID));
    let danny = new user_1.User(1, 'Danny', 10000);
    let mark = new user_1.User(2, 'Mark', 10000);
    let paul = new user_1.User(3, 'Paul', 10000);
    let joe = new user_1.User(4, 'Joe', 10000);
    let sekhar = new user_1.User(5, 'Sekhar', 0);
    clientManager.setTableManager(tableManager);
    clientManager.addClient(createClient(table.id, danny, clientManager));
    clientManager.addClient(createClient(table.id, mark, clientManager));
    clientManager.addClient(createClient(table.id, paul, clientManager));
    clientManager.addClient(createClient(table.id, joe, clientManager));
    clientManager.addClient(createClient(table.id, sekhar, clientManager));
})();
function setupSeat(seatIndex, userID, name, chips) {
    let seat = new seat_1.Seat(seatIndex);
    seat.hand = new serializable_1.Hand();
    seat.player = new player_1.Player(userID, name);
    seat.player.chips = chips;
    return seat;
}
function testBetTracker() {
    const minBet = 20;
    let tracker = new serializable_1.BetTracker();
    tracker.reset();
    let dannySeat = setupSeat(1, 1, 'Danny', 10);
    let markSeat = setupSeat(2, 2, 'Mark', 100);
    tracker.seatIndex = 1;
    let bet = tracker.addBet(dannySeat, 10, minBet);
    console.log(bet);
    console.log(tracker.toString());
    tracker.seatIndex = 2;
    bet = tracker.addBet(markSeat, 0, minBet);
    console.log(bet);
    console.log(tracker.toString());
}
