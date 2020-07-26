import { TableObserver } from "../tables/table-observer";
import { Action } from "../../actions/action";
import { PlayerSeatedAction } from "../../actions/table/player-seated-action";
import { MoveButtonAction } from "../../actions/table/move-button-action";
import { AddChipsAction } from "../../actions/table/add-chips-action";
import { Player } from "../../players/player";
import { IChipFormatter } from "../chips/chip-formatter";
import { DealtCard } from "../../hands/dealt-card";
import { DealCardAction } from "../../actions/game/deal-card-action";
import { Seat } from "../tables/seat";
import { Table } from "../tables/table";
import { BetTurnAction } from "../../actions/game/bet-turn-action";
import { FlipCardsAction } from "../../actions/game/flip-cards-action";
import { TableSnapshotAction } from "../../actions/table/table-snapshot-action";
import { ClearHandAction } from "../../actions/game/clear-hand-action";
import { Hand } from "../../hands/hand";

export class TableWatcher implements TableObserver {


    public playerID: number;

    private chipFormatter: IChipFormatter;

    private tableID: number;
    private table: Table;

    // Maps playerID to Player object
    private playerMap: Map<number, Player>;


    constructor(tableID: number, playerID: number, chipFormatter: IChipFormatter) {

        this.tableID = tableID;
        this.table = null;

        this.playerID = playerID;
        this.chipFormatter = chipFormatter;

        this.playerMap = new Map<number, Player>();

    }


    notify(action: Action): void {

        if (action instanceof TableSnapshotAction) {

            return this.grabTableData(action);

        }

        if (action instanceof PlayerSeatedAction) {

            return this.seatPlayer(action);

        }

        if (action instanceof MoveButtonAction) {

            return this.moveButton(action);
        }

        if (action instanceof ClearHandAction) {

            return this.clearHand(action);
        }

        if (action instanceof AddChipsAction) {

            return this.addChips(action);
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

        if (this.table.id == action.tableID) {

            let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

            if (seat) {

                seat.player = action.player;
                this.playerMap.set(action.player.id, action.player);
                console.log(`${action.player.name} sits at Table ${action.tableID}, seat ${(action.seatIndex+1)}`);


            }

        }

    }

    private moveButton(action: MoveButtonAction): void {

        if (action.tableID === this.table.id) {

            console.log(`Seat ${(action.seatIndex+1)} now has the button at table ${this.table.id}`);

        }

    }


    private clearHand(action: ClearHandAction): void {

        if (action.tableID === this.table.id) {

            let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

            if (seat) {

                seat.hand = new Hand();

            }

        }

    }  // clearHand


    private addChips(action: AddChipsAction): void {

        if (action.tableID === this.table.id) {

            let player = this.findPlayer(action.playerID);

            if (player) {

                player.chips += action.amount;
                console.log(`${player.name} adds ${this.chipFormatter.format(action.amount)} in chips`);

            }

        }

    }  // addChips


    private dealCard(action: DealCardAction): void {

        if (action.tableID == this.table.id) {

            let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

            if (seat) {

                let dealtCard = new DealtCard(action.card, action.card != null);
                seat.hand.deal(dealtCard);

                let recipient = seat.player ? seat.player.name : `Seat ${(action.seatIndex+1)}`;

                if (dealtCard.isFaceUp) {

                    console.log(`Client: ${recipient} is dealt ${action.card.value.symbol}${action.card.suit.symbol}`);

                }
                else {

                    console.log(`Client: ${recipient} is dealt a card`);

                }

            }

        }  // if table.id

    }   // dealCard


    private betTurn(action: BetTurnAction): void {

        if (action.tableID == this.table.id) {

            let seat = this.table.seats[action.turn.seatIndex];

            if (seat) {

                console.log(`It is ${seat.getName()}'s turn to act`);

            }
            else {

                throw new Error(`Seat index out of range: ${action.turn.seatIndex}`);

            }

        }  // if table.id

    }  // betTurn


    private flipCards(action: FlipCardsAction): void {

        if (action.tableID == this.table.id) {

            let seat = action.seatIndex < this.table.seats.length ? this.table.seats[action.seatIndex] : null;

            if (seat) {

                if (seat.hand && seat.hand.cards && seat.hand.cards.length) {

                    let name = seat.player ? seat.player.name : `Seat ${(action.seatIndex+1)}`;
                    seat.hand = action.hand;

                    console.log(`${name} has ${seat.hand.cards.join(" ")}`);

                }

            }
            else {

                throw new Error(`Could not find seat ${action.seatIndex}`);

            }

        }  // if table.id

    }  // betTurn



}