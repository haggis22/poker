import { Pot } from "../../casino/tables/pot";

export class UpdatePotsAction {

    public tableID: number;
    public pots: Pot[];

    constructor(tableID: number, pots: Pot[]) {

        this.tableID = tableID;
        this.pots = pots;

    }

}