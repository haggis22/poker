export class Pot {

    public amount: number;
    public seats: Set<number>;


    constructor()
    {
        this.amount = 0;
        this.seats = new Set<number>();
    }

    addChips(chips: number, seat: number) {

        this.amount += chips;
        this.seats.add(seat);

    }

    foldPlayer(seat: number) {
        this.seats.delete(seat);
    }

}