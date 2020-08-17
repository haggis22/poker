﻿import { PlayerSeatedAction } from "../actions/table/players/player-seated-action";
import { MoveButtonAction } from "../actions/table/game/move-button-action";
import { Player } from "../players/player";
import { DealtCard } from "../hands/dealt-card";
import { Table } from "../casino/tables/table";
import { TableSnapshotAction } from "../actions/table/state/table-snapshot-action";
import { Hand } from "../hands/hand";
import { UpdateBetsAction } from "../actions/table/betting/update-bets-action";
import { WinPotAction } from "../actions/table/game/win-pot-action";
import { HandDescriber } from "../games/hand-describer";
import { PokerHandDescriber } from "../games/poker/poker-hand-describer";
import { StackUpdateAction } from "../actions/table/players/stack-update-action";
import { BetCommand } from "../commands/table/bet-command";
import { CommandHandler } from "../commands/command-handler";
import { BetTracker } from "../casino/tables/betting/bet-tracker";
import { Bet } from "../casino/tables/betting/bet";
import { FoldCommand } from "../commands/table/fold-command";
import { Logger } from "../logging/logger";
import { MessageHandler } from "../messages/message-handler";
import { MessageBroadcaster } from "../messages/message-broadcaster";
import { Message } from "../messages/message";
import { ActionMessage } from "../messages/action-message";
import { TableAction } from "../actions/table/table-action";
import { SetHandAction } from "../actions/table/game/set-hand-action";
import { AddChipsAction } from "../actions/table/players/add-chips-action";
import { DealCardAction } from "../actions/table/game/deal-card-action";
import { BetTurnAction } from "../actions/table/game/bet-turn-action";
import { FlipCardsAction } from "../actions/table/game/flip-cards-action";
import { AnteAction } from "../actions/table/betting/ante-action";
import { BetAction } from "../actions/table/betting/bet-action";
import { FoldAction } from "../actions/table/betting/fold-action";
import { BetReturnedAction } from "../actions/table/game/bet-returned-action";
import { CommandBroadcaster } from "../commands/command-broadcaster";
import { Command } from "../commands/command";
import { TableStateAction, OpenState } from "../communication/serializable";

const logger: Logger = new Logger();

export class TableWatcher implements CommandHandler, MessageHandler, CommandBroadcaster {


    private tableID: number;
    private table: Table;

    private commandHandlers: CommandHandler[];
    private messageHandlers: MessageHandler[];

    private messageQueue: Message[];


    constructor(tableID: number) {

        this.tableID = tableID;
        this.table = null;

        this.commandHandlers = new Array<CommandHandler>();
        this.messageHandlers = new Array<MessageHandler>();

        this.messageQueue = new Array<Message>();


    }


    public registerMessageHandler(handler: MessageHandler): void {

        this.messageHandlers.push(handler);

    }   // registerMessageHandler


    public unregisterMessageHandler(handler: MessageHandler): void {

        this.messageHandlers = this.messageHandlers.filter(o => o != handler);

    }  // unregisterMessageHandler

    public registerCommandHandler(handler: CommandHandler): void {

        this.commandHandlers.push(handler);

    }  // registerCommandHandler

