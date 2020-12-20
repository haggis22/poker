export class Stakes {

    public static readonly LIMIT: number = 1;
    public static readonly NO_LIMIT: number = 2;

    public ante: number;
    public blinds: number[];
    public bets: number[];
    public limit: number;


    constructor(ante: number, blinds: number[], bets: number[], limit: number) {
        this.ante = ante;
        this.blinds = [...blinds];
        this.bets = [...bets];
        this.limit = limit;
    }

}