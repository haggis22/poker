import { Table } from "./table";
import { Game } from "../../games/game";
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
import { AddChipsAction } from "../../actions/players/add-chips-action";
import { DealState } from "./states/deal-state";
import { DealtCard } from "../../hands/dealt-card";
import { DealCardAction } from "../../actions/game/deal-card-action";
import { Hand } from "../../hands/hand";
import { BetState } from "./states/betting/bet-state";
import { ShowdownState } from "./states/showdown-state";
import { HandCompleteState } from "./states/hand-complete-state";
import { BetTurn } from "./betting/bet-turn";
import { HandWinner } from "../../games/hand-winner";
import { BetTurnAction } from "../../actions/game/bet-turn-action";
import { FlipCardsAction } from "../../actions/game/flip-cards-action";
import { TableSnapshotAction } from "../../actions/table/table-snapshot-action";
import { ClearHandAction } from "../../actions/game/clear-hand-action";
import { AnteAction } from "../../actions/betting/ante-action";
import { UpdateBetsAction } from "../../actions/betting/update-bets-action";
import { WinPotAction } from "../../actions/game/win-pot-action";
import { IChipFormatter } from "../chips/chip-formatter";
import { MoneyFormatter } from "../chips/money-formatter";
import { StackUpdateAction } from "../../actions/players/stack-update-action";

export class TableManager implements ICommandHandler, ActionBroadcaster {

    private readonly DEBUG_ENABLED: boolean = false;
    private readonly ALL_ACCESS: number = -1;


    public table: Table;
    public game: Game;
    public observers: TableObserver[];

    private seatIndexInitiatingAction: number;
    private betTimer: ReturnType<typeof setTimeout>;


    constructor(table: Table, game: Game) {
        this.table = table;
        this.game = game;

        this.observers = new Array<TableObserver>();
    }


    public register(observer: TableObserver) {

        this.observers.push(observer);

        // Create a snapshot of the table situation, from the given player's perspective
        observer.notify(this.createTableSnapshot(observer.playerID));

    }   // register

    public unregister(observer: TableObserver) {

        this.observers = this.observers.filter(o => o != observer);

    }


