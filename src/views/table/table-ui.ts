import { MessageHandler } from "../../app/messages/message-handler";
import { CommandBroadcaster } from "../../app/commands/command-broadcaster";
import { UserSummary } from "../../app/players/user-summary";
import { CommandHandler } from "../../app/commands/command-handler";
import { Message } from "../../app/messages/message";
import { ActionMessage } from "../../app/messages/action-message";
import { Command } from "../../app/commands/command";
import { Table } from "../../app/casino/tables/table";
import { TableSnapshotAction } from "../../app/actions/table/state/table-snapshot-action";
import { Action } from "../../app/actions/action";
import { PlayerSeatedAction } from "../../app/actions/table/players/player-seated-action";
import { SeatVacatedAction } from "../../app/actions/table/players/seat-vacated-action";
import { Logger } from "../../app/logging/logger";
import { TableConnectedAction } from "../../app/actions/table/state/table-connected-action";
import { AuthenticateCommand } from "../../app/commands/security/authenticate-command";
import { TableSnapshotCommand } from "../../app/commands/table/table-snapshot-command";
import { AddChipsAction, Player, StackUpdateAction, TableStateAction, StartHandState, BetAction, GatherBetsAction, GatherAntesAction, UpdateBetsAction, MoveButtonAction, Seat, DealCardAction, BetTurnAction, AnteTurnAction, BetCommand, FoldCommand, Bet, FoldAction, FlipCardsAction, WinPotAction, BetReturnedAction, DeclareHandAction, BettingCompleteAction, Card, AnteCommand, IsInHandAction, DealBoardAction, JoinTableCommand, LoginCommand, BetState, BlindsAndAntesState, GatherBetsCompleteAction, GatherAntesCompleteAction, SetStatusCommand, PotCardsUsedAction, ShowdownAction, FacedownCard, ChatAction, SetStatusAction, AuthenticatedAction, CheckBalanceCommand, TableAction, RaiseCommand, CallCommand } from "../../app/communication/serializable";
import { Game } from "../../app/games/game";
import { SetGameAction } from "../../app/actions/table/game/set-game-action";
import { GameFactory } from "../../app/games/game-factory";
import { WonPot } from "../../app/casino/tables/betting/won-pot";
import { HandCompleteAction } from "../../app/actions/table/game/hand-complete-action";
import { IChipFormatter } from "../../app/casino/tables/chips/chip-formatter";
import { Timer } from "../../app/timers/timer";
import { BetController } from "../../app/casino/tables/betting/bet-controller";
import { ChipStacker } from "../../app/casino/tables/chips/chip-stacker";
import { CurrentBalanceAction } from "../../app/actions/cashier/current-balance-action";
import { UIPosition } from "../../app/ui/ui-position";

import { userState } from "@/store/user-state";
import { tableState } from "@/store/table-state";


const logger: Logger = new Logger();

export class TableUI implements MessageHandler, CommandBroadcaster {

    private readonly TIME_PENDING_ACTION: number = 300;

    private commandHandlers: CommandHandler[];

    public chipFormatter: IChipFormatter;

    private tableID: number;

    public betController: BetController;
    public chipStacker: ChipStacker;


    public mySeatIndex: number | null;

    public myCall: Bet | null;
    public myMinRaise: Bet | null;
    public myMaxRaise: Bet | null;

    public currentBalance: number;

    public seatAction: Map<number, string>;
    public seatTimer: Map<number, Timer>;

    public wonPots: WonPot[];

    public isGatheringAntes: boolean;
    public isGatheringBets: boolean;

    public messages: string[];

    public isSittingOut: boolean | null;

    public isShowdownRequired: boolean;

    // indicates which cards were used in calculating the winning hand for a given pot
    private usedCards: Array<Card>;

    // fields specific to acting in advance
    public pendingBetCommand!: BetCommand | FoldCommand | null;
    private pendingBetNumRaises!: number | null;

    // Key = seatIndex
    // Value = array of cards that have been mucked
    public muckedCards: Map<number, Array<Card | FacedownCard>>;

    public dealerPositions: Map<number, UIPosition>;
    public playerPositions: Map<number, UIPosition>;

    public winningHand: string | null;





