import { Tournament } from './tournament';
import { User } from '@/app/players/user';

export class TournamentSummary {

    public id: number;
    public name: string;

    public buyIn: number;

    // the list of userIDs that have registered for the tournament
    public registrants: number[];


    constructor(tournament: Tournament, registrants: number[]) {

        this.id = tournament.id;
        this.name = tournament.name;
        this.buyIn = tournament.buyIn;
        this.registrants = [...registrants];

    }


}