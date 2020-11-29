import { Table } from '../tables/table';
import { TableController } from '../tables/table-controller';
import { TableRules } from '../tables/table-rules';

import { Deck } from '../../cards/deck';
import { Stakes } from '../tables/betting/stakes';
import { ClientManager } from '../../communication/server-side/client-manager';

import { GameFactory } from '../../games/game-factory';
import { PokerGameFiveCardStud } from '../../games/poker/games/poker-game-five-card-stud';
import { PokerGameSevenCardStud } from '../../games/poker/games/poker-game-seven-card-stud';
import { PokerGameTexasHoldEm } from '../../games/poker/games/poker-game-texas-hold-em';
import { PokerGameOmaha } from '../../games/poker/games/poker-game-omaha';


export class TableManager {


    private nextID: number;

    private tableControllerMap: Map<number, TableController>;
    private clientManagerMap: Map<number, ClientManager>;


    constructor() {

        this.nextID = 0;

        this.tableControllerMap = new Map<number, TableController>();
        this.clientManagerMap = new Map<number, ClientManager>();

    }



    createTable() {

        let tableID = ++this.nextID;

        // # seats, # seconds to act
        let rules = new TableRules(6, 5, 15);

        // blinds, ante, minRaise
        let stakes = new Stakes(new Array<number>(), 25, 100);

        let table: Table = new Table(tableID, stakes, rules);

        let tableController: TableController = new TableController(table, new Deck());
        let clientManager: ClientManager = new ClientManager(tableID);

        this.tableControllerMap.set(table.id, tableController);
        this.clientManagerMap.set(table.id, clientManager);

        clientManager.setTableController(tableController);
        tableController.registerMessageHandler(clientManager);

        // tableController.setGame((new GameFactory()).create(PokerGameFiveCardStud.ID));
        // tableController.setGame((new GameFactory()).create(PokerGameSevenCardStud.ID));
        // tableController.setGame((new GameFactory()).create(PokerGameTexasHoldEm.ID));
        tableController.setGame((new GameFactory()).create(PokerGameOmaha.ID));

        return table;

    }

    getTableController(tableID: number): TableController {

        // will be `undefined` if the ID is unknown
        return this.tableControllerMap.get(tableID);

    }

    getClientManager(tableID: number): ClientManager {

        // will be `undefined` if the ID is unknown
        return this.clientManagerMap.get(tableID);

    }


}