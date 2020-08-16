﻿export class Pot {

    public index: number;
    public amount: number;
    public seats: object;


    constructor(index: number)
    {
        this.index = index;
        this.amount = 0;
        this.seats = {};
    }

    addChips(chips: number, seatIndex: number) {

        if (chips > 0) {

            this.amount += chips;
            this.seats[seatIndex] = true;

        }

    }

    foldPlayer(seatIndex: number) {
        delete this.seats[seatIndex];
    }

    getNumPlayers(): number {

        return Object.keys(this.seats).length;

    }

    isInPot(seatIndex: number): boolean {

        return this.seats[seatIndex] || false;

    }

    getSeatsInPot(): any[] {

        return Object.keys(this.seats);

    }

}