export class Bet {


    public static readonly INVALID: number = -1;
    public static readonly CHECK: number = 0;
    public static readonly OPEN: number = 1;
    public static readonly CALL: number = 2;
    public static readonly RAISE: number = 3;
    public static readonly DEAD_RAISE: number = 4;

    public isValid: boolean;

    public totalBet: number;
    public chipsAdded: number;
    public isAllIn: boolean;

    public betType: number;

    public message: string;

    constructor(isValid: boolean,
                totalBet: number,
                chipsAdded: number,
                isAllIn: boolean,
                betType: number,
                message: string) {

        this.isValid = isValid;
        this.totalBet = totalBet;
        this.chipsAdded = chipsAdded;
        this.isAllIn = isAllIn;
        this.betType = betType;
        this.message = message;

    }


    public toString(): string {

        return JSON.stringify(this);

    }


    public getTypeName(): string {

        switch (this.betType) {

            case Bet.CHECK:
                return 'Checks';

            case Bet.OPEN:
                return 'Bets';

            case Bet.CALL:
                return 'Calls';

            case Bet.RAISE:
            case Bet.DEAD_RAISE:
                return 'Raises';

        }   // switch

        return '';

    }



}