import { LobbyCommand } from "./lobby-command";

export class JoinTableCommand extends LobbyCommand {

    tableID: number;


    constructor(tableID: number) {

        super();

        this.tableID = tableID;

    }

}