    public broadcast(action: Action): void {

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


    private createTableSnapshot(playerID: number): TableSnapshotAction {

        let table: Table = new Table(this.table.id, this.table.rules, null);

        table.betTracker = this.table.betTracker;
        table.betTurn = this.table.betTurn;
        table.buttonIndex = this.table.buttonIndex;
        table.board = this.table.board;

        for (let s = 0; s < this.table.seats.length; s++) {

            table.seats[s].player = this.table.seats[s].player;

            let hand = null;

            if (this.table.seats[s].hand != null) {

                hand = new Hand();

                for (let card of this.table.seats[s].hand.cards) {

                    if (card.isFaceUp) {
                        hand.cards.push(card);
                    }
                    else if (this.table.seats[s].player.id == playerID) {
                        hand.cards.push(card);
                    }
                    else {
                        // they get a card with no value, face-down
                        hand.cards.push(new DealtCard(null, false));
                    }

                }

            }  // if the seat has a hand

            table.seats[s].hand = hand;

        }

        return new TableSnapshotAction(table.id, table);

    }  // createTableSnapshot


    private async seatPlayer(command: RequestSeatCommand): Promise<CommandResult> {

        let seatIndex = command.seatIndex;
        if (seatIndex === null) {

            for (let s = 0; s < this.table.seats.length; s++) {

                if (this.table.seats[s].player == null) {
                    seatIndex = s;
                    break;
                }

            }  // for each seat

        }  // no seat specified

        if (seatIndex === null) {

            return new CommandResult(false, 'No seats available');

        }

        let seat = seatIndex < this.table.seats.length ? this.table.seats[seatIndex] : null;

        if (seat) {

            if (seat.player == null) {

                seat.player = new Player(command.user.id, command.user.name)

                this.broadcast(new PlayerSeatedAction(this.table.id, seat.player, seatIndex));

                return new CommandResult(true, `${seat.player.name} sits at seat ${(seatIndex+1)}`);

            }

            return new CommandResult(false, `Seat ${(seatIndex+1)} is already taken`);

        }

        return new CommandResult(false, `Could not find seat ${seatIndex}`);

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

        return this.table.seats.filter(seat => seat.player && seat.player.isActive && (seat.player.chips + seat.player.chipsToAdd) > 0).length > 1;

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

        let chipFormatter: IChipFormatter = new MoneyFormatter();

        for (let seat of this.table.seats) {

            if (seat.player == null) {

                seat.isPlaying = false;
                seat.hand = null;

            }
            else {

                if (seat.player.chipsToAdd) {

                    // Add their chips "to-be-added" to their currents stack
                    seat.player.chips += seat.player.chipsToAdd;
                    this.broadcast(new AddChipsAction(this.table.id, seat.player.id, seat.player.chipsToAdd));

                    seat.player.chipsToAdd = 0;
                    this.broadcast(new StackUpdateAction(this.table.id, seat.player.id, seat.player.chips));

                }   // they have chips waiting to add

                if (seat.player.chips == 0) {

                    seat.player.isActive = false;

                    // TODO: Broadcast sitting out event

                }

            }

            this.broadcast(new ClearHandAction(this.table.id, seat.index));

        }

        for (let seat of this.table.seats) {

            if (seat.player) {

                console.log(`${seat.getName()}: ${chipFormatter.format(seat.player.chips)}${seat.player.isActive ? '' : ' [sitting out]'}`);

            }

        }


        this.table.deck.shuffle();

        this.table.betTracker.reset();

        this.table.betTracker.startBettingRound();
        this.broadcast(new UpdateBetsAction(this.table.id, this.table.betTracker));

        for (let seat of this.table.seats) {

            seat.isPlaying = false;

            if (seat.player != null && seat.player.isActive) {

                let ante = Math.min(seat.player.chips, 100);

                if (ante > 0) {

                    seat.player.chips -= ante;

                    this.table.betTracker.addBet(seat.index, ante);
                    this.broadcast(new AnteAction(this.table.id, seat.index, ante));
                    this.broadcast(new StackUpdateAction(this.table.id, seat.player.id, seat.player.chips));

                    this.broadcast(new UpdateBetsAction(this.table.id, this.table.betTracker));

                    seat.isPlaying = true;

                    seat.hand = new Hand();

                }  // player has enough to ante

            }   // seat has player

        }  // for each seat

        this.table.betTracker.gatherBets();
        this.broadcast(new UpdateBetsAction(this.table.id, this.table.betTracker));

        this.setButton();

        console.log('Clearing table.betTurn');
        this.table.betTurn = null;

        this.goToNextState();

    }   // startHand


    private setButton(): void {

        this.table.buttonIndex = this.findNextOccupiedSeatIndex(this.table.buttonIndex == null ? 0 : this.table.buttonIndex + 1);

        this.broadcast(new MoveButtonAction(this.table.id, this.table.buttonIndex));

    }

    private findNextOccupiedSeatIndex(seatIndex: number): number {

        let nextPosition: number = seatIndex;

        if (nextPosition >= this.table.seats.length) {
            nextPosition = 0;
        }

        while (this.table.seats[nextPosition].player == null || !this.table.seats[nextPosition].isPlaying) {

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
        let seatIndex: number = this.findNextOccupiedSeatIndex(this.table.buttonIndex + 1);

        let everyoneGotOne = false;

        while (!everyoneGotOne) {

            let card = this.table.deck.deal();
            let seat = this.table.seats[seatIndex];

            let dealtCard = new DealtCard(card, dealState.isFaceUp);

            this.table.seats[seatIndex].hand.deal(dealtCard);

            if (dealtCard.isFaceUp) {

                this.broadcast(new DealCardAction(this.table.id, seatIndex, card));

            }
            else {

                for (let observer of this.observers) {

                    if (this.hasAccess(observer, seat.player.id)) {

                        this.broadcast(new DealCardAction(this.table.id, seatIndex, card));

                    }
                    else {

                        this.broadcast(new DealCardAction(this.table.id, seatIndex, null));

                    }

                }

            }

            if (seatIndex == this.table.buttonIndex) {
                everyoneGotOne = true;
            }
            else {
                seatIndex = this.findNextOccupiedSeatIndex(seatIndex + 1);
            }

        }  // while !everyoneGotOne

        this.goToNextState();

    }   // dealRound


    private makeYourBets(betState: BetState): void {

        let firstSeatIndexToAct = this.findFirstToBet(betState.firstToBet);

        // remember who had first option to act so that we know when the betting turn is done.
        this.seatIndexInitiatingAction = firstSeatIndexToAct;

        this.setBetTurn(firstSeatIndexToAct);

    }   // makeYourBets


    private setBetTurn(seatIndexToAct: number): void {

        let betTurn = new BetTurn(seatIndexToAct, this.table.rules.timeToAct);

        this.table.betTurn = betTurn;

        this.broadcast(new BetTurnAction(this.table.id, betTurn));

        this.betTimer = setTimeout(() => { this.advanceBetTurn(); }, betTurn.timeToAct * 10);

    }  // setBetTurn


    private advanceBetTurn(): void {

        let nextSeatIndex = this.findNextOccupiedSeatIndex(this.table.betTurn.seatIndex + 1);

        if (nextSeatIndex == this.seatIndexInitiatingAction) {

            console.log('Betting complete');
            return this.goToNextState();

        }

        this.setBetTurn(nextSeatIndex);

    }   // advanceBetTurn


    private findFirstToBet(firstBetRule: number): number {

        switch (firstBetRule) {
        
            case BetState.FIRST_POSITION:
                {
                    return this.findNextOccupiedSeatIndex(this.table.buttonIndex + 1);
                }

            case BetState.BEST_HAND:
                {
                    let handWinners: Array<HandWinner> = this.findWinners();
                    return handWinners[0].seatIndex;
                }
        
        }

        throw new Error(`Do not know the rules for bet type ${firstBetRule}`);

    }   // findFirstToBet


    private findWinners(): Array<HandWinner> {

        let handWinners: Array<HandWinner> = new Array<HandWinner>();

        for (let seat of this.table.seats) {

            if (seat.isPlaying && seat.hand && seat.player) {

                // Put their best hand on the list
                handWinners.push(new HandWinner(this.game.handSelector.select(this.game.handEvaluator, seat.hand, this.table.board), seat.index, 0))

            }

        }

        // rank the hands, from best to worst
        handWinners.sort(function (w1, w2) {

            let compare = w1.evaluation.compareTo(w2.evaluation);

            if (compare > 0) {

                // The first hand is better, so keep it first in the list
                return -1;
            }

            if (compare < 0) {

                // the first hand is worse, so swap them
                return 1;
            }

            // They have the same value, so go with the earlier seat
            // TODO: depending on where the button is, then higher-numbered seats could be in earlier position than lower-numbered seats
            return 0;

        });

        return handWinners;

    }



    private showdown(showdownState: ShowdownState) {

        // Flip all the cards face-up
        for (let seat of this.table.seats) {

            if (seat.hand) {

                seat.hand.flipCards();

                this.broadcast(new FlipCardsAction(this.table.id, seat.index, seat.hand))

            }

        }

        let winners: HandWinner[] = this.findWinners();

        for (let winner of winners) {
            console.log(`TableManager: ${this.table.seats[winner.seatIndex].getName()} has ${this.game.handDescriber.describe(winner.evaluation)}`);
        }

        for (let pot of this.table.betTracker.pots) {

            let potWinningHand = null;
            let potWinnerSeatIndexes = new Set<number>();

            for (let winner of winners) {

                if (pot.seats.has(winner.seatIndex)) {

                    if (potWinningHand == null) {

                        potWinningHand = winner.evaluation;
                        potWinnerSeatIndexes.add(winner.seatIndex);

                    }
                    else if (winner.evaluation.compareTo(potWinningHand) >= 0) {

                        // Should never be *greater*, since we're going to descending order of hand strength
                        potWinnerSeatIndexes.add(winner.seatIndex);

                    }

                }

            }

            let equalShare: number = Math.floor(pot.amount / potWinnerSeatIndexes.size);
            let remainder = pot.amount - (potWinnerSeatIndexes.size * equalShare);

            for (let seatIndex of potWinnerSeatIndexes) {

                let winnerHand = winners.find(hw => hw.seatIndex == seatIndex);

                if (winnerHand) {

                    let player = this.table.seats[seatIndex].player;

                    if (player) {

                        this.broadcast(new WinPotAction(this.table.id, seatIndex, pot.index, winnerHand.evaluation, equalShare + remainder));

                        player.chips += (equalShare + remainder);

                        this.broadcast(new StackUpdateAction(this.table.id, player.id, player.chips));

                        remainder = 0;

                    }

                }

            }

        }  // for each Pot

        this.goToNextState();


    }   // showdown


    private completeHand(completeState: HandCompleteState) {

        // We're done with this hand - go to the next one

        // This will preserve the `this` reference in the call
        setTimeout(() => { this.goToNextState(); }, 1000);

    }   // completeHand


    private goToNextState(): void {

        this.changeTableState(this.game.stateMachine.nextState());

    }







}