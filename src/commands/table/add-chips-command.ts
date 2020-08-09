﻿import { Command } from "../command";

export class AddChipsCommand implements Command {

    public tableID: number;
    public userID: number;
    public amount: number;


    constructor(tableID: number, userID: number, amount: number) {
        this.tableID = tableID;
        this.userID = userID;
        this.amount = amount;
    }


}