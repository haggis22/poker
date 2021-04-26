import { Blind } from "./blind";

export class Stakes {

    public static readonly LIMIT: number = 1;
    public static readonly NO_LIMIT: number = 2;

    public ante: number;
    public blinds: Blind[];
    public bets: number[];
    public limitVsNoLimit: number;
    public maxRaises: number;

    public minBuyIn: number;
    public maxBuyIn: number;


    constructor(ante: number, blinds: Blind[], bets: number[], limitVsNoLimit: number, maxRaises: number, minBuyIn: number, maxBuyIn: number) {
        this.ante = ante;
        this.blinds = [...blinds];
        this.bets = [...bets];
        this.limitVsNoLimit = limitVsNoLimit;
        this.maxRaises = maxRaises;

        this.minBuyIn = minBuyIn;
        this.maxBuyIn = maxBuyIn;
    }

}