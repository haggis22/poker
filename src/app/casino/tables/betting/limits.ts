export class Limits {

    public static readonly LIMIT: number = 1;
    public static readonly NO_LIMIT: number = 2;
    public static readonly POT_LIMIT: number = 3;

    public limitVsNoLimit: number;
    public maxRaises: number;

    public minBuyIn: number;
    public maxBuyIn: number;


    constructor(limitVsNoLimit: number, maxRaises: number, minBuyIn: number, maxBuyIn: number) {

        this.limitVsNoLimit = limitVsNoLimit;
        this.maxRaises = maxRaises;

        this.minBuyIn = minBuyIn;
        this.maxBuyIn = maxBuyIn;

    }

}