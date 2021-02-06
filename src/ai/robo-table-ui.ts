import { MessageHandler } from "../messages/message-handler";
import { CommandBroadcaster } from "../commands/command-broadcaster";
import { UserSummary } from "../players/user-summary";
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
import { SetStatusCommand } from "../commands/table/set-status-command";
import { AddChipsCommand } from "../commands/cashier/add-chips-command";
import { AddChipsAction, Player, StackUpdateAction, TableStateAction, StartHandState, BetAction, UpdateBetsAction, MoveButtonAction, Seat, DealCardAction, BetTurnAction, BetCommand, AnteCommand, FoldCommand, Bet, FoldAction, FlipCardsAction, WinPotAction, BetReturnedAction, DeclareHandAction, Card, AnteTurnAction, IsInHandAction, AuthenticateCommand, AuthenticatedAction, JoinTableCommand, SetStatusAction } from "../communication/serializable";
import { Game } from "../games/game";
import { SetGameAction } from "../actions/table/game/set-game-action";
import { GameFactory } from "../games/game-factory";
import { WonPot } from "../casino/tables/betting/won-pot";
import { IChipFormatter } from "../casino/tables/chips/chip-formatter";
import { BetStatus } from "../casino/tables/betting/bet-status";
import { BetController } from "../casino/tables/betting/bet-controller";


const TIME_TO_THINK = 1200;

const logger: Logger = new Logger();

export class RoboTableUI implements MessageHandler, CommandBroadcaster {

    private user: UserSummary;

    private commandHandlers: CommandHandler[];

    private chipFormatter: IChipFormatter;

    private tableID: number;
    private table: Table;
    private game: Game;

    private betController: BetController;

    private amISittingOut: boolean;



    constructor(tableID: number, chipFormatter: IChipFormatter) {

        this.tableID = tableID;
        this.chipFormatter = chipFormatter;

        this.commandHandlers = new Array<CommandHandler>();

        this.table = null;

        this.betController = new BetController();

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

            return this.tableConnectedAction(action);

        }

        if (action instanceof TableSnapshotAction) {

            return this.tableSnapshotAction(action);

        }

        if (this.table == null) {

            // we don't have a table yet, so we can't do anything else
            return;

        }

        if (action instanceof SetGameAction) {

            return this.setGameAction(action);

        }

        if (action instanceof PlayerSeatedAction) {

            return this.playerSeatedAction(action);

        }

        if (action instanceof AddChipsAction) {

            return this.addChipsAction(action);
        }

        if (action instanceof StackUpdateAction) {

            return this.stackUpdateAction(action);
        }

        if (action instanceof TableStateAction) {

            return this.tableStateAction();

        }

        if (action instanceof SetStatusAction) {

            return this.setStatusAction(action);
        }

        if (action instanceof IsInHandAction) {

            return this.isInHandAction(action);

        }

        if (action instanceof UpdateBetsAction) {

            return this.updateBetsAction(action);

        }

        if (action instanceof MoveButtonAction) {

            return this.moveButtonAction(action);
        }

        if (action instanceof DealCardAction) {

            return this.dealCardAction(action);
        }

        if (action instanceof BetTurnAction) {

            return this.betTurnAction(action);
        }

        if (action instanceof AnteTurnAction) {

            return this.anteTurnAction(action);
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

            return this.winPotAction(action);

        }

        if (action instanceof BetReturnedAction) {

            return this.betReturnedAction(action);
        }

