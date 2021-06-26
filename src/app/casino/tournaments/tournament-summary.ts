import { Tournament } from './tournament';

export class TournamentSummary {

    public id: number;
    public name: string;

    public buyIn: number;
    public numRegistrants: number;


    constructor(tournament: Tournament) {

        this.id = tournament.id;
        this.name = tournament.name;
        this.buyIn = tournament.buyIn;
        this.numRegistrants = tournament.numRegistrants;

    }


}