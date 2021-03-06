﻿import { IServerClient } from '../../communication/server-side/i-server-client';
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
import { MessageBroadcaster } from '../../messages/message-broadcaster';
import { MessageHandler } from '../../messages/message-handler';
import { Message } from "../../messages/message";
import { Action } from '../../actions/action';
import { SubscribeLobbyCommand, ListTablesAction, ListTournamentsAction, TableSummary, TournamentSummary, RegisterTournamentCommand, ErrorMessage } from '../../communication/serializable';
import { IButtonController } from '../tables/buttons/i-button-controller';
import { DeadButtonController } from '../tables/buttons/dead-button-controller';
import { CashierManager } from '../cashier/cashier-manager';
import { MoneyFormatter } from '../tables/chips/money-formatter';
import { RandomBlindAssigner } from '../tables/buttons/random-blind-assigner';
import { Limits } from '../tables/betting/limits';
import { TournamentController } from '../tournaments/tournament-controller';
import { TourneyFormatter } from '../tables/chips/tourney-formatter';
import { Game } from '@/app/games/game';
import { Tournament } from '../tournaments/tournament';
import { CommandResult } from '../../commands/command-result';


export class LobbyManager implements MessageBroadcaster {

    public cashierManager: CashierManager;

    private nextTableID: number;

    // Key = tableID
    // Value = TableController for that table
    private tableControllerMap: Map<number, TableController>;

    // Key = id of the IServerClient
    // Value = TableController that is currently serving that client
    private tableControllerByClientMap: Map<string, TableController>;


    private nextTournamentID: number;


    // Key = tournamentID
    // Value = TournamentController for that tournament
    private tournamentControllerMap: Map<number, TournamentController>;


    private messageQueue: Array<Message>;

    // A map of MessageHandlers
    // Key = MessageHandler.id, so that the same handler will not be added more than once
    // Value = MessageHandler object
    private lobbySubscribers: Map<string, MessageHandler>;



    constructor() {

        this.nextTableID = 0;

        this.tableControllerMap = new Map<number, TableController>();
        this.tableControllerByClientMap = new Map<string, TableController>();

        this.nextTournamentID = 0;

        this.tournamentControllerMap = new Map<number, TournamentController>();

        this.messageQueue = new Array<Message>();
        this.lobbySubscribers = new Map<string, MessageHandler>();

    }


    private log(msg: string): void {

        console.log('\x1b[33m%s\x1b[0m', `LobbyManager ${msg}`);

    }

    public handleCommand(command: LobbyCommand, serverClient: IServerClient): Message {

        if (command instanceof JoinTableCommand) {

            return this.addTableClient(command.tableID, serverClient);

        }

        if (command instanceof SubscribeLobbyCommand) {

            return this.subscribe(serverClient);

        }

        if (command instanceof RegisterTournamentCommand) {

            return this.registerTournament(command, serverClient);

        }

    }


    public registerMessageHandler(handler: MessageHandler): void {

        this.lobbySubscribers.set(handler.id, handler);

    }   // registerMessageHandler


    public unregisterMessageHandler(handler: MessageHandler): void {

        this.lobbySubscribers.delete(handler.id);

    }

    public unregisterServerClient(serverClient: IServerClient): void {

        this.unregisterMessageHandler(serverClient);

    }


    private pumpQueues(): void {

        while (this.messageQueue.length) {

            this.broadcastMessage(this.messageQueue.shift());

        }

    }  // pumpQueues


    private broadcastMessage(message: Message): void {

        for (let handler of this.lobbySubscribers.values()) {

            if (handler.isAlive) {
                handler.handleMessage(message);
            }
            else {
                this.unregisterMessageHandler(handler);
            }

        }

    }   // broadcastMessage


    private queueAction(action: Action, userID?: number) {

        this.queueMessage(new ActionMessage(action, userID));

    }

    private queueMessage(message: Message): void {

        this.messageQueue.push(message);

        this.pumpQueues();

    }