    constructor(tableID: number, chipFormatter: IChipFormatter) {

        this.tableID = tableID;
        this.chipFormatter = chipFormatter;

        this.commandHandlers = new Array<CommandHandler>();
            
        this.seatAction = new Map<number, string>();
        this.seatTimer = new Map<number, Timer>();

        this.wonPots = [];

        this.isGatheringAntes = this.isGatheringBets = false;

        // We need to set these values (even to null) so that they are reactive.
        // If we leave them `undefined` then Vue does not define a setter for it
        this.mySeatIndex = null;

        this.clearLocalBets();

        this.betController = new BetController();
        this.chipStacker = new ChipStacker();

        this.isSittingOut = null;

        this.isShowdownRequired = false;
        this.usedCards = new Array<Card>();

        this.currentBalance = null;

        this.muckedCards = new Map<number, Array<Card | FacedownCard>>();

        this.setUpPositions();

        this.winningHand = null;

        this.myCall = null;
        this.myMinRaise = null;
        this.myMaxRaise = null;

    }

    private setUpPositions() {

        this.dealerPositions = new Map<number, UIPosition>();
        this.dealerPositions.set(0, new UIPosition(-60, 390));
        this.dealerPositions.set(1, new UIPosition(250, 590));
        this.dealerPositions.set(2, new UIPosition(560, 390));
        this.dealerPositions.set(3, new UIPosition(560, -270));
        this.dealerPositions.set(4, new UIPosition(250, -410));
        this.dealerPositions.set(5, new UIPosition(-50, -250));

        this.playerPositions = new Map<number, UIPosition>();
        this.playerPositions.set(0, new UIPosition(180, -125));
        this.playerPositions.set(1, new UIPosition(25, -185));
        this.playerPositions.set(2, new UIPosition(-125, -105));
        this.playerPositions.set(3, new UIPosition(-125, 195));
        this.playerPositions.set(4, new UIPosition(25, 200));
        this.playerPositions.set(5, new UIPosition(163, 185));

    }


    handleMessage(message: Message): void {

        if (message.text) {

            this.log(message.text);

        }

        if (!(message instanceof ActionMessage)) {

            // Not an ActionMessage, so nothing further to do
            return;

        }

        let action: Action = message.action;

        if (action instanceof AuthenticatedAction) {

            return this.authenticatedAction(action);

        }

        if (action instanceof TableConnectedAction) {

            // we are connected, so request a snapshot of the table for this user
            this.broadcastCommand(new TableSnapshotCommand(action.tableID))
            return;

        }

        if (action instanceof TableSnapshotAction) {

            return this.tableSnapshotAction(action);

        }

        if (action instanceof CurrentBalanceAction) {

            return this.currentBalanceAction(action);

        }


        if (action instanceof TableAction && this.getTable() == null) {

            // we don't have a table yet, so we can't do anything else
            return;

        }

        if (action instanceof SetGameAction) {

            return this.setGameAction(action);

        }

        if (action instanceof PlayerSeatedAction) {

            return this.playerSeatedAction(action);

        }

        if (action instanceof SeatVacatedAction) {

            return this.seatVacatedAction(action);

        }

        if (action instanceof SetStatusAction) {

            return this.setStatusAction(action);

        }

        if (action instanceof AddChipsAction) {

            return this.addChipsAction(action);
        }

        if (action instanceof StackUpdateAction) {

            return this.stackUpdateAction(action);
        }

        if (action instanceof TableStateAction) {

            return this.tableStateAction(action);

        }

        if (action instanceof UpdateBetsAction) {

            return this.updateBetsAction(action);

        }

        if (action instanceof GatherBetsAction) {

            return this.gatherBetsAction(action);

        }

        if (action instanceof GatherBetsCompleteAction) {

            return this.gatherBetsCompleteAction(action);

        }

        if (action instanceof GatherAntesAction) {

            return this.gatherAntesAction(action);

        }

        if (action instanceof GatherAntesCompleteAction) {

            return this.gatherAntesCompleteAction(action);

        }

        if (action instanceof MoveButtonAction) {

            return this.moveButtonAction(action);
        }

        if (action instanceof DealCardAction) {

            return this.dealCardAction(action);
        }

        if (action instanceof DealBoardAction) {

            return this.dealBoardAction(action);
        }

        if (action instanceof HandCompleteAction) {

            return this.handCompleteAction(action);

        }

        if (action instanceof BetTurnAction) {

            return this.betTurnAction(action);
        }

        if (action instanceof AnteTurnAction) {

            return this.anteTurnAction(action);

        }

        if (action instanceof IsInHandAction) {

            return this.isInHandAction(action);

        }


        if (action instanceof BetAction) {

            return this.betAction(action);

        }

        if (action instanceof FoldAction) {

            return this.foldAction(action);

        }

        if (action instanceof FlipCardsAction) {

            return this.flipCardsAction(action);

        }

        if (action instanceof DeclareHandAction) {

            return this.declareHandAction(action);

        }

        if (action instanceof WinPotAction) {

            return this.winPotActionAction(action);

        }

        if (action instanceof BetReturnedAction) {

            return this.betReturnedAction(action);
        }

        if (action instanceof BettingCompleteAction) {

            return this.bettingCompleteAction(action);

        }

        if (action instanceof ShowdownAction) {

            return this.showdownAction(action);

        }

        if (action instanceof PotCardsUsedAction) {

            return this.potCardsUsedAction(action);

        }

        if (action instanceof ChatAction) {

            return this.chatAction(action);

        }


        this.log(`Heard ${action.constructor.name}`);

    }

