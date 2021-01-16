export class PendingCommands {

    public fold: boolean;
    public check: boolean;
    public bet: boolean;
    public betAmount: number;



    constructor() {

        this.clear();

    }

    public clear(): void {

        this.fold = this.check = this.bet = false;
        this.betAmount = null;

    }



}