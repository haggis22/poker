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
import { TableConnectedAction } from "../actions/table/state/table-connected-action";
import { TableSnapshotCommand } from "../commands/table/table-snapshot-command";
import { RequestSeatCommand } from "../commands/table/request-seat-command";
import { AddChipsCommand } from "../commands/table/add-chips-command";
import { AddChipsAction, Player, StackUpdateAction, TableStateAction, StartHandState, AnteAction, BetAction, UpdateBetsAction } from "../communication/serializable";


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


    handleMessage(message: Message): void {

        if (message.text) {

            this.log(message.text);

        }

        let actionMessage: ActionMessage = message as ActionMessage;

        if (!actionMessage) {

            // Not an ActionMessage, so nothing further to do
            return;

        }

        let action: Action = actionMessage.action;

        this.log(`Heard ${action.constructor.name}`);


        if (action instanceof TableConnectedAction) {

            // we are connected, so request a snapshot of the table for this user
            this.broadcastCommand(new TableSnapshotCommand(action.tableID, this.user.id))
            return;

        }

        if (this.table == null) {

            if (action instanceof TableSnapshotAction) {

                this.table = action.table;

                // request a seat at the table - the null parameter means any seat will do
                this.broadcastCommand(new RequestSeatCommand(this.table.id, this.user, null));

                return;

            }

            // we don't have a table yet, so we can't do anything else
            return;

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

        if (action instanceof AnteAction) {

            return this.ante(action);

        }

        if (action instanceof UpdateBetsAction) {

            return this.updateBets(action);

        }




/*
        if (action instanceof BetAction) {

//          return this.bet(action);

        }


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

    registerCommandHandler(handler: CommandHandler) {

        this.commandHandlers.push(handler);

    }

    unregisterCommandHandler(handler: CommandHandler) {

        this.commandHandlers = this.commandHandlers.filter(ch => ch !== handler);

    }

    private broadcastCommand(command: Command) {

        this.log(`Sent ${command.constructor.name}`);

        for (let handler of this.commandHandlers) {

            handler.handleCommand(command);

        }

    }


    private calculateBuyIn(): number {

        switch (this.user.name) {

            case 'Danny':
                return 700;

            case 'Mark':
                return 500;

            case 'Paul':
                return 600;

            case 'Joe':
                return 400;

        }

        return 0;

    }


    private seatPlayer(action: PlayerSeatedAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            this.log(`${action.player.name} sits at Table ${action.tableID}, seat ${(action.seatIndex + 1)}`);
            this.log(`Players: [ ${this.table.seats.filter(s => s.player).map(s => s.player.name).join(" ")} ]`);

            if (seat.player.userID === this.user.id) {

                let chips = Math.min(this.user.chips, this.calculateBuyIn());

                // this.log(`I have a seat, so I am requesting ${this.chipFormatter.format(chips)} in chips`);

                this.broadcastCommand(new AddChipsCommand(this.table.id, this.user.id, chips));

            }

        }

    }  // seatPlayer


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

        // For now, only log from Danny's POV
        if (this.user.id === 1) {
            console.log(`${this.user.name}: ${message}`);
        }

        //logger.info();

    }


    private changeTableState(): void {

        let state = this.table.state;

        if (state instanceof StartHandState) {

            return this.startHand();

        }

    }  // changeTableState



    private startHand(): void {

        for (let seat of this.table.seats) {

            if (seat.player) {

                this.log(`${seat.getName()}: ${seat.player.name}: ${this.chipFormatter.format(seat.player.chips)}${seat.player.isActive ? '' : ' [sitting out]'}`);

            }

        }

    }   // startHand

    private ante(action: AnteAction): void {

        let seat = this.table.seats[action.seatIndex];
        
        if (seat) {
        
            let message = `${seat.getName()} antes ${this.chipFormatter.format(action.ante.chipsAdded)}`;
        
            if (action.ante.isAllIn) {
                message += ' and is all-in';
            }
        
            this.log(message);
        
        }
        else {
        
            throw new Error(`Ante: Seat index out of range: ${action.seatIndex}`);
        
        }

    }  // ante

    private updateBets(action: UpdateBetsAction): void {

        for (let pot of this.table.betTracker.pots) {
        
            let potDesc = `${pot.getName()}: ${this.chipFormatter.format(pot.amount)} - ${pot.getNumPlayers()} player${pot.getNumPlayers() === 1 ? '' : 's'}: `;
            potDesc += pot.getSeatsInPot().map(seatIndex => this.table.seats[seatIndex].getName()).join(", ");
            this.log(potDesc);
        
        }
        
    }  // updateBets




}