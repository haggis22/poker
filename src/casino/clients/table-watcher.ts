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

export class TableWatcher implements TableObserver {


    public playerID: number;

    private chipFormatter: IChipFormatter;

    private table: Table;

    // Maps playerID to Player object
    private playerMap: Map<number, Player>;


    constructor(table: Table, playerID: number, chipFormatter: IChipFormatter) {

        this.table = table;
        this.playerID = playerID;
        this.chipFormatter = chipFormatter;

        this.playerMap = new Map<number, Player>();

    }


    notify(action: Action): void {

        if (action instanceof PlayerSeatedAction) {

            return this.seatPlayer(action);

        }

        if (action instanceof MoveButtonAction) {

            return this.moveButton(action);
        }

        if (action instanceof AddChipsAction) {

            return this.addChips(action);
        }

        if (action instanceof DealCardAction) {

            return this.dealCard(action);
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


    private seatPlayer(action: PlayerSeatedAction): void {

        if (this.table.id == action.tableID) {

            let seat = this.table.seats.find(s => s.id == action.seatID);

            if (seat) {

                seat.player = action.player;
                this.playerMap.set(action.player.id, action.player);
                console.log(`${action.player.name} sits at Table ${action.tableID}, seat ${action.seatID}`);


            }

        }

    }

    private moveButton(action: MoveButtonAction): void {

        if (action.tableID === this.table.id) {

            console.log(`Seat ${action.seatID} now has the button at table ${this.table.id}`);

        }

    }

    private addChips(action: AddChipsAction): void {

        if (action.tableID === this.table.id) {

            let player = this.findPlayer(action.playerID);

            if (player) {

                player.chips += action.amount;
                console.log(`${player.name} adds ${this.chipFormatter.format(action.amount)} in chips`);

            }

        }



    }


    private dealCard(action: DealCardAction): void {

        if (action.tableID == this.table.id) {

            let seat = this.table.seats.find(s => action.seatID == s.id);

            if (seat) {

                let dealtCard = new DealtCard(action.card, action.card != null);
                seat.hand.deal(dealtCard);

                let recipient = seat.player ? seat.player.name : `Seat ${seat.id}`;

                if (dealtCard.isFaceUp) {

                    console.log(`${recipient} is dealt ${action.card.value.symbol}${action.card.suit.symbol}`);

                }
                else {

                    console.log(`${recipient} is dealt a card`);

                }

            }

        }  // if table.id

    }


}