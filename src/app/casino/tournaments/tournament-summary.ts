import { Tournament } from './tournament';

export class TournamentSummary {

    public id: number;
    public name: string;

    public buyIn: number;



    constructor(tournament: Tournament) {

        this.id = tournament.id;
        this.name = tournament.name;
        this.buyIn = tournament.buyIn;

    }


}