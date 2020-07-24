import { TableObserver } from "../tables/table-observer";
import { Action } from "../../actions/action";
import { PlayerSeatedAction } from "../../actions/table/player-seated-action";
import { MoveButtonAction } from "../../actions/table/move-button-action";

export class TableWatcher implements TableObserver {

    notify(action: Action) : void {

        if (action instanceof PlayerSeatedAction) {

            return this.seatPlayer(action);

        }

        if (action instanceof MoveButtonAction) {

            return this.moveButton(action);
        }

    }


    private seatPlayer(action: PlayerSeatedAction): void {

        console.log(`${action.player.name} sits at Table ${action.tableID}, seat ${action.seatID}`);

    }

    private moveButton(action: MoveButtonAction): void {

        console.log(`Seat ${action.seatID} now has the button`);

    }


}