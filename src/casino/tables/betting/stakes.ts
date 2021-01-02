import { Blind } from "./blind";

export class Stakes {

    public static readonly LIMIT: number = 1;
    public static readonly NO_LIMIT: number = 2;

    public ante: number;
    public blinds: Blind[];
    public bets: number[];
    public limit: number;
    public maxRaises: number;


    constructor(ante: number, blinds: Blind[], bets: number[], limit: number, maxRaises: number) {
        this.ante = ante;
        this.blinds = [...blinds];
        this.bets = [...bets];
        this.limit = limit;
        this.maxRaises = maxRaises;
    }

}