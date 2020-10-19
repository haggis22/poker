export class Bet {


    public static readonly ACTION: any =
        {
            INVALID: -1,
            CHECK: 0,
            OPEN: 1,
            CALL: 2,
            RAISE: 3,
            DEAD_RAISE: 4
        }


    public static readonly TYPE: any =
        {
            ANTE: 1,
            BLIND: 2,
            REGULAR: 3
        };

    public isValid: boolean;

    public seatIndex: number;
    public totalBet: number;
    public chipsAdded: number;
    public isAllIn: boolean;

    public betType: number;
    public actionType: number;

    public message: string;

    constructor(isValid: boolean,
                seatIndex: number,
                totalBet: number,
                chipsAdded: number,
                isAllIn: boolean,
                betType: number,
                actionType: number,
                message: string) {

        this.isValid = isValid;
        this.seatIndex = seatIndex;
        this.totalBet = totalBet;
        this.chipsAdded = chipsAdded;
        this.isAllIn = isAllIn;
        this.betType = betType;
        this.actionType = actionType;
        this.message = message;

    }


    public toString(): string {

        return JSON.stringify(this);

    }


    public getActionName(): string {

        switch (this.actionType) {

            case Bet.ACTION.CHECK:
                return 'Checks';

            case Bet.ACTION.OPEN:
                return 'Bets';

            case Bet.ACTION.CALL:
                return 'Calls';

            case Bet.ACTION.RAISE:
            case Bet.ACTION.DEAD_RAISE:
                return 'Raises';

        }   // switch

        return '';

    }   // getActionName



}