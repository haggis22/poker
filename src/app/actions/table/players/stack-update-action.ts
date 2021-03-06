import { TableAction } from "../table-action";

export class StackUpdateAction extends TableAction {

    public playerID: number;
    public chips: number;


    constructor(tableID: number, playerID: number, chips: number) {

        super(tableID);

        this.playerID = playerID;
        this.chips = chips;

    }

}