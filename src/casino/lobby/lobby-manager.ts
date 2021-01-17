import { IServerClient } from '../../communication/server-side/i-server-client';
import { ActionMessage } from '../../messages/action-message';
import { Command } from '../../commands/command';
import { TableController } from '../tables/table-controller';
import { ClientManager } from '../../communication/server-side/client-manager';

import { Table } from '../tables/table';
import { TableRules } from '../tables/table-rules';

import { Deck } from '../../cards/deck';
import { Stakes } from '../tables/betting/stakes';

import { GameFactory } from '../../games/game-factory';
import { PokerGameFiveCardStud } from '../../games/poker/games/poker-game-five-card-stud';
import { PokerGameSevenCardStud } from '../../games/poker/games/poker-game-seven-card-stud';
import { PokerGameTexasHoldEm } from '../../games/poker/games/poker-game-texas-hold-em';
import { PokerGameOmaha } from '../../games/poker/games/poker-game-omaha';
import { Blind } from '../tables/betting/blind';

import { LobbyCommand } from '../../commands/lobby/lobby-command';
import { JoinTableCommand } from '../../commands/lobby/join-table-command';
import { UserManager } from '../../players/user-manager';



export class LobbyManager {


    private nextID: number;

    private userManager: UserManager;

    private tableControllerMap: Map<number, TableController>;
    private clientManagerMap: Map<number, ClientManager>;


    constructor(userManager: UserManager) {

        this.userManager = userManager;

        this.nextID = 0;

        this.tableControllerMap = new Map<number, TableController>();
        this.clientManagerMap = new Map<number, ClientManager>();

        this.setUp();

    }


    private log(msg: string): void {

        console.log('\x1b[33m%s\x1b[0m', `LobbyManager ${msg}`);

    }



    public handleCommand(command: Command, serverClient: IServerClient): void {

        if (!(command instanceof LobbyCommand)) {
            return;
        }

        if (command instanceof JoinTableCommand) {

            return this.addTableClient(command.tableID, serverClient);

        }


    }


    private setUp(): void {

        let cornDog: Table = this.createCornDog();
        this.log(`Created table CornDog with ID ${cornDog.id}`);

        let kershner: Table = this.createKershner();
        this.log(`Created table Kershner with ID ${kershner.id}`);

    }  // setUp


    createCornDog(): Table {

        let tableID = ++this.nextID;

        // # seats, # seconds to act
        let rules = new TableRules(6, 5, 5);

        let ante = 25;

        // Both of the regular blinds are live bets (they could towards the current round of betting)
        let blinds: Blind[] =
            [
                new Blind(Blind.TYPE_SMALL, 'the small blind', 50, true),
                new Blind(Blind.TYPE_BIG, 'the big blind', 100, true)
            ];

        let bets: number[] = [100, 100, 200, 200];
        let maxRaises: number = 4;

        let stakes = new Stakes(ante, blinds, bets, Stakes.LIMIT, maxRaises);

        let table: Table = new Table(tableID, stakes, rules);

        let tableController: TableController = new TableController(this.userManager, table, new Deck());
        let clientManager: ClientManager = new ClientManager(tableID);

        this.tableControllerMap.set(table.id, tableController);
        this.clientManagerMap.set(table.id, clientManager);

        clientManager.setTableController(tableController);
        tableController.registerMessageHandler(clientManager);

        // tableController.setGame((new GameFactory()).create(PokerGameFiveCardStud.ID));
        // tableController.setGame((new GameFactory()).create(PokerGameSevenCardStud.ID));
        tableController.setGame((new GameFactory()).create(PokerGameTexasHoldEm.ID));
        // tableController.setGame((new GameFactory()).create(PokerGameOmaha.ID));

        return table;

    }  // createCornDog


    createKershner(): Table {

        let tableID = ++this.nextID;

        // # seats, # seconds to act
        let rules = new TableRules(6, 5, 5);

        let ante = 25;

        // Both of the regular blinds are live bets (they could towards the current round of betting)
        let blinds: Blind[] =
            [
                new Blind(Blind.TYPE_SMALL, 'the small blind', 50, true),
                new Blind(Blind.TYPE_BIG, 'the big blind', 100, true)
            ];

        let bets: number[] = [100, 100, 200, 200];
        let maxRaises: number = 4;

        let stakes = new Stakes(ante, blinds, bets, Stakes.LIMIT, maxRaises);

        let table: Table = new Table(tableID, stakes, rules);

        let tableController: TableController = new TableController(this.userManager, table, new Deck());
        let clientManager: ClientManager = new ClientManager(tableID);

        this.tableControllerMap.set(table.id, tableController);
        this.clientManagerMap.set(table.id, clientManager);

        clientManager.setTableController(tableController);
        tableController.registerMessageHandler(clientManager);

        // tableController.setGame((new GameFactory()).create(PokerGameFiveCardStud.ID));
        // tableController.setGame((new GameFactory()).create(PokerGameSevenCardStud.ID));
        tableController.setGame((new GameFactory()).create(PokerGameTexasHoldEm.ID));
        // tableController.setGame((new GameFactory()).create(PokerGameOmaha.ID));

        return table;

    }  // createKershner


    getTableController(tableID: number): TableController {

        // will be `undefined` if the ID is unknown
        return this.tableControllerMap.get(tableID);

    }

    private getClientManager(tableID: number): ClientManager {

        // will be `undefined` if the ID is unknown
        return this.clientManagerMap.get(tableID);

    }


    addTableClient(tableID: number, client: IServerClient): void {

        let clientManager = this.getClientManager(tableID);

        this.log(`In addTableClient, found clientManager for ${tableID} ? ${(clientManager != null)}`);

        if (clientManager != null) {

            clientManager.addClient(client);

        }

    }  // addTableClient


}