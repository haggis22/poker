import { LobbyCommand } from "./lobby-command";

export class JoinTableCommand extends LobbyCommand {


    public tableID: number;


    constructor(tableID: number) {

        super();

        this.tableID = tableID;

    }

}