import { MessageHandler } from "../../messages/message-handler";
import { CommandBroadcaster } from "../../commands/command-broadcaster";
import { UserSummary } from "../../players/user-summary";
import { CommandHandler } from "../../commands/command-handler";
import { Message } from "../../messages/message";
import { ActionMessage } from "../../messages/action-message";
import { Command } from "../../commands/command";
import { Table } from "../../casino/tables/table";
import { TableSnapshotAction } from "../../actions/table/state/table-snapshot-action";
import { Action } from "../../actions/action";
import { PlayerSeatedAction } from "../../actions/table/players/player-seated-action";
import { SeatVacatedAction } from "../../actions/table/players/seat-vacated-action";
import { Logger } from "../../logging/logger";
import { TableConnectedAction } from "../../actions/table/state/table-connected-action";
import { AuthenticateCommand } from "../../commands/security/authenticate-command";
import { TableSnapshotCommand } from "../../commands/table/table-snapshot-command";
import { AddChipsAction, Player, StackUpdateAction, TableStateAction, StartHandState, BetAction, GatherBetsAction, GatherAntesAction, UpdateBetsAction, MoveButtonAction, Seat, DealCardAction, BetTurnAction, AnteTurnAction, BetCommand, FoldCommand, Bet, FoldAction, FlipCardsAction, WinPotAction, BetReturnedAction, DeclareHandAction, BettingCompleteAction, Card, AnteCommand, IsInHandAction, DealBoardAction, JoinTableCommand, LoginCommand, BetState, BlindsAndAntesState, GatherBetsCompleteAction, GatherAntesCompleteAction, SetStatusCommand, PotCardsUsedAction, ShowdownAction, FacedownCard, ChatAction, SetStatusAction, AuthenticatedAction, CheckBalanceCommand, TableAction } from "../../communication/serializable";
import { Game } from "../../games/game";
import { SetGameAction } from "../../actions/table/game/set-game-action";
import { GameFactory } from "../../games/game-factory";
import { WonPot } from "../../casino/tables/betting/won-pot";
import { HandCompleteAction } from "../../actions/table/game/hand-complete-action";
import { IChipFormatter } from "../../casino/tables/chips/chip-formatter";
import { Timer } from "../../timers/timer";
import { BetController } from "../../casino/tables/betting/bet-controller";
import { PendingCommands } from "./pending-commands";
import { ChipStacker } from "../../casino/tables/chips/chip-stacker";
import { CurrentBalanceAction } from "../../actions/cashier/current-balance-action";
import { UIPosition } from "../ui-position";


const logger: Logger = new Logger();

export class TableUI implements MessageHandler, CommandBroadcaster {

    private readonly TIME_PENDING_ACTION: number = 300;

    public user: UserSummary;

    private commandHandlers: CommandHandler[];

    public chipFormatter: IChipFormatter;

    private tableID: number;
    public table: Table;

    public game: Game;
    public betController: BetController;
    public chipStacker: ChipStacker;


    private mySeatIndex: number;

    public myCall: Bet;
    public myBet: Bet;
    public currentBalance: number;

    public seatAction: Map<number, string>;
    public seatTimer: Map<number, Timer>;

    public wonPots: WonPot[];

    public isGatheringAntes: boolean;
    public isGatheringBets: boolean;

    public messages: string[];

    public isSittingOut: boolean;

    public isShowdownRequired: boolean;

    // indicates which cards were used in calculating the winning hand for a given pot
    private usedCards: Array<Card>;

    // fields specific to acting in advance
    public pendingCommands: PendingCommands;
    private pendingTimer: ReturnType<typeof setTimeout>;

    // Key = seatIndex
    // Value = array of cards that have been mucked
    public muckedCards: Map<number, Array<Card | FacedownCard>>;

    public dealerPositions: Map<number, UIPosition>;





    constructor(tableID: number, chipFormatter: IChipFormatter) {

        this.tableID = tableID;
        this.chipFormatter = chipFormatter;

        this.commandHandlers = new Array<CommandHandler>();
            
        this.table = null;

        this.seatAction = new Map<number, string>();
        this.seatTimer = new Map<number, Timer>();
        this.wonPots = [];

        this.isGatheringAntes = this.isGatheringBets = false;

        this.messages = [];

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


    }

