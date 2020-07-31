export class BetTurn {

    public seatIndex: number;
    public currentBet: number;
    public minRaise: number;
    public isDeadRaise: boolean;
    public timeToAct: number;

    constructor(seatIndex: number, currentBet: number, minRaise: number, isDeadRaise: boolean, timeToAct: number) {

        this.seatIndex = seatIndex;
        this.currentBet = currentBet;
        this.minRaise = minRaise;
        this.isDeadRaise = isDeadRaise;
        this.timeToAct = timeToAct;

    }
    
}