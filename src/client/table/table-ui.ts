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
import { AddChipsAction, Player, StackUpdateAction, TableStateAction, StartHandState, BetAction, GatherBetsAction, GatherAntesAction, UpdateBetsAction, MoveButtonAction, Seat, DealCardAction, BetTurnAction, AnteTurnAction, BetCommand, FoldCommand, Bet, FoldAction, FlipCardsAction, WinPotAction, BetReturnedAction, DeclareHandAction, BettingCompleteAction, Card, AnteCommand, IsInHandAction, DealBoardAction, JoinTableCommand, LoginCommand, BetState, BlindsAndAntesState, GatherBetsCompleteAction, GatherAntesCompleteAction, SetStatusCommand, PotCardsUsedAction, ShowdownAction, FacedownCard, ChatAction, SetStatusAction, AuthenticatedAction, CheckBalanceCommand, TableAction, RaiseCommand, CallCommand } from "../../communication/serializable";
import { Game } from "../../games/game";
import { SetGameAction } from "../../actions/table/game/set-game-action";
import { GameFactory } from "../../games/game-factory";
import { WonPot } from "../../casino/tables/betting/won-pot";
import { HandCompleteAction } from "../../actions/table/game/hand-complete-action";
import { IChipFormatter } from "../../casino/tables/chips/chip-formatter";
import { Timer } from "../../timers/timer";
import { BetController } from "../../casino/tables/betting/bet-controller";
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


    public mySeatIndex: number;

    public myCall: Bet;
    public myMinRaise: Bet;
    public myMaxRaise: Bet;

    public currentBalance: number;

    public seatAction: Map<number, string>;
    public seatTimer: object;

    public wonPots: WonPot[];

    public isGatheringAntes: boolean;
    public isGatheringBets: boolean;

    public messages: string[];

    public isSittingOut: boolean;

    public isShowdownRequired: boolean;

    // indicates which cards were used in calculating the winning hand for a given pot
    private usedCards: Array<Card>;

    // fields specific to acting in advance
    public pendingBetCommand: BetCommand | FoldCommand;
    private pendingBetNumRaises: number;

    // Key = seatIndex
    // Value = array of cards that have been mucked
    public muckedCards: Map<number, Array<Card | FacedownCard>>;

    public dealerPositions: Map<number, UIPosition>;
    public playerPositions: Map<number, UIPosition>;

    public winningHand: string;





    constructor(tableID: number, chipFormatter: IChipFormatter) {

        this.tableID = tableID;
        this.chipFormatter = chipFormatter;

        this.commandHandlers = new Array<CommandHandler>();
            
        this.table = null;

        this.seatAction = new Map<number, string>();
        this.seatTimer = {};
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

        this.winningHand = null;

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

            return this.tableStateAction(action);

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

            return this.flipCards(action);

        }

        if (action instanceof DeclareHandAction) {

            return this.declareHand(action);

        }

        if (action instanceof WinPotAction) {

            return this.winPotAction(action);

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


    public remainsToAnte(): boolean {

        return this.mySeatIndex != null && this.table.state instanceof BlindsAndAntesState && this.myCall != null;
        // && (this.table.seats[this.mySeatIndex].player.isSittingOut === null);

    }

    public remainsToAct(): boolean {

        return this.mySeatIndex != null && this.table.state instanceof BetState && (this.table.betStatus.seatIndex === this.mySeatIndex || this.table.betStatus.doesSeatRemainToAct(this.mySeatIndex));

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
        this.myCall = this.myMinRaise = this.myMaxRaise = null;

        this.clearBetCommand();

    }


    private tableStateAction(action: TableStateAction): void {

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
            this.myMinRaise = this.betController.calculateMinimumRaise(this.table, seat, this.myCall);
            this.myMaxRaise = this.betController.calculateMaximumRaise(this.table, seat, this.myCall);

        }
        else {

            this.myCall = this.myMinRaise = this.myMaxRaise = null;

        }

    }  // betState


    private anteState(): void {

        let seat: Seat = this.getMySeat();

        if (seat && seat.isInHand) {

            // reset the player's default bet - this is the minimum value at which they could bet/raise the action (it does not relate to calls)
            this.myCall = this.betController.calculateCall(this.table, seat);

            // no betting, only calling, with antes
            this.myMinRaise = this.myMaxRaise = null;

            // If I am marked as "not sitting out" then ready my blinds & ante bet
            if (seat.player.isSittingOut === false) {

                this.setBetCommand(new AnteCommand(this.table.id));

            }  

        }
        else {

            this.myCall = this.myMinRaise = this.myMaxRaise = null;

        }

    }  // anteState



    private updateBets(action: UpdateBetsAction): void {

        this.log(`Seats To Act: [ ${action.betStatus.seatIndexesRemainToAct.join(" ")} ]`);
        this.log(`Table Seats To Act: [ ${this.table.betStatus.seatIndexesRemainToAct.join(" ")} ]`);

        if (this.pendingBetCommand) {

            if (this.pendingBetNumRaises == null || action.betStatus.numRaises > this.pendingBetNumRaises) {

                // TODO: Maybe leave in place if it is Call Any, or a raise more than what the action took it to
                this.clearBetCommand();

            }

        }

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

        this.myCall = this.betController.calculateCall(this.table, mySeat);

        // Calculate the min and max raises allowed here
        this.myMinRaise = this.betController.calculateMinimumRaise(this.table, mySeat, this.myCall);
        this.myMaxRaise = this.betController.calculateMaximumRaise(this.table, mySeat, this.myCall);

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
            this.seatTimer[seat.index] = timer;

        }


    }  // betTurnAction


    private anteTurnAction(action: AnteTurnAction): void {

        let anteSeatIndex: number = this.table.betStatus.forcedBets.seatIndex;

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

                    this.myCall = this.betController.calculateCall(this.table, anteSeat);

                    // if we had a betting action readied, then send it now
                    if (this.checkPendingBetCommand()) {

                        return;

                    }

                }

                let timer: Timer = new Timer(action.timesUp);
                timer.start();
                this.seatTimer[anteSeat.index] = timer;

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

        this.messages.push(message);
        this.log(message);

    }  // betAction


    private killSeatTimer(seatIndex: number): void {

        // it's OK to delete something that might not exist
        let timer: Timer = this.seatTimer[seatIndex];

        if (timer) {
            timer.stop();
            delete this.seatTimer[seatIndex];
        }

    }   // killSeatTimer


    private clearSeatTimers(): void {

        // Stop any seat timer that is already running
        // Remove all timers from the map
        for (let prop in this.seatTimer) {

            this.seatTimer[prop].stop();
            delete this.seatTimer[prop];

        }

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


    private winPotAction(action: WinPotAction): void {

        let pot: WonPot = action.pot;

        this.wonPots.push(pot);

        let seat = this.findSeat(pot.seatIndex);

        let potDescription = pot.index > 0 ? `side pot #${pot.index}` : `the main pot`;

        let handDescription = ' before showdown';

        // this.winningHand is responsible for showing the winning hand in a banner
        // If there is no showdown then just leave it as `null`

        if (pot.handEvaluation) {

            this.winningHand = this.game.handDescriber.describe(pot.handEvaluation);
            handDescription = ` with ${this.game.handDescriber.describe(pot.handEvaluation)}`;

        }
        else {
            this.winningHand = null;
        }

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


    public clearBetCommand(): void {

        this.pendingBetCommand = null;
        this.pendingBetNumRaises = null;

    }

    public setBetCommand(betCommand: BetCommand | FoldCommand) {

        this.pendingBetCommand = betCommand;

        // Remember the level of action when this bet was set - if it goes up then we don't want to keep doing this action
        this.pendingBetNumRaises = this.table.betStatus.numRaises;

        setTimeout(() => { this.checkPendingBetCommand(); }, 50);

    }


    private checkPendingBetCommand(): boolean {

        if (this.pendingBetCommand && this.mySeatIndex != null) {

            if (this.table.state instanceof BlindsAndAntesState) {

                if (this.table.betStatus && this.table.betStatus.forcedBets && this.table.betStatus.forcedBets.seatIndex == this.mySeatIndex) {

                    let command: BetCommand | FoldCommand = this.pendingBetCommand;

                    this.clearBetCommand();

                    if (command instanceof AnteCommand) {

                        this.broadcastCommand(command);
                        return true;

                    }

                }

            }  // Blinds 'n Ante

            // TODO: Validate first against local BetController and only send if valid?
            else if (this.table.state instanceof BetState) {

                if (this.table.betStatus && this.table.betStatus.seatIndex == this.mySeatIndex) {

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

        if (this.table && this.table.betStatus) {

            if (this.table.state instanceof BlindsAndAntesState) {

                return this.table.betStatus.forcedBets && this.table.betStatus.forcedBets.seatIndex == seatIndex;

            }

            else if (this.table.state instanceof BetState) {

                return this.table.betStatus.seatIndex == seatIndex;

            }

        }

        return false;

    }  // isActionOn


}