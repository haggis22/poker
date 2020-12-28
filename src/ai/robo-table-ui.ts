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
import { SetStatusCommand } from "../commands/table/set-status-command";
import { AddChipsCommand } from "../commands/table/add-chips-command";
import { AddChipsAction, Player, StackUpdateAction, TableStateAction, StartHandState, BetAction, UpdateBetsAction, MoveButtonAction, Seat, DealCardAction, BetTurnAction, BetCommand, AnteCommand, FoldCommand, Bet, FoldAction, FlipCardsAction, WinPotAction, BetReturnedAction, DeclareHandAction, Card, AnteTurnAction, IsInHandAction } from "../communication/serializable";
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

    private user: User;

    private commandHandlers: CommandHandler[];

    private chipFormatter: IChipFormatter;

    private table: Table;
    private game: Game;
    private betController: BetController;


    constructor(user: User, chipFormatter: IChipFormatter) {

        this.user = user;

        this.chipFormatter = chipFormatter;

        this.commandHandlers = new Array<CommandHandler>();

        this.table = null;

        this.betController = new BetController();

        this.log(`Created Robo UI for user ${user.name}`);

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

        if (action instanceof TableConnectedAction) {

            // we are connected, so request a snapshot of the table for this user
            this.broadcastCommand(new TableSnapshotCommand(action.tableID))
            return;

        }

        if (this.table == null) {

            if (action instanceof TableSnapshotAction) {

                this.table = action.table;

                // request a seat at the table - the null parameter means any seat will do
                // this.broadcastCommand(new RequestSeatCommand(this.table.id, null));
                this.broadcastCommand(new RequestSeatCommand(this.table.id, 2 + this.user.id));

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

        if (action instanceof IsInHandAction) {

            return this.setIsInHand(action);

        }

        if (action instanceof UpdateBetsAction) {

            return this.updateBets(action);

        }

        if (action instanceof MoveButtonAction) {

            return this.moveButton(action);
        }

        if (action instanceof DealCardAction) {

            return this.dealCard(action);
        }

        if (action instanceof BetTurnAction) {

            return this.betTurn(action);
        }

        if (action instanceof AnteTurnAction) {

            return this.anteTurn(action);
        }

        if (action instanceof BetAction) {

            return this.bet(action);

        }

        if (action instanceof FoldAction) {

            return this.fold(action);

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


    private calculateBuyIn(): number {


        console.log(`Calculating buy-in for ${this.user.name}`);

        switch (this.user.name) {

            case 'Danny':
                return 1000;

            case 'Mark':
                return 2000;

            case 'Matt':
                return 1000;

            case 'Paul':
                return 1000;

            case 'Joe':
                return 2000;

            case 'Sekhar':
                return 300;

        }

        return 1000;

    }


    private setGame(action: SetGameAction): void {

        if (!this.game || this.game.id != action.gameID) {

            // Looks up the rules for the game based on ID, rather than passing a game object through the pipes
            this.game = (new GameFactory()).create(action.gameID);
            this.log(`The game is ${this.game.getName()}`);

        }


    }   // setGame


    private seatPlayer(action: PlayerSeatedAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            this.log(`${action.player.name} sits at Table ${action.tableID}, seat ${(action.seatIndex + 1)}`);
            this.log(`Players: [ ${this.table.seats.filter(s => s.player).map(s => s.player.name).join(" ")} ]`);

            if (seat.player.userID === this.user.id) {

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

            if (player.userID === this.user.id) {

                if (player.chips > 0 && player.isSittingOut) {

                    // I have chips now, so I would like to play (no longer sitting out)
                    this.broadcastCommand(new SetStatusCommand(this.table.id, false));

                }

            }
    
        }


    }  // updateStack


    private log(message: string): void {

        // For now, only log from Danny's POV
        if (this.user.id === 2) {
            console.log(`UI: ${message}`);
        }

    }


    private changeTableState(): void {

        let state = this.table.state;

        if (state instanceof StartHandState) {

            return this.startHand();

        }

    }  // changeTableState


    private setIsInHand(action: IsInHandAction): void {

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


    private updateBets(action: UpdateBetsAction): void {

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

        this.log(`${seat.getName()} now has the button`);

    }   // moveButton


    private dealCard(action: DealCardAction): void {

        let seat = this.findSeat(action.seatIndex);

        if (action.card instanceof Card) {

            this.log(`${seat.getName()} is dealt ${action.card.value.symbol}${action.card.suit.symbol}`);

        }
        else {

            this.log(`${seat.getName()} is dealt a card, face-down`);

        }

    }   // dealCard


    private betTurn(action: BetTurnAction): void {

        let betStatus: BetStatus = action.betStatus;

        let seat = this.findSeat(betStatus.seatIndex);

        this.log(`It is ${seat.getName()}'s turn to act`);

        if (seat.isInHand && seat.player) {

            if (seat.player.userID === this.user.id) {

                let callAmount: number = this.betController.calculateCall(this.table, seat);
                let minimumRaise: number = this.betController.calculateMinimumRaise(this.table, seat, callAmount);

                if (betStatus.currentBet > 0) {

                    setTimeout(() => {

                        let rnd:number = Math.random();

                        if (rnd >= 0.8 && minimumRaise != null && minimumRaise > callAmount) {

                            // This represents a raise 
                            let betAmount: number = minimumRaise;

                            this.log(`Raise => tracker.currentBet = ${betStatus.currentBet}, betAmount = ${betAmount}, playerChips = ${seat.player.chips}, playerCurrentBet = ${this.betController.getCurrentBet(this.table.betStatus, seat.index)}`);

                            let betCommand: BetCommand = new BetCommand(this.table.id, betAmount);

                            return this.broadcastCommand(betCommand);

                        }
                        else if (rnd >= 0.02) {

                            // This represents a call (possibly all-in)
                            let betCommand: BetCommand = new BetCommand(this.table.id, callAmount);

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
                        let betAmount: number = Math.random() > 0.1 && minimumRaise != null && minimumRaise > 0 ? minimumRaise : 0;

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


    private anteTurn(action: AnteTurnAction): void {

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


    private bet(action: BetAction): void {

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

    }  // bet


    private fold(action: FoldAction): void {

        let seat = this.findSeat(action.seatIndex);

        this.log(`${seat.getName()} folds`);

    }  // fold


    private flipCards(action: FlipCardsAction): void {

        let seat = this.findSeat(action.seatIndex);

        if (seat.hand && seat.hand.cards && seat.hand.cards.length) {

            this.log(`${seat.getName()} has ${seat.hand.cards.map(card => card.toString()).join(" ")}`);

        }

    }  // flipCards


    private declareHand(action: DeclareHandAction): void {

        let seat = this.findSeat(action.seatIndex);

        this.log(`${seat.getName()} has ${this.game.handDescriber.describe(action.handEvaluation)}`);

    }  // declareHand


    private winPot(action: WinPotAction): void {

        let pot: WonPot = action.pot;

        let seat = this.findSeat(pot.seatIndex);

        let potDescription = pot.potIndex > 0 ? `side pot #${pot.potIndex}` : `the main pot`;

        let handDescription = pot.handEvaluation ? ` with ${this.game.handDescriber.describe(pot.handEvaluation)}` : '';

        if (seat.player) {

            this.log(`${seat.getName()} wins ${this.chipFormatter.format(pot.amount)} from ${potDescription}${handDescription}`);

        }
        else {
            this.log(`${seat.getSeatName()} wins ${this.chipFormatter.format(pot.amount)} from ${potDescription}${handDescription}`);

        }
        
    }  // winPot


    private returnBet(action: BetReturnedAction): void {

        let seat = this.findSeat(action.seatIndex);
        
        if (seat.player) {
        
            this.log(`${this.chipFormatter.format(action.amount)} is returned to ${seat.getName()}`);
        
        }
        else {
            this.log(`Need to return ${this.chipFormatter.format(action.amount)} to ${seat.getName()}, but the player is gone`);
        }
        
    }  // returnBet




}