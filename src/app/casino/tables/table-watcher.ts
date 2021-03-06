import { PlayerSeatedAction } from "../../actions/table/players/player-seated-action";
import { SeatVacatedAction } from "../../actions/table/players/seat-vacated-action";
import { SetStatusAction } from "../../actions/table/players/set-status-action";
import { IsInHandAction } from "../../actions/table/players/is-in-hand-action";
import { MoveButtonAction } from "../../actions/table/game/move-button-action";
import { TableSnapshotAction } from "../../actions/table/state/table-snapshot-action";
import { UpdateBetsAction } from "../../actions/table/betting/update-bets-action";
import { WinPotAction } from "../../actions/table/game/pots/win-pot-action";
import { StackUpdateAction } from "../../actions/table/players/stack-update-action";
import { Player } from "../../players/player";
import { Table } from "./table";
import { CommandHandler } from "../../commands/command-handler";
import { Logger } from "../../logging/logger";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";
import { ActionMessage } from "../../messages/action-message";
import { TableAction } from "../../actions/table/table-action";
import { AddChipsAction } from "../../actions/table/players/add-chips-action";
import { DealCardAction } from "../../actions/table/game/dealing/deal-card-action";
import { DealBoardAction } from "../../actions/table/game/dealing/deal-board-action";
import { BetTurnAction } from "../../actions/table/betting/bet-turn-action";
import { FlipCardsAction } from "../../actions/table/game/flip-cards-action";
import { BetAction } from "../../actions/table/betting/bet-action";
import { FoldAction } from "../../actions/table/betting/fold-action";
import { BetReturnedAction } from "../../actions/table/betting/bet-returned-action";
import { CommandBroadcaster } from "../../commands/command-broadcaster";
import { Command } from "../../commands/command";
import { TableStateAction, OpenState, Seat, AnteTurnAction, ClearBoardAction } from "../../communication/serializable";
import { SetGameAction } from "../../actions/table/game/set-game-action";
import { Game } from "../../games/game";
import { GameFactory } from "../../games/game-factory";
import { ClearHandAction } from "../../actions/table/game/dealing/clear-hand-action";


// const logger: Logger = new Logger();

export class TableWatcher implements CommandHandler, MessageHandler, CommandBroadcaster {


    private tableID: number;
    private table: Table;
    private game: Game;

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

                // Put them on the queue first in case handling it will *also* push messages onto the queue and we
                // want to maintain the proper FIFO order
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

        if (action instanceof TableSnapshotAction) {

            this.tableSnapshotAction(action);

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

        if (action instanceof SeatVacatedAction) {

            return this.seatVacatedAction(action);

        }

        if (action instanceof SetStatusAction) {

            return this.setStatusAction(action);

        }

        if (action instanceof IsInHandAction) {

            return this.isInHandAction(action);

        }

        if (action instanceof AddChipsAction) {

            // This is just a pass-through notification; only update the chip count on a StackUpdateAction
            return;

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

        if (action instanceof MoveButtonAction) {

            return this.moveButtonAction(action);

        }

        if (action instanceof DealCardAction) {

            return this.dealCardAction(action);
        }

        if (action instanceof DealBoardAction) {

            return this.dealBoardAction(action);
        }

        if (action instanceof ClearBoardAction) {

            return this.clearBoardAction(action);
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

        if (action instanceof ClearHandAction) {

            return this.clearHandAction(action);

        }

        if (action instanceof FlipCardsAction) {

            return this.flipCardsAction(action);

        }

        if (action instanceof WinPotAction) {

            return this.winPotAction(action);

        }

        if (action instanceof BetReturnedAction) {

            return this.betReturnedAction(action);
        }

        this.log(`Heard ${action.constructor.name}`);

    }


    private log(message: string): void {

        // console.log('\x1b[32m%s\x1b[0m', `TableWatcher ${message}`);

    }


    private tableSnapshotAction(action: TableSnapshotAction): void {

        this.table = action.table;

    }


    private setGameAction(action: SetGameAction): void {

        // Looks up the rules for the game based on ID, rather than passing a game object through the pipes
        this.game = (new GameFactory()).create(action.gameID);

    }   // setGame


    private playerSeatedAction(action: PlayerSeatedAction): void {

        const seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            seat.player = action.player;

            // this.log(` ${action.player.name} sat in ${seat.getSeatName()}`);

        }

    }

    private seatVacatedAction(action: SeatVacatedAction): void {

        const seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            seat.player = null;

        }

    }


    private setStatusAction(action: SetStatusAction): void {

        const player: Player = this.findPlayer(action.userID);

        if (player) {

            player.isSittingOut = action.isSittingOut;

        }

    }  // setStatus


    private isInHandAction(action: IsInHandAction): void {

        this.log(`Seat ${action.seatIndex} isInHand = ${action.isInHand}`);
        let seat: Seat = this.findSeat(action.seatIndex);

        if (seat) {

            seat.isInHand = action.isInHand;
            this.log('Found seat');

        }
        else {
            this.log('Could not find seat');
        }



    }  // setPlayerActive



    private stackUpdateAction(action: StackUpdateAction): void {

        let player: Player = this.findPlayer(action.playerID);

        if (player) {

            player.chips = action.chips;
            this.log(`${player.name} has ${action.chips}`);

        }

    }  // updateStack


    private tableStateAction(action: TableStateAction): void {

        this.table.state = action.state;
        this.log(`TableState: ${action.state.constructor.name}`);

    }   // changeTableState


    private updateBetsAction(action: UpdateBetsAction): void {

        this.table.betStatus = action.betStatus;

    }  // updateBets


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


    private moveButtonAction(action: MoveButtonAction): void {

        this.table.buttonIndex = action.seatIndex;

    }  // moveButton


    private dealCardAction(action: DealCardAction): void {

        let seat = this.findSeat(action.seatIndex);

        seat.deal(action.card);

    }   // dealCard


    private dealBoardAction(action: DealBoardAction): void {

        for (let card of action.cards) {

            this.table.board.deal(card);

        }

    }   // dealBoard

    private clearBoardAction(action: ClearBoardAction): void {

        this.table.board.reset();

    }  // clearBoard


    private betTurnAction(action: BetTurnAction): void {

        this.table.betStatus = action.betStatus;

    }  // betTurn


    private anteTurnAction(action: AnteTurnAction): void {

    }  // anteTurn


    private isSeatEligibleToAnte(seat: Seat): boolean {

        return seat && seat.player && !seat.player.isSittingOut && seat.player.chips > 0;

    }



    private betAction(action: BetAction): void {

        // For now, we're not doing anything - we'll wait for the UpdateBetsAction

    }  // bet


    private flipCardsAction(action: FlipCardsAction): void {

        let seat = this.findSeat(action.seatIndex);

        seat.hand = action.hand;

    }  // flipCards


    private foldAction(action: FoldAction): void {

        this.findSeat(action.seatIndex).clearHand();

    }  // fold


    private clearHandAction(action: ClearHandAction): void {

        this.findSeat(action.seatIndex).clearHand();

    }  // clearHand



    private winPotAction(action: WinPotAction): void {

        // Nothing to do for this - it's mostly descriptive

    }  // winPot


    private betReturnedAction(action: BetReturnedAction): void {

        // Nothing to do for this - it's mostly descriptive

    }  // returnBet




}