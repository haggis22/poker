export class InvalidBet {

    public seatIndex: number;
    public message: string;

    constructor(seatIndex: number, message: string) {

        this.seatIndex = seatIndex;
        this.message = message;

    }

}