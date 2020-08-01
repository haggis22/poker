export class Bet {


    public isValid: boolean;
    public totalBet: number;
    public chipsAdded: number;
    public isAllIn: boolean;
    public message: string;

    constructor(isValid: boolean, totalBet: number, chipsAdded: number, isAllIn: boolean, message: string) {

        this.isValid = isValid;
        this.totalBet = totalBet;
        this.chipsAdded = chipsAdded;
        this.isAllIn = isAllIn;
        this.message = message;

    }


    public toString(): string {

        return JSON.stringify(this);

    }


}