    private setUpPositions() {

        this.dealerPositions = new Map<number, UIPosition>();
        this.dealerPositions.set(0, new UIPosition(-60, 390));
        this.dealerPositions.set(1, new UIPosition(250, 620));
        this.dealerPositions.set(2, new UIPosition(560, 420));
        this.dealerPositions.set(3, new UIPosition(560, -240));
        this.dealerPositions.set(4, new UIPosition(250, -380));
        this.dealerPositions.set(5, new UIPosition(-50, -220));

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

            return this.authenticated(action);

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


        if (action instanceof TableAction && this.table == null) {

            // we don't have a table yet, so we can't do anything else
            return;

        }

        if (action instanceof SetGameAction) {

            return this.setGame(action);

        }

        if (action instanceof PlayerSeatedAction) {

            return this.playerSeated(action);

        }

        if (action instanceof SeatVacatedAction) {

            return this.seatVacated(action);

        }

        if (action instanceof SetStatusAction) {

            return this.setStatus(action);

        }

        if (action instanceof AddChipsAction) {

            return this.addChips(action);
        }

        if (action instanceof StackUpdateAction) {

            return this.stackUpdate(action);
        }

        if (action instanceof TableStateAction) {

            return this.tableState();

        }

        if (action instanceof UpdateBetsAction) {

            return this.updateBets(action);

        }

        if (action instanceof GatherBetsAction) {

            return this.gatherBets(action);

        }

        if (action instanceof GatherBetsCompleteAction) {

            return this.gatherBetsComplete(action);

        }

        if (action instanceof GatherAntesAction) {

            return this.gatherAntes(action);

        }

        if (action instanceof GatherAntesCompleteAction) {

            return this.gatherAntesComplete(action);

        }

        if (action instanceof MoveButtonAction) {

            return this.moveButton(action);
        }

        if (action instanceof DealCardAction) {

            return this.dealCard(action);
        }

        if (action instanceof DealBoardAction) {

            return this.dealBoard(action);
        }

        if (action instanceof HandCompleteAction) {

            return this.handComplete(action);

        }

        if (action instanceof BetTurnAction) {

            return this.betTurn(action);
        }

        if (action instanceof AnteTurnAction) {

            return this.anteTurn(action);

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

            return this.flipCards(action);

        }

        if (action instanceof DeclareHandAction) {

            return this.declareHand(action);

        }

        if (action instanceof WinPotAction) {

            return this.winPot(action);

        }

        if (action instanceof BetReturnedAction) {

            return this.betReturned(action);
        }

        if (action instanceof BettingCompleteAction) {

            return this.bettingComplete(action);

        }

        if (action instanceof ShowdownAction) {

            return this.showdown(action);

        }

        if (action instanceof PotCardsUsedAction) {

            return this.potCardsUsed(action);

        }

        if (action instanceof ChatAction) {

            return this.chat(action);

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

        if (command instanceof BetCommand)
        {
            this.log(`  ${command.toString()}`);
        }


        for (let handler of this.commandHandlers) {

            handler.handleCommand(command);

        }

    }


    public getMySeat(): Seat {

        if (this.mySeatIndex != null && this.table && this.table.seats) {
            return this.table.seats[this.mySeatIndex];
        }

        return null;
    }


    private checkBalance(): void {

        this.currentBalance = null;
        this.sendCommand(new CheckBalanceCommand());

    }   // checkBalance


    private currentBalanceAction(action: CurrentBalanceAction): void {

        this.currentBalance = action.balance;

    }  // currentBalanceAction


    private tableSnapshotAction(action: TableSnapshotAction): void {

        this.table = action.table;

        // See if I'm alreading sitting at the table
        let mySeat: Seat = action.table.seats.find(seat => seat.player && seat.player.userID === this.user.id);

        this.mySeatIndex = mySeat ? mySeat.index : null;

    }  // tableSnapshotAction


    private setGame(action: SetGameAction): void {

        if (!this.game || this.game.id != action.gameID) {

            // Looks up the rules for the game based on ID, rather than passing a game object through the pipes
            this.game = (new GameFactory()).create(action.gameID);
            this.log(`The game is ${this.game.getName()}`);

        }


    }   // setGamebe


    public authenticate(): void {

        this.broadcastCommand(new AuthenticateCommand());

    }   // authenticate


    public authenticated(action: AuthenticatedAction): void {

        this.log(`Heared AuthenticatedAction for ${action.user.username}, sending JoinTableCommand for ${this.tableID}`);
        this.user = action.user;

        this.broadcastCommand(new JoinTableCommand(this.tableID));

    }   // authenticated



    public isInHand(): boolean {

        console.log(`table: ${(this.table != null)}`);
        console.log(`seats: ${(this.table.seats != null)}`);
        console.log(`mySeatIndex: ${this.mySeatIndex}`);
        if (this.mySeatIndex != null) {

            console.log(`mySeat: ${(this.table.seats[this.mySeatIndex] != null)}`);

            if (this.table.seats[this.mySeatIndex]) {

                console.log(`isInHand: ${this.table.seats[this.mySeatIndex].isInHand}`);

            }


        }

        return this.table
            && this.table.seats
            && (this.mySeatIndex != null)
            && this.table.seats[this.mySeatIndex]
            && this.table.seats[this.mySeatIndex].isInHand;

    }


    public isAnteTime(): boolean {

        return this.mySeatIndex != null && this.table.state instanceof BlindsAndAntesState && this.myCall != null && (this.table.seats[this.mySeatIndex].player.isSittingOut === null);

    }   // isAnteTime


    public isCheckBetTime(): boolean {

        return this.mySeatIndex != null && this.table.state instanceof BetState && this.myCall != null && this.myCall.chipsAdded === 0 && this.table.betStatus.seatIndex === this.mySeatIndex;

    }

    public isPendingCheckBetTime(): boolean {

        return this.mySeatIndex != null && this.table.state instanceof BetState && this.myCall != null && this.myCall.chipsAdded === 0 && this.table.betStatus.doesSeatRemainToAct(this.mySeatIndex);

    }


    public isCallRaiseTime(): boolean {

        return this.mySeatIndex != null && this.table.state instanceof BetState && this.myCall != null && this.myCall.chipsAdded > 0 && this.table.betStatus.seatIndex === this.mySeatIndex;

    }

    public isPendingCallRaiseTime(): boolean {

        return this.mySeatIndex != null && this.table.state instanceof BetState && this.myCall != null && this.myCall.chipsAdded > 0 && this.table.betStatus.doesSeatRemainToAct(this.mySeatIndex);

    }



    public calculateCall(): Bet {

        return this.betController.calculateCall(this.table, this.table.seats[this.mySeatIndex]);

    }


    private playerSeated(action: PlayerSeatedAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            let message = `${action.player.name} sits at Table ${action.tableID}, seat ${(action.seatIndex + 1)}`;
            this.messages.push(message);

            this.log(message);
            this.log(`Players: [ ${this.table.seats.filter(s => s.player).map(s => s.player.name).join(" ")} ]`);

            if (seat.player.userID === this.user.id) {
                this.mySeatIndex = action.seatIndex;
            }

        }

    }  // seatPlayer


