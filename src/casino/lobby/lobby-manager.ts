import { IServerClient } from '../../communication/server-side/i-server-client';
import { ActionMessage } from '../../messages/action-message';
import { Command } from '../../commands/command';
import { TableController } from '../tables/table-controller';

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
import { MessageBroadcaster } from '../../messages/message-broadcaster';
import { MessageHandler } from '../../messages/message-handler';
import { Message } from "../../messages/message";
import { MessagePair } from "../../messages/message-pair";
import { Action } from '../../actions/action';
import { SubscribeLobbyCommand, ListTablesAction, TableSummary } from '../../communication/serializable';
import { TableObserver } from '../tables/table-observer';


export class LobbyManager implements MessageBroadcaster, TableObserver {

    private nextID: number;

    private tableControllerMap: Map<number, TableController>;

    private messageQueue: Array<Message | MessagePair>;
    private lobbySubscribers: MessageHandler[];



    constructor() {

        this.nextID = 0;

        this.tableControllerMap = new Map<number, TableController>();

        this.messageQueue = new Array<Message | MessagePair>();
        this.lobbySubscribers = new Array<MessageHandler>();

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

        if (command instanceof SubscribeLobbyCommand) {

            return this.subscribe(serverClient);

        }


    }


    public registerMessageHandler(handler: MessageHandler): void {

        this.lobbySubscribers.push(handler);

    }   // registerMessageHandler


    public unregisterMessageHandler(handler: MessageHandler): void {

        this.lobbySubscribers = this.lobbySubscribers.filter(o => o != handler);

    }


    private pumpQueues(): void {

        while (this.messageQueue.length) {

            this.broadcastMessage(this.messageQueue.shift());

        }

    }  // pumpQueues


    private broadcastMessage(message: Message | MessagePair): void {

        for (let handler of this.lobbySubscribers) {

            handler.handleMessage(message);

        }

    }   // broadcastMessage


    private queueAction(action: Action, userID?: number) {

        this.queueMessage(new ActionMessage(action, userID));

    }

    private queueMessage(message: Message | MessagePair): void {

        if (message instanceof ActionMessage) {

            this.log(`Queueing ${message.action.constructor.name}`);

        }
        else if (message instanceof MessagePair) {

            let publicMessage: string = message.publicMessage && message.publicMessage instanceof ActionMessage ? message.publicMessage.action.constructor.name : '[No public message]';
            let privateMessage: string = message.privateMessage && message.privateMessage instanceof ActionMessage ? message.privateMessage.action.constructor.name : '[No private message]';

            this.log(`Queueing public: ${publicMessage}, private: ${privateMessage} `);

        }

        this.messageQueue.push(message);

        this.pumpQueues();

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

        let table: Table = new Table(tableID, 'Corn Dog', '1/2 Limit Hold\'em', stakes, rules);

        let tableController: TableController = new TableController(table, new Deck());
        tableController.addTableObserver(this);

        this.tableControllerMap.set(table.id, tableController);

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

        let table: Table = new Table(tableID, 'Kershner', '1/2 Limit Hold\'em', stakes, rules);

        let tableController: TableController = new TableController(table, new Deck());
        tableController.addTableObserver(this);

        this.tableControllerMap.set(table.id, tableController);
        
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


    addTableClient(tableID: number, client: IServerClient): void {

        let tableController = this.getTableController(tableID);

        this.log(`In addTableClient, found tableController for ${tableID} ? ${(tableController != null)}`);

        if (tableController != null) {

            tableController.addClient(client);

        }

    }  // addTableClient


    subscribe(client: IServerClient): void {

        this.registerMessageHandler(client);

        // only send the summaries to this new client, not EVERYBODY!!!
        client.handleMessage(new ActionMessage(new ListTablesAction(this.getTablesStatus())));

    }  // subscribe


    private getTablesStatus(): TableSummary[] {

        return [...this.tableControllerMap.values()].map(controller => controller.getTableSummary());

    }  // getTablesStatus


    private pushTableStatus(): void {

        this.broadcastMessage(new ActionMessage(new ListTablesAction(this.getTablesStatus())));

    }  // pushTableStatus


    public notifyTableUpdated(table: Table) {

        this.pushTableStatus();

    }  // notifyTableUpdated


}