export class AddChipsCommand {

    public tableID: number;
    public playerID: number;
    public amount: number;


    constructor(tableID: number, playerID: number, amount: number) {
        this.tableID = tableID;
        this.playerID = playerID;
        this.amount = amount;
    }


}