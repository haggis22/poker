import { MessageHandler } from "../messages/message-handler";
import { CommandBroadcaster } from "../commands/command-broadcaster";
import { User } from "../players/user";
import { CommandHandler } from "../commands/command-handler";
import { Message } from "../messages/message";
import { ActionMessage } from "../messages/action-message";
import { Command } from "../commands/command";
import { IChipFormatter } from "./chips/chip-formatter";
import { Table } from "../casino/tables/table";
import { TableSnapshotAction } from "../actions/table/state/table-snapshot-action";
import { Action } from "../actions/action";
import { PlayerSeatedAction } from "../actions/table/players/player-seated-action";
import { Logger } from "../logging/logger";


const logger: Logger = new Logger();

export class TableUI implements MessageHandler, CommandBroadcaster {

    private user: User;

    private commandHandlers: CommandHandler[];

    private chipFormatter: IChipFormatter;

    private table: Table;


    constructor(user: User, chipFormatter: IChipFormatter) {

        this.user = user;
        this.chipFormatter = chipFormatter;

        this.commandHandlers = new Array<CommandHandler>();

        this.table = null;

    }


    handleMessage(publicMessage: Message, privateMessage?: Message): void {

        // By the time it gets here, there should never be a privateMessage

        if (publicMessage.text) {

            this.log(publicMessage.text);

        }

        let message: ActionMessage = publicMessage as ActionMessage;

        if (!message) {

            // Not an ActionMessage, so nothing further to do
            return;

        }

        let action: Action = message.action;

        if (this.table == null) {

            if (action instanceof TableSnapshotAction) {

                this.table = action.table;
                return;

            }

            // we don't have a table yet, so we can't do anything
            return;

        }


        if (action instanceof PlayerSeatedAction) {

            return this.seatPlayer(action);

        }

/*

        if (action instanceof MoveButtonAction) {

            return this.moveButton(action);
        }

        if (action instanceof SetHandAction) {

            return this.setHand(action);
        }

        if (action instanceof AddChipsAction) {

            return this.addChips(action);
        }

        if (action instanceof StackUpdateAction) {

            return this.updateStack(action);
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

        if (action instanceof AnteAction) {

            return this.ante(action);

        }

        if (action instanceof BetAction) {

            return this.bet(action);

        }

        if (action instanceof FoldAction) {

            return this.fold(action);

        }


        if (action instanceof UpdateBetsAction) {

            return this.updateBets(action);

        }

        if (action instanceof WinPotAction) {

            return this.winPot(action);

        }

        if (action instanceof BetReturnedAction) {

            return this.returnBet(action);
        }

*/

    }

    registerCommandHandler(handler: CommandHandler) {

        this.commandHandlers.push(handler);

    }

    unregisterCommandHandler(handler: CommandHandler) {

        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);

    }

    private broadcastCommand(command: Command) {

        for (let handler of this.commandHandlers) {

            handler.handleCommand(command);

        }

    }


    private seatPlayer(action: PlayerSeatedAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            this.log(`${action.player.name} sits at Table ${action.tableID}, seat ${(action.seatIndex + 1)}`);

        }

    }


    private log(message: string): void {

        logger.info(`${this.user.name}: ${message}`);

    }

}