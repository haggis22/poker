﻿export class Bet {


    public static readonly ACTION: any =
        {
            INVALID: -1,
            CHECK: 0,
            OPEN: 1,
            CALL: 2,
            RAISE: 3
        }


    public static readonly TYPE: any =
        {
            ANTE: 1,
            BLIND: 2,
            REGULAR: 3,
            RETURNED: 4
        };

    public static readonly ACTION_TEXT: any =
        {
            ANTE: 'Ante',
            BLIND: 'Blind',
            CHECK: 'Check',
            BET: 'Bet',
            CALL: 'Call',
            RAISE: 'Raise',
            FOLD: 'Fold'
        };

    public seatIndex: number;
    public totalBet: number;
    public chipsAdded: number;

    public betType: number;
    public actionType: number;

    public raisesAction: boolean;

    constructor(seatIndex: number,
                totalBet: number,
                chipsAdded: number,
                betType: number,
                actionType: number) {

        this.seatIndex = seatIndex;
        this.totalBet = totalBet;
        this.chipsAdded = chipsAdded;
        this.betType = betType;
        this.actionType = actionType;

        this.raisesAction = false;

    }


    public toString(): string {

        return JSON.stringify(this);

    }

    public getActionString(): string {

        switch (this.actionType) {

            case Bet.ACTION.CHECK:
                return Bet.ACTION_TEXT.CHECK;

            case Bet.ACTION.OPEN:
                return Bet.ACTION_TEXT.BET;

            case Bet.ACTION.CALL:
                return Bet.ACTION_TEXT.CALL;

            case Bet.ACTION.RAISE:
                return Bet.ACTION_TEXT.RAISE;

        }

        return null;

    }

}