import { Command } from "../command";
import { Game } from "../../games/game";
import { Stakes } from "../../casino/tables/stakes";
import { TableRules } from "../../casino/tables/table-rules";

export class CreateTableCommand implements Command {


    public tableID: number;
    public game: Game;
    public rules: TableRules;
    public stakes: Stakes;

    constructor(rules: TableRules, game: Game, stakes: Stakes) {

        this.tableID = null;

        this.rules = rules;
        this.game = game;
        this.stakes = stakes;

    }

}