import { TableCommand } from "./table-command";

export class SetStatusCommand extends TableCommand {

    public isSittingOut: boolean;


    constructor(tableID: number, isSittingOut: boolean) {

        super(tableID);

        this.isSittingOut = isSittingOut;

    }

}