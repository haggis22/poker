import { Ante } from "./ante";
import { Blind } from "./blind";

export class ForcedBets {


    public seatIndex: number;
    public bets: Array<Ante | Blind>;


    constructor(seatIndex: number, bets: Array<Ante | Blind>) {

        this.seatIndex = seatIndex;
        this.bets = [...bets];

    }

}