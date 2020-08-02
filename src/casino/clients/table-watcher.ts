import { TableObserver } from "../tables/table-observer";
import { Action } from "../../actions/action";
import { PlayerSeatedAction } from "../../actions/table/player-seated-action";
import { MoveButtonAction } from "../../actions/table/move-button-action";
import { AddChipsAction } from "../../actions/players/add-chips-action";
import { Player } from "../../players/player";
import { IChipFormatter } from "../chips/chip-formatter";
import { DealtCard } from "../../hands/dealt-card";
import { DealCardAction } from "../../actions/game/deal-card-action";
import { Seat } from "../tables/seat";
import { Table } from "../tables/table";
import { BetTurnAction } from "../../actions/game/bet-turn-action";
import { FlipCardsAction } from "../../actions/game/flip-cards-action";
import { TableSnapshotAction } from "../../actions/table/table-snapshot-action";
import { SetHandAction } from "../../actions/game/set-hand-action";
import { Hand } from "../../hands/hand";
import { AnteAction } from "../../actions/betting/ante-action";
import { UpdateBetsAction } from "../../actions/betting/update-bets-action";
import { WinPotAction } from "../../actions/game/win-pot-action";
import { HandDescriber } from "../../games/hand-describer";
import { PokerHandDescriber } from "../../games/poker/poker-hand-describer";
import { StackUpdateAction } from "../../actions/players/stack-update-action";
import { BetCommand } from "../../commands/table/bet-command";
import { CommandHandler } from "../../commands/command-handler";
import { BetTracker } from "../tables/betting/bet-tracker";
import { BetAction } from "../../actions/betting/bet-action";
import { Bet } from "../tables/betting/bet";

export class TableWatcher implements TableObserver {


    public playerID: number;

    private commandHandler: CommandHandler;

    private chipFormatter: IChipFormatter;

    private tableID: number;
    private table: Table;

    // Maps playerID to Player object
    private playerMap: Map<number, Player>;


    constructor(commandHandler: CommandHandler, tableID: number, playerID: number, chipFormatter: IChipFormatter) {

        this.commandHandler = commandHandler;

        this.tableID = tableID;
        this.table = null;

        this.playerID = playerID;
        this.chipFormatter = chipFormatter;

        this.playerMap = new Map<number, Player>();

    }


    notify(action: Action): void {

        if (this.tableID != action.tableID) {

            // Not my table - I don't care
            return;

        }

        if (action instanceof TableSnapshotAction) {

            return this.grabTableData(action);

        }

        if (action instanceof PlayerSeatedAction) {

            return this.seatPlayer(action);

        }

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

        if (action instanceof UpdateBetsAction) {

            return this.updateBets(action);

        }

        if (action instanceof WinPotAction) {

            return this.winPot(action);

        }

    }


    private findPlayer(playerID: number): Player {

        for (let seat of this.table.seats) {

            if (seat.player && seat.player.id == playerID) {

                return seat.player;

            }

        }

        return null;

    }


    private grabTableData(action: TableSnapshotAction): void {

        this.table = action.table;

    }