    public setUp(): void {

        let cornDog: Table = this.createCornDog();
        this.log(`Created table ${cornDog.name} with ID ${ cornDog.id }`);

        let kershner: Table = this.createKershner();
        this.log(`Created table ${kershner.name} with ID ${kershner.id}`);

        let cornDogNL: Table = this.createCornDogNL();
        this.log(`Created table ${cornDogNL.name} with ID ${cornDogNL.id}`);

        let cdOmaha: Table = this.createCDOmaha();
        this.log(`Created table ${cdOmaha.name} with ID ${cdOmaha.id}`);

        this.createCornDogTournament();

    }  // setUp


    createCornDog(): Table {

        let tableID = ++this.nextTableID;

        let rules = new TableRules(6, /* timeToAnte */ 5, /* timeToAct */ 10);

        let ante = 25;

        // Both of the regular blinds are live bets (they could towards the current round of betting)
        let blinds: Blind[] =
            [
                new Blind(0, Blind.TYPE_SMALL, 'the small blind', 50, true, true),
                new Blind(1, Blind.TYPE_BIG, 'the big blind', 100, true, true)
            ];

        let bets: number[] = [100, 100, 200, 200];
        let maxRaises: number = 4;

        let limits = new Limits(Limits.LIMIT, maxRaises, /* minBuyIn */ 500, /* maxBuyIn */ 10000);
        let stakes = new Stakes(ante, blinds, bets);

        let table: Table = new Table(tableID, 'Corn Dog', '1/2 Limit Hold\'em', limits, stakes, rules, MoneyFormatter.ID);
        let deck: Deck = new Deck();
        let buttonController: IButtonController = new DeadButtonController(new RandomBlindAssigner());

        let tableController: TableController = new TableController(this.cashierManager, this, table, deck, buttonController);

        this.addTableController(tableController);

        // tableController.setGame((new GameFactory()).create(PokerGameFiveCardStud.ID));
        // tableController.setGame((new GameFactory()).create(PokerGameSevenCardStud.ID));
        tableController.setGame((new GameFactory()).create(PokerGameTexasHoldEm.ID));
        // tableController.setGame((new GameFactory()).create(PokerGameOmaha.ID));

        return table;

    }  // createCornDog


    createCornDogNL(): Table {

        let rules = new TableRules(/* numSeats */ 6, /* timeToAnte */ 5, /* timeToAct */ 10);

        let ante = 0;

        // Both of the regular blinds are live bets (they could towards the current round of betting)
        let blinds: Blind[] =
            [
                new Blind(0, Blind.TYPE_SMALL, 'the small blind', 25, true, true),
                new Blind(1, Blind.TYPE_BIG, 'the big blind', 50, true, true)
            ];

        let bets: number[] = [50, 50, 50, 50];
        let maxRaises: number = null;

        let limits = new Limits(Limits.NO_LIMIT, maxRaises, /* minBuyIn */ 500, /* maxBuyIn */ 10000);
        let stakes = new Stakes(ante, blinds, bets);

        let table: Table = this.createTable('Corn Dog NL', '0.25/0.50 No-Limit Texas Hold\'em', limits, stakes, rules, MoneyFormatter.ID);

        let deck: Deck = new Deck();
        let buttonController: IButtonController = new DeadButtonController(new RandomBlindAssigner());

        let tableController: TableController = new TableController(this.cashierManager, this, table, deck, buttonController);

        this.addTableController(tableController);

        // tableController.setGame((new GameFactory()).create(PokerGameFiveCardStud.ID));
        // tableController.setGame((new GameFactory()).create(PokerGameSevenCardStud.ID));
        tableController.setGame((new GameFactory()).create(PokerGameTexasHoldEm.ID));
        // tableController.setGame((new GameFactory()).create(PokerGameOmaha.ID));

        return table;

    }  // createCornDogNL


