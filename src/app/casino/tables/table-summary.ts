export class TableSummary {

    public id: number;
    public name: string;
    public description: string;
    public numSeats: number;
    public numPlayers: number;



    constructor(id: number, name: string, description: string, numSeats: number, numPlayers: number) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.numSeats = numSeats;
        this.numPlayers = numPlayers;

    }


}