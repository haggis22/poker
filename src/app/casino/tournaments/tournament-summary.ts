import { Tournament } from './tournament';

export class TournamentSummary {

    public id: number;
    public name: string;

    public buyIn: number;

    // the list of userIDs that have registered for the tournament
    public registrants: number[];

    public isRegistrationOpen: boolean;


    constructor(tournament: Tournament, registrants: number[], isRegistrationOpen: boolean) {

        this.id = tournament.id;
        this.name = tournament.name;
        this.buyIn = tournament.buyIn;
        this.registrants = [...registrants];
        this.isRegistrationOpen = isRegistrationOpen;

    }


}