    createKershner(): Table {

        let tableID = ++this.nextTableID;

        let rules = new TableRules(6, /* timeToAnte */ 5, /* timeToAct */ 10);

        let ante = 0;

        // Both of the regular blinds are live bets (they could towards the current round of betting)
        let blinds: Blind[] =
            [
                new Blind(0, Blind.TYPE_SMALL, 'the small blind', 50, true, true),
                new Blind(1, Blind.TYPE_BIG, 'the big blind', 100, true, true)
            ];

        let bets: number[] = [100, 100, 200, 200];
        let maxRaises: number = 4;

        let limits = new Limits(Limits.LIMIT, maxRaises, /* minBuyIn */ 500, /* maxBuyIn */ 10000);
        let stakes = new Stakes(ante, blinds, bets);

        let table: Table = new Table(tableID, 'Kershner', '1/2 Limit Hold\'em', limits, stakes, rules, MoneyFormatter.ID);
        let deck: Deck = new Deck();
        let buttonController: IButtonController = new DeadButtonController(new RandomBlindAssigner());

        let tableController: TableController = new TableController(this.cashierManager, this, table, deck, buttonController);

        this.addTableController(tableController);
        
        // tableController.setGame((new GameFactory()).create(PokerGameFiveCardStud.ID));
        // tableController.setGame((new GameFactory()).create(PokerGameSevenCardStud.ID));
        tableController.setGame((new GameFactory()).create(PokerGameTexasHoldEm.ID));
        // tableController.setGame((new GameFactory()).create(PokerGameOmaha.ID));

        return table;

    }  // createKershner


    createCDOmaha(): Table {

        let tableID = ++this.nextTableID;

        let rules = new TableRules(/* numSeats */ 6, /* timeToAnte */ 5, /* timeToAct */ 10);

        let ante = 0;

        // Both of the regular blinds are live bets (they could towards the current round of betting)
        let blinds: Blind[] =
            [
                new Blind(0, Blind.TYPE_SMALL, 'the small blind', 25, true, true),
                new Blind(1, Blind.TYPE_BIG, 'the big blind', 50, true, true)
            ];

        let bets: number[] = [50, 50, 50, 50];
        let maxRaises: number = null;

        let limits = new Limits(Limits.NO_LIMIT, maxRaises, /* minBuyIn */ 500, /* maxBuyIn */ 10000);
        let stakes = new Stakes(ante, blinds, bets);

        let table: Table = new Table(tableID, 'Corn Dog Omaha', '0.25/0.50 No-Limit Omaha', limits, stakes, rules, MoneyFormatter.ID);
        let deck: Deck = new Deck();
        let buttonController: IButtonController = new DeadButtonController(new RandomBlindAssigner());

        let tableController: TableController = new TableController(this.cashierManager, this, table, deck, buttonController);

        this.addTableController(tableController);

        // tableController.setGame((new GameFactory()).create(PokerGameFiveCardStud.ID));
        // tableController.setGame((new GameFactory()).create(PokerGameSevenCardStud.ID));
        tableController.setGame((new GameFactory()).create(PokerGameOmaha.ID));

        return table;

    }  // createCDOmaha


    createCornDogTournament(): void {

        // Unlimited raises for NL tourney
        const maxRaises: number = null;

        const limits = new Limits(Limits.NO_LIMIT, maxRaises, /* minBuyIn */ 500, /* maxBuyIn */ 10000);


        let ante = 0;

        const levels: Stakes[] = [];

        for (let l = 0; l < 10; l++) {

            const smallBlind: Blind = new Blind(0, Blind.TYPE_SMALL, 'the small blind', 25 * (l+1), true, true);
            const bigBlind: Blind = new Blind(1, Blind.TYPE_BIG, 'the big blind', 50 * (l+1), true, true);

            const bets: number[] = Array(4).fill(bigBlind.amount);

            const level: Stakes = new Stakes(ante, [smallBlind, bigBlind], bets);

            levels.push(level);

        }

        // Duration is in seconds
        const levelDuration = 30;

        const buyIn: number = 2000;
        const startingStack: number = 1000;

        let rules = new TableRules(6, /* timeToAnte */ 5, /* timeToAct */ 10);

        let game: Game = (new GameFactory()).create(PokerGameTexasHoldEm.ID);

        let buttonController: IButtonController = new DeadButtonController(new RandomBlindAssigner());

        const deck = new Deck();

        const tournament = this.createTournament('Corn Dog Invitational', buyIn, startingStack, limits, levels, levelDuration, rules, game, deck); 

        const tournamentController = new TournamentController(this.cashierManager,
            this,
            tournament,
            buttonController,
            new TourneyFormatter());

        tournamentController.register(5);
        tournamentController.register(6);
        tournamentController.register(7);
        tournamentController.register(8);

        this.tournamentControllerMap.set(tournament.id, tournamentController);


    }  // createCornDogTournament


