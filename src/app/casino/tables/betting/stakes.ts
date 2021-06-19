import { Blind } from "./blind";

export class Stakes {

    public ante: number;
    public blinds: Blind[];
    public bets: number[];


    constructor(ante: number, blinds: Blind[], bets: number[]) {
        this.ante = ante;
        this.blinds = [...blinds];
        this.bets = [...bets];
    }

}