    private seatVacated(action: SeatVacatedAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            if (seat.index === this.mySeatIndex) {
                this.mySeatIndex = null;
            }

            let message = `${seat.getSeatName()} is now open`;
            this.messages.push(message);

            this.log(message);
            this.log(`Players: [ ${this.table.seats.filter(s => s.player).map(s => s.player.name).join(" ")} ]`);

        }

    }  // seatVacated



    private setStatus(action: SetStatusAction): void {

        if (this.user && this.user.id === action.userID) {

            this.isSittingOut = action.isSittingOut;

        }

    }  // setStatus



    private findSeat(seatIndex: number): Seat {

        if (seatIndex >= 0 && seatIndex < this.table.seats.length) {
            return this.table.seats[seatIndex];
        }

        throw new Error(`Seat index out of range: ${seatIndex}`);

    }  // findSeat
     
    private findPlayer(userID: number): Player {

        let seat = this.table.seats.find(s => s.player && s.player.userID == userID);
        return seat ? seat.player : null;

    }   // findPlayer


    private addChips(action: AddChipsAction): void {

        let player: Player = this.findPlayer(action.userID);

        if (player) {

            this.log(`${player.name} adds ${this.chipFormatter.format(action.amount)} in chips`);

        }

    }   // addChips



    private stackUpdate(action: StackUpdateAction): void {

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
        this.myCall = null;
        this.myBet = null;

        clearTimeout(this.pendingTimer);

        if (!this.pendingCommands) {
            this.pendingCommands = new PendingCommands();
        }
        else {
            this.pendingCommands.clear();
        }



    }


    private tableState(): void {

        let state = this.table.state;

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


    }  // changeTableState



    private startHand(): void {

        for (let seat of this.table.seats) {

            if (seat.player) {

                this.log(`${seat.getSeatName()}: ${seat.player.name}: ${this.chipFormatter.format(seat.player.chips)}${seat.player.isSittingOut ? ' [sitting out]' : ''}`);

            }

        }

    }   // startHand


    private betState(): void {

        let seat: Seat = this.getMySeat();

        if (seat) {

            // reset the player's default bet - this is the minimum value at which they could bet/raise the action (it does not relate to calls)
            this.myCall = this.betController.calculateCall(this.table, seat);
            this.myBet = this.betController.calculateMinimumRaise(this.table, seat, this.myCall);

        }
        else {

            this.myCall = null;
            this.myBet = null;

        }

    }  // betState


    private anteState(): void {

        // reset the player's default bet to match the ante
        let seat: Seat = this.findSeat(this.mySeatIndex);

        if (seat) {

            // reset the player's default bet - this is the minimum value at which they could bet/raise the action (it does not relate to calls)
            this.myCall = this.betController.calculateCall(this.table, seat);

            // no betting, only calling, with antes
            this.myBet = null;

        }
        else {

            this.myCall = null;
            this.myBet = null;

        }



    }  // anteState



    private updateBets(action: UpdateBetsAction): void {

        this.log(`Seats To Act: [ ${action.betStatus.seatIndexesRemainToAct.join(" ")} ]`);
        this.log(`Table Seats To Act: [ ${this.table.betStatus.seatIndexesRemainToAct.join(" ")} ]`);

        for (let pot of this.table.betStatus.pots) {
        
            let potDesc = `${pot.getName()}: ${this.chipFormatter.format(pot.amount)} - ${pot.getNumPlayers()} player${pot.getNumPlayers() === 1 ? '' : 's'}: `;
            potDesc += pot.getSeatsInPot().map(seatIndex => this.table.seats[seatIndex].getName()).join(", ");
            this.log(potDesc);
        
        }

        let betsString = Object.keys(this.table.betStatus.bets).map(seatIndex => `${this.table.seats[seatIndex].getName()}: ${this.chipFormatter.format(this.table.betStatus.bets[seatIndex].totalBet)}`).join(", ");
        if (betsString.length) {
            this.log(`  Bets: ${betsString}`);
        }
        
    }  // updateBets



    private moveButton(action: MoveButtonAction): void {

        let seat = this.findSeat(this.table.buttonIndex);

        let message: string = `${seat.getName()} now has the button`;
        this.messages.push(message);
        this.log(message);

    }   // moveButton


    private dealCard(action: DealCardAction): void {

        let seat = this.findSeat(action.seatIndex);

        let message: string = null;

        if (action.card instanceof Card) {

            message = `${seat.getName()} is dealt ${this.describeCard(action.card)}`;

        }
        else {

            message = `${seat.getName()} is dealt a card, face-down`;

        }

        this.messages.push(message);
        this.log(message);

    }   // dealCard


    private describeCard(card: Card) {

        return `${card.value.symbol}${card.suit.symbol}`;
    }

    private dealBoard(action: DealBoardAction): void {


        let message: string = `The board is dealt ${ action.cards.map(card => this.describeCard(card)).join(" ") }`;

        this.messages.push(message);
        this.log(message);

    }   // dealBoard


    private handComplete(action: HandCompleteAction): void {

        // If we have pots, then we can't have any WonPots - clear 'em
        this.wonPots.length = 0;

        // showdown is no longer required - clear the flags that were highlighting cards
        this.isShowdownRequired = false;
        this.usedCards.length = 0;

        this.muckedCards.clear();

    }  // handComplete


    private betTurn(action: BetTurnAction): void {

        // Remove any previous action for the current "to-act" player
        // Map.delete is safe to use, even if the key does not already exist
        this.seatAction.delete(action.betStatus.seatIndex);

        let seat = this.findSeat(action.betStatus.seatIndex);
        this.log(`It is ${seat.getName()}'s turn to act`);

        this.clearSeatTimers();

        let mySeat: Seat = this.getMySeat();

        this.myCall = this.betController.calculateCall(this.table, mySeat);

        // Raise the minimum value for the UI player to bet/raise, if necessary
        // Don't lower it if they have previously set it to be higher
        if (!this.myBet) {

            this.myBet = this.betController.calculateMinimumRaise(this.table, mySeat, this.myCall);

        }
        else {

            let minBet: Bet = this.betController.calculateMinimumRaise(this.table, mySeat, this.myCall);

            // In order to bet/raise we need to put in more chips than we currently have set up, so up the current setting
            if (minBet && minBet.chipsAdded > this.myBet.chipsAdded) {
                this.myBet = minBet;
            }

        }

        if (action.timesUp > Date.now()) {

            if (action.betStatus.seatIndex == this.mySeatIndex) {

                // it's our turn, so don't allow any of the pending actions to still take hold
                clearTimeout(this.pendingTimer);

                if (this.pendingCommands.fold) {

                    // We are taking an action, so clear anything that is pending and try to fold immediately
                    this.pendingCommands.clear();
                    return this.broadcastCommand(new FoldCommand(this.table.id));

                }

                if (this.pendingCommands.check) {

                    // We are taking an action, so clear anything that is pending and try to fold immediately
                    this.pendingCommands.clear();
                    return this.broadcastCommand(new BetCommand(this.table.id, 0));

                }

            }

            let timer: Timer = new Timer(action.timesUp);
            timer.start();
            this.seatTimer.set(seat.index, timer);

        }


    }  // betTurn


    private isInHandAction(action: IsInHandAction): void {

        let seat = this.findSeat(action.seatIndex);

        if (seat) {

            // this.log(`${seat.getName()} isInHandssssss: ${action.isInHand}`);

        }

    }  // setIsInHand


    private anteTurn(action: AnteTurnAction): void {

        let seat = this.findSeat(this.table.betStatus.seatIndex);

        this.log(`In anteTurn, tracker.seatIndex = ${this.table.betStatus.seatIndex}`);

        if (seat) {

            this.log(`It is ${seat.getName()}'s turn to ante`);

            // Set the amount required to call the ante
            let mySeat: Seat = this.getMySeat();

            this.myCall = this.betController.calculateCall(this.table, this.findSeat(this.mySeatIndex));
            this.myBet = null;

            this.clearSeatTimers();

            if (action.timesUp > Date.now()) {

                let timer: Timer = new Timer(action.timesUp);
                timer.start();
                this.seatTimer.set(seat.index, timer);

            }

            if (seat.isInHand && seat.player) {

                // Automatically ante if isSittingOut == false, prompt the player if isSittingOut == undefined
                if (seat.player.userID === this.user.id && seat.player.isSittingOut === false) {

                    let betCommand: AnteCommand = new AnteCommand(this.table.id);

                    this.broadcastCommand(betCommand);

                    return;

                }  // if it's my turn

            }   // seat has a player


            this.log(`${seat.getName()} is MIA`);
            return;

        }
        else {

            this.log(`In anteTurn, could not find seat for index ${this.table.betStatus.seatIndex}`);

        }

    }  // anteTurn



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

        this.messages.push(message);
        this.log(message);

    }  // betAction


    private killSeatTimer(seatIndex: number): void {

        // it's OK to delete something that might not exist
        let timer: Timer = this.seatTimer.get(seatIndex);

        if (timer) {
            timer.stop();
            this.seatTimer.delete(seatIndex);
        }

    }   // killSeatTimer


    private clearSeatTimers(): void {

        // Stop any seat timer that is already running
        for (let [key, value] of this.seatTimer) {
            value.stop();
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

        this.muckedCards.get(action.seatIndex).push(...action.cards);

        let message: string = `${seat.getName()} folds`;

        this.messages.push(message);
        this.log(message);

        this.seatAction.set(seat.index, 'FOLD');




    }  // fold


    private flipCards(action: FlipCardsAction): void {

        let seat = this.findSeat(action.seatIndex);

        if (seat.hand && seat.hand.cards && seat.hand.cards.length) {

            let message: string = `${seat.getName()} has ${seat.hand.cards.map(card => card.toString()).join(" ")}`;
            this.messages.push(message);
            this.log(message);

        }

    }  // flipCards


    private declareHand(action: DeclareHandAction): void {

        let seat = this.findSeat(action.seatIndex);

        let message: string = `${seat.getName()} has ${this.game.handDescriber.describe(action.handEvaluation)}`;

        this.messages.push(message);
        this.log(message);

    }  // declareHand


    private winPot(action: WinPotAction): void {

        let pot: WonPot = action.pot;

        this.wonPots.push(pot);

        let seat = this.findSeat(pot.seatIndex);

        let potDescription = pot.index > 0 ? `side pot #${pot.index}` : `the main pot`;

        let handDescription = pot.handEvaluation ? ` with ${this.game.handDescriber.describe(pot.handEvaluation)}` : '';

        let message:string = null;

        if (seat.player) {
        
            message = `${seat.getName()} wins ${this.chipFormatter.format(pot.amount)} from ${potDescription}${handDescription}`;
        
        }
        else {

            message = `${seat.getSeatName()} wins ${this.chipFormatter.format(pot.amount)} from ${potDescription}${handDescription}`;
        
        }

        this.messages.push(message);
        this.log(message);
        
    }  // winPot


    private betReturned(action: BetReturnedAction): void {

        let seat = this.findSeat(action.seatIndex);
        
        if (seat.player) {

            let message: string = `${this.chipFormatter.format(action.amount)} is returned to ${seat.getName()}`;
            this.messages.push(message);
            this.log(message);
        
        }
        else {
            this.log(`Need to return ${this.chipFormatter.format(action.amount)} to ${seat.getName()}, but the player is gone`);
        }
        
    }  // returnBet


    private bettingComplete(action: BettingCompleteAction): void {

        this.clearLocalBets();

    }  // bettingComplete


    private showdown(action: ShowdownAction): void {

        this.isShowdownRequired = action.isShowdownRequired;

    }  // showdown


    private potCardsUsed(action: PotCardsUsedAction): void {

        this.usedCards.length = 0;

        for (let card of action.cards) {
            this.usedCards.push(card);
        }

    }  // markUsedCards


    public isCardUsed(card: Card | FacedownCard): boolean {

        return this.usedCards && this.usedCards.find(usedCard => usedCard.equals(card)) != null;

    }  // isCardUsed


    private gatherBets(action: GatherBetsAction): void {

        this.isGatheringBets = true;

    }  // gatherBets

    private gatherBetsComplete(action: GatherBetsCompleteAction): void {

        this.isGatheringBets = false;
        this.seatAction.clear();

    }  // gatherBetsComplete


    private gatherAntes(action: GatherAntesAction): void {

        this.isGatheringAntes  = true;

    }  // gatherAntes

    private gatherAntesComplete(action: GatherAntesCompleteAction): void {

        this.isGatheringAntes = false;
        this.seatAction.clear();

    }  // gatherBetsComplete



    private chat(action: ChatAction): void {

        this.messages.push(`${action.username}: ${action.message}`);
        this.log(`${action.username}: ${action.message}`);

    }  // chat


    public setPendingFold(foldActivated: boolean): void {

        // kill anything that might already be waiting to execute
        clearTimeout(this.pendingTimer);

        this.pendingCommands.check = this.pendingCommands.bet = false;

        if (foldActivated) {

            this.pendingTimer = setTimeout(() => { this.pendingCommands.fold = true }, this.TIME_PENDING_ACTION);

        }
        else {

            // turning off folding can happen immediately
            this.pendingCommands.fold = false;

        }

    }  // setPendingFold


    public setPendingCheck(checkActivated: boolean): void {

        // kill anything that might already be waiting to execute
        clearTimeout(this.pendingTimer);

        this.pendingCommands.fold = this.pendingCommands.bet = false;

        if (checkActivated) {

            this.pendingTimer = setTimeout(() => { this.pendingCommands.check = true }, this.TIME_PENDING_ACTION);

        }
        else {

            // turning off checking can happen immediately
            this.pendingCommands.check = false;

        }

    }  // setPendingCheck


    public getMuckedCards(seatIndex: number): Array<Card | FacedownCard> {

        if (this.muckedCards && this.muckedCards.get(seatIndex)) {

            return [...this.muckedCards.get(seatIndex)];

        }

        return [];

    }  // getMuckedCards


}