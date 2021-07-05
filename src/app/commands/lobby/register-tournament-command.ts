import { LobbyCommand } from './lobby-command';

export class RegisterTournamentCommand extends LobbyCommand {

    public tournamentID: number;

    constructor(tournamentID: number) {

        super();

        this.tournamentID = tournamentID;

    }

}