    public createTable(name: string, description: string, limits: Limits, stakes: Stakes, rules: TableRules, chipFormatterType: string): Table {

        return new Table(++this.nextTableID, name, description, limits, stakes, rules, chipFormatterType);

    }  // createTable


    public createTournament(name: string, buyIn: number, startingStack: number,
        limits: Limits, levels: Stakes[], levelDuration: number,
        rules: TableRules,
        game: Game, deck: Deck): Tournament {

        return new Tournament(++this.nextTableID, name, buyIn, startingStack, limits, levels, levelDuration, rules, game, deck);

    }  // createTournament



    public addTableController(tableController: TableController): void {

        this.tableControllerMap.set(tableController.getTableID(), tableController);

    }  // addTableController

    public getTableController(tableID: number): TableController {

        if (typeof tableID == "string") {
            console.log('*** Converting tableID to number');
            tableID = parseInt(tableID, 10);
        }

        // will be `undefined` if the ID is unknown
        return this.tableControllerMap.get(tableID);

    }


    private addTableClient(tableID: number, client: IServerClient): Message {

        const existingTableController: TableController = this.tableControllerByClientMap.get(client.id);
        if (existingTableController) {

            if (existingTableController.getTableID() === tableID)
            {
                // already connected - nothing to do
                return null;
            }

            this.log(`Existing TableController for this client for a different table - disconnecting it`);
            existingTableController.removeClient(client);

        }

        const tableController: TableController = this.getTableController(tableID);

        this.log(`In addTableClient, found tableController for ${tableID} ? ${(tableController != null)}`);

        if (tableController != null) {

            tableController.addClient(client);
            this.tableControllerByClientMap.set(client.id, tableController);

        }

    }  // addTableClient


    subscribe(client: IServerClient): Message {

        if (client.isAlive) {

            this.registerMessageHandler(client);

            // only send the summaries to this new client, not EVERYBODY!!!
            client.handleMessage(new ActionMessage(new ListTablesAction(this.getTablesStatus())));
            client.handleMessage(new ActionMessage(new ListTournamentsAction(this.getTournamentsStatus())));

        }

        return null;

    }  // subscribe


    registerTournament(command: RegisterTournamentCommand, client: IServerClient): Message {

        if (client.isAlive) {

            const tournamentController: TournamentController = this.tournamentControllerMap.get(command.tournamentID);

            if (tournamentController == null) {

                return new ErrorMessage(`Unknown tournament ID ${command.tournamentID}`, command.userID);

            }

            const registrationCheckResult: CommandResult = tournamentController.isEligibleForRegistration(command.userID);

            if (!registrationCheckResult.isSuccess) {

                return new ErrorMessage(registrationCheckResult.message, command.userID);

            }

            const withdrawalResult: CommandResult = this.cashierManager.withdrawMoney(command.userID, tournamentController.getBuyIn());

            if (!withdrawalResult.isSuccess) {
                return new ErrorMessage(`Registration failed: ${withdrawalResult.message}`, command.userID);
            }

            const registrationResult: CommandResult = tournamentController.register(command.userID);

            return new Message(registrationResult.message, command.userID);

        }


    }  // subscribe



    private getTablesStatus(): TableSummary[] {

        return [...this.tableControllerMap.values()].map(controller => controller.getSummary());

    }  // getTablesStatus


    private pushTableStatus(): void {

        this.broadcastMessage(new ActionMessage(new ListTablesAction(this.getTablesStatus())));

    }  // pushTableStatus


    public notifyTableUpdated(table: Table): void {

        this.pushTableStatus();

    }  // notifyTableUpdated


    private getTournamentsStatus(): TournamentSummary[] {

        return [...this.tournamentControllerMap.values()].map(controller => controller.getSummary());

    }  // getTournamentsStatus


    private pushTournamentStatus(): void {

        this.broadcastMessage(new ActionMessage(new ListTournamentsAction(this.getTournamentsStatus())));

    }  // pushTableStatus


    public notifyTournamentUpdated(tournament: Tournament): void {

        this.pushTournamentStatus();

    }



}