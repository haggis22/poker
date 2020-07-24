import { Table } from "./table";
import { Game } from "../../games/game";
import { IChipFormatter } from "../chips/chip-formatter";
import { ICommandHandler } from "../../commands/command-handler";
import { ICommand } from "../../commands/command";
import { CommandResult } from "../../commands/command-result";
import { RequestSeatCommand } from "../../commands/table/request-seat-command";
import { Player } from "../../players/player";
import { AddChipsCommand } from "../../commands/table/add-chips-command";
import { StartGameCommand } from "../../commands/table/start-game-command";
import { OpenState } from "./states/open-state";
import { StartHandState } from "./states/start-hand-state";

export class TableManager implements ICommandHandler {

    private readonly DEBUG_ENABLED: boolean = false;

    public table: Table;
    public game: Game;
    public chipFormatter: IChipFormatter;


    constructor(table: Table, game: Game, chipFormatter: IChipFormatter) {
        this.table = table;
        this.game = game;
        this.chipFormatter = chipFormatter;
    }


    async handleCommand(command: ICommand): Promise<CommandResult> {

        if (this.DEBUG_ENABLED) { console.log(`TableManager received ${command.constructor.name}`); }

        if (command instanceof RequestSeatCommand) {

            return this.seatPlayer(command);

        }

        if (command instanceof AddChipsCommand) {

            return this.addChips(command);

        }

        if (command instanceof StartGameCommand) {

            return this.startGame(command);

        }

        throw new Error("Method not implemented.");
    }


    private async seatPlayer(command: RequestSeatCommand): Promise<CommandResult> {

        let seatID = command.seatID;
        if (seatID === null) {

            for (let s = 0; s < this.table.numSeats; s++) {

                if (this.table.players[s] == null) {

                    seatID = s;
                    break;

                }

            }

        }

        if (seatID === null) {

            return new CommandResult(false, 'No seats available');

        }

        if (this.table.players[seatID] == null) {

            let player = new Player(command.user.id, command.user.name);
            this.table.players[seatID] = player;
            return new CommandResult(true, `${player.name} sits at seat ${seatID}`);

        }

        return new CommandResult(false, `Seat ${seatID} is already taken`);

    }



    private async addChips(command: AddChipsCommand): Promise<CommandResult> {

        let player = this.table.players.find(p => p && p.id == command.playerID);

        if (!player) {
            return new CommandResult(false, 'Player is not sitting at table');
        }

        if (this.table.state.isHandInProgress()) {

            // we can't add the chips right now, but they will be added before the next hand
            player.chipsToAdd += command.amount;
            return new CommandResult(true, `${player.name} has bought in for ${this.chipFormatter.format(command.amount)} on the next hand`);

        }

        player.chips += command.amount;
        return new CommandResult(true, `${player.name} has added ${this.chipFormatter.format(command.amount)} in chips`);

    }  // addChips


    private async startGame(command: StartGameCommand): Promise<CommandResult> {

        if (this.table.state instanceof OpenState) {

            this.changeTableState(this.game.stateMachine.nextState());
            return new CommandResult(true, "Started game");

        }

        return new CommandResult(false, "Game is already in progress");

    }  // addChips


    private changeTableState(state) : void {

        this.table.state = state;
        console.log(`TableState: ${state.constructor.name}`);

        if (state instanceof StartHandState) {

            this.startHand();

        }


    }


    private startHand() {

        for (let player of this.table.players) {

            if (player != null) {

                // Add their chips "to-be-added" to their currents stack
                player.chips += player.chipsToAdd;
                player.chipsToAdd = 0;

            }

        }

        this.table.deck.shuffle();

        this.setButton();

        this.table.pots.length = 0;

        // OK - jump straight to the next state
        this.changeTableState(this.game.stateMachine.nextState());

    }   // startHand


    private setButton(): void {

        this.table.button = this.findNextOccupiedSeat(this.table.button == null ? 0 : this.table.button + 1);
        let dealer = this.table.getDealer();
        if (dealer) {
            console.log(`${dealer.name} has the button`);
        }

    }

    private findNextOccupiedSeat(position: number): number {

        let nextPosition: number = position;

        if (nextPosition > this.table.numSeats) {
            nextPosition = 0;
        }

        while (this.table.players[nextPosition] == null) {

            nextPosition++;

            if (nextPosition > this.table.numSeats) {
                nextPosition = 0;
            }

            if (nextPosition == position) {
                throw new Error("Could not find the next player");
            }

        }

        return nextPosition;

    }






}