import { MessageHandler } from "../messages/message-handler";
import { CommandBroadcaster } from "../commands/command-broadcaster";
import { User } from "../players/user";
import { CommandHandler } from "../commands/command-handler";
import { Message } from "../messages/message";
import { ActionMessage } from "../messages/action-message";
import { Command } from "../commands/command";
import { Table } from "../casino/tables/table";
import { TableSnapshotAction } from "../actions/table/state/table-snapshot-action";
import { Action } from "../actions/action";
import { PlayerSeatedAction } from "../actions/table/players/player-seated-action";
import { Logger } from "../logging/logger";
import { TableConnectedAction } from "../actions/table/state/table-connected-action";
import { TableSnapshotCommand } from "../commands/table/table-snapshot-command";
import { RequestSeatCommand } from "../commands/table/request-seat-command";
import { AddChipsCommand } from "../commands/table/add-chips-command";
import { AddChipsAction, Player, StackUpdateAction, TableStateAction, StartHandState, BetAction, GatherBetsAction, UpdateBetsAction, MoveButtonAction, Seat, DealCardAction, BetTurnAction, AnteTurnAction, BetCommand, FoldCommand, Bet, FoldAction, FlipCardsAction, WinPotAction, BetReturnedAction, DeclareHandAction, BettingCompleteAction, Card, BetTracker, AnteCommand, IsInHandAction, DealBoardAction, JoinTableCommand, LoginCommand, BetState } from "../communication/serializable";
import { Game } from "../games/game";
import { SetGameAction } from "../actions/table/game/set-game-action";
import { GameFactory } from "../games/game-factory";
import { WonPot } from "../casino/tables/betting/won-pot";
import { HandCompleteAction } from "../actions/table/game/hand-complete-action";
import { IChipFormatter } from "../casino/tables/chips/chip-formatter";
import { LobbyConnectedAction } from "../actions/lobby/lobby-connected-action";
import { LoginAction } from "../actions/lobby/login-action";


const logger: Logger = new Logger();

export class TableUI implements MessageHandler, CommandBroadcaster {

    public user: User;

    private commandHandlers: CommandHandler[];

    public chipFormatter: IChipFormatter;

    public table: Table;
    public game: Game;

    private mySeatIndex: number;
    public myBetAmount: number;
    public myAmountToCall: number;


    public seatAction: Map<number, string>;
    public wonPots: WonPot[];

    public isGatheringBets: boolean;

    public messages: string[];




    constructor(chipFormatter: IChipFormatter) {

        this.chipFormatter = chipFormatter;

        this.commandHandlers = new Array<CommandHandler>();

        this.table = null;

        this.seatAction = new Map<number, string>();
        this.wonPots = [];

        this.isGatheringBets = false;

        this.messages = [];

        // We need to set these values (even to null) so that they are reactive.
        // If we leave them `undefined` then Vue does not define a setter for it
        this.mySeatIndex = this.myBetAmount = this.myAmountToCall = null;

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

        if (action instanceof LobbyConnectedAction) {

            return this.connected(action);

        }

        if (action instanceof LoginAction) {

            return this.logIn(action);

        }

        if (action instanceof TableConnectedAction) {

            // we are connected, so request a snapshot of the table for this user
            this.broadcastCommand(new TableSnapshotCommand(action.tableID))
            return;

        }

        if (this.table == null) {

            if (action instanceof TableSnapshotAction) {

                this.table = action.table;

                // request a seat at the table - the null parameter means any seat will do
                this.broadcastCommand(new RequestSeatCommand(this.table.id, null));

                return;

            }

            // we don't have a table yet, so we can't do anything else
            return;

        }

        if (action instanceof SetGameAction) {

            return this.setGame(action);

        }

        if (action instanceof PlayerSeatedAction) {

            return this.seatPlayer(action);

        }

        if (action instanceof AddChipsAction) {

            return this.addChips(action);
        }

        if (action instanceof StackUpdateAction) {

            return this.updateStack(action);
        }

        if (action instanceof TableStateAction) {

            return this.changeTableState();

        }

        if (action instanceof UpdateBetsAction) {

            return this.updateBets(action);

        }

        if (action instanceof GatherBetsAction) {

            return this.gatherBets(action);

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

            return this.completeHand(action);

        }

        if (action instanceof BetTurnAction) {

            return this.betTurn(action);
        }

        if (action instanceof AnteTurnAction) {

            return this.anteTurn(action);

        }

        if (action instanceof IsInHandAction) {

            return this.setIsInHand(action);

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

            return this.returnBet(action);
        }

        if (action instanceof BettingCompleteAction) {

            return this.bettingComplete(action);

        }

        this.log(`Heard ${action.constructor.name}`);

    }