    public unregisterCommandHandler(handler: CommandHandler): void {

        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);

    }  // unregisterCommandHandler


    public handleCommand(command: Command): void {

        // For now, just pass it through
        this.broadcastCommand(command);

    }

    public handleMessage(message: Message): void {

        // For ActionMessages, we want to handle them ourselves first, so that it can update the model
        // from which the UI reads, and then we will pass them along
        let actionMessage: ActionMessage = message as ActionMessage;

        if (actionMessage && actionMessage.action instanceof TableAction) {

            if (actionMessage.action.tableID === this.tableID) {

                this.messageQueue.push(message);
                this.handleAction(actionMessage.action);

            }

        }
        else {

            // Won't update the model, so we can add it to the queue directly
            this.messageQueue.push(message);

        }

        this.pumpQueues();

    }


    private pumpQueues(): void {

        while (this.messageQueue.length) {

            this.broadcastMessage(this.messageQueue.shift());

        }

    }  // pumpQueues


    private broadcastMessage(message: Message): void {

        for (let handler of this.messageHandlers) {

            handler.handleMessage(message);

        }

    }   // broadcastMessage


    private broadcastCommand(command: Command): void {

        for (let handler of this.commandHandlers) {

            handler.handleCommand(command);

        }

    }   // broadcastCommand



    private handleAction(action: TableAction): void {

        if (!action || action.tableID !== this.tableID) {

            // Not a TableAction, or not my table - I don't care
            return;

        }

        if (this.table == null) {

            if (action instanceof TableSnapshotAction) {

                this.grabTableData(action);

            }

            // we don't have a table yet, so we can't do anything else
            return;

        }

        if (action instanceof PlayerSeatedAction) {

            // this.log(` yes - it is a PlayerSeatedAction`);
            return this.seatPlayer(action);

        }

        if (action instanceof AddChipsAction) {

            // This is just a pass-through notification; only update the chip count on a StackUpdateAction
            return;

        }

        if (action instanceof StackUpdateAction) {

            return this.updateStack(action);

        }

        if (action instanceof TableStateAction) {

            return this.changeTableState(action);

        }

        if (action instanceof AnteAction) {

            // This is just a pass-through notification; only update the bets on an UpdateBetsAction
            return;

        }

        if (action instanceof UpdateBetsAction) {

            return this.updateBets(action);

        }


        /*
        if (action instanceof MoveButtonAction) {

            return this.moveButton(action);
        }

        if (action instanceof SetHandAction) {

            return this.setHand(action);
        }



        if (action instanceof DealCardAction) {

            return this.dealCard(action);
        }

        if (action instanceof BetTurnAction) {

            return this.betTurn(action);

        }

        if (action instanceof FlipCardsAction) {

            return this.flipCards(action);

        }


        if (action instanceof BetAction) {

            return this.bet(action);

        }

        if (action instanceof FoldAction) {

            return this.fold(action);

        }



        if (action instanceof WinPotAction) {

            return this.winPot(action);

        }

        if (action instanceof BetReturnedAction) {

            return this.returnBet(action);
        }
*/

        this.log(`Heard ${action.constructor.name}`);

    }


    private log(message: string): void {

        console.log('\x1b[32m%s\x1b[0m', `TableWatcher ${message}`);

    }


    private grabTableData(action: TableSnapshotAction): void {

        this.table = action.table;

    }

    private seatPlayer(action: PlayerSeatedAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            seat.player = action.player;

            // this.log(` ${action.player.name} sat in ${seat.getSeatName()}`);

        }

    }


    private updateStack(action: StackUpdateAction): void {

        let player = this.findPlayer(action.playerID);

        if (player) {

            player.chips = action.chips;
            //            logger.info(`${player.name} has ${this.chipFormatter.format(action.chips)}`);

        }

    }  // updateStack


    private changeTableState(action: TableStateAction): void {

        let state = action.state || new OpenState();

        this.table.state = state;
        this.log(`TableState: ${state.constructor.name}`);

    }   // changeTableState


    private updateBets(action: UpdateBetsAction): void {

        this.table.betTracker = action.betTracker;

    }  // updateBets



    private findPlayer(userID: number): Player {

        return null;

    }


    private moveButton(action: MoveButtonAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            logger.info(`${seat.getName()} now has the button at table ${this.table.id}`);

        }
        else {

            logger.info(`Could not find seat ${action.seatIndex}`);
        }

    }


    private setHand(action: SetHandAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            // If the seat has a hand, create a blank hand and copy the values over from the action
            seat.hand = action.hasHand ? new Hand() : null;

        }

    }  // setHand



    private dealCard(action: DealCardAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            let dealtCard = new DealtCard(action.card, action.card != null);
            seat.hand.deal(dealtCard);

            if (dealtCard.isFaceUp) {

                logger.info(`Client: ${seat.getName()} is dealt ${action.card.value.symbol}${action.card.suit.symbol}`);

            }
            else {

                logger.info(`Client: ${seat.getName()} is dealt a card`);

            }

/*
            if (seat.index == 0) {
                logger.debug(`DEBUGGGGG: got DealCardAction: ${action}`);
                logger.debug(`${seat.getName()} has ${seat.hand.cards.join(" ")}`);
            }
*/


        }

    }   // dealCard


    private betTurn(action: BetTurnAction): void {

        let seat = this.table.seats[action.bets.seatIndex];

        if (seat) {

            logger.info(`It is ${seat.getName()}'s turn to act`);

            if (seat.hand && seat.player) {

                logger.info(`${seat.getName()} is thinking`);

                let tracker: BetTracker = action.bets;

                if (tracker.currentBet > 0) {

                    if (Math.random() >= 0.20) {

                        // This represents a call (possibly all-in)
                        let betAmount: number = Math.min(tracker.currentBet, seat.player.chips);
                        let betCommand: BetCommand = new BetCommand(this.table.id, seat.player.userID, betAmount);

                        // this.broadcastCommand(betCommand);
                        return;

                    }
                    else {

                        // We're folding!
                        let foldCommand: FoldCommand = new FoldCommand(this.table.id, seat.player.userID);

                        // this.broadcastCommand(foldCommand);
                        return;

                    }

                }
                else {

                    // This represents a bet out (or a check, if the player has no chips)
                    let betAmount: number = Math.min(tracker.minRaise, seat.player.chips);
                    let betCommand: BetCommand = new BetCommand(this.table.id, seat.player.userID, betAmount);

                    // this.broadcastCommand(betCommand);
                    return;

                }

            }   // seat has a player
            else {

                logger.info(`${seat.getName()} is MIA`);
                return;

            }

        }
        else {

            throw new Error(`Seat index out of range: ${action.bets.seatIndex}`);

        }

    }  // betTurn


    private flipCards(action: FlipCardsAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            if (seat.hand && seat.hand.cards && seat.hand.cards.length) {

                seat.hand = action.hand;

                logger.info(`${seat.getName()} has ${seat.hand.cards.join(" ")}`);

            }

        }
        else {

            throw new Error(`Could not find seat ${action.seatIndex}`);

        }

    }  // flipCards




    private bet(action: BetAction): void {

/*
        let seat = this.table.seats[action.seatIndex];

        if (seat) {

            let message = 'Unknown message';

            switch (action.bet.betType) {

                case Bet.CHECK:
                    message = `${seat.getName()} checks`;
                    break;

                case Bet.OPEN:
                    message = `${seat.getName()} bets ${this.chipFormatter.format(action.bet.totalBet)}`;
                    break;

                case Bet.CALL:
                    message = `${seat.getName()} calls ${this.chipFormatter.format(action.bet.totalBet)}`;
                    break;

                case Bet.RAISE:
                    message = `${seat.getName()} raises to ${this.chipFormatter.format(action.bet.totalBet)}`;
                    break;

            }  // switch

            if (action.bet.isAllIn) {
                message += ' and is all-in';
            }

            logger.info(message);

        }
        else {

            throw new Error(`Bet: Seat index out of range: ${action.seatIndex}`);

        }
*/

    }  // bet


    private fold(action: FoldAction): void {

        let seat = this.table.seats[action.seatIndex];

        if (seat) {

            logger.info(`${seat.getName()} folds`);

        }
        else {

            throw new Error(`Fold: Seat index out of range: ${action.seatIndex}`);

        }

    }  // fold


    private winPot(action: WinPotAction): void {

/*
        let seat = this.table.seats[action.seatIndex];

        if (seat) {

            let describer: HandDescriber = new PokerHandDescriber();

            let potDescription = action.potIndex > 0 ? `side pot #${action.potIndex}` : `the main pot`;

            let handDescription = action.handEvaluation ? ` with ${describer.describe(action.handEvaluation)}` : '';

            if (seat.player) {

                logger.info(`${seat.getName()} wins ${this.chipFormatter.format(action.amount)} from ${potDescription}${handDescription}`);

            }
            else {
                logger.info(`${seat.getName()} wins ${this.chipFormatter.format(action.amount)} from ${potDescription}${handDescription}, but the player is gone`);

            }

        }
        else {

            throw new Error(`WinPot: Seat index out of range: ${action.seatIndex}`);

        }
*/

    }  // winPot


    private returnBet(action: BetReturnedAction): void {

/*
        let seat = this.table.seats[action.seatIndex];

        if (seat) {

            if (seat.player) {

                logger.info(`${this.chipFormatter.format(action.amount)} is returned to ${seat.getName()}`);

            }
            else {
                logger.info(`Need to return ${this.chipFormatter.format(action.amount)} to ${seat.getName()}, but the player is gone`);
            }

        }
        else {

            throw new Error(`BetReturned: Seat index out of range: ${action.seatIndex}`);

        }
*/

    }  // returnBet




}