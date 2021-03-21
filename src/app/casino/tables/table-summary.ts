export class TableSummary {

    public id: number;
    public name: string;
    public description: string;
    public numSeats: number;
    public players: string[];



    constructor(id: number, name: string, description: string, numSeats: number, players: string[]) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.numSeats = numSeats;
        this.players = players;

    }


}