export class Pot {

    public index: number;
    public amount: number;
    public seats: object;


    constructor(index: number)
    {
        this.index = index;
        this.amount = 0;
        this.seats = {};
    }

    addChips(seatIndex: number, chips: number) {

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

    getSeatsInPot(): number[] {

        return Object.keys(this.seats).map(seatIndexStr => parseInt(seatIndexStr, 10));

    }

    getName(): string {

        return (this.index === 0) ? 'the main pot' : `side pot #${this.index}`;
    }


}