    registerCommandHandler(handler: CommandHandler) {

        this.commandHandlers.push(handler);

    }

    unregisterCommandHandler(handler: CommandHandler) {

        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);

    }

    private broadcastCommand(command: Command) {

        this.log(`Sent ${command.constructor.name}`);

        if (command instanceof BetCommand)
        {
            this.log(`  ${command.toString()}`);
        }


        for (let handler of this.commandHandlers) {

            handler.handleCommand(command);

        }

    }


    private calculateBuyIn(): number {

        switch (this.user.name) {

            case 'Danny':
                return 70000;

            case 'Mark':
                return 50000;

            case 'Paul':
                return 60000;

            case 'Joe':
                return 40000;

        }

        return 0;

    }


    private setGame(action: SetGameAction): void {

        if (!this.game || this.game.id != action.gameID) {

            // Looks up the rules for the game based on ID, rather than passing a game object through the pipes
            this.game = (new GameFactory()).create(action.gameID);
            this.log(`The game is ${this.game.getName()}`);

        }


    }   // setGamebe


    private connected(action: LobbyConnectedAction): void {

        // Once connected, log in automatically
        this.broadcastCommand(new LoginCommand('dshell', 'password1'));

    }   // connected



    private logIn(action: LoginAction): void {

        this.user = action.user;

        // Join table 1 automatically
        this.broadcastCommand(new JoinTableCommand(1));

    }   // logIn



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

    public isCheckBetTime(): boolean {

        return this.isInHand()
            && this.table.state instanceof BetState
            && this.table.betTracker
            && this.table.betTracker.isCheckAllowed(this.mySeatIndex);

    }

    public isCallRaiseTime(): boolean {

        return this.isInHand()
            && this.table.state instanceof BetState
            && this.table.betTracker
            && this.table.betTracker.getAmountToCall(this.mySeatIndex) > 0;

    }


    public betCommand(bet: BetCommand): void {

        this.broadcastCommand(bet);

    }

    public foldCommand(fold: FoldCommand): void {

        this.broadcastCommand(fold);

    }



    private seatPlayer(action: PlayerSeatedAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            let message = `${action.player.name} sits at Table ${action.tableID}, seat ${(action.seatIndex + 1)}`;
            this.messages.push(message);

            this.log(message);
            this.log(`Players: [ ${this.table.seats.filter(s => s.player).map(s => s.player.name).join(" ")} ]`);

            if (seat.player.userID === this.user.id) {

                this.mySeatIndex = action.seatIndex;

                let chips = Math.min(this.user.chips, this.calculateBuyIn());

                // this.log(`I have a seat, so I am requesting ${this.chipFormatter.format(chips)} in chips`);

                this.broadcastCommand(new AddChipsCommand(this.table.id, chips));

            }

        }

    }  // seatPlayer


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



    private updateStack(action: StackUpdateAction): void {

        let player = this.findPlayer(action.playerID);

        if (player) {

            player.chips = action.chips;
            this.log(`${player.name} now has ${this.chipFormatter.format(action.chips)}`);
    
        }

    }  // updateStack


    private log(message: string): void {

        console.log(message);

/*
        if (message == 'You cannot bet less than the current bet') {

            for (let x: number = 0; x < 20; x++) {

                console.log(`${this.user.name} UI: ${message}`);

            }

        }

        console.log(`${this.user.name} UI: ${message}`);
*/

    }


    private changeTableState(): void {

        let state = this.table.state;

        if (!(state instanceof BetState)) {

            // Clear the local bets
            this.myBetAmount = 0;
            this.myAmountToCall = 0;

        }

        if (state instanceof StartHandState) {

            return this.startHand();

        }

        if (state instanceof BetState) {

            return this.betState();

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

        // reset the player's default bet - this is the minimum value at which they could bet/raise the action (it does not relate to calls)
        this.myBetAmount = this.table.betTracker.getMinimumBet(this.mySeatIndex);
        this.myAmountToCall = this.table.betTracker.getAmountToCall(this.mySeatIndex);

    }  // betState


    private updateBets(action: UpdateBetsAction): void {

        for (let pot of this.table.betTracker.pots) {
        
            let potDesc = `${pot.getName()}: ${this.chipFormatter.format(pot.amount)} - ${pot.getNumPlayers()} player${pot.getNumPlayers() === 1 ? '' : 's'}: `;
            potDesc += pot.getSeatsInPot().map(seatIndex => this.table.seats[seatIndex].getName()).join(", ");
            this.log(potDesc);
        
        }

        let betsString = Object.keys(this.table.betTracker.bets).map(seatIndex => `${this.table.seats[seatIndex].getName()}: ${this.chipFormatter.format(this.table.betTracker.bets[seatIndex].totalBet)}`).join(", ");
        if (betsString.length) {
            this.log(`  Bets: ${betsString}`);
        }
        
    }  // updateBets


    private gatherBets(action: GatherBetsAction): void {

        this.isGatheringBets = true;

    }  // gatherBets



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


    private completeHand(action: HandCompleteAction): void {

        // If we have pots, then we can't have any WonPots - clear 'em
        this.wonPots.length = 0;

    }  // clearCards


    private betTurn(action: BetTurnAction): void {

        // Remove any previous action for the current "to-act" player
        // Map.delete is safe to use, even if the key does not already exist
        this.seatAction.delete(action.betTracker.seatIndex);

        let seat = this.findSeat(action.betTracker.seatIndex);
        this.log(`It is ${seat.getName()}'s turn to act`);

        // Raise the minimum value for the UI player to bet/raise, if necessary
        // Don't lower it if they have previously set it to be higher
        if (!this.myBetAmount) {

            this.myBetAmount = this.table.betTracker.getMinimumBet(this.mySeatIndex);

        }
        else {

            this.myBetAmount = Math.max(this.myBetAmount, this.table.betTracker.getMinimumBet(this.mySeatIndex));

        }

        this.myAmountToCall = this.table.betTracker.getAmountToCall(this.mySeatIndex);

    }  // betTurn


    private setIsInHand(action: IsInHandAction): void {

        let seat = this.findSeat(action.seatIndex);

        if (seat) {

            // this.log(`${seat.getName()} isInHandssssss: ${action.isInHand}`);

        }

    }  // setIsInHand


    private anteTurn(action: AnteTurnAction): void {

        let tracker: BetTracker = this.table.betTracker;

        let seat = this.findSeat(tracker.seatIndex);

        this.log(`In anteTurn, tracker.seatIndex = ${tracker.seatIndex}`);

        if (seat) {

            this.log(`It is ${seat.getName()}'s turn to ante`);

            if (seat.isInHand && seat.player) {

                // TODO: Automatically ante if isSittingOut == false, prompt the player if isSittingOut == undefined

                if (seat.player.userID === this.user.id) {

                    let betAmount: number = Math.min(this.table.stakes.ante, seat.player.chips);
                    let betCommand: AnteCommand = new AnteCommand(this.table.id, betAmount);

                    this.broadcastCommand(betCommand);

                    return;

                }  // if it's my turn

            }   // seat has a player
            else {

                this.log(`${seat.getName()} is MIA`);
                return;

            }

        }
        else {

            this.log(`In anteTurn, could not find seat for index ${tracker.seatIndex}`);

        }

    }  // anteTurn



    private betAction(action: BetAction): void {

        let seat = this.findSeat(action.seatIndex);

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

                case Bet.ACTION.DEAD_RAISE:
                    message = `${seat.getName()} puts in a dead raise to ${this.chipFormatter.format(action.bet.totalBet)}`;
                    this.seatAction.set(seat.index, 'RAISE');
                    break;

            }  // switch

        }

        if (action.bet.isAllIn) {
            message += ' and is all-in';
        }

        this.messages.push(message);
        this.log(message);

    }  // bet


    private foldAction(action: FoldAction): void {

        let seat = this.findSeat(action.seatIndex);

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

        let potDescription = pot.potIndex > 0 ? `side pot #${pot.potIndex}` : `the main pot`;

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


    private returnBet(action: BetReturnedAction): void {

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

        this.isGatheringBets = false;
        this.seatAction.clear();

    }  // returnBet




}