    private seatPlayer(action: PlayerSeatedAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            seat.player = new Player(action.player.id, action.player.name);
            Object.assign(seat.player, action.player);

            this.playerMap.set(action.player.id, seat.player);
            console.log(`${action.player.name} sits at Table ${action.tableID}, seat ${(action.seatIndex+1)}`);


        }

    }

    private moveButton(action: MoveButtonAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            console.log(`${seat.getName()} now has the button at table ${this.table.id}`);

        }
        else {

            console.log(`Could not find seat ${action.seatIndex}`);
        }

    }


    private setHand(action: SetHandAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            // If the seat has a hand, create a blank hand and copy the values over from the action
            seat.hand = action.hasHand ? new Hand() : null;

        }

    }  // setHand


    private addChips(action: AddChipsAction): void {

        let player = this.findPlayer(action.playerID);

        if (player) {

            player.chips += action.amount;
            console.log(`${player.name} adds ${this.chipFormatter.format(action.amount)} in chips - now has ${this.chipFormatter.format(player.chips)}`);

        }

    }  // addChips


    private updateStack(action: StackUpdateAction): void {

        let player = this.findPlayer(action.playerID);

        if (player) {

            player.chips = action.chips;
            console.log(`${player.name} has ${this.chipFormatter.format(action.chips)}`);

        }

    }  // updateStack


    private dealCard(action: DealCardAction): void {

        let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

        if (seat) {

            let dealtCard = new DealtCard(action.card, action.card != null);
            seat.hand.deal(dealtCard);

            if (dealtCard.isFaceUp) {

                console.log(`Client: ${seat.getName()} is dealt ${action.card.value.symbol}${action.card.suit.symbol}`);

            }
            else {

                console.log(`Client: ${seat.getName()} is dealt a card`);

            }

/*
            if (seat.index == 0) {
                console.log(`DEBUGGGGG: got DealCardAction: ${action}`);
                console.log(`${seat.getName()} has ${seat.hand.cards.join(" ")}`);
            }
*/


        }

    }   // dealCard


    private betTurn(action: BetTurnAction): void {

        let seat = this.table.seats[action.bets.seatIndex];

        if (seat) {

            console.log(`It is ${seat.getName()}'s turn to act`);

            if (seat.hand && seat.player) {

                console.log(`${seat.getName()} is thinking`);

                let tracker: BetTracker = action.bets;

                if (tracker.currentBet > 0) {

                    // This represents a call (possibly all-in)
                    let betAmount: number = Math.min(tracker.currentBet, seat.player.chips);
                    let betCommand: BetCommand = new BetCommand(this.table.id, seat.player.id, betAmount);

                    this.commandHandler.handleCommand(betCommand);

                }
                else {

                    // This represents a bet out (or a check, if the player has no chips)
                    let betAmount: number = Math.min(tracker.minRaise, seat.player.chips);
                    let betCommand: BetCommand = new BetCommand(this.table.id, seat.player.id, betAmount);

                    this.commandHandler.handleCommand(betCommand);

                }

            }   // seat has a player
            else {

                console.log(`${seat.getName()} is MIA`);

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

                console.log(`${seat.getName()} has ${seat.hand.cards.join(" ")}`);

            }

        }
        else {

            throw new Error(`Could not find seat ${action.seatIndex}`);

        }

    }  // betTurn


    private ante(action: AnteAction): void {

        let seat = this.table.seats[action.seatIndex];

        if (seat) {

            console.log(`${seat.getName()} antes ${this.chipFormatter.format(action.ante.chipsAdded)}`);

        }
        else {

            throw new Error(`Ante: Seat index out of range: ${action.seatIndex}`);

        }

    }  // ante


    private bet(action: BetAction): void {

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

            console.log(message);

        }
        else {

            throw new Error(`Bet: Seat index out of range: ${action.seatIndex}`);

        }

    }  // bet


    private updateBets(action: UpdateBetsAction): void {

        this.table.betTracker = action.betTracker;

        for (let pot of this.table.betTracker.pots) {

            console.log(`Pot ${(pot.index + 1)}: ${this.chipFormatter.format(pot.amount)} - ${pot.seats.size} player${pot.seats.size == 1 ? '' : 's'}`);

        }

    }  // updateBets


    private winPot(action: WinPotAction): void {

        let seat = this.table.seats[action.seatIndex];

        if (seat) {

            let describer: HandDescriber = new PokerHandDescriber();

            let potDescription = action.potIndex > 0 ? `side pot #${action.potIndex}` : `the main pot`;

            if (seat.player) {

                console.log(`${seat.getName()} wins ${this.chipFormatter.format(action.amount)} from ${potDescription} with ${describer.describe(action.handEvaluation)}`);

            }
            else {
                console.log(`${seat.getName()} wins ${this.chipFormatter.format(action.amount)} from ${potDescription} with ${describer.describe(action.handEvaluation)}, but the player is gone`);

            }

        }
        else {

            throw new Error(`WinPot: Seat index out of range: ${action.seatIndex}`);

        }

    }  // winPot




}