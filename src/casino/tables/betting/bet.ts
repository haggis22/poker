export class Bet {


    public totalBet: number;
    public chipsAdded: number;
    public isAllIn: boolean;

    constructor(totalBet: number, chipsAdded: number, isAllIn: boolean) {

        this.totalBet = totalBet;
        this.chipsAdded = chipsAdded;
        this.isAllIn = isAllIn;

    }


}