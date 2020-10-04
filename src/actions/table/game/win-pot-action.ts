import { TableAction } from "../table-action";
import { WonPot } from "../../../casino/tables/betting/won-pot";

export class WinPotAction extends TableAction {

    public pot: WonPot;

    constructor(tableID: number, pot: WonPot) {

        super(tableID);

        this.pot = pot;

    }

}