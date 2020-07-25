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
import { TableObserver } from "./table-observer";
import { ActionBroadcaster } from "../../actions/action-broadcaster";
import { Action } from "../../actions/action";
import { PlayerSeatedAction } from "../../actions/table/player-seated-action";
import { MoveButtonAction } from "../../actions/table/move-button-action";
import { AddChipsAction } from "../../actions/table/add-chips-action";
import { DealState } from "./states/deal-state";
import { DealtCard } from "../../hands/dealt-card";
import { DealCardAction } from "../../actions/game/deal-card-action";
import { Hand } from "../../hands/hand";
import { BetState } from "./states/betting/bet-state";
import { ShowdownState } from "./states/showdown-state";
import { HandCompleteState } from "./states/hand-complete-state";

export class TableManager implements ICommandHandler, ActionBroadcaster {

    private readonly DEBUG_ENABLED: boolean = false;
    private readonly ALL_ACCESS: number = -1;


    public table: Table;
    public game: Game;
    public observers: TableObserver[];


    constructor(table: Table, game: Game) {
        this.table = table;
        this.game = game;

        this.observers = new Array<TableObserver>();
    }


    public register(observer: TableObserver) {

        this.observers.push(observer);

    }

    public unregister(observer: TableObserver) {

        this.observers = this.observers.filter(o => o != observer);

    }


    private broadcast(action: Action): void {

        for (let observer of this.observers) {

            observer.notify(action);

        }

    }   // broadcast


    private hasAccess(observer: TableObserver, playerID: number) {

        return observer.playerID === this.ALL_ACCESS || observer.playerID === playerID;

    }


    public async handleCommand(command: ICommand): Promise<CommandResult> {

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

            for (let seat of this.table.seats) {

                if (seat.player == null) {
                    seatID = seat.id;
                    break;
                }

            }  // for each seat

        }  // no seat specified

        if (seatID === null) {

            return new CommandResult(false, 'No seats available');

        }

        let seat = this.table.seats.find(s => s.id === seatID);

        if (seat) {

            if (seat.player == null) {

                seat.player = new Player(command.user.id, command.user.name)

                this.broadcast(new PlayerSeatedAction(this.table.id, seat.player, seatID));

                return new CommandResult(true, `${seat.player.name} sits at seat ${seatID}`);

            }

            return new CommandResult(false, `Seat ${seatID} is already taken`);

        }

        return new CommandResult(false, `Could not find seat ${seatID}`);

    }

    private findPlayer(playerID: number): Player {

        for (let s of this.table.seats) {

            if (s.player && s.player.id == playerID) {

                return s.player;

            }

        }

        return null;

    }   // findPlayer



    private async addChips(command: AddChipsCommand): Promise<CommandResult> {

        let player: Player = this.findPlayer(command.playerID);

        if (!player) {
            return new CommandResult(false, 'Player is not sitting at table');
        }

        if (this.table.state.isHandInProgress()) {

            // we can't add the chips right now, but they will be added before the next hand
            player.chipsToAdd += command.amount;
            return new CommandResult(true, `${player.name} has bought in for ${command.amount} on the next hand`);

        }

        player.chips += command.amount;
        this.broadcast(new AddChipsAction(this.table.id, player.id, command.amount));

        return new CommandResult(true, `${player.name} has added ${command.amount} in chips`);

    }  // addChips


    private async startGame(command: StartGameCommand): Promise<CommandResult> {

        if (this.table.state instanceof OpenState) {

            this.goToNextState();
            return new CommandResult(true, "Started game");

        }

        return new CommandResult(false, "Game is already in progress");

    }  // addChips


    private isReadyForHand(): boolean {

        return false;

    }


    private changeTableState(state) : void {

        if (state == null) {


            if (this.isReadyForHand()) {

                // start the next hand
                return this.goToNextState();

            }
            else {

                console.log('Table not ready - putting into open state');
                this.table.state = new OpenState();
                return;

            }

        }

        this.table.state = state;


        console.log(`debug TableState: ${state.constructor.name}`);

        if (state instanceof StartHandState) {

            return this.startHand();

        }

        if (state instanceof DealState) {

            return this.dealRound(state);

        }

        if (state instanceof BetState) {

            return this.makeYourBets(state);

        }

        if (state instanceof ShowdownState) {

            return this.showdown(state);
        }

        if (state instanceof HandCompleteState) {

            return this.completeHand(state);
        }


    }


    private startHand() {

        for (let seat of this.table.seats) {

            if (seat.player != null && seat.player.chipsToAdd) {

                // Add their chips "to-be-added" to their currents stack
                seat.player.chips += seat.player.chipsToAdd;
                this.broadcast(new AddChipsAction(this.table.id, seat.player.id, seat.player.chipsToAdd));
                seat.player.chipsToAdd = 0;

            }   // they have chips waiting to add

            // take their cards, if they have any
            seat.hand = new Hand();

        }

        this.table.deck.shuffle();

        this.setButton();

        this.table.pots.length = 0;

        this.goToNextState();

    }   // startHand


    private setButton(): void {

        this.table.buttonIndex = this.findNextOccupiedSeat(this.table.buttonIndex == null ? 0 : this.table.buttonIndex + 1);

        this.broadcast(new MoveButtonAction(this.table.id, this.table.seats[this.table.buttonIndex].id));

    }

    private findNextOccupiedSeat(seatIndex: number): number {

        let nextPosition: number = seatIndex;

        if (nextPosition >= this.table.seats.length) {
            nextPosition = 0;
        }

        while (this.table.seats[nextPosition].player == null) {

            nextPosition++;

            if (nextPosition >= this.table.seats.length) {
                nextPosition = 0;
            }

            if (nextPosition == seatIndex) {
                throw new Error("Could not find the next player");
            }

        }

        return nextPosition;

    }   // findNextOccupiedSeat


    private dealRound(dealState: DealState) {

        // give everyone a card
        let seatIndex: number = this.findNextOccupiedSeat(this.table.buttonIndex + 1);

        let everyoneGotOne = false;

        while (!everyoneGotOne) {

            let card = this.table.deck.deal();
            let seat = this.table.seats[seatIndex];

            let dealtCard = new DealtCard(card, dealState.isFaceUp);

            this.table.seats[seatIndex].hand.deal(dealtCard);

            if (dealtCard.isFaceUp) {

                this.broadcast(new DealCardAction(this.table.id, seat.id, card));

            }
            else {

                for (let observer of this.observers) {

                    if (this.hasAccess(observer, seat.player.id)) {

                        this.broadcast(new DealCardAction(this.table.id, seat.id, card));

                    }
                    else {

                        this.broadcast(new DealCardAction(this.table.id, seat.id, null));

                    }

                }

            }

            if (seatIndex == this.table.buttonIndex) {
                everyoneGotOne = true;
            }
            else {
                seatIndex = this.findNextOccupiedSeat(seatIndex + 1);
            }

        }  // while !everyoneGotOne

        this.goToNextState();

    }   // dealRound


    private makeYourBets(betState: BetState) {

        this.goToNextState();

    }   // makeYourBets


    private showdown(showdownState: ShowdownState) {

        this.goToNextState();

    }   // showdown


    private completeHand(completeState: HandCompleteState) {

        // We're done with this hand
        this.goToNextState();

    }   // completeHand


    private goToNextState(): void {

        this.changeTableState(this.game.stateMachine.nextState());

    }







}