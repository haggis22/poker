export class PendingCommands {

    public fold: boolean;
    public bet: boolean;
    public betAmount: number;



    constructor() {

        this.clear();

    }

    public clear(): void {

        this.fold = this.bet = false;
        this.betAmount = null;

    }



}