        this.log(`Heard ${action.constructor.name}`);

    }


    registerCommandHandler(handler: CommandHandler) {

        this.commandHandlers.push(handler);

    }

    unregisterCommandHandler(handler: CommandHandler) {

        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);

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

    public authenticate(): void {

        this.broadcastCommand(new AuthenticateCommand());

    }   // authenticate


    private authenticatedAction(action: AuthenticatedAction): void {

        this.log(`Heared AuthenticatedAction for ${action.user.username}, sending JoinTableCommand for ${this.tableID}`);
        this.user = action.user;

        this.broadcastCommand(new JoinTableCommand(this.tableID));

    }   // authenticated


    private tableConnectedAction(action: TableConnectedAction): void {

        // we are connected, so request a snapshot of the table for this user
        this.broadcastCommand(new TableSnapshotCommand(action.tableID));

    }

    private tableSnapshotAction(action: TableSnapshotAction): void {

        this.table = action.table;

        // request a seat at the table - the null parameter means any seat will do
        this.broadcastCommand(new RequestSeatCommand(this.table.id, null));

    }  // tableSnapshotAction


    private calculateBuyIn(): number {


        console.log(`Calculating buy-in for ${this.user.name}`);

        /*

        switch (this.user.name) {

            case 'Danny':
                return 4000;

            case 'Mark':
                return 4000;

            case 'Matt':
                return 4000;

            case 'Paul':
                return 4000;

            case 'Joe':
                return 4000;

            case 'Sekhar':
                return 1000;

        }

        */

        return 2000;

    }


    private setGameAction(action: SetGameAction): void {

        if (!this.game || this.game.id != action.gameID) {

            // Looks up the rules for the game based on ID, rather than passing a game object through the pipes
            this.game = (new GameFactory()).create(action.gameID);
            this.log(`The game is ${this.game.getName()}`);

        }


    }   // setGame



    private playerSeatedAction(action: PlayerSeatedAction): void {

        let seat = this.findSeat(action.seatIndex);

        if (seat) {

            this.log(`${action.player.name} sits at Table ${action.tableID}, seat ${(action.seatIndex + 1)}`);
            this.log(`Players: [ ${this.table.seats.filter(s => s.player).map(s => s.player.name).join(" ")} ]`);

            if (seat.player.userID === this.user.id) {

                let chips = this.calculateBuyIn();

                // this.log(`I have a seat, so I am requesting ${this.chipFormatter.format(chips)} in chips`);

                this.broadcastCommand(new AddChipsCommand(this.table.id, chips));

            }

        }

    }  // playerSeatedAction


    private setStatusAction(action: SetStatusAction): void {

        // If the table has marked me (a robot) as sitting out, then try to buy back in again
        if (this.user && action.userID == this.user.id) {

            // if I wasn't sitting out before, but I am now, then buy in
            if (action.isSittingOut && this.amISittingOut === false) {

                let player: Player = this.findPlayer(action.userID);

                if (player) {

                    this.broadcastCommand(new AddChipsCommand(this.table.id, this.calculateBuyIn()));

                }

            }

            this.amISittingOut = action.isSittingOut;

        }

    }  // setStatusAction


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

            if (player.userID === this.user.id) {

                if (player.chips > 0 && player.isSittingOut) {

                    // I have chips now, so I would like to play (no longer sitting out)
                    this.broadcastCommand(new SetStatusCommand(this.table.id, false));

                }

            }
    
        }


    }  // updateStack


    private log(message: string): void {

        if (this.user == null) {
            console.log(`RoboUI (unauthorized): ${message}`);
        }
        // For now, only log from Paul's POV
        else if (this.user.username == 'ptunney') {
            console.log(`RoboUI (${this.user.name}): ${message}`);
        }

    }


    private tableStateAction(): void {

        let state = this.table.state;

        if (state instanceof StartHandState) {

            return this.startHand();

        }

    }  // changeTableState


    private isInHandAction(action: IsInHandAction): void {

        let seat = this.findSeat(action.seatIndex);

        if (seat) {

            this.log(`${seat.getName()} isInHand: ${action.isInHand}, seat.isInHand: ${seat.isInHand}`);

        }

    }  // setIsInHand



    private startHand(): void {

        for (let seat of this.table.seats) {

            if (seat.player) {

                this.log(`${seat.getSeatName()}: ${seat.player.name}: ${this.chipFormatter.format(seat.player.chips)}${seat.player.isSittingOut ? ' [sitting out]' : ''}, sittingOut: ${seat.player.isSittingOut}`);

            }

        }

    }   // startHand


    private updateBetsAction(action: UpdateBetsAction): void {

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





    private moveButtonAction(action: MoveButtonAction): void {

        let seat = this.findSeat(this.table.buttonIndex);

        this.log(`${seat.getName()} now has the button`);

    }   // moveButton


    private dealCardAction(action: DealCardAction): void {

        let seat = this.findSeat(action.seatIndex);

        if (action.card instanceof Card) {

            this.log(`${seat.getName()} is dealt ${action.card.value.symbol}${action.card.suit.symbol}`);

        }
        else {

            this.log(`${seat.getName()} is dealt a card, face-down`);

        }

    }   // dealCard


    private betTurnAction(action: BetTurnAction): void {

        let betStatus: BetStatus = action.betStatus;

        let seat = this.findSeat(betStatus.seatIndex);

        this.log(`It is ${seat.getName()}'s turn to act`);

        if (seat.isInHand && seat.player) {

            if (seat.player.userID === this.user.id) {

                let call: Bet = this.betController.calculateCall(this.table, seat);
                let minimumRaise: Bet = this.betController.calculateMinimumRaise(this.table, seat, call);

                if (betStatus.currentBet > 0) {

                    setTimeout(() => {

                        let rnd:number = Math.random();

                        if (rnd >= 0.8 && minimumRaise != null && minimumRaise.chipsAdded > call.chipsAdded) {

                            // This represents a raise 
                            let betAmount: number = minimumRaise.chipsAdded;

                            this.log(`Raise => tracker.currentBet = ${betStatus.currentBet}, betAmount = ${betAmount}, playerChips = ${seat.player.chips}, playerCurrentBet = ${this.betController.getCurrentBet(this.table.betStatus, seat.index)}`);

                            let betCommand: BetCommand = new BetCommand(this.table.id, betAmount);

                            return this.broadcastCommand(betCommand);

                        }
                        else if (rnd >= 0.05) {

                            // This represents a call (possibly all-in)
                            let betCommand: BetCommand = new BetCommand(this.table.id, call.chipsAdded);

                            return this.broadcastCommand(betCommand);

                        }
                        else {

                            // We're folding!
                            let foldCommand: FoldCommand = new FoldCommand(this.table.id);

                            return this.broadcastCommand(foldCommand);

                        }

                    }, TIME_TO_THINK);

                    return;

                }
                else {

                    setTimeout(() => {

                        // This represents a bet out (or a check, if the player has no chips)
                        let betAmount: number = Math.random() > 0.1 && minimumRaise != null && minimumRaise.chipsAdded > 0 ? minimumRaise.chipsAdded : 0;

                        let betCommand: BetCommand = new BetCommand(this.table.id, betAmount);

                        this.broadcastCommand(betCommand);

                    }, TIME_TO_THINK);

                    return;

                }

            }  // if it's my turn

        }   // seat has a player
        else {

            this.log(`${seat.getName()} is MIA`);
            return;

        }

    }  // betTurn


    private anteTurnAction(action: AnteTurnAction): void {

        let betStatus: BetStatus = action.betStatus;

        let seat = this.findSeat(betStatus.seatIndex);

        this.log(`It is ${seat.getName()}'s turn to ante, tracker.seatIndex: ${betStatus.seatIndex}, seat.isInHand: ${seat.isInHand}, seat.hasPlayer: ${(seat.player != null)}`);

        if (seat.isInHand && seat.player) {

            if (seat.player.userID === this.user.id) {

                let betCommand: AnteCommand = new AnteCommand(this.table.id);

                this.broadcastCommand(betCommand);

                return;

            }  // if it's my turn

        }   // seat has a player
        else {

            this.log(`${seat.getName()} is MIA`);
            return;

        }

    }  // anteTurn


    private betAction(action: BetAction): void {

/*
        let seat = this.findSeat(action.seatIndex);

        let message = 'Unknown message';

        switch (action.bet.actionType) {

            case Bet.ACTION.CHECK:
                message = `${seat.getName()} checks`;
                break;

            case Bet.ACTION.OPEN:
                message = `${seat.getName()} bets ${this.chipFormatter.format(action.bet.totalBet)}`;
                break;

            case Bet.ACTION.CALL:
                message = `${seat.getName()} calls ${this.chipFormatter.format(action.bet.totalBet)}`;
                break;

            case Bet.ACTION.RAISE:
                message = `${seat.getName()} raises to ${this.chipFormatter.format(action.bet.totalBet)}`;
                break;

        }  // switch

        this.log(message);
*/

    }  // betAction


    private foldAction(action: FoldAction): void {

/*
        let seat = this.findSeat(action.seatIndex);

        this.log(`${seat.getName()} folds`);
*/

    }  // fold


    private flipCardsAction(action: FlipCardsAction): void {

/*
        let seat = this.findSeat(action.seatIndex);

        if (seat.hand && seat.hand.cards && seat.hand.cards.length) {

            this.log(`${seat.getName()} has ${seat.hand.cards.map(card => card.toString()).join(" ")}`);

        }
*/

    }  // flipCards


    private declareHandAction(action: DeclareHandAction): void {

/*
        let seat = this.findSeat(action.seatIndex);

        this.log(`${seat.getName()} has ${this.game.handDescriber.describe(action.handEvaluation)}`);
*/

    }  // declareHand


    private winPotAction(action: WinPotAction): void {

/*
        let pot: WonPot = action.pot;

        let seat = this.findSeat(pot.seatIndex);

        let potDescription = pot.index > 0 ? `side pot #${pot.index}` : `the main pot`;

        let handDescription = pot.handEvaluation ? ` with ${this.game.handDescriber.describe(pot.handEvaluation)}` : '';

        if (seat.player) {

            this.log(`${seat.getName()} wins ${this.chipFormatter.format(pot.amount)} from ${potDescription}${handDescription}`);

        }
        else {
            this.log(`${seat.getSeatName()} wins ${this.chipFormatter.format(pot.amount)} from ${potDescription}${handDescription}`);

        }
*/
        
    }  // winPot


    private betReturnedAction(action: BetReturnedAction): void {

/*
        let seat = this.findSeat(action.seatIndex);
        
        if (seat.player) {
        
            this.log(`${this.chipFormatter.format(action.amount)} is returned to ${seat.getName()}`);
        
        }
        else {
            this.log(`Need to return ${this.chipFormatter.format(action.amount)} to ${seat.getName()}, but the player is gone`);
        }
*/
        
    }  // returnBet




}