    registerCommandHandler(handler: CommandHandler) {

        this.commandHandlers.push(handler);

    }

    unregisterCommandHandler(handler: CommandHandler) {

        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);

    }


    // Used by components to send commands on the UI's behalf
    // TODO: refactor this so that they send the command to the 
    public sendCommand(command: Command): void {

        return this.broadcastCommand(command);

    }


    private broadcastCommand(command: Command): void {

        this.log(`Sent ${command.constructor.name}`);

        for (let handler of this.commandHandlers) {

            handler.handleCommand(command);

        }

    }


    private getUser(): UserSummary {

        return userState.getUser.value;

    }

    private getTable(): Table {

        return tableState.getTable.value;

    }

    private getGame() {

        return tableState.getGame.value;

    }



    public getMySeat(): Seat {

        if (this.mySeatIndex != null && this.getTable()?.seats) {
            return this.getTable().seats[this.mySeatIndex];
        }

        return null;
    }


    public checkBalance(): void {

        this.currentBalance = null;
        this.sendCommand(new CheckBalanceCommand());

    }   // checkBalance


    private currentBalanceAction(action: CurrentBalanceAction): void {

        this.currentBalance = action.balance;

    }  // currentBalanceAction


    private tableSnapshotAction(action: TableSnapshotAction): void {

        this.log(`Heard TableSnapshotAction for ${action.table.id}`);
        tableState.setTable(action.table);

        // See if I'm alreading sitting at the table
        let mySeat: Seat = action.table.seats.find(seat => seat.player && seat.player.userID === this.getUser().id);

        this.mySeatIndex = mySeat ? mySeat.index : null;

        /*
        // Set up the Maps with default values so that they can be reactive
        for (let seatIndex: number = 0; seatIndex < action.table.seats.length; seatIndex++) {

            this.seatAction.set(seatIndex, null);
            this.seatTimer.set(seatIndex, null);

        }
        */

    }  // tableSnapshotAction


    private setGameAction(action: SetGameAction): void {

        let game = this.getGame();

        if (!game || game.id != action.gameID) {

            // Looks up the rules for the game based on ID, rather than passing a game object through the pipes
            tableState.setGame((new GameFactory()).create(action.gameID));

            game = this.getGame();
            this.log(`The game is ${game.getName()}`);

        }


    }   // setGamebe


    public authenticate(): void {

        this.broadcastCommand(new AuthenticateCommand());

    }   // authenticate


    public authenticatedAction(action: AuthenticatedAction): void {

        this.log(`Heard AuthenticatedAction for ${action.user.username}, sending JoinTableCommand for ${this.tableID}`);
        userState.setUser(action.user);

        this.broadcastCommand(new JoinTableCommand(this.tableID));

    }   // authenticated



    public isInHand(): boolean {

        return this.getMySeat()?.isInHand;

    }


    public remainsToAnte(): boolean {

        return this.mySeatIndex != null && this.getTable().state instanceof BlindsAndAntesState && this.myCall != null;
        // && (this.table.seats[this.mySeatIndex].player.isSittingOut === null);

    }

    public remainsToAct(): boolean {

        return this.mySeatIndex != null && this.getTable().state instanceof BetState && (this.getTable().betStatus.seatIndex === this.mySeatIndex || this.getTable().betStatus.doesSeatRemainToAct(this.mySeatIndex));

    }
    

    private playerSeatedAction(action: PlayerSeatedAction): void {

        const table: Table = this.getTable();

        const result = tableState.setPlayer(action.seatIndex, action.player);

        if (result) {

            let message = `${action.player.name} sits at Table ${action.tableID}, seat ${(action.seatIndex + 1)}`;
            tableState.addMessage(message);
            this.log(message);
            this.log(`Players: [ ${table.seats.filter(s => s.player).map(s => s.player.name).join(" ")} ]`);

            if (action.player.userID === this.getUser().id) {
                this.mySeatIndex = action.seatIndex;
            }

        }

    }  // seatPlayer


    private seatVacatedAction(action: SeatVacatedAction): void {

        let seat = action.seatIndex < this.getTable().seats.length ? this.getTable().seats[action.seatIndex] : null;

        if (seat) {

            if (seat.index === this.mySeatIndex) {
                this.mySeatIndex = null;
            }

            let message = `${seat.getSeatName()} is now open`;
            tableState.addMessage(message);

            this.log(message);
            this.log(`Players: [ ${this.getTable().seats.filter(s => s.player).map(s => s.player.name).join(" ")} ]`);

        }

    }  // seatVacated



    private setStatusAction(action: SetStatusAction): void {

        if (this.getUser()?.id === action.userID) {

            this.isSittingOut = action.isSittingOut;

        }

    }  // setStatus



    private findSeat(seatIndex: number): Seat {

        if (seatIndex >= 0 && seatIndex < this.getTable().seats.length) {
            return this.getTable().seats[seatIndex];
        }

        throw new Error(`Seat index out of range: ${seatIndex}`);

    }  // findSeat
     
    private findPlayer(userID: number): Player {

        let seat = this.getTable().seats.find(s => s.player && s.player.userID == userID);
        return seat ? seat.player : null;

    }   // findPlayer


    private addChipsAction(action: AddChipsAction): void {

        let player: Player = this.findPlayer(action.userID);

        if (player) {

            this.log(`${player.name} adds ${this.chipFormatter.format(action.amount)} in chips`);

        }

    }   // addChips



    private stackUpdateAction(action: StackUpdateAction): void {

        let player = this.findPlayer(action.playerID);

        if (player) {

            player.chips = action.chips;
            this.log(`${player.name} now has ${this.chipFormatter.format(action.chips)}`);
    
        }

    }  // updateStack


    private log(message: string): void {

        console.log(message);

    }


    private clearLocalBets(): void {

        // null is different from 0 in that it indicates that the given option is not even available
        this.myCall = this.myMinRaise = this.myMaxRaise = null;

        this.clearBetCommand();

    }


    private tableStateAction(action: TableStateAction): void {

        if (this.getTable()) {

            let state = this.getTable().state;

            this.clearLocalBets();

            if (state instanceof StartHandState) {

                return this.startHand();

            }

            if (state instanceof BetState) {

                return this.betState();

            }

            if (state instanceof BlindsAndAntesState) {

                return this.anteState();

            }

        }


    }  // changeTableState



    private startHand(): void {

        for (let seat of this.getTable().seats) {

            if (seat.player) {

                this.log(`${seat.getSeatName()}: ${seat.player.name}: ${this.chipFormatter.format(seat.player.chips)}${seat.player.isSittingOut ? ' [sitting out]' : ''}`);

            }

        }

    }   // startHand


    private betState(): void {

        let seat: Seat = this.getMySeat();

        if (seat) {

            // reset the player's default bet - this is the minimum value at which they could bet/raise the action (it does not relate to calls)
            this.myCall = this.betController.calculateCall(this.getTable(), seat);
            this.myMinRaise = this.betController.calculateMinimumRaise(this.getTable(), seat, this.myCall);
            this.myMaxRaise = this.betController.calculateMaximumRaise(this.getTable(), seat, this.myCall);

        }
        else {

            this.myCall = this.myMinRaise = this.myMaxRaise = null;

        }

    }  // betState


    private anteState(): void {

        let seat: Seat = this.getMySeat();

        if (seat && seat.isInHand) {

            // reset the player's default bet - this is the minimum value at which they could bet/raise the action (it does not relate to calls)
            this.myCall = this.betController.calculateCall(this.getTable(), seat);

            // no betting, only calling, with antes
            this.myMinRaise = this.myMaxRaise = null;

            // If I am marked as "not sitting out" then ready my blinds & ante bet
            if (seat.player.isSittingOut === false) {

                this.setBetCommand(new AnteCommand(this.getTable()!.id));

            }  

        }
        else {

            this.myCall = this.myMinRaise = this.myMaxRaise = null;

        }

    }  // anteState



    private updateBetsAction(action: UpdateBetsAction): void {

        let table: Table = this.getTable();

        this.log(`Seats To Act: [ ${action.betStatus.seatIndexesRemainToAct.join(" ")} ]`);
        this.log(`Table Seats To Act: [ ${table.betStatus.seatIndexesRemainToAct.join(" ")} ]`);

        if (this.pendingBetCommand) {

            if (this.pendingBetNumRaises == null || action.betStatus.numRaises > this.pendingBetNumRaises) {

                // TODO: Maybe leave in place if it is Call Any, or a raise more than what the action took it to
                this.clearBetCommand();

            }

        }

        for (let pot of table.betStatus.pots) {
        
            let potDesc = `${pot.getName()}: ${this.chipFormatter.format(pot.amount)} - ${pot.getNumPlayers()} player${pot.getNumPlayers() === 1 ? '' : 's'}: `;
            potDesc += pot.getSeatsInPot().map(seatIndex => table.seats[seatIndex].getName()).join(", ");
            this.log(potDesc);
        
        }

        let betsString = Object.keys(table.betStatus.bets)
            .map(seatIndexString => {
                const seatIndex = parseInt(seatIndexString, 10);
                return `${table.seats[seatIndex].getName()}: ${this.chipFormatter.format(table.betStatus.bets[seatIndex].totalBet)}`
            }).join(", ");
        if (betsString.length) {
            this.log(`  Bets: ${betsString}`);
        }
        
    }  // updateBets



    private moveButtonAction(action: MoveButtonAction): void {

        let seat = this.findSeat(this.getTable().buttonIndex);

        let message: string = `${seat.getName()} now has the button`;
        tableState.addMessage(message);
        this.log(message);

    }   // moveButton


    private dealCardAction(action: DealCardAction): void {

        let seat = this.findSeat(action.seatIndex);

        let message: string = null;

        if (action.card instanceof Card) {

            message = `${seat.getName()} is dealt ${this.describeCard(action.card)}`;

        }
        else {

            message = `${seat.getName()} is dealt a card, face-down`;

        }

        tableState.addMessage(message);
        this.log(message);

    }   // dealCard


    private describeCard(card: Card) {

        return `${card.value.symbol}${card.suit.symbol}`;
    }

    private dealBoardAction(action: DealBoardAction): void {


        let message: string = `The board is dealt ${ action.cards.map(card => this.describeCard(card)).join(" ") }`;

        tableState.addMessage(message);
        this.log(message);

    }   // dealBoard


    private handCompleteAction(action: HandCompleteAction): void {

        // If we have pots, then we can't have any WonPots - clear 'em
        this.wonPots.length = 0;

        // showdown is no longer required - clear the flags that were highlighting cards
        this.isShowdownRequired = false;
        this.usedCards.length = 0;

        this.muckedCards.clear();

        this.winningHand = null;

    }  // handComplete


    private isInHandAction(action: IsInHandAction): void {

        let seat = this.findSeat(action.seatIndex);

        if (seat) {

            // this.log(`${seat.getName()} isInHandssssss: ${action.isInHand}`);

        }

    }  // isInHandAction


    private betTurnAction(action: BetTurnAction): void {

        // Remove any previous action for the current "to-act" player
        // Map.delete is safe to use, even if the key does not already exist
        this.seatAction.delete(action.betStatus.seatIndex);

        let seat = this.findSeat(action.betStatus.seatIndex);
        this.log(`It is ${seat.getName()}'s turn to act`);

        this.clearSeatTimers();

        let mySeat: Seat = this.getMySeat();

        let table: Table = this.getTable();

        this.myCall = this.betController.calculateCall(table, mySeat);

        // Calculate the min and max raises allowed here
        this.myMinRaise = this.betController.calculateMinimumRaise(table, mySeat, this.myCall);
        this.myMaxRaise = this.betController.calculateMaximumRaise(table, mySeat, this.myCall);

        if (this.pendingBetCommand instanceof CallCommand) {

            if (this.myCall == null) {

                this.clearBetCommand();

            }

        }

        // if they have already specified a bet then make sure it is still within this range
        else if (this.pendingBetCommand instanceof RaiseCommand) {

            if (this.myMinRaise == null) {

                // they are not eligible to bet/raise, so clear their action
                this.clearBetCommand();

            }

            // they are set to bet less than the allowed amount, so clear their action
            else if (this.pendingBetCommand.amount < this.myMinRaise.chipsAdded) {

                this.clearBetCommand();

            }

            // they are set to bet more than the allowed amount, so clear their action
            else if (this.myMaxRaise && this.pendingBetCommand.amount > this.myMaxRaise.chipsAdded) {

                this.clearBetCommand();

            }

        }

        if (action.timesUp > Date.now()) {

            if (action.betStatus.seatIndex == this.mySeatIndex) {

                // if we had a betting action readied, then send it now
                if (this.checkPendingBetCommand()) {

                    return;

                }

            }

            let timer: Timer = new Timer(action.timesUp);
            timer.start();
            this.seatTimer.set(seat.index, timer);

        }


    }  // betTurnAction


    private anteTurnAction(action: AnteTurnAction): void {

        const table: Table = this.getTable();

        let anteSeatIndex: number = table.betStatus.forcedBets.seatIndex;

        // Remove any previous action for the current "to-act" player
        // Map.delete is safe to use, even if the key does not already exist
        this.seatAction.delete(anteSeatIndex);

        let anteSeat: Seat = this.findSeat(anteSeatIndex);
        this.log(`It is ${anteSeat.getName()}'s turn to ante`);

        this.clearSeatTimers();

        this.myCall = this.myMinRaise = this.myMaxRaise = null;

        if (anteSeat) {

            if (action.timesUp > Date.now()) {

                if (anteSeatIndex == this.mySeatIndex) {

                    this.myCall = this.betController.calculateCall(table, anteSeat);

                    // if we had a betting action readied, then send it now
                    if (this.checkPendingBetCommand()) {

                        return;

                    }

                }

                let timer: Timer = new Timer(action.timesUp);
                timer.start();
                this.seatTimer.set(anteSeat.index, timer);
                this.log(`Setting ante turn timer for seat ${anteSeat.index} to ${action.timesUp}`);

            }

        }
        else {

            this.log(`In anteTurnAction, could not find seat for index ${anteSeatIndex}`);

        }

    }  // anteTurnAction



    private betAction(action: BetAction): void {

        let seat = this.findSeat(action.seatIndex);

        this.killSeatTimer(action.seatIndex);

        if (action.seatIndex == this.mySeatIndex) {

            // I have made a bet, so clear out my planned betting amounts, or they can be used the next time
            this.clearLocalBets();

        }


        let message = 'Unknown message';

        if (action.bet.betType == Bet.TYPE.ANTE) {

            message = `${seat.getName()} antes ${this.chipFormatter.format(action.bet.totalBet)}`;
            this.seatAction.set(seat.index, 'ANTE');

        }
        else if (action.bet.betType == Bet.TYPE.BLIND) {

            message = `${seat.getName()} blinds ${this.chipFormatter.format(action.bet.totalBet)}`;
            this.seatAction.set(seat.index, 'BLIND');

        }
        else if (action.bet.betType == Bet.TYPE.REGULAR) {

            switch (action.bet.actionType) {

                case Bet.ACTION.CHECK:
                    message = `${seat.getName()} checks`;
                    this.seatAction.set(seat.index, 'CHECK');
                    break;

                case Bet.ACTION.OPEN:
                    message = `${seat.getName()} bets ${this.chipFormatter.format(action.bet.totalBet)}`;
                    this.seatAction.set(seat.index, 'BET');
                    break;

                case Bet.ACTION.CALL:
                    message = `${seat.getName()} calls ${this.chipFormatter.format(action.bet.totalBet)}`;
                    this.seatAction.set(seat.index, 'CALL');
                    break;

                case Bet.ACTION.RAISE:
                    message = `${seat.getName()} raises to ${this.chipFormatter.format(action.bet.totalBet)}`;
                    this.seatAction.set(seat.index, 'RAISE');
                    break;

            }  // switch

        }

        tableState.addMessage(message);
        this.log(message);

    }  // betAction




    private killSeatTimer(seatIndex: number): void {

        this.log(`In killSeatTimer for seatIndex ${seatIndex}`);

        let timer: Timer = this.seatTimer.get(seatIndex);

        if (timer) {
            this.log(`Stopping and deleting timer for seatIndex ${seatIndex}`);
            timer.stop();
            this.seatTimer.delete(seatIndex);
        }

    }   // killSeatTimer


    private clearSeatTimers(): void {

        this.log('In clearSeatTimers');

        // Stop any seat timer that is already running
        for (let [seatIndex, timer] of this.seatTimer) {

            if (timer) {

                timer.stop();

            }

        }

        // Remove all timers from the map
        this.seatTimer.clear();

    }  // clearSeatTimers


    private foldAction(action: FoldAction): void {

        let seat = this.findSeat(action.seatIndex);

        this.killSeatTimer(action.seatIndex);

        if (!this.muckedCards.get(action.seatIndex)) {
            this.muckedCards.set(action.seatIndex, new Array<Card | FacedownCard>());
        }

        this.muckedCards.get(action.seatIndex)!.push(...action.cards);

        let message: string = `${seat.getName()} folds`;

        tableState.addMessage(message);
        this.log(message);

        this.seatAction.set(seat.index, 'FOLD');




    }  // fold


    private flipCardsAction(action: FlipCardsAction): void {

        let seat = this.findSeat(action.seatIndex);

        if (seat.hand && seat.hand.cards && seat.hand.cards.length) {

            let message: string = `${seat.getName()} has ${seat.hand.cards.map(card => card.toString()).join(" ")}`;
            tableState.addMessage(message);
            this.log(message);

        }

    }  // flipCards


    private declareHandAction(action: DeclareHandAction): void {

        let seat = this.findSeat(action.seatIndex);
        const game = this.getGame();

        let message: string = `${seat.getName()} has ${game?.handDescriber.describe(action.handEvaluation)}`;

        tableState.addMessage(message);
        this.log(message);

    }  // declareHand


    private winPotActionAction(action: WinPotAction): void {

        let pot: WonPot = action.pot;

        this.wonPots.push(pot);

        let seat = this.findSeat(pot.seatIndex);

        let potDescription = pot.index > 0 ? `side pot #${pot.index}` : `the main pot`;

        let handDescription = ' before showdown';

        // this.winningHand is responsible for showing the winning hand in a banner
        // If there is no showdown then just leave it as `null`

        const game = this.getGame();

        if (pot.handEvaluation) {

            this.winningHand = game?.handDescriber.describe(pot.handEvaluation);
            handDescription = ` with ${game?.handDescriber.describe(pot.handEvaluation)}`;

        }
        else {
            this.winningHand = null;
        }

        let message: string = seat.player
            ? `${seat.getName()} wins ${this.chipFormatter.format(pot.amount)} from ${potDescription}${handDescription}`
            : `${seat.getSeatName()} wins ${this.chipFormatter.format(pot.amount)} from ${potDescription}${handDescription}`;

        tableState.addMessage(message);
        this.log(message);
        
    }  // winPot


    private betReturnedAction(action: BetReturnedAction): void {

        let seat = this.findSeat(action.seatIndex);
        
        if (seat.player) {

            let message: string = `${this.chipFormatter.format(action.amount)} is returned to ${seat.getName()}`;
            tableState.addMessage(message);
            this.log(message);
        
        }
        else {
            this.log(`Need to return ${this.chipFormatter.format(action.amount)} to ${seat.getName()}, but the player is gone`);
        }
        
    }  // returnBet


    private bettingCompleteAction(action: BettingCompleteAction): void {

        this.clearLocalBets();

    }  // bettingComplete


    private showdownAction(action: ShowdownAction): void {

        this.isShowdownRequired = action.isShowdownRequired;

    }  // showdown


    private potCardsUsedAction(action: PotCardsUsedAction): void {

        this.usedCards.length = 0;

        for (let card of action.cards) {
            this.usedCards.push(card);
        }

    }  // markUsedCards


    public isCardUsed(card: Card | FacedownCard): boolean {

        return this.usedCards && this.usedCards.find(usedCard => usedCard.equals(card)) != null;

    }  // isCardUsed


    private gatherBetsAction(action: GatherBetsAction): void {

        this.isGatheringBets = true;

    }  // gatherBets

    private gatherBetsCompleteAction(action: GatherBetsCompleteAction): void {

        this.isGatheringBets = false;
        this.seatAction.clear();

    }  // gatherBetsComplete


    private gatherAntesAction(action: GatherAntesAction): void {

        this.isGatheringAntes  = true;

    }  // gatherAntes

    private gatherAntesCompleteAction(action: GatherAntesCompleteAction): void {

        this.isGatheringAntes = false;
        this.seatAction.clear();

    }  // gatherBetsComplete



    private chatAction(action: ChatAction): void {

        const message = `${action.username}: ${action.message}`;
        tableState.addMessage(message);

        this.log(`${action.username}: ${action.message}`);

    }  // chat


    public clearBetCommand(): void {

        this.pendingBetCommand = null;
        this.pendingBetNumRaises = null;

    }

    public setBetCommand(betCommand: BetCommand | FoldCommand) {

        this.pendingBetCommand = betCommand;

        // Remember the level of action when this bet was set - if it goes up then we don't want to keep doing this action
        this.pendingBetNumRaises = this.getTable().betStatus.numRaises;

        setTimeout(() => { this.checkPendingBetCommand(); }, 50);

    }


    private checkPendingBetCommand(): boolean {

        const table: Table = this.getTable();

        if (this.pendingBetCommand && this.mySeatIndex != null) {

            if (table?.state instanceof BlindsAndAntesState) {

                if (table?.betStatus?.forcedBets?.seatIndex == this.mySeatIndex) {

                    let command: BetCommand | FoldCommand = this.pendingBetCommand;

                    this.clearBetCommand();

                    if (command instanceof AnteCommand) {

                        this.broadcastCommand(command);
                        return true;

                    }

                }

            }  // Blinds 'n Ante

            // TODO: Validate first against local BetController and only send if valid?
            else if (this.getTable().state instanceof BetState) {

                if (table.betStatus && table.betStatus.seatIndex == this.mySeatIndex) {

                    let command: BetCommand | FoldCommand = this.pendingBetCommand;

                    this.clearBetCommand();

                    this.broadcastCommand(command);
                    return true;

                }

            }  // BetState

        }

        return false;

    }   // checkPendingBetCommand


    public getMuckedCards(seatIndex: number): Array<Card | FacedownCard> {

        if (this.muckedCards && this.muckedCards.get(seatIndex)) {

            return [...this.muckedCards.get(seatIndex)];

        }

        return [];

    }  // getMuckedCards


    public isActionOn(seatIndex: number): boolean {

        const table: Table = this.getTable();

        if (table && table.betStatus) {

            if (table.state instanceof BlindsAndAntesState) {

                return table.betStatus.forcedBets && table.betStatus.forcedBets.seatIndex == seatIndex;

            }

            else if (table.state instanceof BetState) {

                return table.betStatus.seatIndex == seatIndex;

            }

        }

        return false;

    }  // isActionOn


}