import { Logger } from "../../logging/logger";
import { LobbyManager } from '../lobby/lobby-manager';
import { IChipFormatter } from '../tables/chips/chip-formatter';
import { TableController } from '../tables/table-controller';
import { CashierManager } from '../cashier/cashier-manager';
import { Stakes } from '../tables/betting/stakes';
import { Limits } from '../tables/betting/limits';
import { Player } from '@/app/players/player';
import { TableRules } from '../tables/table-rules';
import { Deck } from '@/app/cards/deck';
import { IButtonController } from '../tables/buttons/i-button-controller';
import { Table } from '../tables/table';
import { Game } from '@/app/games/game';
import { Tournament } from './tournament';
import { TournamentSummary } from './tournament-summary';
import { TourneyFormatter } from '../tables/chips/tourney-formatter';
import { CommandResult } from '../../commands/command-result';


const logger: Logger = new Logger();



export class TournamentController {

    private cashierManager: CashierManager;
    private lobbyManager: LobbyManager;

    private tournament: Tournament;

    private tableControllerMap: Map<number, TableController>;

    private buttonController: IButtonController;

    private chipFormatter: IChipFormatter;

    private registrants: number[];




    constructor(cashierManager: CashierManager,
                lobbyManager: LobbyManager,

                tournament: Tournament,

                buttonController: IButtonController,

        chipFormatter: IChipFormatter) {

        this.cashierManager = cashierManager;
        this.lobbyManager = lobbyManager;

        this.tournament = tournament;

        this.buttonController = buttonController;

        this.chipFormatter = chipFormatter;

        this.tableControllerMap = new Map<number, TableController>();

        this.registrants = [];

    }


    private start(): void {

        const table: Table = this.lobbyManager.createTable(this.tournament.name, this.tournament.name, this.tournament.limits, /* stakes */ null, this.tournament.rules, TourneyFormatter.ID);

        const tableController: TableController = new TableController(this.cashierManager, this.lobbyManager, table, this.tournament.deck, this.buttonController);
        tableController.setGame(this.tournament.game);

        this.tableControllerMap.set(table.id, tableController);

        this.lobbyManager.addTableController(tableController);

        // This will set up the first level
        this.checkLevel();

    }

    private checkStart(): void {

        if (this.tournament.hasStarted()) {
            return;
        }

        if (this.registrants.length == 5) {

            this.start();

        }

    }  // checkStart


    public checkLevel(): void {

        if (this.tournament.levels.length === 0) {

            throw new Error('There are no levels configured for this tournament');

        }

        const levelUp: boolean = this.tournament.currentLevelPtr == null || this.tournament.levelCounter > this.tournament.levelDuration;

        if (levelUp) {

            let nextLevelPtr = this.tournament.currentLevelPtr == null ? 0 : (this.tournament.currentLevelPtr + 1);

            if (nextLevelPtr >= this.tournament.levels.length) {

                // We have no more levels configured - just stay on this level forever

            }
            else {

                // Since we have changed levels, reset the counter
                this.tournament.levelCounter = 0;

                // Move up a level
                this.tournament.currentLevelPtr = nextLevelPtr;

            }

        }

    }   // checkLevel


    public getSummary(): TournamentSummary {

        return new TournamentSummary(this.tournament, this.registrants, this.isRegistrationOpen());

    }  // getSummary


    public isRegistrationOpen(): boolean {

        return !this.tournament.hasStarted();

    }  // isRegistrationOpen


    public isEligibleForRegistration(userID: number): CommandResult {

        if (!this.isRegistrationOpen()) {

            return new CommandResult(false, 'Registration is not open');

        }

        if (this.registrants.find(registrantID => registrantID === userID)) {

            return new CommandResult(false, 'You are already registered');

        }

        return new CommandResult(true, 'You are able to register');

    }

    public getBuyIn(): number {

        return this.tournament.buyIn;

    }


    public register(userID: number): CommandResult {

        this.registrants.push(userID);

        this.lobbyManager.notifyTournamentUpdated(this.tournament);

        this.checkStart();

        return new CommandResult(true, 'Registration successful');



    }




}