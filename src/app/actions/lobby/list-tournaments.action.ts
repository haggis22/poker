import { LobbyAction } from "./lobby-action";
import { TournamentSummary } from "../../casino/tournaments/tournament-summary";

export class ListTournamentsAction extends LobbyAction {

    public tournaments: TournamentSummary[];

    constructor(tournaments: TournamentSummary[]) {

        super();

        this.tournaments = [...tournaments];

    }

}